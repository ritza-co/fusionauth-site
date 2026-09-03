<?php

namespace App\Auth;

use ArrayAccess;
use DomainException;
use Firebase\JWT\JWK;
use Firebase\JWT\Key;
use Illuminate\Http\Client\HttpClientException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;
use RuntimeException;
use UnexpectedValueException;

/**
 * The FusionAuth signing keys, fetched from the JWKS endpoint and cached.
 *
 * Passing this to JWT::decode() lets the library look up the key named by the token's "kid"
 * header. An unknown "kid" triggers one refresh of the JWKS so that a rotated key is picked
 * up before the cache expires, but at most once per REFRESH_COOLDOWN_SECONDS, so a flood of
 * tokens with made-up key Ids cannot turn this API into a request generator against FusionAuth.
 *
 * Every key is bound to the single configured algorithm, whatever the JWKS entry declares, so
 * the token header cannot pick a different one.
 *
 * Failures to fetch or parse the JWKS are RuntimeExceptions: they are server-side problems and
 * must not be reported to the client as an invalid token.
 *
 * @implements ArrayAccess<string, Key>
 */
class FusionAuthKeySet implements ArrayAccess
{
    public const REFRESH_COOLDOWN_SECONDS = 60;

    private const CACHE_KEY = 'fusionauth.jwks';

    private const REFRESH_LOCK_KEY = 'fusionauth.jwks.refreshed';

    /** @var array<string, Key>|null */
    private ?array $keys = null;

    public function __construct(
        private readonly string $jwksUrl,
        private readonly string $algorithm,
        private readonly int $cacheSeconds,
    ) {}

    public function offsetExists(mixed $kid): bool
    {
        if (! is_string($kid)) {
            return false;
        }

        // Cache::add only succeeds when no refresh happened within the cooldown window.
        if (! isset($this->keys()[$kid]) && Cache::add(self::REFRESH_LOCK_KEY, true, self::REFRESH_COOLDOWN_SECONDS)) {
            $this->keys = $this->fetch();
        }

        return isset($this->keys[$kid]);
    }

    public function offsetGet(mixed $kid): Key
    {
        return $this->keys()[$kid] ?? throw new UnexpectedValueException('Unknown signing key.');
    }

    public function offsetSet(mixed $kid, mixed $value): void
    {
        throw new RuntimeException('The FusionAuth key set is read-only.');
    }

    public function offsetUnset(mixed $kid): void
    {
        throw new RuntimeException('The FusionAuth key set is read-only.');
    }

    /**
     * @return array<string, Key>
     */
    private function keys(): array
    {
        if ($this->keys === null) {
            $jwks = Cache::get(self::CACHE_KEY);
            $this->keys = $jwks === null ? $this->fetch() : $this->parse($jwks);
        }

        return $this->keys;
    }

    /**
     * Fetch the JWKS from FusionAuth, cache the document, and return the usable keys.
     *
     * @return array<string, Key>
     */
    private function fetch(): array
    {
        try {
            $jwks = Http::connectTimeout(2)->timeout(5)->get($this->jwksUrl)->throw()->json();
        } catch (HttpClientException $e) {
            throw new RuntimeException("Unable to fetch the FusionAuth JWKS from {$this->jwksUrl}.", 0, $e);
        }

        $keys = $this->parse(is_array($jwks) ? $jwks : []);

        if ($keys === []) {
            throw new RuntimeException("The FusionAuth JWKS at {$this->jwksUrl} contains no {$this->algorithm} keys.");
        }

        Cache::put(self::CACHE_KEY, $jwks, $this->cacheSeconds);

        return $keys;
    }

    /**
     * Turn a JWKS document into keys for the configured algorithm, skipping entries declared for any other one.
     *
     * @param  array<mixed>  $jwks
     * @return array<string, Key>
     */
    private function parse(array $jwks): array
    {
        $keys = [];
        $entries = is_array($jwks['keys'] ?? null) ? $jwks['keys'] : [];

        foreach ($entries as $jwk) {
            if (! is_array($jwk) || ! is_string($jwk['kid'] ?? null) || ($jwk['alg'] ?? $this->algorithm) !== $this->algorithm) {
                continue;
            }

            try {
                $key = JWK::parseKey($jwk, $this->algorithm);
            } catch (UnexpectedValueException|InvalidArgumentException|DomainException $e) {
                throw new RuntimeException("Unable to parse key {$jwk['kid']} from the FusionAuth JWKS.", 0, $e);
            }

            if ($key !== null) {
                $keys[$jwk['kid']] = $key;
            }
        }

        return $keys;
    }
}
