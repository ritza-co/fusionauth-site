**EXTENSION**

# `AuthorizationConfiguration`
```swift
extension AuthorizationConfiguration
```

## Methods
### `fromPlist(_:)`

```swift
public static func fromPlist(_ bundle: Bundle = Bundle.main) -> AuthorizationConfiguration?
```

Creates an instance of AuthorizationConfiguration from a plist file.

### `getStorageFromPlist(_:)`

```swift
public static func getStorageFromPlist(_ bundle: Bundle = Bundle.main) -> Storage?
```

Returns the storage type from the plist file.
