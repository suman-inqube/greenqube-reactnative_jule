// hooks/useAnalysis.js
import {useState, useCallback} from 'react';
import {Alert} from 'react-native';
import * as ort from 'onnxruntime-react-native';
import RNFS from 'react-native-fs';
import {unzip} from 'react-native-zip-archive';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import jpeg from 'jpeg-js';
import {Buffer} from 'buffer';
import AsyncStorage from 'react-native-encrypted-storage';
import CustomAlert from '../Common/CustomAlert';
import {launchCamera} from 'react-native-image-picker';
import {captureRef} from 'react-native-view-shot';

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

// ============================================
// UTILITY FUNCTIONS
// ============================================
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const sigmoid = logit =>
  logit >= 0
    ? 1 / (1 + Math.exp(-logit))
    : Math.exp(logit) / (1 + Math.exp(logit));

const predict = (logits, positiveLabel, negativeLabel) => {
  if (!logits || logits.length === 0) return {label: 'Invalid', confidence: 0};

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
      await RNFS.unlink(zipPath);
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
      progressDivider: 2,
      connectionTimeout: 30000,
      readTimeout: 60000,
    });

    const dlResult = await download.promise;

    if (dlResult.statusCode !== 200) {
      if (await RNFS.exists(zipPath)) await RNFS.unlink(zipPath);
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
        await RNFS.unlink(zipPath);
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
    const downloaded = await AsyncStorage.getItem(
      STORAGE_KEYS.MODELS_DOWNLOADED,
    );
    if (downloaded !== 'true') return false;

    for (const model of MODELS.filter(m => m.required)) {
      const exists = await RNFS.exists(
        `${RNFS.DocumentDirectoryPath}/${model.file}`,
      );
      if (!exists) return false;
    }
    return true;
  }

  static async deleteAllModels() {
    for (const model of MODELS) {
      const path = `${RNFS.DocumentDirectoryPath}/${model.file}`;
      if (await RNFS.exists(path)) await RNFS.unlink(path);
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.MODELS_DOWNLOADED);
    await AsyncStorage.removeItem(STORAGE_KEYS.MODELS_VERSION);
  }
}

// ============================================
// MODEL LOADING
// ============================================
const loadModel = async (fileName, retries = 2) => {
  const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!(await RNFS.exists(destPath))) {
        throw new Error(`Model ${fileName} not found`);
      }
      console.log(`Creating session: ${fileName}...`);
      const session = await ort.InferenceSession.create(destPath);
      console.log(`✅ Session created: ${fileName}`);
      return session;
    } catch (e) {
      console.error(`Attempt ${attempt} failed (${fileName}):`, e);
      if (attempt === retries) throw e;
      await sleep(1000);
    }
  }
};

