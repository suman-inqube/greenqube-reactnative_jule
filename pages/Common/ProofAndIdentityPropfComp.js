import React, { memo, useCallback, useState, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { SPSheet } from '@sekizlipenguen/react-native-popup-confirm-toast';
import DocumentPicker, { types, pick } from '@react-native-documents/picker';
import { createPdf } from 'react-native-images-to-pdf';
import DocumentScanner from 'react-native-document-scanner-plugin';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import LoadingScreen from './LoadingScreen';
import { Colors, Fonts } from '../utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { userCreateContext } from '../Context/usersCreateContext';
import { detectDocumentType, getOwnerName, isNameMatch } from '../utils/helpers';
const PDF_SIZE_LIMIT = 3;
const ProofAndIdentityPropfComp = ({
  stateValue,
  setStateValue,
  photoDeletedValue,
  setPhotoDeletedValue,
  title,
  marginBottom = 0,
  status_level,
  InputTextFormEdit,
  allowAddMore,
  farmerName = '',
  ai_camera_id_proof = '0',
  is_id_proof
}) => {

  const { loginUser_data, t } = useContext(userCreateContext);
  const [loading, setLoading] = useState(false);
  const resizeImage = async (
    uri,
    width = 1200,
    height = 1600,
    quality = 85,
  ) => {
    try {
      const resized = await ImageResizer.createResizedImage(
        uri,
        width,
        height,
        'JPEG',
        quality,
      );
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
  const onHandleDocumentSelection = useCallback(
    async (imageType, index) => {
      try {
        //check id proof not null and then allow to select document otherwise show alert
        if (is_id_proof?.[1]?.uri == "") {
          alert("id proof null")

        }
        const [res] = await pick({
          type: [types.pdf, types.images],
        });
        let fileUri = res.uri;
        console.log('test', fileUri, res.name, res.name, res.type);
        if (res.type?.startsWith('image/')) {
          fileUri = await resizeImage(res.uri);
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
          // isvalid: false,
        };
        setStateValue(values);
      } catch (err) {
        console.error(err);
        if (!DocumentPicker.isCancel(err)) {
          console.error('Document selection error:', err);
        }
      }
    },
    [stateValue, photoDeletedValue,is_id_proof],
  );
  const onHandleDocumentSelectionRemove = useCallback(
    (index, level) => {
      if (
        [
          'APPROVED',
          'CARBON_DOCUMENTS_SUBMITTED',
          'CARBON_DOCUMENTS_APPROVED',
          'CARBON_DOCUMENTS_REJECTED',
        ].includes(level)
      ) {
        return;
      }

      Alert.alert(
        'Confirm Deletion',
        'Are you sure you want to delete this document?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              const values = [...stateValue];
              markPhotoDeleted(index, values);
              values[index] = {
                ...values[index],
                uri: '',
                name: '',
                type: '',
                fileName: '',
                id: '',
                file_path: '',
              };
              setStateValue(values);
            },
          },
        ],
      );
    },
    [stateValue, photoDeletedValue],
  );
  const compressIfNeeded = async (pdfPath, scannedImages) => {
    const stat = await RNFS.stat(pdfPath);
    const sizeInMB = stat.size / (1024 * 1024);
    if (sizeInMB <= PDF_SIZE_LIMIT) return pdfPath;
    const resized = await Promise.all(
      scannedImages.map(uri => resizeImage(uri, 1000, 1400, 70)),
    );
    const fileName = `document_${Date.now()}_compressed.pdf`;
    const outputPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    return await createPdf({
      pages: resized.map(uri => ({ imagePath: uri })),
      outputPath,
    });
  };
  const handleScanAndCreatePdf = useCallback(
    async (imageType, index) => {
      setLoading(true);
      //  check id proof not null and then allow scan otherwise show alert
      if (is_id_proof?.[1]?.uri == "") {
        alert("id proof null")

      }
      try {
        const { scannedImages, status } = await DocumentScanner.scanDocument({
          letUserAdjustCrop: false,
          maxNumDocuments: 1,
          noAutoEnhance: false,
          croppedImageQuality: 0.9, // control quality
          croppedImageMaxSize: 1600, // limit size
        });
        if (status !== 'success' || !scannedImages?.length) return;
        const resized = await Promise.all(scannedImages.map(uri => resizeImage(uri)));
        const fileName = `document_${Date.now()}.pdf`;
        const outputPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        let pdfPath = await createPdf({ pages: resized.map(uri => ({ imagePath: uri })), outputPath, });
        pdfPath = await compressIfNeeded(pdfPath, scannedImages);
        const values = [...stateValue];
        markPhotoDeleted(index, values);
        values[index] = {
          uri: `file://${pdfPath}`,
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
    },
    [stateValue, photoDeletedValue,is_id_proof],
  );

  const addMoreImageBox = () => {
    setStateValue(prev => [
      ...prev,
      {
        uri: '',
        name: '',
        type: '',
        fileName: '',
        id: '',
      },
    ]);
  };

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
      const dl = await RNFS.downloadFile({ fromUrl: fileUrl, toFile: filePath })
        .promise;
      if (dl.statusCode === 200) {
        await FileViewer.open(filePath);
      } else {
        Alert.alert('Download failed');
      }
    } catch (err) {
      Alert.alert('File error', err.message);
    }
  };

  const IDPickImage = async (data, index) => {
    try {
      if (InputTextFormEdit) {
        const result = await DocumentScanner.scanDocument({
          maxNumDocuments: 1,
          letUserAdjustCrop: true,
          responseType: 'imageFilePath',
          croppedImageQuality: 100,
          saveInAppDocument: false,
        });

        if (result.scannedImages && result.scannedImages.length > 0) {
          const uri = result.scannedImages[0];
          // scanText(uri, data, index);
          try {
            const result = await TextRecognition.recognize(uri);
            const rawText = result.text;
            const detectedType = detectDocumentType(rawText);
            if (detectedType === 'Unknown Document') {
              Alert.alert(
                'Document Type Not Detected',
                "We couldn't recognize the document type. Please make sure you are uploading a clear Aadhaar or Voter ID card and try again.",
              );
              return;
            } else {
              //add code here to check name match and then save document if matched
              const extractedName = getOwnerName(rawText, detectedType);
              if (extractedName.toLowerCase().replace(/\s/g, '').trim() == farmerName?.toLowerCase()?.replace(/\s/g, '')) {
                const values = [...stateValue];
                markPhotoDeleted(index, values);
                values[index] = {
                  ...values[index],
                  uri: uri,
                  name: uri.split('/').pop(),
                  fileName: uri.split('/').pop(),
                  type: 'image/jpeg',
                  imageType: data?.imageType || 'identity',
                  value: '1',
                  id: '',
                };
                setStateValue(values);
              } else {
                if (farmerName?.toLowerCase().trim().split(' ')[0] == extractedName.toLowerCase().trim().split(' ')[0]) {
                  const values = [...stateValue];
                  markPhotoDeleted(index, values);
                  values[index] = {
                    ...values[index],
                    uri: uri,
                    name: uri.split('/').pop(),
                    fileName: uri.split('/').pop(),
                    type: 'image/jpeg',
                    imageType: data?.imageType || 'identity',
                    value: '1',
                    id: '',
                  };
                  setStateValue(values);
                } else {
                  if (isNameMatch(farmerName, extractedName)) {
                    const values = [...stateValue];
                    values[index] = {
                      ...values[index],
                      uri: uri,
                      name: uri.split('/').pop(),
                      fileName: uri.split('/').pop(),
                      type: 'image/jpeg',
                      imageType: data?.imageType || 'identity',
                      value: '1',
                      id: '',
                    };
                    setStateValue(values);
                  } else {
                    Alert.alert(
                      'Name Verification Failed',
                      "The farmer's name and the document owner's name do not match.",
                    );
                  }
                }
              }
              //  farmerName?.toLowerCase()?.replace(/\s/g, '')
            }
          } catch (error) {
            console.error('Text recognition error:', error);
            Alert.alert('Error', 'Text recognition failed. Please try again.');
          }
        }
      } else {
        const fileUrl = data?.file_path || data?.uri;
        if (!fileUrl) return;
        containsHttp(fileUrl)
          ? await downloadAndOpenFile(fileUrl)
          : await openFile(fileUrl);
      }
    } catch (error) {
      console.log('SCAN ERROR:', error);
    }
  };
  const IDPickImage_old = async (data, index) => {
    try {
      if (InputTextFormEdit) {
        const result = await DocumentScanner.scanDocument({
          maxNumDocuments: 1,
          letUserAdjustCrop: true,
          responseType: 'imageFilePath',
          croppedImageQuality: 100,
          saveInAppDocument: false,
        });

        if (result.scannedImages && result.scannedImages.length > 0) {
          const uri = result.scannedImages[0];
          // scanText(uri, data, index);
          try {
            const result = await TextRecognition.recognize(uri);
            const rawText = result.text;
            const normalizedOCR = rawText.toLowerCase().replace(/\s/g, '').trim();
            const cleanedOCR = cleanText(rawText);
            const isNameFound = cleanedOCR.includes(cleanText(farmerName?.toLowerCase()?.replace(/\s/g, '')));
            let nameFound = false;
            if (!isNameFound) {
              const parts = farmerName?.toLowerCase()?.trim()?.split(/\s+/);
              nameFound = cleanedOCR.includes(cleanText([...parts].reverse().join('')));
            }
            if (!farmerName?.includes(' ')) {
              Alert.alert(
                'Name Format Warning',
                'Please enter your full name (First and Last name separated by a space)',
              );
              return;
            }
            let documentType = 'Unknown Document';
            if (
              normalizedOCR.includes('uidai') ||
              normalizedOCR.includes('governmentofindia') ||
              /\d{12}/.test(normalizedOCR)
            ) {
              documentType = 'Aadhaar Card';
            } else if (
              normalizedOCR.includes('electioncommissionofindia') ||
              normalizedOCR.includes('elector') ||
              /[a-z]{3}\d{7}/.test(normalizedOCR)
            ) {
              documentType = 'Voter Card';
            }
            if (documentType == 'Unknown Document') {
              Alert.alert(
                'Document Type Not Detected',
                "We couldn't recognize the document type. Please make sure you are uploading a clear Aadhaar or Voter ID card and try again.",
              );
              return;
            } else {
              if (!isNameFound && !nameFound) {
                ;
                Alert.alert(
                  'Name Verification Failed',
                  "The farmer's name and the document owner's name do not match.",
                );
              } else {
                const values = [...stateValue];
                markPhotoDeleted(index, values);
                values[index] = {
                  ...values[index],
                  uri: uri,
                  name: uri.split('/').pop(),
                  fileName: uri.split('/').pop(),
                  type: 'image/jpeg',
                  imageType: data?.imageType || 'identity',
                  value: '1',
                  id: '',
                };

                setStateValue(values);
              }
            }
          } catch (error) {
            console.error('Text recognition error:', error);
            Alert.alert('Error', 'Text recognition failed. Please try again.');
          }
        }
      } else {
        const fileUrl = data?.file_path || data?.uri;
        if (!fileUrl) return;
        containsHttp(fileUrl)
          ? await downloadAndOpenFile(fileUrl)
          : await openFile(fileUrl);
      }
    } catch (error) {
      console.log('SCAN ERROR:', error);
    }
  };

  const cleanText = text => {
    return text.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const ActionSheetID = ({ data, index, spSheet }) => {
    // Alert.alert('Test-1');
    const handleOpen = async () => {
      const fileUrl = data?.file_path || data?.uri;
      if (!fileUrl) return;
      containsHttp(fileUrl)
        ? await downloadAndOpenFile(fileUrl)
        : await openFile(fileUrl);
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
                onPress={() => {
                  IDPickImage(data, index);
                  spSheet.hide();
                }}
              />
              {/* <ActionButton
                label="Gallery"
                icon={require('../Common/images/gallery.png')}
                onPress={() => {
                  onHandleDocumentSelection(data?.imageType, index);
                  spSheet.hide();
                }}
              /> */}
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
  const ActionSheet = ({ data, index, spSheet }) => {
    // Alert.alert('Test-1');
    const handleOpen = async () => {
      const fileUrl = data?.file_path || data?.uri;
      if (!fileUrl) return;
      containsHttp(fileUrl)
        ? await downloadAndOpenFile(fileUrl)
        : await openFile(fileUrl);
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
                onPress={() => {
                  handleScanAndCreatePdf(data?.imageType, index);
                  spSheet.hide();
                }}
              />
              <ActionButton
                label="Gallery"
                icon={require('../Common/images/gallery.png')}
                onPress={() => {
                  onHandleDocumentSelection(data?.imageType, index);
                  spSheet.hide();
                }}
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
      <Text style={[styles.title, { fontSize: 14, marginBottom: 10 }]}>
        {title}
      </Text>
      {loading && (
        <View style={styles.loaderBackdrop}>
          <View style={styles.loaderContainer}>
            <LoadingScreen />
            <Text style={styles.loaderText}>Processing document...</Text>
          </View>
        </View>
      )}
      <View style={styles.idItemContainer}>
        {stateValue?.map((data, index) => {
          return (
            <TouchableOpacity
              key={index}
              style={styles.idItem}
              onPress={() =>
                data.imageType == 'identity' && ai_camera_id_proof == '1'
                  ? SPSheet.show({
                    component: () => (
                      <ActionSheetID
                        data={data}
                        index={index}
                        spSheet={SPSheet}
                      />
                    ),
                    height: 230,
                  })
                  : SPSheet.show({
                    component: () => (
                      <ActionSheet
                        data={data}
                        index={index}
                        spSheet={SPSheet}
                      />
                    ),
                    height: 230,
                  })
              }>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: data?.isvalid ? '#ff0000' : '#c6c6c68b',
                  borderStyle: 'dotted',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  borderRadius: 8,
                  marginTop: 15,
                  backgroundColor: '#ffffffff',
                  width: '80%',
                  padding: 20,
                }}>
                <Text style={styles.itemLabel} numberOfLines={1}>
                  {data?.imageType === 'address'
                    ? 'Address Proof'
                    : data?.imageType === 'identity'
                      ? 'Identity Proof'
                      : ''}
                </Text>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',

                    marginHorizontal: 5,
                  }}>
                  {data?.uri ? (
                    data?.type === 'application/pdf' ? (
                      <Image
                        source={require('./images/pdf1.png')}
                        style={styles.idImage}
                      />
                    ) : (
                      <Image source={{ uri: data.uri }} style={styles.idImage} />
                    )
                  ) : (
                    <Image
                      source={require('./images/upload-file.png')}
                      style={styles.idImageUp}
                    />
                  )}
                </View>

                {data?.uri &&
                  !['address', 'identity'].includes(data?.imageType) &&
                  status_level !== 'APPROVED' && (
                    <TouchableOpacity
                      onPress={() =>
                        onHandleDocumentSelectionRemove(index, status_level)
                      }
                      style={styles.deleteIcon}>
                      <View style={{ marginTop: 15 }}>
                        {/* Replace the Image with Material Icon in red circle */}
                        <View style={styles.deleteIconContainer}>
                          <MaterialIcons
                            name="close"
                            size={15}
                            color="#FFFFFF"
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
              </View>
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {data?.name || data.file_name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
        {allowAddMore && (
          <TouchableOpacity
            style={styles.addButtonWrapper}
            onPress={addMoreImageBox}
            activeOpacity={0.8}>
            <View style={styles.buttonBackground}>
              <View style={styles.greenCircle}>
                <Text style={styles.plusIcon}>＋</Text>
              </View>
              <Text style={styles.buttonLabel}>{t('add_more')}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
const ActionButton = ({ label, icon, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Image source={icon} style={styles.actionIcon} />
    <Text numberOfLines={1} style={styles.title}>
      {label}
    </Text>
  </TouchableOpacity>
);
export default memo(ProofAndIdentityPropfComp);
const styles = StyleSheet.create({
  idContainer: {
    backgroundColor: '#f1f1f1e0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dotted',
  },
  idItemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // backgroundColor: 'black',
    // alignItems: 'center',
    justifyContent: 'center',
  },
  idItem: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    height: 100,
    marginBottom: 15,
    // backgroundColor: 'red',
  },
  addButtonWrapper: {
    width: '30%',

    padding: 10,
  },
  buttonBackground: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  greenCircle: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: Colors.useGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  plusIcon: {
    fontSize: 20,
    color: 'white',
    fontWeight: '500',
  },
  buttonLabel: {
    fontSize: 11,
    color: '#666',
    fontFamily: Fonts.Regular,
    textAlign: 'center',
  },
  idImage: {
    width: 55,
    height: 55,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    marginBottom: 15,
  },
  idImageUp: {
    width: 50,
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    marginBottom: 15,
  },
  itemLabel: { fontSize: 12, color: '#605f5fff', textAlign: 'center', margin: 5 },
  fileName: { fontSize: 12, color: '#4c4a4aff', marginTop: 4 },
  deleteIcon: { position: 'absolute', top: -10, right: -5 },
  title: { color: '#000', fontFamily: Fonts.Regular },
  loaderBackdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderContainer: { backgroundColor: '#FFF', padding: 15, alignItems: 'center' },
  loaderText: { marginTop: 10, fontSize: 14, color: '#333' },
  sheetTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: Fonts.SemiBold,
    marginBottom: 10,
  },
  sheetRow: { flexDirection: 'row', justifyContent: 'space-around' },
  actionButton: {
    backgroundColor: '#DFE8EF',
    width: 70,
    height: 70,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: { width: 30, height: 30 },
  deleteIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 11,
    backgroundColor: '#FF5252', // Bright red
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 10,
  },
});
