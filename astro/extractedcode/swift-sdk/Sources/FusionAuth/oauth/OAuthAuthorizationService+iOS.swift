#if os(iOS) || targetEnvironment(macCatalyst)
import UIKit
import AppAuth

extension OAuthAuthorizationService {
    internal func getPresenting() -> UIViewController {
        return UIApplication.topViewController!
    }

    internal func getUserAgent() throws -> OIDExternalUserAgent {
        guard let userAgent = OIDExternalUserAgentIOS(presenting: getPresenting()) else {
            throw OAuthError.invalidUserAgent
        }
        return userAgent
    }
}
#endif