// ============================================
// IMAGE PROCESSING
// ============================================
const imageToTensor = async uri => {
  const resized = await ImageResizer.createResizedImage(
    uri,
    224,
    224,
    'JPEG',
    80,
  );
  const fileData = await RNFS.readFile(resized.uri, 'ascii');
  const raw = jpeg.decode(Buffer.from(fileData, 'binary'), {useTArray: true});
  const {data} = raw;
  const floatData = new Float32Array(1 * 3 * 224 * 224);

  let pixelIndex = 0;
  for (let i = 0; i < data.length; i += 4) {
    floatData[pixelIndex] = data[i] / 255;
    floatData[pixelIndex + 224 * 224] = data[i + 1] / 255;
    floatData[pixelIndex + 2 * 224 * 224] = data[i + 2] / 255;
    pixelIndex++;
  }

  return new ort.Tensor('float32', floatData, [1, 3, 224, 224]);
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
  const [image, setImage] = useState(null);
  const loadOptionalModels = useCallback(async () => {
    console.log('Loading optional models...');
    for (const model of MODELS.filter(m => !m.required)) {
      setModelLoading(prev => ({...prev, [model.key]: true}));
      setLoadProgress(`${model.label} (optional)...`);
      try {
        const session = await loadModel(model.file);
        setSessions(prev => ({...prev, [model.key]: session}));
        setModelStatus(prev => ({...prev, [model.key]: true}));
        console.log(`✅ ${model.label} loaded`);
        await sleep(500);
      } catch (e) {
        console.error(`❌ ${model.label} failed:`, e);
        setModelStatus(prev => ({...prev, [model.key]: false}));
      } finally {
        setModelLoading(prev => ({...prev, [model.key]: false}));
      }
    }
  }, []);

  const loadAllModels = useCallback(async () => {
    setLoadingModels(true);

    for (const model of MODELS.filter(m => m.required)) {
      setModelLoading(prev => ({...prev, [model.key]: true}));
      setLoadProgress(`${model.label}...`);
      try {
        const session = await loadModel(model.file);
        setSessions(prev => ({...prev, [model.key]: session}));
        setModelStatus(prev => ({...prev, [model.key]: true}));
        console.log(`✅ ${model.label} loaded`);
        await sleep(300);
      } catch (e) {
        console.error(`❌ ${model.label} failed:`, e);
        setModelStatus(prev => ({...prev, [model.key]: false}));
        setLoadingModels(false);
        throw e;
      } finally {
        setModelLoading(prev => ({...prev, [model.key]: false}));
      }
    }

    setLoadProgress('Models ready!');
    setModelsReady(true);
    setLoadingModels(false);
    setTimeout(() => setLoadProgress(''), 2000);
    setTimeout(() => loadOptionalModels(), 3000);
  }, [loadOptionalModels]);

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
  const pickImageAI = useCallback(
    (
      mapLatLon,
      setTempImage,
      setTempText,
      setSelectedImagePipe,
      setPipeDetails,
      watermarkViewRef,
    ) => {
      const options = {
        mediaType: 'photo',
        includeBase64: true,
        maxHeight: 800,
        maxWidth: 800,
        includeExtra: true,
      };
      const {latitude: lat, longitude: lon} = mapLatLon || {};
      launchCamera(options, async response => {
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
          //  setImage(asset.assets[0]);
          const responAi = await runAnalysis(asset.uri);
          console.log('AI Analysis Result:', responAi);
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
          setTimeout(async () => {
            try {
              const uri = await captureRef(watermarkViewRef, {
                format: 'jpg',
                quality: 2,
                width: 800,
                height: 800,
              });
              const fileName = asset.fileName || `photo_${timestamp}.jpg`;
              const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
              await RNFS.copyFile(uri, destPath);
              setTempImage(null);
              setTempText('');
              if (replaceImgKey.arrayPosition === '') {
                setSelectedImagePipe(prev => ({
                  ...prev,
                  [cameraItem]: `file://${destPath}`,
                  [`${cameraItem}fileName`]: fileName,
                  [`${cameraItem}Lat`]: lat,
                  [`${cameraItem}Long`]: lon,
                }));
              } else {
                const {arrayPosition, imgPosition} = replaceImgKey;
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
              console.log('Watermarked image saved:', destPath);
            } catch (error) {
              console.log('Capture Error:', error);
              setTempImage(null);
              setTempText('');
            }
          }, 5000);
        } catch (error) {
          CustomAlert('Catch Error ', error, true, 'OK');
        } finally {
          setModalVisibleMap(false);
        }
      });
    },
    [],
  );

  const runAnalysis = useCallback(
    async imageUri => {
      console.log('Running analysis on image:', imageUri);
      const {clarity, obstacle, pipe} = sessions;

      if (!imageUri) {
        Alert.alert('No Image', 'Please select an image first.');
        return;
      }
      if (!clarity || !obstacle || !pipe) {
        Alert.alert('Models Loading', 'Please wait for models to load.');
        return;
      }

      setLoading(true);
      setResult(null);
      let tensor = null;
      try {
        tensor = await imageToTensor(imageUri);
        const [cOut, oOut, pOut] = await Promise.all([
          clarity.run({[clarity.inputNames[0]]: tensor}),
          obstacle.run({[obstacle.inputNames[0]]: tensor}),
          pipe.run({[pipe.inputNames[0]]: tensor}),
        ]);
        const clarityResult = predict(
          Array.from(cOut[clarity.outputNames[0]].data),
          'Clear',
          'Not Clear',
        );
        const obstacleResult = predict(
          Array.from(oOut[obstacle.outputNames[0]].data),
          'Obstacle Present',
          'No Obstacle',
        );
        const pipeResult = predict(
          Array.from(pOut[pipe.outputNames[0]].data),
          'Pipe Present',
          'No Pipe',
        );
        let soilResult = null;
        let rulerResult = null;

        if (sessions.soil) {
          try {
            const sOut = await sessions.soil.run({
              [sessions.soil.inputNames[0]]: tensor,
            });
            soilResult = predict(
              Array.from(sOut[sessions.soil.outputNames[0]].data),
              'Soil Visible',
              'No Soil',
            );
          } catch (e) {
            console.error('Soil model failed:', e);
          }
        }

        if (sessions.ruler) {
          try {
            const rOut = await sessions.ruler.run({
              [sessions.ruler.inputNames[0]]: tensor,
            });
            rulerResult = predict(
              Array.from(rOut[sessions.ruler.outputNames[0]].data),
              'Ruler Present',
              'No Ruler',
            );
          } catch (e) {
            console.error('Ruler model failed:', e);
          }
        }

        setResult({
          clarity: clarityResult,
          obstacle: obstacleResult,
          pipe: pipeResult,
          soil: soilResult,
          ruler: rulerResult,
        });
        return true;
      } catch (e) {
        console.error('Inference error:', e);
        Alert.alert('Analysis Failed', e.message);
      } finally {
        if (tensor) {
          tensor.data = null;
          tensor = null;
        }
        if (global.gc) global.gc();
        setLoading(false);
      }
    },
    [sessions],
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
