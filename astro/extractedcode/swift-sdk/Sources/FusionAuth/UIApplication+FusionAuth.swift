#if canImport(UIKit)
import UIKit

extension UIApplication {
    /// A computed property that returns the top view controller in the application's view hierarchy.
    /// - Returns: The top view controller in the application's view hierarchy, or `nil` if no view controller is found.
    static var topViewController: UIViewController? {
        let viewController: UIViewController?
        if Thread.current.isMainThread {
            viewController = UIApplication.shared.topViewController!
        } else {
            viewController = DispatchQueue.main.sync {
                UIApplication.shared.topViewController!
            }
        }
        return viewController
    }

    /// Returns the top view controller in the application's view hierarchy.
    /// - Returns: The top view controller, or `nil` if no view controller is found.
    var topViewController: UIViewController? {
        return UIApplication.shared
            .connectedScenes
            .compactMap { ($0 as? UIWindowScene)?.keyWindow}
            .last?
            .rootViewController?
            .topViewController()
    }
}

extension UIViewController {
    /// Returns the topmost view controller in the view controller hierarchy.
    ///
    /// This method recursively traverses the view controller hierarchy to find the topmost view controller.
    /// It starts from the current view controller and checks if there is a presented view controller.
    /// If there is a presented view controller, it checks if it is a navigation controller or a tab bar controller.
    /// If it is a navigation controller, it returns the top view controller of the navigation stack.
    /// If it is a tab bar controller, it checks if there is a selected view controller.
    /// If there is a selected view controller, it returns the top view controller of the selected tab.
    /// If none of the above conditions are met, it returns the presented view controller itself.
    /// If there is no presented view controller, it returns the current view controller itself.
    /// - Returns: The topmost view controller in the view controller hierarchy.
    func topViewController() -> UIViewController {
        guard let presentedViewController = self.presentedViewController else {
            return self
        }

        if let navigationController = self.presentedViewController as? UINavigationController {
            return navigationController.topViewController()
        }
        if let tabBarController = presentedViewController as? UITabBarController {
            if let selectedTab = tabBarController.selectedViewController {
                return selectedTab.topViewController()
            }
            return tabBarController.topViewController()
        }

        return self.presentedViewController!.topViewController()
    }
}
#endif
