**STRUCT**

# `UserInfo`

```swift
public struct UserInfo: Codable
```

Represents the user information retrieved from the authorization service.

More Information about the user info can be found in the [FusionAuth documentation](https://fusionauth.io/docs/lifecycle/authenticate-users/oauth/endpoints#userinfo)

## Properties
### `applicationId`

```swift
public var applicationId: String?
```

The ID of the application.

### `birthdate`

```swift
public var birthdate: String?
```

The user's birthdate.

### `email`

```swift
public var email: String?
```

The user's email address.

### `email_verified`

```swift
public var email_verified: Bool?
```

Indicates if the user's email address has been verified.

### `family_name`

```swift
public var family_name: String?
```

The user's family name.

### `given_name`

```swift
public var given_name: String?
```

The user's given name.

### `name`

```swift
public var name: String?
```

The user's full name.

### `middle_name`

```swift
public var middle_name: String?
```

The user's middle name.

### `phone_number`

```swift
public var phone_number: String?
```

The user's phone number.

### `picture`

```swift
public var picture: String?
```

The URL of the user's profile picture.

### `preferred_username`

```swift
public var preferred_username: String?
```

The user's preferred username.

### `roles`

```swift
public var roles: [String]?
```

The roles the user is assigned to.

### `sub`

```swift
public var sub: String?
```

The subject identifier of the user.
