**CLASS**

# `AuthorizationManager`

```swift
public class AuthorizationManager
```

AuthorizationManager is a singleton object that manages the authorization state of the user.
It provides methods to initialize the authorization manager, check if the user is authenticated,
retrieve access tokens, refresh access tokens, and clear the authorization state.

AuthorizationManager uses a TokenManager to manage the access tokens and a Storage implementation
to store the authorization state.

## Properties
### `instance`

```swift
public static let instance = AuthorizationManager()
```

The shared instance of the AuthorizationManager

## Methods
### `initialize(configuration:storage:)`

```swift
@discardableResult public func initialize(configuration: AuthorizationConfiguration, storage: Storage? = nil) -> Self
```

Initialize the AuthorizationManager with the given configuration

### `getTokenManager()`

```swift
public func getTokenManager() -> TokenManager
```

Returns the current TokenManager

### `freshAccessToken(force:)`

```swift
public func freshAccessToken(force: Bool = false) async throws -> String?
```

Returns a fresh access token

If the access token is not expired, it will be returned immediately.
If the access token is expired or force is `true`, a new access token will be fetched using the refresh token.

### `getAccessToken()`

```swift
public func getAccessToken() -> String?
```

Retrieves the access token, if available

### `getAccessTokenExpirationTime()`

```swift
public func getAccessTokenExpirationTime() -> Date?
```

Retrieves the access token expiration, if available

### `isAccessTokenExpired()`

```swift
public func isAccessTokenExpired() -> Bool
```

Checks if the stored access token is expired.

### `getIdToken()`

```swift
public func getIdToken() -> String?
```

Retrieves the ID token, if available

### `clearAllState()`

```swift
public func clearAllState() throws
```

Clears all authorization state and configuration.
This method should be called when switching between different FusionAuth instances or when performing a logout.
It clears both the stored authentication tokens and resets the configuration.

### `getConfiguration()`

```swift
public func getConfiguration() -> AuthorizationConfiguration?
```

Retrieves the current authorization configuration.
- Returns: The current AuthorizationConfiguration, or nil if not initialized.

### `resetConfiguration(configuration:storage:)`

```swift
@discardableResult public func resetConfiguration(configuration: AuthorizationConfiguration, storage: Storage? = nil) throws -> Self
```

Updates the configuration and clears tokens for a fresh authentication with a new tenant.
This method combines configuration update with state clearing, making it ideal for tenant switching.
It automatically clears existing authentication state before applying the new configuration.

- Parameter configuration: The new AuthorizationConfiguration to apply.
- Parameter storage: Optional custom storage implementation. If not provided, existing storage is preserved.
- Returns: Self for method chaining.

#### Parameters

| Name | Description |
| ---- | ----------- |
| configuration | The new AuthorizationConfiguration to apply. |
| storage | Optional custom storage implementation. If not provided, existing storage is preserved. |