package com.inqube.greenqube

import com.facebook.react.bridge.*
import java.io.File
import java.io.FileOutputStream

class AssetPackModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AssetPackModule"
    }

    /**
     * Ensure model file exists (copy from assets if needed)
     */
     fun ensureModelExists(modelName: String): String {
        val file = File(reactApplicationContext.filesDir, modelName)

        if (!file.exists()) {
            reactApplicationContext.assets.open(modelName).use { input ->
                FileOutputStream(file).use { output ->
                    input.copyTo(output)
                }
            }
        }

        return file.absolutePath
    }

    /**
     * Lazy load model (called from JS)
     */
    @ReactMethod
    fun loadModel(modelName: String, promise: Promise) {
        try {
            // Step 1: ensure file exists
            val filePath = ensureModelExists(modelName)

            // Step 2: lazy load session
            val session = ModelManager.getOrLoadModel(reactApplicationContext, modelName)

            if (session != null) {
                     val result = Arguments.createMap().apply {
                putString("message", "Loaded $modelName")
                putString("path", filePath)
            }
            promise.resolve(result)
                promise.resolve("✅ test12 Loaded $modelName")
            } else {
                promise.reject("LOAD_FAILED", "Failed to load model")
            }

        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * Check if model is already loaded
     */
    @ReactMethod
    fun isModelLoaded(modelName: String, promise: Promise) {
        try {
            val loaded = ModelManager.getSession(modelName) != null
            promise.resolve(loaded)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * Unload model (free memory)
     */
    @ReactMethod
    fun unloadModel(modelName: String, promise: Promise) {
        try {
            val session = ModelManager.getSession(modelName)

            if (session != null) {
                session.close()
                promise.resolve("✅ Unloaded $modelName")
            } else {
                promise.resolve("Model not loaded")
            }

        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}