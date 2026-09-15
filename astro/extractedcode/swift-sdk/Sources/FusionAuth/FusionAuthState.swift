import Foundation

/// FusionAuthState represents the authorization state data.
public struct FusionAuthState: Codable {
    public let accessToken: String
    public let accessTokenExpirationTime: Date
    public let idToken: String
    public let refreshToken: String
}
