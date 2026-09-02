# Plan: Migrate Laravel API Quickstart from fusionauth/jwt-auth-webtoken-provider to firebase/php-jwt

## Overview

Switch the `quickstart-php-laravel-api` complete-application from using the custom `fusionauth/jwt-auth-webtoken-provider` package (and its transitive Tymon JWT/WebToken dependencies) to using the much simpler and more widely supported `firebase/php-jwt` library. A dumber/cheaper agent will implement these steps later, so each instruction must be explicit, file-level, and avoid assumptions.

## Current State Summary

### Current packages in `composer.json`
- `fusionauth/jwt-auth-webtoken-provider: ^1.0`
- `web-token/jwt-signature-algorithm-rsa: ^3.4`
- `laravel/sanctum: ^4.0` (installed by `php artisan install:api` in the guide; keep it because following the guide recreates it)

### Current custom files
1. `app/FusionAuth/FusionAuthJwtGuard.php` — custom Laravel guard extending Tymon JWTGuard.
2. `app/FusionAuth/Providers/FusionAuthEloquentUserProvider.php` — creates a `User` model from the JWT payload.
3. `app/FusionAuth/Providers/FusionAuthServiceProvider.php` — registers the custom guard, custom user provider, custom claim validators, and changes the cookie key from `app_at` to `app.at`.
4. `app/FusionAuth/Claims/Audience.php` — validates the `aud` claim against `config('app.fusionauth.client_id')`.
5. `app/FusionAuth/Claims/Issuer.php` — validates the `iss` claim against `config('app.fusionauth.url')`.
6. `config/jwt.php` — published config from the FusionAuth provider.
7. `config/auth.php` — `guards.web.driver = 'jwt'` and `providers.users.driver = 'fusionauth_eloquent'`.
8. `bootstrap/providers.php` — registers `FusionAuthServiceProvider`.
9. `routes/api.php` — uses `auth:web` middleware (was `auth:sanctum`, already partially fixed).
10. `app/Http/Controllers/Controller.php` — `checkRoles()` calls `auth('web')->payload()` and reads `roles`.
11. `.env` / `fusionauth.env` — contain FusionAuth URL, client id, JWT algorithm, JWKS URL/cache.

### Desired New State
- Use `firebase/php-jwt` for JWT decoding/validation.
- Use a single middleware (`EnsureFusionAuthToken`) for JWT cookie/header authentication instead of a custom guard/provider. This keeps the guide shorter and easier to follow.
- No dependency on `fusionauth/jwt-auth-webtoken-provider`, `tymon/jwt-auth`, or `web-token/jwt-signature-algorithm-rsa`.
- Keep `laravel/sanctum` because the guide runs `php artisan install:api`.
- Keep automatic user provisioning from trusted FusionAuth JWTs.
- Keep `aud` and `iss` claim validation.
- Keep reading `roles` from the JWT for `Controller::checkRoles()`.
- Keep cookie name `app.at` and `Authorization: Bearer` header support.
- Prefer a single middleware over a custom guard + provider to keep the guide shorter.

## Important Constraints

- Do **NOT** delete the old files until the new implementation is working and tested.
- Do **NOT** run `npm`, `docker`, `git`, or any command that changes state.
- Do the initial implementation in `your-application` so `complete-application` stays untouched for comparison. Copy the final files to `complete-application` only when ready.
- Update the MDX guide to match the new code.
- Update generated snippet files after source edits.
- Keep PHP 8.2+ compatibility.

## Step-by-Step Plan

### 1. Composer Changes

File: `astro/localcode/quickstart-php-laravel-api/complete-application/composer.json`

1.1. In the `require` section:
- Remove `"fusionauth/jwt-auth-webtoken-provider": "^1.0"`
- Remove `"web-token/jwt-signature-algorithm-rsa": "^3.4"`
- Keep `"laravel/sanctum": "^4.0"` because the guide runs `php artisan install:api`.
- Add `"firebase/php-jwt": "^6.11"` (or latest stable 6.x version available at the time of implementation).

