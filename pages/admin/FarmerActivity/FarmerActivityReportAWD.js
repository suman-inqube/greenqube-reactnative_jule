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
import {PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  useRef,
} from 'react';
import RNFS from 'react-native-fs';
// import TakePhoto from './TakePhoto';
import {launchCamera} from 'react-native-image-picker';
import Marker, {Position} from 'react-native-image-marker';
import RecordComp from '../Activity/RecordComp';
import {CrashlyticsRecordError} from '../../Crashlytics/CrashlyticsRecordError';
import MyErrorBoundary from '../../Common/MyErrorBoundary';
import {Colors, Fronts} from '../../utils/Constants';
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
import {formatDateToMMDDYYYY} from '../../Common/DateChanger';
import {useFocusEffect} from '@react-navigation/native';
import SoundRecord from '../../Common/SoundRecord';
import AudioPlayerView from '../../Common/AudioPlayerView';
import CustomAlert from '../../Common/CustomAlert';
import * as AudioRecorderPlayerPkg from 'react-native-audio-recorder-player';
const AudioRecorderPlayer =
  AudioRecorderPlayerPkg.default || AudioRecorderPlayerPkg;
const audioRecorderPlayer =
  typeof AudioRecorderPlayer === 'function'
    ? new AudioRecorderPlayer()
    : AudioRecorderPlayer;
