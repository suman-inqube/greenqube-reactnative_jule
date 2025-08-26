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
import React, {useEffect, useState, useCallback, useContext} from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
// import TakePhoto from './TakePhoto';
import {launchCamera} from 'react-native-image-picker';
import Marker, {Position} from 'react-native-image-marker';
import RecordComp from '../Activity/RecordComp';
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
const audioRecorderPlayer = new AudioRecorderPlayer();
const qs = require('qs');
import {userCreateContext} from '../../Context/usersCreateContext';
import {plotHook} from '../../hooks/plotHook';
import HarvestedModel from '../../Common/HarvestedModel';
import TakePhotoPipe from '../../Common/TakePhotoPipe';
import ActivityMap from '../../Common/ActivityMap';
import getCurrentLocation from '../../Common/getCurrentLocation';
import {isWithin20Meters} from '../../Common/calculateAreaFun';
import {isPointInPolygon, getDistance} from 'geolib';
import {APP_MAP_RANGE_POLYGON} from '@env';
const FarmerActivityReportAWD = ({navigation}) => {
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
    LoadingScreen,
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
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const {netConnection} = DeviceInfo();
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
              text: `${saveData.latitude},${
                saveData.longitude
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

  const handlePlot = async relId => {
    setIsLoading(true);
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
      //basudev nayak
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
          {cancelable: false},
        );
      }
      const fusedLocation = await getItem('fusedLocation');
      const {latitude, longitude} = fusedLocation;
      if (latandlongArr.length != 0) {
        setPlotPolygon(latandlongArr);
        const inside = isPointInPolygon({latitude, longitude}, latandlongArr);
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
          crop_season: data?.crop_season?.fid,
          field_type: '',
        });
        setsinglePlot(response?.data?.data);
        setCropType(response?.data?.data?.crop_type.fid);
        setCropName(response?.data?.data?.crop_name.fid);

        // if (netConnection) {
        //   var productionStage_res = await productionStageAPI(
        //     dbname,
        //     lan_id,
        //     response.data.data.rows[0].crop_type_id,
        //     response.data.data.rows[0].crop_name_id,
        //   );
        //   await setItem(
        //     'productionStageAPI' +
        //     response.data.data.rows[0].crop_type_id +
        //     response.data.data.rows[0].crop_name_id,
        //     productionStage_res,
        //   );
        // } else {
        //   var productionStage_res = await getItem(
        //     'productionStageAPI' +
        //     response.data.data.rows[0].crop_type_id +
        //     response.data.data.rows[0].crop_name_id,
        //   );
        // }
        // if (productionStage_res) {

        //   const dataArray = [];
        //   productionStage_res.data.data.growth_stage.forEach(element => {
        //     dataArray.push({
        //       value: element.growth_stage.fid,
        //       label: element.growth_stage.name,
        //     });
        //   });
        //   setproductionStageAll(dataArray);
        // }

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
          // console.log(activitySchedule.data.data.lastActivity);
          // var overdueData;
          if (activitySchedule?.data?.data?.otherActivities.length > 0) {
            // activitySchedule?.data?.data?.otherActivities.forEach(function (
            //   element,
            // ) {
            //   var overdueData;
            //   if (element?.days_until_start < 0) {
            //     overdueData =
            //       element?.activityName.categoryName +
            //       ' (' +
            //       formatDate(element?.activity_start_date) +
            //       ' - ' +
            //       formatDate(element?.activity_end_date) +
            //       ')';
            //     // console.log(overdueData);
            //   }
            //   setOverdueAct(prevItems => [...prevItems, overdueData]);
            // });
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
              // const cycleDate =
              //   cycleDtartDate == ''
              //     ? saveData.cycle_start_date
              //     : cycleDtartDate;
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
          // setScheduleInfo({
          //   ...scheduleInfo,
          //   lastAct: '',
          //   upcomingAct: '',
          // });
        }

        if (pipeLatLongRes?.status == 200) {
          // console.log(
          //   'pipe image',
          //   JSON.stringify(pipeLatLongRes?.data?.data?.pipeData),
          // );
          setIsLoading(false);
          const pipeLatLongArr = pipeLatLongRes?.data?.data?.pipeData?.rows.map(
            _data => {
              // return _data.pipeLatLong.map(latLong => ({
              //   latitude: parseFloat(latLong.latitude),
              //   longitude: parseFloat(latLong.longitude),
              //   name: _data.pipe_name,
              // }));
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
          // console.log(overdueAct);
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
  };

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
      // RNFS.readFile(result, 'base64')
      //   .then(res => {
      //   })
      //   .catch(err => {
      //     console.error(err);
      //   });
      // console.log("Stopped recording:", result);
      // navigation.navigate(navPath, { result: result,name:name });
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
      const formData = new FormData();
      formData.append('act_title', '');
      // myphotoAll.forEach((photo) => {
      //   formData.append("photo", photo);
      // });

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
      // formData.append("latitude", saveData.latitude);
      // formData.append("longitude", saveData.longitude);
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
            const {selectedImagePipe, pipe_name} = _data;
            const {firstItemLat, firstItemLong, secondItemLat, secondItemLong} =
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
          // const pipe_lattlong = [];latlong;
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
              // pipe_name: selectPipeList.label,
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
            const {selectedImagePipe} = _data;
            const {firstItem, secondItem} = selectedImagePipe || {};
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
          Toast.show({text: t('Data_submitted_successfully'), ...AlertMesg[0]});
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
        Toast.show({text: t('Data_submitted_successfully'), ...AlertMesg[0]});
        setTimeout(() => {
          navigation.navigate('FarmerActivityList');
        }, 1000);
      }
    }
  };
  // const handleActivityType = async item => {
  //   let dataArray = [];
  //   if (netConnection) {
  //     var response = await activityInfoAPI(
  //       dbname,
  //       lan_id,
  //       token,
  //       farmerID,
  //       CropType,
  //       CropName,
  //       item.value,
  //     );
  //     await setItem(
  //       'activityInfo' + CropType + CropName + item.value,
  //       response,
  //     );
  //   } else {
  //     // var response = await getItem(
  //     //   'activityInfo' + CropType + CropName + item.value,
  //     //   response,
  //     // );
  //   }
  //   setSaveData({...saveData, act_ref_type: item.value, field_type: ''});
  //   if (response.data.data.count > 0) {
  //     // const dataArray = [];
  //     response.data.data.rows.forEach(element => {
  //       const monthNames = [
  //         'January',
  //         'February',
  //         'March',
  //         'April',
  //         'May',
  //         'June',
  //         'July',
  //         'August',
  //         'September',
  //         'October',
  //         'November',
  //         'December',
  //       ];
  //       const sdate = new Date(cycleDtartDate);
  //       sdate.setDate(sdate.getDate() + element.days_from);
  //       const smonth = monthNames[sdate.getMonth()];
  //       const sday = sdate.getDate();
  //       const syear = sdate.getFullYear();
  //       const startDate = `${smonth} ${sday}, ${syear}`;
  //       const edate = new Date(cycleDtartDate);
  //       edate.setDate(edate.getDate() + element.days_to);
  //       const emonth = monthNames[edate.getMonth()];
  //       const eday = edate.getDate();
  //       const eyear = edate.getFullYear();
  //       const endDate = `${emonth} ${eday}, ${eyear}`;
  //       const startDateEndDate = `${startDate}-${endDate}`;
  //       // console.log(
  //       //   'element?.activity?.field_type',
  //       //   element?.activity?.field_type,
  //       // );
  //       dataArray.push({
  //         start_date: sdate,
  //         end_date: edate,
  //         value: element?.act_rid,
  //         label:
  //           element?.activity?.categoryName + ' (' + startDateEndDate + ')',
  //         act_master_id: element?.act_master_id,
  //         field_type: element?.activity?.field_type,
  //       });
  //     });
  //     //
  //     if (isButtonDisabled) {
  //       setActivityInfoAll(dataArray);
  //     }
  //   } else {
  //     setActivityInfoAll([]);
  //   }
  // };
 
   const handleActivityType = async item => {
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
        setSaveData({
          ...saveData,
          act_to_date: '',
          act_to_date_label: '',
          act_start_date: '',
          act_ref: '',
          act_master_id: '',
          act_ref_type: item.value,
          field_type: '',
        });
        setSelectedImagePipe({
          ...selectedImagePipe,
          firstItem: '',
          firstItemLat: '',
          firstItemLong: '',
          secondItem: '',
          secondItemLat: '',
          secondItemLong: '',
        });
        setselectPipeList({
          ...selectPipeList,
          label: '',
          value: '',
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
        CrashlyticsRecordError(error, 'ActivityReportAWD', 'handleActivityType');
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
      act_master_id: item?.act_master_id,
      field_type: item?.field_type || '',
    });
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
      act_pattern: 'schedule',
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
      base64: '',
    });
    setSoundRecordSecoundItem({
      item: '2',
      isLoggingIn: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      result: '',
      base64: '',
    });
    setSoundRecordThirdItem({
      item: '3',
      isLoggingIn: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      result: '',
      base64: '',
    });
  }

  const onPageLoad = async () => {
    handleClear();
    requestLivePermission();
    setSaveData({...saveData, act_pattern: 'schedule'});
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
    watchId = Geolocation.watchPosition(
      async position => {
        const {latitude, longitude} = position.coords;

        setLocation({latitude, longitude});
      },
      error => Alert.alert('Location Error', error.message),
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        timeout: 30000,
        maximumAge: 0,
      },
    );
  };

  useFocusEffect(
    useCallback(() => {
      setSaveData({plot_id: ''});
      onBackPress(() => {
        navigation.navigate('FarmerActivityList');
        return true;
      });
    }, []),
  );

  useEffect(() => {
    setSoundRecordFirstItem({
      item: '1',
      isLoggingIn: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      result: '',
      base64: '',
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
      onCloseComplete: () => {
        // alert('onCloseComplete');
      },
      onOpenComplete: () => {
        // console.log(SPSheet)
      },
      height: 260,
    });
  };
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
  const handleActivityPipeNumber = text => {
    setPipeNumber(text);
  };
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
        {pipe_name: pipeNumber, selectedImagePipe},
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
  // const openImagePickerPipe = (item) => {
  //   try {
  //     const options = {
  //       mediaType: 'photo',
  //       includeBase64: true,
  //       maxHeight: 200,
  //       maxWidth: 200,
  //     };
  //     launchCamera(options, async response => {
  //       if (response.didCancel) {
  //         console.log('User cancelled camera');
  //       } else if (response.error) {
  //         console.log('Camera Error: ', response.error);
  //       } else {

  //         // const { latitude, longitude } = await getCurrentLocation() || {};
  //         const timestamp = Date.now();
  //         let imageUri = response.uri || response.assets?.[0]?.uri;
  //         const options = {
  //           backgroundImage: {src: imageUri, scale: 1},
  //           watermarkTexts: [
  //             {
  //               text: `${location.latitude},${
  //                 location.longitude
  //               },${new Intl.DateTimeFormat('en-US', {
  //                 year: 'numeric',
  //                 month: '2-digit',
  //                 day: '2-digit',
  //                 hour: '2-digit',
  //                 minute: '2-digit',
  //                 second: '2-digit',
  //               }).format(timestamp)}`,
  //               positionOptions: {
  //                 position: Position.bottomLeft,
  //               },
  //               style: {
  //                 color: '#df2020',
  //                 fontSize: 2,
  //                 fontName: 'Arial',
  //                 textBackgroundStyle: {padding: '10% 10%', color: '#00000000'},
  //               },
  //             },
  //           ],
  //           scale: 1,
  //           quality: 100,
  //           filename: `${response.assets[0].fileName}`,
  //           saveFormat: `${response.assets[0].type}`,
  //           maxSize: 1000,
  //         };
  //         let path = await Marker.markText(options);
  //         setSelectedImagePipe({
  //           ...selectedImagePipe,
  //           [item]: `file://${path}`,
  //           [`${item}Lat`]: location.latitude,
  //           [`${item}Long`]: location.longitude,
  //         });

  //         Geolocation.clearWatch(watchId);
  //       }
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
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

        const watermarkText = `${location.latitude},${location.longitude},${formattedTime}`;

        const markerOptions = {
          backgroundImage: {src: asset.uri, scale: 1},
          watermarkTexts: [
            {
              text: watermarkText,
              positionOptions: {position: Position.bottomLeft},
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
          [`${cameraItem}Lat`]: location.latitude,
          [`${cameraItem}Long`]: location.longitude,
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
  const handleActivityPipe = _item => {
    const {pipeFiles, pipeLatLong, label, value} = _item || {};

    setselectPipeList({...selectPipeList, label, value});
  };
  return (
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
          HandlerGoBack={HandlerGoBack}
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
          {isLoading && (
            <View style={styles.loadingScreen}>
              <LoadingScreen />
            </View>
          )}
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
                setSaveData({...saveData, growth_stage: production_stage.value})
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
                      backgroundColor: isButtonDisabled ? '#EBEBE4' : 'green',
                    },
                  ]}
                  disabled={isButtonDisabled}
                  onPress={() => setCycleDate()}>
                  <Text
                    style={[
                      styles.title,
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
                  val={saveData.act_to_date_label}
                />

                {lastAct ? (
                  <View style={styles.plotSiteContainer}>
                    <View style={styles.plotSiteContainerItem}>
                      <Text style={styles.plotSiteItemText}>Last activity</Text>
                    </View>
                    <View style={styles.plotSiteContainerItem}>
                      <Text style={styles.plotSiteItemText}>{lastAct}</Text>
                    </View>
                  </View>
                ) : null}

                {upcomingAct ? (
                  <View style={styles.plotSiteContainer}>
                    <View style={styles.plotSiteContainerItem}>
                      <Text style={styles.plotSiteItemText}>
                        Upcoming activity
                      </Text>
                    </View>
                    <View style={styles.plotSiteContainerItem}>
                      <Text style={styles.plotSiteItemText}>
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
                ) : null}

                {overdueAct?.length > 0 ? (
                  <View style={styles.plotSiteContainer}>
                    <View style={styles.plotSiteContainerItem}>
                      <Text style={styles.plotSiteItemText}>
                        Overdue Activities
                      </Text>
                    </View>

                    {/* {overdueAct.map((act, index) => ( */}
                    <View style={styles.plotSiteContainerItem}>
                      {overdueAct.map((act, index) => (
                        <Text key={index} style={styles.plotSiteItemText}>
                          {/* {act.activityName.categoryName +
                                              ' (' +
                                              formatDate(act.activity_start_date) +
                                              ' - ' +
                                              formatDate(act.activity_end_date) +
                                              ')'} */}
                          {act}
                        </Text>
                      ))}
                    </View>
                  </View>
                ) : null}
                {saveData.field_type != '' && saveData.field_type != null && (
                  <>
                    <Text
                      style={[
                        styles.title,
                        {
                          marginHorizontal: 5,
                          marginBottom: 5,
                          color: 'red',
                          fontFamily: 'Poppins-Regular',
                        },
                      ]}>
                      {t('Enter Activity Detail')}
                    </Text>
                    <View
                      style={{
                        backgroundColor: '#FFF',
                        padding: 10,
                        borderRadius: 5,
                        elevation: 1,
                        marginBottom: 10,
                        borderColor: '#fcf7f7',
                        borderWidth: 1.3,
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        backgroundColor: '#ffffff',
                        width: '100%',
                        elevation: 1,
                      }}>
                      {/* <View style={styles.activityPattern}>
                      <RadioForm
                        label={t('Add Instrument ID')}
                        selected={pipeType === 'addPipe'}
                        onSelect={() => handleActivityPipeType('addPipe')}
                      />
                      <RadioForm
                        label={t('Select Instrument')}
                        selected={pipeType === 'UpdatePipe'}
                        onSelect={() => handleActivityPipeType('UpdatePipe')}
                      />
                    </View> */}
                      {saveData.field_type == 'add' ? (
                        <InputTextForm
                          label={t('Enter Instrument Name')}
                          color="red"
                          value={pipeNumber}
                          onChangeText={text => handleActivityPipeNumber(text)}
                        />
                      ) : (
                        <DropdownForm
                          label={t('Instrument')}
                          color="red"
                          data={PipeListDetailsArr}
                          onChange={item => handleActivityPipe(item)}
                          val={selectPipeList.label}
                        />
                      )}
                      <TakePhotoPipe
                        openImagePicker={openImagePickerPipe}
                        selectedImage={selectedImagePipe}
                        title={t('Take a photo')}
                        color="red"
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
                          <Text style={{color: '#FFF'}}>
                            Save and Add Instrument
                          </Text>
                        </TouchableOpacity>
                      )}
                      <View style={{marginTop: 10}}>
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
                              onPress={() => handleRemovedpipeDetails(_index)}>
                              <Image
                                source={require('../../Common/images/cross.png')}
                                style={{width: 20, height: 20}}
                              />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </>
                )}
              </>
            ) : (
              ''
            )}

            <View>
              <Text style={{color: 'red'}}>
                {t('pick_activity_perform_date')}
              </Text>
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
              onChangeText={act_desc =>
                setSaveData({...saveData, act_desc: act_desc})
              }
            />

            <InputTextForm
              label={t('material_used')}
              value={saveData.material_used}
              onChangeText={material_used =>
                setSaveData({...saveData, material_used: material_used})
              }
            />

            <InputTextForm
              label={t('water_used')}
              value={saveData.water_used}
              onChangeText={water_used =>
                setSaveData({...saveData, water_used: water_used})
              }
            />

            <InputTextForm
              label={t('power_used')}
              value={saveData.power_used}
              onChangeText={power_used =>
                setSaveData({...saveData, power_used: power_used})
              }
            />

            {/* <TakePhoto
              openImagePicker={openImagePicker}
              selectedImage={selectedImage}
              title={t('take_a_photo_optional')}
            /> */}

            {/* <RecordComp selectedRecord={selectedRecord} onPress={handleRecord} /> */}
            {/* <RecordComp
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
            /> */}
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
          <ButtonForm label={t('submit')} onPress={() => handleSave()}  loading={isLoading}/>
        </View>
        <Root></Root>
      </View>
    </>
  );
};

export default FarmerActivityReportAWD;

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
  loadingScreen: {
    position: 'absolute',
    top: 100,
    zIndex: 999,
    left: '45%',
  },
});
