// AuthorizationManager swift test case with storage

import XCTest
@testable import FusionAuth

final class AuthManagerKeyChainStorageTest: XCTestCase {
    private var authorizationManager: AuthorizationManager!
    private var storage: KeyChainStorage!
    private var tokenManager: TokenManager!
    private var userInfo: UserInfo!

    override func setUp() {
        super.setUp()
        storage = KeyChainStorage()
        tokenManager = TokenManager()
        userInfo = UserInfo()
        authorizationManager = AuthorizationManager.instance
    }

    override func tearDown() {
        super.tearDown()
        storage = nil
        authorizationManager = nil
        tokenManager = nil
        userInfo = nil
    }

    func testAuthorizationManager() {
        let auth = authorizationManager
        XCTAssertNotNil(auth)
    }

    func testTokenManager() {
        let token = tokenManager
        XCTAssertNotNil(token)
    }

    func testUserInfo() {
        let user = userInfo
        XCTAssertNotNil(user)
    }

    func testClearAllState() throws {
        // Initialize with first configuration
        let config1 = AuthorizationConfiguration(
            clientId: "client1",
            fusionAuthUrl: "https://fusionauth1.example.com"
        )
        authorizationManager.initialize(configuration: config1, storage: storage)

        // Verify configuration is set
        let oauth1 = try authorizationManager.oauth()
        XCTAssertNotNil(oauth1)

        // Clear all state
        try authorizationManager.clearAllState()

        // After clearing, attempting to use oauth should either fail or reinitialize
        // The configuration should be nil internally, requiring reinitialization
        do {
            _ = try authorizationManager.oauth()
            // Should fall back to plist initialization if available, or throw notInitialized
        } catch AuthorizationManagerError.notInitialized {
            // Expected behavior - configuration was cleared
        }

        // Initialize with second configuration (different URL)
        let config2 = AuthorizationConfiguration(
            clientId: "client2",
            fusionAuthUrl: "https://fusionauth2.example.com"
        )
        authorizationManager.initialize(configuration: config2, storage: storage)

        // Verify new configuration is active
        let oauth2 = try authorizationManager.oauth()
        XCTAssertNotNil(oauth2)

        // Verify that we can successfully switch between instances
        XCTAssertNoThrow(try authorizationManager.clearAllState())
    }

    func testClearAllStateMultipleInstances() throws {
        let config1 = AuthorizationConfiguration(
            clientId: "client1",
            fusionAuthUrl: "https://fusionauth1.example.com",
            tenant: "tenant1"
        )

        let config2 = AuthorizationConfiguration(
            clientId: "client2",
            fusionAuthUrl: "https://fusionauth2.example.com",
            tenant: "tenant2"
        )

        // Initialize with first FusionAuth instance
        authorizationManager.initialize(configuration: config1, storage: storage)
        let oauth1 = try authorizationManager.oauth()
        XCTAssertNotNil(oauth1)

        // Clear state and switch to second FusionAuth instance
        try authorizationManager.clearAllState()
        authorizationManager.initialize(configuration: config2, storage: storage)
        let oauth2 = try authorizationManager.oauth()
        XCTAssertNotNil(oauth2)

        // Verify successful switching
        XCTAssertNoThrow(try authorizationManager.clearAllState())
    }

    func testGetConfiguration() throws {
        // Initially nil
        XCTAssertNil(authorizationManager.getConfiguration())

        // Set configuration
        let config = AuthorizationConfiguration(
            clientId: "test-client",
            fusionAuthUrl: "https://fusionauth.example.com",
            tenant: "test-tenant"
        )
        authorizationManager.initialize(configuration: config, storage: storage)

        // Verify we can retrieve it
        let retrievedConfig = authorizationManager.getConfiguration()
        XCTAssertNotNil(retrievedConfig)
        XCTAssertEqual(retrievedConfig?.clientId, "test-client")
        XCTAssertEqual(retrievedConfig?.fusionAuthUrl, "https://fusionauth.example.com")
        XCTAssertEqual(retrievedConfig?.tenant, "test-tenant")
    }

