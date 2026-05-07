package com.inqube.greenqube

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              add(AssetPackPackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }

    try {
    val file = java.io.File(filesDir, "clarity_classifier_simplified.onnx")

    if (!file.exists()) {
      val inputStream = assets.open("clarity_classifier_simplified.onnx")
      val outputStream = java.io.FileOutputStream(file)

      inputStream.copyTo(outputStream)

      inputStream.close()
      outputStream.close()

      android.util.Log.d("MODEL", "✅ Model copied at startup")
    } else {
      android.util.Log.d("MODEL", "✅ Model already exists")
    }

  } catch (e: Exception) {
    android.util.Log.e("MODEL", "❌ Model not available: ${e.message}")
  }
    //////////////////////////////////////////////////////////////////////////////////////////
ModelManager.init()

val modelNames = listOf(
    "clarity_classifier_simplified.onnx",
    "moisture_classifier_simplified.onnx",
    "obstacle_classifier_simplified.onnx",
    "pipe_classifier_simplified.onnx",
    "ruler_classifier_simplified.onnx",
    "soil_visibility_classifier_simplified.onnx"
)

modelNames.forEach {
    ModelManager.loadModel(this, it)
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
  }
}
