import Foundation
import Security

/// Implemenation of the `Storage` protocol that uses the iOS KeyChain to store and retrieve sensitive data.
/// - Note: The KeyChain is a secure storage mechanism that is used to store sensitive data such as passwords, keys, and certificates.
public class KeyChainStorage: Storage {
    public init() {}

    /// Retrieves the value associated with the given key from the KeyChain.
    /// - Parameters:
    ///   - key: The key for which to retrieve the value.
    /// - Returns: The value associated with the key, or null if the key is not found in the KeyChain.
    /// - Note: This method retrieves the value associated with the given key from the KeyChain and returns it as a string.
    public func get(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: kCFBooleanTrue!,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)

        if status == noErr {
            if let data = dataTypeRef as? Data {
                return String(data: data, encoding: .utf8)
            }
        }

        return nil
    }

    /// Sets the value associated with the given key in the KeyChain.
    /// - Parameters:
    ///   - key: The key for which to set the value.
    ///   - content: The value to be set for the key.
    public func set(key: String, content: Any) {
        if get(key: key) != nil {
            remove(key: key)
        }

        let data = String(describing: content).data(using: .utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data!
        ]

        SecItemAdd(query as CFDictionary, nil)
    }

    /// Removes the value associated with the given key from the KeyChain.
    /// - Parameters:
    ///   - key: The key for which to remove the value.
    public func remove(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]

        SecItemDelete(query as CFDictionary)
    }
}
