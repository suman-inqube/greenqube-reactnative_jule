import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  SafeAreaView,
  Dimensions,
  Button,
  Animated,
  Keyboard
} from 'react-native';
import { PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import React, { useEffect, useState, useCallback } from 'react';
import InputTextForm from '../../Common/InputTextForm';
import DropdownForm from '../../Common/DropdownForm';
import RadioForm from '../../Common/RadioForm';
import { request, PERMISSIONS } from 'react-native-permissions';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import TakePhoto from './TakePhoto';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Marker, { Position, TextBackgroundType } from 'react-native-image-marker';
import RecordComp from '../Activity/RecordComp';
import ButtonForm from '../../Common/ButtonForm';
import DatePickerComp from '../../Common/DatePickerComp';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import {
  activityInfoAPI,
  activitySaveAPI,
  activityTypeAPI,
  setCycleDateAPI,
  farmerByNameAPI,
  plotAgainstFarmerAPI,
  produceAgainstPlotAPI,
  productionStageAPI,
} from '../../../config/apiHere';
import MessageDialog from '../../Common/MessageDialog';
import CustomHeader from '../CustomHeader';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import { useFocusEffect } from '@react-navigation/native';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
// import i18next from '../services/i18next';
import { useTranslation } from 'react-i18next';
import SoundRecord from '../../Common/SoundRecord';
import DeviceInfo from '../../DeviceInfo';
const audioRecorderPlayer = new AudioRecorderPlayer();
const qs = require('qs');
const FarmerActivityReport = ({ navigation }) => {
  const { t } = useTranslation();
  const { netConnection } = DeviceInfo();
  const [showingMenu, setShowingMenu] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [farmerData, setfarmerData] = useState([]);
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [farmerID, setfarmerID] = useState();
  const [plotAll, setplotAll] = useState([]);
  const [productionStageAll, setproductionStageAll] = useState([]);
  const [activityTypeAll, setactivityTypeAll] = useState([]);
  const [activityInfoAll, setActivityInfoAll] = useState([]);
  const [singlePlot, setsinglePlot] = useState({});
  const [CropType, setCropType] = useState();
  const [CropName, setCropName] = useState();
  const [dbLanTokUsr, setdbLanTokUsr] = useState({
    dbName: '',
    languageID: '',
    token: '',
    userID: '',
  });
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [newToDate, setnewToDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);

  const [cycleStartDate, srtCycleStartDate] = useState(false);

  const [activityPreDate, setActivityPreDate] = useState(false);
  const [cycleDtartDate, setCycleStartDate] = useState('');
  const [activityInfoReadio, setactivityInfoReadio] = useState({
    activityPreFormDate: 'regular',
  });

  const [isActiveMenu, setisActiveMenu] = useState(false);
  const [activityPreFormDate, setActivityPreFormDate] = useState('');

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

  const [saveData, setSaveData] = useState({
    act_title: '',
    type: 'user_activity',
    act_desc: '',
    material_used: '',
    water_used: '',
    power_used: '',
    photo: [],
    audio: [],
    act_pattern: 'regular',
    user_id: '',
    plot_id: '',
    crop_name: '',
    crop_variety: '',
    cycle_start_date: '',
    growth_stage: '',
    act_perform_date: '',
  });

  const [nameVarityStartEnd, setNameVarityStartEnd] = useState({
    name: '',
    varity: '',
    cycleStarts: '',
    cycleEnd: '',
  });
  const [myphoto, setmyPhoto] = useState(null);
  const [myphotoAll, setmyPhotoAll] = useState([]);

  const openImagePicker = item => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 200,
      maxWidth: 200,
    };

    const addPhoto = newPhoto => {
      setmyPhotoAll([...myphotoAll, newPhoto]);
    };

    launchCamera(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.error) {
        console.log('Camera Error: ', response.error);
      } else {
        const timestamp = Date.now();
        let imageUri = response.uri || response.assets?.[0]?.uri;
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

              positionOptions: {
                position: Position.bottomLeft,
              },
              style: {
                color: '#df2020',
                fontSize: 2,
                fontName: 'Arial',
                textBackgroundStyle: {
                  padding: '10% 10%',
                  color: '#00000000',
                },
              },
            },
          ],
          scale: 1,
          quality: 100,

          filename: `${response.assets[0].fileName}`,
          saveFormat: `${response.assets[0].type}`,
          maxSize: 1000,
        };
        let path = await Marker.markText(options);
        setSelectedImage({
          ...selectedImage,
          [item]: `file://${path}`,
        });
        const newPhoto = {
          uri: `file://${path}`,
          type: 'image/jpeg',
          name: `file://${path}`,
        };

        addPhoto(newPhoto);
      }
    });
  };

  const handleRecord = () => {
    console.warn('he');
  };

  const handleSearch = text => {
    setSearchFarmerName(text);
    setSearchFarmerPhone('');
    const result = farmerData.filter(item =>
      item.label.toLowerCase().includes(text.toLowerCase()),
    );

    if (result) {
      setSearchResultsList(true);
      setSearchResults(result);
    }
  };

  const handleDatePicker = item => {
    const dt = new Date(item);
    const x = dt.toISOString().split('T');
    const x1 = x[0].split('-');
    // console.log(x1[2] + '/' + x1[1] + '/' + x1[0]);
    const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
    setCycleStartDate(effective_date);
    // console.log(item);
  };

  const handleDatePicker2 = item => {
    const dt = new Date(item);
    const x = dt.toISOString().split('T');
    const x1 = x[0].split('-');
    // console.log(x1[2] + '/' + x1[1] + '/' + x1[0]);
    const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
    setActivityPreFormDate(effective_date);
    setSaveData({ ...saveData, act_perform_date: effective_date });
    // console.log(item);
  };

  const handleResultSelect = async (name, currentfarmerId, phone) => {
    setSearchResultsList(false);
    // console.warn(name, currentfarmerId, phone);
    setSearchFarmerPhone(phone);
    setSelectedName(name);
    setSearchFarmerName(name);
    setSearchResults([]);
    setfarmerID(currentfarmerId);
    const response = await plotAgainstFarmerAPI(
      dbLanTokUsr.dbName,
      dbLanTokUsr.languageID,
      dbLanTokUsr.token,
      currentfarmerId,
    );
    // console.warn(JSON.stringify(response, null, 2));
    if (response) {
      const dataArray = [];
      response.data.data.forEach(element => {
        dataArray.push({
          value: element.rel_id,
          label: element.plot_no,
        });
      });
      setplotAll(dataArray);
      const activityType_res = await activityTypeAPI(
        dbLanTokUsr.dbName,
        dbLanTokUsr.languageID,
        currentfarmerId,
      );
      if (activityType_res) {
        // console.warn("activity:",activityType_res.data.data);
        const dataArray = [];
        activityType_res.data.data.rows.forEach(element => {
          dataArray.push({
            value: element.categoryId,
            label: element.categoryName,
          });
        });
        setactivityTypeAll(dataArray);
      }
    }
  };
  const setCycleDate = async () => {
    setIsButtonDisabled(true);
    let save_data = qs.stringify({
      crop_cycl_start_date: cycleDtartDate,
    });
    const productionStage_res = await setCycleDateAPI(
      dbLanTokUsr.dbName,
      dbLanTokUsr.languageID,
      farmerID,
      dbLanTokUsr.token,
      saveData.cu_rel_id,
      save_data,
    );
  };
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
      var response = await produceAgainstPlotAPI(
        dbLanTokUsr.dbName,
        dbLanTokUsr.languageID,
        farmerID,
        relId.value,
      );
      await setItem('produceAgainstPlot' + relId.value, response);
    } else {
      var response = await getItem('produceAgainstPlot' + relId.value);
    }
    if (response) {
      const dateString = response.data.data.rows[0].harvesting_date;
      const harvesting_date = new Date(dateString);
      const currentDate = new Date();
      if (harvesting_date > currentDate) {
        const data = response.data.data.rows[0];
        setShowingMenu(true);
        data.crop_cycl_start_date == null ||
          data.crop_cycl_start_date == '2004-02-29'
          ? setIsButtonDisabled(false)
          : setIsButtonDisabled(true);
        // console.log(isButtonDisabled);
        let cycle_start_date =
          data.crop_cycl_start_date == null ||
            data.crop_cycl_start_date == '2004-02-29'
            ? data.sowing_date
            : data.crop_cycl_start_date;

        setCycleStartDate(cycle_start_date);
        setNameVarityStartEnd({
          ...nameVarityStartEnd,
          name: data.crop_name.name,
          varity: data.crop_variety.name,
          cycleStarts: data.sowing_date,
          cycleEnd: data.harvesting_date,
        });
        setSaveData({
          ...saveData,
          user_id: farmerID,
          plot_id: relId.value,
          plot_Name: relId.label,
          crop_name: data.crop_name.fid,
          crop_variety: data.crop_variety.fid,
          cycle_start_date: cycle_start_date,
          cu_rel_id: data.cu_rel_id,
          cycle_start_date: cycle_start_date,
        });
        setsinglePlot(response.data.data.rows);
        setCropType(response.data.data.rows[0].crop_type.fid);
        setCropName(response.data.data.rows[0].crop_name.fid);

        if (netConnection) {
          var productionStage_res = await productionStageAPI(
            dbLanTokUsr.dbName,
            dbLanTokUsr.languageID,
            response.data.data.rows[0].crop_type_id,
            response.data.data.rows[0].crop_name_id,
          );
          await setItem(
            'productionStageAPI' +
            response.data.data.rows[0].crop_type_id +
            response.data.data.rows[0].crop_name_id,
            productionStage_res,
          );
        } else {
          var productionStage_res = await getItem(
            'productionStageAPI' +
            response.data.data.rows[0].crop_type_id +
            response.data.data.rows[0].crop_name_id,
          );
        }
        if (productionStage_res) {
          // console.warn(JSON.stringify(productionStage_res.data.data.growth_stage,null,2));
          // console.warn(JSON.stringify(response.data.data, null, 2));
          const dataArray = [];
          productionStage_res.data.data.growth_stage.forEach(element => {
            dataArray.push({
              value: element.growth_stage.fid,
              label: element.growth_stage.name,
            });
          });
          setproductionStageAll(dataArray);
        }
      } else {
        setIsButtonDisabled(false);
        MessageDialog({
          title: 'Importent',
          message: 'Your previous crop has been harvested Please Add a Crop',
        });
        setSearchFarmerName('');
        setSearchFarmerPhone('');
        setplotAll([]);
        navigation.navigate('FarmerDashboard');
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
      // console.log('Recording . . . ', e.currentPosition);
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
      // console.log('Recording . . . ', e.currentPosition);
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
      // console.log('Recording . . . ', e.currentPosition);
      return;
    });
  };
  const onStopRecordFirstItem = useCallback(async () => {
    // if (record == "firstItem") {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setSoundRecordFirstItem({
        ...soundRecordFirstItem,
        isLoggingIn: false,
        result: result,
      });
      // console.log("Stopped recording:", result);
      // navigation.navigate(navPath, { result: result,name:name });
    } catch (error) {
      console.error('Error stopping the recording:', error);
    }
    // }
  }, []);
  const onStopRecordSecoundItem = useCallback(async () => {
    // if (record == "firstItem") {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setSoundRecordSecoundItem({ isLoggingIn: false, result: result });
      // console.log("Stopped recording:", result);
      // navigation.navigate(navPath, { result: result,name:name });
    } catch (error) {
      console.error('Error stopping the recording:', error);
    }
    // }
  }, []);
  const onStopRecordThirdItem = useCallback(async () => {
    // if (record == "firstItem") {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setSoundRecordThirdItem({ isLoggingIn: false, result: result });
      // console.log("Stopped recording:", result);
      // navigation.navigate(navPath, { result: result,name:name });
    } catch (error) {
      console.error('Error stopping the recording:', error);
    }
    // }
  }, []);

  const validateForm = () => {
    if (!saveData.plot_id) {
      Toast.show({
        time: 2,
        text: t('pl_en_plot_name_first'),
        ...AlertMesg[0],
      });
      return false;
    }
    if (!saveData.cycle_start_date) {
      Toast.show({
        time: 2,
        text: 'Please enter crop cycle date',
        ...AlertMesg[0],
      });
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
    if (isButtonDisabled == false) {
      Toast.show({
        time: 2,
        text: 'Please set cycle start date',
        ...AlertMesg[0],
      });
      return false;
    }
    if (saveData.act_pattern === 'schedule') {
      if (!saveData.act_ref_type) {
        Toast.show({
          time: 2,
          text: 'Please enter activity type',
          ...AlertMesg[0],
        });
        return false;
      }
      if (!saveData.act_ref) {
        Toast.show({
          time: 2,
          text: 'Please enter activity',
          ...AlertMesg[0],
        });
        return false;
      }
    }
    if (!saveData.act_perform_date) {
      Toast.show({
        time: 2,
        text: 'Please enter perform date',
        ...AlertMesg[0],
      });
      return false;
    }
    if (!saveData.latitude) {
      Toast.show({
        time: 2,
        text: 'Please allow to get location',
        ...AlertMesg[0],
      });
      return false;
    }
    if (!cycleDtartDate) {
      Toast.show({ text: 'Please set cycle start date', ...AlertMesg[0] });
      return false;
    }
    return true;
  };
  const handleSave = async () => {
    Keyboard.dismiss();
    if (validateForm()) {
      const formData = new FormData();

      formData.append('act_title', '');
      myphotoAll.forEach(photo => {
        formData.append('photo', photo);
      });
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
      formData.append('type', 'user_activity');
      formData.append('latitude', saveData.latitude);
      formData.append('longitude', saveData.longitude);
      formData.append('user_id', saveData.user_id);
      formData.append('plot_id', saveData.plot_id);
      formData.append('crop_name', saveData.crop_name);
      formData.append('crop_variety', saveData.crop_variety);
      formData.append('cycle_start_date', saveData.cycle_start_date);
      formData.append('growth_stage', saveData.growth_stage);
      formData.append('act_perform_date', saveData.act_perform_date);
      formData.append('act_pattern', saveData.act_pattern);

      if (saveData.act_pattern === 'schedule') {
        formData.append('act_ref_type', saveData.act_ref_type);
        formData.append('act_to_date', saveData.act_to_date);
        formData.append('act_start_date', saveData.act_start_date);
        formData.append('act_ref', saveData.act_ref);
      }
      formData.append('act_desc', saveData.act_desc);
      formData.append('material_used', saveData.material_used);
      formData.append('water_used', saveData.water_used);
      formData.append('power_used', saveData.power_used);
      if (netConnection) {
        const database_res = await activitySaveAPI(
          dbLanTokUsr.dbName,
          dbLanTokUsr.languageID,
          dbLanTokUsr.token,
          farmerID,
          formData,
        );
        if (database_res.status === 200) {
          MessageDialog({ title: 'Successful', message: 'Data submitted successfully' });
          handleClear();
          navigation.navigate('FarmerActivityList');
        }
      } else {
        let timeStamp = Date.now();
        await setItem('off' + timeStamp, formData);
        let offlineDataArr = await getItem('offlineFarmerActivityData');
        if (offlineDataArr) {
          // offlineDataArr.push('off'+timeStamp);
          await setItem(
            'offlineFarmerActivityData',
            offlineDataArr + ',' + 'off' + timeStamp,
          );
        } else {
          await setItem('offlineFarmerActivityData', 'off' + timeStamp);
        }
        MessageDialog({
          title: 'Successful',
          message: 'Data submitted successfully',
        });
        handleClear();
        navigation.navigate('FarmerActivityList');
      }
    }
  };

  const handleActivityPattern = item => {
    setactivityInfoReadio({ ...activityInfoReadio, activityPreFormDate: item });
    setSaveData({ ...saveData, act_pattern: item });
    if (item === 'schedule') {
      setisActiveMenu(true);
    } else {
      setisActiveMenu(false);
    }
  };
  const handleActivityType = async item => {
    if (netConnection) {
      var response = await activityInfoAPI(
        dbLanTokUsr.dbName,
        dbLanTokUsr.languageID,
        dbLanTokUsr.token,
        farmerID,
        CropType,
        CropName,
        item.value,
      );
      await setItem(
        'activityInfo' + CropType + CropName + item.value,
        response,
      );
    } else {
      var response = await getItem(
        'activityInfo' + CropType + CropName + item.value,
        response,
      );
    }
    setSaveData({ ...saveData, act_ref_type: item.value });
    if (response.data.data.count > 0) {
      const dataArray = [];
      response.data.data.rows.forEach(element => {
        const monthNames = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
        const sdate = new Date(cycleDtartDate);
        sdate.setDate(sdate.getDate() + element.days_from);
        const smonth = monthNames[sdate.getMonth()];
        const sday = sdate.getDate();
        const syear = sdate.getFullYear();
        const startDate = `${smonth} ${sday}, ${syear}`;
        const edate = new Date(cycleDtartDate);
        edate.setDate(edate.getDate() + element.days_to);
        const emonth = monthNames[edate.getMonth()];
        const eday = edate.getDate();
        const eyear = edate.getFullYear();
        const endDate = `${emonth} ${eday}, ${eyear}`;
        const startDateEndDate = `${startDate}-${endDate}`;
        dataArray.push({
          start_date: sdate,
          end_date: edate,
          value: element.act_rid,
          label: startDateEndDate,
        });
      });
      setActivityInfoAll(dataArray);
    }
  };
  const handleActivityInfo = async item => {
    // console.warn(item);
    const act_to_date1 = item.end_date;
    const date1 = new Date(act_to_date1);
    const year1 = date1.getFullYear();
    const month1 = (date1.getMonth() + 1).toString().padStart(2, '0');
    const day1 = date1.getDate().toString().padStart(2, '0');
    const act_to_date = `${year1}-${month1}-${day1}`;

    const act_start_date1 = item.start_date;
    ``;
    const date2 = new Date(act_start_date1);
    const year2 = date2.getFullYear();
    const month2 = (date2.getMonth() + 1).toString().padStart(2, '0');
    const day2 = date2.getDate().toString().padStart(2, '0');
    const act_start_date = `${year2}-${month2}-${day2}`;
    setSaveData({
      ...saveData,
      // act_to_date: item.end_date,
      act_to_date: act_to_date,
      // act_start_date: item.start_date,
      act_start_date: act_start_date,
      act_ref: item.value,
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
      type: '',
      audio: '',
      latitude: '',
      longitude: '',
      user_id: '',
      plot_id: '',
      crop_name: '',
      crop_variety: '',
      cycle_start_date: '',
      growth_stage: '',
      act_perform_date: '',
      act_ref_type: '',
      act_to_date: '',
      act_start_date: '',
      act_ref: '',
      act_desc: '',
      material_used: '',
      water_used: '',
      power_used: '',
      act_pattern: 'regular',
    });
    setShowingMenu(false);
    setCycleStartDate('');
    setActivityPreFormDate('');
    setSelectedImage({
      firstItem: '',
      secondItem: '',
      thirdItem: '',
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
    handleClear();
    requestLivePermission();
    const loginUser_data = await getItem('loginUser_data');
    if (loginUser_data) {
      const dbName = loginUser_data.dbname;
      const languageID = loginUser_data.lan_id;
      const token = loginUser_data.token;
      const userID = loginUser_data.user_id;
      const currentfarmerId = loginUser_data.user_id;
      setdbLanTokUsr({
        ...dbLanTokUsr,
        dbName: dbName,
        languageID: languageID,
        token: token,
        userID: userID,
      });

      setfarmerID(currentfarmerId);
      if (netConnection) {
        var response = await plotAgainstFarmerAPI(
          dbName,
          languageID,
          token,
          currentfarmerId,
        );
        await setItem('plotAgainstFarmer' + currentfarmerId, response);
      } else {
        var response = await getItem('plotAgainstFarmer' + currentfarmerId);
      }
      if (response) {
        const dataArray = [];
        response.data.data.forEach(element => {
          dataArray.push({
            value: element.rel_id,
            label: element.plot_no,
          });
        });
        setplotAll(dataArray);
        if (netConnection) {
          var activityType_res = await activityTypeAPI(
            dbName,
            languageID,
            currentfarmerId,
          );
          await setItem('activityType' + currentfarmerId, activityType_res);
        } else {
          var activityType_res = await getItem(
            'activityType' + currentfarmerId,
          );
        }
        if (activityType_res) {
          // console.warn("activity:",activityType_res.data.data);
          const dataArray = [];
          activityType_res.data.data.rows.forEach(element => {
            dataArray.push({
              value: element.categoryId,
              label: element.categoryName,
            });
          });
          setactivityTypeAll(dataArray);
        }
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      setSaveData({
        plot_id: '',
      });
      //   onPageLoad();
      const onBackPress = () => {
        navigation.navigate('FarmerActivityList');
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  useEffect(() => {
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
    onPageLoad();
  }, [netConnection]);
  const HandlerGoBack = () => {
    navigation.navigate('FarmerActivityList');
  };
  return (
    <>
      <View style={styles.container}>
        <CustomHeader path="FarmerActivityList" HandlerGoBack={HandlerGoBack} />
        <DatePickerComp
          openDate={cycleStartDate}
          newDate={newFromDate}
          setOpenDate={srtCycleStartDate}
          handleDatePicker={handleDatePicker}
        />
        <DatePickerComp
          openDate={activityPreDate}
          newDate={newFromDate}
          setOpenDate={setActivityPreDate}
          handleDatePicker={handleDatePicker2}
        />
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

        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              {
                paddingBottom: 8,
                paddingTop: 4,
                fontWeight: '700',
                fontSize: 18,
              },
            ]}>
            {t('report_activity')}
          </Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.fromContainer}>
            <DropdownForm
              label={t('plot')}
              data={plotAll}
              color="red"
              onChange={relId => handlePlot(relId)}
              val={saveData.plot_id}
            />

            {showingMenu ? (
              <View style={styles.plotSiteContainer}>
                <View style={styles.plotSiteContainerItem}>
                  <Text style={styles.plotSiteItemText}>{t('crop_name')}</Text>
                  <Text style={styles.plotSiteItemText}>
                    {t('crop_veriety')}
                  </Text>
                  <Text style={styles.plotSiteItemText}>
                    {t('showing_date')}
                  </Text>
                  <Text style={styles.plotSiteItemText}>
                    {t('harvesting_date_auto_calculated')}
                  </Text>
                </View>
                <View style={styles.plotSiteContainerItem}>
                  <Text style={styles.plotSiteItemText}>
                    {nameVarityStartEnd.name}
                  </Text>
                  <Text style={styles.plotSiteItemText}>
                    {nameVarityStartEnd.varity}
                  </Text>
                  <Text style={styles.plotSiteItemText}>
                    {formatDateToMMDDYYYY(nameVarityStartEnd.cycleStarts)}
                  </Text>
                  <Text style={styles.plotSiteItemText}>
                    {formatDateToMMDDYYYY(nameVarityStartEnd.cycleEnd)}
                  </Text>
                </View>
              </View>
            ) : (
              ''
            )}

            <DropdownForm
              label={t('growth_stage')}
              color="red"
              data={productionStageAll}
              onChange={production_stage =>
                setSaveData({ ...saveData, growth_stage: production_stage.value })
              }
            />

            <View>
              <Text style={styles.title}>
                {t('pick_crop_cycle_start_date')}
              </Text>
              <View style={styles.cycleContainer}>
                <TouchableOpacity
                  style={styles.cycleContainerDate}
                  disabled={isButtonDisabled}
                  onPress={() => srtCycleStartDate(true)}>
                  <View style={{ width: '80%' }}>
                    <Text style={styles.title}>
                      {cycleDtartDate == ''
                        ? saveData.cycle_start_date
                        : cycleDtartDate}
                    </Text>
                  </View>
                  <Image
                    source={require('../../Common/images/calendar.png')}
                    style={{ width: 20, height: 20 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.cycleContainerStartDate,
                    {
                      backgroundColor: isButtonDisabled ? '#EBEBE4' : 'green',
                    },
                  ]}
                  disabled={isButtonDisabled}
                  onPress={() => setCycleDate()}>
                  <Text
                    style={[
                      styles.title,
                      { color: isButtonDisabled ? '#000' : '#FFF' },
                    ]}>
                    {t('set_the_crop_cycle_start_date')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.activityPattern}>
              <Text>{t('activity_pattern')}</Text>
              <RadioForm
                label={t('schedule')}
                selected={activityInfoReadio.activityPreFormDate === 'schedule'}
                onSelect={() => handleActivityPattern('schedule')}
              />
              <RadioForm
                label={t('regular')}
                selected={activityInfoReadio.activityPreFormDate === 'regular'}
                onSelect={() => handleActivityPattern('regular')}
              />
            </View>
            {isActiveMenu ? (
              <>
                <DropdownForm
                  label={t('activity_type')}
                  color="red"
                  data={activityTypeAll}
                  onChange={item => handleActivityType(item)}
                  val={saveData.act_ref_type}
                />
                <DropdownForm
                  label={t('select_activity')}
                  color="red"
                  data={activityInfoAll}
                  onChange={item => handleActivityInfo(item)}
                  val={saveData.act_to_date}
                />
              </>
            ) : (
              ''
            )}

            <View>
              <Text style={{ color: 'red' }}>
                {t('pick_activity_perform_date')}
              </Text>
              <TouchableOpacity
                style={styles.activityPerFromDate}
                onPress={() => setActivityPreDate(true)}>
                <Text style={styles.title}>{activityPreFormDate}</Text>
                <Image
                  source={require('../../Common/images/calendar.png')}
                  style={{ width: 20, height: 20 }}
                />
              </TouchableOpacity>
            </View>

            <InputTextForm
              label={t('your_comm_')}
              value={saveData.act_desc}
              onChangeText={act_desc =>
                setSaveData({ ...saveData, act_desc: act_desc })
              }
            />

            <InputTextForm
              label={t('material_used')}
              value={saveData.material_used}
              onChangeText={material_used =>
                setSaveData({ ...saveData, material_used: material_used })
              }
            />

            <InputTextForm
              label={t('water_used')}
              value={saveData.water_used}
              onChangeText={water_used =>
                setSaveData({ ...saveData, water_used: water_used })
              }
            />

            <InputTextForm
              label={t('power_used')}
              value={saveData.power_used}
              onChangeText={power_used =>
                setSaveData({ ...saveData, power_used: power_used })
              }
            />

            <TakePhoto
              openImagePicker={openImagePicker}
              selectedImage={selectedImage}
              title={t('take_a_photo_optional')}
            />

            {/* <RecordComp selectedRecord={selectedRecord} onPress={handleRecord} /> */}
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
            />
          </View>
        </ScrollView>

        <View style={{ marginTop: 10 }}>
          <ButtonForm label={t('submit')} onPress={() => handleSave()} />
        </View>
        <Root></Root>
      </View>
    </>
  );
};

export default FarmerActivityReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    width: '95%',
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  title: {
    color: '#000',
  },
  fromContainer: {
    width: '90%',
    marginHorizontal: '5%',
    marginBottom: 50,
  },
  activityPattern: {
    marginVertical: 10,
  },
  cycleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 7,
  },
  cycleContainerStartDate: {
    backgroundColor: '#EBEBE4',
    padding: 10,
    borderRadius: 8,
    color: 'black',
  },
  cycleContainerStartDateDesible: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 8,
  },
  cycleContainerDate: {
    width: '55%',
    // flexDirection: 'row-reverse',
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  activityPerFromDate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderRadius: 8,
    height: 40,
    borderColor: 'gray',
    borderWidth: 0.5,
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 10,
  },
  flatlistcontainer: {
    marginVertical: 10,
    backgroundColor: '#FFF',
    position: 'relative',
    top: -23,
    padding: 1,
    elevation: 10,
    borderRadius: 10,
  },
  flatlistitem: {
    marginVertical: 10,
    marginHorizontal: 10,
  },

  flatContainer: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    bottom: '100%',
    left: 0,
    marginHorizontal: '5%',
    width: '90%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },
  flatlisttitle: {
    padding: 10,
    color: '#000',
  },
  flatlistHeight: {
    height: Dimensions.get('window').height / 2.5,
  },
  plotSiteContainer: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: '#000',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  plotSiteContainerItem: {
    width: '50%',
  },
  plotSiteItemText: {
    color: '#000',
    marginVertical: 5,
  },
});
