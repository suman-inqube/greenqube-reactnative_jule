import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import React, { useState, useEffect, useCallback, useContext } from 'react';
import TakePhoto from '../Activity/TakePhoto';
import RecordComp from '../Activity/RecordComp';
import { launchCamera } from 'react-native-image-picker';
import Marker, { Position } from 'react-native-image-marker';
import {
  problemPlotAgainstFarmerAPI,
  problemProduceAgainstPlotAPI,
  problemProductionStageAPI,
  problemSaveAPI,
  problemSeverityAPI,
  problemTypeNameAPI,
  addModuleForView,
} from '../../../config/apiHere';
import MessageDialog from '../../Common/MessageDialog';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import { useIsFocused } from '@react-navigation/native';
import SoundRecord from '../../Common/SoundRecord';
const audioRecorderPlayer = new AudioRecorderPlayer();
import AudioPlayerView from '../../Common/AudioPlayerView';
import { userCreateContext } from '../../Context/usersCreateContext';
import { plotHook } from '../../hooks/plotHook';
import { Colors, Fronts } from '../../utils/Constants';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const FarmerCreateProblem = ({ navigation }) => {
  //GQR-67
  const {
    FormsTitle,
    dbLanTokUsr,
    loginUser_data,
    LoadingScreen,
    CustomHeader,
    t,
    onBackPress,
    getItem,
    setItem,
    logoImage,
    topBanner,
    DeviceInfo,
    DropdownForm,
    AlertMesg,
    Root,
    Toast,
    SPSheet,
    InputTextForm,
    DatePickerComp,
    ButtonForm,
    effective_dates,
    isOnline,
  } = useContext(userCreateContext);
  const { dbname, lan_id, token, user_id, owner, FcmUserToken } = loginUser_data;
  const { farmerId, supervisorId } = dbLanTokUsr;
  //GQR-67
  const { problemPlotAgainstFarmer, plotAll, setplotAll } = plotHook(
    dbname,
    lan_id,
    token,
    user_id,
    isOnline,
  );
  const { netConnection } = DeviceInfo();
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [farmerID, setfarmerID] = useState();
  const [productionStageAll, setproductionStageAll] = useState([]);
  const [problemAll, setProblemAll] = useState([]);
  const [problemTypeAll, setProblemTypeAll] = useState([]);
  const [problemNameAll, setProblemNameAll] = useState([]);
  const [severityAll, setSeverityAll] = useState([]);
  const [nameVarityStartEnd, setNameVarityStartEnd] = useState({
    name: '',
    varity: '',
    cycleStarts: '',
    cycleEnd: '',
    production_process: '',
    question_title1: '',
  });
  const [affectedDate, setaffectedDate] = useState('');
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [addAffectedDate, setaddAffectedDate] = useState(false);
  const [selectedImage, setSelectedImage] = useState({
    firstItem: '',
    secondItem: '',
    thirdItem: '',
  });
  const [selectedRecord, setSelectedRecord] = useState({
    firstItemRecord: '',
    secondItemRecord: '',
    thirdItemRecord: '',
  });
  const [saveData, setSaveData] = useState({
    agent_fcm: '',
    farmer_fcm: '',
    latitude: '',
    longitude: '',
    question_type: 'crop_problem',
    land_unit_id: '',
    affected_area: '',
    category_id: '',
    affected_date: '',
    question_title: '',
    question_desc: '',
    severity_id: '',
  });
  const [myphotoAll, setmyPhotoAll] = useState([]);
  const [myTitleAll, setMyTitleAll] = useState([]);
  const [showingMenu, setShowingMenu] = useState(false);
  const [modalVisibleRecordFirstItem, setModalVisibleRecordFirstItem] =
    useState(false);
  const [modalVisibleRecordSecoundItem, setModalVisibleRecordSecoundItem] =
    useState(false);
  const [modalVisibleRecordThirdItem, setModalVisibleRecordThirdItem] =
    useState(false);
  const [soundRecordFirstItem, setSoundRecordFirstItem] = useState({
    item: '1',
    isLoggingIn: false,
    recordSecs: 0,
    recordTime: '00:00:00',
    result: '',
  });
  const [soundRecordSecoundItem, setSoundRecordSecoundItem] = useState({
    item: '2',
    isLoggingIn: false,
    recordSecs: 0,
    recordTime: '00:00:00',
    result: '',
  });
  const [soundRecordThirdItem, setSoundRecordThirdItem] = useState({
    item: '3',
    isLoggingIn: false,
    recordSecs: 0,
    recordTime: '00:00:00',
    result: '',
  });
  const handlePlot = async relId => {
    setShowingMenu(false);
    setNameVarityStartEnd({
      ...nameVarityStartEnd,
      name: '',
      varity: '',
      cycleStarts: '',
      cycleEnd: '',
      production_process: '',
    });
    if (netConnection) {
      var response = await problemProduceAgainstPlotAPI(
        dbLanTokUsr.dbName,
        dbLanTokUsr.languageId,
        farmerID,
        relId.value,
      );
      await setItem('problemProduceAgainstPlot' + relId.value, response);
    } else {
      var response = await getItem('problemProduceAgainstPlot' + relId.value);
    }
    if (response?.status == 200) {
      setNameVarityStartEnd({
        ...nameVarityStartEnd,
        name: response?.data?.data?.crop_name.name,
        varity: response?.data?.data?.crop_variety.name,
        cycleStarts: response?.data?.data?.sowing_date,
        cycleEnd: response?.data?.data?.harvesting_date,
        production_process: response?.data?.data?.farmer_production_system.name,
      });
      if (new Date() < new Date(response?.data?.data?.harvesting_date)) {
        setShowingMenu(true);
        setSaveData({
          ...saveData,
          crop_season_id: response?.data?.data?.crop_season_id,
          crop_type_id: response?.data?.data?.crop_type_id,
          crop_variety_id: response?.data?.data?.crop_variety_id,
          crop_name_id: response?.data?.data?.crop_name_id,
          plot_id: relId.value,
          harvesting_date: response?.data?.data?.harvesting_date,
          sowing_date: response?.data?.data?.sowing_date,
          production_system:
            response?.data?.data?.farmer_production_system.fa_id,
          agent_id: supervisorId,
        });
        if (netConnection) {
          var productionStage_res = await problemProductionStageAPI(
            dbLanTokUsr.dbName,
            dbLanTokUsr.languageId,
            response?.data?.data?.crop_type_id,
            response?.data?.data?.crop_name_id,
          );
          await setItem(
            'problemProductionStage' +
            response?.data?.data?.crop_type_id +
            response?.data?.data?.crop_name_id,
            productionStage_res,
          );
        } else {
          var productionStage_res = await getItem(
            'problemProductionStage' +
            response?.data?.data?.crop_type_id +
            response?.data?.data?.crop_name_id,
          );
        }
        if (productionStage_res?.status == 200) {
          const dataArray = productionStage_res?.data?.data?.growth_stage.map(
            data => ({
              value: data.growth_stage.fid,
              label: data.growth_stage.name,
            }),
          );
          setproductionStageAll(dataArray);
        }
      } else {
        // MessageDialog({ title: 'Important', message: `${t('your_previous_crop_hervested')} ${t('add_a_new_crop')}` });
        Toast.show({
          time: 3,
          text: `${t('your_previous_crop_hervested')} ${t('add_a_new_crop')}`,
          ...AlertMesg[0],
        });
        setplotAll([]);
        setTimeout(() => {
          navigation.navigate('FarmerDashboard');
        }, 1300);
      }
    }
  };
  const openImagePicker = item => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 200,
      maxWidth: 200,
    };
    launchCamera(options, async response => {
      if (response?.didCancel) {
        console.log('User cancelled camera');
      } else if (response?.error) {
        console.log('Camera Error: ', response?.error);
      } else {
        const timestamp = Date.now();
        let imageUri = response?.uri || response?.assets?.[0]?.uri;
        const options = {
          backgroundImage: {
            src: imageUri,
            scale: 1,
          },
          watermarkTexts: [
            {
              text: `${saveData.latitude},${saveData.longitude
                },${new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }).format(timestamp)}`,
              positionOptions: { position: Position.bottomLeft },
              style: {
                color: '#df2020',
                fontSize: 2,
                fontName: 'Arial',
                textBackgroundStyle: { padding: '10% 10%', color: '#00000000' },
              },
            },
          ],
          scale: 1,
          quality: 100,
          filename: `${response?.assets[0].fileName}`,
          saveFormat: `${response?.assets[0].type}`,
          maxSize: 1000,
        };
        let path = await Marker.markText(options);
        setSelectedImage({ ...selectedImage, [item]: `file://${path}` });
        const newPhoto = {
          uri: `file://${path}`,
          type: 'image/jpeg',
          name: `file://${path}`,
        };
        addPhoto(newPhoto);
        const newTitle = {};
        addTitle(newTitle);
      }
    });
  };
  const addPhoto = newPhoto => {
    setmyPhotoAll([...myphotoAll, newPhoto]);
  };
  const addTitle = newTitle => {
    setMyTitleAll([...myTitleAll, newTitle]);
  };
  const handleDatePicker = item => {
    const effective_date = effective_dates(item);
    setaffectedDate(effective_date);
    setSaveData({ ...saveData, affected_date: effective_date });
  };
  const handleProblemType = problem_type => {
    setSaveData({ ...saveData, problem_type_id: problem_type.value });
    setNameVarityStartEnd({
      ...nameVarityStartEnd,
      question_title1: problem_type.label,
    });
    const problemNameFound = problemAll.find(
      user => user.fid === problem_type.value,
    );
    if (problemNameFound) {
      const dataArray = problemNameFound.problem_type.map(data => ({
        value: data.problem_name.fid,
        label: data.problem_name.name,
      }));
      setProblemNameAll(dataArray);
    }
  };
  const handleProblemName = problem_name => {
    setSaveData({
      ...saveData,
      problem_name_id: problem_name.value,
      question_title:
        nameVarityStartEnd.name +
        ',' +
        nameVarityStartEnd.question_title1 +
        ',' +
        problem_name.label,
    });
  };
  const requestLivePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(data =>
          setSaveData({
            ...saveData,
            latitude: data.coords.latitude,
            longitude: data.coords.longitude,
          }),
        );
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  function handleClear() {
    setSaveData({
      ...saveData,
      agent_fcm: '',
      farmer_fcm: '',
      latitude: '',
      longitude: '',
      question_type: 'crop_problem',
      land_unit_id: '',
      affected_area: '',
      category_id: '',
      affected_date: '',
      question_title: '',
      question_desc: '',
      production_process: '',
      severity_id: '',
    });
    setaffectedDate('');
    setShowingMenu(false);
    setplotAll([]);
    setproductionStageAll([]);
    setProblemAll([]);
    setProblemTypeAll([]);
    setProblemNameAll([]);
    setSeverityAll([]);
    setSelectedImage({
      firstItem: '',
      secondItem: '',
      thirdItem: '',
    });
    setNameVarityStartEnd({
      ...nameVarityStartEnd,
      name: '',
      varity: '',
      cycleStarts: '',
      cycleEnd: '',
      production_process: '',
    });
    setSoundRecordFirstItem({
      item: '1',
      isLoggingIn: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      result: '',
    });
    setSoundRecordSecoundItem({
      item: '2',
      isLoggingIn: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      result: '',
    });
    setSoundRecordThirdItem({
      item: '3',
      isLoggingIn: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      result: '',
    });
  }
  const onPageLoad = async () => {
    requestLivePermission();
    setfarmerID(user_id);
    problemPlotAgainstFarmer(dbname, lan_id, token, user_id, isOnline);
    if (netConnection) {
      var [problemName_res, severity_res] = await Promise.all([
        problemTypeNameAPI(dbname, lan_id, token),
        problemSeverityAPI(dbname, lan_id),
      ]);
      await setItem('problemTypeName', problemName_res);
      await setItem('severity_res', severity_res);
    } else {
      var problemName_res = await getItem('problemTypeName');
      var severity_res = await getItem('severity_res');
    }
    setProblemAll(problemName_res.data.data);
    if (problemName_res?.status == 200) {
      const dataArray = problemName_res?.data?.data?.map(data => ({
        value: data.fid,
        label: data.name,
      }));
      setProblemTypeAll(dataArray);
      setIsLoading(false);
    }
    if (severity_res?.status == 200) {
      const dataArray = severity_res?.data?.data?.rows.map(data => ({
        value: data.fid,
        label: data.name,
      }));
      setSeverityAll(dataArray);
    }
  };
  const validateForm = () => {
    if (!saveData.plot_id) {
      Toast.show({ time: 2, text: t('pl_en_plot_name_first'), ...AlertMesg[0] });
      return false;
    }
    if (!saveData.growth_stage) {
      Toast.show({
        time: 2,
        text: t('please_select_growth_stage'),
        ...AlertMesg[0],
      });
      return false;
    }
    if (!saveData.problem_type_id) {
      Toast.show({
        time: 2,
        text: t('please_select_problem_type'),
        ...AlertMesg[0],
      });
      return false;
    }
    if (!saveData.problem_name_id) {
      Toast.show({ time: 2, text: t('please_select_problem'), ...AlertMesg[0] });
      return false;
    }
    if (!saveData.severity_id) {
      Toast.show({ time: 2, text: t('please_select_severity'), ...AlertMesg[0] });
      return false;
    }
    if (!saveData.affected_date) {
      Toast.show({
        time: 2,
        text: t('pick_activity_perform_date'),
        ...AlertMesg[0],
      });
      return false;
    }
    if (!saveData.latitude) {
      Toast.show({ time: 2, text: t('gpsalertdialogmessage'), ...AlertMesg[0] });
      return false;
    }
    return true;
  };
  const handleSave = async () => {
    if (validateForm()) {
      let array = [];
      const formData = new FormData();
      myphotoAll.forEach(photo => {
        formData.append('photo', photo);
      });
      formData.append('file_title', JSON.stringify(myTitleAll));
      if (soundRecordFirstItem.result != '') {
        formData.append('audio', {
          name: 'firstItem.mp3',
          type: 'audio/mp3',
          uri: `file://${RNFS.DocumentDirectoryPath}/firstItem.mp3`,
        });
      }
      if (soundRecordSecoundItem.result != '') {
        formData.append('audio', {
          name: 'secoundItem.mp3',
          type: 'audio/mp3',
          uri: `file://${RNFS.DocumentDirectoryPath}/secoundItem.mp3`,
        });
      }
      if (soundRecordThirdItem.result != '') {
        formData.append('audio', {
          name: 'thirdItem.mp3',
          type: 'audio/mp3',
          uri: `file://${RNFS.DocumentDirectoryPath}/thirdItem.mp3`,
        });
      }
      formData.append('post_meta_info', JSON.stringify(array));
      formData.append('agent_fcm', dbLanTokUsr.owner);
      // formData.append('farmer_fcm', dbLanTokUsr.FcmUserToken);
      formData.append('latitude', saveData.latitude);
      formData.append('longitude', saveData.longitude);
      formData.append('question_type', saveData.question_type);
      formData.append('land_unit_id', saveData.land_unit_id);
      formData.append('category_id', saveData.category_id);
      formData.append('affected_area', saveData.affected_area);
      formData.append('crop_season_id', saveData.crop_season_id);
      formData.append('crop_type_id', saveData.crop_type_id);
      formData.append('crop_variety_id', saveData.crop_variety_id);
      formData.append('crop_name_id', saveData.crop_name_id);
      formData.append('plot_id', saveData.plot_id);
      formData.append('harvesting_date', saveData.harvesting_date);
      formData.append('sowing_date', saveData.sowing_date);
      formData.append('production_system', saveData.production_system);
      formData.append('agent_id', saveData.agent_id);
      formData.append('growth_stage_id', saveData.growth_stage);
      formData.append('problem_type_id', saveData.problem_type_id);
      formData.append('problem_name_id', saveData.problem_name_id);
      formData.append('affected_date', saveData.affected_date);
      formData.append('question_title', saveData.question_title);
      formData.append('question_desc', saveData.question_desc);
      formData.append('severity_id', saveData.severity_id);
      if (netConnection) {
        const database_res = await problemSaveAPI(
          dbLanTokUsr.dbName,
          dbLanTokUsr.languageId,
          dbLanTokUsr.token,
          farmerID,
          formData,
        );
        if (database_res.status === 200) {
          addModuleForView(
            dbLanTokUsr.dbName,
            dbLanTokUsr.languageId,
            farmerID,
            dbLanTokUsr.token,
            'Problem User',
            'module_hit',
            'problem_user',
            1,
          );
          Toast.show({ text: t('Data_submitted_successfully'), ...AlertMesg[0] });
          setTimeout(() => {
            handleClear();
            navigation.navigate('FarmerListProblem');
          }, 1000);
        }
      } else {
        let timeStamp = Date.now();
        await setItem('off' + timeStamp, formData);
        let offlineDataArr = await getItem('offlineFarmerProblemData');
        if (offlineDataArr) {
          await setItem(
            'offlineFarmerProblemData',
            offlineDataArr + ',' + 'off' + timeStamp,
          );
        } else {
          await setItem('offlineFarmerProblemData', '00,off' + timeStamp);
        }
        setTimeout(() => {
          handleClear();
          navigation.navigate('FarmerListProblem');
        }, 1000);
      }
    }
  };
  const onStartRecordFirstItem = async () => {
    const path = RNFS.DocumentDirectoryPath + '/firstItem.mp3';
    await RNFS.mkdir(RNFS.DocumentDirectoryPath);
    await audioRecorderPlayer.startRecorder(path);
    audioRecorderPlayer.addRecordBackListener(e => {
      setSoundRecordFirstItem({
        isLoggingIn: true,
        recordSecs: e.currentPosition,
        recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
      });
      if (
        audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)) >= '00:59:80'
      ) {
        onStopRecordFirstItem();
        setModalVisibleRecordFirstItem(false);
      }
      return;
    });
  };
  const onStartRecordSecoundItem = async () => {
    const path = RNFS.DocumentDirectoryPath + '/secoundItem.mp3';
    await RNFS.mkdir(RNFS.DocumentDirectoryPath);
    await audioRecorderPlayer.startRecorder(path);
    audioRecorderPlayer.addRecordBackListener(e => {
      setSoundRecordSecoundItem({
        isLoggingIn: true,
        recordSecs: e.currentPosition,
        recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
      });
      if (
        audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)) >= '00:59:80'
      ) {
        onStopRecordSecoundItem();
        setModalVisibleRecordSecoundItem(false);
      }
      return;
    });
  };
  const onStartRecordThirdItem = async () => {
    const path = RNFS.DocumentDirectoryPath + '/thirdItem.mp3';
    await RNFS.mkdir(RNFS.DocumentDirectoryPath);
    await audioRecorderPlayer.startRecorder(path);
    audioRecorderPlayer.addRecordBackListener(e => {
      setSoundRecordThirdItem({
        isLoggingIn: true,
        recordSecs: e.currentPosition,
        recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
      });
      if (
        audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)) >= '00:59:80'
      ) {
        onStopRecordThirdItem();
        setModalVisibleRecordThirdItem(false);
      }
      return;
    });
  };
  const onStopRecordFirstItem = useCallback(async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setSoundRecordFirstItem({
        ...soundRecordFirstItem,
        isLoggingIn: false,
        result: result,
      });
    } catch (error) {
      console.error('Error stopping the recording:', error);
    }
  }, []);
  const onStopRecordSecoundItem = useCallback(async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setSoundRecordSecoundItem({ isLoggingIn: false, result: result });
    } catch (error) {
      console.error('Error stopping the recording:', error);
    }
  }, []);
  const onStopRecordThirdItem = useCallback(async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setSoundRecordThirdItem({ isLoggingIn: false, result: result });
    } catch (error) {
      console.error('Error stopping the recording:', error);
    }
  }, []);
  const handleBackPress = () => {
    navigation.navigate('FarmerListProblem');
    return true;
  };
  useEffect(() => {
    onPageLoad();
  }, [netConnection]);

  const cancelRecord = async item => {
    await audioRecorderPlayer.stopPlayer();
    if (item == 'firstItem') {
      setSoundRecordFirstItem({
        item: '1',
        isLoggingIn: false,
        recordSecs: 0,
        recordTime: '00:00:00',
        result: '',
      });
    } else if (item == 'secoundItem') {
      setSoundRecordSecoundItem({
        item: '2',
        isLoggingIn: false,
        recordSecs: 0,
        recordTime: '00:00:00',
        result: '',
      });
    } else if (item == 'thirdItem') {
      setSoundRecordThirdItem({
        item: '3',
        isLoggingIn: false,
        recordSecs: 0,
        recordTime: '00:00:00',
        result: '',
      });
    }
  };
  const soundPlay = async item => {
    let path;
    if (item == 'firstItem') {
      path = `file://${RNFS.DocumentDirectoryPath}/firstItem.mp3`;
    } else if (item == 'secoundItem') {
      path = `file://${RNFS.DocumentDirectoryPath}/secoundItem.mp3`;
    } else if (item == 'thirdItem') {
      path = `file://${RNFS.DocumentDirectoryPath}/thirdItem.mp3`;
    }
    SPSheet.show({
      component: () => <AudioPlayerView path={path} />,
      dragFromTopOnly: true,
      onCloseComplete: () => { },
      onOpenComplete: () => { },
      height: 260,
    });
  };
  return (
    <FarmerDrawerScreenWrapper1>
      <View style={styles.container}>
        <CustomHeader
          path="FarmerListProblem"
          logoImage={logoImage}
          topBanner={topBanner}
        />
        <DatePickerComp
          openDate={addAffectedDate}
          newDate={newFromDate}
          setOpenDate={setaddAffectedDate}
          handleDatePicker={handleDatePicker}
        />
        {/* <FormsTitle title={t('add_crop_problem')} /> */}
        {modalVisibleRecordFirstItem ? (
          <SoundRecord
            modalVisibleRecord={modalVisibleRecordFirstItem}
            setModalVisibleRecord={setModalVisibleRecordFirstItem}
            onStartRecordFirstItem={onStartRecordFirstItem}
            onStopRecordFirstItem={onStopRecordFirstItem}
            soundRecord={soundRecordFirstItem}
          />
        ) : null}
        {modalVisibleRecordSecoundItem ? (
          <SoundRecord
            modalVisibleRecord={modalVisibleRecordSecoundItem}
            setModalVisibleRecord={setModalVisibleRecordSecoundItem}
            onStartRecordFirstItem={onStartRecordSecoundItem}
            onStopRecordFirstItem={onStopRecordSecoundItem}
            soundRecord={soundRecordSecoundItem}
          />
        ) : null}
        {modalVisibleRecordThirdItem ? (
          <SoundRecord
            modalVisibleRecord={modalVisibleRecordThirdItem}
            setModalVisibleRecord={setModalVisibleRecordThirdItem}
            onStartRecordFirstItem={onStartRecordThirdItem}
            onStopRecordFirstItem={onStopRecordThirdItem}
            soundRecord={soundRecordThirdItem}
          />
        ) : null}
        <ScrollView>
          {isLoading && (
            <View style={styles.loadingScreen}>
              <LoadingScreen />
            </View>
          )}
          <View style={styles.fromContainer}>
            <View>
              <DropdownForm
                label={t('plot')}
                data={plotAll}
                required={true}
                onChange={relId => handlePlot(relId)}
              />
              {showingMenu ? (
                <View style={styles.plotSiteContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>{t('crop_name')}</Text>
                    <Text style={styles.value}>{nameVarityStartEnd.name}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.label}>{t('crop_veriety')}</Text>
                    <Text style={styles.value}>
                      {nameVarityStartEnd.varity}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>{t('showing_date')}</Text>
                    <Text style={styles.value}>
                      {formatDateToMMDDYYYY(nameVarityStartEnd.cycleStarts)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>
                      {t('harvesting_date_auto_calculated')}
                    </Text>
                    <Text style={styles.value}>
                      {formatDateToMMDDYYYY(nameVarityStartEnd.cycleEnd)}
                    </Text>
                  </View>
                </View>
              ) : (
                ''
              )}
              <DropdownForm
                label={t('growth_stage')}
                required={true}
                data={productionStageAll}
                onChange={production_stage =>
                  setSaveData({
                    ...saveData,
                    growth_stage: production_stage.value,
                  })
                }
              />
              <DropdownForm
                label={t('problem_type')}
                required={true}
                data={problemTypeAll}
                onChange={item => handleProblemType(item)}
              />
              <DropdownForm
                label={t('select_problem')}
                required={true}
                data={problemNameAll}
                onChange={item => handleProblemName(item)}
              />
              <DropdownForm
                label={t('select_severity')}
                required={true}
                data={severityAll}
                onChange={item =>
                  setSaveData({ ...saveData, severity_id: item.value })
                }
              />
              <InputTextForm
                label={t('production_system')}
                value={nameVarityStartEnd.production_process}
                editable={false}
              />
              <View>
                <View style={styles.labelContainer}>
                  <Text
                    style={{
                      color: '#4e4e4e',
                      fontFamily: 'Poppins-Regular',
                      fontSize: 15,
                    }}>
                    {t('agent_crop_problem_affected_date')}
                  </Text>
                  <Text style={styles.requiredStar}> *</Text>
                </View>
                <TouchableOpacity
                  style={styles.activityPerFromDate}
                  onPress={() => setaddAffectedDate(true)}>
                  <Text
                    style={{
                      color: '#000',
                      fontFamily: 'Poppins-Regular',
                      fontSize: 15,
                    }}>
                    {affectedDate}
                  </Text>
                  <Image
                    source={require('../../Common/images/calendar.png')}
                    style={{ width: 20, height: 20 }}
                  />
                </TouchableOpacity>
              </View>
              <InputTextForm
                label={t('enter_problem_title')}
                onChangeText={item =>
                  setSaveData({ ...saveData, question_title: item })
                }
                value={saveData.question_title}
              />
              <InputTextForm
                label={t('enter_problem_description')}
                onChangeText={item =>
                  setSaveData({ ...saveData, question_desc: item })
                }
                value={saveData.question_desc}
              />
              <TakePhoto
                openImagePicker={openImagePicker}
                selectedImage={selectedImage}
                title={t('take_a_photo_optional')}
              />
              <RecordComp
                selectedRecord={selectedRecord}
                title={t('record_your_comment_optional')}
                // onPress={handleRecord}
                setModalVisibleRecordFirstItem={setModalVisibleRecordFirstItem}
                setModalVisibleRecordSecoundItem={
                  setModalVisibleRecordSecoundItem
                }
                setModalVisibleRecordThirdItem={setModalVisibleRecordThirdItem}
                soundRecordFirstItem={soundRecordFirstItem}
                soundRecordSecoundItem={soundRecordSecoundItem}
                soundRecordThirdItem={soundRecordThirdItem}
                cancelRecord={cancelRecord}
                soundPlay={soundPlay}
              />
            </View>
          </View>
        </ScrollView>
        <View style={{ marginTop: 10 }}>
          <ButtonForm label={t('submit')} onPress={() => handleSave()} />
        </View>
        <Root></Root>
      </View>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerCreateProblem;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  titleContainer: {
    width: '95%',
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  title: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  fromContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  activityPerFromDate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 0.5,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    color: '#000000',
    //  borderColor: '#d1d5db',
    borderColor: Colors.borderGreen,
    marginBottom: 20,
  },
  plotSiteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2faffff',

    marginVertical: 8,
    borderRadius: 20,
    borderLeftWidth: 3,
    borderLeftColor: Colors.borderGreen,
    // flexDirection: 'row',
    // alignItems: 'center',
    // marginBottom: 8,
    // paddingHorizontal: 15,
    // marginHorizontal: '1%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 4,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: Colors.border,
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,
  },
  plotSiteContainerCell: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    marginBottom: 2,
  },
  plotSiteContainerItem: {
    width: '50%',
  },
  plotSiteItemText: {
    color: '#000',
    marginVertical: 5,
    fontFamily: 'Poppins-Regular',
  },

  flatContainer: {
    backgroundColor: 'white',
    position: 'absolute',
    zIndex: 999,
    // bottom: '100%',
    top: 90,
    left: 0,
    marginHorizontal: '10%',
    width: '80%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },

  flatlisttitle: {
    padding: 10,
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },

  flatlistHeight: {
    height: Dimensions.get('window').height / 4,
  },

  container_recording: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  item_recording: {
    // backgroundColor: '#e9e9e9',
    width: '30%',
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    TouchableOpacityAlign: 'center',
  },
  title_recording: {
    paddingVertical: 10,
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  loadingScreen: {
    position: 'absolute',
    top: 100,
    left: '45%',
    zIndex: 999,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    // paddingHorizontal: 5,
    paddingHorizontal: 10,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: 'red',
    width: '100%',
    marginTop: 5,
  },
  label: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
    // flex: 1,
    marginBottom: 5,
  },
  value: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    // flex: 1,
    // textAlign: 'right',
  },
  requiredStar: {
    color: 'red',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginLeft: 5,
  },
});
