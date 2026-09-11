// hooks/useAnalysis.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert, InteractionManager, Platform, PermissionsAndroid } from 'react-native';
import * as ort from 'onnxruntime-react-native';
import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
import AsyncStorage from 'react-native-encrypted-storage';
import CustomAlert from '../Common/CustomAlert';
import { launchCamera } from 'react-native-image-picker';
import { captureRef } from 'react-native-view-shot';

global.Buffer = Buffer;

// ============================================
// CONSTANTS
// ============================================
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
    key: 'soil',
    file: 'soil_visibility_classifier_simplified.onnx',
    label: 'Soil Visibility',
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

const ZIP_URL =
  'https://grq-img-store.sgp1.cdn.digitaloceanspaces.com/prod/classifiers_zip/latest.zip';

const STORAGE_KEYS = {
  MODELS_DOWNLOADED: '@models_downloaded',
  MODELS_VERSION: '@models_version',
};

const IMAGE_SIZE = 224;
const IMAGE_AREA = IMAGE_SIZE * IMAGE_SIZE;

// ============================================
// UTILITY FUNCTIONS
// ============================================
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const sigmoid = logit =>
  logit >= 0
    ? 1 / (1 + Math.exp(-logit))
    : Math.exp(logit) / (1 + Math.exp(logit));

const predict = (logits, positiveLabel, negativeLabel) => {
  if (!logits || logits.length === 0) return { label: 'Invalid', confidence: 0, isPositive: false };

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
};

// ============================================
// DOWNLOAD SERVICE
// ============================================
class DownloadService {
  static async downloadAndExtract(onProgress, onStageChange) {
    const zipPath = `${RNFS.DocumentDirectoryPath}/models_temp.zip`;
    const extractPath = RNFS.DocumentDirectoryPath;

    if (await RNFS.exists(zipPath)) {
      await RNFS.unlink(zipPath).catch(() => { });
    }

    onStageChange?.('downloading', 0);
    console.log('📥 Zip download start:', ZIP_URL);

    const download = RNFS.downloadFile({
      fromUrl: ZIP_URL,
      toFile: zipPath,
      progress: res => {
        const pct =
          res.contentLength > 0
            ? Math.round((res.bytesWritten / res.contentLength) * 100)
            : 0;
        onProgress?.(pct);
      },
      progressDivider: 4,
      connectionTimeout: 30000,
      readTimeout: 60000,
    });

    const dlResult = await download.promise;

    if (dlResult.statusCode !== 200) {
      if (await RNFS.exists(zipPath)) await RNFS.unlink(zipPath).catch(() => { });
      throw new Error(`Download failed: HTTP ${dlResult.statusCode}`);
    }
    console.log('✅ Zip download complete');

    onStageChange?.('extracting', 0);
    console.log('📦 Zip extract is in progress...');

    try {
      await unzip(zipPath, extractPath);
      console.log('✅ Extract complete');
    } catch (err) {
      throw new Error(`Extract failed: ${err.message}`);
    } finally {
      if (await RNFS.exists(zipPath)) {
        await RNFS.unlink(zipPath).catch(() => { });
      }
    }

    onStageChange?.('verifying', 0);
    const missing = [];
    for (const model of MODELS.filter(m => m.required)) {
      const exists = await RNFS.exists(`${extractPath}/${model.file}`);
      if (!exists) missing.push(model.label);
    }

    if (missing.length > 0) {
      throw new Error(`Models not found: ${missing.join(', ')}`);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.MODELS_DOWNLOADED, 'true');
    await AsyncStorage.setItem(
      STORAGE_KEYS.MODELS_VERSION,
      Date.now().toString(),
    );

    onStageChange?.('complete', 100);
    console.log('✅ Models ready');
    return true;
  }