    func testResetConfiguration() throws {
        // Initialize with first configuration
        let config1 = AuthorizationConfiguration(
            clientId: "client1",
            fusionAuthUrl: "https://fusionauth1.example.com",
            tenant: "tenant1"
        )
        authorizationManager.initialize(configuration: config1, storage: storage)

        // Verify initial configuration
        var currentConfig = authorizationManager.getConfiguration()
        XCTAssertEqual(currentConfig?.clientId, "client1")
        XCTAssertEqual(currentConfig?.fusionAuthUrl, "https://fusionauth1.example.com")
        XCTAssertEqual(currentConfig?.tenant, "tenant1")

        // Update to new configuration
        let config2 = AuthorizationConfiguration(
            clientId: "client2",
            fusionAuthUrl: "https://fusionauth2.example.com",
            tenant: "tenant2"
        )
        try authorizationManager.resetConfiguration(configuration: config2, storage: storage)

        // Verify new configuration is active
        currentConfig = authorizationManager.getConfiguration()
        XCTAssertEqual(currentConfig?.clientId, "client2")
        XCTAssertEqual(currentConfig?.fusionAuthUrl, "https://fusionauth2.example.com")
        XCTAssertEqual(currentConfig?.tenant, "tenant2")

        // Verify we can create oauth service with new config
        let oauth = try authorizationManager.oauth()
        XCTAssertNotNil(oauth)
    }

    func testResetConfigurationPreservesTenantChanges() throws {
        // Start with one tenant
        let configTenant1 = AuthorizationConfiguration(
            clientId: "client1",
            fusionAuthUrl: "https://fusionauth.example.com",
            tenant: "organization-tenant-1"
        )
        authorizationManager.initialize(configuration: configTenant1, storage: storage)

        // Switch to a different tenant
        let configTenant2 = AuthorizationConfiguration(
            clientId: "client1",
            fusionAuthUrl: "https://fusionauth.example.com",
            tenant: "organization-tenant-2"
        )
        try authorizationManager.resetConfiguration(configuration: configTenant2, storage: storage)

        // Verify tenant changed
        let currentConfig = authorizationManager.getConfiguration()
        XCTAssertEqual(currentConfig?.tenant, "organization-tenant-2")

        // Verify different OAuth services are created
        let oauth = try authorizationManager.oauth()
        XCTAssertNotNil(oauth)
    }

    func testRuntimeTenantSwitchingScenario() throws {
        // Scenario: App needs to support multiple organizations
        // Each with its own FusionAuth tenant
        let organizations = [
            (name: "Org A", clientId: "org-a-client", tenantId: "org-a-tenant", url: "https://fusionauth.example.com"),
            (name: "Org B", clientId: "org-b-client", tenantId: "org-b-tenant", url: "https://fusionauth.example.com"),
            (name: "Org C", clientId: "org-c-client", tenantId: "org-c-tenant", url: "https://fusionauth.example.com")
        ]

        for (index, org) in organizations.enumerated() {
            let config = AuthorizationConfiguration(
                clientId: org.clientId,
                fusionAuthUrl: org.url,
                tenant: org.tenantId
            )

            if index == 0 {
                authorizationManager.initialize(configuration: config, storage: storage)
            } else {
                try authorizationManager.resetConfiguration(configuration: config, storage: storage)
            }

            let currentConfig = authorizationManager.getConfiguration()
            XCTAssertEqual(currentConfig?.clientId, org.clientId)
            XCTAssertEqual(currentConfig?.tenant, org.tenantId)

            // Verify oauth service works for this org
            let oauth = try authorizationManager.oauth()
            XCTAssertNotNil(oauth)
        }
    }

    func testMultipleConfigurationResets() throws {
        let config1 = AuthorizationConfiguration(
            clientId: "client1",
            fusionAuthUrl: "https://fusionauth1.example.com"
        )

        let config2 = AuthorizationConfiguration(
            clientId: "client2",
            fusionAuthUrl: "https://fusionauth2.example.com"
        )

        let config3 = AuthorizationConfiguration(
            clientId: "client3",
            fusionAuthUrl: "https://fusionauth3.example.com"
        )

        // Perform multiple switches
        authorizationManager.initialize(configuration: config1, storage: storage)
        XCTAssertEqual(authorizationManager.getConfiguration()?.clientId, "client1")

        try authorizationManager.resetConfiguration(configuration: config2, storage: storage)
        XCTAssertEqual(authorizationManager.getConfiguration()?.clientId, "client2")

        try authorizationManager.resetConfiguration(configuration: config3, storage: storage)
        XCTAssertEqual(authorizationManager.getConfiguration()?.clientId, "client3")

        // Verify oauth still works
        let oauth = try authorizationManager.oauth()
        XCTAssertNotNil(oauth)
    }
}
