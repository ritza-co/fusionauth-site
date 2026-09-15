/// Represents the user information retrieved from the authorization service.
///
/// More Information about the user info can be found in the [FusionAuth documentation](https://fusionauth.io/docs/lifecycle/authenticate-users/oauth/endpoints#userinfo)
public struct UserInfo: Codable {
    // swiftlint:disable identifier_name
    /// The ID of the application.
    public var applicationId: String?
    /// The user's birthdate.
    public var birthdate: String?
    /// The user's email address.
    public var email: String?
    /// Indicates if the user's email address has been verified.
    public var email_verified: Bool?
    /// The user's family name.
    public var family_name: String?
    /// The user's given name.
    public var given_name: String?
    /// The user's full name.
    public var name: String?
    /// The user's middle name.
    public var middle_name: String?
    /// The user's phone number.
    public var phone_number: String?
    /// The URL of the user's profile picture.
    public var picture: String?
    /// The user's preferred username.
    public var preferred_username: String?
    /// The roles the user is assigned to.
    public var roles: [String]?
    /// The subject identifier of the user.
    public var sub: String?
    // swiftlint:enable identifier_name
}
