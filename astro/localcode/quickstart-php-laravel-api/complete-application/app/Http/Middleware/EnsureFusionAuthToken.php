<?php

namespace App\Http\Middleware;

use App\Auth\FusionAuthKeySet;
use App\Models\User;
use Closure;
use DomainException;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use InvalidArgumentException;
use stdClass;
use Symfony\Component\HttpFoundation\Response;
use TypeError;
use UnexpectedValueException;

class EnsureFusionAuthToken
{
    public function handle(Request $request, Closure $next): Response
    {
        // The token is only read from the Authorization header. Accepting it from a cookie
        // would make every endpoint reachable by cross-site requests without CSRF protection.
        $token = $request->bearerToken();

        if (! $token) {
            return $this->unauthorized('No bearer token in the Authorization header.');
        }

        // Built outside the try block so that a misconfiguration cannot be reported as a bad token.
        $keySet = $this->keySet();

        try {
            $payload = JWT::decode($token, $keySet);
            $this->validateClaims($payload);
        } catch (UnexpectedValueException|DomainException|InvalidArgumentException|TypeError $e) {
            // Everything the JWT library throws for a bad token (malformed, bad signature, unknown
            // key Id, expired, wrong algorithm) extends UnexpectedValueException or DomainException;
            // it throws a TypeError when a header field such as "kid" is not a string. Failures to
            // reach FusionAuth are plain RuntimeExceptions and are deliberately left uncaught so
            // they surface as server errors rather than as an invalid token.
            return $this->unauthorized($e->getMessage());
        }

        // Look the user up, and create it on the first request. createOrFirst() is used on a miss,
        // so two simultaneous first requests cannot fail on the primary key.
        $user = User::firstOrCreate(['id' => $payload->sub]);

        $request->attributes->set('jwt_payload', (array) $payload);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }

    private function keySet(): FusionAuthKeySet
    {
        return new FusionAuthKeySet(
            config('app.fusionauth.jwks_url') ?? config('app.fusionauth.url').'/.well-known/jwks.json',
            config('app.fusionauth.algo'),
            (int) config('app.fusionauth.jwks_url_cache'),
        );
    }

    /**
     * Require the claims this API relies on. The JWT library has already verified the signature and
     * checked "exp", "nbf" and "iat" where present; it does not fail when they are absent.
     */
    private function validateClaims(stdClass $payload): void
    {
        if (! is_string($payload->sub ?? null) || ! Str::isUuid($payload->sub)) {
            throw new UnexpectedValueException('The "sub" claim is missing or is not a UUID.');
        }

        if (! isset($payload->exp)) {
            throw new UnexpectedValueException('The "exp" claim is missing.');
        }

        if (($payload->iss ?? null) !== config('app.fusionauth.url')) {
            throw new UnexpectedValueException('The "iss" claim does not match the FusionAuth URL.');
        }

        // FusionAuth issues "aud" as the client Id, or as an array when resources were requested.
        $audience = $payload->aud ?? null;
        $audience = is_string($audience) ? [$audience] : $audience;

        if (! is_array($audience) || ! in_array(config('app.fusionauth.client_id'), $audience, true)) {
            throw new UnexpectedValueException('The "aud" claim does not contain the client Id.');
        }
    }

    private function unauthorized(string $reason): Response
    {
        // Invalid tokens are routine, so log them at info level and keep the reason server-side.
        Log::info('Rejected request to a FusionAuth protected endpoint.', ['reason' => $reason]);

        return response()
            ->json(['error' => 'Unauthorized'], 401)
            ->header('WWW-Authenticate', 'Bearer');
    }
}