1.2. Ensure the final `require` section looks roughly like this:
```json
"require": {
    "php": "^8.2",
    "firebase/php-jwt": "^6.11",
    "laravel/framework": "^12.0",
    "laravel/tinker": "^2.10.1"
},
```

1.3. Keep `laravel/sanctum: ^4.0` in `require`. The `php artisan install:api` command in the guide creates it, so removing it would make the guide's instructions inconsistent.

1.4. Regenerate `composer.lock`. The implementer should later run `composer update` inside the project directory (or Docker). Since we cannot run commands now, this step is listed for the implementer.

### 2. Work in `your-application` First

2.1. Copy the current `complete-application` contents into `your-application` so you have a clean working copy while leaving `complete-application` untouched for comparison.

2.2. Do all implementation steps below in `astro/localcode/quickstart-php-laravel-api/your-application/` first.

2.3. Only copy the finalized files back to `astro/localcode/quickstart-php-laravel-api/complete-application/` after the implementation is tested and working.

### 3. Environment Variables

Files: `astro/localcode/quickstart-php-laravel-api/your-application/.env` and the matching `complete-application/.env` / `fusionauth.env`

The existing snippet section marked with `# :snippet-start: fusionauth` / `# :snippet-end:` already contains everything needed:
- `FUSIONAUTH_CLIENT_ID`
- `FUSIONAUTH_URL`
- `JWT_ALGO`
- `JWT_JWKS_URL`
- `JWT_JWKS_URL_CACHE`

No new variables are required.

### 4. Delete the Old FusionAuth JWT Provider Code

In `your-application`, delete these files entirely (do this only after creating the replacement in step 5):
- `app/FusionAuth/FusionAuthJwtGuard.php`
- `app/FusionAuth/Providers/FusionAuthEloquentUserProvider.php`
- `app/FusionAuth/Providers/FusionAuthServiceProvider.php`
- `app/FusionAuth/Claims/Audience.php`
- `app/FusionAuth/Claims/Issuer.php`
- `config/jwt.php`

Do NOT delete `config/sanctum.php` because the guide runs `php artisan install:api`, which creates it.

### 5. Create the New JWT Service

File to create: `app/FusionAuth/Services/JwtService.php`

5.1. Responsibilities:
- Fetch the JWKS from `config('app.fusionauth.url') . '/.well-known/jwks.json'`.
- Cache the JWKS for `config('app.fusionauth.jwks_url_cache')` seconds using Laravel's cache.
- Decode the JWT using `Firebase\JWT\JWT::decode()` with the correct public key from the JWKS.
- Validate `iss` claim equals `config('app.fusionauth.url')`.
- Validate `aud` claim contains `config('app.fusionauth.client_id')`.
- Return the decoded token as an associative array.

5.2. Implementation guidelines:
- Use `Firebase\JWT\JWK::parseKeySet()` to convert the JWKS array into a key set that `JWT::decode()` accepts.
- Use `Firebase\JWT\JWT::decode($token, $jwks, config('app.fusionauth.algo'))`.
- Handle all exceptions by throwing a single custom exception (e.g. `App\FusionAuth\Exceptions\InvalidTokenException`) with the original exception chained.
- The JWKS fetch should use Laravel's `Http` facade. Example: `$response = Http::get(config('app.fusionauth.url') . '/.well-known/jwks.json');`.
- Cache the parsed key set using `Cache::remember()`.

### 6. Create a Single Middleware for JWT Authentication

File to create: `app/Http/Middleware/EnsureFusionAuthToken.php`

6.1. Responsibilities:
- Read the token from the `app.at` cookie first.
- If no cookie, read the `Authorization: Bearer <token>` header.
- Call `JwtService::decode($token)`.
- From the decoded payload, find or create a `User` record:
  - `id` = `sub` claim.
  - Save the user to the database if it does not exist.
