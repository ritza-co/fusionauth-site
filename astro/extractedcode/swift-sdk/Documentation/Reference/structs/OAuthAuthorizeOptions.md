**STRUCT**

# `OAuthAuthorizeOptions`

```swift
public struct OAuthAuthorizeOptions
```

OAuthAuthorizeOptions is a data class that represents the options for the OAuth authorize request.

See [FusionAuth OAuth 2.0 Authorization Endpoint](https://fusionauth.io/docs/lifecycle/authenticate-users/oauth/endpoints#authorize)
for more information.

## Methods
### `init(bundleId:redirectUriSuffix:idpHint:loginHint:deviceDescription:nonce:state:userCode:prompt:)`

```swift
public init(
    bundleId: String = Bundle.main.bundleIdentifier ?? "",
    redirectUriSuffix: String = ":/oauth2redirect/ios-provider",
    idpHint: String? = nil,
    loginHint: String? = nil,
    deviceDescription: String? = nil,
    nonce: String? = nil,
    state: String? = nil,
    userCode: String? = nil,
    prompt: String? = nil
)
```

Creates a new instance of OAuthAuthorizeOptions.
