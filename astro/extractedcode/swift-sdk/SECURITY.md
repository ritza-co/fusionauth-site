# Security Policy

For Responsible Disclosure Program, Discovering Security Vulnerabilities
 and Reporting a Vulnerability please follow https://fusionauth.io/security

## Supported Versions

 SDK Version  | Tested FusionAuth | Tested Simulator  | Tested xcode    | Tested swift    | Supported          |
|--------------|-------------------|-------------------|-----------------|-----------------|--------------------|
| \>= 1.3.0    | 1.64.1 - 1.67.1   | iOS 17.5 - 26.5   | 15.4   - 26.5   | 5.10.1 - 6.3.2  | :white_check_mark: |
| \>= 1.2.0    | 1.61.2 - 1.64.1   | iOS 17.5 - 26.0.1 | 15.4   - 26.0.1 | 5.10.1 - 6.1.0  | :white_check_mark: |
| \>= 1.0.0    | 1.57 - 1.61       | iOS 17.5 - 26.0.1 | 15.4   - 26.0.1 | 5.10.1 - 6.1.0  | :white_check_mark: |
| \>= 0.3.0    | 1.51 - 1.55       | iOS 15.5 - 18.2   | 14.3.1 - 16.2   | 5.8.1  - 6.0.2  | :white_check_mark: |
| \>= 0.1.1    | 1.47 - 1.55       | iOS 15.5 - 18.1   | 14.3.1 - 15.4   | 5.8.1  - 5.10.1 | :x:                |
| \>= 0.1.0    | 1.47 - 1.54       | iOS 15.5 - 18.1   | 14.3.1 - 15.4   | 5.8.1  - 5.10.1 | :x:                |
        |

## Versioning Guidelines

We use [Semantic Versioning 2.0.0](https://semver.org/) with the following release examples:

### Major

When the Authorization / Token Manager API is changed in a non-backwards compatible way.

### Minor

When the Authorization / Token Manager API is extended with new functionality in a backwards compatible way.

### Patch

When the Authorization / Token Manager API is not changed, but an internal bug is fixed.

### FusionAuth Server Compatibility

The Mobile SDK version may be tied to the FusionAuth Server version. This is to ensure that the Mobile SDK is compatible with the FusionAuth Server. 

If the resulting SDK release stays compatible with the new and earlier Fusionauth Server version, the SDK is published as a Minor release. 

If the resulting SDK release is only compatible with the new FusionAuth Server version. It is considered a non-backwards compatible change, and the SDK is released in a Major release.
