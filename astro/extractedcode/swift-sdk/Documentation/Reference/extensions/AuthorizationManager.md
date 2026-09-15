**EXTENSION**

# `AuthorizationManager`
```swift
extension AuthorizationManager
```

## Properties
### `eventPublisher`

```swift
public var eventPublisher: AnyPublisher<FusionAuthState?, Never>
```

A publisher that emits the current FusionAuthState whenever it changes

### `log`

```swift
public static var log: Logger?
```

The logger for the FusionAuth Mobile SDK

## Methods
### `initialize(bundle:storage:)`

```swift
@discardableResult public func initialize(bundle: Bundle = Bundle.main, storage: Storage? = nil) -> Self
```

Initialize the AuthorizationManager with the given bundle

### `oauth()`

```swift
public static func oauth() throws -> OAuthAuthorizationService
```

Returns an instance of the OAuthAuthorizationService, configured with the current configuration

### `oauth()`

```swift
public func oauth() throws -> OAuthAuthorizationService
```

Returns an instance of the OAuthAuthorizationService, configured with the current configuration

### `setLogLevel(_:)`

```swift
public static func setLogLevel(_ level: OSLogType)
```

Set the log level for the AuthorizationManager
