import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Vibration,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCodeScanner,
} from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_BOX_SIZE = Math.min(SCREEN_WIDTH * 0.74, 280);

const App = () => {
  const cameraRef = useRef(null);
  const device = useCameraDevice('back');

  // Optimal 1080p format for sharp code scanning
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1920, height: 1080 } },
    { fps: 60 },
  ]);

  const [hasPermission, setHasPermission] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [scannedResult, setScannedResult] = useState(null);
  const [torch, setTorch] = useState(false);
  const [zoom, setZoom] = useState(1.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const scannedLockRef = useRef(false);
  const animValue = useRef(new Animated.Value(0)).current;

  // Camera permission check
  useEffect(() => {
    (async () => {
      try {
        const status = await Camera.getCameraPermissionStatus();
        if (status === 'granted') {
          setHasPermission(true);
        } else {
          const req = await Camera.requestCameraPermission();
          setHasPermission(req === 'granted');
        }
      } catch (e) {
        console.warn('Permission error:', e);
      } finally {
        setIsCheckingPermission(false);
      }
    })();
  }, []);

  // Smooth Laser Line Animation
  useEffect(() => {
    let loop;
    if (!scannedResult) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    } else {
      animValue.stopAnimation();
    }
    return () => loop?.stop();
  }, [animValue, scannedResult]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_BOX_SIZE - 4],
  });

  // Handle successful code detection
  const onCodeDetected = useCallback((value, source = 'Live Camera') => {
    if (!value || typeof value !== 'string') return;
    const cleanValue = value.trim();
    if (cleanValue.length === 0) return;

    scannedLockRef.current = true;
    setScannedResult(cleanValue);

    try {
      Vibration.vibrate(60);
    } catch (e) {}

    Alert.alert('Scanned QR Code', `Value: ${cleanValue}\nSource: ${source}`);
  }, []);

  // Real-time camera scanner
  const codeScanner = useCodeScanner({
    codeTypes: [
      'qr',
      'ean-13',
      'ean-8',
      'code-128',
      'code-39',
      'upc-e',
      'upc-a',
      'code-93',
      'pdf-417',
      'aztec',
      'data-matrix',
      'itf',
      'codabar',
    ],
    onCodeScanned: codes => {
      if (scannedLockRef.current || scannedResult) return;
      if (codes && codes.length > 0) {
        const val = codes[0]?.value;
        if (val) {
          onCodeDetected(val, 'Live Camera');
        }
      }
    },
  });

  // Smart Multi-Pass Gallery Scanner (Full Image + Cropped/Resized Pipe Area)
  const handlePickFromGallery = async () => {
    try {
      setIsProcessing(true);
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          let codeValue = null;

          // Pass 1: Direct ML Kit Barcode Scan on full image
          try {
            if (BarcodeScanning?.scan) {
              const barcodes = await BarcodeScanning.scan(asset.uri);
              if (barcodes && barcodes.length > 0 && barcodes[0]?.value) {
                codeValue = barcodes[0].value;
              }
            }
          } catch (e) {}

          // Pass 2: Resize / Enhance Contrast for curved/distant pipe images
          if (!codeValue && ImageResizer?.createResizedImage) {
            try {
              const resized = await ImageResizer.createResizedImage(
                asset.uri,
                1200,
                1600,
                'JPEG',
                100,
              );
              if (resized?.uri) {
                const resizedBarcodes = await BarcodeScanning.scan(resized.uri);
                if (resizedBarcodes && resizedBarcodes.length > 0 && resizedBarcodes[0]?.value) {
                  codeValue = resizedBarcodes[0].value;
                }
              }
            } catch (e) {}
          }

          // Pass 3: Text OCR recognition (e.g. RAINTEX or printed ID)
          if (!codeValue && TextRecognition?.recognize) {
            try {
              const ocr = await TextRecognition.recognize(asset.uri);
              if (ocr?.text && ocr.text.trim().length > 0) {
                const lines = ocr.text.split('\n').map(l => l.trim()).filter(Boolean);
                if (lines.length > 0) {
                  codeValue = lines[0];
                }
              }
            } catch (e) {}
          }

          if (codeValue) {
            onCodeDetected(codeValue, 'Gallery Image');
          } else {
            Alert.alert(
              'Code Undetected',
              'The QR code in this photo is distorted or covered by tape. Would you like to enter the pipe number manually?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Enter Manually', onPress: () => setManualModalVisible(true) },
              ],
            );
          }
        }
      }
    } catch (err) {
      console.warn('Gallery error:', err);
      Alert.alert('Error', 'Failed to pick or scan image.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit manual code input
  const handleManualSubmit = () => {
    if (manualInput.trim().length === 0) {
      Alert.alert('Empty Input', 'Please enter a valid pipe number or QR value.');
      return;
    }
    setManualModalVisible(false);
    const value = manualInput.trim();
    setManualInput('');
    onCodeDetected(value, 'Manual Entry');
  };

  // Reset scanner to scan again
  const handleRescan = () => {
    scannedLockRef.current = false;
    setScannedResult(null);
  };

  if (isCheckingPermission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.center}>
        <MaterialIcons name="no-photography" size={60} color="#EF4444" />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionSub}>
          Please allow camera access to scan QR codes and barcodes.
        </Text>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={async () => {
            const req = await Camera.requestCameraPermission();
            setHasPermission(req === 'granted');
          }}>
          <Text style={styles.btnPrimaryText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading camera device...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Live Vision Camera */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        format={format}
        isActive={!scannedResult && !manualModalVisible}
        codeScanner={codeScanner}
        zoom={zoom}
        enableZoomGesture={true}
        torch={torch && device.hasTorch ? 'on' : 'off'}
        photo={true}
        video={false}
        audio={false}
        lowLightBoost={device.supportsLowLightBoost ?? false}
        resizeMode="cover"
      />

      {/* Header Bar */}
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>QR & Barcode Scanner</Text>
        {device.hasTorch && (
          <TouchableOpacity
            style={[styles.iconBtn, torch && styles.iconBtnActive]}
            onPress={() => setTorch(!torch)}>
            <MaterialIcons
              name={torch ? 'flash-on' : 'flash-off'}
              size={22}
              color={torch ? '#FBBF24' : '#FFF'}
            />
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* Viewfinder Target Box with Cutout Mask */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        <View style={styles.mask} />

        <View style={styles.centerRow}>
          <View style={styles.mask} />

          <View style={styles.scanBox}>
            {/* 4 Corner Markers */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Laser Line */}
            {!scannedResult && (
              <Animated.View
                style={[
                  styles.laser,
                  {
                    transform: [{ translateY }],
                  },
                ]}
              />
            )}

            {scannedResult && (
              <View style={styles.successBadge}>
                <MaterialIcons name="check-circle" size={54} color="#10B981" />
                <Text style={styles.successText}>Scanned Successfully!</Text>
              </View>
            )}
          </View>

          <View style={styles.mask} />
        </View>

        {/* Bottom Controls Area */}
        <View style={[styles.mask, styles.bottomArea]}>
          {/* Zoom Controls */}
          <View style={styles.zoomRow}>
            {[1, 1.5, 2, 2.5].map(z => (
              <TouchableOpacity
                key={z}
                style={[styles.zoomBtn, zoom === z && styles.zoomBtnActive]}
                onPress={() => setZoom(z)}>
                <Text
                  style={[
                    styles.zoomBtnText,
                    zoom === z && styles.zoomBtnTextActive,
                  ]}>
                  {z}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Scanned Value Display Card */}
          {scannedResult ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>SCANNED VALUE:</Text>
              <Text style={styles.resultValue} numberOfLines={2}>
                {scannedResult}
              </Text>
              <TouchableOpacity style={styles.rescanBtn} onPress={handleRescan}>
                <MaterialIcons name="refresh" size={20} color="#FFF" />
                <Text style={styles.rescanBtnText}>Scan Next Code</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.instruction}>
              Hold 20 cm from pipe • Or pick from gallery / enter ID
            </Text>
          )}

          {/* Bottom Action Row */}
          <View style={styles.actionRow}>
            {/* Gallery Button */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handlePickFromGallery}
              disabled={isProcessing}>
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <MaterialIcons name="photo-library" size={20} color="#FFF" />
                  <Text style={styles.actionBtnText}>Gallery</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Manual Entry Button */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnManual]}
              onPress={() => setManualModalVisible(true)}>
              <MaterialIcons name="edit" size={20} color="#10B981" />
              <Text style={[styles.actionBtnText, { color: '#10B981' }]}>
                Enter ID
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Manual Code Input Modal */}
      <Modal
        visible={manualModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setManualModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enter Pipe / QR Value</Text>
            <Text style={styles.modalSub}>
              Type the pipe identifier or number printed on the pipe sticker.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 101, AWD-01"
              placeholderTextColor="#9CA3AF"
              value={manualInput}
              onChangeText={setManualInput}
              autoFocus={true}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setManualModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleManualSubmit}>
                <Text style={styles.modalSubmitText}>Submit Value</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#9CA3AF',
    fontSize: 15,
  },
  permissionTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  permissionSub: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  btnPrimary: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  btnPrimaryText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 16 : 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconBtnActive: {
    backgroundColor: 'rgba(251,191,36,0.25)',
    borderColor: '#FBBF24',
  },
  overlayContainer: {
    flex: 1,
    zIndex: 10,
  },
  mask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  centerRow: {
    flexDirection: 'row',
    height: SCAN_BOX_SIZE,
  },
  scanBox: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: '#10B981',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  laser: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: '#10B981',
    borderRadius: 2,
    shadowColor: '#10B981',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  successBadge: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16,185,129,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    marginTop: 8,
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomArea: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingHorizontal: 20,
  },
  zoomRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 18,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  zoomBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  zoomBtnActive: {
    backgroundColor: '#10B981',
  },
  zoomBtnText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  zoomBtnTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  instruction: {
    color: '#D1D5DB',
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 8,
  },
  resultCard: {
    width: '100%',
    backgroundColor: 'rgba(17,24,39,0.95)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
    marginVertical: 6,
  },
  resultLabel: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  resultValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  rescanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  rescanBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  actionBtnManual: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderColor: '#10B981',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
    lineHeight: 18,
  },
  modalInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    color: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  modalCancelText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalSubmitText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});