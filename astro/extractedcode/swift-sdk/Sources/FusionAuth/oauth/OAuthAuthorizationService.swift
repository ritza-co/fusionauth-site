import Foundation
@preconcurrency import AppAuth
import SwiftUI

/// OAuthAuthorizationService class is responsible for handling OAuth authorization and authorization process.
/// It provides methods to authorize the user, handle the redirect intent, fetch user information,
/// perform logout, retrieve fresh access token, and get the authorization service.
public class OAuthAuthorizationService {
    private let fusionAuthUrl: String
    private let clientId: String
    private let tenantId: String?
    private let locale: String?
    private let additionalScopes: [String]

    private var configurationTask: Task<OIDServiceConfiguration, Error>?

    private var tokenTask: Task<String, Error>?

    private var logoutSession: OIDExternalUserAgentSession?

    init(fusionAuthUrl: String, clientId: String, tenantId: String?, locale: String?, additionalScopes: [String]) {
        self.fusionAuthUrl = fusionAuthUrl
        self.clientId = clientId
        self.tenantId = tenantId
        self.locale = locale
        self.additionalScopes = additionalScopes
    }

    /// Builds additional parameters for the OAuth authorize request.
    private func getParametersFromOptions(_ options: OAuthAuthorizeOptions) -> [String: String] {
        var additionalParameters: [String: String] = [:]
        if tenantId != nil {
            additionalParameters.updateValue(tenantId!, forKey: "tenantId")
        }
        if locale != nil {
            additionalParameters.updateValue(locale!, forKey: "locale")
        }
        if options.idpHint != nil {
            additionalParameters.updateValue(options.idpHint!, forKey: "idp_hint")
        }
        if options.deviceDescription != nil {
            additionalParameters.updateValue(options.deviceDescription!, forKey: "metaData.device.description")
        }
        if options.userCode != nil {
            additionalParameters.updateValue(options.userCode!, forKey: "user_code")
        }
        if options.prompt != nil {
            additionalParameters.updateValue(options.prompt!, forKey: "prompt")
        }
        return additionalParameters
    }
}

// MARK: - Configuration

extension OAuthAuthorizationService {
    /// Clears the cached OpenID configuration and token task.
    /// This is called automatically when switching tenants via AuthorizationManager.resetConfiguration().
    /// Calling this directly is optional as a new OAuthAuthorizationService instance is typically created per request.
    internal func clearCache() {
        self.configurationTask = nil
        self.tokenTask = nil
    }

    /// Retrieves the OIDServiceConfiguration from FusionAuth.
    ///
    /// Starts a task to fetch the configuration if it is not already started.
    private func getConfiguration(force: Bool = false) async throws -> OIDServiceConfiguration {
        AuthorizationManager.log?.trace("Retrieving configuration from FusionAuth")

        if !force {
            if let configurationTask {
                return try await configurationTask.value
            }
        }

        let task = Task {
            return try await fetchConfiguration()
        }
        self.configurationTask = task

        return try await withTaskCancellationHandler {
            try await task.value
        } onCancel: {
            task.cancel()
        }
    }

    /// Fetches the OIDServiceConfiguration from FusionAuth using AppAuth
    private func fetchConfiguration() async throws -> OIDServiceConfiguration {
        try await withCheckedThrowingContinuation { continuation in
            guard let baseURL = URL(string: self.fusionAuthUrl) else {
                continuation.resume(throwing: OAuthError.invalidIssuer)
                return
            }

            let issuer: URL
            if let tenantId {
               issuer = baseURL.appendingPathComponent(tenantId)
            } else {
               issuer = baseURL
            }

            OIDAuthorizationService.discoverConfiguration(forIssuer: issuer) { configuration, error in
                if error != nil {
                    continuation.resume(throwing: error!)
                    return
                }

                guard let config = configuration else {
                    continuation.resume(throwing: OAuthError.oIDConfigurationNil)
                    return
                }

                let scheme = config.issuer?.scheme
                if scheme != "http" && scheme != "https" {
                    continuation.resume(throwing: OAuthError.invalidIssuer)
                    return
                }

                continuation.resume(returning: config)
            }
        }
    }
}

