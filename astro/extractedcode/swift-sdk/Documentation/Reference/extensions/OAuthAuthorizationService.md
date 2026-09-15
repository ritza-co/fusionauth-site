**EXTENSION**

# `OAuthAuthorizationService`
```swift
extension OAuthAuthorizationService
```

## Methods
### `authorize(options:)`

```swift
public func authorize(options: OAuthAuthorizeOptions) async throws -> OIDAuthState
```

Authorizes the user using OAuth authorization code flow.

- Parameter options: The options to configure the OAuth logout request.
- Returns: The OAuth authorization state.

#### Parameters

| Name | Description |
| ---- | ----------- |
| options | The options to configure the OAuth logout request. |

### `logout(options:)`

```swift
public func logout(options: OAuthLogoutOptions) async throws
```

Log out the user

- Parameter options: The options to configure the OAuth logout request.

#### Parameters

| Name | Description |
| ---- | ----------- |
| options | The options to configure the OAuth logout request. |

### `userInfo()`

```swift
public func userInfo() async throws -> UserInfo
```

Retrieves the user information for the authenticated user.

- Returns: The user information
- Throws: An error if the user information is not found.

### `freshAccessToken()`

```swift
public func freshAccessToken() async throws -> String?
```

Retrieves a fresh access token.

- Returns: The fresh access token or nil if an error occurs.
