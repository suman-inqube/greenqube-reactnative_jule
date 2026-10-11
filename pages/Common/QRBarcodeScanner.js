import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from "react-native-vision-camera";
import {
  CameraHighlights,
  useBarcodeScanner,
} from "@mgcrea/vision-camera-barcode-scanner";
import { Worklets } from "react-native-worklets-core";

export default function QRBarcodeScanner({ onScanned }) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [scannedCode, setScannedCode] = useState(null);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // JS callback safely executed when single QR code is auto detected
  const onCodesDetected = useCallback(
    Worklets.createRunOnJS((barcodes) => {
      if (scannedCode) return; // Only scan 1 single QR code

      if (barcodes && barcodes.length > 0) {
        const first = barcodes[0];
        setScannedCode({
          value: first.value ?? "Unknown",
          type: first.type ?? "QR",
        });
      }
    }),
    [scannedCode],
  );

  // Scan only single QR code type
  const { props: cameraProps, highlights } = useBarcodeScanner({
    fps: 5,
    barcodeTypes: ["qr"],
    onBarcodeScanned: (barcodes) => {
      "worklet";
      if (barcodes.length > 0) {
        onCodesDetected(barcodes);
      }
    },
  });

  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1920, height: 1080 } },
  ]);

  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.text}>No Camera Permission</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.text}>No Camera Device Found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        format={format}
        isActive={!scannedCode}
        {...cameraProps}
      />

      {/* Auto-detected real-time bounding box borders */}
      <CameraHighlights highlights={highlights} color="#00E676" />

      {/* Scanned Single QR Code Result Card */}
      {scannedCode && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Scanned QR Code Result</Text>
          <View style={styles.codeItem}>
            <Text style={styles.codeType}>Type: {scannedCode.type}</Text>
            <Text style={styles.codeValue} selectable={true}>
              {scannedCode.value}
            </Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelBtn]}
              onPress={() => setScannedCode(null)}
            >
              <Text style={styles.cancelBtnText}>Scan Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.okBtn]}
              onPress={() => {
                onScanned?.(scannedCode);
                setScannedCode(null);
              }}
            >
              <Text style={styles.okBtnText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
  resultContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "rgba(20, 20, 25, 0.95)",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#00E676",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  codeItem: {
    marginBottom: 12,
  },
  codeType: {
    fontSize: 12,
    color: "#9E9E9E",
    marginBottom: 2,
  },
  codeValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  okBtn: {
    backgroundColor: '#00E676',
  },
  okBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});