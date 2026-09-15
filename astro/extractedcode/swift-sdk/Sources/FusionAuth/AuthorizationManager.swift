import os
import AppAuth
import Combine

enum AuthorizationManagerError: Error {
    case notInitialized
}

/// AuthorizationManager is a singleton object that manages the authorization state of the user.
/// It provides methods to initialize the authorization manager, check if the user is authenticated,
/// retrieve access tokens, refresh access tokens, and clear the authorization state.
///
/// AuthorizationManager uses a TokenManager to manage the access tokens and a Storage implementation
/// to store the authorization state.
public class AuthorizationManager {
    /// The shared instance of the AuthorizationManager
    public static let instance = AuthorizationManager()

    private var configuration: AuthorizationConfiguration?
    private var tokenManager: TokenManager?

    private let eventSubject = CurrentValueSubject<FusionAuthState?, Never>(nil)

    private init() {}

    /// Initialize the AuthorizationManager with the given configuration
    @discardableResult public func initialize(configuration: AuthorizationConfiguration, storage: Storage? = nil) -> Self {
        self.configuration = configuration
        self.initTokenManager(storage)
        return self
    }

    /// Initialize the TokenManager with the given storage
    internal func initTokenManager(_ storage: Storage? = nil) {
        self.tokenManager = TokenManager().withStorage(storage: storage ?? MemoryStorage())

        if let authState = tokenManager?.getAuthState() {
            triggerEvent(authState)
        }
    }

    /// Returns the current TokenManager
    public func getTokenManager() -> TokenManager {
        return tokenManager!
    }

    /// Returns a fresh access token
    ///
    /// If the access token is not expired, it will be returned immediately.
    /// If the access token is expired or force is `true`, a new access token will be fetched using the refresh token.
    public func freshAccessToken(force: Bool = false) async throws -> String? {
        if !force && !self.isAccessTokenExpired() {
            return self.getAccessToken()
        }

        // We always use oAuth to get a fresh access token
        return try await oauth().freshAccessToken()
    }

    /// Retrieves the access token, if available
    public func getAccessToken() -> String? {
        return self.tokenManager?.getAuthState()?.accessToken
    }

    /// Retrieves the access token expiration, if available
    public func getAccessTokenExpirationTime() -> Date? {
        return self.tokenManager?.getAuthState()?.accessTokenExpirationTime
    }

    /// Checks if the stored access token is expired.
    public func isAccessTokenExpired() -> Bool {
        guard let expiration = self.getAccessTokenExpirationTime() else {
            return true
        }

        return expiration.timeIntervalSinceNow.sign == .minus
    }

    /// Retrieves the ID token, if available
    public func getIdToken() -> String? {
        return self.tokenManager?.getAuthState()?.idToken
    }

    internal func updateAuthState(authState: OIDAuthState) throws {
        try updateAuthState(fusionAuthState: FusionAuthState(
            accessToken: authState.lastTokenResponse?.accessToken ?? "",
            accessTokenExpirationTime: authState.lastTokenResponse?.accessTokenExpirationDate ?? Date(),
            idToken: authState.lastTokenResponse?.idToken ?? "",
            refreshToken: authState.refreshToken ?? ""
        ))
    }

    internal func updateAuthState(accessToken: String, accessTokenExpirationTime: Date, idToken: String, refreshToken: String) throws {
        try updateAuthState(fusionAuthState: FusionAuthState(
            accessToken: accessToken,
            accessTokenExpirationTime: accessTokenExpirationTime,
            idToken: idToken,
            refreshToken: refreshToken
        ))
    }

    private func updateAuthState(fusionAuthState: FusionAuthState) throws {
        try self.tokenManager?.saveAuthState(fusionAuthState)
        triggerEvent(fusionAuthState)
    }

    internal func clearState() throws {
        try self.tokenManager?.clearAuthState()
        triggerEvent(nil)
    }

    /// Clears all authorization state and configuration.
    /// This method should be called when switching between different FusionAuth instances or when performing a logout.
    /// It clears both the stored authentication tokens and resets the configuration.
    public func clearAllState() throws {
        try clearState()
        self.configuration = nil
    }

    /// Retrieves the current authorization configuration.
    /// - Returns: The current AuthorizationConfiguration, or nil if not initialized.
    public func getConfiguration() -> AuthorizationConfiguration? {
        return self.configuration
    }

    /// Updates the configuration and clears tokens for a fresh authentication with a new tenant.
    /// This method combines configuration update with state clearing, making it ideal for tenant switching.
    /// It automatically clears existing authentication state before applying the new configuration.
    ///
    /// - Parameter configuration: The new AuthorizationConfiguration to apply.
    /// - Parameter storage: Optional custom storage implementation. If not provided, existing storage is preserved.
    /// - Returns: Self for method chaining.
    @discardableResult public func resetConfiguration(configuration: AuthorizationConfiguration, storage: Storage? = nil) throws -> Self {
        try clearAllState()
        self.configuration = configuration
        if let storage {
            self.initTokenManager(storage)
            return self
        }
        if self.tokenManager == nil {
            self.initTokenManager()
        }
        return self
    }
}

// MARK: - PList Configuration

extension AuthorizationManager {
    /// Initialize the AuthorizationManager with the given bundle
    @discardableResult public func initialize(bundle: Bundle = Bundle.main, storage: Storage? = nil) -> Self {
        guard let configuration = AuthorizationConfiguration.fromPlist(bundle) else {
            return self
        }

        self.configuration = configuration
        self.initTokenManager(storage ?? AuthorizationConfiguration.getStorageFromPlist(bundle))
        return self
    }
}

// MARK: - OAuth

extension AuthorizationManager {
    /// Returns an instance of the OAuthAuthorizationService, configured with the current configuration
    public static func oauth() throws -> OAuthAuthorizationService {
        return try AuthorizationManager.instance.oauth()
    }

    /// Returns an instance of the OAuthAuthorizationService, configured with the current configuration
    public func oauth() throws -> OAuthAuthorizationService {
        // Fallback to configuration in PList
        if self.configuration == nil {
            self.initialize()
        }

        guard let configuration = self.configuration else {
            throw AuthorizationManagerError.notInitialized
        }

        return OAuthAuthorizationService(
            fusionAuthUrl: configuration.fusionAuthUrl,
            clientId: configuration.clientId,
            tenantId: configuration.tenant,
            locale: configuration.locale,
            additionalScopes: configuration.additionalScopes
        )
    }
}

// MARK: - Event Handling

extension AuthorizationManager {
    /// A publisher that emits the current FusionAuthState whenever it changes
    public var eventPublisher: AnyPublisher<FusionAuthState?, Never> {
        eventSubject.eraseToAnyPublisher()
    }

    internal func triggerEvent(_ event: FusionAuthState?) {
        eventSubject.send(event)
    }
}

// MARK: - Logger

extension AuthorizationManager {
    /// The logger for the FusionAuth Mobile SDK
    public static var log: Logger?

    /// Set the log level for the AuthorizationManager
    public static func setLogLevel(_ level: OSLogType) {
        self.log = Logger(subsystem: "io.fusionauth.mobilesdk", category: "AuthorizationManager")
    }
}
