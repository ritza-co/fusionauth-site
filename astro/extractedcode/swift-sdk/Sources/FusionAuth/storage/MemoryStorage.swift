/// Implementation of the Storage protocol that stores data in memory.
/// - Note: This implementation is useful for testing and development purposes, as it does not persist data across app launches.
public class MemoryStorage: Storage {
    public init() {}

    private var storageDictionary: [String: Any] = [:]

    /// Retrieves the value associated with the given key from the storage.
    /// - Parameters:
    ///   - key: The key for which to retrieve the value.
    /// - Returns: The value associated with the key, or null if the key is not found in the storage.
    /// - Note: This method retrieves the value associated with the given key from the storage and returns it as a string.
    public func get(key: String) -> String? {
        if let value = storageDictionary[key] {
            return String(describing: value)
        }
        return nil
    }

    /// Sets the value associated with the given key in the storage.
    /// - Parameters:
    ///   - key: The key for which to set the value.
    ///   - content: The value to be set for the key.
    public func set(key: String, content: Any) {
        self.storageDictionary[key] = content
    }

    /// Removes the value associated with the given key from the storage.
    /// - Parameters:
    ///   - key: The key for which to remove the value.
    public func remove(key: String) {
        storageDictionary.removeValue(forKey: key)
    }
}
