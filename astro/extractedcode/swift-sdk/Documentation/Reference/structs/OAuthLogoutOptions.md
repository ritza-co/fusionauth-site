**STRUCT**

# `OAuthLogoutOptions`

```swift
public struct OAuthLogoutOptions
```

OAuthLogoutOptions is a data class that represents the options for the OAuth logout request.

See [FusionAuth OAuth 2.0 Authorization Endpoint](https://fusionauth.io/docs/lifecycle/authenticate-users/oauth/endpoints#logout)
for more information.

## Methods
### `init(bundleId:postLogoutRedirectUriSuffix:state:)`

```swift
public init(
    bundleId: String = Bundle.main.bundleIdentifier ?? "",
    postLogoutRedirectUriSuffix: String = ":/oauth2redirect/ios-provider",
    state: String? = nil
)
```

Creates a new instance of OAuthLogoutOptions.
