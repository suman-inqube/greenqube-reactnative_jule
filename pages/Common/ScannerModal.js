import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import QRBarcodeScanner from './QRBarcodeScanner';

export default function ScannerModal({ onScan, onClose }) {
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <QRBarcodeScanner
          onScanned={value => {
            onScan(value);
            onClose();
          }}
        />

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#000000aa',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  closeText: {
    color: '#fff',
    fontSize: 14,
  },
});
