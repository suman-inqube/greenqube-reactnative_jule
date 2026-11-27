import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import GoogleMaps

@main
class AppDelegate: RCTAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    
    // GMSServices.provideAPIKey("AIzaSyCw8BW8Zb3DYtanHde65VY-lZfdrCIyFGw")AIzaSyDLPn54jk7Go1VlppBC7MlwlRoqURjqVSA
    GMSServices.provideAPIKey("AIzaSyDLPn54jk7Go1VlppBC7MlwlRoqURjqVSA")
    self.moduleName = "GreenQube"
    self.dependencyProvider = RCTAppDependencyProvider()
    self.automaticallyLoadReactNativeWindow = false

    // You can add your custom initial props in the dictionary below.
    // They will be passed down to the ViewController used by React Native.
    self.initialProps = [:]

    

    //////////////////////////////////////////////////////////////////////////////////////////
    // ✅ SAME TO SAME AS ANDROID MainApplication.kt: Copy models at startup
    //////////////////////////////////////////////////////////////////////////////////////////
    copyModelsAtStartup()
    //////////////////////////////////////////////////////////////////////////////////////////

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // MARK: - Startup Model Copy (Equivalent to Android MainApplication.kt onCreate logic)
  private func copyModelsAtStartup() {
    let fileManager = FileManager.default
    guard let documentsDirectory = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first else {
      print("❌ [MODEL] Documents directory not accessible")
      return
    }

    let modelNames = [
      "clarity_classifier_simplified.onnx",
      "moisture_classifier_simplified.onnx",
      "obstacle_classifier_simplified.onnx",
      "pipe_classifier_simplified.onnx",
      "ruler_classifier_simplified.onnx",
      "soil_visibility_classifier_simplified.onnx"
    ]

    for modelName in modelNames {
      let destURL = documentsDirectory.appendingPathComponent(modelName)

      if !fileManager.fileExists(atPath: destURL.path) {
        let nameWithoutExt = (modelName as NSString).deletingPathExtension
        let ext = (modelName as NSString).pathExtension

        // 1. Search in app bundle (root or subdirectories)
        var sourceURL = Bundle.main.url(forResource: nameWithoutExt, withExtension: ext)
        if sourceURL == nil {
          sourceURL = Bundle.main.url(forResource: nameWithoutExt, withExtension: ext, subdirectory: "models")
        }
        if sourceURL == nil {
          sourceURL = Bundle.main.url(forResource: nameWithoutExt, withExtension: ext, subdirectory: "assets/models")
        }

        // 2. Fallback for iOS Simulator during development
        #if targetEnvironment(simulator)
        if sourceURL == nil {
          let devPath = "/Users/basudevnayak/greenqube-reactnative/ios/GreenQube/assets/models/\(modelName)"
          if fileManager.fileExists(atPath: devPath) {
            sourceURL = URL(fileURLWithPath: devPath)
          }
        }
        #endif

        if let source = sourceURL {
          do {
            try fileManager.copyItem(at: source, to: destURL)
            print("✅ [MODEL] Model copied at startup: \(modelName)")
          } catch {
            print("❌ [MODEL] Failed to copy \(modelName): \(error.localizedDescription)")
          }
        } else {
          print("❌ [MODEL] Model not available: \(modelName)")
        }
      } else {
        print("✅ [MODEL] Model already exists: \(modelName)")
      }
    }
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
