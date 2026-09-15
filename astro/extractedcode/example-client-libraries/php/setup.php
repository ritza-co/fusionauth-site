<?php

declare(strict_types=1);

use FusionAuth\ClientResponse;
use FusionAuth\FusionAuthClient;

if (empty($argv[1])) {
    echo 'Please generate an Api Key and pass it to this script:' . PHP_EOL;
    echo 'Usage: php ' . $argv[0] . ' "your-api-key"' . PHP_EOL;
    die(1);
}

require __DIR__ . '/vendor/autoload.php';

const FUSIONAUTH_BASE_URL = 'http://localhost:9011';
const FUSIONAUTH_CLIENT_SECRET = 'change-this-in-production-to-be-a-real-secret';
const APPLICATION_NAME = 'PHP Example App';
const APPLICATION_BASE_URL = 'http://localhost:8080';
const APPLICATION_ID = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';
const RSA_KEY_ID = '356a6624-b33c-471a-b707-48bbfcfbc593';

$mediator = new class(
    $argv[1],
    FUSIONAUTH_BASE_URL,
    FUSIONAUTH_CLIENT_SECRET,
    APPLICATION_NAME,
    APPLICATION_ID,
    RSA_KEY_ID,
    APPLICATION_BASE_URL,
) {

    private readonly FusionAuthClient $client;

    public function __construct(
        string $apiKey,
        private readonly string $baseUrl,
        private readonly string $clientSecret,
        private readonly string $applicationName,
        private readonly string $applicationId,
        private readonly string $rsaKeyId,
        private readonly string $applicationBaseUrl,
    ) {
        $this->client = new FusionAuthClient($apiKey, $baseUrl);
    }

    public function run(): stdClass
    {
        echo 'Retrieving Tenants... ';
        $tenant = $this->getTenant();
        echo 'OK' . PHP_EOL;

        echo 'Patching Tenant... ';
        $this->patchTenant($tenant);
        echo 'OK' . PHP_EOL;

        echo 'Generating RSA Key... ';
        $this->generateKey();
        echo 'OK' . PHP_EOL;

        echo 'Creating Application... ';
        $this->createApplication();
        echo 'OK' . PHP_EOL;

        echo 'Retrieving Users... ';
        $user = $this->getUser();
        echo 'OK' . PHP_EOL;

        echo "Patching User {$user->email}... ";
        $this->patchUser($user);
        echo 'OK' . PHP_EOL;

        echo 'Registering User... ';
        $this->registerUser($user);
        echo 'OK' . PHP_EOL;

        return $user;
    }

    private function handleResponse(string $method, ClientResponse $response): stdClass
    {
        if (!$response->wasSuccessful()) {
            $message = 'An unknown error occurred. Please check the API Key and Base URL for your FusionAuth instance.';
            $error = $response->errorResponse;
            if (!empty($error)) {
                $message = PHP_EOL . json_encode($error, JSON_PRETTY_PRINT);
            }
            throw new RuntimeException("Error while {$method}: {$message}", $response->status ?: 0);
        }
        return $response->successResponse ?? new stdClass();
    }

    private function getTenant(): stdClass
    {
        $response = $this->handleResponse(
            'Retrieving Tenants',
            $this->client->retrieveTenants()
        );
        if (empty($response->tenants)) {
            throw new RuntimeException("Couldn't find any tenants");
        }

        return $response->tenants[0];
    }

    private function patchTenant(stdClass $tenant): void
    {
        $this->handleResponse(
            'Patching Tenant',
            $this->client->patchTenant(
                $tenant->id,
                ['tenant' => ['issuer' => $this->baseUrl]]
            )
        );
    }

    private function generateKey(): void
    {
        $this->handleResponse(
            'Generating API Key',
            $this->client->generateKey(
                $this->rsaKeyId,
                [
                    'key' => [
                        'algorithm' => 'RS256',
                        'name'      => "For {$this->applicationName}",
                        'length'    => 2048,
                    ],
                ]
            )
        );
    }

    private function createApplication(): void
    {
        $application = [
            'name'               => $this->applicationName,
            'oauthConfiguration' => [
                'authorizedRedirectURLs' => [$this->applicationBaseUrl],
                'requireRegistration'    => true,
                'enabledGrants'          => ['authorization_code', 'refresh_token'],
                'logoutURL'              => $this->applicationBaseUrl,
                'clientSecret'           => $this->clientSecret,
            ],
            // assign key from above to sign our tokens. This needs to be asymmetric
            'jwtConfiguration'   => [
                'enabled'          => true,
                'accessTokenKeyId' => $this->rsaKeyId,
                'idTokenKeyId'     => $this->rsaKeyId,
            ],
            // creating roles
            'roles' => ['admin'],
        ];


        $this->handleResponse(
            'Creating Application',
            $this->client->createApplication(
                $this->applicationId,
                ['application' => $application]
            )
        );
    }

    private function getUser(): stdClass
    {
        // should only be one user
        $response = $this->handleResponse(
            'Retrieving User',
            $this->client->searchUsersByQuery([
                'search' => [
                    'queryString' => '*',
                ],
            ])
        );
        if (empty($response->users)) {
            throw new RuntimeException("Couldn't find any users");
        }
        return $response->users[0];
    }

    private function patchUser(stdClass $user): void
    {
        $this->handleResponse(
            'Patching User',
            $this->client->patchUser($user->id, [
                'user' => [
                    'fullName' => "{$user->firstName} {$user->lastName}",
                ],
            ])
        );
    }

    private function registerUser(stdClass $user): void
    {
        $this->handleResponse(
            'Registering User',
            $this->client->register($user->id, [
                'registration' => [
                    'applicationId' => $this->applicationId,
                ],
            ])
        );
    }

};

try {
    $user = $mediator->run();
    var_dump($user);
    echo 'Setup finished successfully.' . PHP_EOL;
} catch (\Throwable $t) {
    echo PHP_EOL;
    $code = $t->getCode();
    if ($code > 0) {
        echo "[HTTP {$code}] ";
    }
    echo $t->getMessage() . PHP_EOL;
    die(2);
}