const qs = require('qs');
import {userCreateContext} from '../../Context/usersCreateContext';
import {plotHook} from '../../hooks/plotHook';
import HarvestedModel from '../../Common/HarvestedModel';
import TakePhotoPipe from '../../Common/TakePhotoPipe';
import ActivityMap from '../../Common/ActivityMap';
import {isPointInPolygon, getDistance} from 'geolib';
import {captureRef} from 'react-native-view-shot';
import {getHighAccuracyLocation} from '../../utils/getHighAccuracyLocation';
import {showAIValidationError} from '../../utils/showAIValidationError';
import SecurityWrapper from '../../SecurityCheck/SecurityWrapper';
import PipeDetailsCard from '../../../Components/PipeDetailsCard';
const FarmerActivityReportAWD = ({navigation}) => {
  const today = new Date();
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(today.getDate() - 10);
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
    getItem,
    setItem,
    logoImage,
    topBanner,
    isOnline,
    LoadingScreen,
    coords,
  } = useContext(userCreateContext);
  var watchId, watchIdSaveData;
  const {dbname, lan_id, token, user_id} = loginUser_data;
  const {problemPlotAgainstFarmer, plotAll, setplotAll} = plotHook(
    dbname,
    lan_id,
    token,
    user_id,
    isOnline,
  );
  const [minimumSeletedDate, setMinimumSelectedDate] = useState(new Date());

  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);
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
  const [replaceImgKey, setReplaceImgKey] = useState({
    arrayPosition: '',
    imgPosition: '',
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
    productionSeasonSdId: '',
  });
  const [dafaultLatLon, setDefaultLatLon] = useState({
    latitude: 22.15454,
    longitude: 22.515451,
    accuracy: 5,
  });
  const [myphoto, setmyPhoto] = useState(null);
  const [myphotoAll, setmyPhotoAll] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectPipeList, setselectPipeList] = useState({
    label: '',
    value: '',
    latlongs: {},
  });
  const pipe_fieldType = useRef(2);
  // const checkPipeDistance = (currentLat, currentLon) => {
  //   try {
  //     console.error('pipeLatLong', pipeLatLong);
  //     const prePipeCheck = isWithin20Meters(
  //       {currentLat, currentLon},
  //       pipeLatLong,
  //       40,
  //     );
  //     console.log('prePipeCheck', prePipeCheck);
  //   } catch (error) {
  //     console.log('error', error);
  //   }
  // };
  const checkPipeDistance = async (currentLat, currentLon) => {
    try {
      // Get fresh coordinates each time this function is called
      const {latitude, longitude} = coords || {};
      let freshLatLong;

      if (!latitude || !longitude) {
        freshLatLong = await getHighAccuracyLocation();
      }

      const lat = currentLat || latitude || freshLatLong?.latitude || 0;
      const lon = currentLon || longitude || freshLatLong?.longitude || 0;
      // console.error('Checking pipe distance with coordinates:', {lat, lon});

      // console.error('Checking pipe distance with coordinates:', {lat, lon});

      const allPipes = [...pipeLatLong];

      pipeDetails.forEach(pipeGroup => {
        const pipeName = pipeGroup[0]?.pipe_name;
        const firstImage = pipeGroup[1]?.[0];
        if (firstImage && firstImage.lat && firstImage.lon) {
          allPipes.push({
            latitude: firstImage.lat,
            longitude: firstImage.lon,
            name: pipeName || 'New Pipe',
            color: '#000000',
          });
        }
      });

      // console.log('All pipes to check against:', allPipes);

      if (allPipes.length === 0) {
        // console.log('No existing pipe');
        return true;
      }

      for (const existingPipe of allPipes) {
        // console.log('Checking against pipe:', existingPipe);
        const distance = getDistance(
          {latitude: lat, longitude: lon},
          {latitude: existingPipe.latitude, longitude: existingPipe.longitude},
        );

        // console.log(
        //   `Distance to pipe "${existingPipe.name}": ${Math.round(
        //     distance,
        //   )} meters`,
        // );

        if (distance < 20) {
          Alert.alert(
            'Too Close!',
            `Move at least 20 meters away from existing Pipe "${existingPipe.name}".`,
            [{text: 'OK', style: 'cancel'}],
          );
          return false;
        }
      }

      // console.log('No pipes within 20 meters');
      return true;
    } catch (error) {
      console.log('Error in checkPipeDistance:', error);
      return true; // Allow proceeding if there's an error
    }
  };
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
              text: `${coords.latitude},${
                coords.longitude
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
    setSaveData({...saveData, act_perform_date: effective_date});
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
    if (activitySchedule.status == 200) {
      setIsLoading(false);

      if (activitySchedule?.data?.data?.otherActivities.length > 0) {
        activitySchedule?.data?.data?.otherActivities.forEach(function (
          element,
        ) {
          var overdueData;
          if (element?.days_until_start < 0) {
            overdueData =
              element?.activityName?.categoryName +
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
            cycleDtartDate == '' ? saveData.cycle_start_date : cycleDtartDate;
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
      productionSeasonSdId: '',
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
      const latandlongArr =
        response?.data?.data?.land_info?.agri_land_user_latlongs?.map(
          (_data, _index) => ({
            longitude: parseFloat(_data.longitude),
            latitude: parseFloat(_data.latitude),
          }),
        );
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
          {cancelable: false},
        );
      }
      const {latitude, longitude} = coords || {};
      var latlong;
      if (latitude == '' && longitude == '') {
        latlong = await getHighAccuracyLocation();
      }
      const lat = latitude === '' ? latlong.latitude : latitude;
      const lon = longitude === '' ? latlong.longitude : longitude;
      if (latandlongArr.length != 0) {
        setPlotPolygon(latandlongArr);
        const inside = isPointInPolygon({lat, lon}, latandlongArr);
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
        setMinimumSelectedDate(new Date(cycle_start_date));

        setNameVarityStartEnd(prev => ({
          ...prev,
          name: data.crop_name.name,
          varity: data.crop_variety.name,
          cycleStarts: data.sowing_date,
          cycleEnd: data.harvesting_date,
          productionSeasonSdId: data.season_date_fid,
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
          if (
            activitySchedule?.data?.data?.lastActivity !== 'No Last Activity'
          ) {
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
                color: _data?.pipeActName?.color_code,
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
      setSoundRecordSecoundItem({isLoggingIn: false, result: result});
    } catch (error) {
      console.error('Error stopping the recording:', error);
    }
  }, []);
  const onStopRecordThirdItem = useCallback(async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setSoundRecordThirdItem({isLoggingIn: false, result: result});
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
      Toast.show({text: t('please_select_sowing_date_first'), ...AlertMesg[0]});
      return false;
    }

    if (!isGeoFence) {
      Toast.show({text: 'Plot is not geofenced ', ...AlertMesg[0]});

      return;
    }
    if (!outofRangeCheck) {
      Toast.show({text: 'You are out of range', ...AlertMesg[0]});

      return;
    }
    return true;
  };
  const handleSave = async () => {
    Keyboard.dismiss();
    if (validateForm()) {
      const hasFailed = pipeDetails.some(pipeGroup =>
        pipeGroup[1].some(img => img.status === 'failed'),
      );

      if (hasFailed) {
        Toast.show({
          text: '❌ Some images failed!',
          ...AlertMesg[0],
        });
        console.log('❌ Some images failed!');
        return;
      }
      setIsLoading(true);
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
      formData.append('user_id', farmerID);
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
      formData.append(
        'season_date_fid',
        nameVarityStartEnd.productionSeasonSdId,
      );
      if (saveData.act_pattern === 'schedule') {
        formData.append('act_ref_type', saveData.act_ref_type);
        formData.append('act_to_date', saveData.act_to_date);
        formData.append('act_start_date', saveData.act_start_date);
        formData.append('act_ref', saveData.act_ref);
        if (saveData.field_type == 'add') {
          let pipe_data = [];
          pipeDetails.map((__data, _index) => {
            let pipe_lattlong = [];
            __data[1].map((__dataItem, _e) => {
              if (__dataItem.imageURL != '' && __dataItem?.status == '') {
                formData.append(`pipe_image_${_index + 1}`, {
                  uri: __dataItem.imageURL,
                  type: 'image/jpeg',
                  name: __dataItem.imageName,
                });
              }
              pipe_lattlong.push({
                latitude: __dataItem.lat?.toString(),
                longitude: __dataItem.lon?.toString(),
              });
            });
            pipe_data.push({
              pipe_name: __data[0]?.pipe_name,
              pipe_lattlong: pipe_lattlong,
            });
          });
          formData.append('pipe_data', JSON.stringify(pipe_data));
        } else {
          const pipe_image = [];
          let pipe_lattlong = [];
          pipeDetails.map((__data, _index) => {
            __data[1].map((__dataItem, _e) => {
              if (__dataItem.imageURL != '' && __dataItem?.status == '') {
                pipe_image.push({
                  uri: __dataItem.imageURL,
                  type: 'image/jpeg',
                  name: __dataItem.imageName,
                });
              }
              pipe_lattlong.push({
                latitude: __dataItem.lat?.toString(),
                longitude: __dataItem.lon?.toString(),
              });
            });
          });
          const pipe_data = [
            {pipe_id: selectPipeList.value, latlong: pipe_lattlong},
          ];
          if (pipe_lattlong.length != 0) {
            formData.append('existing_pipe_ids', JSON.stringify(pipe_data));
          }
          pipe_image.map((_data, _index) => {
            formData.append(`pipe_files[0]`, _data);
          });
        }
        // if (saveData.field_type == 'add') {
        //   pipeDetails.map((_data, _index) => {
        //     const { selectedImagePipe } = _data;
        //     const { firstItem, secondItem } = selectedImagePipe || {};
        //     const firstItemfileName = firstItem.split('/').pop();
        //     const secondItemfileName = secondItem.split('/').pop();
        //     if (firstItemfileName != '') {
        //       formData.append(`pipe_image_${_index + 1}`, {
        //         uri: firstItem,
        //         type: 'image/jpeg',
        //         name: firstItemfileName,
        //       });
        //     }
        //     if (secondItemfileName != '') {
        //       formData.append(`pipe_image_${_index + 1}`, {
        //         uri: secondItem,
        //         type: 'image/jpeg',
        //         name: secondItemfileName,
        //       });
        //     }
        //   });
        // } else {
        //   const pipe_image = [];
        //   if (selectedImagePipe?.firstItem != '') {
        //     pipe_image.push({
        //       uri: selectedImagePipe?.firstItem,
        //       type: 'image/jpeg',
        //       name: selectedImagePipe?.firstItem.split('/').pop(),
        //     });
        //   }
        //   if (selectedImagePipe?.secondItem != '') {
        //     pipe_image.push({
        //       uri: selectedImagePipe.secondItem,
        //       type: 'image/jpeg',
        //       name: selectedImagePipe.secondItem.split('/').pop(),
        //     });
        //   }
        //   pipe_image.map((_data, _index) => {
        //     formData.append(`pipe_files[0]`, _data);
        //   });
        // }
      }
      formData.append('act_desc', saveData.act_desc);
      formData.append('material_used', saveData.material_used);
      formData.append('water_used', saveData.water_used);
      formData.append('power_used', saveData.power_used);
      formData.append('app_version', '104');
      var database_res;
      if (isOnline) {
        if (saveData.field_type == 'add') {
          database_res = await addUserPipeActivity(
            dbname,
            lan_id,
            token,
            farmerID,
            formData,
            pipeDetails.length,
          );
        } else {
          if (coords != null) {
            const {latitude, longitude} = coords || {};
            const distances = getDistance(selectPipeList.latlongs, {
              latitude,
              longitude,
            });
            if (distances < 10) {
              database_res = await addPrevPipeActivity(
                dbname,
                lan_id,
                token,
                farmerID,
                formData,
                1,
              );
            } else {
              Toast.show({
                text: t('You are not in your exact pipe location'),
                ...AlertMesg[0],
              });
            }
          } else {
            Toast.show({text: t('Location not found'), ...AlertMesg[0]});
          }
        }
        if (database_res?.status === 400) {
          showAIValidationError(database_res);
          const cleanFileName = name => name.replace(/^\d+-/, '');
          const failedNamesSet =
            database_res?.data?.error?.errorMessage?.failed.map(i =>
              cleanFileName(i.image_name),
            );
          const failedSet = new Set(failedNamesSet);
          const updatedPipeDetails = pipeDetails.map(pipeGroup => {
            return pipeGroup.map(item => {
              if (Array.isArray(item)) {
                return item.map(img => {
                  const isFailed = [...failedSet].some(failedName =>
                    img.imageName.includes(failedName),
                  );
                  return {
                    ...img,
                    status: isFailed ? 'failed' : 'accepted',
                  };
                });
              }
              return item; // pipe_name object untouched
            });
          });
          setPipeDetails(updatedPipeDetails);
          showAIValidationError(database_res);
          setIsLoading(false);
        }
        if (database_res?.status == 200) {
          navigation.navigate('FarmerActivityList', {action: 'addData'});
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
        navigation.navigate('FarmerActivityList', {action: 'addData'});
      }
    }
    setIsLoading(false);
  };
  const handleActivityType = useCallback(
    async item => {
      try {
        let dataArray = [];
        var response;
        console.log(
          'activityInfo55' +
            farmerID +
            ',,' +
            CropType +
            ',,' +
            CropName +
            ',,' +
            item.value,
        );
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
        setselectPipeList({
          ...selectPipeList,
          label: '',
          value: '',
          latlongs: {},
        });
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
        CrashlyticsRecordError(
          error,
          'ActivityReportAWD',
          'handleActivityType',
        );
      }
    },
    [CropType, CropName, isButtonDisabled],
  );

  const handleActivityInfo = useCallback(async item => {
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
    if (item?.field_type == 'add') {
      pipe_fieldType.current = 1;
    } else {
      pipe_fieldType.current = 0;
    }
    setselectPipeList({
      ...selectPipeList,
      label: '',
      value: '',
      latlongs: {},
    });

    const PipeListDetailsRes = await getUniquePipeNames(
      dbname,
      lan_id,
      token,
      farmerID,
      saveData.plot_id,
      item?.act_master_id,
      saveData?.cu_rel_id,
    );
    if (PipeListDetailsRes?.status == 200) {
      const pipeDetailsArr = PipeListDetailsRes?.data?.data?.map(
        (_data, _index) => ({
          value: _data.pipe_pid,
          label: _data.pipe_name,
          latlongs: _data?.latlongs?.[0] || {},
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
    const {latitude, longitude} = coords || {};
    var latlong;
    if (latitude == '' && longitude == '') {
      latlong = await getHighAccuracyLocation();
    }
    const lat = latitude === '' ? latlong.latitude : latitude;
    const lon = longitude === '' ? latlong.longitude : longitude;
    setDefaultLatLon({latitude: lat, longitude: lon, accuracy: 10});
    setSaveData(prev => ({
      ...prev,
      act_pattern: 'schedule',
      latitude: lat,
      longitude: lon,
    }));
    setisActiveMenu(true);
    setfarmerID(user_id);
    problemPlotAgainstFarmer();
    if (isOnline) {
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
    setLocation({lat, lon});
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
  const addMorePipe = field_type => {
    if (pipeNumber == '' && field_type == 'add') {
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
      // selectedImagePipe, status: ""
      setPipeDetails([
        ...pipeDetails,
        [
          {pipe_name: pipeNumber},
          [
            {
              imageURL: selectedImagePipe.firstItem,
              imageName: selectedImagePipe.firstItemfileName,
              status: '',
              lat: selectedImagePipe.firstItemLat,
              lon: selectedImagePipe.firstItemLong,
            },
            {
              imageURL: selectedImagePipe.secondItem,
              imageName: selectedImagePipe.secondItemfileName,
              status: '',
              lat: selectedImagePipe.secondItemLat,
              lon: selectedImagePipe.secondItemLong,
            },
          ],
        ],
      ]);
      setSelectedImagePipe(prev => ({
        ...prev,
        firstItem: '',
        firstItemLat: '',
        firstItemLong: '',
        secondItem: '',
        secondItemLat: '',
        secondItemLong: '',
        firstItemfileName: '',
        secondItemfileName: '',
      }));
      setPipeNumber('');
    }
  };
  const pipeEdit = _index => {
    const values = [...pipeDetails];
    values.splice(_index, 1);
    setPipeDetails(values);
  };

  const [modalVisibleMap, setModalVisibleMap] = useState(false);
  const [plotPolygon, setPlotPolygon] = useState([]);
  const [cameraItem, setCameraItem] = useState('');
  const [tempImage, setTempImage] = useState(null);
  const [tempText, setTempText] = useState('');
  const watermarkViewRef = useRef(null);
  const openImagePickerPipe = useCallback(async item => {
    setCameraItem(item);
    setModalVisibleMap(true);
  }, []);
  const TakePhoto = useCallback(
    async replaceImgKey => {
      const {latitude, longitude} = coords || {};
      let latlong;

      // If coords are empty, fetch current location
      if (!latitude || !longitude) {
        latlong = await getHighAccuracyLocation();
      }

      const lat = latitude || latlong?.latitude || 0;
      const lon = longitude || latlong?.longitude || 0;

      // console.log('field_type', JSON.stringify(activityInfoAll[0].field_type));
      // console.log('field_type1233', pipe_fieldType.current);
      // if (pipe_fieldType.current === 1) {
      //   const isPipeInstall = await checkPipeDistance(lat, lon);
      //   if (!isPipeInstall) {
      //     return;
      //   }
      // }

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
          if (response.didCancel) {
            console.log('User cancelled camera');
            return;
          }
          if (response.errorCode) {
            console.log('Camera Error:', response.errorMessage);
            return;
          }

          const asset = response.assets?.[0];
          if (!asset?.uri) {
            CustomAlert('Error', 'No image captured', true, 'OK');
            return;
          }

          const timestamp = Date.now();

          // ✅ Combine Date-Time + Lat-Long in watermark text
          const dateTime = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).format(timestamp);

          const watermarkText = `${dateTime}\nLat: ${lat}, Lon: ${lon}`;

          // Set temporary image and text for watermark view
          setTempImage(asset.uri);
          setTempText(watermarkText);
          setTimeout(async () => {
            try {
              const uri = await captureRef(watermarkViewRef, {
                format: 'jpg',
                quality: 2,
                width: 800,
                height: 800,
              });
              const fileName = asset.fileName || `photo_${timestamp}.jpg`;
              const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
              await RNFS.copyFile(uri, destPath);
              const path = destPath;
              setTempImage(null);
              setTempText('');
              if (replaceImgKey.arrayPosition === '') {
                setSelectedImagePipe(prev => ({
                  ...prev,
                  [cameraItem]: `file://${path}`,
                  [`${cameraItem}fileName`]: fileName,
                  [`${cameraItem}Lat`]: lat,
                  [`${cameraItem}Long`]: lon,
                }));
              } else {
                const {arrayPosition, imgPosition} = replaceImgKey;
                setPipeDetails(prev => {
                  const updated = JSON.parse(JSON.stringify(prev));
                  const currentImage = updated[arrayPosition][1][imgPosition];
                  updated[arrayPosition][1][imgPosition] = {
                    ...currentImage,
                    imageURL: `file://${destPath}`,
                    imageName: fileName,
                    status: '',
                    lat,
                    lon,
                  };
                  return updated;
                });
              }
              setModalVisibleMap(false);
              console.log('✅ Watermarked image saved:', path);
            } catch (error) {
              console.error('Capture Error:', error);
              setTempImage(null);
              setTempText('');
            }
          }, 500);
        } catch (error) {
          console.error('TakePhoto Error:', error);
        } finally {
          setModalVisibleMap(false);
        }
      });
    },
    [
      cameraItem,
      setSelectedImagePipe,
      setModalVisibleMap,
      replaceImgKey,
      TakePhotoFailed,
      coords,
    ],
  );
  const TakePhotoFailed = (_index, imgIndex) => {
    setReplaceImgKey({
      arrayPosition: _index.toString(),
      imgPosition: imgIndex.toString(),
    });
    setModalVisibleMap(true);
  };

  const handleActivityPipe = useCallback(_item => {
    const {pipeFiles, pipeLatLong, label, value, latlongs} = _item || {};
    setselectPipeList({...selectPipeList, label, value, latlongs: latlongs});
  }, []);
  const handlegrowth_stage = useCallback(growth_stage => {
    setSaveData(prev => ({...prev, growth_stage: growth_stage.value}));
  }, []);
  const handleact_desc = useCallback(act_desc => {
    setSaveData(prev => ({...prev, act_desc: act_desc}));
  }, []);
  const handlematerial_used = useCallback(material_used => {
    setSaveData(prev => ({...prev, material_used: material_used}));
  }, []);
  const handlewater_used = useCallback(water_used => {
    setSaveData(prev => ({...prev, water_used: water_used}));
  }, []);
  const handlepower_used = useCallback(power_used => {
    setSaveData(prev => ({...prev, power_used: power_used}));
  }, []);
  return (
    <FarmerDrawerScreenWrapper1>
      <MyErrorBoundary>
        <Root>
          <SecurityWrapper coords={coords}>
            <View style={styles.container}>
              {modalVisibleMap && (
                <ActivityMap
                  modalVisibleMap={modalVisibleMap}
                  setModalVisibleMap={setModalVisibleMap}
                  plotPolygon={plotPolygon}
                  TakePhoto={TakePhoto}
                  location={coords.latitude == '' ? dafaultLatLon : coords}
                  setOutOfRange={setOutofRange}
                  outofRange={outofRange}
                  pipeLatLong={pipeLatLong}
                  replaceImgKey={replaceImgKey}
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
                minimumDate={minimumSeletedDate}
              />
              <DatePickerComp
                openDate={activityPreDate}
                newDate={newFromDate}
                setOpenDate={setActivityPreDate}
                handleDatePicker={handleDatePicker2}
                minimumDate={tenDaysAgo}
                maximumDate={today}
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
                  <View style={{padding: 20}}>
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

                    <View style={{marginBottom: 15}}>
                      <Text style={styles.title}>
                        {t('pick_crop_cycle_start_date')}
                      </Text>
                      <View style={styles.cycleContainer}>
                        <TouchableOpacity
                          style={styles.cycleContainerDate}
                          disabled={isButtonDisabled}
                          onPress={() => srtCycleStartDate(true)}>
                          <View style={{width: '80%'}}>
                            <Text style={styles.title}>
                              {cycleDtartDate == ''
                                ? saveData.cycle_start_date
                                : cycleDtartDate}
                            </Text>
                          </View>
                          <Image
                            source={require('../../Common/images/calendar.png')}
                            style={{width: 20, height: 20}}
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
                              {color: isButtonDisabled ? '#000' : '#FFF'},
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
                                  shadowOffset: {width: 0, height: 4},
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
                                  <View style={styles.hiddenContainer}>
                                    {tempImage && (
                                      <View
                                        ref={watermarkViewRef}
                                        style={styles.watermarkView}
                                        collapsable={false}>
                                        <Image
                                          source={{uri: tempImage}}
                                          style={styles.watermarkImage}
                                          resizeMode="cover"
                                        />
                                        <View
                                          style={styles.watermarkTextContainer}>
                                          <Text style={styles.watermarkText}>
                                            {tempText}
                                          </Text>
                                        </View>
                                      </View>
                                    )}
                                  </View>
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
                                      onPress={() =>
                                        addMorePipe(saveData.field_type)
                                      }>
                                      <Text style={{color: '#FFF'}}>
                                        Save and Add Instrument
                                      </Text>
                                    </TouchableOpacity>
                                  )}
                                  {saveData.field_type == 'select' &&
                                    pipeDetails.length == 0 && (
                                      <TouchableOpacity
                                        style={{
                                          alignSelf: 'flex-end',
                                          paddingVertical: 10,
                                          paddingHorizontal: 20,
                                          backgroundColor: 'green',
                                          borderRadius: 50,
                                        }}
                                        onPress={() =>
                                          addMorePipe(saveData.field_type)
                                        }>
                                        <Text style={{color: '#FFF'}}>
                                          Save and Update Instrument
                                        </Text>
                                      </TouchableOpacity>
                                    )}
                                  {/* <View style={{ marginTop: 10 }}>
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
                                            style={{width: 20, height: 20}}
                                          />
                                        </TouchableOpacity>
                                      </TouchableOpacity>
                                    ))}
                                  </View> */}
                                  <PipeDetailsCard
                                    pipeDetails={pipeDetails}
                                    pipeEdit={pipeEdit}
                                    TakePhotoFailed={TakePhotoFailed}
                                  />
                                </View>
                              </View>
                            </>
                          )}
                      </>
                    ) : (
                      ''
                    )}

                    <View style={{marginBottom: 15, marginTop: 10}}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
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
                          style={{width: 20, height: 20}}
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
              <View style={{marginTop: 10}}>
                <ButtonForm label={t('submit')} onPress={() => handleSave()} />
              </View>
              <Root></Root>
            </View>
          </SecurityWrapper>
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
    shadowOffset: {width: 0, height: 4},
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

  hiddenContainer: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    width: 200,
    height: 200,
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
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  imageContainer: {
    marginTop: 20,
  },
  imageWrapper: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageIndex: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 5,
  },
  galleryWrapper: {
    marginTop: 20,
  },
});
