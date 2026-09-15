import Foundation

/// OAuthAuthorizeOptions is a data class that represents the options for the OAuth authorize request.
///
/// See [FusionAuth OAuth 2.0 Authorization Endpoint](https://fusionauth.io/docs/lifecycle/authenticate-users/oauth/endpoints#authorize)
/// for more information.
public struct OAuthAuthorizeOptions {
    /// The Bundle Identifier used for the redirect URI
    private let bundleId: String
    /// The redirect URI suffix for comprising the redirect URI
    private let redirectUriSuffix: String
    /// The redirect URI to be used for the OAuth authorize request.
    /// Default is Bundle.main.bundleIdentifier + ":/oauth2redirect/ios-provider".
    /// Which is a combination of bundleId and postLogoutRedirectUriSuffix
    let redirectUri: String
    /// The identity provider hint to be used for the OAuth authorize request.
    let idpHint: String?
    /// An optional email address or top level domain that can allow you to bypass the FusionAuth login
    /// page when using managed domains.
    let loginHint: String?
    /// An optional human-readable description of the device used during login.
    let deviceDescription: String?
    /// When this parameter is provided during the Authorization request, the value will be returned in the id_token.
    let nonce: String?
    /// An opaque value used by the client to maintain state between the request and callback.
    /// The authorization server includes this value when redirecting the user-agent back to the client.
    let state: String?
    /// The end-user verification code.
    let userCode: String?
    /// The prompt parameter to be used for the OAuth authorize request.
    /// Controls whether the Authorization Server prompts the End-User for reauthentication and consent.
    /// See [OIDC prompt parameter](https://fusionauth.io/docs/lifecycle/authenticate-users/oauth/prompt)
    /// for more information.
    let prompt: String?

    /// Creates a new instance of OAuthAuthorizeOptions.
    public init(
        bundleId: String = Bundle.main.bundleIdentifier ?? "",
        redirectUriSuffix: String = ":/oauth2redirect/ios-provider",
        idpHint: String? = nil,
        loginHint: String? = nil,
        deviceDescription: String? = nil,
        nonce: String? = nil,
        state: String? = nil,
        userCode: String? = nil,
        prompt: String? = nil
    ) {
        self.redirectUriSuffix = redirectUriSuffix
        self.bundleId = bundleId
        self.redirectUri = bundleId + redirectUriSuffix
        self.idpHint = idpHint
        self.loginHint = loginHint
        self.deviceDescription = deviceDescription
        self.nonce = nonce
        self.state = state
        self.userCode = userCode
        self.prompt = prompt
    }
}
