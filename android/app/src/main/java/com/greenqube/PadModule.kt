package com.inqube.greenqube

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.play.core.assetpacks.*

class PadModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val context = reactContext
    private val assetPackManager = AssetPackManagerFactory.getInstance(context)

    private val TAG = "PAD_MODULE"

    override fun getName(): String {
        return "PadModule"
    }

    // Send event to React Native
    private fun sendEvent(eventName: String, params: WritableMap?) {
        context
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    // Listener
    private val listener = AssetPackStateUpdateListener { state ->

        val map = Arguments.createMap()
        map.putString("packName", state.name())

        when (state.status()) {

            AssetPackStatus.DOWNLOADING -> {
                val progress =
                    (100 * state.bytesDownloaded() / state.totalBytesToDownload())

                map.putInt("progress", progress.toInt())
                sendEvent("PAD_PROGRESS", map)
            }

            AssetPackStatus.COMPLETED -> {
                sendEvent("PAD_COMPLETED", map)
            }

            AssetPackStatus.FAILED -> {
                map.putInt("errorCode", state.errorCode())
                sendEvent("PAD_FAILED", map)
            }

            else -> {}
        }
    }

    // Start download
    @ReactMethod
    fun downloadPack(packName: String) {
        assetPackManager.registerListener(listener)

        assetPackManager.fetch(listOf(packName))
            .addOnSuccessListener {
                Log.d(TAG, "Download started")
            }
            .addOnFailureListener {
                Log.e(TAG, "Error: ${it.message}")
            }
    }

    // Get ONNX path
    @ReactMethod
    fun getModelPath(packName: String, promise: Promise) {
        val location = assetPackManager.getPackLocation(packName)

        if (location != null) {
            val path = location.assetsPath() + "/model.onnx"
            promise.resolve(path)
        } else {
            promise.reject("NOT_READY", "Model not downloaded yet")
        }
    }

    // Cleanup
    override fun invalidate() {
        super.invalidate()
        assetPackManager.unregisterListener(listener)
    }
}