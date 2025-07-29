import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import React, {memo, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {SPSheet} from 'react-native-popup-confirm-toast';
import DocumentScanner from 'react-native-document-scanner-plugin';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import {Colors, Fonts} from '../utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const ProofAndIdentityPropfCompLoan = ({
  identityProofIdentityPropf,
  handleDocumentSelection,
  handleDocumentSelectionRemove,
  title,
  parent,
  handleScanAndCreatePdf,
}) => {
  const {t} = useTranslation();
  // Memoize the handleDocumentSelection function
  const onHandleDocumentSelection = useCallback(
    (imageType, index, identityList, currentList) => {
      handleDocumentSelection(
        imageType,
        index,
        identityList,
        currentList,
        parent,
      );
    },
    [handleDocumentSelection],
  );
  // Memoize the document selection remove function
  const onHandleDocumentSelectionRemove = useCallback(
    (index, identityProofIdentityPropf) => {
      Alert.alert(
        'Confirm Deletion', // Title
        'Are you sure you want to delete this document?', // Message
        [
          {
            text: 'Cancel', // Cancel button
            onPress: () => console.log('Deletion cancelled'),
            style: 'cancel',
          },
          {
            text: 'Delete', // Confirm button
            onPress: () =>
              handleDocumentSelectionRemove(index, identityProofIdentityPropf),
            style: 'destructive', // iOS style for destructive actions
          },
        ],
      );
    },
    [handleDocumentSelectionRemove],
  );
  const containsHttpOrHttps = str => {
    const regex = /https?:\/\//i; // Matches 'http://' or 'https://' case-insensitively
    return regex.test(str);
  };
  const component = useCallback(
    props => {
      const openURL = async propsData => {
        try {
          const {file_path, uri} = propsData?.data || {};
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
        } catch (error) {
          console.log(error);
        }
        propsData?.spSheet?.hide();
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
            <TouchableOpacity
              style={{
                backgroundColor: '#DFE8EF',
                width: 80,
                height: 70,
                borderRadius: 10,
                elevation: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 10,
                borderWidth: 0.5,
                alignSelf: 'center',
              }}
              onPress={() => {
                handleScanAndCreatePdf(
                  props?.data.ImageType,
                  props?.index,
                  props?.identityProofIdentityPropf,
                  identityProofIdentityPropf,
                  parent,
                );
                props.spSheet.hide();
              }}>
              <MaterialIcons
                name="document-scanner"
                size={28}
                color="#1d3122"
              />
              {/* <Image
                source={require('../Common/images/scan.png')}
                style={{width: 30, height: 30}}
              /> */}
              <Text style={styles.title}>Scanner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#DFE8EF',
                width: 80,
                height: 70,
                borderRadius: 10,
                elevation: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 10,
                borderWidth: 0.5,
                alignSelf: 'center',
              }}
              onPress={() => {
                onHandleDocumentSelection(
                  props?.data.ImageType,
                  props?.index,
                  props?.identityProofIdentityPropf,
                  identityProofIdentityPropf,
                );
                props.spSheet.hide();
              }}>
              <MaterialIcons
                name="add-photo-alternate"
                size={30}
                color="#1d3122"
              />
              {/* <Image
                source={require('../Common/images/gallery.png')}
                style={{width: 30, height: 30}}
              /> */}
              <Text style={styles.title}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openURL(props)}
              style={{
                backgroundColor: '#DFE8EF',
                width: 80,
                height: 70,
                borderRadius: 10,
                elevation: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 10,
                borderWidth: 0.5,
                alignSelf: 'center',
              }}>
              <MaterialIcons name="visibility" size={30} color="#1d3122" />
              {/* <Image
                source={require('../Common/images/view.png')}
                style={{width: 30, height: 30}}
              /> */}
              <Text style={styles.title}>View</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    },
    [onHandleDocumentSelection, identityProofIdentityPropf, t],
  );
  return (
    <View style={styles.idcontainer}>
      <Text style={[styles.title, {fontSize: 14, color: '#000'}]}>
        {/* {t('address_proofAndIdentityPropf')} */}
        {title}
      </Text>
      <View style={styles.idItemContainer}>
        {identityProofIdentityPropf &&
          identityProofIdentityPropf.map((data, index) => (
            <TouchableOpacity
              style={styles.idItem}
              key={index}
              onPress={() => {
                const spSheet = SPSheet;
                spSheet.show({
                  component: () =>
                    component({
                      data,
                      index,
                      identityProofIdentityPropf,
                      spSheet,
                    }),
                  height: 230,
                });
              }}>
              <View>
                {data?.uri ? (
                  data?.type == 'application/pdf' ? (
                    <MaterialIcons
                      name="edit-document"
                      size={45}
                      color="#0d8320"
                    />
                  ) : (
                    <Image source={{uri: data.uri}} style={styles.idImage} />
                  )
                ) : (
                  <MaterialIcons name="upload-file" size={45} color="#0d8320" />
                  // <Image
                  //   source={require('./images/document.png')}
                  //   style={styles.idImage}
                  // />
                )}
                {data?.url ||
                  (data?.uri && (
                    <TouchableOpacity
                      onPress={() =>
                        onHandleDocumentSelectionRemove(
                          index,
                          identityProofIdentityPropf,
                        )
                      }
                      style={{position: 'absolute', top: -15, right: -15}}>
                      <MaterialIcons name="cancel" size={25} color="red" />
                      {/* <Image
                        source={require('./images/cross50.png')}
                        style={styles.closeIcon}
                      /> */}
                    </TouchableOpacity>
                  ))}
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
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 7,
  },
  idItemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    backgroundColor: '#FFF',
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
});

export default memo(ProofAndIdentityPropfCompLoan);
