> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/swift-sdk). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.


[![Latest Release Tag](https://badgen.net/github/tag/fusionauth/fusionauth-swift-sdk)](https://github.com/FusionAuth/fusionauth-swift-sdk/tags)
[![Dependabot](https://badgen.net/github/dependabot/fusionauth/fusionauth-swift-sdk)](https://github.com/FusionAuth/fusionauth-swift-sdk/network/updates)
[![Open PRs](https://badgen.net/github/open-prs/fusionauth/fusionauth-swift-sdk)](https://github.com/FusionAuth/fusionauth-swift-sdk/pulls)

An SDK for using FusionAuth in iOS Apps.

# Table of Contents

- [Overview](#overview)

- [Getting Started](#getting-started)

- [Usage](#usage)

- [Example App](#example-app)

- [Quickstart](#quickstart)

- [Documentation](#documentation)

- [Contributing](#contributing)

- [Upgrade Policy](#upgrade-policy)

<!--
this and following tags, and the corresponding end tag, are used to delineate what is pulled into the FusionAuth docs site (the client libraries pages). Don't remove unless you also change the docs site.

Please also use ``` instead of indenting for code blocks. The backticks are translated correctly to adoc format.
-->

# Overview
<!--
tag::forDocSiteOverview[]
-->
This SDK allows you to use OAuth 2.0 and OpenId Connect functionality in an iOS app with FusionAuth as the
authorization server. It also provides a Token Manager to store, refresh, and retrieve tokens.

It's a highly standardized and simplified starting point for developers to easily integrate FusionAuth into their own custom mobile apps by taking care of all the dependencies.

Following OAuth 2.0 and OpenID Connect functionality are covered:
- OAuth 2.0 Authorization Code Grant
- OAuth 2.0 Refresh Token Grant
- OpenID Connect UserInfo
- OpenID Connect End Session

[AppAuth-iOS](https://github.com/openid/AppAuth-iOS) is used for the OAuth 2.0 Authorization Code Grant flow and OpenID Connect functionality.

The SDK is written in Swift and compatible with Object-C.
<!--
end::forDocSiteOverview[]
-->

# Getting Started

<!--
tag::forDocSiteGettingStarted[]
-->
To use the FusionAuth iOS SDK, add this repository as a dependency.

By default the SDK uses the `FusionAuth.plist` file in the main bundle to read the configuration. The file should contain the following keys:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>additionalScopes</key>
    <array>
        <string>profile</string>
        <string>email</string>
    </array>
    <key>fusionAuthUrl</key>
    <string>http://localhost:9011</string>
    <key>clientId</key>
    <string>e9fdb985-9173-4e01-9d73-ac2d60d1dc8e</string>
</dict>
</plist>
```

Then, initialize the AuthorizationManager in the `init` func of your app:

```swift
@main
struct QuickstartApp: App {
    init() {
        AuthorizationManager.instance.initialize()
    }
}
```

By default, the SDK uses the `MemoryStorage for storing tokens. You can use one of the other available mechanisms `KeyChainStorage`or `UserDefaultsStorage` by e.g. adding the `storage` key with the value `keychain` or `userdefaults`.

As a alternative, you can also use the `initialize` function to provide the configuration:

```swift
@main
struct QuickstartApp: App {
    init() {
        AuthorizationManager.instance.initialize(configuration: AuthorizationConfiguration(
            clientId: "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e",
            fusionAuthUrl: "http://localhost:9011",
            additionalScopes: ["email", "profile"]))
    }
}
```

Finally, instruct the app to handle the callback from the browser:

```swift
@main
struct QuickstartApp: App {
    init() {
        AuthorizationManager.instance.initialize()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    OAuthAuthorization.resume(with: url)
                }
        }
    }
}
```

<!--
end::forDocSiteGettingStarted[]
-->

# Usage

<!--
tag::forDocSiteUsage[]
-->
To start the OAuth 2.0 Authorization Code Grant, you can use the `oauth()` function on the `AuthorizationManager` to
retrieve the `OAuthAuthorizationService`:

```swift
do {
    try await AuthorizationManager
        .oauth()
        .authorize(options: OAuthAuthorizeOptions())
} catch let error as NSError {
    print("Error: \(error.localizedDescription)")
}
```

The `authorize` method will open the Safari browser and redirect to the FusionAuth login page. After successful login, the user will be redirected back to the app with the authorization code. The SDK will exchange the authorization code for an access token and refresh token.

This will retrieve the authorization response, validates the `state` if it was provided, and exchanges the authorization
code for an access token.
The result of the exchange will be stored in the `TokenManager`.

After the user is authorized, you can use `getUserInfo()` to retrieve the [User Info](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo):

```swift
do {
    self.userInfo = try await AuthorizationManager
        .oauth()
        .userInfo()
} catch let error as NSError {
    print("JSON decode failed: \(error.localizedDescription)")
}
```

To call your API with an access token, you can use the `AuthorizationManager` to retrieve a valid access token:

```swift
let accessToken = AuthorizationManager.oauth().freshAccessToken()
```

This will retrieve a fresh access token from the `TokenManager` and return it. If the access token is expired,
the `TokenManager` will refresh it automatically.

Finally, you can use the `AuthorizationManager` to sign out the user and remove the tokens from the `TokenManager`:

```swift
do {
    try await AuthorizationManager
        .oauth()
        .logout(options: OAuthLogoutOptions())
} catch let error as NSError {
    print("Error: \(error.localizedDescription)")
}
```

If the user is signed out, the auth state will be cleared.
<!--
end::forDocSiteUsage[]
-->

# Example App

<!--
tag::forDocSiteExampleApp[]
-->
See the [FusionAuth iOS SDK Example](https://github.com/FusionAuth/fusionauth-quickstart-swift-ios-native) for a functional example of an iOS client that uses the SDK.
<!--
end::forDocSiteExampleApp[]
-->

# Quickstart

<!--
tag::forDocSiteQuickstart[]
-->
See the [FusionAuth iOS Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-swift-ios-native/) for a full tutorial on using FusionAuth and iOS.
<!--
end::forDocSiteQuickstart[]
-->

# Documentation

<!--
tag::forDocSiteDocumentation[]
-->
See the latest [Full library documentation](https://github.com/FusionAuth/fusionauth-swift-sdk/blob/main/Documentation/Reference/README.md) for the complete documentation of the SDK.
<!--
end::forDocSiteDocumentation[]
-->

# Contributing
<!--
tag::forDocSiteContributing[]
-->
We hope you love using FusionAuth Swift SDK, but in case you encounter a bug or an issue with the SDK, please do let us know.

Please follow the detailed [Contributing](CONTRIBUTING.md) documentation.
<!--
end::forDocSiteContributing[]
-->

# Upgrade Policy

This library may periodically receive updates with bug fixes, security patches, tests, code samples, or documentation changes.

These releases may also update dependencies, language engines, and operating systems, as we\'ll follow the deprecation and sunsetting policies of the underlying technologies that the libraries use.

This means that after a dependency (e.g. language, framework, or operating system) is deprecated by its maintainer, this library will also be deprecated by us, and may eventually be updated to use a newer version.
