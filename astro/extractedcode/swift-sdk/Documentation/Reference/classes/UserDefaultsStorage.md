**CLASS**

# `UserDefaultsStorage`

```swift
public class UserDefaultsStorage: Storage
```

Implemenation of the `Storage` protocol that uses UserDefaults to store and retrieve data.
- Note: UserDefaults is a simple interface for storing key-value pairs persistently across app launches.

## Methods
### `init()`

```swift
public init()
```

### `get(key:)`

```swift
public func get(key: String) -> String?
```

Retrieves the value associated with the given key from UserDefaults.
- Parameters:
  - key: The key for which to retrieve the value.
- Returns: The value associated with the key, or null if the key is not found in UserDefaults.
- Note: This method retrieves the value associated with the given key from UserDefaults and returns it as a string.

#### Parameters

| Name | Description |
| ---- | ----------- |
| key | The key for which to retrieve the value. |

### `set(key:content:)`

```swift
public func set(key: String, content: Any)
```

Sets the value associated with the given key in UserDefaults.
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

Removes the value associated with the given key from UserDefaults.
- Parameters:
  - key: The key for which to remove the value.

#### Parameters

| Name | Description |
| ---- | ----------- |
| key | The key for which to remove the value. |