- Log the user in with `Auth::login($user)` so Laravel's `auth()` helper works.
- Store the decoded payload on the request with `$request->attributes->set('jwt_payload', $payload)` so controllers can read `roles`.
- If the token is missing or invalid, return a 401 JSON response (or rethrow so Laravel converts it to 401).

6.2. Do NOT create a custom guard or custom user provider. The middleware approach is simpler and keeps the guide shorter.

6.3. Register the middleware in `bootstrap/app.php` (Laravel 12 uses this file instead of `Http/Kernel.php`) with the alias `fusionauth`. The guide should tell the user to add:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'fusionauth' => \App\Http\Middleware\EnsureFusionAuthToken::class,
    ]);
})
```

### 7. Remove the Service Provider Registration

File: `bootstrap/providers.php`

7.1. Remove `App\FusionAuth\Providers\FusionAuthServiceProvider::class` from the providers array.

7.2. Keep `App\Providers\AppServiceProvider::class`.

7.3. Optionally delete `app/FusionAuth/Providers/FusionAuthServiceProvider.php` after the middleware is working.

### 8. Update Authentication Configuration

File: `astro/localcode/quickstart-php-laravel-api/your-application/config/auth.php`

8.1. Revert the `guards` section to Laravel's default `session` driver:
```php
// :snippet-start: guards
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
],
// :snippet-end:
```

8.2. Revert the `providers` section to Laravel's default `eloquent` driver:
```php
// :snippet-start: providers
'providers' => [
    'users' => [
        'driver' => 'eloquent',
        'model' => env('AUTH_MODEL', User::class),
    ],
],
// :snippet-end:
```

8.3. The middleware will handle JWT auth directly, so no custom guard or provider is needed.

### 9. Update Application Configuration

File: `astro/localcode/quickstart-php-laravel-api/your-application/config/app.php`

9.1. The existing snippet section must expose the JWT algorithm and JWKS cache TTL. Change it from:
```php
// :snippet-start: fusionauth
'fusionauth' => [
    'url' => rtrim(env('FUSIONAUTH_URL'), '/'),
    'client_id' => env('FUSIONAUTH_CLIENT_ID'),
],
// :snippet-end:
```
to:
```php
// :snippet-start: fusionauth
'fusionauth' => [
    'url' => rtrim(env('FUSIONAUTH_URL'), '/'),
    'client_id' => env('FUSIONAUTH_CLIENT_ID'),
    'algo' => env('JWT_ALGO', 'RS256'),
    'jwks_url' => env('JWT_JWKS_URL'),
    'jwks_url_cache' => (int) env('JWT_JWKS_URL_CACHE', 86400),
],
// :snippet-end:
```

### 10. Update Base Controller

File: `astro/localcode/quickstart-php-laravel-api/your-application/app/Http/Controllers/Controller.php`

10.1. The current `checkRoles()` calls `auth('web')->payload()` which relies on Tymon. Replace it with a method that reads the decoded JWT payload from the request attributes set by the middleware.

10.2. New implementation:
```php
protected function checkRoles(string ...$roles): void
{
    $payload = (array) request()->attributes->get('jwt_payload');
    $rolesFromJwt = (array) ($payload['roles'] ?? []);

    $hasAtLeastOneRole = false;
    foreach ($roles as $role) {
        if (in_array($role, $rolesFromJwt, true)) {
            $hasAtLeastOneRole = true;
            break;
        }
    }

    if (!$hasAtLeastOneRole) {
        throw new AuthorizationException('Proper role not found for user.');
    }
}
```

### 11. Update Routes

File: `astro/localcode/quickstart-php-laravel-api/your-application/routes/api.php`

11.1. Replace `auth:web` with the new middleware alias `fusionauth`:
```php
$middleware = Route::middleware('fusionauth');
$middleware->post('/panic', \App\Http\Controllers\ChangeBank\PanicController::class);
$middleware->get('/make-change', \App\Http\Controllers\ChangeBank\MakeChangeController::class);
```

### 12. Update Middleware Registration

File: `astro/localcode/quickstart-php-laravel-api/your-application/bootstrap/app.php`

12.1. Add the middleware alias inside the `withMiddleware` callback. If the file currently does not have a `withMiddleware` call, add one:
```php
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'fusionauth' => \App\Http\Middleware\EnsureFusionAuthToken::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