// MARK: - Authorization

extension OAuthAuthorizationService {
    /// Authorizes the user using OAuth authorization code flow.
    ///
    /// - Parameter options: The options to configure the OAuth logout request.
    /// - Returns: The OAuth authorization state.
    @discardableResult
    public func authorize(options: OAuthAuthorizeOptions) async throws -> OIDAuthState {
        AuthorizationManager.log?.trace("Starting OAuth authorization...")

        let configuration = try await getConfiguration()

        let request = OIDAuthorizationRequest(configuration: configuration,
                                              clientId: clientId,
                                              scopes: [OIDScopeOpenID, "offline_access"] + self.additionalScopes,
                                              redirectURL: URL(string: options.redirectUri)!,
                                              responseType: OIDResponseTypeCode,
                                              additionalParameters: getParametersFromOptions(options))
        let presenting = self.getPresenting()

        let authState: OIDAuthState = try await withCheckedThrowingContinuation { continuation in
            DispatchQueue.main.async {
                OAuthAuthorizationStore.shared.store(OIDAuthState.authState(byPresenting: request, presenting: presenting) { authState, error in
                    if error != nil {
                        continuation.resume(throwing: error!)
                        return
                    }

                    guard let authorizationState = authState else {
                        continuation.resume(throwing: OAuthError.authStateNil)
                        return
                    }

                    continuation.resume(returning: authorizationState)
                })
            }
        }

        OAuthAuthorizationStore.shared.clear()

        DispatchQueue.main.async {
            do {
                try AuthorizationManager.instance.updateAuthState(authState: authState)
            } catch {
                AuthorizationManager.log?.warning("Unable to update internal state after authorize")
            }
        }

        AuthorizationManager.log?.trace("Finishing OAuth authorization...")

        return authState
    }
}

// MARK: - Logout

extension OAuthAuthorizationService {
    /// Log out the user
    ///
    /// - Parameter options: The options to configure the OAuth logout request.
    public func logout(options: OAuthLogoutOptions) async throws {
        let idToken = AuthorizationManager.instance.getIdToken()

        guard let idToken else {
            throw OAuthError.accessTokenNil
        }

        let configuration = try await getConfiguration()

        let userAgent = try self.getUserAgent()

        let request: OIDEndSessionRequest

        let additionalParameters = [
            "client_id": clientId
        ]

        if options.state == nil || options.state!.isEmpty {
            request = OIDEndSessionRequest(configuration: configuration,
                                           idTokenHint: idToken,
                                           postLogoutRedirectURL: URL(string: options.postLogoutRedirectUri)!,
                                           additionalParameters: additionalParameters)
        } else {
            request = OIDEndSessionRequest(configuration: configuration,
                                           idTokenHint: idToken,
                                           postLogoutRedirectURL: URL(string: options.postLogoutRedirectUri)!,
                                           state: options.state!,
                                           additionalParameters: additionalParameters)
        }

        let _: Bool = try await withCheckedThrowingContinuation { continuation in
            DispatchQueue.main.async {
                self.logoutSession = OIDAuthorizationService.present(request, externalUserAgent: userAgent) { _, error in
                    if error != nil {
                        continuation.resume(throwing: error!)
                        return
                    }

                    continuation.resume(returning: true)
                }
            }
        }

        self.logoutSession = nil

        DispatchQueue.main.async {
            do {
                try AuthorizationManager.instance.clearState()
            } catch {
                AuthorizationManager.log?.warning("Unable to clear internal state after logout")
            }
        }
    }
}

// MARK: - User Info

