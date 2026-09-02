# Plan: Migrate Laravel API Quickstart from fusionauth/jwt-auth-webtoken-provider to firebase/php-jwt

## Goal

Replace the custom `fusionauth/jwt-auth-webtoken-provider` stack (Tymon/WebToken) in `astro/localcode/quickstart-php-laravel-api/complete-application` with `firebase/php-jwt`, while keeping the guide as short as possible for the reader.

## Key Design Decision: One Middleware, No Custom Guard/Provider

The new implementation will use a single Laravel middleware for JWT validation. This removes the need for:
- A custom authentication guard
- A custom user provider
- A service provider registration
- Claim validator classes
- `vendor:publish` step
- `config/auth.php` changes
- `bootstrap/app.php` changes (use the full middleware class name directly in routes)

The reader will create **one file** and modify **three existing files**.

## What The Reader Does (Guide Steps)

The guide instructs the reader to create/modify these files in their own `your-application` directory:

1. **Create** `app/Http/Middleware/EnsureFusionAuthToken.php`
   - Fetch and cache the JWKS from FusionAuth.
   - Decode and validate the JWT signature, `iss`, `aud`, and `exp`.
   - Read the token from the `app.at` cookie or `Authorization: Bearer` header.
   - Provision a `User` record from the `sub` claim.
   - Attach the decoded payload to the request as `jwt_payload`.
   - Return 401 for missing or invalid tokens.

2. **Modify** `config/app.php`
   - Expand the existing `fusionauth` config block to include `algo`, `jwks_url`, and `jwks_url_cache`.

3. **Modify** `routes/api.php`
   - Replace `auth:sanctum` / `auth:web` with the full middleware class name:
     ```php
     $middleware = Route::middleware(\App\Http\Middleware\EnsureFusionAuthToken::class);
     ```

4. **Modify** `app/Http/Controllers/Controller.php`
   - Change `checkRoles()` to read `roles` from `request()->attributes->get('jwt_payload')`.

5. **Run** `composer require firebase/php-jwt` (terminal command, not a file edit).

That is the complete reader-facing surface. No other files are touched by the reader.

## What The Implementer Does (This Repo)

The implementer works in `astro/localcode/quickstart-php-laravel-api/your-application` first, then copies the result to `complete-application`.

### Step 1: Set up the working copy

1.1. Copy `astro/localcode/quickstart-php-laravel-api/complete-application` into `astro/localcode/quickstart-php-laravel-api/your-application`. This leaves `complete-application` untouched for comparison while work is in progress.

### Step 2: Update dependencies

2.1. In `your-application/composer.json`, remove:
- `fusionauth/jwt-auth-webtoken-provider`
- `web-token/jwt-signature-algorithm-rsa`

2.2. Add `firebase/php-jwt` to `require`.

2.3. Keep `laravel/sanctum` because the guide runs `php artisan install:api`, which recreates it.

2.4. Later, run `composer update` in `your-application` to generate a new `composer.lock`. (This is an implementer step, not a reader step.)

### Step 3: Delete the old FusionAuth JWT code

In `your-application`, delete:
- `app/FusionAuth/FusionAuthJwtGuard.php`
- `app/FusionAuth/Providers/FusionAuthEloquentUserProvider.php`
- `app/FusionAuth/Providers/FusionAuthServiceProvider.php`
- `app/FusionAuth/Claims/Audience.php`
- `app/FusionAuth/Claims/Issuer.php`
- `config/jwt.php`

Do NOT delete `config/sanctum.php`.

### Step 4: Create the middleware

Create `your-application/app/Http/Middleware/EnsureFusionAuthToken.php`.

It must:
- Implement `handle(Request $request, Closure $next)`.
- Read the token from `$request->cookie('app.at')` first, then from the `Authorization` header if the cookie is missing.
- Use `Firebase\JWT\JWK::parseKeySet()` and `Firebase\JWT\JWT::decode()` to validate the token.
- Fetch the JWKS from `config('app.fusionauth.url') . '/.well-known/jwks.json'` using the `Http` facade.
- Cache the parsed key set with `Cache::remember()` for `config('app.fusionauth.jwks_url_cache')` seconds.
- Validate that `iss` equals `config('app.fusionauth.url')`.
- Validate that `aud` contains `config('app.fusionauth.client_id')` (handle string or array audience).
- Find or create a `User` from the `sub` claim and save it.
- Set `$request->attributes->set('jwt_payload', (array) $payload)`.
- On any failure, return `response()->json(['error' => 'Unauthorized'], 401)`.

Keep the file clean with private helper methods, but keep everything in this single file.

