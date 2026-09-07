<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class EnsureFusionAuthToken
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $token = $request->bearerToken();

            if (!$token) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $payload = $this->decodeToken($token);

            $this->validateSubject($payload);
            $this->validateIssuer($payload);
            $this->validateAudience($payload);

            $user = User::firstOrCreate(['id' => $payload->sub]);

            $request->attributes->set('jwt_payload', (array) $payload);
            $request->setUserResolver(fn () => $user);

            return $next($request);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('JWT auth failed: ' . $e->getMessage(), ['class' => get_class($e)]);
            return response()->json(['error' => 'Unauthorized', 'debug' => get_class($e) . ': ' . $e->getMessage()], 401);
        }
    }

    private function decodeToken(string $token): object
    {
        $keySet = $this->keySet();

        try {
            return JWT::decode($token, $keySet);
        } catch (UnexpectedValueException $e) {
            if (!str_contains($e->getMessage(), 'Key not found')) {
                throw $e;
            }

            if (!Cache::add('fusionauth.jwks.refreshing', true, 60)) {
                throw $e;
            }

            Cache::forget('fusionauth.jwks');
            $keySet = $this->keySet();

            return JWT::decode($token, $keySet);
        }
    }

    private function keySet(): array
    {
        $jwksUrl = config('app.fusionauth.jwks_url')
            ?? config('app.fusionauth.url') . '/.well-known/jwks.json';

        $cacheSeconds = (int) config('app.fusionauth.jwks_url_cache', 86400);

        $jwksData = Cache::remember('fusionauth.jwks', $cacheSeconds, function () use ($jwksUrl) {
            return Http::timeout(5)->get($jwksUrl)->json();
        });

        return JWK::parseKeySet($jwksData);
    }

    private function validateIssuer(object $payload): void
    {
        $expectedIssuer = config('app.fusionauth.url');

        if (($payload->iss ?? null) !== $expectedIssuer) {
            throw new \UnexpectedValueException('Invalid issuer.');
        }
    }

    private function validateSubject(object $payload): void
    {
        $subject = $payload->sub ?? null;

        if (!is_string($subject) || $subject === '') {
            throw new \UnexpectedValueException('Invalid subject.');
        }
    }

    private function validateAudience(object $payload): void
    {
        $expectedAudience = config('app.fusionauth.client_id');
        $audience = $payload->aud ?? null;

        if (is_string($audience)) {
            $audience = [$audience];
        }

        if (!is_array($audience) || !in_array($expectedAudience, $audience, true)) {
            throw new \UnexpectedValueException('Invalid audience.');
        }
    }
}
