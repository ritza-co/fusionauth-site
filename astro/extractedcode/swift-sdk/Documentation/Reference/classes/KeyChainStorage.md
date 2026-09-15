**CLASS**

# `KeyChainStorage`

```swift
public class KeyChainStorage: Storage
```

Implemenation of the `Storage` protocol that uses the iOS KeyChain to store and retrieve sensitive data.
- Note: The KeyChain is a secure storage mechanism that is used to store sensitive data such as passwords, keys, and certificates.

## Methods
### `init()`

```swift
public init()
```

### `get(key:)`

```swift
public func get(key: String) -> String?
```

Retrieves the value associated with the given key from the KeyChain.
- Parameters:
  - key: The key for which to retrieve the value.
- Returns: The value associated with the key, or null if the key is not found in the KeyChain.
- Note: This method retrieves the value associated with the given key from the KeyChain and returns it as a string.

#### Parameters

| Name | Description |
| ---- | ----------- |
| key | The key for which to retrieve the value. |

### `set(key:content:)`

```swift
public func set(key: String, content: Any)
```

Sets the value associated with the given key in the KeyChain.
- Parameters:
  - key: The key for which to set the value.
  - content: The value to be set for the key.

#### Parameters

| Name | Description |
| ---- | ----------- |
| key | The key for which to set the value. |
| content | The value to be set for the key. |

### `remove(key:)`

```swift
public func remove(key: String)
```

Removes the value associated with the given key from the KeyChain.
- Parameters:
  - key: The key for which to remove the value.

#### Parameters

| Name | Description |
| ---- | ----------- |
| key | The key for which to remove the value. |