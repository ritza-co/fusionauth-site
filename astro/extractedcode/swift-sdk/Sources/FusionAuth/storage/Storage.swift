/// This protocol represents a storage mechanism for storing and retrieving key-value pairs.
public protocol Storage {
    /// Retrieves the value associated with the given key from the storage.
    /// - Parameters:
    ///   - key: The key for which to retrieve the value.
    /// - Returns: The value associated with the key, or null if the key is not found in the storage.
    func get(key: String) -> String?

    /// Sets the value associated with the given key in the storage.
    /// - Parameters:
    ///   - key: The key for which to set the value.
    ///   - content: The value to be set for the key.
    func set(key: String, content: Any)

    /// Removes the value associated with the given key from the storage.
    /// - Parameters:
    ///   - key: The key for which to remove the value.
    func remove(key: String)
}