extension OAuthAuthorizationService {
    /// Retrieves the user information for the authenticated user.
    ///
    /// - Returns: The user information
    /// - Throws: An error if the user information is not found.
    public func userInfo() async throws -> UserInfo {
        let configuration = try await getConfiguration()

        guard let userinfoEndpoint = configuration.discoveryDocument?.userinfoEndpoint else {
            throw OAuthError.userInfoEndpointNotFound
        }

        guard let accessToken = try await freshAccessToken() else {
            throw OAuthError.accessTokenNil
        }

        return try await getUserInfo(userinfoEndpoint: userinfoEndpoint, accessToken: accessToken)
    }

    private func getUserInfo(userinfoEndpoint: URL, accessToken: String) async throws -> UserInfo {
        try await withCheckedThrowingContinuation { continuation in
            var request = URLRequest(url: userinfoEndpoint)
            request.allHTTPHeaderFields = ["Authorization": "Bearer \(accessToken)"]

            URLSession.shared.dataTask(with: request) { data, response, error in
                if let error {
                    continuation.resume(throwing: error)
                }
                guard error == nil else {
                    continuation.resume(throwing: error!)
                    return
                }
                guard let response = response as? HTTPURLResponse else {
                    continuation.resume(throwing: OAuthError.noAuthorizationCode)
                    return
                }
                guard let data else {
                    AuthorizationManager.log?.warning("HTTP response data is empty")
                    return
                }

                if response.statusCode != 200 {
                    AuthorizationManager.log?.warning("HTTP: \(response.statusCode), Response: \(String(bytes: data, encoding: .utf8) ?? "")")

                    continuation.resume(throwing: OAuthError.accessTokenNil)
                    return
                }

                do {
                    let userInfo = try JSONDecoder().decode(UserInfo.self, from: data)
                    continuation.resume(returning: userInfo)
                } catch let jsonError as NSError {
                    AuthorizationManager.log?.warning("JSON decode failed: \(jsonError.localizedDescription)")
                    continuation.resume(throwing: jsonError)
                }
            }.resume()
        }
    }
}

// MARK: - Access Token

extension OAuthAuthorizationService {
    /// Retrieves a fresh access token.
    ///
    /// - Returns: The fresh access token or nil if an error occurs.
    public func freshAccessToken() async throws -> String? {
        AuthorizationManager.log?.trace("Retrieve fresh token from FusionAuth")

        if let tokenTask {
            return try await tokenTask.value
        }

        let task = Task {
            return try await freshAccessTokenInternal()
        }
        self.tokenTask = task

        return try await withTaskCancellationHandler {
            try await task.value
        } onCancel: {
            task.cancel()
        }
    }

    private func freshAccessTokenInternal() async throws -> String {
        let configuration = try await getConfiguration()

        return try await withCheckedThrowingContinuation { continuation in
            guard let refreshToken = AuthorizationManager.instance.getTokenManager().getAuthState()?.refreshToken else {
                continuation.resume(throwing: OAuthError.refreshTokenNil)
                return
            }

            let request = OIDTokenRequest(configuration: configuration,
                                          grantType: OIDGrantTypeRefreshToken,
                                          authorizationCode: nil,
                                          redirectURL: nil,
                                          clientID: clientId,
                                          clientSecret: nil,
                                          scope: nil,
                                          refreshToken: refreshToken,
                                          codeVerifier: nil,
                                          additionalParameters: nil)

            DispatchQueue.main.async {
                OIDAuthorizationService.perform(request) { response, error in
                    if error != nil {
                        continuation.resume(throwing: error!)
                        return
                    }

                    guard let response else {
                        continuation.resume(throwing: OAuthError.refreshTokenNoResponse)
                        return
                    }

                    guard let accessToken = response.accessToken else {
                        continuation.resume(throwing: OAuthError.accessTokenNil)
                        return
                    }

                    do {
                        try AuthorizationManager.instance.updateAuthState(
                            accessToken: accessToken,
                            accessTokenExpirationTime: response.accessTokenExpirationDate!,
                            idToken: response.idToken!,
                            refreshToken: response.refreshToken!
                        )
                    } catch {
                        continuation.resume(throwing: OAuthError.unableToUpdateInternalState)
                    }

                    continuation.resume(returning: response.accessToken!)
                }
            }
        }
    }
}
