<?php

namespace Tests\Feature;

use App\Auth\FusionAuthKeySet;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Testing\TestResponse;
use OpenSSLAsymmetricKey;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Exercises EnsureFusionAuthToken against a fake FusionAuth JWKS endpoint, using RSA keys generated
 * for the test run so that tokens can be signed both correctly and incorrectly.
 */
class FusionAuthTokenTest extends TestCase
{
    // DatabaseMigrations rather than RefreshDatabase: the latter wraps each test in a transaction, which would
    // roll back the simulated concurrent insert together with the failed one and hide the createOrFirst() fallback.
    use DatabaseMigrations;

    private const FUSIONAUTH_URL = 'http://fusionauth.test:9011';

    private const JWKS_URL = self::FUSIONAUTH_URL.'/.well-known/jwks.json';

    private const CLIENT_ID = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';

    private const TELLER_ID = '00000000-0000-0000-0000-111111111111';

    private const CUSTOMER_ID = '00000000-0000-0000-0000-222222222222';

    private static OpenSSLAsymmetricKey $signingKey;

    private static OpenSSLAsymmetricKey $rotatedKey;

    /** @var list<array<string, mixed>> The JWK entries the fake FusionAuth currently publishes. */
    private array $publishedKeys;

    /** A fake failure response for the JWKS endpoint, or null to serve the published keys. */
    private mixed $jwksFailure = null;

    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();

