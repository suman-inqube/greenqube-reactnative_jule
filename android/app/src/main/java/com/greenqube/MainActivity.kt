package com.inqube.greenqube

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import android.os.Bundle
import android.util.Log

import com.google.android.play.core.assetpacks.*

import ai.onnxruntime.OrtEnvironment
import ai.onnxruntime.OrtSession
import com.google.android.play.core.assetpacks.model.AssetPackStatus

class MainActivity : ReactActivity() {

    private lateinit var assetPackManager: AssetPackManager
    private val packName = "onnx_model_pack"

    // ✅ Store all loaded models
    private val modelSessions = mutableMapOf<String, OrtSession>()

    // ✅ Store assets path
    private var assetsPath: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        assetPackManager = AssetPackManagerFactory.getInstance(this)

        val listener = AssetPackStateUpdateListener { state ->
            if (state.name() == packName) {
                when (state.status()) {

                    AssetPackStatus.DOWNLOADING -> {
                        val progress = 100 * state.bytesDownloaded() / state.totalBytesToDownload()
                        Log.d("PAD", "Downloading: $progress%")
                    }

                    AssetPackStatus.COMPLETED -> {
                        Log.d("PAD", "✅ Download complete!")

                        val location = assetPackManager.getPackLocation(packName)

                        if (location != null) {
                            assetsPath = location.assetsPath()
                            Log.d("PAD", "Assets path: $assetsPath")

                            // ✅ Preload models (YOUR LIST)
                            preloadModels()

                        } else {
                            Log.e("PAD", "❌ Asset location is null!")
                        }
                    }

                    AssetPackStatus.FAILED -> {
                        Log.e("PAD", "❌ Failed: ${state.errorCode()}")
                    }
                }
            }
        }

        assetPackManager.registerListener(listener)

        // ✅ Start download
        assetPackManager.fetch(listOf(packName))
    }

    // --------------------------------------------------
    // ✅ PRELOAD MODELS (YOUR 5 MODELS - NO LOGIC CHANGE)
    // --------------------------------------------------
    private fun preloadModels() {
        val modelsToPreload = listOf(
            "clarity_classifier_simplified.onnx",
            "obstacle_classifier_simplified.onnx",
            "pipe_classifier_simplified.onnx",
            "ruler_classifier_simplified.onnx",
            "soil_visibility_classifier_simplified.onnx"
        )

        for (model in modelsToPreload) {
            loadModelIfNeeded(model)
        }
    }

    // --------------------------------------------------
    // ✅ LOAD MODEL (UNCHANGED LOGIC)
    // --------------------------------------------------
    fun loadModelIfNeeded(modelName: String): OrtSession? {
        try {
            if (modelSessions.containsKey(modelName)) {
                return modelSessions[modelName]
            }

            if (assetsPath == null) {
                Log.e("ONNX", "❌ Assets path not ready yet")
                return null
            }

            val modelPath = "$assetsPath/$modelName"

            val env = OrtEnvironment.getEnvironment()
            val sessionOptions = OrtSession.SessionOptions()

            val session = env.createSession(modelPath, sessionOptions)

            modelSessions[modelName] = session

            Log.d("ONNX", "✅ Loaded: $modelName")

            return session

        } catch (e: Exception) {
            Log.e("ONNX", "❌ Error loading $modelName: ${e.message}")
            return null
        }
    }

    // --------------------------------------------------
    // ✅ GET MODEL (UNCHANGED)
    // --------------------------------------------------
    fun getModel(modelName: String): OrtSession? {
        return loadModelIfNeeded(modelName)
    }

    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------
    override fun onDestroy() {
        super.onDestroy()

        assetPackManager.clearListeners()

        for (session in modelSessions.values) {
            session.close()
        }

        Log.d("ONNX", "🧹 All sessions closed")
    }

    override fun getMainComponentName(): String = "GreenQube"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}