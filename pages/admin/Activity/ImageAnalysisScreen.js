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
  Dimensions,
} from 'react-native';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import AIResultCard from '../../Components/AIResultCard';
import * as ort from 'onnxruntime-react-native';
import RNFS from 'react-native-fs';
import { launchImageLibrary } from 'react-native-image-picker';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
const { AssetPackModule } = NativeModules;
global.Buffer = Buffer;
import ModelDot from '../../Components/ModelDot';
import Marker, { Position, ImageFormat } from 'react-native-image-marker';
import { Fonts } from '../../utils/Constants';
import CustomAlert from '../../Common/CustomAlert';
import { CURRENT_ENV } from '../../../config/environment';

const APP_LOGO = require('../../Common/images/watter_logo.png');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  // {
  //   key: 'moisture',
  //   file: 'moisture_classifier_simplified.onnx', // ✅ exact match
  //   label: 'moisture Visibility',
  //   size: 11,
  //   required: false,
  // },
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
// GLOBAL MODEL SESSION MANAGER (Singleton Cache)
// ─────────────────────────────────────────────
const globalSessions = {
  clarity: null,
  obstacle: null,
  pipe: null,
  moisture: null,
  ruler: null,
};

const globalStatus = {
  clarity: false,
  obstacle: false,
  pipe: false,
  moisture: false,
  ruler: false,
};

const globalLoading = {
  clarity: false,
  obstacle: false,
  pipe: false,
  moisture: false,
  ruler: false,
};

let activeLoadPromise = null;
const sessionListeners = new Set();

