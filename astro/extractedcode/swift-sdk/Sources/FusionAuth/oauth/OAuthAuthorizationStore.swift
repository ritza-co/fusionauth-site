import Foundation
import AppAuth

/// OAuthAuthorizationStore is a singleton object that stores the current OAuth authorization flow.
/// It provides methods to store, resume, cancel, and clear the current authorization flow.
///
/// This class is used internally by `OAuthAuthorization` and should not be used directly.
internal class OAuthAuthorizationStore {
    static let shared = OAuthAuthorizationStore()

    private(set) var currentAuthorizationFlow: OIDExternalUserAgentSession?

    /// Resume the authorization flow with the URL
    /// - Parameter url: The URL to resume the authorization flow
    /// - Returns: A boolean value indicating if the authorization flow was resumed
    /// - Note: This method resumes the authorization flow with the given URL and returns true if the flow was resumed successfully.
    func resume(_ url: URL) -> Bool {
        if let flow = self.currentAuthorizationFlow, flow.resumeExternalUserAgentFlow(with: url) {
            self.currentAuthorizationFlow = nil
            return true
        }
        return false
    }

    /// Store the current authorization flow
    /// - Parameter flow: The current authorization flow
    func store(_ flow: OIDExternalUserAgentSession) {
        self.currentAuthorizationFlow = flow
    }

    /// Cancel the current authorization flow
    func cancel() {
        self.currentAuthorizationFlow?.cancel()
        self.currentAuthorizationFlow = nil
    }

    /// Clear the current authorization flow
    func clear() {
        self.currentAuthorizationFlow = nil
    }
}
