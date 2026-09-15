import Foundation

/// AuthorizationConfiguration is a struct that represents the configuration for authorization.
public struct AuthorizationConfiguration {
    /// The client ID used for authorization.
    public let clientId: String
    /// The URL of the FusionAuth server.
    public let fusionAuthUrl: String
    /// The tenant ID for the FusionAuth server. (Optional)
    public let tenant: String?
    /// Additional scopes to be requested during authorization. Default is empty.
    public let additionalScopes: [String]
    /// The locale to be used for authorization. (Optional)
    public let locale: String?

    /// Creates a new instance of AuthorizationConfiguration.
    public init(clientId: String, fusionAuthUrl: String, tenant: String? = nil, additionalScopes: [String] = [], locale: String? = nil) {
        self.clientId = clientId
        self.fusionAuthUrl = fusionAuthUrl
        self.tenant = tenant
        self.additionalScopes = additionalScopes
        self.locale = locale
    }
}

extension AuthorizationConfiguration {
    private static func loadPlistPreferences(_ bundle: Bundle) -> AuthorizationPreferences? {
        guard let path = bundle.path(forResource: "FusionAuth", ofType: "plist") else {
            return nil
        }

        guard let data = try? Data(contentsOf: URL(fileURLWithPath: path)) else {
            return nil
        }

        let decoder = PropertyListDecoder()
        return try? decoder.decode(AuthorizationPreferences.self, from: data)
    }

    /// Creates an instance of AuthorizationConfiguration from a plist file.
    public static func fromPlist(_ bundle: Bundle = Bundle.main) -> AuthorizationConfiguration? {
        guard let preferences = loadPlistPreferences(bundle) else {
            return nil
        }

        return AuthorizationConfiguration(
            clientId: preferences.clientId,
            fusionAuthUrl: preferences.fusionAuthUrl,
            tenant: preferences.tenant,
            additionalScopes: preferences.additionalScopes ?? [],
            locale: preferences.locale
        )
    }

    /// Returns the storage type from the plist file.
    public static func getStorageFromPlist(_ bundle: Bundle = Bundle.main) -> Storage? {
        guard let storage = loadPlistPreferences(bundle)?.storage else {
            return nil
        }

        switch storage {
        case "keychain":
            return KeyChainStorage()
        case "userdefaults":
            return UserDefaultsStorage()
        default:
            return MemoryStorage()
        }
    }
}

struct AuthorizationPreferences: Codable {
    let clientId: String
    let fusionAuthUrl: String
    let tenant: String?
    let additionalScopes: [String]?
    let locale: String?
    let storage: String?
}
