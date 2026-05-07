import React, { useState,useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { NativeModules } from 'react-native';
import RNFS from 'react-native-fs';
const { AssetPackModule } = NativeModules;

// ✅ Your models
const MODELS = [
  "clarity_classifier_simplified.onnx",
  "moisture_classifier_simplified.onnx",
  "obstacle_classifier_simplified.onnx",
  "pipe_classifier_simplified.onnx",
  "soil_visibility_classifier_simplified.onnx"
];

export default function App() {
useEffect(() => {
loadModelOnStart();
}, [])
const loadModelOnStart = async () => {
  try {
    console.log("AAAA",RNFS?.DocumentDirectoryPath)
    // const path = await AssetPackModule.ensureModelExists("clarity_classifier_simplified.onnx");
    // console.log(`++++++Model path: ${path}`);
    const alreadyLoaded = await AssetPackModule.isModelLoaded("clarity_classifier_simplified.onnx");  
    console.log(`++++++Check if clarity_classifier_simplified.onnx is loaded: ${alreadyLoaded}`);
    // if (!alreadyLoaded) {
      // console.log(`++++++Loading clarity_classifier_simplified.onnx...`);
      const res = await AssetPackModule.loadModel("clarity_classifier_simplified.onnx");
      console.log(`++++++Load result: ${res}`,res);
    // } else {
    //   console.log(`++++++clarity_classifier_simplified.onnx is already loaded.`);
    // }
  } catch (e) {
    console.error(`++++Error loading model on start:`, e);
  }
}
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev]);
  };

  // ✅ Load single model (lazy)
  const loadModel = async (model) => {
    try {
      const alreadyLoaded = await AssetPackModule.isModelLoaded(model);
console.log(`Check if ${model} is loaded: ${alreadyLoaded}`);
      if (alreadyLoaded) {
        addLog(`⚡ Already loaded: ${model}`);
        return;
      }

      addLog(`⏳ Loading: ${model}`);

      const res = await AssetPackModule.loadModel(model);

      addLog(`✅ ${res}`);
    } catch (e) {
      addLog(`❌ Error: ${model}`);
      console.error(e);
    }
  };

  // ✅ Load all models (lazy)
  const loadAllModels = async () => {
    try {
      setLoading(true);
      addLog("🚀 Starting lazy load...");

      for (const model of MODELS) {
        const loaded = await AssetPackModule.isModelLoaded(model);

        if (!loaded) {
          addLog(`⏳ Loading ${model}`);
          await AssetPackModule.loadModel(model);
          addLog(`✅ Loaded ${model}`);
        } else {
          addLog(`⚡ Already loaded ${model}`);
        }
      }

      addLog("🎉 All models ready");
    } catch (e) {
      console.error(e);
      addLog("❌ Load all failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Check status
  const checkModel = async (model) => {
    try {
      const loaded = await AssetPackModule.isModelLoaded(model);
      addLog(`${model} → ${loaded ? "Loaded" : "Not Loaded"}`);
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ Unload
  const unloadModel = async (model) => {
    try {
      await AssetPackModule.unloadModel(model);
      addLog(`🧹 Unloaded: ${model}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ONNX Asset Loader</Text>

      <ScrollView>

        {MODELS.map((model) => (
          <View key={model} style={styles.card}>
            <Text style={styles.modelName}>{model}</Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => loadModel(model)}
              >
                <Text style={styles.btnText}>Load</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => checkModel(model)}
              >
                <Text style={styles.btnText}>Check</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => unloadModel(model)}
              >
                <Text style={styles.btnText}>Unload</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.bigButton}
          onPress={loadAllModels}
        >
          <Text style={styles.btnText}>
            {loading ? "Loading..." : "Lazy Load ALL"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.logTitle}>Logs</Text>

        {logs.map((log, index) => (
          <Text key={index} style={styles.log}>
            {log}
          </Text>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0f172a'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12
  },
  modelName: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 14
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 8,
    borderRadius: 6
  },
  bigButton: {
    backgroundColor: '#16a34a',
    padding: 12,
    borderRadius: 10,
    marginVertical: 16,
    alignItems: 'center'
  },
  btnText: {
    color: '#fff',
    fontSize: 12
  },
  logTitle: {
    color: '#fff',
    marginTop: 10,
    fontWeight: 'bold'
  },
  log: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4
  }
});