  static async areModelsDownloaded() {
    const downloaded = await AsyncStorage.getItem(STORAGE_KEYS.MODELS_DOWNLOADED);
    if (downloaded !== 'true') return false;

    for (const model of MODELS.filter(m => m.required)) {
      const exists = await RNFS.exists(`${RNFS.DocumentDirectoryPath}/${model.file}`);
      if (!exists) return false;
    }
    return true;
  }

  static async deleteAllModels() {
    for (const model of MODELS) {
      const path = `${RNFS.DocumentDirectoryPath}/${model.file}`;
      if (await RNFS.exists(path)) await RNFS.unlink(path).catch(() => { });
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.MODELS_DOWNLOADED);
    await AsyncStorage.removeItem(STORAGE_KEYS.MODELS_VERSION);
  }
}

// ============================================
// MODEL LOADING (OPTIMIZED FOR LOW-END PHONES)
// ============================================
const loadModel = async (fileName, retries = 2) => {
  const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

  // Session options tuned for budget Android processors (low CPU thread contention)
  const sessionOptions = {
    intraOpNumThreads: 1, // Single thread per op prevents freezing low-end CPU cores
    interOpNumThreads: 1,
    executionMode: 'sequential',
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const exists = await RNFS.exists(destPath);
      if (!exists) {
        throw new Error(`Model ${fileName} not found`);
      }
      console.log(`Creating session: ${fileName}...`);
      const session = await ort.InferenceSession.create(destPath, sessionOptions);
      console.log(`✅ Session created: ${fileName}`);
      return session;
    } catch (e) {
      console.error(`Attempt ${attempt} failed (${fileName}):`, e);
      if (attempt === retries) throw e;
      await sleep(500);
    }
  }
};

// ============================================
// IMAGE PROCESSING (LOW MEMORY FOOTPRINT)
// ============================================
const imageToTensor = async uri => {
  let resizedUri = null;
  try {
    // 224x224 resize with optimal 70% JPEG quality for fast decoding on budget CPUs
    const resized = await ImageResizer.createResizedImage(
      uri,
      IMAGE_SIZE,
      IMAGE_SIZE,
      'JPEG',
      70,
    );
    resizedUri = resized.uri;

    const base64Data = await RNFS.readFile(resized.uri, 'base64');
    const raw = jpeg.decode(Buffer.from(base64Data, 'base64'), { useTArray: true });
    const { data } = raw;
    const floatData = new Float32Array(3 * IMAGE_AREA);

    // Single-pass flat array normalization (CHW format)
    for (let i = 0, p = 0; p < IMAGE_AREA; i += 4, p++) {
      floatData[p] = data[i] / 255.0;
      floatData[p + IMAGE_AREA] = data[i + 1] / 255.0;
      floatData[p + (IMAGE_AREA * 2)] = data[i + 2] / 255.0;
    }

    return new ort.Tensor('float32', floatData, [1, 3, IMAGE_SIZE, IMAGE_SIZE]);
  } finally {
    // Immediately unlink temporary resized file to keep low storage usage
    if (resizedUri) {
      RNFS.unlink(resizedUri).catch(() => { });
    }
  }
};

