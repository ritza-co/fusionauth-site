#if os(macOS)
import AppKit
import AppAuth
import AuthenticationServices

extension OAuthAuthorizationService {
    internal func getPresenting() -> NSWindow {
        return ASPresentationAnchor()
    }

    internal func getUserAgent() throws -> OIDExternalUserAgent {
        return OIDExternalUserAgentMac(presenting: getPresenting())
    }
}
#endif
