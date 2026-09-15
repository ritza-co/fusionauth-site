import Foundation

/// OAuthAuthorization is a utility struct that provides methods to resume and cancel the OAuth authorization flow.
///
/// `resume` should be used in the `onOpenURL` modifier of the base `ContentView` of your app.
///
/// ```
/// @main
/// struct QuickstartApp: App {
///     var body: some Scene {
///         WindowGroup {
///             ContentView()
///                 .onOpenURL { url in
///                     OAuthAuthorization.resume(with: url)
///                 }
///         }
///     }
/// }
/// ```
public struct OAuthAuthorization {
    private init() {}

    /// Resume the authorization flow with the URL
    /// - Parameter url: The URL to resume the authorization flow
    /// - Returns: A boolean value indicating if the authorization flow was resumed
    /// - Note: This method resumes the authorization flow with the given URL and returns true if the flow was resumed successfully.
    @discardableResult
    public static func resume(with url: URL) -> Bool {
        return OAuthAuthorizationStore.shared.resume(url)
    }

    /// Cancel the current authorization flow
    public static func cancel() {
        OAuthAuthorizationStore.shared.cancel()
    }
}
