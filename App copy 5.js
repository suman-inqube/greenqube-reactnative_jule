import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';

import DocumentScanner from 'react-native-document-scanner-plugin';
import TextRecognition from '@react-native-ml-kit/text-recognition';

const App = () => {
  // =========================
  // CLEAN TEXT
  // =========================

  const cleanText = text => {
    return text
      ?.toLowerCase()
      ?.replace(/[^a-z ]/g, '')
      ?.trim();
  };

  // =========================
  // DOCUMENT TYPE
  // =========================

  const detectDocumentType = text => {
    const normalized = text
      .toLowerCase()
      .replace(/\s/g, '');

    // Aadhaar
    if (
      normalized.includes('uidai') ||
      normalized.includes('governmentofindia') ||
      /\d{4}\s?\d{4}\s?\d{4}/.test(text)
    ) {
      return 'Aadhaar Card';
    }

    // Voter
    if (
      normalized.includes(
        'electioncommissionofindia',
      ) ||
      normalized.includes('elector') ||
      /[A-Z]{3}[0-9]{7}/i.test(text)
    ) {
      return 'Voter Card';
    }

    return 'Unknown';
  };

  // =========================
  // NAME EXTRACTOR
  // =========================

  const getOwnerName = (rawText, documentType) => {
    const lines = rawText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 1);

    console.log('OCR LINES:', lines);

    const ignoreWords = [
      'government',
      'india',
      'uidai',
      'aadhaar',
      'male',
      'female',
      'dob',
      'birth',
      'year',
      'father',
      'husband',
      'address',
      'elector',
      'identity',
      'card',
      'election',
      'commission',
      'epic',
      'signature',
    ];

    // Remove bad lines
    const filtered = lines.filter(line => {
      const lower = line.toLowerCase();

      const hasIgnore = ignoreWords.some(word =>
        lower.includes(word),
      );

      const hasBigNumber = /\d{4,}/.test(lower);

      return !hasIgnore && !hasBigNumber;
    });

    console.log('FILTERED:', filtered);

    // =========================
    // AADHAAR LOGIC
    // =========================

    if (documentType === 'Aadhaar Card') {
      for (let line of filtered) {
        const words = line.split(' ');

        if (
          words.length >= 2 &&
          words.length <= 4
        ) {
          return line;
        }
      }
    }

    // =========================
    // VOTER LOGIC
    // =========================

    if (documentType === 'Voter Card') {
      for (let line of filtered) {
        const words = line.split(' ');

        if (
          words.length >= 2 &&
          words.length <= 5 &&
          /^[A-Za-z ]+$/.test(line)
        ) {
          return line;
        }
      }
    }

    return filtered[0] || 'Name Not Found';
  };

  // =========================
  // SCAN DOCUMENT
  // =========================

  const scanDocument = async () => {
    try {
      const result = await DocumentScanner.scanDocument({
        maxNumDocuments: 1,
        letUserAdjustCrop: true,
        responseType: 'imageFilePath',
        croppedImageQuality: 100,
      });

      if (
        result.scannedImages &&
        result.scannedImages.length > 0
      ) {
        const uri = result.scannedImages[0];

        // OCR
        const ocr =
          await TextRecognition.recognize(uri);

        const rawText = ocr.text;

        console.log('RAW OCR:', rawText);

        // Detect document type
        const docType =
          detectDocumentType(rawText);

        console.log('DOC TYPE:', docType);

        if (docType === 'Unknown') {
          Alert.alert(
            'Invalid Document',
            'Please scan Aadhaar or Voter Card',
          );
          return;
        }

        // Extract owner name
        const ownerName = getOwnerName(
          rawText,
          docType,
        );

        console.log('OWNER NAME:', ownerName);

        Alert.alert(
          'Success',
          `Document Type: ${docType}\n\nOwner Name: ${ownerName}`,
        );
      }
    } catch (error) {
      console.log('SCAN ERROR:', error);

      Alert.alert(
        'Error',
        'Document scanning failed',
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 30,
        }}>
        Aadhaar & Voter OCR
      </Text>

      <TouchableOpacity
        onPress={scanDocument}
        style={{
          backgroundColor: '#007bff',
          paddingVertical: 14,
          paddingHorizontal: 30,
          borderRadius: 10,
        }}>
        <Text
          style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
          }}>
          Scan Document
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default App;