// ============================================
// MAIN ANALYSIS HOOK
// ============================================
export default function useAnalysis() {
  const [sessions, setSessions] = useState({
    clarity: null,
    obstacle: null,
    pipe: null,
    soil: null,
    ruler: null,
  });

  const [modelStatus, setModelStatus] = useState({
    clarity: false,
    obstacle: false,
    pipe: false,
    soil: false,
    ruler: false,
  });

  const [modelLoading, setModelLoading] = useState({
    clarity: false,
    obstacle: false,
    pipe: false,
    soil: false,
    ruler: false,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingModels, setLoadingModels] = useState(true);
  const [loadProgress, setLoadProgress] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);

  // Track component mounted status & active timeouts for clean teardown
  const isMountedRef = useRef(true);
  const timeoutsRef = useRef(new Set());
  const captureTimerRef = useRef(null);

  const safeSetTimeout = useCallback((fn, delay) => {
    const timerId = setTimeout(() => {
      timeoutsRef.current.delete(timerId);
      if (isMountedRef.current) {
        fn();
      }
    }, delay);
    timeoutsRef.current.add(timerId);
    return timerId;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (captureTimerRef.current) {
        clearTimeout(captureTimerRef.current);
        captureTimerRef.current = null;
      }
      timeoutsRef.current.forEach(id => clearTimeout(id));
      timeoutsRef.current.clear();
    };
  }, []);

  // Keep a ref to sessions to avoid stale closures in callbacks
  const sessionsRef = useRef(sessions);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  // Load optional models gently one-by-one with pauses to avoid memory spikes
  const loadOptionalModels = useCallback(async () => {
    console.log('Loading optional models on background thread...');
    for (const model of MODELS.filter(m => !m.required)) {
      if (!isMountedRef.current) return;
      if (sessionsRef.current[model.key]) continue;

      setModelLoading(prev => ({ ...prev, [model.key]: true }));
      setLoadProgress(`${model.label}...`);
      try {
        await sleep(300); // Give GC time to breathe on low-RAM devices
        if (!isMountedRef.current) return;
        const session = await loadModel(model.file);
        if (!isMountedRef.current) return;
        setSessions(prev => ({ ...prev, [model.key]: session }));
        setModelStatus(prev => ({ ...prev, [model.key]: true }));
        console.log(`✅ ${model.label} loaded`);
      } catch (e) {
        console.warn(`Optional model ${model.label} skipped:`, e.message);
        if (isMountedRef.current) {
          setModelStatus(prev => ({ ...prev, [model.key]: false }));
        }
      } finally {
        if (isMountedRef.current) {
          setModelLoading(prev => ({ ...prev, [model.key]: false }));
        }
      }
    }
    if (isMountedRef.current) {
      setLoadProgress('');
    }
  }, []);

  const loadAllModels = useCallback(async () => {
    setLoadingModels(true);

    try {
      // Load required core models sequentially with small breaks
      for (const model of MODELS.filter(m => m.required)) {
        if (!isMountedRef.current) return;
        if (sessionsRef.current[model.key]) continue;

        setModelLoading(prev => ({ ...prev, [model.key]: true }));
        setLoadProgress(`Loading ${model.label}...`);
        try {
          const session = await loadModel(model.file);
          if (!isMountedRef.current) return;
          setSessions(prev => ({ ...prev, [model.key]: session }));
          setModelStatus(prev => ({ ...prev, [model.key]: true }));
          console.log(`✅ ${model.label} loaded`);
          await sleep(150);
        } catch (e) {
          console.error(`❌ ${model.label} failed:`, e);
          if (isMountedRef.current) {
            setModelStatus(prev => ({ ...prev, [model.key]: false }));
          }
          throw e;
        } finally {
          if (isMountedRef.current) {
            setModelLoading(prev => ({ ...prev, [model.key]: false }));
          }
        }
      }

      if (isMountedRef.current) {
        setLoadProgress('Models ready!');
        setModelsReady(true);
        safeSetTimeout(() => {
          if (isMountedRef.current) setLoadProgress('');
        }, 1500);
      }

      // Load optional models non-intrusively after UI interactions settle
      InteractionManager.runAfterInteractions(() => {
        safeSetTimeout(() => loadOptionalModels(), 1000);
      });
    } finally {
      if (isMountedRef.current) {
        setLoadingModels(false);
      }
    }
  }, [loadOptionalModels, safeSetTimeout]);

  const downloadModels = useCallback(
    async onStageChange => {
      setIsDownloading(true);
      setDownloadProgress(0);

      try {
        await DownloadService.downloadAndExtract(
          pct => setDownloadProgress(pct),
          onStageChange,
        );

        await loadAllModels();
        return true;
      } catch (error) {
        console.error('Download failed:', error);
        throw error;
      } finally {
        setIsDownloading(false);
      }
    },
    [loadAllModels],
  );

  const checkModels = useCallback(async () => {
    const downloaded = await DownloadService.areModelsDownloaded();
    if (downloaded) {
      try {
        await loadAllModels();
        return true;
      } catch (error) {
        console.error('Failed to load models:', error);
        return false;
      }
    }
    return false;
  }, [loadAllModels]);

  // Optimized runAnalysis: safe execution with memory protection for low-end devices
  const runAnalysis = useCallback(async imageUri => {
    console.log('Running analysis on image:', imageUri);
    const { clarity, obstacle, pipe, soil, ruler } = sessionsRef.current;

    if (!imageUri) {
      Alert.alert('No Image', 'Please select an image first.');
      return null;
    }
    if (!clarity || !obstacle || !pipe) {
      Alert.alert('Models Loading', 'Please wait for AI models to finish loading.');
      return null;
    }

    setLoading(true);
    setResult(null);
    let tensor = null;

    try {
      tensor = await imageToTensor(imageUri);

      // 1. Run Clarity first
      const cOut = await clarity.run({ [clarity.inputNames[0]]: tensor });
      const clarityResult = predict(
        Array.from(cOut[clarity.outputNames[0]].data),
        'Clear',
        'Not Clear',
      );

      // 2. Run Obstacle
      const oOut = await obstacle.run({ [obstacle.inputNames[0]]: tensor });
      const obstacleResult = predict(
        Array.from(oOut[obstacle.outputNames[0]].data),
        'Obstacle Present',
        'No Obstacle',
      );

      // 3. Run Pipe
      const pOut = await pipe.run({ [pipe.inputNames[0]]: tensor });
      const pipeResult = predict(
        Array.from(pOut[pipe.outputNames[0]].data),
        'Pipe Present',
        'No Pipe',
      );

      // 4. Run optional Soil model if loaded
      let soilResult = null;
      if (soil) {
        try {
          const sOut = await soil.run({ [soil.inputNames[0]]: tensor });
          soilResult = predict(
            Array.from(sOut[soil.outputNames[0]].data),
            'Soil Visible',
            'No Soil',
          );
        } catch (e) {
          console.warn('Soil inference error:', e);
        }
      }

      // 5. Run optional Ruler model if loaded
      let rulerResult = null;
      if (ruler) {
        try {
          const rOut = await ruler.run({ [ruler.inputNames[0]]: tensor });
          rulerResult = predict(
            Array.from(rOut[ruler.outputNames[0]].data),
            'Ruler Present',
            'No Ruler',
          );
        } catch (e) {
          console.warn('Ruler inference error:', e);
        }
      }

      const analysisSummary = {
        clarity: clarityResult,
        obstacle: obstacleResult,
        pipe: pipeResult,
        soil: soilResult,
        ruler: rulerResult,
      };

      setResult(analysisSummary);
      return analysisSummary;
    } catch (e) {
      console.error('Inference error:', e);
      Alert.alert('Analysis Failed', e.message || 'Error executing AI model inference.');
      return null;
    } finally {
      // Crucial for low-end phones: clear tensor buffer & trigger GC cleanup
      if (tensor) {
        try {
          tensor.data = null;
        } catch (_) { }
        tensor = null;
      }
      setLoading(false);
    }
  }, []);

  // Safe pickImageAI with options object and fallbacks
  const pickImageAI = useCallback(
    async optionsConfig => {
      const {
        mapLatLon,
        setTempImage,
        setTempText,
        setSelectedImagePipe,
        setPipeDetails,
        watermarkViewRef,
        cameraItem = 'photo',
        replaceImgKey = { arrayPosition: '', imgPosition: '' },
        setModalVisibleMap,
        onAnalysisComplete,
      } = optionsConfig || {};

      if (Platform.OS === 'android') {
        try {
          const hasCameraPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.CAMERA,
          );
          if (!hasCameraPermission) {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.CAMERA,
              {
                title: 'Camera Permission',
                message: 'GreenQube needs access to your camera to take photos.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              CustomAlert('Permission Denied', 'Camera permission is required to take photos.', true, 'OK');
              setModalVisibleMap?.(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Camera permission check error:', err);
        }
      }

      const options = {
        mediaType: 'photo',
        cameraType: 'back',
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 800,
        quality: 0.4,
        saveToPhotos: false,
      };

      const { latitude: lat, longitude: lon } = mapLatLon || {};

      launchCamera(options, async response => {
        try {
          if (!response) {
            CustomAlert('Camera Error:', 'Response is blank.', true, 'OK');
            return;
          }
          if (response.didCancel) return;
          if (response.errorCode) {
            CustomAlert('Camera Error:', response.errorMessage, true, 'OK');
            return;
          }

          const asset = response.assets?.[0];
          if (!asset?.uri) {
            CustomAlert('Error', 'No image captured', true, 'OK');
            return;
          }

          const responAi = await runAnalysis(asset.uri);
          onAnalysisComplete?.(responAi);

          const timestamp = Date.now();
          const formattedDate = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).format(timestamp);

          const watermarkText = `${formattedDate}\nLat: ${lat || 'N/A'}, Lon: ${lon || 'N/A'}`;
          setTempImage?.(asset.uri);
          setTempText?.(watermarkText);

          if (captureTimerRef.current) {
            clearTimeout(captureTimerRef.current);
            captureTimerRef.current = null;
          }

          captureTimerRef.current = setTimeout(async () => {
            captureTimerRef.current = null;
            if (!isMountedRef.current) return;

            try {
              let finalUri = asset.uri;
              if (watermarkViewRef?.current) {
                finalUri = await captureRef(watermarkViewRef, {
                  format: 'jpg',
                  quality: 1,
                  width: 800,
                  height: 800,
                });
              }

              const fileName = asset.fileName || `photo_${timestamp}.jpg`;
              const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
              await RNFS.copyFile(finalUri, destPath);

              if (isMountedRef.current) {
                setTempImage?.(null);
                setTempText?.('');

                if (!replaceImgKey || replaceImgKey.arrayPosition === '' || replaceImgKey.arrayPosition == null) {
                  setSelectedImagePipe?.(prev => ({
                    ...prev,
                    [cameraItem]: `file://${destPath}`,
                    [`${cameraItem}fileName`]: fileName,
                    [`${cameraItem}Lat`]: lat,
                    [`${cameraItem}Long`]: lon,
                  }));
                } else {
                  const { arrayPosition, imgPosition } = replaceImgKey;
                  setPipeDetails?.(prev => {
                    const updated = JSON.parse(JSON.stringify(prev));
                    if (updated[arrayPosition]?.[1]?.[imgPosition]) {
                      const currentImage = updated[arrayPosition][1][imgPosition];
                      updated[arrayPosition][1][imgPosition] = {
                        ...currentImage,
                        imageURL: `file://${destPath}`,
                        imageName: fileName,
                        status: '',
                        lat,
                        lon,
                      };
                    }
                    return updated;
                  });
                }
              }
              console.log('Watermarked image saved:', destPath);
            } catch (error) {
              console.error('Capture Error:', error);
              if (isMountedRef.current) {
                setTempImage?.(null);
                setTempText?.('');
              }
            }
          }, 600);
        } catch (error) {
          CustomAlert('Catch Error', error.message || String(error), true, 'OK');
        } finally {
          setModalVisibleMap?.(false);
        }
      });
    },
    [runAnalysis],
  );

  return {
    runAnalysis,
    downloadModels,
    checkModels,
    loading,
    result,
    downloadProgress,
    isDownloading,
    modelsReady,
    modelStatus,
    modelLoading,
    loadingModels,
    loadProgress,
    sessions,
    pickImageAI,
    MODELS,
  };
}
