// swift-tools-version:5.9
import PackageDescription

let name = "HelloWorld"
let package = Package(
  name: name,
  platforms: [.macOS(.v14)],
  targets: [
    .executableTarget(name: name, path: "")
  ]
)
