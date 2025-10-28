import { StyleSheet, Text, View, Image, Alert } from 'react-native';
import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import ButtonFormBottom from '../../Common/ButtonFormBottom';
import ProofAndIdentityPropfComp from '../../Common/ProofAndIdentityPropfComp';
import { userCreateContext } from '../../Context/usersCreateContext';
import { useRoute, useIsFocused } from '@react-navigation/native';
import {
  ActivityPipeImages,
  addActivityPipeImages,
} from '../../../config/apiHere';
import TakePhotoPipe from '../../Common/TakePhotoPipe';
import Marker, { Position } from 'react-native-image-marker';
import { launchCamera } from 'react-native-image-picker';
import CustomAlert from '../../Common/CustomAlert';
import useLocationTracking from '../../Common/useLocationTracking';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import { captureRef } from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import { getHighAccuracyLocation } from '../../utils/getHighAccuracyLocation';
const InstrumentWiseActivityDetails = ({ navigation }) => {
  const location = useLocationTracking();
  const {
    loginUser_data,
    t,
    AlertMesg,
    onBackPress,
    getItem,
    Root,
    Toast,
    LoadingScreen,
    DatePickerComp,
    FormsTitle,
    CustomHeader,
    ButtonFormBottom,
    InputTextForm,
    DropdownForm,
    effective_dates,
    logoImage,
    topBanner,
  } = useContext(userCreateContext);
  const { dbname, lan_id, token, user_id } = loginUser_data;
  const route = useRoute();
  const isFocused = useIsFocused();
  const [pipeimage, setPipeimage] = useState([
    { uri: '', name: '', type: '', fileName: '', id: '', pipe_id: '' },
    { uri: '', name: '', type: '', fileName: '', id: '', pipe_id: '' },
  ]);
  const [pipeName, setpipeName] = useState('');
  const [selectedImagePipe, setSelectedImagePipe] = useState({
    firstItem: '',
    firstItemLat: '',
    firstItemLong: '',
    firstItemName: '',
    secondItem: '',
    secondItemLat: '',
    secondItemLong: '',
    secondItemName: '',
    firstItemid: '',
    secondItemid: '',
    firstItemType: '',
    secondItemType: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [photoDeletedValue, setPhotoDeletedValue] = useState([]);
  const HandlerGoBack = () => {
    setPipeimage([
      { uri: '', name: '', type: '', fileName: '', id: '', pipe_id: '' },
      { uri: '', name: '', type: '', fileName: '', id: '', pipe_id: '' },
    ]);
    navigation.navigate('InstrumentWiseActivityView');
  };
  const watermarkViewRef = useRef(null);
  const [tempImage, setTempImage] = useState(null);
  const [tempText, setTempText] = useState('');
  const { params } = route;
  const onPageLoad = async () => {
    try {
      setIsLoading(true);
      const pipeRes = await ActivityPipeImages(
        token,
        dbname,
        lan_id,
        user_id,
        params?.pipeLand?.rel_id,
        params?.act_name_fid,
        params?.pipe_id,
      );
      if (pipeRes?.status == 200) {
        const { rows, count } = pipeRes?.data?.data;
        if (count > 0) {
          rows.map(item => {
            if (item?.pipe_id === params?.pipe_id) {
              setpipeName(item?.pipe_name);
              item?.pipeFiles?.map((item, index) => {
                if (index == 0) {
                  setSelectedImagePipe(prev => ({
                    ...prev,
                    firstItem: item?.file_path,
                    firstItemLat: '',
                    firstItemLong: '',
                    firstItemid: item?.file_id,
                    firstItemName: item?.file_name,
                  }));
                } else if (index == 1) {
                  setSelectedImagePipe(prev => ({
                    ...prev,
                    secondItem: item?.file_path,
                    secondItemLat: '',
                    secondItemLong: '',
                    secondItemid: item?.file_id,
                    secondItemName: item?.file_name,
                  }));
                }
              });
            }
          });
        }
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  const handleImgUpdate = async () => {
    setIsLoading(true);
    console.log("selectedImagePipe", selectedImagePipe.firstItem)
    var imgCount = 0;
    const formData = new FormData();
    if (selectedImagePipe.firstItemid == '') {
      if (selectedImagePipe.firstItem != '') {
        imgCount++;
        formData.append('pipe_image', {
          uri: selectedImagePipe.firstItem,
          name: selectedImagePipe.firstItemName,
          type: 'image/jpeg',
        });
      }
    }
    if (selectedImagePipe.secondItemid == '') {
      if (selectedImagePipe.secondItem != '') {
        imgCount++;
        formData.append('pipe_image', {
          uri: selectedImagePipe.secondItem,
          name: selectedImagePipe.secondItemName,
          type: 'image/jpeg',
        });
      }
    }
    formData.append('pipe_id', params?.pipe_id);
    if (imgCount > 1) {
      const updateActivityPipeImages = await addActivityPipeImages(
        dbname,
        lan_id,
        user_id,
        token,
        formData,
      );
      if (updateActivityPipeImages?.status === 400) {
        Toast.show({
          text: updateActivityPipeImages.data?.error?.errorMessage?.message,
          ...AlertMesg[0],
        });
        return;
      }
      if (updateActivityPipeImages?.status === 200) {
        Toast.show({ text: t('Data_submitted_successfully'), ...AlertMesg[0] });
        setTimeout(() => {
          navigation.navigate('InstrumentWiseActivityView');
        }, 1500);
      } else {
        console.log(
          'Error in updating activity pipe images',
          updateActivityPipeImages?.data?.error?.errorMessage,
        );
        Toast.show({
          text: updateActivityPipeImages?.data?.error?.errorMessage
            ? updateActivityPipeImages?.data?.error?.errorMessage
            : 'Error in updating activity pipe images',
          ...AlertMesg[0],
        });
      }
    } else {
      Toast.show({
        text: t('please_update_both_image'),
        ...AlertMesg[0],
      });
    }
    setIsLoading(false);
  };

  const openImagePickerPipe = useCallback(async cameraItem => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 800,
      maxWidth: 800,
    };

    launchCamera(options, async response => {
      try {
        if (!response) {
          CustomAlert('Camera Error:', 'Response is blank.', true, 'OK');
          return;
        }
        if (response.didCancel) return;
        if (response.errorCode) {
          CustomAlert('Camera Error:', response.errorMessage, true, 'OK');
          return;
        }

        const asset = response.assets?.[0];
        if (!asset?.uri) {
          CustomAlert('Error', 'No image captured', true, 'OK');
          return;
        }

        // ✅ Handle location safely
        let { latitude, longitude } = location || {};
        if (!latitude || !longitude) {
          const loc = await getHighAccuracyLocation();
          latitude = loc?.latitude;
          longitude = loc?.longitude;
        }

        const timestamp = Date.now();
        const formattedTime = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(timestamp);

        const watermarkText = `Lat: ${latitude?.toFixed(6)}\nLon: ${longitude?.toFixed(6)}\n${formattedTime}`;

        // ✅ Step 1: Render watermark overlay
        setTempImage(asset.uri);
        setTempText(watermarkText);

        // ✅ Step 2: Wait for the view to render, then capture it
        setTimeout(async () => {
          try {
            const uri = await captureRef(watermarkViewRef, {
              format: 'jpg',
              quality: 1,
            });

            const fileName = asset.fileName || `photo_${timestamp}.jpg`;
            const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

            await RNFS.copyFile(uri, destPath);

            // ✅ Step 3: Save image + coordinates
            setSelectedImagePipe(prev => ({
              ...prev,
              [cameraItem]: `file://${destPath}`,
              [`${cameraItem}Lat`]: latitude,
              [`${cameraItem}id`]: '',
              [`${cameraItem}Long`]: longitude,
              [`${cameraItem}Name`]: fileName,
              [`${cameraItem}Type`]: asset.type,
            }));

            setTempImage(null);
            setTempText('');
            console.log('✅ Watermarked image saved:', destPath);
          } catch (error) {
            console.log('Capture Error:', error);
            setTempImage(null);
            setTempText('');
          }
        }, 500);
      } catch (error) {
        console.log('Catch Error:', error);
        CustomAlert('Catch Error', String(error), true, 'OK');
      }
    });
  }, [location, setSelectedImagePipe]);
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {isLoading ? (
            <View style={styles.LoadingScreen}>
              <LoadingScreen />
            </View>
          ) : null}
          <CustomHeader
            path="Dashboard"
            HandlerGoBack={HandlerGoBack}
            logoImage={logoImage}
            topBanner={topBanner}
          />
          {/* <FormsTitle title={t('activity_Pipe_Images')} /> */}

          {/* APPROVED */}
          {/* <ProofAndIdentityPropfComp
                        title={t('Activity Pipe')}
                        setStateValue={setAddressProof}
                        stateValue={addressProof}
                        status_level={params?.status_label == "REJECTED"||params?.status_label == "PENDING" ? true : "APPROVED"}
                        disable={true}
                        InputTextFormEdit={params?.status_label == "REJECTED" ? true : false}
                        setPhotoDeletedValue={setPhotoDeletedValue}
                    /> */}
          <View
            style={{
              backgroundColor: '#e5ecf7ff',
              padding: 10,
              borderRadius: 8,
              margin: 20,
            }}>
            <TakePhotoPipe
              openImagePicker={openImagePickerPipe}
              selectedImage={selectedImagePipe}
              title={`${pipeName}`}
              color="black"
            />
          </View>
          <View style={styles.hiddenContainer}>
            {tempImage && (
              <View
                ref={watermarkViewRef}
                style={styles.watermarkView}
                collapsable={false}>
                <Image
                  source={{ uri: tempImage }}
                  style={styles.watermarkImage}
                  resizeMode="cover"
                />
                <View style={styles.watermarkTextContainer}>
                  <Text style={styles.watermarkText}>
                    {tempText}
                  </Text>
                </View>
              </View>
            )}
          </View>
          {params?.status_label == 'REJECTED' && (
            <ButtonFormBottom
              label="Update"
              onPress={() => handleImgUpdate()}
            />
          )}
        </View>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};

export default InstrumentWiseActivityDetails;

const styles = StyleSheet.create({
  LoadingScreen: {
    position: 'absolute',
    top: '52%',
    left: '45%',
    zIndex: 9999,
  },
  watermarkView: {
    width: 200,
    height: 200,
    backgroundColor: '#000',
  },
  watermarkImage: {
    width: '100%',
    height: '100%',
  },
  watermarkTextContainer: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  watermarkText: {
    color: '#df2020',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
});
