**CLASS**

# `FusionAuthStateObject`

```swift
public class FusionAuthStateObject: ObservableObject
```

FusionAuthStateObject is an observable object that manages the authorization state.
It listens for changes in the authorization state and updates its published property accordingly.

## Properties
### `authState`

```swift
@Published public var authState: FusionAuthState?
```

The current authorization state.

### `currentConfigurationName`

```swift
@Published public var currentConfigurationName: String = "Primary"
```

The current active configuration name (for display purposes)

## Methods
### `init()`

```swift
public init()
```

Initializes a new instance of FusionAuthStateObject.

### `isLoggedIn()`

```swift
public func isLoggedIn() -> Bool
```

Checks if the user is currently logged in.
- Returns: A boolean value indicating whether the user is logged in.

### `getCurrentConfigurationDescription()`

```swift
@MainActor public func getCurrentConfigurationDescription() -> String
```

Gets the description of the current configuration
- Returns: A string describing the current configuration
