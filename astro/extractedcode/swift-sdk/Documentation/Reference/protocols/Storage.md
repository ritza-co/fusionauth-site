**PROTOCOL**

# `Storage`

```swift
public protocol Storage
```

This protocol represents a storage mechanism for storing and retrieving key-value pairs.

## Methods
### `get(key:)`

```swift
func get(key: String) -> String?
```

Retrieves the value associated with the given key from the storage.
- Parameters:
  - key: The key for which to retrieve the value.
- Returns: The value associated with the key, or null if the key is not found in the storage.

#### Parameters

| Name | Description |
| ---- | ----------- |
| key | The key for which to retrieve the value. |

### `set(key:content:)`

```swift
func set(key: String, content: Any)
```

Sets the value associated with the given key in the storage.
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
func remove(key: String)
```

Removes the value associated with the given key from the storage.
- Parameters:
  - key: The key for which to remove the value.

#### Parameters

| Name | Description |
| ---- | ----------- |
| key | The key for which to remove the value. |