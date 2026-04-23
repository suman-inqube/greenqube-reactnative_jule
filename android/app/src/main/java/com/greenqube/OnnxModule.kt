package com.inqube.greenqube

import com.facebook.react.bridge.*
import java.io.File
import java.io.FileOutputStream

class OnnxModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "OnnxModule"
    }

    @ReactMethod
    fun getModelPath(modelName: String, promise: Promise) {
        try {
            val inputStream = reactContext.assets.open(modelName)

            val file = File(reactContext.cacheDir, modelName)

            val outputStream = FileOutputStream(file)
            inputStream.copyTo(outputStream)

            inputStream.close()
            outputStream.close()

            promise.resolve(file.absolutePath)

        } catch (e: Exception) {
            promise.reject("MODEL_ERROR", e)
        }
    }
}