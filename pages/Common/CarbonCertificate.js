import React, {memo, useCallback, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import {SPSheet} from '@sekizlipenguen/react-native-popup-confirm-toast';
import DocumentPicker, {types, pick} from '@react-native-documents/picker';
import {createPdf} from 'react-native-images-to-pdf'; // Assuming you need to import this
import DocumentScanner from 'react-native-document-scanner-plugin';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import LoadingScreen from './LoadingScreen';
const MAX_DIMENSION = 800;
const PDF_SIZE_LIMIT = 3;
const qs = require('qs');
const CarbonCertificate = ({
  stateValue,
  setStateValue,
  photoDeletedValue,
  // setPhotoDeletedValue,
  title,
  loginUser_data,
  marginBottom = 0,
  status_level,
  disable,
  file,
  InputTextFormEdit,
}) => {
  const {dbname, lan_id, token, user_id} = loginUser_data || {};
  const [loading, setLoading] = useState(false);
  const resizeImage = async (
    uri,
    imgWidth = 1200,
    imgHeight = 1600,
    Quality = 100,
  ) => {
    try {
      const resizedImage = await ImageResizer.createResizedImage(
        uri,
        imgWidth,
        imgHeight,
        'JPEG',
        Quality,
        0,
        null,
      );
      return resizedImage.uri; // Return the URI of the resized image
    } catch (error) {
      console.error('Error resizing image:', error);
      return uri; // If resizing fails, return the original URI
    }
  };
  const onHandleDocumentSelection = useCallback(
    async (imageType, index) => {
      try {
        const response = await pick({
          presentationStyle: 'fullScreen',
          type: [types.pdf, types.images],
        });
        const {uri, name, type} = response?.[0] || {};
        let resizedUri = uri;
        let width = 0;
        let height = 0;
        if (type && type.startsWith('image/')) {
          await new Promise((resolve, reject) => {
            Image.getSize(
              uri,
              (imgWidth, imgHeight) => {
                width = imgWidth;
                height = imgHeight;
                resolve();
              },
              reject,
            );
          });
          resizedUri = await resizeImage(uri, width, height, 50);
          const fileStat = await RNFS.stat(resizedUri);
          const fileSizeInMB = fileStat.size / (1024 * 1024); // File size in MB
          console.log(`PDF Size: ${fileSizeInMB} MB`);
          // Log or use width and height as needed
          console.log(`Width: ${width}, Height: ${height}`);
        }
        const values = [...stateValue];
        values[index] = {
          ...values[index],
          uri: resizedUri,
          name: response[0].name,
          type: response[0].type,
          fileName: response[0].name,
          value: '1',
          id: '',
        };
        setStateValue(values);
      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
          console.log('File selection canceled');
        } else {
          console.error('Error selecting document:', err);
        }
      }
    },
    [stateValue, setStateValue, photoDeletedValue],
  );

  const onHandleDocumentSelectionRemove = useCallback(
    (index, level) => {
      if (level === 'CARBON_DOCUMENTS_REJECTED') {
        Alert.alert(
          'Confirm Deletion',
          'Are you sure you want to delete this document?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                const values = [...stateValue];
                const photoId = values[index]?.id;
                values[index] = {
                  ...values[index],
                  uri: '',
                  name: '',
                  type: '',
                  fileName: '',
                  value: '1',
                  id: '',
                  file_path: '',
                  file_name: '',
                };
                setStateValue(values);
              },
            },
          ],
        );
      }
    },
    [stateValue, setStateValue],
  );
  const handleScanAndCreatePdf = useCallback(
    async (data, index) => {
      setLoading(true);
      try {
        // const { scannedImages } = await DocumentScanner.scanDocument({
        //   croppedImageQuality: 100,
        // });
        const {scannedImages, status} = await DocumentScanner.scanDocument();
        if (status !== 'success' || !scannedImages?.length) {
          Alert.alert('Error', 'Scanning failed or no image captured');
          return;
        }
        const resizedUris = [];
        for (const uri of scannedImages) {
          resizedUris.push(await resizeImage(uri));
        }
        const fileName = `document_${Date.now()}.pdf`;
        const outputPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        const path = await createPdf({
          pages: resizedUris.map(uri => ({imagePath: uri})),
          outputPath,
        });
        const fileStat = await RNFS.stat(path);
        const fileSizeInMB = fileStat.size / (1024 * 1024);
        console.log(`PDF Size: ${fileSizeInMB} MB`);
        const sizeLimitMB = 10;
        if (fileSizeInMB > sizeLimitMB) {
          Alert.alert(
            'File Too Large',
            `PDF size (${fileSizeInMB.toFixed(1)}MB) exceeds limit`,
          );
          await RNFS.unlink(path);
          return;
        }
        const values = [...stateValue];
        values[index] = {
          uri: `file://${path}`,
          name: fileName,
          type: 'application/pdf',
          fileName: fileName,
          value: '1',
          id: '',
        };
        setStateValue(values);
      } catch (error) {
        console.log('Error:', error.message);
      } finally {
        setLoading(false); // Stop loading
      }
    },
    [stateValue, setStateValue],
  );

  const openFile = async uri => {
    try {
      await FileViewer.open(uri);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const containsHttpOrHttps = url => /^(https?:\/\/)/i.test(url);
  const component = useCallback(
    ({data, index, spSheet}) => {
      const openURL = async (data, index, spSheet) => {
        try {
          const {file_path, uri} = data || {};
          if (file_path) {
            const http = containsHttpOrHttps(file_path);
            // openFile(file_path);
            if (http) {
              downloadAndOpenFile(file_path);
            } else {
              openFile(file_path);
            }
          } else if (uri) {
            // openFile(uri);
            // downloadAndOpenFile(uri);
            const http = containsHttpOrHttps(uri);
            // openFile(file_path);
            if (http) {
              downloadAndOpenFile(uri);
            } else {
              openFile(uri);
            }
          }
          spSheet?.hide();
        } catch (error) {
          console.log(error);
        }
      };
      const downloadAndOpenFile = async fileUrl => {
        const fileName = fileUrl.split('/').pop();
        const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        try {
          // Check if the file already exists
          const fileExists = await RNFS.exists(filePath);
          if (fileExists) {
            // Open the existing file
            // Alert.alert('File Exists', 'Opening the downloaded file...');
            await FileViewer.open(filePath);
          } else {
            // Download the file if it doesn't exist
            // Alert.alert('Downloading', 'File is being downloaded...');
            const downloadResponse = await RNFS.downloadFile({
              fromUrl: fileUrl,
              toFile: filePath,
            }).promise;

            if (downloadResponse.statusCode === 200) {
              // Alert.alert(
              //   'Download Complete',
              //   'Opening the downloaded file...',
              // );
              await FileViewer.open(filePath);
            } else {
              Alert.alert('Error', 'Failed to download the file');
            }
          }
        } catch (error) {
          console.error('Error:', error);
          Alert.alert('Error', 'An error occurred while processing the file');
        }
      };

      return (
        <>
          <Text
            style={{
              color: '#000',
              fontFamily: 'Poppins-SemiBold',
              paddingBottom: 8,
              paddingTop: 4,
              fontSize: 18,
              textAlign: 'center',
            }}>
            Attach Document
          </Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            {status_level === 'CARBON_DOCUMENTS_REJECTED' ||
            status_level === 'APPROVED' ||
            status_level === 'PENDING' ? (
              <TouchableOpacity
                onPress={() => {
                  handleScanAndCreatePdf(data?.ImageType, index);
                  spSheet.hide();
                }}
                style={{
                  backgroundColor: '#DFE8EF',
                  width: 70,
                  height: 70,
                  borderRadius: 10,
                  elevation: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={require('../Common/images/scan.png')}
                  style={{width: 30, height: 30}}
                />
                <Text style={styles.title}>Scanner</Text>
              </TouchableOpacity>
            ) : (
              <></>
            )}

            {status_level === 'CARBON_DOCUMENTS_REJECTED' ||
            status_level === 'APPROVED' ||
            status_level === 'PENDING' ? (
              <TouchableOpacity
                onPress={() => {
                  onHandleDocumentSelection(data?.ImageType, index);
                  spSheet.hide();
                }}
                style={{
                  backgroundColor: '#DFE8EF',
                  width: 70,
                  height: 70,
                  borderRadius: 10,
                  elevation: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={require('../Common/images/gallery.png')}
                  style={{width: 30, height: 30}}
                />
                <Text style={styles.title}>Gallery</Text>
              </TouchableOpacity>
            ) : (
              <></>
            )}
            {/* {(containsHttpOrHttps(data?.file_path) ||
              containsHttpOrHttps(data?.uri)) && ( */}
            <TouchableOpacity
              onPress={() => openURL(data, index, spSheet)}
              style={{
                backgroundColor: '#DFE8EF',
                width: 70,
                height: 70,
                borderRadius: 10,
                elevation: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={require('../Common/images/view.png')}
                style={{width: 30, height: 30}}
              />
              <Text style={styles.title}>View</Text>
            </TouchableOpacity>
            {/* )} */}
          </View>
        </>
      );
    },
    [onHandleDocumentSelection, status_level, InputTextFormEdit],
    //basudev
  );
  return (
    <View style={styles.idContainer}>
      <Text
        style={[styles.title, {fontSize: 14, color: '#000', marginBottom: 10}]}>
        {title}
      </Text>
      {loading && (
        <View style={styles.loaderBackdrop}>
          <View style={styles.loaderContainer}>
            <LoadingScreen />
            <Text
              style={[
                styles.title,
                {fontSize: 14, color: '#000', marginBottom: 10},
              ]}>
              Processing document...
            </Text>
          </View>
        </View>
      )}
      <View style={styles.idItemContainer}>
        {stateValue &&
          stateValue.map((data, index) => (
            <TouchableOpacity
              style={styles.idItem}
              key={index}
              onPress={() => {
                // basudev
                // status_level != 'APPROVED' &&
                SPSheet.show({
                  component: () => component({data, index, spSheet: SPSheet}),
                  height: 220 + marginBottom,
                });
              }}>
              <View>
                {data?.uri ? (
                  data?.type == 'application/pdf' ? (
                    <Image
                      source={require('./images/pdf.png')}
                      style={styles.idImage}
                    />
                  ) : (
                    <Image source={{uri: data.uri}} style={styles.idImage} />
                  )
                ) : (
                  <Image
                    source={require('./images/document.png')}
                    style={styles.idImage}
                  />
                )}
                {data?.url ||
                  (data?.uri &&
                    (status_level == 'CARBON_DOCUMENTS_REJECTED' ? (
                      <TouchableOpacity
                        onPress={() =>
                          onHandleDocumentSelectionRemove(index, status_level)
                        }
                        style={{position: 'absolute', top: -20, right: -5}}>
                        <Image
                          source={require('./images/cross50.png')}
                          style={{width: 20, height: 20}}
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={{position: 'absolute', top: -20, right: -5}}>
                        <Image
                          source={require('./images/cross50.png')}
                          style={{width: 20, height: 20}}
                        />
                      </TouchableOpacity>
                    )))}
              </View>
              <Text style={styles.text}>
                {data?.name?.substring(data?.name?.length - 9) ||
                  data.file_name?.substring(data.file_name?.length - 9) ||
                  ''}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  idContainer: {
    flex: 1,
    elevation: 1,
    backgroundColor: '#e4e4e4ff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 7,
  },
  idItemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  idItem: {
    padding: 10,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    // borderWidth:0.5,
    // borderColor:'#999',
    // elevation:3,
    // backgroundColor:'#FFF',
    // marginHorizontal:5,
    // marginVertical:5,
    // borderRadius:10
  },
  idImage: {width: 60, height: 60, resizeMode: 'cover', borderRadius: 5},
  text: {height: 20, color: '#000', textAlign: 'center'},
  button: {
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'green',
    margin: 10,
    borderRadius: 5,
  },
  closeIcon: {
    position: 'absolute',
    width: 20,
    height: 20,
    right: -10,
    top: -80,
  },
  title: {
    marginHorizontal: 5,
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  loaderBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderContainer: {
    // width: 200,
    backgroundColor: '#FFF',
    // borderRadius: 15,
    // padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.3,
    // shadowRadius: 6,
    // elevation: 10,
  },
  loaderText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default memo(CarbonCertificate);