### 13. Update Model

File: `astro/localcode/quickstart-php-laravel-api/your-application/app/Models/User.php`

13.1. Keep `$incrementing = false` and `$keyType = 'string'`.

13.2. Keep the hidden `remember_token` removal.

13.3. No JWT-related interface (`JWTSubject`) is required anymore.

### 14. Update MakeChangeController Validation

File: `astro/localcode/quickstart-php-laravel-api/your-application/app/Http/Controllers/ChangeBank/MakeChangeController.php`

14.1. The current file already has validation for missing, non-numeric, and negative totals. Keep that logic.

### 15. Update the MDX Guide

File: `astro/src/content/docs/get-started/quickstarts/api/quickstart-php-laravel-api.mdx`

15.1. Update the "Add Security" section command from:
```
composer require fusionauth/jwt-auth-webtoken-provider:^1.0 web-token/jwt-signature-algorithm-rsa:^3.4 -W
```
to:
```
composer require firebase/php-jwt
```

15.2. Replace the three sections about custom guard, user provider, and service provider with ONE section about the `EnsureFusionAuthToken` middleware and `JwtService`.

15.3. Remove the "Validating Issuer and Audience Claims" section, or rewrite it to explain that validation is now inside `JwtService`.

15.4. Remove the `php artisan vendor:publish --provider="FusionAuth\JWTAuth\WebTokenProvider\Providers\WebTokenServiceProvider"` instruction.

15.5. Update `LocalCode` references to point to the new files:
- `app/FusionAuth/Services/JwtService.php`
- `app/Http/Middleware/EnsureFusionAuthToken.php`
- `bootstrap/app.php`
- `routes/api.php`
- `config/auth.php`
- `config/app.php`
- `app/Http/Controllers/Controller.php`

15.6. Keep the `app/Models/User.php` and migration `LocalCode` references unchanged.

### 16. Update/Regenerate Snippets

After copying the finalized files from `your-application` to `complete-application`, run `npm run generate-code-snippets` from the workspace root to regenerate the snippet files in `astro/src/generated-code-snippets/quickstart-php-laravel-api/`.

### 17. Update Tests

File: `astro/localcode/quickstart-php-laravel-api/tests/test.sh`

17.1. Keep the test logic as-is; it already asserts:
- 401 without token.
- 200 for teller/customer on `/api/make-change`.
- Correct change breakdown.
- 400 for missing/non-numeric/negative totals.
- 200 for teller on `/api/panic`.
- 403 for customer on `/api/panic`.
- 401 without token on `/api/panic`.

17.2. Only update the readiness check if needed. It currently expects 401 from `/api/panic` and should still work once the middleware is active.

### 18. Clean Up Unused Configs

18.1. Delete `config/jwt.php` in `your-application` and `complete-application` after the new middleware is working.

18.2. Keep `config/sanctum.php` because the guide runs `php artisan install:api`.

### 19. Copy Final Code to complete-application

19.1. Once `your-application` is tested and working, copy these files to `complete-application`:
- `app/FusionAuth/Services/JwtService.php`
- `app/FusionAuth/Exceptions/InvalidTokenException.php`
- `app/Http/Middleware/EnsureFusionAuthToken.php`
- `app/Http/Controllers/Controller.php`
- `app/Http/Controllers/ChangeBank/MakeChangeController.php`
- `app/Http/Controllers/ChangeBank/PanicController.php`
- `app/Models/User.php`
- `routes/api.php`
- `config/auth.php`
- `config/app.php`
- `bootstrap/app.php`
- `composer.json`
- `composer.lock`
- `.env`
- `database/migrations/0001_01_01_000000_create_users_table.php`

