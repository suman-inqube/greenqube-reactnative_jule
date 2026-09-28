import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Modal,
  NativeModules,
} from 'react-native';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
export async function loadModel(modelFile) {
  try {
    const session = await ort.InferenceSession.create(
      `${RNFS.DocumentDirectoryPath}/${modelFile}`,
    );
    return session;
  } catch (e) {
    console.error(`❌ Failed to load: ${modelFile}`, e);
    throw e;
  }
}

export async function loadModelFromAssets(fileName, retries = 2) {
  const res = await AssetPackModule.loadModel(fileName);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!(await RNFS.exists(res.path))) {
        const base64 = await RNFS.readFileAssets(res.path, 'base64');
        await RNFS.writeFile(res.path, base64, 'base64');
      }
      const session = await ort.InferenceSession.create(res.path);
      return session;
    } catch (e) {
      console.error(`Attempt ${attempt} failed for ${fileName}:`, e);
      if (attempt === retries) throw e;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

async function runSingleModel(session, tensor) {
  if (!session || !tensor) return 0;
  try {
    const inputName = session.inputNames[0];
    const outputName = session.outputNames[0];

    const feeds = { [inputName]: tensor };
    const results = await session.run(feeds);
    const logit = results[outputName].data[0];

    return sigmoid(logit);
  } catch (err) {
    console.error('runSingleModel error:', err);
    return 0;
  }
}

// ─────────────────────────────────────────────
// OPTIMIZED IMAGE TO TENSOR (Low RAM & GC Friendly)
// ─────────────────────────────────────────────
export async function imageToTensor(uri) {
  let resizedUri = null;
  try {
    // Resize + match training compression with strict dimensions
    const resized = await ImageResizer.createResizedImage(
      uri,
      224,
      224,
      'JPEG',
      75,
      0,
      undefined,
      false,
      {
        mode: 'stretch',
      },
    );
    resizedUri = resized.uri;

    // Read resized file as base64
    const fileData = await RNFS.readFile(resized.uri, 'base64');

    // Decode JPEG
    const raw = jpeg.decode(Buffer.from(fileData, 'base64'), {
      useTArray: true,
      formatAsRGBA: true,
    });

    const { data, width, height } = raw;

    if (width !== 224 || height !== 224) {
      throw new Error('Image resize failed');
    }

    const planeSize = 224 * 224; // 50176
    const gOffset = planeSize;
    const bOffset = planeSize * 2;
    const floatData = new Float32Array(planeSize * 3);
    const inv255 = 1 / 255;

    // Fast planar RGB extraction
    for (let p = 0, i = 0; p < planeSize; p++, i += 4) {
      floatData[p] = data[i] * inv255;
      floatData[p + gOffset] = data[i + 1] * inv255;
      floatData[p + bOffset] = data[i + 2] * inv255;
    }

    return new ort.Tensor('float32', floatData, [1, 3, 224, 224]);
  } catch (e) {
    console.error('❌ imageToTensor failed:', e);
    throw e;
  } finally {
    // Clean up temporary resized file to free device storage and memory
    if (resizedUri) {
      RNFS.unlink(resizedUri).catch(() => { });
    }
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
  modelStatus = {},
  setModelStatus,
  modelLoading = {},
  setModelLoading,
  loadProgress,
  setLoadProgress,
  loadingModels,
  setLoadingModels,
  ai_camera_pipe_image,
  selectedImagePipe,
}) => {
  const [isReady, setisReady] = useState(false);
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const isMountedRef = useRef(true);
  const timeoutRef = useRef(null);

  // Clear pending timers safely on unmount or modal close
  const clearActiveTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearActiveTimeout();
    };
  }, [clearActiveTimeout]);

  const handleCloseModal = useCallback(() => {
    clearActiveTimeout();
    setTempImage?.(null);
    setTempText?.('');
    setImage(null);
    setResult(null);
    setLoading(false);
    setisReady(false);
    setAIModalVisible(false);
  }, [clearActiveTimeout, setAIModalVisible, setTempImage, setTempText]);

  // ── Pick from gallery ──
  const pickImage = useCallback(() => {
    setisReady(false);
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
        includeBase64: false, // Saves massive JS RAM
      },
      res => {
        if (res.didCancel || !res.assets || !res.assets[0]) return;
        if (!isMountedRef.current) return;
        setImage(res.assets[0]);
        setResult(null);
        setLoading(false);
      },
    );
  }, []);

  // ── Helper to safely update pipe details without deep JSON clone ──
  const updatePipeDetailsState = useCallback(
    (destPath, fileName, lat, lon) => {
      if (replaceImgKey?.arrayPosition === '') {
        setSelectedImagePipe?.(prev => ({
          ...prev,
          [cameraItem]: `file://${destPath}`,
          [`${cameraItem}fileName`]: fileName,
          [`${cameraItem}Lat`]: lat,
          [`${cameraItem}Long`]: lon,
        }));
      } else {
        const { arrayPosition, imgPosition } = replaceImgKey || {};
        if (arrayPosition !== undefined && imgPosition !== undefined) {
          setPipeDetails?.(prev => {
            if (!prev || !Array.isArray(prev)) return prev;
            if (!prev[arrayPosition] || !prev[arrayPosition][1]) return prev;
            const updated = [...prev];
            const targetSubArr = [...updated[arrayPosition]];
            const targetImgList = [...targetSubArr[1]];
            const currentImage = targetImgList[imgPosition] || {};

            targetImgList[imgPosition] = {
              ...currentImage,
              imageURL: `file://${destPath}`,
              imageName: fileName,
              status: '',
              lat,
              lon,
            };
            targetSubArr[1] = targetImgList;
            updated[arrayPosition] = targetSubArr;
            return updated;
          });
        }
      }
    },
    [replaceImgKey, cameraItem, setSelectedImagePipe, setPipeDetails],
  );

  // ── Take photo ──
  const takePhoto = useCallback(async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false, // 🔥 Disable base64 across bridge to prevent huge memory spikes
      maxHeight: 800,
      maxWidth: 800,
      quality: 0.85,
    };
    setisReady(false);
    clearActiveTimeout();

    launchCamera(options, async response => {
      if (response.didCancel || !response.assets || !response.assets[0]) return;
      if (!isMountedRef.current) return;

      setResult(null);
      setLoading(false);

      const asset = response.assets[0];
      setImage(asset);

      if (ai_camera_pipe_image != '1') {
        try {
          if (response.errorCode) {
            CustomAlert('Camera Error:', response.errorMessage, true, 'OK');
            return;
          }
          if (!asset?.uri) {
            CustomAlert('Error', 'No image captured', true, 'OK');
            return;
          }

          const { latitude: lat, longitude: lon } = mapLatLon || {
            lat: 'N/A',
            lon: 'N/A',
          };

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

          timeoutRef.current = setTimeout(async () => {
            try {
              if (!watermarkViewRef?.current) return;
              const uri = await captureRef(watermarkViewRef, {
                format: 'jpg',
                quality: 1,
                width: 800,
                height: 800,
              });
              const fileName = asset.fileName || `photo_${timestamp}.jpg`;
              const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
              await RNFS.copyFile(uri, destPath);

              if (isMountedRef.current) {
                setTempImage(null);
                setTempText('');
                updatePipeDetailsState(destPath, fileName, lat, lon);
                setisReady(true);
              }
            } catch (error) {
              console.log('Capture Error:', error);
              if (isMountedRef.current) {
                setTempImage(null);
                setTempText('');
              }
            } finally {
              timeoutRef.current = null;
            }
          }, 3000);
        } catch (error) {
          CustomAlert('Catch Error ', String(error), true, 'OK');
        } finally {
          if (isMountedRef.current) {
            setResult(null);
            setLoading(false);
          }
        }
      }
    });
  }, [
    clearActiveTimeout,
    ai_camera_pipe_image,
    mapLatLon,
    setTempImage,
    setTempText,
    watermarkViewRef,
    updatePipeDetailsState,
  ]);

  const saveWatermarkedImage = useCallback(async () => {
    const { latitude: lat, longitude: lon } = mapLatLon || {
      lat: 'N/A',
      lon: 'N/A',
    };
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

    // Wait 1.5s for watermark view to render
    await new Promise(resolve => {
      timeoutRef.current = setTimeout(resolve, 1500);
    });

    try {
      const uri = await captureRef(watermarkViewRef, {
        format: 'jpg',
        quality: 1,
        width: 800,
        height: 800,
      });
      const fileName = image?.fileName || `photo_${timestamp}.jpg`;
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
      timeoutRef.current = null;
      if (isMountedRef.current) {
        setTempImage(null);
        setTempText('');
      }
    }
  }, [mapLatLon, image, setTempImage, setTempText, watermarkViewRef]);

  const completeProcess = useCallback(async () => {
    try {
      const imgWatermark = await saveWatermarkedImage();
      const { path, fileName, lat, lon } = imgWatermark || {};
      if (path && fileName) {
        updatePipeDetailsState(path, fileName, lat, lon);
      }
      setAIModalVisible(false);
    } catch (e) {
      console.error('Error in completeProcess:', e);
    }
  }, [saveWatermarkedImage, updatePipeDetailsState, setAIModalVisible]);

  // ── Run models sequentially to eliminate concurrent memory peaks ──
  const runAllModels = useCallback(
    async imageUri => {
      const tensor = await imageToTensor(imageUri);

      // Sequential execution prevents spike of 5 simultaneous execution graphs in RAM
      const clarity = sessions?.clarity ? await runSingleModel(sessions.clarity, tensor) : 0;
      const obstacle = sessions?.obstacle ? await runSingleModel(sessions.obstacle, tensor) : 0;
      const pipe = sessions?.pipe ? await runSingleModel(sessions.pipe, tensor) : 0;
      const moisture = sessions?.moisture ? await runSingleModel(sessions.moisture, tensor) : 0;
      const ruler = sessions?.ruler ? await runSingleModel(sessions.ruler, tensor) : 0;

      return {
        clarity,
        obstacle,
        pipe,
        moisture,
        ruler,
      };
    },
    [sessions],
  );

  const evaluateResults = useCallback((results, activity = '') => {
    try {
      const failed = {};

      const clarity = results.clarity > 0.5;
      const obstacle = results.obstacle > 0.5;
      const pipe = results.pipe > 0.5;
      const moisture = results.moisture > 0.5;
      const ruler = results.ruler > 0.3;

      // PIPE
      failed.pipe = pipe
        ? {
          label: 'Pipe Present',
          confidence: 'Pipe detected.',
          isPositive: true,
        }
        : {
          label: 'No Pipe',
          confidence: 'No pipe in the image.',
          isPositive: false,
        };

      // CLARITY
      failed.clarity = clarity
        ? {
          label: 'Clear Image',
          confidence: 'Image is clear.',
          isPositive: true,
        }
        : {
          label: 'Unclear Image',
          confidence: 'Image is unclear.',
          isPositive: false,
        };

      // OBSTACLE
      failed.obstacle = obstacle
        ? {
          label: 'Obstructed Pipe',
          confidence: 'Pipe is obstructed.',
          isPositive: false,
        }
        : {
          label: 'No Obstacle',
          confidence: 'Pipe is clear.',
          isPositive: true,
        };

      // MOISTURE & RULER
      if (activity.toLowerCase().includes('drying')) {
        failed.moisture = moisture
          ? {
            label: 'Moisture Detected',
            confidence: 'Soil has moisture.',
            isPositive: false,
          }
          : {
            label: 'No Moisture',
            confidence: 'Soil is dry.',
            isPositive: true,
          };

        if (cameraItem === 'firstItem') {
          failed.ruler = ruler
            ? {
              label: 'Ruler Detected',
              confidence: 'Ruler detected.',
              isPositive: true,
            }
            : {
              label: 'Ruler Not Detected',
              confidence: 'Ruler not detected.',
              isPositive: false,
            };
        }
      }

      return {
        accepted:
          failed.pipe.isPositive &&
          failed.clarity.isPositive &&
          failed.obstacle.isPositive &&
          (!failed.ruler || failed.ruler.isPositive),
        reasons: failed,
      };
    } catch (e) {
      console.error('Error evaluating results:', e);
      return {
        accepted: false,
        reasons: {},
      };
    }
  }, [cameraItem]);

  const runAnalysis = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const imageUri = typeof image?.uri === 'string' ? image.uri : image?.path;
      if (!imageUri) {
        setLoading(false);
        return;
      }
      const results = await runAllModels(imageUri);
      const final = evaluateResults(
        results,
        act_type === 'Pipe Installation' ? '' : 'drying',
      );

      if (isMountedRef.current) {
        setResult(final.reasons);
        setisReady(final.accepted);
      }
    } catch (e) {
      console.error('runAnalysis error:', e);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [loading, image, runAllModels, evaluateResults, act_type]);

  const coreModelsReady = useMemo(
    () => Boolean(modelStatus?.clarity && modelStatus?.obstacle && modelStatus?.pipe),
    [modelStatus?.clarity, modelStatus?.obstacle, modelStatus?.pipe],
  );

  const anyModelLoading = useMemo(
    () => Object.values(modelLoading || {}).some(v => v === true),
    [modelLoading],
  );

  return (
    <Modal
      visible={AIModalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleCloseModal}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
        <View style={styles.hiddenContainer}>
          {tempImage ? (
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
                <Text style={styles.watermarkText}>{tempText}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {ai_camera_pipe_image == '1' ? (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Pipe Analyzer</Text>
              <Text style={styles.headerSub}>AI-powered pipe inspection</Text>
            </View>
          ) : (
            <View style={{ marginTop: 100 }} />
          )}

          <TouchableOpacity
            style={styles.imageArea}
            onPress={takePhoto}
            activeOpacity={0.85}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderIcon}>📷</Text>
                <Text style={styles.placeholderSub}>
                  Use camera button below
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            {CURRENT_ENV === 'DEMO' && (
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={pickImage}>
                <Text style={styles.btnIcon}>🖼</Text>
                <Text style={styles.btnSecondaryText}>Gallery</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={takePhoto}>
              <Text style={styles.btnIcon}>📸</Text>
              <Text style={styles.btnSecondaryText}>Camera</Text>
            </TouchableOpacity>
          </View>

          {ai_camera_pipe_image == 1 && (
            <>
              <View style={styles.modelStatusContainer}>
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
                    <Text style={styles.loadingText}>
                      {loadProgress || 'Loading models...'}
                    </Text>
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
                disabled={!image || !coreModelsReady || loading}>
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
          )}

          {isReady && (
            <TouchableOpacity
              onPress={() =>
                ai_camera_pipe_image != 1
                  ? setAIModalVisible(false)
                  : completeProcess()
              }
              style={[
                styles.btn,
                styles.btnPrimary,
                !isReady && styles.btnDisabled,
              ]}
              disabled={!isReady}>
              <Text style={styles.btnPrimaryText}>Done</Text>
            </TouchableOpacity>
          )}

          {result && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>Analysis Results</Text>

              <AIResultCard
                icon="🔭"
                label="Image Clarity"
                value={result.clarity?.label}
                confidence={result.clarity?.confidence}
                isPositive={result.clarity?.isPositive}
                delay={0}
                unavailable={false}
              />
              <AIResultCard
                icon="🪠"
                label="Pipe Detection"
                value={result.pipe?.label}
                confidence={result.pipe?.confidence}
                isPositive={result.pipe?.isPositive}
                delay={100}
                unavailable={false}
              />
              <AIResultCard
                icon="⚠️"
                label="Obstacle Check"
                value={result.obstacle?.label}
                confidence={result.obstacle?.confidence}
                isPositive={result.obstacle?.isPositive}
                delay={200}
                unavailable={false}
              />

              {act_type !== 'Pipe Installation' && cameraItem === 'firstItem' ? (
                <AIResultCard
                  icon="📏"
                  label="Ruler Detection"
                  value={result.ruler?.label || 'N/A'}
                  confidence={result.ruler?.confidence || 0}
                  isPositive={result.ruler?.isPositive || false}
                  delay={400}
                  unavailable={!result.ruler}
                />
              ) : null}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default React.memo(ImageAnalysisScreen);

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
