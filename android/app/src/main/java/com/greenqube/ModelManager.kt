package com.inqube.greenqube

import android.content.Context
import android.util.Log
import ai.onnxruntime.*

object ModelManager {

    private lateinit var env: OrtEnvironment

    private val sessions = mutableMapOf<String, OrtSession>()

    /**
     * Initialize ONNX environment
     */
    fun init() {
        env = OrtEnvironment.getEnvironment()
    }

    /**
     * Load a model (only once)
     */
    fun loadModel(context: Context, modelName: String) {
        if (sessions.containsKey(modelName)) {
            Log.d("MODEL", "Already loaded: $modelName")
            return
        }

        try {
            val modelPath = "${context.filesDir}/$modelName"

            val sessionOptions = OrtSession.SessionOptions()
            val session = env.createSession(modelPath, sessionOptions)

            sessions[modelName] = session

            Log.d("MODEL", "✅ Loaded: $modelName")

        } catch (e: Exception) {
            Log.e("MODEL", "❌ Failed to load $modelName: ${e.message}")
        }
    }

    /**
     * Get loaded session
     */
    fun getSession(modelName: String): OrtSession? {
        return sessions[modelName]
    }

    /**
     * Cleanup (optional)
     */
    fun closeAll() {
        sessions.values.forEach { it.close() }
        sessions.clear()
    }

    fun getOrLoadModel(context: Context, modelName: String): OrtSession? {
        if (!sessions.containsKey(modelName)) {
            loadModel(context, modelName)
        }
        return sessions[modelName]
    }
}