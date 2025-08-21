import React, { memo, useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SPSheet } from 'react-native-popup-confirm-toast';
import DocumentPicker, { types } from 'react-native-document-picker';
import { createPdf } from 'react-native-images-to-pdf';
import DocumentScanner from 'react-native-document-scanner-plugin';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import LoadingScreen from './LoadingScreen';
import { Colors, Fonts } from '../utils/Constants';

const PDF_SIZE_LIMIT = 3; // MB

const ProofAndIdentityPropfComp = ({
  stateValue,
  setStateValue,
  photoDeletedValue,
  setPhotoDeletedValue,
  title,
  loginUser_data,
  marginBottom = 0,
  status_level,
  InputTextFormEdit,
}) => {
  const [loading, setLoading] = useState(false);

  /** 📌 Utils */
  const resizeImage = async (uri, width = 800, height = 600, quality = 80) => {
    try {
      const resized = await ImageResizer.createResizedImage(uri, width, height, 'JPEG', quality);
      return resized.uri;
    } catch (err) {
      console.error('Resize failed:', err);
      return uri;
    }
  };

  const containsHttp = url => /^(https?:\/\/)/i.test(url);

  const markPhotoDeleted = (index, values) => {
    const photoId = values[index]?.id;
    if (photoId && !photoDeletedValue.includes(photoId)) {
      setPhotoDeletedValue(prev => [...prev, photoId]);
    }
  };

  /** 📌 Pick Document (Image or PDF) */
  const onHandleDocumentSelection = useCallback(async (imageType, index) => {
    try {
      const [res] = await DocumentPicker.pick({ type: [types.pdf, types.images] });
      let fileUri = res.uri;

      if (res.type?.startsWith('image/')) {
        fileUri = await resizeImage(res.uri, 800, 600, 90);
      }

      const values = [...stateValue];
      markPhotoDeleted(index, values);

      values[index] = {
        ...values[index],
        uri: fileUri,
        name: res.name,
        fileName: res.name,
        type: res.type,
        imageType,
        value: '1',
        id: '',
      };
      setStateValue(values);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Document selection error:', err);
      }
    }
  }, [stateValue, photoDeletedValue]);

  /** 📌 Remove Document */
  const onHandleDocumentSelectionRemove = useCallback((index, level) => {
    if (['APPROVED', 'CARBON_DOCUMENTS_SUBMITTED', 'CARBON_DOCUMENTS_APPROVED', 'CARBON_DOCUMENTS_REJECTED'].includes(level)) {
      return;
    }

    Alert.alert('Confirm Deletion', 'Are you sure you want to delete this document?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          const values = [...stateValue];
          markPhotoDeleted(index, values);
          values[index] = { ...values[index], uri: '', name: '', type: '', fileName: '', id: '', file_path: '' };
          setStateValue(values);
        }
      }
    ]);
  }, [stateValue, photoDeletedValue]);

  /** 📌 Scan Document & Create PDF */
  const handleScanAndCreatePdf = useCallback(async (imageType, index) => {
    setLoading(true);
    try {
      const { scannedImages, status } = await DocumentScanner.scanDocument();
      if (status !== 'success' || !scannedImages?.length) return;

      const resized = await Promise.all(scannedImages.map(uri => resizeImage(uri)));
      const fileName = `document_${Date.now()}.pdf`;
      const outputPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const path = await createPdf({
        pages: resized.map(uri => ({ imagePath: uri })),
        outputPath,
      });

      const stat = await RNFS.stat(path);
      const sizeInMB = stat.size / (1024 * 1024);
      if (sizeInMB > PDF_SIZE_LIMIT) {
        Alert.alert('File Too Large', `PDF exceeds ${PDF_SIZE_LIMIT}MB`);
        await RNFS.unlink(path);
        return;
      }

      const values = [...stateValue];
      markPhotoDeleted(index, values);

      values[index] = {
        uri: `file://${path}`,
        name: fileName,
        fileName,
        type: 'application/pdf',
        imageType,
        value: '1',
        id: '',
      };
      setStateValue(values);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setLoading(false);
    }
  }, [stateValue, photoDeletedValue]);

  /** 📌 File open helpers */
  const openFile = async uri => {
    try {
      await FileViewer.open(uri);
    } catch (err) {
      console.error('File open error:', err);
    }
  };

  const downloadAndOpenFile = async fileUrl => {
    const fileName = fileUrl.split('/').pop();
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    try {
      const exists = await RNFS.exists(filePath);
      if (exists) return FileViewer.open(filePath);

      const dl = await RNFS.downloadFile({ fromUrl: fileUrl, toFile: filePath }).promise;
      if (dl.statusCode === 200) {
        await FileViewer.open(filePath);
      } else {
        Alert.alert('Download failed');
      }
    } catch (err) {
      Alert.alert('File error', err.message);
    }
  };

  /** 📌 Bottom Sheet Component */
  const ActionSheet = ({ data, index, spSheet }) => {
    const handleOpen = async () => {
      const fileUrl = data?.file_path || data?.uri;
      if (!fileUrl) return;
      containsHttp(fileUrl) ? await downloadAndOpenFile(fileUrl) : await openFile(fileUrl);
      spSheet.hide();
    };

    return (
      <>
        <Text style={styles.sheetTitle}>Attach Document</Text>
        <View style={styles.sheetRow}>
          {InputTextFormEdit && (
            <>
              <ActionButton
                label="Scanner"
                icon={require('../Common/images/scan.png')}
                onPress={() => { handleScanAndCreatePdf(data?.imageType, index); spSheet.hide(); }}
              />
              <ActionButton
                label="Gallery"
                icon={require('../Common/images/gallery.png')}
                onPress={() => { onHandleDocumentSelection(data?.imageType, index); spSheet.hide(); }}
              />
            </>
          )}
          <ActionButton
            label="View"
            icon={require('../Common/images/view.png')}
            onPress={handleOpen}
          />
        </View>
      </>
    );
  };

  return (
    <View style={styles.idContainer}>
      <Text style={[styles.title, { fontSize: 14, marginBottom: 10 }]}>{title}</Text>

      {loading && (
        <View style={styles.loaderBackdrop}>
          <View style={styles.loaderContainer}>
            <LoadingScreen />
            <Text style={styles.loaderText}>Processing document...</Text>
          </View>
        </View>
      )}

      <View style={styles.idItemContainer}>
        {stateValue?.map((data, index) => (
          <TouchableOpacity
            key={index}
            style={styles.idItem}
            onPress={() => SPSheet.show({ component: () => <ActionSheet data={data} index={index} spSheet={SPSheet} />, height: 220 + marginBottom })}
          >
            <View style={{borderWidth:1,borderColor:'#FFF'}}>
              <Text style={styles.itemLabel} numberOfLines={1} ellipsizeMode="tail">
                {data?.imageType === 'address' ? 'Address Proof' : data?.imageType === 'identity' ? 'Identity Proof' : ''}
              </Text>

              {data?.uri ? (
                data?.type === 'application/pdf'
                  ? <Image source={require('./images/pdf.png')} style={styles.idImage} />
                  : <Image source={{ uri: data.uri }} style={styles.idImage} />
              ) : (
                <Image source={require('./images/document.png')} style={styles.idImage} />
              )}

              {data?.uri && !['address', 'identity'].includes(data?.imageType) && status_level !== 'APPROVED' && (
                <TouchableOpacity
                  onPress={() => onHandleDocumentSelectionRemove(index, status_level)}
                  style={styles.deleteIcon}
                >
                  <Image source={require('./images/cross50.png')} style={{ width: 20, height: 20 }} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.fileName} numberOfLines={1}>{data?.name || data.file_name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
const ActionButton = ({ label, icon, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Image source={icon} style={styles.actionIcon} />
    <Text numberOfLines={1} style={styles.title}>{label}</Text>
  </TouchableOpacity>
);

export default memo(ProofAndIdentityPropfComp);

const styles = StyleSheet.create({
  idContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 7,
    elevation: 1,
  },
  idItemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  idItem: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    height: 100,
  },
  idImage: { width: 60, height: 60, borderRadius: 5 },
  itemLabel: { fontSize: 12, color: '#000', textAlign: 'center' },
  fileName: { fontSize: 12, color: '#000', marginTop: 4 },
  deleteIcon: { position: 'absolute', top: -10, right: -5 },
  title: { color: '#000', fontFamily: Fonts.Regular },
  loaderBackdrop: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  loaderContainer: { backgroundColor: '#FFF', padding: 15, alignItems: 'center' },
  loaderText: { marginTop: 10, fontSize: 14, color: '#333' },
  sheetTitle: { textAlign: 'center', fontSize: 18, fontFamily: Fonts.SemiBold, marginBottom: 10 },
  sheetRow: { flexDirection: 'row', justifyContent: 'space-around' },
  actionButton: { backgroundColor: '#DFE8EF', width: 70, height: 70, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionIcon: { width: 30, height: 30 },
});
