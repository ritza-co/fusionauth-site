import Foundation

/// OAuthLogoutOptions is a data class that represents the options for the OAuth logout request.
///
/// See [FusionAuth OAuth 2.0 Authorization Endpoint](https://fusionauth.io/docs/lifecycle/authenticate-users/oauth/endpoints#logout)
/// for more information.
public struct OAuthLogoutOptions {
    /// The Bundle Identifier used for comprising the redirect URI
    private let bundleId: String
    /// The post logout redirect URI suffix for comprising the redirect URI
    private let postLogoutRedirectUriSuffix: String
    /// The post logout redirect URI to be used for the OAuth logout request.
    /// Default is Bundle.main.bundleIdentifier + ":/oauth2redirect/ios-provider".
    /// Which is a combination of bundleId and postLogoutRedirectUriSuffix
    let postLogoutRedirectUri: String
    /// An opaque value used by the client to maintain state between the request and callback.
    /// The authorization server includes this value when redirecting the user-agent back to the client.
    let state: String?

    /// Creates a new instance of OAuthLogoutOptions.
    public init(
        bundleId: String = Bundle.main.bundleIdentifier ?? "",
        postLogoutRedirectUriSuffix: String = ":/oauth2redirect/ios-provider",
        state: String? = nil
    ) {
        self.bundleId = bundleId
        self.postLogoutRedirectUriSuffix = postLogoutRedirectUriSuffix
        self.postLogoutRedirectUri = bundleId + postLogoutRedirectUriSuffix
        self.state = state
    }
}
