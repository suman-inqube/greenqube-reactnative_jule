import { Image, StyleSheet, Text, View } from 'react-native';
import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import ButtonFormBottom from '../../Common/ButtonFormBottom';
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
import { showAIValidationError } from '../../utils/showAIValidationError';
import { isPointInPolygon } from 'geolib';
import ActivityMap from '../../Common/ActivityMap';
import ImageAnalysisScreen from '../Activity/ImageAnalysisScreen';
import { MODELS, loadModelFromAssets, loadModel } from '../Activity/ImageAnalysisScreen'
const FarmerInstrumentWiseActivityDetails = ({ navigation }) => {
  const location = useLocationTracking();
  const {
    loginUser_data,
    t,
    AlertMesg,
    onBackPress,
    Root,
    Toast,
    LoadingScreen,
    FormsTitle,
    CustomHeader,
    ButtonFormBottom,
    logoImage,
    topBanner,
    coords,
    dbLanTokUsr
  } = useContext(userCreateContext);
  const { dbname, lan_id, token, user_id } = loginUser_data;
  const { ai_camera_pipe_image, ai_camera_id_proof } = dbLanTokUsr;
  const route = useRoute();
  const isFocused = useIsFocused();
  const [pipeName, setpipeName] = useState('');
  const [addressProof, setAddressProof] = useState([
    { uri: '', name: '', type: '', fileName: '', id: '', pipe_id: '' },
    { uri: '', name: '', type: '', fileName: '', id: '', pipe_id: '' },
  ]);
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
  const [modalVisibleMap, setModalVisibleMap] = useState(false);
  const [cameraItem, setCameraItem] = useState('');
  const [plotPolygon, setPlotPolygon] = useState([]);
  const [pipeLatLong, setPipeLatLong] = useState([]);
  const [outofRange, setOutofRange] = useState(false);
  const [outofRangeCheck, setOutofRangeCheck] = useState(false);

  const [replaceImgKey, setReplaceImgKey] = useState({
    arrayPosition: '',
    imgPosition: '',
  });
  const [dafaultLatLon, setDefaultLatLon] = useState({
    latitude: 22.2903935,
    longitude: 87.8491339,
    accuracy: 10,
  });
  const watermarkViewRef = useRef(null);

  const [tempImage, setTempImage] = useState(null);
  const [tempText, setTempText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [AIModalVisible, setAIModalVisible] = useState(false);
  const [mapLatLon, setMapLatLon] = useState(null);
  const [sessions, setSessions] = useState({
    clarity: null,
    obstacle: null,
    pipe: null,
    moisture: null,
    ruler: null
  }); //
  const [modelStatus, setModelStatus] = useState({
    clarity: false,
    obstacle: false,
    pipe: false,
    moisture: false,
    ruler: false
  });//
  const [modelLoading, setModelLoading] = useState({
    clarity: false,
    obstacle: false,
    pipe: false,
    moisture: false,
    ruler: false
  });//
  const [loadingModels, setLoadingModels] = useState(true);
    const [loadProgress, setLoadProgress] = useState(''); 
  const { params } = route;
  const onPageLoad = async () => {
    try {
      const { latitude, longitude } = coords || {};
      var latlong;
      if (latitude == '' && longitude == '') {
        latlong = await getHighAccuracyLocation();
      }
      const lat = latitude === '' ? latlong.latitude : latitude;
      const lon = longitude === '' ? latlong.longitude : longitude;
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
        const plotCoordinates = pipeRes?.data?.data?.plotLatLong?.rows?.map(
          item => ({
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude),
          }),
        );
        if (plotCoordinates && plotCoordinates.length > 0) {
          setPlotPolygon(plotCoordinates);
          const inside = isPointInPolygon(
            { latitude: lat, longitude: lon },
            plotCoordinates,
          );
          if (inside) {
            setOutofRange(true);
            setOutofRangeCheck(true);
          } else {
            setOutofRange(false);
            setOutofRangeCheck(false);
          }
        }
        setPlotPolygon(plotCoordinates || []);
        const pipeLocations =
          pipeRes?.data?.data?.pipeData?.rows?.[0]?.pipeLatLong?.map(item => ({
            latitude: item.latitude,
            longitude: item.longitude,
            name: pipeRes?.data?.data?.pipeData?.rows?.[0]?.pipe_name || 'Pipe',
            color: '#000000', // You can customize this
          }));
        setPipeLatLong(pipeLocations || []);

        const { rows, count } = pipeRes?.data?.data?.pipeData;
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
  const loadAllModels = async (isMountedRef, timeoutsRef, loadedSessionsRef) => {
    try {
      for (const model of MODELS) {
        const session = await loadModelFromAssets(model.file);
        loadedSessionsRef.current[model.key] = session;
        setSessions(prev => ({
          ...prev,
          [model.key]: session, // clarity / pipe / etc
        }));
        setModelStatus(prev => ({
          ...prev,
          [model.key]: true,
        }));
      }
      setLoadingModels(false);
    } catch (e) {
      console.log("modelerror", e)
    }
  };
  useEffect(() => {
    if (ai_camera_pipe_image != 1) return;
    const isMountedRef = { current: true };
    const timeoutsRef = { current: [] };
    const loadedSessionsRef = { current: {} };
    // Start loading models
    loadAllModels(isMountedRef, timeoutsRef, loadedSessionsRef);

    // Cleanup when component unmounts or dependencies change
    return () => {
      console.log('🗑 Cleaning up models on unmount');

      isMountedRef.current = false;

      // Clear all timeouts
      timeoutsRef.current.forEach(clearTimeout);

      // Release all sessions
      Object.values(loadedSessionsRef.current).forEach(session => {
        try {
          session?.release?.();
        } catch (e) {
          console.log('Error releasing session:', e);
        }
      });

      loadedSessionsRef.current = {};
    };
  }, [loadingModels, ai_camera_pipe_image]);
  useEffect(() => {
    onPageLoad();
  }, []);
  const handleImgUpdate = async () => {
    setIsLoading(true);
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
        showAIValidationError(updateActivityPipeImages);
      }
      if (updateActivityPipeImages?.status === 200) {
        Toast.show({ text: t('Data_submitted_successfully'), ...AlertMesg[0] });
        setTimeout(() => {
          navigation.navigate('FarmerInstrumentWiseActivityView');
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
    setCameraItem(cameraItem);
    setModalVisibleMap(true);
  }, []);

  const TakePhoto = useCallback(async () => {
    try {
      // Get fresh location at the moment of taking photo
      let currentLocation;
      if (coords?.latitude && coords?.longitude) {
        currentLocation = coords;
      } else {
        currentLocation = await getHighAccuracyLocation();
      }
      const { latitude, longitude } = currentLocation;
      const lat = latitude || latlong?.latitude || 0;
      const lon = longitude || latlong?.longitude || 0;
      setModalVisibleMap(false);
      setAIModalVisible(true);
      setMapLatLon({
        latitude: lat,
        longitude: lon
      })

    } catch (error) {
      console.log('Error in TakePhoto:', error);
      CustomAlert('Error', 'Failed to get location or open camera', true, 'OK');
    }
  }, [coords, plotPolygon, cameraItem]);
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {modalVisibleMap && (
            <ActivityMap
              modalVisibleMap={modalVisibleMap}
              setModalVisibleMap={setModalVisibleMap}
              plotPolygon={plotPolygon}
              TakePhoto={TakePhoto}
              location={coords||dafaultLatLon}
              setOutOfRange={setOutofRange}
              outofRange={outofRange}
              pipeLatLong={pipeLatLong}
              replaceImgKey={replaceImgKey}
              userLocationPriority="high"
              setMapLatLon={setMapLatLon}
            />
          )}
          {AIModalVisible && (<ImageAnalysisScreen
            AIModalVisible={AIModalVisible}
            mapLatLon={mapLatLon}
            setAIModalVisible={setAIModalVisible}
            setTempImage={setTempImage}
            tempImage={tempImage}
            setTempText={setTempText}
            setSelectedImagePipe={setSelectedImagePipe}
            selectedImagePipe={selectedImagePipe}
            setPipeDetails={[]}
            watermarkViewRef={watermarkViewRef}
            act_type={params?.pipeActivity?.activityType?.categoryName}
            tempText={tempText}
            replaceImgKey={replaceImgKey}
            cameraItem={cameraItem}
            sessions={sessions}
            setSessions={setSessions}
            modelStatus={modelStatus}
            setModelStatus={setModelStatus}
            modelLoading={modelLoading}
            setModelLoading={setModelLoading}
            loadProgress={loadProgress}
            setLoadProgress={setLoadProgress}
            loadingModels={loadingModels}
            setLoadingModels={setLoadingModels}
            ai_camera_pipe_image={ai_camera_pipe_image}
          />)}
          {isLoading ? (
            <View style={styles.LoadingScreen}>
              <LoadingScreen />
            </View>
          ) : null}
          <CustomHeader
            path="Dashboard"
            // HandlerGoBack={HandlerGoBack}
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
                  <Text style={styles.watermarkText}>{tempText}</Text>
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

export default FarmerInstrumentWiseActivityDetails;

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