19.2. Delete the old custom files from `complete-application`:
- `app/FusionAuth/FusionAuthJwtGuard.php`
- `app/FusionAuth/Providers/FusionAuthEloquentUserProvider.php`
- `app/FusionAuth/Providers/FusionAuthServiceProvider.php`
- `app/FusionAuth/Claims/Audience.php`
- `app/FusionAuth/Claims/Issuer.php`
- `config/jwt.php`

### 20. Verification Checklist for the Implementer

19.1. `composer install` completes without errors.

19.2. `php artisan serve --port=3000` starts.

19.3. Unauthenticated `GET /api/make-change?total=1.02` returns 401.

19.4. Unauthenticated `POST /api/panic` returns 401.

19.5. Teller token (with `teller` role) can call `/api/make-change` and `/api/panic`.

19.6. Customer token (with `customer` role) can call `/api/make-change` but gets 403 on `/api/panic`.

19.7. A token with wrong `aud` or `iss` is rejected with 401.

19.8. `npm run generate-code-snippets` regenerates the snippets without errors.

19.9. The guide renders correctly and all `LocalCode` / `LocalValue` references resolve.

## Files to Modify or Create

### Delete
- `app/FusionAuth/FusionAuthJwtGuard.php`
- `app/FusionAuth/Providers/FusionAuthEloquentUserProvider.php`
- `app/FusionAuth/Providers/FusionAuthServiceProvider.php`
- `app/FusionAuth/Claims/Audience.php`
- `app/FusionAuth/Claims/Issuer.php`
- `config/jwt.php`

### Keep (do not delete)
- `config/sanctum.php` (created by `php artisan install:api` in the guide)

### Replace / Rewrite
- `config/auth.php`
- `config/app.php`
- `app/Http/Controllers/Controller.php`
- `composer.json`
- `bootstrap/app.php`
- `astro/src/content/docs/get-started/quickstarts/api/quickstart-php-laravel-api.mdx`

### Create
- `app/FusionAuth/Services/JwtService.php`
- `app/FusionAuth/Exceptions/InvalidTokenException.php`
- `app/Http/Middleware/EnsureFusionAuthToken.php`

### Keep Unchanged (after minor review)
- `app/Models/User.php`
- `app/Http/Controllers/ChangeBank/MakeChangeController.php`
- `app/Http/Controllers/ChangeBank/PanicController.php`
- `routes/api.php` (only middleware name changes)
- `database/migrations/0001_01_01_000000_create_users_table.php`
- `.env` and `fusionauth.env`
- `tests/test.sh`
- `bootstrap/providers.php` (remove only the FusionAuth service provider line)

## Simplification Rationale

Using a single middleware instead of a custom guard + provider reduces the reader's workload significantly:
- No custom guard class to understand and maintain.
- No custom user provider class.
- No service provider registration in `bootstrap/providers.php`.
- `config/auth.php` stays close to Laravel defaults.
- The reader only needs to create one middleware and one service class, both of which are standard Laravel concepts.

## Guide Impact Estimate

Compared to the current guide, the new guide will:
- Remove ~3 files from the reader's manual steps (guard, provider, claim validators).
- Remove the `vendor:publish` step.
- Add one middleware registration step in `bootstrap/app.php`.
- Net result: fewer files and less code for the reader to copy, even though the middleware is slightly larger than any single old file.

## Important Implementation Notes

- Cookie name is `app.at` (with a dot). Do not change it to `app_at`.
- The `sub` claim from FusionAuth is a UUID string, so `User::$incrementing = false` and `User::$keyType = 'string'` must remain.
- `firebase/php-jwt` expects the JWKS as an associative array with `keys` at the top level. `JWK::parseKeySet($jwks)` handles this.
- When validating `aud`, FusionAuth may issue it as a string or array. Check both forms:
  ```php
  $aud = (array) $payload->aud;
  if (!in_array(config('app.fusionauth.client_id'), $aud, true)) { ... }
  ```
- Keep the `Http` facade call simple; do not add retries unless required.
- Do not change any code outside the `quickstart-php-laravel-api` directory unless the MDX guide requires it.
