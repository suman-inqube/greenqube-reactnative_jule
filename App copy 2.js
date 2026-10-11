import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
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

const App = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [scannedCodes, setScannedCodes] = useState([]);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  // JS callback invoked safely from the worklet thread
  const onCodesDetected = useCallback(
    Worklets.createRunOnJS((barcodes) => {
      if (barcodes && barcodes.length > 0) {
        const values = barcodes.map((b) => ({
          value: b.value ?? "Unknown",
          type: b.type ?? "Barcode",
        }));
        setScannedCodes(values);
      }
    }),
    [],
  );

  const { props: cameraProps, highlights } = useBarcodeScanner({
    fps: 5,
    barcodeTypes: ["qr", "ean-13", "code-128", "code-39", "upc-a", "upc-e"],
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
        isActive={true}
        {...cameraProps}
      />
      <CameraHighlights highlights={highlights} color="#00E676" />

      {/* Scanned Result Card */}
      {scannedCodes.length > 0 && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Scanned Barcode Result</Text>
          {scannedCodes.map((code, index) => (
            <View key={index} style={styles.codeItem}>
              <Text style={styles.codeType}>Type: {code.type}</Text>
              <Text style={styles.codeValue} selectable={true}>
                {code.value}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setScannedCodes([])}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

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
    backgroundColor: "rgba(20, 20, 25, 0.92)",
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
    marginBottom: 10,
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
  clearButton: {
    marginTop: 6,
    backgroundColor: "#00E676",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default App;