### Step 5: Update config/app.php

In `your-application/config/app.php`, expand the existing snippet block to:
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

### Step 6: Update routes/api.php

In `your-application/routes/api.php`, change the middleware to:
```php
$middleware = Route::middleware(\App\Http\Middleware\EnsureFusionAuthToken::class);
$middleware->post('/panic', \App\Http\Controllers\ChangeBank\PanicController::class);
$middleware->get('/make-change', \App\Http\Controllers\ChangeBank\MakeChangeController::class);
```

### Step 7: Update Controller.php

In `your-application/app/Http/Controllers/Controller.php`, replace `checkRoles()` with:
```php
protected function checkRoles(string ...$roles): void
{
    $payload = (array) request()->attributes->get('jwt_payload');
    $rolesFromJwt = (array) ($payload['roles'] ?? []);

    foreach ($roles as $role) {
        if (in_array($role, $rolesFromJwt, true)) {
            return;
        }
    }

    throw new AuthorizationException('Proper role not found for user.');
}
```

### Step 8: Leave config/auth.php as Laravel default

In `your-application/config/auth.php`, revert the `guards.web.driver` to `session` and `providers.users.driver` to `eloquent`. The middleware does not depend on these, so the file should match a fresh Laravel install.

### Step 9: Leave bootstrap/providers.php as Laravel default

Remove only the `App\FusionAuth\Providers\FusionAuthServiceProvider::class` line. No new provider is needed.

### Step 10: Keep User model and migrations

`app/Models/User.php` and `database/migrations/0001_01_01_000000_create_users_table.php` stay as they are. They already support UUID primary keys and no password.

### Step 11: Keep controller business logic

`MakeChangeController.php` and `PanicController.php` stay as they are. The `MakeChangeController` validation added earlier (missing/non-numeric/negative total returns 400) should be kept.

### Step 12: Test in your-application

12.1. Start FusionAuth with `docker compose up -d` from the quickstart root.

12.2. Run `composer install` and `php artisan serve --port=3000` in `your-application`.

12.3. Verify:
- `GET /api/make-change?total=1.02` without token returns 401.
- `POST /api/panic` without token returns 401.
- Teller token gets 200 on both endpoints.
- Customer token gets 200 on `/api/make-change` and 403 on `/api/panic`.
- Missing, non-numeric, and negative `total` values return 400.
- A token with wrong `aud` or `iss` is rejected with 401.


### Step 14: Update the MDX guide

In `astro/src/content/docs/get-started/quickstarts/api/quickstart-php-laravel-api.mdx`:

14.1. Change the "Add Security" command to:
```
composer require firebase/php-jwt
```

14.2. Replace the sections for `FusionAuthEloquentUserProvider`, `FusionAuthJwtGuard`, `FusionAuthServiceProvider`, and the two claim validator files with ONE section titled "Add the JWT Middleware". Show the full `EnsureFusionAuthToken.php` file and explain briefly what it does.

14.3. Remove the "Validating Issuer and Audience Claims" standalone section; instead, note that validation happens inside the middleware.

14.4. Remove the `vendor:publish` instruction.

14.5. Update `LocalCode` references:
- Add `app/Http/Middleware/EnsureFusionAuthToken.php`
- Update `routes/api.php`
- Update `app/Http/Controllers/Controller.php`
- Update `config/app.php`
- Remove references to deleted files.

14.6. Keep the `app/Models/User.php` and migration `LocalCode` references unchanged.

### Step 15: Update tests

In `astro/localcode/quickstart-php-laravel-api/tests/test.sh`:

15.1. Keep the existing assertions (401 without token, role-based access, change breakdown, invalid total handling).

15.2. The readiness check expects 401 from `/api/panic`; confirm it still passes once the middleware is active.


## Reader File Count

Reader creates **1 file** and edits **3 files**:
- Create: `app/Http/Middleware/EnsureFusionAuthToken.php`
- Edit: `config/app.php`
- Edit: `routes/api.php`
- Edit: `app/Http/Controllers/Controller.php`

No separate service class, exception class, guard, provider, claim validators, or bootstrap/app.php edits.

## Why This Is Neat and Appropriate

- The middleware is a standard Laravel concept and the standard place to enforce authentication on routes.
- Config values are read through `config()` (not `env()` directly), following Laravel conventions.
- The `Http` and `Cache` facades are used idiomatically.
- User provisioning stays in the middleware because it is directly tied to authentication.
- `config/auth.php` remains at Laravel defaults, avoiding confusion.
- `bootstrap/app.php` is not edited because the full middleware class name is used in routes, which is still idiomatic.
