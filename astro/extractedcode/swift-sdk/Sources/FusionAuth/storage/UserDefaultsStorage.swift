import Foundation

/// Implemenation of the `Storage` protocol that uses UserDefaults to store and retrieve data.
/// - Note: UserDefaults is a simple interface for storing key-value pairs persistently across app launches.
public class UserDefaultsStorage: Storage {
    public init() {}

    /// Retrieves the value associated with the given key from UserDefaults.
    /// - Parameters:
    ///   - key: The key for which to retrieve the value.
    /// - Returns: The value associated with the key, or null if the key is not found in UserDefaults.
    /// - Note: This method retrieves the value associated with the given key from UserDefaults and returns it as a string.
    public func get(key: String) -> String? {
        UserDefaults.standard.string(forKey: key)
    }

    /// Sets the value associated with the given key in UserDefaults.
    /// - Parameters:
    ///   - key: The key for which to set the value.
    ///   - content: The value to be set for the key.
    public func set(key: String, content: Any) {
        UserDefaults.standard.setValue(content, forKey: key)
    }

    /// Removes the value associated with the given key from UserDefaults.
    /// - Parameters:
    ///   - key: The key for which to remove the value.
    public func remove(key: String) {
        UserDefaults.standard.removeObject(forKey: key)
    }
}
