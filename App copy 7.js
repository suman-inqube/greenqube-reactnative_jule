import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';

import DocumentScanner from 'react-native-document-scanner-plugin';
import TextRecognition from '@react-native-ml-kit/text-recognition';

const App = () => {
  const [ocrText, setOcrText] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [documentType, setDocumentType] = useState('');

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

    // Voter Card
    if (
      normalized.includes(
        'electioncommissionofindia',
      ) ||
      normalized.includes('elector') ||
      normalized.includes('identitycard') ||
      normalized.includes('epic') ||
      /[A-Z]{3}[0-9]{7}/i.test(text)
    ) {
      return 'Voter Card';
    }

    return 'Unknown Document';
  };

  // =========================
  // GET OWNER NAME
  // =========================

  const getOwnerName = (rawText, documentType) => {
    const lines = rawText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
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
    console.log('OCR LINES:', lines);
    let index = "";
    index = lines.findIndex(line => {
      const lower = line.toLowerCase();
      return (
        lower.includes("elector's name") ||
        lower.includes('electors name') ||
        lower.includes('name')
      );
    });
    let ownerName = '';
    console.log('documentType:', documentType);
    // =========================
    // FIND NAME
    // =========================
    if (documentType === 'Voter Card') {
      for (let i = 0; i < lines.length; i++) {
        const current =
          lines[i].toLowerCase();
        // Elector's Name
        if (current.includes("elector's name",) || current.includes('electors name',) || current.includes('name',)) {
          // Check next 5 lines
          for (let j = i + 1; j < i + 6; j++) {
            if (!lines[j]) continue;
            const next = lines[j].trim();
            console.log('CHECKING:', next);
            if (
              next.toLowerCase().includes('father') ||
              next.toLowerCase().includes('mother') ||
              next.toLowerCase().includes('husband') ||
              next.toLowerCase().includes('sex') ||
              next.toLowerCase().includes('male',) ||
              next.toLowerCase().includes('female') ||
              next.toLowerCase().includes('age',)
            ) {
              continue;
            }
            if (documentType === 'Voter Card') {
              ownerName = lines[index]?.replace(/^(elector'?s?\sname|electors\sname|name)\s*:?\s*/i, '',).trim();
              if (ownerName) {
                return ownerName.trim();
              }

            }
            // Remove :
            const cleanName = next.replace(/:/g, '',);
            // Valid name
            if (/^[A-Za-z\s]+$/.test(cleanName,) && cleanName.length > 3) {
              console.log('FOUND NAME:', cleanName,);
              return cleanName.replace(/^(elector'?s?\sname|name)\s*:?\s*/i, '').trim();
            }
          }
        }
      }
    } else if (documentType === 'Aadhaar Card') {
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
    }
    // =========================
    // FALLBACK
    // =========================

    // for (let line of lines) {
    //   const clean =
    //     line.replace(
    //       /:/g,
    //       '',
    //     );
    //   if (
    //     /^[A-Za-z\s]+$/.test(
    //       clean,
    //     ) &&
    //     clean.split(' ')
    //       .length >= 2 &&
    //     !clean
    //       .toLowerCase()
    //       .includes(
    //         'election',
    //       ) &&
    //     !clean
    //       .toLowerCase()
    //       .includes(
    //         'identity',
    //       ) &&
    //     !clean
    //       .toLowerCase()
    //       .includes(
    //         'father',
    //       ) &&
    //     !clean
    //       .toLowerCase()
    //       .includes(
    //         'mother',
    //       ) &&
    //     !clean
    //       .toLowerCase()
    //       .includes(
    //         'husband',
    //       )
    //   ) {
    //     console.log('FALLBACK NAME:',
    //       clean,
    //     );
    //     return clean.replace(/^(elector'?s?\sname|name)\s*:?\s*/i, '').trim();
    //   }
    // }

    return 'Name Not Found';
  };

  // =========================
  // SCAN DOCUMENT
  // =========================

  const scanDocument = async () => {
    try {
      const result =
        await DocumentScanner.scanDocument({
          maxNumDocuments: 1,
          letUserAdjustCrop: true,
          responseType: 'imageFilePath',
          croppedImageQuality: 100,
          saveInAppDocument: false,
        });

      if (
        result.scannedImages &&
        result.scannedImages.length > 0
      ) {
        const uri =
          result.scannedImages[0];

        // OCR
        const ocrResult =
          await TextRecognition.recognize(
            uri,
          );

        const rawText =
          ocrResult.text;

        console.log(
          'RAW OCR:',
          rawText,
        );

        setOcrText(rawText);

        // Detect document type
        const detectedType =
          detectDocumentType(rawText);

        setDocumentType(
          detectedType,
        );

        // Extract owner name
        const extractedName = getOwnerName(rawText, documentType);
        setOwnerName(extractedName);
        Alert.alert(
          'Success',
          `Document Type: ${detectedType}\n\nOwner Name: ${extractedName}`,
        );
      }
    } catch (error) {
      console.log(
        'SCAN ERROR:',
        error,
      );

      Alert.alert(
        'Error',
        'Document scan failed',
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={
        styles.container
      }>
      <Text style={styles.title}>
        Aadhaar & Voter OCR
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={scanDocument}>
        <Text
          style={
            styles.buttonText
          }>
          Scan Document
        </Text>
      </TouchableOpacity>

      {/* DOCUMENT TYPE */}

      <View style={styles.card}>
        <Text style={styles.label}>
          Document Type
        </Text>

        <Text style={styles.value}>
          {documentType}
        </Text>
      </View>

      {/* OWNER NAME */}

      <View style={styles.card}>
        <Text style={styles.label}>
          Owner Name
        </Text>

        <Text style={styles.value}>
          {ownerName}
        </Text>
      </View>

      {/* OCR TEXT */}

      <View style={styles.card}>
        <Text style={styles.label}>
          OCR Text
        </Text>

        <Text style={styles.ocrText}>
          {ocrText}
        </Text>
      </View>
    </ScrollView>
  );
};

export default App;

// =========================
// STYLES
// =========================

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 30,
    color: '#000',
  },

  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#f2f2f2',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },

  label: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },

  value: {
    fontSize: 18,
    color: '#333',
  },

  ocrText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
});