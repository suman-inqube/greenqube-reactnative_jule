import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Alert,
  Keyboard,
} from 'react-native';
import { PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import React, { useEffect, useState, useCallback, useContext } from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
// import TakePhoto from './TakePhoto';
import { launchCamera } from 'react-native-image-picker';
import Marker, { Position } from 'react-native-image-marker';
import RecordComp from '../Activity/RecordComp';
import { CrashlyticsRecordError } from '../../Crashlytics/CrashlyticsRecordError';
import MyErrorBoundary from '../../Common/MyErrorBoundary';
import { Colors, Fronts } from '../../utils/Constants';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  activityInfoAPI,
  activitySaveAPI,
  activityTypeAPI,
  setCycleDateAPI,
  plotAgainstFarmerAPI,
  produceAgainstPlotAPI,
  productionStageAPI,
  addModuleForView,
  addUserPipeActivity,
  activityTypeAPIAWD,
  PipeListDetails,
  getUniquePipeNames,
  addPrevPipeActivity,
  inputOutputRoutePipeImagesLatLong,
  activityScheduleAPI,
} from '../../../config/apiHere';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import { useFocusEffect } from '@react-navigation/native';
import SoundRecord from '../../Common/SoundRecord';
import AudioPlayerView from '../../Common/AudioPlayerView';
import CustomAlert from '../../Common/CustomAlert';
const audioRecorderPlayer = new AudioRecorderPlayer();
const qs = require('qs');
import { userCreateContext } from '../../Context/usersCreateContext';
import { plotHook } from '../../hooks/plotHook';
import HarvestedModel from '../../Common/HarvestedModel';
import TakePhotoPipe from '../../Common/TakePhotoPipe';
import ActivityMap from '../../Common/ActivityMap';
import getCurrentLocation from '../../Common/getCurrentLocation';
import { isWithin20Meters } from '../../Common/calculateAreaFun';
import { isPointInPolygon, getDistance } from 'geolib';
import { APP_MAP_RANGE_POLYGON } from '@env';
const FarmerActivityReportAWD = ({ navigation }) => {
  const {
    InputTextForm,
    DropdownForm,
    RadioForm,
    ButtonForm,
    Root,
    Toast,
    SPSheet,
    AlertMesg,
    loginUser_data,
    effective_dates,
    CustomHeader,
    t,
    DatePickerComp,
    onBackPress,
    getItem,
    setItem,
    logoImage,
    topBanner,
    DeviceInfo,
    isOnline,
    LoadingScreen, coords
  } = useContext(userCreateContext);
  var watchId, watchIdSaveData;
  const { dbname, lan_id, token, user_id } = loginUser_data;
  const { problemPlotAgainstFarmer, plotAll, setplotAll } = plotHook(
    dbname,
    lan_id,
    token,
    user_id,
    isOnline,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const { netConnection } = DeviceInfo();
  const [showingMenu, setShowingMenu] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  const [farmerID, setfarmerID] = useState();
  const [productionStageAll, setproductionStageAll] = useState([]);
  const [activityTypeAll, setactivityTypeAll] = useState([]);
  const [activityInfoAll, setActivityInfoAll] = useState([]);
  const [singlePlot, setsinglePlot] = useState({});
  const [CropType, setCropType] = useState();
  const [CropName, setCropName] = useState();
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [cycleStartDate, srtCycleStartDate] = useState(false);
  const [activityPreDate, setActivityPreDate] = useState(false);
  const [cycleDtartDate, setCycleStartDate] = useState('');
  const [activityInfoReadio, setactivityInfoReadio] = useState({
    activityPreFormDate: 'regular',
  });

  const [isActiveMenu, setisActiveMenu] = useState(false);
  const [isGeoFence, setIsGeoFence] = useState(false);
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
    base64: '',
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

  const [pipeLatLong, setPipeLatLong] = useState([]);
  const [overdueAct, setOverdueAct] = useState([]);
  const [lastAct, setLastAct] = useState();
  const [upcomingAct, setUpcomingAct] = useState('');
  const [scheduleInfo, setScheduleInfo] = useState({
    lastAct: '',
    upcomingAct: '',
  });
  const [outofRange, setOutofRange] = useState(false);
  const [outofRangeCheck, setOutofRangeCheck] = useState(false);
  const [saveData, setSaveData] = useState({
    act_title: '',
    type: 'user_activity',
    act_desc: '',
    material_used: '',
    water_used: '',
    power_used: '',
    photo: [],
    audio: [],
    act_pattern: 'schedule',
    user_id: '',
    plot_id: '',
    crop_name: '',
    crop_variety: '',
    cycle_start_date: '',
    growth_stage: '',
    act_perform_date: '',
    field_type: '',
  });

  const [nameVarityStartEnd, setNameVarityStartEnd] = useState({
    name: '',
    varity: '',
    cycleStarts: '',
    cycleEnd: '',
  });
  const [myphoto, setmyPhoto] = useState(null);
  const [myphotoAll, setmyPhotoAll] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectPipeList, setselectPipeList] = useState({
    label: '',
    value: '',
  });
  const [PipeListDetailsArr, setPipeListDetailsResArr] = useState([]);
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
              text: `${coords.latitude},${coords.longitude
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
  const handleDatePicker = item => {
    const effective_date = effective_dates(item);
    setCycleStartDate(effective_date);
  };

  const handleDatePicker2 = item => {
    const effective_date = effective_dates(item);
    setActivityPreFormDate(effective_date);
    setSaveData({ ...saveData, act_perform_date: effective_date });
  };
  const setCycleDate = async () => {
    setIsLoading(true);
    setIsButtonDisabled(true);
    let save_data = qs.stringify({
      crop_cycl_start_date:
        cycleDtartDate == '' ? saveData.cycle_start_date : cycleDtartDate,
    });

    var [setCycleDate, activitySchedule] = await Promise.all([
      setCycleDateAPI(
        dbname,
        lan_id,
        farmerID,
        token,
        saveData.cu_rel_id,
        save_data,
      ),
      activityScheduleAPI(
        dbname,
        lan_id,
        token,
        'carbon_activity',
        saveData.plot_id,
        saveData.crop_name,
        saveData.cu_rel_id,
      ),
    ]);

    // if (productionStage_res.status == 200) {
    //   console.log('status');

    // var activitySchedule = activityScheduleAPI(
    //     dbname,
    //     lan_id,
    //     token,
    //     'carbon_activity',
    //     saveData.plot_id,
    //     saveData.crop_name,
    //     saveData.cu_rel_id,
    //   );
    // console.log('activitySchedule status11');

    // console.log(activitySchedule.status);

    if (activitySchedule.status == 200) {
      // console.log('activitySchedule status11');

      setIsLoading(false);

      if (activitySchedule?.data?.data?.otherActivities.length > 0) {
        activitySchedule?.data?.data?.otherActivities.forEach(function (
          element,
        ) {
          var overdueData;
          if (element?.days_until_start < 0) {
            overdueData =
              element?.activityName.categoryName +
              ' (' +
              formatDate(element?.activity_start_date) +
              ' - ' +
              formatDate(element?.activity_end_date) +
              ')';
            //  console.log("00",overdueData);
            setOverdueAct(prevItems => [...prevItems, overdueData]);
          }
          // setOverdueAct(prevItems => [...prevItems, overdueData]);
        });
        const upcomingActivity =
          activitySchedule?.data?.data?.otherActivities?.find(
            item => item.days_until_start >= 0,
          );
        // console.log(upcomingActivity.days_from);
        if (upcomingActivity != undefined) {
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
          const cycleDate =
            cycleDtartDate == '' ? saveData.cycle_start_date : cycleDtartDate;
          // const cycleDate =
          //   data.crop_cycl_start_date == null ||
          //   data.crop_cycl_start_date == '2004-02-29'
          //     ? data.sowing_date
          //     : data.crop_cycl_start_date;

          const sdate = new Date(cycleDate);
          sdate.setDate(sdate.getDate() + upcomingActivity.days_from);
          const smonth = monthNames[sdate.getMonth()];
          const sday = sdate.getDate();
          const syear = sdate.getFullYear();
          const startDate = `${smonth} ${sday}, ${syear}`;
          const edate = new Date(cycleDate);
          edate.setDate(edate.getDate() + upcomingActivity.days_to);
          const emonth = monthNames[edate.getMonth()];
          const eday = edate.getDate();
          const eyear = edate.getFullYear();
          const endDate = `${emonth} ${eday}, ${eyear}`;
          const startDateEndDate = `${startDate}-${endDate}`;

          setUpcomingAct(
            upcomingActivity?.activityName?.categoryName +
            ' (' +
            startDateEndDate +
            ')',
          );
        }
      }
      if (activitySchedule?.data?.data?.lastActivity !== 'No Last Activity') {
        var lastData =
          activitySchedule?.data?.data?.lastActivity?.activityName
            ?.categoryName +
          ' (' +
          formatDate(
            activitySchedule?.data?.data?.lastActivity?.act_start_date,
          ) +
          ' - ' +
          formatDate(activitySchedule?.data?.data?.lastActivity?.act_to_date) +
          ')';

        setLastAct(lastData);
      }
    }
    // }
  };

  const handlePlot = useCallback(async relId => {
    setIsLoading(true);
    setShowingMenu(false);
    setNameVarityStartEnd(prev => ({
      ...prev,
      name: '',
      varity: '',
      cycleStarts: '',
      cycleEnd: '',
      production_process: '',
    }));
    if (isOnline) {
      var response = await produceAgainstPlotAPI(
        dbname,
        lan_id,
        farmerID,
        relId.value,
      );
      // await setItem('produceAgainstPlot' + relId.value, response);
    }
    // else {
    //   var response = await getItem('produceAgainstPlot' + relId.value);
    // }
    if (response) {
      // const { latitude, longitude } = await getCurrentLocation() || {};
      const latandlongArr =
        response?.data?.data?.land_info?.agri_land_user_latlongs?.map(
          (_data, _index) => ({
            // longitude: _data.longitude, latitude: _data.latitude
            longitude: parseFloat(_data.longitude),
            latitude: parseFloat(_data.latitude),
          }),
        );
      // console.log("latlong",
      //   JSON.stringify(
      //     response?.data?.data?.land_info?.agri_land_user_latlongs,
      //   ),
      // );
      if (response?.data?.data?.land_info?.agri_land_user_latlongs.length > 2) {
        setIsGeoFence(true);
      } else {
        setIsGeoFence(false);
        Alert.alert(
          'Plot is not geofenced to register carbon activities',
          '',
          [
            {
              text: 'OK',
            },
          ],
          { cancelable: false },
        );
      }
      const { latitude, longitude } = coords;
      if (latandlongArr.length != 0) {
        setPlotPolygon(latandlongArr);
        const inside = isPointInPolygon({ latitude, longitude }, latandlongArr);
        if (inside) {
          setOutofRange(true);
          setOutofRangeCheck(true);
        } else {
          setOutofRange(false);
          setOutofRangeCheck(false);
        }
      }
      const dateString = response?.data?.data?.harvesting_date;
      const harvesting_date = new Date(dateString);
      const currentDate = new Date();
      if (harvesting_date > currentDate) {
        const data = response?.data?.data;
        setShowingMenu(true);
        data.crop_cycl_start_date == null ||
          data.crop_cycl_start_date == '2004-02-29'
          ? setIsButtonDisabled(false)
          : setIsButtonDisabled(true);
        let cycle_start_date =
          data.crop_cycl_start_date == null ||
            data.crop_cycl_start_date == '2004-02-29'
            ? data.sowing_date
            : data.crop_cycl_start_date;
        setCycleStartDate(cycle_start_date);
        setNameVarityStartEnd(prev => ({
          ...prev,
          name: data.crop_name.name,
          varity: data.crop_variety.name,
          cycleStarts: data.sowing_date,
          cycleEnd: data.harvesting_date,
        }));
        setSaveData(prev => ({
          ...prev,
          user_id: farmerID,
          plot_id: relId.value,
          plot_Name: relId.label,
          crop_name: data.crop_name.fid,
          crop_variety: data.crop_variety.fid,
          cycle_start_date: cycle_start_date,
          cu_rel_id: data.cu_rel_id,
          cycle_start_date: cycle_start_date,
          crop_season: data?.crop_season?.fid,
          field_type: '',
        }));
        setsinglePlot(response?.data?.data);
        setCropType(response?.data?.data?.crop_type.fid);
        setCropName(response?.data?.data?.crop_name.fid);
        if (isOnline) {
          var [productionStage_res, activitySchedule, pipeLatLongRes] =
            await Promise.all([
              productionStageAPI(
                dbname,
                lan_id,
                data.crop_type_id,
                data.crop_name_id,
              ),
              activityScheduleAPI(
                dbname,
                lan_id,
                token,
                'carbon_activity',
                relId.value,
                data.crop_name_id,
                data.cu_rel_id,
              ),
              inputOutputRoutePipeImagesLatLong(
                dbname,
                lan_id,
                farmerID,
                relId.value,
                data.crop_name.fid,
                data.cu_rel_id,
              ),
              // setItem(
              //   'productionStageAPI' + data.crop_type_id + data.crop_type_id,
              //   productionStage_res,
              // ),
              setLastAct(''),
              setOverdueAct([]),
              setUpcomingAct(''),
            ]);
        } else {
          var productionStage_res = await getItem(
            'productionStageAPI' + data.crop_type_id + data.crop_type_id,
          );
        }
        if (productionStage_res) {
          const dataArray = productionStage_res?.data?.data?.growth_stage.map(
            data => ({
              value: data.growth_stage.fid,
              label: data.growth_stage.name,
            }),
          );
          setproductionStageAll(dataArray);
        }
        if (activitySchedule.status == 200) {
          // console.log("lact1561",activitySchedule?.data?.data);
          if (
            activitySchedule?.data?.data?.lastActivity !== 'No Last Activity'
          ) {
            // console.log("lact11")
            var lastData =
              activitySchedule?.data?.data?.lastActivity?.activityName
                ?.categoryName +
              ' (' +
              formatDate(
                activitySchedule?.data?.data?.lastActivity?.act_start_date,
              ) +
              ' - ' +
              formatDate(
                activitySchedule?.data?.data?.lastActivity?.act_to_date,
              ) +
              ')';
            setLastAct(lastData);
          }
          if (activitySchedule?.data?.data?.otherActivities.length > 0) {
            activitySchedule?.data?.data?.otherActivities.forEach(function (
              element,
            ) {
              var overdueData;
              if (element?.days_until_start < 0) {
                overdueData =
                  element?.activityName.categoryName +
                  ' (' +
                  formatDate(element?.activity_start_date) +
                  ' - ' +
                  formatDate(element?.activity_end_date) +
                  ')';
                setOverdueAct(prevItems => [...prevItems, overdueData]);
              }
            });
            const upcomingActivity =
              activitySchedule?.data?.data?.otherActivities?.find(
                item => item.days_until_start >= 0,
              );
            if (upcomingActivity != undefined) {
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
              const cycleDate =
                data.crop_cycl_start_date == null ||
                  data.crop_cycl_start_date == '2004-02-29'
                  ? data.sowing_date
                  : data.crop_cycl_start_date;
              const sdate = new Date(cycleDate);
              sdate.setDate(sdate.getDate() + upcomingActivity.days_from);
              const smonth = monthNames[sdate.getMonth()];
              const sday = sdate.getDate();
              const syear = sdate.getFullYear();
              const startDate = `${smonth} ${sday}, ${syear}`;
              const edate = new Date(cycleDate);
              edate.setDate(edate.getDate() + upcomingActivity.days_to);
              const emonth = monthNames[edate.getMonth()];
              const eday = edate.getDate();
              const eyear = edate.getFullYear();
              const endDate = `${emonth} ${eday}, ${eyear}`;
              const startDateEndDate = `${startDate}-${endDate}`;
              setUpcomingAct(
                upcomingActivity?.activityName?.categoryName +
                ' (' +
                startDateEndDate +
                ')',
              );
            }
          }
        }
        if (pipeLatLongRes?.status == 200) {
          setIsLoading(false);
          const pipeLatLongArr = pipeLatLongRes?.data?.data?.pipeData?.rows.map(
            _data => {
              return {
                latitude: parseFloat(_data.pipeLatLong[0].latitude),
                longitude: parseFloat(_data.pipeLatLong[0].longitude),
                name:
                  _data.pipe_name +
                  '  (' +
                  _data?.pipeActName?.categoryName +
                  ')',
              };
            },
          );
          setPipeLatLong(pipeLatLongArr);
        } else {
          setPipeLatLong([]);
        }
        setIsLoading(false);
      } else {
        setIsButtonDisabled(false);
        setSearchFarmerName('');
        setSearchFarmerPhone('');
        setplotAll([]);
        setModalVisible(true);
      }
    }
  }, []);

  const formatDate = dateString => {
    const date = new Date(dateString);
    const day = date.getDate();
    const year = date.getFullYear();
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
    const month = monthNames[date.getMonth()];
    return `${day} ${month}, ${year}`;
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
        text: t('please_select_sowing_date_first'),
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
        text: t('please_select_sowing_date_first'),
        ...AlertMesg[0],
      });
      return false;
    }
    if (saveData.act_pattern === 'schedule') {
      if (!saveData.act_ref_type) {
        Toast.show({
          time: 2,
          text: t('Please_enter_activity_type'),
          ...AlertMesg[0],
        });
        return false;
      }
      if (!saveData.act_ref) {
        Toast.show({
          time: 2,
          text: t('Please_enter_activity'),
          ...AlertMesg[0],
        });
        return false;
      }
    }

    if (saveData.field_type == 'add') {
      if (pipeDetails.length == 0) {
        Toast.show({
          time: 2,
          text: t('Please add pipe properly'),
          ...AlertMesg[0],
        });
        return false;
      }
    }
    if (saveData.field_type == 'select') {
      if (selectPipeList.value == '') {
        Toast.show({
          time: 2,
          text: t('Please select pipe'),
          ...AlertMesg[0],
        });
        return false;
      }
      if (
        selectedImagePipe?.firstItem == '' ||
        selectedImagePipe?.secondItem == ''
      ) {
        Toast.show({
          time: 2,
          text: t('Please enter pipe image'),
          ...AlertMesg[0],
        });
        return false;
      }
    }
    if (!saveData.act_perform_date) {
      Toast.show({
        time: 2,
        text: t('Please_enter_perform_date'),
        ...AlertMesg[0],
      });
      return false;
    }
    if (!saveData.latitude) {
      Toast.show({
        time: 2,
        text: t('gpsalertdialogmessage'),
        ...AlertMesg[0],
      });
      return false;
    }
    if (!cycleDtartDate && !isButtonDisabled) {
      Toast.show({ text: t('please_select_sowing_date_first'), ...AlertMesg[0] });
      return false;
    }

    if (!isGeoFence) {
      Toast.show({ text: 'Plot is not geofenced ', ...AlertMesg[0] });

      return;
    }
    if (!outofRangeCheck) {
      Toast.show({ text: 'You are out of range', ...AlertMesg[0] });

      return;
    }
    return true;
  };
  const handleSave = async () => {
    Keyboard.dismiss();
    if (validateForm()) {
      const formData = new FormData();
      formData.append('act_title', '');
      formData.append('type', 'carbon_activity');
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
      formData.append('user_id', saveData.user_id);
      formData.append('plot_id', saveData.plot_id);
      formData.append('crop_name', saveData.crop_name);
      formData.append('crop_season', saveData.crop_season);
      formData.append('act_master_id', saveData.act_master_id);
      formData.append('cu_rel_fid', saveData.cu_rel_id);
      formData.append('crop_variety', saveData.crop_variety);
      formData.append('cycle_start_date', saveData.cycle_start_date);
      formData.append('growth_stage', saveData.growth_stage);
      formData.append('act_perform_date', saveData.act_perform_date);
      formData.append('act_pattern', 'schedule');
      if (saveData.act_pattern === 'schedule') {
        formData.append('act_ref_type', saveData.act_ref_type);
        formData.append('act_to_date', saveData.act_to_date);
        formData.append('act_start_date', saveData.act_start_date);
        formData.append('act_ref', saveData.act_ref);
        if (saveData.field_type == 'add') {
          const pipe_data = pipeDetails.map(_data => {
            const { selectedImagePipe, pipe_name } = _data;
            const { firstItemLat, firstItemLong, secondItemLat, secondItemLong } =
              selectedImagePipe || {};

            const pipe_lattlong = [];

            if (firstItemLat != '') {
              pipe_lattlong.push({
                latitude: firstItemLat.toString(),
                longitude: firstItemLong?.toString() || '',
              });
            }

            if (secondItemLat != '') {
              pipe_lattlong.push({
                latitude: secondItemLat.toString(),
                longitude: secondItemLong?.toString() || '',
              });
            }
            return {
              pipe_name,
              pipe_lattlong,
            };
          });
          formData.append('pipe_data', JSON.stringify(pipe_data));
        } else {
          const latlong = [];
          if (selectedImagePipe?.firstItem != '') {
            latlong.push({
              latitude: selectedImagePipe.firstItemLat,
              longitude: selectedImagePipe.firstItemLong,
            });
          }
          if (selectedImagePipe?.secondItem != '') {
            latlong.push({
              latitude: selectedImagePipe.secondItemLat,
              longitude: selectedImagePipe.secondItemLong,
            });
          }
          const pipe_data = [
            {
              pipe_id: selectPipeList.value,
              latlong,
            },
          ];
          if (latlong.length != 0) {
            formData.append('existing_pipe_ids', JSON.stringify(pipe_data));
          }
        }
        if (saveData.field_type == 'add') {
          pipeDetails.map((_data, _index) => {
            const { selectedImagePipe } = _data;
            const { firstItem, secondItem } = selectedImagePipe || {};
            const firstItemfileName = firstItem.split('/').pop();
            const secondItemfileName = secondItem.split('/').pop();
            if (firstItemfileName != '') {
              formData.append(`pipe_image_${_index + 1}`, {
                uri: firstItem,
                type: 'image/jpeg',
                name: firstItemfileName,
              });
            }
            if (secondItemfileName != '') {
              formData.append(`pipe_image_${_index + 1}`, {
                uri: secondItem,
                type: 'image/jpeg',
                name: secondItemfileName,
              });
            }
          });
        } else {
          const pipe_image = [];
          if (selectedImagePipe?.firstItem != '') {
            pipe_image.push({
              uri: selectedImagePipe?.firstItem,
              type: 'image/jpeg',
              name: selectedImagePipe?.firstItem.split('/').pop(),
            });
          }
          if (selectedImagePipe?.secondItem != '') {
            pipe_image.push({
              uri: selectedImagePipe.secondItem,
              type: 'image/jpeg',
              name: selectedImagePipe.secondItem.split('/').pop(),
            });
          }
          pipe_image.map((_data, _index) => {
            formData.append(`pipe_files[0]`, _data);
          });
        }
      }
      formData.append('act_desc', saveData.act_desc);
      formData.append('material_used', saveData.material_used);
      formData.append('water_used', saveData.water_used);
      formData.append('power_used', saveData.power_used);

      if (isOnline) {
        if (saveData.field_type == 'add') {
          var database_res = await addUserPipeActivity(
            dbname,
            lan_id,
            token,
            farmerID,
            formData,
            pipeDetails.length,
          );
        } else {
          var database_res = await addPrevPipeActivity(
            dbname,
            lan_id,
            token,
            farmerID,
            formData,
            1,
          );
        }
        if (database_res?.status == 200) {
          Toast.show({ text: t('Data_submitted_successfully'), ...AlertMesg[0] });
          setTimeout(() => {
            navigation.navigate('FarmerActivityList');
          }, 1500);
        } else if (database_res?.status == 409) {
          Toast.show({
            text: database_res?.data?.error?.errorMessage,
            ...AlertMesg[0],
          });
        }
      } else {
        let timeStamp = Date.now();
        await setItem('off' + timeStamp, formData);
        let offlineDataArr = await getItem('offlineSupervisorActivityData');
        if (offlineDataArr) {
          await setItem(
            'offlineSupervisorActivityData',
            offlineDataArr + ',' + 'off' + timeStamp,
          );
        } else {
          await setItem('offlineSupervisorActivityData', 'off' + timeStamp);
        }
        Toast.show({ text: t('Data_submitted_successfully'), ...AlertMesg[0] });
        setTimeout(() => {
          navigation.navigate('FarmerActivityList');
        }, 1000);
      }
    }
  };
  const handleActivityType = useCallback(async item => {
    try {
      let dataArray = [];
      if (isOnline) {
        var response = await activityInfoAPI(
          dbname,
          lan_id,
          token,
          farmerID,
          CropType,
          CropName,
          item.value,
        );
        await setItem(
          'activityInfo' + farmerID + CropType + CropName + item.value,
          response,
        );
      } else {
        var response = await getItem(
          'activityInfo' + farmerID + CropType + CropName + item.value,
        );
      }
      setSaveData(prev => ({
        ...prev,
        act_to_date: '',
        act_to_date_label: '',
        act_start_date: '',
        act_ref: '',
        act_master_id: '',
        act_ref_type: item.value,
        field_type: '',
      }));
      setSelectedImagePipe(prev => ({
        ...prev,
        firstItem: '',
        firstItemLat: '',
        firstItemLong: '',
        secondItem: '',
        secondItemLat: '',
        secondItemLong: '',
      }));
      setselectPipeList(prev => ({
        ...prev,
        label: '',
        value: '',
      }));
      if (response.data.data.count > 0) {
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
          const cycleDate =
            cycleDtartDate == '' ? saveData.cycle_start_date : cycleDtartDate;
          const sdate = new Date(cycleDate);
          sdate.setDate(sdate.getDate() + element?.days_from);
          const smonth = monthNames[sdate.getMonth()];
          const sday = sdate.getDate();
          const syear = sdate.getFullYear();
          const startDate = `${smonth} ${sday}, ${syear}`;
          const edate = new Date(cycleDate);
          edate.setDate(edate.getDate() + element?.days_to);
          const emonth = monthNames[edate.getMonth()];
          const eday = edate.getDate();
          const eyear = edate.getFullYear();
          const endDate = `${emonth} ${eday}, ${eyear}`;
          const startDateEndDate = `${startDate}-${endDate}`;
          dataArray.push({
            start_date: sdate,
            end_date: edate,
            value: element.act_rid,
            label:
              element?.activity?.categoryName + ' (' + startDateEndDate + ')',
            act_master_id: element?.act_master_id,
            field_type: element?.activity?.field_type,
          });
        });
        if (isButtonDisabled) {
          setActivityInfoAll(dataArray);
        }
        setPipeListDetailsResArr([]);
      } else {
        setActivityInfoAll([]);
      }
    } catch (error) {
      CrashlyticsRecordError(error, 'ActivityReportAWD', 'handleActivityType');
    }
  }, [CropType, CropName]);

  const handleActivityInfo = useCallback(async item => {
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
    setSaveData(prev => ({
      ...prev,
      // act_to_date: item.end_date,
      act_to_date: act_to_date,
      // act_start_date: item.start_date,
      act_start_date: act_start_date,
      act_ref: item.value,
      act_master_id: item?.act_master_id,
      field_type: item?.field_type || '',
    }));
    setselectPipeList({
      ...selectPipeList,
      label: '',
      value: '',
    });
    const PipeListDetailsRes = await getUniquePipeNames(
      dbname,
      lan_id,
      token,
      farmerID,
      saveData.plot_id,
      item?.act_master_id,
      saveData.cu_rel_id,
    );
    if (PipeListDetailsRes?.status == 200) {
      const pipeDetailsArr = PipeListDetailsRes?.data?.data?.map(
        (_data, _index) => ({
          value: _data.pipe_pid,
          label: _data.pipe_name,
          // pipeFiles: _data?.pipeFiles,
          // pipeLatLong: _data?.pipeLatLong
        }),
      );
      setPipeListDetailsResArr(pipeDetailsArr);
      if (PipeListDetailsRes?.data?.data?.length == 0) {
        Keyboard.dismiss();
        Toast.show({
          time: 2,
          text: `${t('No pipe found in ' + item.label)}`,
          ...AlertMesg[0],
        });
      }
    } else {
      setPipeListDetailsResArr([]);
    }
  }, []);
  const requestLivePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(data =>
          setSaveData(prev => ({
            ...prev,
            latitude: data.coords.latitude,
            longitude: data.coords.longitude,
          })),
        );
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  const onPageLoad = async () => {
    // requestLivePermission();
 setSaveData(prev => ({
        ...prev, act_pattern: 'schedule', latitude: coords.latitude,
        longitude: coords.longitude,
      }));
    setisActiveMenu(true);
    setfarmerID(user_id);
    problemPlotAgainstFarmer();
    if (netConnection) {
      var activityType_res = await activityTypeAPIAWD(dbname, lan_id, user_id);
      await setItem('activityType' + user_id, activityType_res);
    } else {
      var activityType_res = await getItem('activityType' + user_id);
    }
    if (activityType_res) {
      setIsLoading(false);
      const dataArray = [];
      activityType_res.data.data.rows.forEach(element => {
        dataArray.push({
          value: element.fid,
          label: element.categoryName,
          field_type: element.field_type,
        });
      });
      setactivityTypeAll(dataArray);
    }
    const { latitude, longitude } = coords;
    setLocation({ latitude, longitude });

  };
  useEffect(() => {
    onPageLoad();
  }, [isOnline]);
  const handleHarvested = async data => {
    if (data == 'Yes') {
      navigation.navigate('FarmerLiveHood');
    } else {
      navigation.navigate('FarmerDashboard');
    }
  };
  const [pipeType, setPipeType] = useState('addPipe');
  const [pipeNumber, setPipeNumber] = useState('');
  const [pipeDetails, setPipeDetails] = useState([]);
  const [selectedImagePipe, setSelectedImagePipe] = useState({
    firstItem: '',
    firstItemLat: '',
    firstItemLong: '',
    secondItem: '',
    secondItemLat: '',
    secondItemLong: '',
  });
  const handleActivityPipeNumber = useCallback(text => {
    setPipeNumber(text);
  }, []);
  const addMorePipe = () => {
    if (pipeNumber == '') {
      Toast.show({
        time: 2,
        text: `${t('Please enter pipe name')}`,
        ...AlertMesg[0],
      });
    } else if (
      selectedImagePipe.firstItem == '' ||
      selectedImagePipe.secondItem == ''
    ) {
      Toast.show({
        time: 2,
        text: `${t('Please enter pipe image')}`,
        ...AlertMesg[0],
      });
    } else {
      setPipeDetails([
        ...pipeDetails,
        { pipe_name: pipeNumber, selectedImagePipe },
      ]);
      setSelectedImagePipe({
        firstItem: '',
        firstItemLat: '',
        firstItemLong: '',
        secondItem: '',
        secondItemLat: '',
        secondItemLong: '',
      });
      setPipeNumber('');
    }
  };
  const handleRemovedpipeDetails = _inde => {
    try {
      const values = [...pipeDetails];
      values.splice(_inde, 1);
      setPipeDetails(values);
    } catch (error) {
      console.error(error);
    }
  };

  const [modalVisibleMap, setModalVisibleMap] = useState(false);
  const [plotPolygon, setPlotPolygon] = useState([]);
  const [cameraItem, setCameraItem] = useState('');

  const openImagePickerPipe = async item => {
    setCameraItem(item);
    setModalVisibleMap(true);
  };
  const TakePhoto = useCallback(() => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 600,
      maxWidth: 600,
    };

    launchCamera(options, async response => {
      try {
        if (!response) {
          // Response is null, handle it safely
          CustomAlert('Camera Error:', 'Respose is blank.', true, 'OK');
          return;
        }
        if (response.didCancel) {
          console.log('User cancelled camera');
          return;
        }

        if (response.errorCode) {
          console.log('Camera Error:', response.errorMessage);
          return;
        }

        const asset = response.assets?.[0];
        if (asset?.uri === null) {
          CustomAlert('Error', 'Asset is blank', true, 'OK');
          return;
        }
        if (!asset?.uri) {
          console.warn('No image captured');
          return;
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

        const watermarkText = `${coords.latitude},${coords.longitude},${formattedTime}`;

        const markerOptions = {
          backgroundImage: { src: asset.uri, scale: 1 },
          watermarkTexts: [
            {
              text: watermarkText,
              positionOptions: { position: Position.bottomLeft },
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
          filename: asset.fileName,
          saveFormat: asset.type,
          maxSize: 1000,
        };

        const path = await Marker.markText(markerOptions);

        setSelectedImagePipe(prev => ({
          ...prev,
          [cameraItem]: `file://${path}`,
          [`${cameraItem}Lat`]: coords.latitude,
          [`${cameraItem}Long`]: coords.longitude,
        }));
        setModalVisibleMap(false);
        // if (watchIdRef.current) {
        //   Geolocation.clearWatch(watchIdRef.current);
        //   watchIdRef.current = null;
        // }
      } catch (error) {
        console.error('TakePhoto Error:', error);
      } finally {
        setModalVisibleMap(false);
      }
    });
  }, [location, cameraItem, setSelectedImagePipe, setModalVisibleMap]);
  const handleActivityPipe = useCallback(_item => {
    const { pipeFiles, pipeLatLong, label, value } = _item || {};
    setselectPipeList(prev => ({ ...prev, label, value }));
  }, []);
  const handlegrowth_stage = useCallback(growth_stage => {
    setSaveData(prev => ({ ...prev, growth_stage: growth_stage.value }))
  }, []);
  const handleact_desc = useCallback(act_desc => {
    setSaveData(prev => ({ ...prev, act_desc: act_desc }))
  }, []);
  const handlematerial_used = useCallback(material_used => {
    setSaveData(prev => ({ ...prev, material_used: material_used }))
  }, []);
  const handlewater_used = useCallback(water_used => {
    setSaveData(prev => ({ ...prev, water_used: water_used }))
  }, []);
  const handlepower_used = useCallback(power_used => {
    setSaveData(prev => ({ ...prev, power_used: power_used }))
  }, []);
  return (
    <FarmerDrawerScreenWrapper1>
      <MyErrorBoundary>
        <Root>
          <>
            <View style={styles.container}>
              {modalVisibleMap && (
                <ActivityMap
                  modalVisibleMap={modalVisibleMap}
                  setModalVisibleMap={setModalVisibleMap}
                  plotPolygon={plotPolygon}
                  TakePhoto={TakePhoto}
                  location={location}
                  setOutOfRange={setOutofRange}
                  outofRange={outofRange}
                  pipeLatLong={pipeLatLong}
                />
              )}
              <CustomHeader
                path="FarmerActivityList"
                logoImage={logoImage}
                topBanner={topBanner}
              />
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

              <ScrollView showsVerticalScrollIndicator={false}>
                {isLoading && (
                  <View style={styles.loadingScreen}>
                    <LoadingScreen />
                  </View>
                )}
                <View style={styles.fromContainer}>
                  <View style={{ padding: 20 }}>
                    <DropdownForm
                      label={t('plot')}
                      data={plotAll}
                      required={true}
                      onChange={handlePlot}
                      val={saveData.plot_id}
                    />

                    {showingMenu ? (
                      <View style={styles.plotSiteContainer}>
                        <View style={styles.plotSiteContainerItem}>
                          <Text style={styles.label}>{t('crop_name')}</Text>
                          <Text style={styles.value}>
                            {nameVarityStartEnd.name}
                          </Text>
                        </View>
                        <View style={styles.plotSiteContainerItem}>
                          <Text style={styles.label}>{t('crop_veriety')}</Text>
                          <Text style={styles.value}>
                            {nameVarityStartEnd.varity}
                          </Text>
                        </View>
                        <View style={styles.plotSiteContainerItem}>
                          <Text style={styles.label}>{t('showing_date')}</Text>
                          <Text style={styles.value}>
                            {formatDateToMMDDYYYY(
                              nameVarityStartEnd.cycleStarts,
                            )}
                          </Text>
                        </View>
                        <View style={styles.plotSiteContainerItem}>
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
                      onChange={handlegrowth_stage}
                    />

                    <View style={{ marginBottom: 15 }}>
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
                              backgroundColor: isButtonDisabled
                                ? '#EBEBE4'
                                : 'green',
                            },
                          ]}
                          disabled={isButtonDisabled}
                          onPress={() => setCycleDate()}>
                          <Text
                            style={[
                              styles.titleDate,
                              { color: isButtonDisabled ? '#000' : '#FFF' },
                            ]}>
                            {t('set_the_crop_cycle_start_date')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {isActiveMenu ? (
                      <>
                        <DropdownForm
                          label={t('activity_type')}
                          required={true}
                          data={activityTypeAll}
                          onChange={handleActivityType}
                          val={saveData.act_ref_type}
                        />
                        <DropdownForm
                          label={t('select_activity')}
                          required={true}
                          data={activityInfoAll}
                          onChange={handleActivityInfo}
                          val={saveData.act_to_date_label}
                        />

                        {lastAct ? (
                          <View style={styles.plotSiteContainer}>
                            <View style={styles.detailRow}>
                              <Text style={styles.label}>Last activity</Text>
                              <View style={styles.bulletPointContainer}>
                                <Text style={styles.bulletPoint}>•</Text>
                                <Text style={[styles.value1, styles.leftAlign]}>
                                  {lastAct}
                                </Text>
                              </View>
                            </View>
                          </View>
                        ) : null}

                        {upcomingAct ? (
                          <View style={styles.plotSiteContainer}>
                            <View style={styles.detailRow}>
                              <Text style={styles.label}>
                                Upcoming activity
                              </Text>
                              <View style={styles.bulletPointContainer}>
                                <Text style={styles.bulletPoint}>•</Text>
                                <Text style={[styles.value1, styles.leftAlign]}>
                                  {/* {upcomingAct?.activityName?.categoryName +
                                            ' (' +
                                            formatDate(upcomingAct?.activity_start_date) +
                                            ' - ' +
                                            formatDate(upcomingAct?.activity_end_date) +
                                            ')'} */}
                                  {upcomingAct}
                                </Text>
                              </View>
                            </View>
                          </View>
                        ) : null}

                        {overdueAct?.length > 0 ? (
                          <View style={styles.plotSiteContainer}>
                            <View style={styles.detailRow}>
                              <Text style={styles.label}>
                                Overdue Activities
                              </Text>
                              {overdueAct.map((act, index) => (
                                <View
                                  key={index}
                                  style={styles.bulletPointContainer}>
                                  <Text style={styles.bulletPoint}>•</Text>
                                  <Text
                                    key={index}
                                    style={[styles.value1, styles.leftAlign]}>
                                    {/* {act.activityName.categoryName +
                                              ' (' +
                                              formatDate(act.activity_start_date) +
                                              ' - ' +
                                              formatDate(act.activity_end_date) +
                                              ')'} */}
                                    {act}
                                  </Text>
                                </View>
                              ))}
                            </View>

                            {/* {overdueAct.map((act, index) => ( */}
                          </View>
                        ) : null}
                        {saveData.field_type != '' &&
                          saveData.field_type != null && (
                            <>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  marginTop: 5,
                                }}>
                                <Text
                                  style={{
                                    fontFamily: 'Poppins-Regular',
                                    fontSize: 15,
                                    color: '#4e4e4e',
                                  }}>
                                  {t('Enter Activity Detail')}
                                </Text>
                                <Text style={styles.requiredStar}> *</Text>
                              </View>
                              <View
                                style={{
                                  backgroundColor: '#f2faffff',
                                  width: '100%',
                                  marginVertical: 8,
                                  borderRadius: 20,
                                  borderLeftWidth: 3,
                                  borderLeftColor: Colors.borderGreen,
                                  marginBottom: 15,
                                  shadowColor: '#000',
                                  shadowOffset: { width: 0, height: 4 },
                                  shadowOpacity: 0.1,
                                  shadowRadius: 8,

                                  borderRightWidth: 1,
                                  borderTopWidth: 1,
                                  borderBottomWidth: 1,
                                  borderRightColor: Colors.border,
                                  borderTopColor: Colors.border,
                                  borderBottomColor: Colors.border,
                                }}>
                                <View
                                  style={{
                                    paddingHorizontal: 10,
                                    marginTop: 10,
                                  }}>
                                  {saveData.field_type == 'add' ? (
                                    <InputTextForm
                                      label={t('Enter Instrument Name')}
                                      required={true}
                                      value={pipeNumber}
                                      onChangeText={handleActivityPipeNumber}
                                    />
                                  ) : (
                                    <DropdownForm
                                      label={t('Instrument')}
                                      required={true}
                                      data={PipeListDetailsArr}
                                      onChange={handleActivityPipe}
                                      val={selectPipeList.label}
                                    />
                                  )}
                                  <TakePhotoPipe
                                    openImagePicker={openImagePickerPipe}
                                    selectedImage={selectedImagePipe}
                                    title={t('Take a photo')}
                                    required={true}
                                  />
                                  {saveData.field_type == 'add' && (
                                    <TouchableOpacity
                                      style={{
                                        alignSelf: 'flex-end',
                                        paddingVertical: 10,
                                        paddingHorizontal: 20,
                                        backgroundColor: 'green',
                                        borderRadius: 50,
                                      }}
                                      onPress={() => addMorePipe()}>
                                      <Text style={{ color: '#FFF' }}>
                                        Save and Add Instrument
                                      </Text>
                                    </TouchableOpacity>
                                  )}
                                  <View style={{ marginTop: 10 }}>
                                    {pipeDetails.map((_data, _index) => (
                                      <TouchableOpacity
                                        style={{
                                          backgroundColor: '#fff',
                                          padding: 20,
                                          margin: 10,
                                          borderRadius: 5,
                                          elevation: 2, // <-- Only works on Android
                                          flexDirection: 'row',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                        }}
                                        key={_index}>
                                        <>
                                          <Text
                                            style={{
                                              color: '#000',
                                              fontSize: 12,
                                              paddingHorizontal: 10,
                                            }}>
                                            {_data.pipe_name}
                                          </Text>
                                        </>
                                        <TouchableOpacity
                                          onPress={() =>
                                            handleRemovedpipeDetails(_index)
                                          }>
                                          <Image
                                            source={require('../../Common/images/cross.png')}
                                            style={{ width: 20, height: 20 }}
                                          />
                                        </TouchableOpacity>
                                      </TouchableOpacity>
                                    ))}
                                  </View>
                                </View>
                              </View>
                            </>
                          )}
                      </>
                    ) : (
                      ''
                    )}

                    <View style={{ marginBottom: 15, marginTop: 10 }}>
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                          style={{
                            fontFamily: 'Poppins-Regular',
                            fontSize: 15,
                            color: '#4e4e4e',
                          }}>
                          {t('pick_activity_perform_date')}
                        </Text>
                        <Text style={styles.requiredStar}> *</Text>
                      </View>
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
                      onChangeText={handleact_desc}
                    />

                    <InputTextForm
                      label={t('material_used')}
                      value={saveData.material_used}
                      onChangeText={handlematerial_used}
                    />

                    <InputTextForm
                      label={t('water_used')}
                      value={saveData.water_used}
                      onChangeText={handlewater_used}
                    />

                    <InputTextForm
                      label={t('power_used')}
                      value={saveData.power_used}
                      onChangeText={handlepower_used}
                    />
                  </View>
                </View>
              </ScrollView>
              {modalVisible && (
                <HarvestedModel
                  setModalVisible={setModalVisible}
                  modalVisible={modalVisible}
                  handleHarvested={handleHarvested}
                />
              )}
              <View style={{ marginTop: 10 }}>
                <ButtonForm label={t('submit')} onPress={() => handleSave()} />
              </View>
              <Root></Root>
            </View>
          </>
        </Root>
      </MyErrorBoundary>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerActivityReportAWD;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  titleContainer: {
    width: '95%',
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#4e4e4e',
  },
  titleDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#d9d9d9ff',
  },
  fromContainer: {
    flex: 1,
    backgroundColor: 'white',
    // padding: 10,
    // padding: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  cycleContainerStartDateDesible: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cycleContainerDate: {
    width: '50%',
    // flexDirection: 'row-reverse',
    flexDirection: 'row',
    height: 48,
    borderWidth: 0.5,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    color: '#000000',
    //  borderColor: '#d1d5db',
    borderColor: Colors.borderGreen,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 5,
    color: '#000',
  },
  flatlistHeight: {
    height: Dimensions.get('window').height / 4,
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
  plotSiteContainerItem: {
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
  plotSiteItemText: {
    color: '#000',
    marginVertical: 5,
  },
  loadingScreen: {
    position: 'absolute',
    top: 100,
    zIndex: 999,
    left: '45%',
  },
  clickAddMorePlots: {
    backgroundColor: '#045004',
    marginHorizontal: 35,
    paddingVertical: 15,
    marginVertical: 20,
    borderRadius: 20,
  },
  clickAddMorePlotsTitle: {
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  requiredStar: {
    color: 'red',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  label: {
    fontSize: 14,
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
  value1: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    // flex: 1,
    // textAlign: 'right',
    marginBottom: 10,
    paddingHorizontal: 2,
    textAlign: 'left',
  },
  detailRow: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    marginBottom: 5,
    // paddingHorizontal: 5,
    // paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'red',
    width: '100%',
    marginTop: 10,
  },
  leftAlign: {
    textAlign: 'left',
    alignSelf: 'flex-start', // Ensures text starts from left
    width: '100%', // Takes full width of container
    paddingLeft: 10, // Add some left padding if needed
    flex: 1,
  },
  bulletPointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
    width: '100%',
    paddingLeft: 5,
  },

  bulletPoint: {
    fontSize: 15,
    color: 'black',
    // marginRight: 1,
    lineHeight: 20, // Adjust to match your text line height
  },
});
