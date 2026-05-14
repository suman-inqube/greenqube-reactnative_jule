import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Animated,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Modal, Alert, NativeModules
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import AIResultCard from '../../Components/AIResultCard';
import * as ort from 'onnxruntime-react-native';
import RNFS from 'react-native-fs';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
const { AssetPackModule } = NativeModules;
global.Buffer = Buffer;
import ModelDot from '../../Components/ModelDot';
import { captureRef } from 'react-native-view-shot';
import { Fonts } from '../../utils/Constants';
import CustomAlert from '../../Common/CustomAlert';
import { CURRENT_ENV } from '../../../config/environment';
export const MODELS = [
  {
    key: 'clarity',
    file: 'clarity_classifier_simplified.onnx',
    label: 'Clarity',
    size: 16,
    required: true,
  },
  {
    key: 'obstacle',
    file: 'obstacle_classifier_simplified.onnx',
    label: 'Obstacle',
    size: 16,
    required: true,
  },
  {
    key: 'pipe',
    file: 'pipe_classifier_simplified.onnx',
    label: 'Pipe',
    size: 16,
    required: true,
  },
  {
    key: 'moisture',
    file: 'moisture_classifier_simplified.onnx', // ✅ exact match
    label: 'moisture Visibility',
    size: 11,
    required: false,
  },
  {
    key: 'ruler',
    file: 'ruler_classifier_simplified.onnx',
    label: 'Ruler Detection',
    size: 11,
    required: false,
  },
];
// function sigmoid(logit) {
//   return logit >= 0
//     ? 1 / (1 + Math.exp(-logit))
//     : Math.exp(logit) / (1 + Math.exp(logit));
// }
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}
// ─────────────────────────────────────────────
// PREDICT
// ─────────────────────────────────────────────
function predict(logits, positiveLabel, negativeLabel) {
  if (!logits || logits.length === 0) return { label: 'Invalid', confidence: 0 };

  let prob;
  if (logits.length === 1) {
    prob = sigmoid(logits[0]);
  } else {
    const max = Math.max(...logits);
    const exps = logits.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    prob = exps[1] / sum;
  }

  const isPositive = prob > 0.5;
  return {
    label: isPositive ? positiveLabel : negativeLabel,
    confidence: isPositive ? prob : 1 - prob,
    isPositive,
  };
}

// ─────────────────────────────────────────────
// LOAD MODEL UTILITY with retry logic
// ─────────────────────────────────────────────
// Global cache (TOP of file)

export async function loadModel(modelFile) {
  try {
    const session = await ort.InferenceSession.create(
      `${RNFS.DocumentDirectoryPath}/${modelFile}`
    );

    // console.log(`✅ Model loaded: ${modelFile}`);
    return session; // 🔥 return single session
  } catch (e) {
    console.error(`❌ Failed to load: ${modelFile}`, e);
    throw e;
  }
}
export async function loadModelFromAssets(fileName, retries = 2) {
  // const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
  const res = await AssetPackModule.loadModel(fileName);
  // console.log("loadModelFromAssets",res)
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!(await RNFS.exists(res.path))) {
        // console.log(`Copying ${fileName} from assets (attempt ${attempt})...`);
        const base64 = await RNFS.readFileAssets(res.path, 'base64');
        await RNFS.writeFile(res.path, base64, 'base64');
        // console.log(`Copied ${fileName}`);
      }

      // console.log(`Creating session for ${fileName}...`);
      const session = await ort.InferenceSession.create(res.path);
      // console.log(`✅ Session created for ${fileName}`);
      return session;
    } catch (e) {
      console.error(`Attempt ${attempt} failed for ${fileName}:`, e);
      if (attempt === retries) throw e;
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// export async function loadModelFromAssets(fileName) {
//   // ✅ Already loaded → return
//   if (sessionCache[fileName]) {
//     return sessionCache[fileName];
//   }

//   // ✅ If loading → wait
//   if (loadingCache[fileName]) {
//     return loadingCache[fileName];
//   }

//   // ✅ Start loading once
//   loadingCache[fileName] = (async () => {
//     try {
//       const res = await AssetPackModule.loadModel(fileName);

//       if (!res?.path) {
//         throw new Error("Invalid model path");
//       }

//       // ✅ Create ONLY ONCE
//       const session = await ort.InferenceSession.create(res.path);

//       sessionCache[fileName] = session;
//       delete loadingCache[fileName];

//       return session;

//     } catch (e) {
//       delete loadingCache[fileName];
//       throw e;
//     }
//   })();

//   return loadingCache[fileName];
// }
async function runSingleModel(session, tensor) {
  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];

  const feeds = {};
  feeds[inputName] = tensor;

  const results = await session.run(feeds);

  const logit = results[outputName].data[0];

  return sigmoid(logit);
}
export async function imageToTensor(uri) {
  try {
    // Resize + match training compression
    const resized = await ImageResizer.createResizedImage(
      uri,
      224,
      224,
      'JPEG',
      75,
      0,        // rotation
      undefined,
      false,    // keepMeta
      {
        mode: 'stretch' // 🔥 FORCE exact 224x224
      }
    );

    // Read correctly (NOT ascii ❌)
    const fileData = await RNFS.readFile(resized.uri, 'base64');

    // Decode JPEG
    const raw = jpeg.decode(
      Buffer.from(fileData, 'base64'),
      { useTArray: true, formatAsRGBA: true }
    );

    const { data, width, height } = raw;

    if (width !== 224 || height !== 224) {
      throw new Error("Image resize failed");
    }

    const floatData = new Float32Array(1 * 3 * 224 * 224);

    let pixelIndex = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

      floatData[pixelIndex] = r;
      floatData[pixelIndex + 224 * 224] = g;
      floatData[pixelIndex + 2 * 224 * 224] = b;

      pixelIndex++;
    }

    return new ort.Tensor('float32', floatData, [1, 3, 224, 224]);

  } catch (e) {
    console.error("❌ imageToTensor failed:", e);
    throw e;
  }
}



