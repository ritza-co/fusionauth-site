**STRUCT**

# `AuthorizationConfiguration`

```swift
public struct AuthorizationConfiguration
```

AuthorizationConfiguration is a struct that represents the configuration for authorization.

## Properties
### `clientId`

```swift
public let clientId: String
```

The client ID used for authorization.

### `fusionAuthUrl`

```swift
public let fusionAuthUrl: String
```

The URL of the FusionAuth server.

### `tenant`

```swift
public let tenant: String?
```

The tenant ID for the FusionAuth server. (Optional)

### `additionalScopes`

```swift
public let additionalScopes: [String]
```

Additional scopes to be requested during authorization. Default is empty.

### `locale`

```swift
public let locale: String?
```

The locale to be used for authorization. (Optional)

## Methods
### `init(clientId:fusionAuthUrl:tenant:additionalScopes:locale:)`

```swift
public init(clientId: String, fusionAuthUrl: String, tenant: String? = nil, additionalScopes: [String] = [], locale: String? = nil)
```

Creates a new instance of AuthorizationConfiguration.