export const ModelSessionManager = {
  getSessions: () => ({ ...globalSessions }),
  getStatus: () => ({ ...globalStatus }),
  getLoading: () => ({ ...globalLoading }),

  isLoaded: key => Boolean(globalSessions[key]),
  isCoreLoaded: () =>
    Boolean(
      globalSessions.clarity &&
      globalSessions.obstacle &&
      globalSessions.pipe,
    ),
  isAllLoaded: () =>
    MODELS.every(m => !m.required || Boolean(globalSessions[m.key])),

  subscribe: listener => {
    sessionListeners.add(listener);
    return () => sessionListeners.delete(listener);
  },

  notify: (progressText = '') => {
    const currentSessions = { ...globalSessions };
    const currentStatus = { ...globalStatus };
    const currentLoading = { ...globalLoading };
    sessionListeners.forEach(fn => {
      try {
        fn(currentSessions, currentStatus, currentLoading, progressText);
      } catch (err) {
        console.error('ModelSessionManager listener error:', err);
      }
    });
  },

  loadAll: async onUpdate => {
    if (onUpdate) {
      onUpdate(
        { ...globalSessions },
        { ...globalStatus },
        { ...globalLoading },
      );
    }

    if (activeLoadPromise) {
      return activeLoadPromise;
    }

    activeLoadPromise = (async () => {
      try {
        for (const model of MODELS) {
          if (globalSessions[model.key]) {
            globalStatus[model.key] = true;
            globalLoading[model.key] = false;
            continue;
          }

          globalLoading[model.key] = true;
          const progressMsg = `Loading ${model.label}...`;
          ModelSessionManager.notify(progressMsg);
          if (onUpdate) {
            onUpdate(
              { ...globalSessions },
              { ...globalStatus },
              { ...globalLoading },
              progressMsg,
            );
          }

          try {
            const session = await loadModelFromAssets(model.file);
            globalSessions[model.key] = session;
            globalStatus[model.key] = true;
          } catch (modelErr) {
            console.error(`Error loading model ${model.key}:`, modelErr);
            globalStatus[model.key] = false;
          } finally {
            globalLoading[model.key] = false;
            ModelSessionManager.notify();
            if (onUpdate) {
              onUpdate(
                { ...globalSessions },
                { ...globalStatus },
                { ...globalLoading },
              );
            }
          }
        }
      } finally {
        activeLoadPromise = null;
      }
      return {
        sessions: { ...globalSessions },
        status: { ...globalStatus },
      };
    })();

    return activeLoadPromise;
  },

  releaseAll: () => {
    Object.keys(globalSessions).forEach(key => {
      try {
        globalSessions[key]?.release?.();
      } catch (e) {
        console.warn('Error releasing session:', key, e);
      }
      globalSessions[key] = null;
      globalStatus[key] = false;
      globalLoading[key] = false;
    });
    ModelSessionManager.notify('All models released');
  },
};

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
export const getLatLon = coordsObj => {
  if (!coordsObj) return { lat: 'N/A', lon: 'N/A' };
  const lat =
    coordsObj.latitude ?? coordsObj.lat ?? coordsObj.coords?.latitude ?? 'N/A';
  const lon =
    coordsObj.longitude ??
    coordsObj.long ??
    coordsObj.lon ??
    coordsObj.lng ??
    coordsObj.coords?.longitude ??
    'N/A';
  return {
    lat: typeof lat === 'number' ? lat.toFixed(6) : String(lat),
    lon: typeof lon === 'number' ? lon.toFixed(6) : String(lon),
  };
};
export const formatWatermarkText = coordsObj => {
  const { lat, lon } = getLatLon(coordsObj);
  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(now);
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now);

  return `Date: ${formattedDate}   Time: ${formattedTime}\nLocation: Lat: ${lat}, Lon: ${lon}`;
};

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
  const [isCameraActive, setIsCameraActive] = useState(false);

  const device = useCameraDevice('back');
  const cameraRef = useRef(null);
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
    setIsCameraActive(false);
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

  // ── Take photo via Vision Camera ──
  const takePhoto = useCallback(async () => {
    setisReady(false);
    clearActiveTimeout();
    try {
      const permission = await Camera.getCameraPermissionStatus();
      if (permission === 'granted') {
        setIsCameraActive(true);
      } else {
        const newPermission = await Camera.requestCameraPermission();
        if (newPermission === 'granted') {
          setIsCameraActive(true);
        } else {
          CustomAlert(
            'Permission Denied',
            'Camera permission is required to capture photos.',
            true,
            'OK',
          );
        }
      }
    } catch (error) {
      console.error('Camera permission error:', error);
      CustomAlert('Error', 'Failed to request camera permission.', true, 'OK');
    }
  }, [clearActiveTimeout]);
  const handleCapturePhoto = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        enableShutterSound: false,
        qualityPrioritization: 'quality', // Locks auto-focus for sharp photos
      });

      setIsCameraActive(false);

      if (!photo?.path) {
        CustomAlert('Error', 'No image captured', true, 'OK');
        return;
      }

      const rawUri = photo.path.startsWith('file://')
        ? photo.path
        : `file://${photo.path}`;
      const fileName = photo.path.split('/').pop() || `photo_${Date.now()}.jpg`;

      const asset = {
        uri: rawUri,
        fileName: fileName,
        width: photo.width,
        height: photo.height,
      };

      if (!isMountedRef.current) return;

      setResult(null);
      setLoading(false);
      setImage(asset);
      try {
        const timestamp = Date.now();
        const destFileName = asset.fileName || `photo_${timestamp}.jpg`;
        const { lat, lon } = getLatLon(mapLatLon);
        const watermarkText = formatWatermarkText(mapLatLon);
        const destPath = `${RNFS.DocumentDirectoryPath}/${destFileName}`;

        // Dynamic font and margin sizing based on photo resolution
        const imgWidth = photo.width || 1200;
        const dynamicFontSize = Math.max(36, Math.round(imgWidth * 0.035));
        const dynamicMargin = Math.max(25, Math.round(imgWidth * 0.03));

        const options = {
          backgroundImage: {
            src: asset.uri,
            scale: 1,
          },
          watermarkTexts: [
            {
              text: watermarkText,
              position: {
                position: Position.bottomLeft,
                X: dynamicMargin,
                Y: dynamicMargin,
              },
              positionOptions: {
                position: Position.bottomLeft,
                X: dynamicMargin,
                Y: dynamicMargin,
              },
              style: {
                color: '#FFFFFF',
                fontSize: dynamicFontSize,
                fontSizeRatio: 0.045,
                fontName: Fonts.Medium || 'Arial',
                shadowStyle: {
                  dx: 2,
                  dy: 2,
                  radius: 3,
                  color: '#000000',
                },
                textBackgroundStyle: {
                  paddingX: Math.round(dynamicFontSize * 0.7),
                  paddingY: Math.round(dynamicFontSize * 0.5),
                  color: '#000000A0',
                },
              },
            },
          ],
          watermarkImage: {
            src: APP_LOGO,
            position: {
              position: Position.bottomRight,
              X: dynamicMargin,
              Y: dynamicMargin,
            },
            positionOptions: {
              position: Position.bottomRight,
              X: dynamicMargin,
              Y: dynamicMargin,
            },
            scale: 0.35,
            alpha: 0.95,
          },
          quality: 100,
          filename: destFileName.replace('.jpg', ''),
          saveFormat: ImageFormat?.JPEG || 'JPEG',
        };

        const markedPath = await Marker.markText(options);
        const cleanPath = markedPath.startsWith('file://')
          ? markedPath.replace('file://', '')
          : markedPath;

        if (cleanPath !== destPath && (await RNFS.exists(cleanPath))) {
          await RNFS.copyFile(cleanPath, destPath);
        }

        const watermarkedAsset = {
          uri: `file://${destPath}`,
          fileName: destFileName,
          width: photo.width,
          height: photo.height,
        };

        setImage(watermarkedAsset);

        if (isMountedRef.current) {
          updatePipeDetailsState(destPath, destFileName, lat, lon);
          if (ai_camera_pipe_image != '1') {
            setisReady(true);
          }
        }
      } catch (error) {
        console.log('Marker Error:', error);
        setImage(asset);
        CustomAlert('Watermark Error', String(error?.message || error), true, 'OK');
      }
    } catch (error) {
      console.error('Capture Error:', error);
      CustomAlert('Camera Error', String(error?.message || error), true, 'OK');
    }
  }, [
    ai_camera_pipe_image,
    mapLatLon,
    updatePipeDetailsState,
  ]);


  const completeProcess = useCallback(() => {
    try {
      setAIModalVisible(false);
    } catch (e) {
      console.error('Error in completeProcess:', e);
    }
  }, [setAIModalVisible]);

  // ── Run models sequentially to eliminate concurrent memory peaks ──
  const runAllModels = useCallback(
    async imageUri => {
      const activeSessions = {
        ...ModelSessionManager.getSessions(),
        ...(sessions || {}),
      };
      const tensor = await imageToTensor(imageUri);
      // Sequential execution prevents spike of 5 simultaneous execution graphs in RAM
      const clarity = activeSessions?.clarity
        ? await runSingleModel(activeSessions.clarity, tensor)
        : 0;
      const obstacle = activeSessions?.obstacle
        ? await runSingleModel(activeSessions.obstacle, tensor)
        : 0;
      const pipe = activeSessions?.pipe
        ? await runSingleModel(activeSessions.pipe, tensor)
        : 0;
      const moisture = activeSessions?.moisture
        ? await runSingleModel(activeSessions.moisture, tensor)
        : 0;
      const ruler = activeSessions?.ruler
        ? await runSingleModel(activeSessions.ruler, tensor)
        : 0;

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

  const activeStatus = useMemo(
    () => ({
      ...ModelSessionManager.getStatus(),
      ...(modelStatus || {}),
    }),
    [modelStatus],
  );

  const activeLoading = useMemo(
    () => ({
      ...ModelSessionManager.getLoading(),
      ...(modelLoading || {}),
    }),
    [modelLoading],
  );

  const coreModelsReady = useMemo(
    () => Boolean(activeStatus?.clarity && activeStatus?.obstacle && activeStatus?.pipe),
    [activeStatus?.clarity, activeStatus?.obstacle, activeStatus?.pipe],
  );

  const anyModelLoading = useMemo(
    () => Object.values(activeLoading || {}).some(v => v === true),
    [activeLoading],
  );

  return (
    <Modal
      visible={AIModalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleCloseModal}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

        {/* Vision Camera 1:1 Capture Modal */}
        <Modal
          visible={isCameraActive}
          animationType="slide"
          onRequestClose={() => setIsCameraActive(false)}>
          <SafeAreaView style={styles.cameraContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            {/* Top Bar with Close Button & 1:1 indicator */}
            <View style={styles.cameraTopBar}>
              <TouchableOpacity
                style={styles.cameraCloseBtn}
                onPress={() => setIsCameraActive(false)}>
                <Text style={styles.cameraCloseBtnText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.cameraRatioLabel}>1:1</Text>
              <View style={{ width: 44 }} />
            </View>

            {/* 1:1 Square Viewfinder */}
            <View style={styles.cameraSquareWrapper}>
              {device ? (
                <Camera
                  ref={cameraRef}
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={isCameraActive}
                  photo={true}
                  resizeMode="cover"
                  outputOrientation="preview"
                  qualityPrioritization='quality'
                />
              ) : (
                <View style={styles.cameraLoading}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={styles.cameraLoadingText}>Loading camera...</Text>
                </View>
              )}
            </View>

            {/* Bottom Bar with Shutter Button */}
            <View style={styles.cameraBottomBar}>
              <TouchableOpacity
                style={styles.captureBtnOuter}
                onPress={handleCapturePhoto}
                activeOpacity={0.7}>
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

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
                      loaded={activeStatus[m.key]}
                      label={m.label}
                      loading={activeLoading[m.key]}
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
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cameraSquareWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    overflow: 'hidden',
    backgroundColor: '#111827',
    position: 'relative',
    alignSelf: 'center',
  },
  cameraLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  cameraLoadingText: {
    color: '#ffffff',
    marginTop: 12,
    fontSize: 14,
    fontFamily: Fonts.Medium,
  },
  cameraTopBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  cameraCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraCloseBtnText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cameraRatioLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.Medium,
  },
  cameraBottomBar: {
    width: '100%',
    paddingBottom: 30,
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  captureBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
  },
});