const ImageAnalysisScreen = ({
  AIModalVisible,
  setAIModalVisible,
  act_type,
  setTempImage,
  setTempText,
  watermarkViewRef,
  setSelectedImagePipe,
  setPipeDetails,
  mapLatLon,
  tempImage,
  tempText,
  replaceImgKey,
  cameraItem,
  sessions,
  setSessions,
  modelStatus,
  setModelStatus,
  modelLoading,
  setModelLoading,
  loadProgress,
  setLoadProgress,
  loadingModels,
  setLoadingModels,
  ai_camera_pipe_image,
  selectedImagePipe
}) => {
  const [isReady, setisReady] = useState(false);
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // const [loadProgress, setLoadProgress] = useState(''); //

  const headerFade = useRef(new Animated.Value(0)).current;

  // ── Pick from gallery ──
  const pickImage = () => {
    setisReady(false)
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, res => {
      if (res.didCancel || !res.assets) return;
      setImage(res.assets[0]);
      setResult(null);
      setLoading(false);
    });
  };
  let timeoutId = null;
  // ── Take photo ──
  const takePhoto = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 800,
      maxWidth: 800,
      includeExtra: true,
    };
    setisReady(false)
    launchCamera({ options, mediaType: 'photo', quality: 1 }, async response => {
      if (response.didCancel || !response.assets) return;
      setResult(null);
      setLoading(false);
      // clear old timeout first
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      setImage(response.assets[0]);
      if (ai_camera_pipe_image != "1") {
        try {
          if (!response) {
            CustomAlert('Camera Error:', 'Response is blank.', true, 'OK');
            return;
          }
          if (response.didCancel) {
            CustomAlert('Error_Cancel', 'User cancelled camera', true, 'OK');
            return;
          }
          if (response.errorCode) {
            CustomAlert('Camera Error:', response.errorMessage, true, 'OK');
            return;
          }

          const asset = response.assets?.[0];
          if (!asset?.uri) {
            CustomAlert('Error', 'No image captured', true, 'OK');
            return;
          }
          const { latitude: lat, longitude: lon } = mapLatLon || { lat: 'N/A', lon: 'N/A' };
          console.log('Captured image with location:', { lat, lon });
          const timestamp = Date.now();
          const formattedDate = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).format(timestamp);
          const watermarkText = `${formattedDate}\nLat: ${lat}, Lon: ${lon}`;
          setTempImage(asset.uri);
          setTempText(watermarkText);
          timeoutId = setTimeout(async () => {
            try {
              const uri = await captureRef(watermarkViewRef, {
                format: 'jpg',
                quality: 1,
                width: 800,
                height: 800,
              });
              const fileName = asset.fileName || `photo_${timestamp}.jpg`;
              const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
              await RNFS.copyFile(uri, destPath);
              setTempImage(null);
              setTempText('');


              if (replaceImgKey?.arrayPosition === '') {
                setSelectedImagePipe(prev => ({
                  ...prev,
                  [cameraItem]: `file://${destPath}`,
                  [`${cameraItem}fileName`]: fileName,
                  [`${cameraItem}Lat`]: lat,
                  [`${cameraItem}Long`]: lon,
                }));
              } else {
                const { arrayPosition, imgPosition } = replaceImgKey || {};
                setPipeDetails(prev => {
                  const updated = JSON.parse(JSON.stringify(prev));
                  const currentImage = updated[arrayPosition][1][imgPosition];
                  updated[arrayPosition][1][imgPosition] = {
                    ...currentImage,
                    imageURL: `file://${destPath}`,
                    imageName: fileName,
                    status: '',
                    lat,
                    lon,
                  };
                  return updated;
                });
              }
              setisReady(true);
              clearTimeout(timeoutId);
              timeoutId = null;
            } catch (error) {
              console.log('Capture Error:', error);
              setTempImage(null);
              setTempText('');
            }
          }, 5000);
        } catch (error) {
          CustomAlert('Catch Error ', error, true, 'OK');
        } finally {
          setResult(null);
          setLoading(false);
        }
      }
    });
  };


  const saveWatermarkedImage = async () => {
    let timeoutId;
    const { latitude: lat, longitude: lon } = mapLatLon || { lat: 'N/A', lon: 'N/A' };
    const timestamp = Date.now();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(timestamp);
    const watermarkText = `${formattedDate}\nLat: ${lat}, Lon: ${lon}`;
    const imageUri = typeof image?.uri === 'string' ? image.uri : image?.path;
    setTempImage(imageUri);
    setTempText(watermarkText);
    await new Promise(resolve => {
      timeoutId = setTimeout(resolve, 2000);
    });
    try {
      const uri = await captureRef(watermarkViewRef, {
        format: 'jpg',
        quality: 1,
        width: 800,
        height: 800,
      });
      const fileName = image.fileName || `photo_${timestamp}.jpg`;
      const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await RNFS.copyFile(uri, destPath);
      return {
        path: destPath,
        fileName,
        lat,
        lon,
      };
    } catch (error) {
      console.log('Capture Error:', error);
      throw error;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setTempImage(null);
      setTempText('');
    }
  };
  const completeProcess = async () => {
    try {
      const imgWatermark = await saveWatermarkedImage();
      const { path, fileName, lat, lon } = imgWatermark || {};
      if (replaceImgKey?.arrayPosition === '') {
        setSelectedImagePipe(prev => ({
          ...prev,
          [cameraItem]: `file://${path}`,
          [`${cameraItem}fileName`]: fileName,
          [`${cameraItem}Lat`]: lat,
          [`${cameraItem}Long`]: lon,
        }));
      } else {
        const { arrayPosition, imgPosition } = replaceImgKey || {};
        setPipeDetails(prev => {
          const updated = JSON.parse(JSON.stringify(prev));
          const currentImage = updated[arrayPosition][1][imgPosition];
          updated[arrayPosition][1][imgPosition] = {
            ...currentImage,
            imageURL: `file://${path}`,
            imageName: fileName,
            status: '',
            lat,
            lon,
          };
          return updated;
        });
      }
      setAIModalVisible(false);
    } catch (e) {
      console.error('Error in completeProcess:', e);
    }
  }
  async function runAllModels(imageUri) {
    const tensor = await imageToTensor(imageUri);
    const [
      clarity,
      obstacle,
      pipe,
      moisture,
      ruler
    ] = await Promise.all([
      runSingleModel(sessions.clarity, tensor),
      runSingleModel(sessions.obstacle, tensor),
      runSingleModel(sessions.pipe, tensor),
      runSingleModel(sessions.moisture, tensor),
      runSingleModel(sessions.ruler, tensor),
    ]);
    return {
      clarity,
      obstacle,
      pipe,
      moisture,
      ruler
    };
  }
  async function evaluateResults(results, activity = "", act_type = "") {
    try {
      const failed = {}; // ✅ OBJECT (not array)

      const clarity = results.clarity > 0.5;
      const obstacle = results.obstacle > 0.5;
      const pipe = results.pipe > 0.5;
      const moisture = results.moisture > 0.5;
      const ruler = results.ruler > 0.3;

      // PIPE
      failed.pipe = pipe
        ? {
          label: "Pipe Present",
          confidence: "Pipe detected.",
          isPositive: true
        }
        : {
          label: "No Pipe",
          confidence: "No pipe in the image.",
          isPositive: false
        };

      // CLARITY
      failed.clarity = clarity
        ? {
          label: "Clear Image",
          confidence: "Image is clear.",
          isPositive: true
        }
        : {
          label: "Unclear Image",
          confidence: "Image is unclear.",
          isPositive: false
        };

      // OBSTACLE
      failed.obstacle = obstacle
        ? {
          label: "Obstructed Pipe",
          confidence: "Pipe is obstructed.",
          isPositive: false
        }
        : {
          label: "No Obstacle",
          confidence: "Pipe is clear.",
          isPositive: true
        };
      // if (act_type == "Pipe Installation") {
      //   failed.moisture = moisture
      //     ? {
      //       label: "Moisture Detected",
      //       confidence: "Soil has moisture.",
      //       isPositive: true
      //     }
      //     : {
      //       label: "No Moisture",
      //       confidence: "Soil is dry.",
      //       isPositive: false
      //     };
      // }
      // MOISTURE
      if (activity.toLowerCase().includes("drying")) {
        failed.moisture = moisture
          ? {
            label: "Moisture Detected",
            confidence: "Soil has moisture.",
            isPositive: false
          }
          : {
            label: "No Moisture",
            confidence: "Soil is dry.",
            isPositive: true
          };

        // RULER
        failed.ruler = ruler
          ? {
            label: "Ruler Detected",
            confidence: "Ruler detected.",
            isPositive: true
          }
          : {
            label: "Ruler Not Detected",
            confidence: "Ruler not detected.",
            isPositive: false
          };
      }

      return {
        accepted:
          failed.pipe.isPositive &&
          failed.clarity.isPositive &&
          failed.obstacle.isPositive &&
          // (!failed.moisture || failed.moisture.isPositive) &&
          (!failed.ruler || failed.ruler.isPositive),

        reasons: failed, // ✅ OBJECT
      };

    } catch (e) {
      console.error("Error evaluating results:", e);

      return {
        accepted: false,
        reasons: {}
      };
    }
  }
  async function runAnalysis() {
    const imageUri =
      typeof image?.uri === 'string'
        ? image.uri
        : image?.path;
    const results = await runAllModels(imageUri);
    const final = await evaluateResults(results, act_type == "Pipe Installation" ? "" : "drying");
    // const final = await evaluateResults(results,"drying");
    // act_type == "Pipe Installation"
    // console.log("📊 Model probabilities:", results);
    // console.log("✅ Final result:", JSON.stringify(final));
    setResult(final.reasons);
    setisReady(final.accepted);
  }
  const coreModelsReady = modelStatus.clarity && modelStatus.obstacle && modelStatus.pipe;
  const anyModelLoading = Object.values(modelLoading).some(v => v === true);
  return (
    <Modal visible={AIModalVisible} animationType="slide" transparent={false} onRequestClose={() => {
      setAIModalVisible(false);
      setImage(null);
      setResult(null);
      setLoading(false);
    }}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
        <View style={styles.hiddenContainer}>
          {tempImage && (
            <View
              ref={watermarkViewRef}
              style={styles.watermarkView}
              collapsable={false}>
              <Image
                source={{ uri: tempImage }}
                style={styles.watermarkImage}
                resizeMode="cover"
              />
              <View style={styles.watermarkTextContainer}>
                <Text style={styles.watermarkText}>
                  {tempText}
                </Text>
              </View>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {ai_camera_pipe_image == "1" ?
            <Animated.View style={[styles.header]}>
              <Text style={styles.headerTitle}>Pipe Analyzer</Text>
              <Text style={styles.headerSub}>AI-powered pipe inspection</Text>
            </Animated.View> : <View style={{ marginTop: 100 }} />}

          <TouchableOpacity
            style={styles.imageArea}
            // onPress={pickImage}
            onPress={takePhoto}
            activeOpacity={0.85}
          >
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderIcon}>📷</Text>
                {/* <Text style={styles.placeholderText}>Tap to select image</Text> */}
                <Text style={styles.placeholderSub}>Use camera button below</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            {CURRENT_ENV == 'DEMO' && <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={pickImage}>
              <Text style={styles.btnIcon}>🖼</Text>
              <Text style={styles.btnSecondaryText}>Gallery</Text>
            </TouchableOpacity>}


            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={takePhoto}>
              <Text style={styles.btnIcon}>📸</Text>
              <Text style={styles.btnSecondaryText}>Camera</Text>
            </TouchableOpacity>
          </View>
          {ai_camera_pipe_image == 1 && <><View style={styles.modelStatusContainer}>
            <View style={styles.modelStatusRow}>
              {MODELS.map(m => (
                <ModelDot
                  key={m.key}
                  loaded={modelStatus[m.key]}
                  label={m.label}
                  loading={modelLoading[m.key]}
                />
              ))}
            </View>
            {(loadingModels || anyModelLoading) && (
              <View style={styles.loadingProgress}>
                <ActivityIndicator size="small" color="#6B7280" />
                <Text style={styles.loadingText}>{loadProgress || 'Loading models...'}</Text>
              </View>
            )}
          </View>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnPrimary,
                (!image || !coreModelsReady || loading) && styles.btnDisabled,
              ]}
              onPress={runAnalysis}
              disabled={!image || !coreModelsReady || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.btnIcon}>🔍</Text>
                  <Text style={styles.btnPrimaryText}>
                    {!coreModelsReady ? 'Loading Models…' : 'Run Analysis'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
          }
          {/* completeProcess */}
          {isReady && (
            <TouchableOpacity onPress={() => ai_camera_pipe_image != 1 ? setAIModalVisible(false) : completeProcess()} style={[
              styles.btn,
              styles.btnPrimary,
              (!isReady) && styles.btnDisabled
            ]}
              disabled={!isReady}
            >
              <Text style={styles.btnPrimaryText}>Done</Text>
            </TouchableOpacity>
          )
          }
          {result && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>Analysis Results</Text>

              <AIResultCard
                icon="🔭"
                label="Image Clarity"
                value={result.clarity.label}
                confidence={result.clarity.confidence}
                isPositive={result.clarity.isPositive}
                delay={0}
                unavailable={false}
              />
              <AIResultCard
                icon="🪠"
                label="Pipe Detection"
                value={result.pipe.label}
                confidence={result.pipe.confidence}
                isPositive={result.pipe.isPositive}
                delay={100}
                unavailable={false}
              />
              <AIResultCard
                icon="⚠️"
                label="Obstacle Check"
                value={result.obstacle.label}
                confidence={result.obstacle.confidence}
                isPositive={result.obstacle.isPositive}
                delay={200}
                unavailable={false}
              />


              {act_type != "Pipe Installation" && cameraItem == "firstItem" ? (
                <>
                  {/* <AIResultCard
                    icon="💧"
                    label="Moisture Visibility"
                    value={result.moisture?.label || 'N/A'}
                    confidence={result.moisture?.confidence || 0}
                    isPositive={result.moisture?.isPositive || false}
                    delay={300}
                    unavailable={!result.moisture}
                  /> */}

                  <AIResultCard
                    icon="📏"
                    label="Ruler Detection"
                    value={result.ruler?.label || 'N/A'}
                    confidence={result.ruler?.confidence || 0}
                    isPositive={result.ruler?.isPositive || false}
                    delay={400}
                    unavailable={!result.ruler}
                  />
                </>
              ) : <></>}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default ImageAnalysisScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  headerEyebrow: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: Fonts.Medium,
  },
  headerSub: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: Fonts.Medium,
  },
  modelStatusContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    justifyContent: 'center',
  },
  modelStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  loadingProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  imageArea: {
    margin: 16,
    height: 280,
    backgroundColor: '#111827',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  placeholderSub: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: Fonts.Medium,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  btnPrimary: {
    backgroundColor: '#2563EB',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  btnSecondary: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    // alignContent: 'center',
    // justifyContent: 'center'
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnIcon: {
    fontSize: 18,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.Medium,
  },
  btnSecondaryText: {
    color: '#D1D5DB',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Fonts.Medium,
  },
  resultsSection: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  hiddenContainer: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    width: 200,
    height: 200,
  },
  watermarkView: {
    width: 200,
    height: 200,
    backgroundColor: '#000',
  },
  watermarkImage: {
    width: '100%',
    height: '100%',
  },
  watermarkTextContainer: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  watermarkText: {
    color: '#df2020',
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
});
