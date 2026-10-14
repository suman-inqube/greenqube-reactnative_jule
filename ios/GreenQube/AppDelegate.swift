import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import GoogleMaps

@main
class AppDelegate: RCTAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    self.moduleName = "GreenQube"
    self.dependencyProvider = RCTAppDependencyProvider()
    self.automaticallyLoadReactNativeWindow = false

    // You can add your custom initial props in the dictionary below.
    // They will be passed down to the ViewController used by React Native.
    self.initialProps = [:]

    GMSServices.provideAPIKey("AIzaSyBGTMfBKCZ9NJ57HX1NPm5hCnzK6_CYVD8")

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }

  override func application(
    _ application: UIApplication,
    configurationForConnecting connectingSceneSession: UISceneSession,
    options: UIScene.ConnectionOptions
  ) -> UISceneConfiguration {
    let sceneConfig = UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    sceneConfig.delegateClass = SceneDelegate.self
    return sceneConfig
  }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
    guard let windowScene = (scene as? UIWindowScene) else { return }
    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }

    let window = UIWindow(windowScene: windowScene)
    let rootViewController = appDelegate.createRootViewController()
    let rootView = appDelegate.rootViewFactory().view(
      withModuleName: appDelegate.moduleName ?? "GreenQube",
      initialProperties: appDelegate.initialProps,
      launchOptions: nil
    )
    appDelegate.setRootView(rootView, toRootViewController: rootViewController)
    window.rootViewController = rootViewController
    self.window = window
    appDelegate.window = window
    window.makeKeyAndVisible()
  }
}
