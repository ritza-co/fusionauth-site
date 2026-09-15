/// Represents an ID token.
///
/// More Information about the user info can be found in the [FusionAuth documentation](https://fusionauth.io/docs/lifecycle/authenticate-users/oauth/tokens#id-token)
public struct IdToken: Codable {
    // swiftlint:disable identifier_name
    /// The access token hash.
    var at_hash: String?
    /// The audience.
    var aud: String?
    /// The authentication type.
    var authenticationType: String?
    /// The authentication time.
    var auth_time: Int64?
    /// The code hash.
    var c_hash: String?
    /// The user's email address.
    var email: String?
    /// Indicates whether the user's email address has been verified.
    var email_verified: Bool?
    /// The expiration time.
    var exp: Int64?
    /// The issued at time.
    var iat: Int64?
    /// The issuer.
    var iss: String?
    /// The JSON token identifier.
    var jti: String?
    /// The nonce.
    var nonce: String?
    /// The preferred username.
    var preferred_username: String?
    ///
    var scope: String?
    /// The session identifier.
    var sid: String?
    /// The subject identifier.
    var sub: String?
    /// The tenant identifier.
    var tid: String?
    // swiftlint:enable identifier_name
}
