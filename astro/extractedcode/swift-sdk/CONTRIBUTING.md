# Contributing
<!--
tag::forDocSiteContributing[]
-->
We hope you love using FusionAuth iOS SDK, but in case you encounter a bug or an issue with the SDK, please do let us know.

Please only report issues for the FusionAuth iOS SDK itself if you have an issue with documentation or a client library follow [these instructions.](https://github.com/FusionAuth/fusionauth-issues)

## Community Guidelines

As part of the FusionAuth community, please abide by [the Code of Conduct](https://fusionauth.io/community/forum/topic/1000/code-of-conduct).

## Reporting an Issue

Before reporting an issue, please search through the already open issues to see if you could contribute.

To report an issue, please follow the instructions of the bug, feature and general issue templates.

## Contributing Features and Fixes

Before starting with contributing, you'll want to look at and choose an issue to work on. Here is a basic workflow you want to work from:

1. Search the issue tracker for an issue that you want to work on. If your issue does not exist, please create a new one.
2. Search GitHub for an open or closed Pull Request that relates to the issue you want to work on. You may find that someone else is already working on it, or that the issue is already resolved in a different branch.

You can find all the open issues [here](https://github.com/FusionAuth/fusionauth-swift-sdk/issues).

Once you have found an issue you want to work on, we suggest to:

1. Fork the repository to your personal account.
2. Create a new branch with the name fix/issue-id or feat/issue-id.
3. And start working on that branch on the issue.

## Development

This SDK was developed with [Xcode](https://developer.apple.com/xcode/).

Checking out this repository will provide you with the full development environment including a fully functional example application with a FusionAuth runtime.

To open the project in Xcode, navigate to the [FusionAuthSDK.xcworkspace](FusionAuthSDK.xcworkspace) workspace and open it.

### Library

The SDK is located in [Sources/](Sources) the docs in [Documentation/](Documentation) and tests in [Tests/](Tests) as well as [Samples/Quickstart/QuickstartTests/](Samples/Quickstart/QuickstartTests).

### App

To use the functionality of the SDK in [Sources/](Sources) we load it in to the [Samples/Quickstart/](Samples/Quickstart) which you can start within Xcode by running the fusionauth-quickstart-swift-ios-native scheme as long you have the [FusionAuthSDK.xcworkspace](FusionAuthSDK.xcworkspace) workspace loaded.

To run the App we suggest to use the latest simulator as a run destination or the defined simulator in the [automated end to end tests](.github/workflows).

### FusionAuth

The [Samples/Quickstart/](Samples/Quickstart) is using FusionAuth for the different use cases (e.g. login, logout) and is preconfigured to work with the [Samples/Quickstart/fusionauth/](Samples/Quickstart/fusionauth) located versions.

We suggest to use the following commands to switch between the different versions.

* Create: `docker compose up -d` to start fusionauth in the background.
* Logs: `docker compose logs app` it will take a moment until the kickstart is initialized.
* Destroy: `docker compose down -v` we destroy the volumes because we always want a fresh install.

### Development Tooling

During development of new features and fixes, we suggest using the following code quality tools which are preconfigured for this project:

#### Xcode

The minimum tested version of Xcode is 14 the project is specified for 13.

It is important that these and other project minimum requirements are not accidentaly updated by the use of a newer Xcode version so earlier builds start failing. So before commiting changes please review the project file changes in detail e.g. for a version increas for objectVersion, IPHONEOS_DEPLOYMENT_TARGET, version and others.

#### SourceDocs

To generate documentation for the project.

Installation: `brew install sourcedocs`

Generate Documentation: `sourcedocs generate -- -scheme FusionAuth`

#### SwiftLint

To enforce Swift style and conventions.

Installation: `brew install swiftlint`

Run SwiftLint: `swiftlint`

## Submitting a Pull Request

When you are ready to submit your pull request, visit the main repository on GitHub and click the "Compare & pull request" button. Here you can select the branch you have been working on and create a pull request.

If you're creating a pull request for an issue, please include `Closes #XXX` in the message body where `#XXX` is the issue you're fixing. For example, `Closes #42` would close issue #42.

After you have submitted your pull request, several checks will be run to ensure the changes meet the project's guidelines. If they do, the pull request will be reviewed by a maintainer and subsequently merged.
<!--
end::forDocSiteContributing[]
-->

# Release
<!--
tag::forDocSiteRelease[]
-->
The release proceeds through three sequential steps: [Pre-Release Process](#pre-release-process), [Release Process](#release-process) and [Quickstart Release Process](#quickstart-release-process). Where [Pre-Release Process](#pre-release-process) gets repeated untill a stable release is possible.

## Pre-Release Process

The pre-release process is as follows:
- Check if the latest FusionAuth version is used in the different jobs and configurations.
- Review, test and merge any open [Dependency Pull Requests](https://github.com/FusionAuth/fusionauth-swift-sdk/pulls).
- Update the documentation with `sourcedocs generate -- -scheme FusionAuth`.
- Make sure all Workflows where successful in [Actions](https://github.com/FusionAuth/fusionauth-swift-sdk/actions).
- Update the [SECURITY.md](SECURITY.md) version information with the latest `Supported Versions` according to the current specification E2E test workflows and prerelease PR.
- Make sure all Prerelease-Workflows were successful in [Actions](https://github.com/FusionAuth/fusionauth-swift-sdk/actions).
- Approve and merge the prerelease PR with the rc tag (prerelease candidate) once all actions run successfully.


## Release Process

The release process is as follows:
- Check if a prerelease run successfully, if not start with the pre-release process.
- Make sure all Workflows where successful in [Actions](https://github.com/FusionAuth/fusionauth-swift-sdk/actions).
- Update the [SECURITY.md](SECURITY.md) version information with the latest `Supported Versions` according to the current specification E2E test workflows and release PR.
- Make sure all Release-Workflows were successful in [Actions](https://github.com/FusionAuth/fusionauth-swift-sdk/actions).
- Approve and merge the release PR with the tag (release candidate) once all actions run successfully.


### Quickstart Release Process

After the release is published, update the version in the [FusionAuth Swift iOS Quickstart Repository](https://github.com/FusionAuth/fusionauth-quickstart-swift-ios-native/):

The example App is a copy from https://github.com/FusionAuth/fusionauth-swift-sdk/tree/main/Samples/Quickstart by:

1. Copy the Samples/Quickstart folder in to the complete-application folder.
2. edit the complete-application/fusionauth-quickstart-swift-ios-native.xcodeproj/project.pbxproj file, removing the Packages and sdk references.
3. open the project and add the sdk dependency by adding the latest release from https://github.com/FusionAuth/fusionauth-swift-sdk/.
5. update the docker-compose.yml file to use the latest version used by the sdk.
<!--
end::forDocSiteRelease[]
-->