        self::$signingKey = self::generateKey();
        self::$rotatedKey = self::generateKey();
    }

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('app.fusionauth', [
            'url' => self::FUSIONAUTH_URL,
            'client_id' => self::CLIENT_ID,
            'algo' => 'RS256',
            'jwks_url' => self::JWKS_URL,
            'jwks_url_cache' => 86400,
        ]);

        $this->publishedKeys = [self::jwk(self::$signingKey, 'signing-key')];

        Http::fake(fn () => $this->jwksFailure ?? Http::response(['keys' => $this->publishedKeys]));
    }

    public function test_valid_bearer_token_is_accepted(): void
    {
        $response = $this->makeChange($this->token());

        $response->assertOk()->assertJsonPath('Message', 'We can make change using 4 quarters 0 dimes 0 nickels 2 pennies');
    }

    public function test_first_request_provisions_the_user_by_fusionauth_id(): void
    {
        $this->makeChange($this->token())->assertOk();

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseHas('users', ['id' => self::TELLER_ID]);
    }

    public function test_existing_user_is_not_written_on_later_requests(): void
    {
        $this->makeChange($this->token())->assertOk();
        $firstSeen = User::findOrFail(self::TELLER_ID)->updated_at;

        $this->travel(5)->minutes();
        $this->makeChange($this->token())->assertOk();

        $this->assertDatabaseCount('users', 1);
        $this->assertTrue(User::findOrFail(self::TELLER_ID)->updated_at->equalTo($firstSeen));
    }

    public function test_simultaneous_first_requests_do_not_fail_on_the_primary_key(): void
    {
        // Simulate another request inserting the same user between the lookup and the insert.
        User::creating(function (User $user) {
            DB::table('users')->insert(['id' => $user->id, 'created_at' => now(), 'updated_at' => now()]);
        });

        $this->makeChange($this->token())->assertOk();

        $this->assertDatabaseCount('users', 1);
    }

    public function test_request_without_a_token_is_rejected(): void
    {
        $response = $this->getJson('/api/make-change?total=1.02');

        $this->assertUnauthorized($response);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_token_in_a_cookie_is_ignored(): void
    {
        $token = $this->token();

        $this->assertUnauthorized(
            $this->withUnencryptedCookie('app.at', $token)->getJson('/api/make-change?total=1.02')
        );
        $this->assertUnauthorized(
            $this->withUnencryptedCookie('app_at', $token)->getJson('/api/make-change?total=1.02')
        );
    }

    public function test_authorization_header_without_the_bearer_scheme_is_rejected(): void
    {
        $token = $this->token();

        $this->assertUnauthorized($this->withHeader('Authorization', $token)->getJson('/api/make-change?total=1.02'));
        $this->assertUnauthorized($this->withHeader('Authorization', 'Basic '.$token)->getJson('/api/make-change?total=1.02'));
        $this->assertUnauthorized($this->withHeader('Authorization', 'Bearer ')->getJson('/api/make-change?total=1.02'));
    }

    #[DataProvider('malformedTokens')]
    public function test_malformed_token_is_rejected_without_leaking_details(string $token): void
    {
        Log::spy();

        $response = $this->makeChange($token);

        $this->assertUnauthorized($response);
        $this->assertStringNotContainsString('Exception', $response->getContent());
        Log::shouldNotHaveReceived('error');
    }

    public static function malformedTokens(): array
    {
        return [
            'not a JWT' => ['not-a-jwt'],
            'two segments' => ['eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ4In0'],
            'garbage segments' => ['a.b.c'],
            'unsigned token' => [self::unsignedToken()],
        ];
    }

    #[DataProvider('badlyTypedHeaders')]
    public function test_token_with_a_badly_typed_header_is_rejected_without_leaking_details(array $header): void
    {
        Log::spy();

        $response = $this->makeChange(self::rawToken($header, $this->claims(), self::$signingKey));

        $this->assertUnauthorized($response);
        $this->assertStringNotContainsString('Error', $response->getContent());
        Log::shouldNotHaveReceived('error');
    }

    public static function badlyTypedHeaders(): array
    {
        return [
            'kid is an array' => [['alg' => 'RS256', 'kid' => []]],
            'kid is a number' => [['alg' => 'RS256', 'kid' => 1]],
            'alg is an array' => [['alg' => ['RS256'], 'kid' => 'signing-key']],
        ];
    }

    public function test_token_signed_by_an_unknown_key_is_rejected(): void
    {
        $forged = $this->token(key: self::$rotatedKey);

        $this->assertUnauthorized($this->makeChange($forged));
    }

    public function test_expired_token_is_rejected(): void
    {
        $this->assertUnauthorized($this->makeChange($this->token(['exp' => time() - 60])));
    }

    public function test_token_from_another_issuer_is_rejected(): void
    {
        $this->assertUnauthorized($this->makeChange($this->token(['iss' => 'http://evil.example.com'])));
    }

    public function test_token_for_another_audience_is_rejected(): void
    {
        $this->assertUnauthorized($this->makeChange($this->token(['aud' => 'another-client-id'])));
        $this->assertUnauthorized($this->makeChange($this->token(['aud' => ['another-client-id', 'https://api.example.com']])));
    }

    public function test_audience_array_containing_the_client_id_is_accepted(): void
    {
        $this->makeChange($this->token(['aud' => ['https://api.example.com', self::CLIENT_ID]]))->assertOk();
    }

    #[DataProvider('requiredClaims')]
    public function test_token_missing_a_required_claim_is_rejected(string $claim): void
    {
        $this->assertUnauthorized($this->makeChange($this->token([$claim => null])));
    }

    public static function requiredClaims(): array
    {
        return ['sub' => ['sub'], 'exp' => ['exp'], 'iss' => ['iss'], 'aud' => ['aud']];
    }

    #[DataProvider('badlyTypedClaims')]
    public function test_token_with_a_badly_typed_claim_is_rejected(string $claim, mixed $value): void
    {
        // Signed by hand because JWT::encode() refuses some of these values itself.
        $token = self::rawToken(['alg' => 'RS256', 'kid' => 'signing-key'], $this->claims([$claim => $value]), self::$signingKey);

        $this->assertUnauthorized($this->makeChange($token));
    }

    public static function badlyTypedClaims(): array
    {
        return [
            'numeric sub' => ['sub', 12345],
            'non-UUID sub' => ['sub', 'teller@example.com'],
            'string exp' => ['exp', 'tomorrow'],
            'array iss' => ['iss', [self::FUSIONAUTH_URL]],
            'object aud' => ['aud', ['client' => self::CLIENT_ID]],
        ];
    }

    public function test_token_using_another_algorithm_is_rejected_even_if_signed_with_the_right_key(): void
    {
        $this->assertUnauthorized($this->makeChange($this->token(alg: 'RS512')));
    }

    public function test_jwks_entry_declaring_another_algorithm_does_not_widen_the_policy(): void
    {
        // FusionAuth also publishes a key it uses with RS512. Only RS256 is configured here, so tokens signed
        // with that key must be rejected whatever algorithm their header names, while RS256 tokens still work.
        $this->publishedKeys[] = self::jwk(self::$rotatedKey, 'rs512-key', 'RS512');

        $this->assertUnauthorized($this->makeChange($this->token(key: self::$rotatedKey, kid: 'rs512-key', alg: 'RS512')));
        $this->assertUnauthorized($this->makeChange($this->token(key: self::$rotatedKey, kid: 'rs512-key')));
        $this->makeChange($this->token())->assertOk();
    }

    public function test_hmac_token_signed_with_the_public_key_is_rejected(): void
    {
        $publicKeyPem = openssl_pkey_get_details(self::$signingKey)['key'];
        $forged = JWT::encode($this->claims(), $publicKeyPem, 'HS256', 'signing-key');

        $this->assertUnauthorized($this->makeChange($forged));
    }

    public function test_jwks_is_cached_between_requests(): void
    {
        $this->makeChange($this->token())->assertOk();
        $this->makeChange($this->token())->assertOk();

        Http::assertSentCount(1);
    }

    public function test_rotated_signing_key_is_picked_up_before_the_cache_expires(): void
    {
        $this->makeChange($this->token())->assertOk();

        $this->publishedKeys[] = self::jwk(self::$rotatedKey, 'rotated-key');

        $this->makeChange($this->token(key: self::$rotatedKey, kid: 'rotated-key'))->assertOk();
        Http::assertSentCount(2);
    }

    public function test_unknown_key_ids_refresh_the_jwks_at_most_once_per_cooldown(): void
    {
        $this->makeChange($this->token())->assertOk();
        Http::assertSentCount(1);

        $this->assertUnauthorized($this->makeChange($this->token(kid: 'made-up-1')));
        Http::assertSentCount(2);

        $this->assertUnauthorized($this->makeChange($this->token(kid: 'made-up-2')));
        $this->assertUnauthorized($this->makeChange($this->token(kid: 'made-up-3')));
        $this->makeChange($this->token())->assertOk();
        Http::assertSentCount(2);

        $this->travel(FusionAuthKeySet::REFRESH_COOLDOWN_SECONDS + 1)->seconds();

        $this->assertUnauthorized($this->makeChange($this->token(kid: 'made-up-4')));
        Http::assertSentCount(3);
    }

    public function test_jwks_http_error_is_a_server_error_not_an_authentication_failure(): void
    {
        $this->jwksFailure = Http::response('Service Unavailable', 503);

        $response = $this->makeChange($this->token());

        $response->assertStatus(500);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_unreachable_jwks_endpoint_is_a_server_error(): void
    {
        $this->jwksFailure = Http::failedConnection();

        $this->makeChange($this->token())->assertStatus(500);
    }

    public function test_jwks_without_a_usable_key_is_a_server_error(): void
    {
        $this->publishedKeys = [];

        $this->makeChange($this->token())->assertStatus(500);
    }

    public function test_teller_can_use_both_endpoints(): void
    {
        $token = $this->token();

        $this->makeChange($token)->assertOk();
        $this->panic($token)->assertOk()->assertJson(['message' => "We've called the police!"]);
    }

    public function test_customer_can_make_change_but_not_panic(): void
    {
        $token = $this->token(['sub' => self::CUSTOMER_ID, 'roles' => ['customer']]);

        $this->makeChange($token)->assertOk();
        $this->panic($token)->assertForbidden();
    }

    public function test_token_without_roles_is_forbidden(): void
    {
        $token = $this->token(['roles' => null]);

        $this->makeChange($token)->assertForbidden();
        $this->panic($token)->assertForbidden();
    }

    private function makeChange(string $token): TestResponse
    {
        return $this->withToken($token)->getJson('/api/make-change?total=1.02');
    }

    private function panic(string $token): TestResponse
    {
        return $this->withToken($token)->postJson('/api/panic');
    }

    private function assertUnauthorized(TestResponse $response): void
    {
        $response->assertUnauthorized()
            ->assertExactJson(['error' => 'Unauthorized'])
            ->assertHeader('WWW-Authenticate', 'Bearer');
    }

    /**
     * Claims for a valid teller token; pass null to drop a claim.
     *
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function claims(array $overrides = []): array
    {
        $claims = array_merge([
            'iss' => self::FUSIONAUTH_URL,
            'aud' => self::CLIENT_ID,
            'sub' => self::TELLER_ID,
            'iat' => time(),
            'exp' => time() + 3600,
            'roles' => ['teller'],
        ], $overrides);

        return array_filter($claims, fn ($value) => $value !== null);
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function token(array $overrides = [], ?OpenSSLAsymmetricKey $key = null, string $kid = 'signing-key', string $alg = 'RS256'): string
    {
        return JWT::encode($this->claims($overrides), $key ?? self::$signingKey, $alg, $kid);
    }

    /**
     * Build a token without JWT::encode(), so that the header and claims can hold anything at all.
     * With no key the signature segment is left empty, as an "alg: none" token would be.
     *
     * @param  array<string, mixed>  $header
     * @param  array<string, mixed>  $claims
     */
    private static function rawToken(array $header, array $claims, ?OpenSSLAsymmetricKey $key = null): string
    {
        $signingInput = self::base64url(json_encode($header)).'.'.self::base64url(json_encode($claims));
        $signature = '';

        if ($key !== null) {
            openssl_sign($signingInput, $signature, $key, OPENSSL_ALGO_SHA256);
        }

        return $signingInput.'.'.self::base64url($signature);
    }

    private static function unsignedToken(): string
    {
        return self::rawToken(
            ['alg' => 'none', 'kid' => 'signing-key'],
            ['iss' => self::FUSIONAUTH_URL, 'aud' => self::CLIENT_ID, 'sub' => self::TELLER_ID, 'exp' => time() + 3600],
        );
    }

    private static function base64url(string $bytes): string
    {
        return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
    }

    private static function generateKey(): OpenSSLAsymmetricKey
    {
        return openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
    }

    /**
     * Build the JWKS entry FusionAuth would publish for a key.
     *
     * @return array<string, mixed>
     */
    private static function jwk(OpenSSLAsymmetricKey $key, string $kid, string $alg = 'RS256'): array
    {
        $rsa = openssl_pkey_get_details($key)['rsa'];

        return [
            'alg' => $alg,
            'e' => self::base64url($rsa['e']),
            'kid' => $kid,
            'kty' => 'RSA',
            'n' => self::base64url($rsa['n']),
            'use' => 'sig',
        ];
    }
}
