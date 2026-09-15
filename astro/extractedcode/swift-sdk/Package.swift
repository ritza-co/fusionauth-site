// swift-tools-version: 5.8
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

#if swift(>=5.10)
let package = Package(
    name: "FusionAuth",
    platforms: [
        .macOS(.v12),
        .iOS(.v15)
    ],
    products: [
        // Products define the executables and libraries a package produces, making them visible to other packages.
        .library(
            name: "FusionAuth",
            targets: ["FusionAuth"]),
    ],
    dependencies: [
        .package(url: "https://github.com/openid/AppAuth-iOS.git", exact: "2.1.0"),
        .package(url: "https://github.com/realm/SwiftLint.git", from: "0.57.1")
    ],
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .target(
            name: "FusionAuth",
            dependencies: [
                .product(name: "AppAuth", package: "AppAuth-iOS")
            ]
        ),
        .testTarget(
            name: "FusionAuthTests",
            dependencies: ["FusionAuth"],
            plugins: [.plugin(name: "SwiftLintBuildToolPlugin", package: "SwiftLint")]
        ),
    ]
)
#else
let package = Package(
    name: "FusionAuth",
    platforms: [
        .macOS(.v12),
        .iOS(.v15)
    ],
    products: [
        // Products define the executables and libraries a package produces, making them visible to other packages.
        .library(
            name: "FusionAuth",
            targets: ["FusionAuth"]),
    ],
    dependencies: [
        .package(url: "https://github.com/openid/AppAuth-iOS.git", exact: "2.1.0")
    ],
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .target(
            name: "FusionAuth",
            dependencies: [
                .product(name: "AppAuth", package: "AppAuth-iOS")
            ]
        ),
        .testTarget(
            name: "FusionAuthTests",
            dependencies: ["FusionAuth"]
        ),
    ]
)
#endif
