import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';

export default function QRBarcodeScanner({onScanned}) {
  const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);
  const [scannedValue, setScannedValue] = useState(null);

  // Ask camera permission
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'upc-e'],
    onCodeScanned: codes => {
      if (scannedValue) return;

      if (codes.length > 0) {
        const value = codes[0]?.value;
        if (!value) return;
// console.log('value==', value);
        setScannedValue(value);
        onScanned?.(value);
      }
    },
  });

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#000'}}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!scannedValue}
        codeScanner={codeScanner}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.scanBox} />
        <Text style={styles.hint}>Align QR / Barcode inside the box</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBox: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: '#00FF00',
    borderRadius: 12,
  },
  hint: {
    marginTop: 20,
    color: '#fff',
    fontSize: 16,
  },
});
