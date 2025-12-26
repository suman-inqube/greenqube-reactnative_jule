import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  SafeAreaView,
  Keyboard,
  Alert,
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
// import AudioRecorderPlayer from '@react-native-ohos/react-native-audio-recorder-player';
import TakePhoto from './TakePhoto';
import {launchCamera} from 'react-native-image-picker';
import RecordComp from './RecordComp';
import {
  activityScheduleAPI,
  activityInfoAPI,
  activitySaveAPI,
  activityTypeAPI,
  farmerByNameAPI,
  plotAgainstFarmerAPI,
  produceAgainstPlotAPI,
  productionStageAPI,
  setCycleDateAPI,
} from '../../../config/apiHere';
import {formatDateToMMDDYYYY} from '../../Common/DateChanger';
import HarvestedModel from '../../Common/HarvestedModel';
import SoundRecord from '../../Common/SoundRecord';
import RNFS from 'react-native-fs';
// const audioRecorderPlayer = new AudioRecorderPlayer();
const qs = require('qs');
import AudioPlayerView from '../../Common/AudioPlayerView';
import {userCreateContext} from '../../Context/usersCreateContext';
import {AnalyticsLogEvent} from '../../Analytics';
import {isPointInPolygon} from 'geolib';
import getCurrentLocation from '../../Common/getCurrentLocation';
import {isWithin20Meters} from '../../Common/calculateAreaFun';
import {Colors, Fonts, Fronts} from '../../utils/Constants';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {axiosGet, axiosPost} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';

// import useRecorder from '../../utils/useRecorder';
import {captureRef} from 'react-native-view-shot';
import * as AudioRecorderPlayerPkg from 'react-native-audio-recorder-player';
const AudioRecorderPlayer =
  AudioRecorderPlayerPkg.default || AudioRecorderPlayerPkg;
const audioRecorderPlayer =
  typeof AudioRecorderPlayer === 'function'
    ? new AudioRecorderPlayer()
    : AudioRecorderPlayer;
const ActivityReport = ({navigation}) => {
  //GQR-67
  const today = new Date();

  // 7 days ago
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(today.getDate() - 10);
  const {
    loginUser_data,
    LoadingScreen,
    CustomHeader,
    t,
    AlertMesg,
    onBackPress,
    getItem,
    setItem,
    logoImage,
    topBanner,
    Root,
    Toast,
    SPSheet,
    DeviceInfo,
    effective_dates,
    FormsTitle,
    RadioForm,
    InputTextForm,
    DropdownForm,
    ButtonForm,
    DatePickerComp,
    isOnline,
    farmerData,
    coords,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  const [minimumSeletedDate, setMinimumSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [showingMenu, setShowingMenu] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  // const [farmerData, setfarmerData] = useState([]);
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [farmerID, setfarmerID] = useState();
  const [plotAll, setplotAll] = useState([]);
  const [productionStageAll, setproductionStageAll] = useState([]);
  const [activityTypeAll, setactivityTypeAll] = useState([]);
  const [activityInfoAll, setActivityInfoAll] = useState([]);
  const [overdueAct, setOverdueAct] = useState([]);
  const [lastAct, setLastAct] = useState();
  const [upcomingAct, setUpcomingAct] = useState();
  const [singlePlot, setsinglePlot] = useState({});
  const [CropType, setCropType] = useState();
  const [CropName, setCropName] = useState();
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [newFromDate, setnewFromDate] = useState(new Date());
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
    plot_Name: '',
    crop_name: '',
    crop_variety: '',
    cycle_start_date: '',
    growth_stage: '',
    act_perform_date: '',
    cu_rel_id: '',
    cycle_start_date: '',
    act_master_id: '',
  });
  const [nameVarityStartEnd, setNameVarityStartEnd] = useState({
    name: '',
    varity: '',
    cycleStarts: '',
    cycleEnd: '',
  });
  // const [myphoto, setmyPhoto] = useState(null);
  const [myphotoAll, setmyPhotoAll] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
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
  const [outofRange, setOutofRange] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [tempText, setTempText] = useState('');
  const watermarkViewRef = useRef(null);
  const openImagePicker = item => {
    try {
      const options = {
        mediaType: 'photo',
        includeBase64: true,
        maxHeight: 800,
        maxWidth: 800,
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
          try {
            const timestamp = Date.now();
            let imageUri = response.uri || response.assets?.[0]?.uri;
            const watermarkText = `${saveData.latitude},${
              saveData.longitude
            },${new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }).format(timestamp)}`;
            setTempImage(imageUri);
            setTempText(watermarkText);
            setTimeout(async () => {
              try {
                const uri = await captureRef(watermarkViewRef, {
                  format: 'jpg',
                  quality: 2,
                  width: 800,
                  height: 800,
                });
                const fileName =
                  response.assets[0].fileName || `photo_${timestamp}.jpg`;
                const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
                await RNFS.copyFile(uri, destPath);
                const path = destPath;
                console.log('fileName', fileName);
                setTempImage(null);
                setTempText('');
                setSelectedImage({
                  ...selectedImage,
                  [item]: `file://${path}`,
                });
                const newPhoto = {
                  uri: `file://${path}`,
                  type: 'image/jpeg',
                  name: `${fileName}`,
                };
                addPhoto(newPhoto);
                console.log('Watermarked image saved:', path);
              } catch (error) {
                console.log('Capture Error:', error);
                setTempImage(null);
                setTempText('');
              }
            }, 500);
          } catch (error) {
            console.log('Watermark Error:', error);
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleDatePicker = async item => {
    const effective_date = effective_dates(item);
    setCycleStartDate(effective_date);
  };
  const handleDatePicker2 = item => {
    const effective_date = effective_dates(item);
    setActivityPreFormDate(effective_date);
    setSaveData({...saveData, act_perform_date: effective_date});
  };
  const handleResultSelect = async item => {
    setIsLoading(true);
    const {label: name, value: currentfarmerId, phone} = item || {};
    setSearchFarmerPhone(phone);
    setSelectedName(name);
    setSearchFarmerName(name);
    setSearchResults([]);
    setfarmerID(currentfarmerId);
    setSaveData({...saveData, plot_id: '', plot_Name: ''});
    setNameVarityStartEnd({
      ...nameVarityStartEnd,
      name: '',
      varity: '',
      cycleStarts: '',
      cycleEnd: '',
    });
    if (isOnline) {
      var response = await axiosGet(
        ROUTES.GET.PROBLEM_PLOT_AGAINST_FARMER({
          farmerID: currentfarmerId,
        }),
        token,
        {information: `${dbname},${lan_id}`},
      );
      // plotAgainstFarmerAPI(
      //   dbname,
      //   lan_id,
      //   token,
      //   currentfarmerId,
      // );
      await setItem('plotAgainstFarmer' + currentfarmerId, response);
    } else {
      var response = await getItem('plotAgainstFarmer' + currentfarmerId);
    }
    if (response) {
      const dataArray = response?.data?.data.map(data => ({
        value: data.rel_id,
        label: data.plot_no,
      }));
      setplotAll(dataArray);
      if (isOnline) {
        // var activityType_res = await axiosGet(
        //   ROUTES.GET.ACTIVITY_TYPE_AWD(),
        //   '',
        //   {information: `${dbname},${lan_id},${currentfarmerId}`},
        // );
        var activityType_res = await activityTypeAPI(
          dbname,
          lan_id,
          currentfarmerId,
        );
        await setItem('activityType' + currentfarmerId, activityType_res);
      } else {
        var activityType_res = await getItem('activityType' + currentfarmerId);
      }
      if (activityType_res) {
        const dataArray = activityType_res?.data?.data?.rows.map(data => ({
          value: data.fid,
          label: data?.categoryName,
        }));
        setactivityTypeAll(dataArray);
      }
    }
    setIsLoading(false);
  };

  const handlePlot = async relId => {
    const {latitude, longitude} = coords || {};
    setIsLoading(true);
    try {
      if (isOnline) {
        var response = await axiosGet(
          ROUTES.GET.PROBLEM_PRODUCE_AGAINST_PLOT({
            relID: relId.value,
          }),
          '',
          {
            information: `${dbname},${lan_id},${farmerID}`,
          },
        );
        // produceAgainstPlotAPI(
        //   dbname,
        //   lan_id,
        //   farmerID,
        //   relId.value,
        // );
        await setItem('produceAgainstPlot' + farmerID + relId.value, response);
      } else {
        var response = await getItem(
          'produceAgainstPlot' + farmerID + relId.value,
        );
      }
      // const { latitude, longitude } = await getCurrentLocation() || {};

      const latandlongArr =
        response?.data?.data?.land_info?.agri_land_user_latlongs?.map(
          (_data, _index) => ({
            longitude: _data.longitude,
            latitude: _data.latitude,
          }),
        );
      if (latandlongArr.length != 0) {
        const is20Meters = isWithin20Meters(
          {latitude, longitude},
          latandlongArr,
          20,
        );
        if (is20Meters.length != 0) {
          console.log('User is inside the polygon.');
          setOutofRange(false);
        } else {
          setOutofRange(true);
          console.log('User is outside the polygon.');
        }
      }
      // console.log('123', response);
      if (response) {
        const dateString = response?.data?.data?.harvesting_date;
        const harvesting_date = new Date(dateString);
        const currentDate = new Date();
        if (harvesting_date > currentDate) {
          const data = response.data.data;
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
          setMinimumSelectedDate(new Date(cycle_start_date));

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
            growth_stage: '',
            act_ref_type: '',
            act_to_date: '',
            act_to_date_label: '',
            act_start_date: '',
            act_ref: '',
            act_master_id: '',
          });
          setsinglePlot(response.data.data);
          setCropType(data.crop_type.fid);
          setCropName(data.crop_name.fid);
          if (isOnline) {
            // var productionStage_res = await productionStageAPI(dbname, lan_id, data.crop_type_id, data.crop_name_id)
            // await setItem('productionStageAPI' + data.crop_type_id + data.crop_type_id, productionStage_res)

            var [productionStage_res, activitySchedule] = await Promise.all([
              axiosGet(
                ROUTES.GET.PRODUCTION_STAGE({
                  languageID: lan_id,
                  cropTypeId: data.crop_type_id,
                  cropNameID: data.crop_name_id,
                }),
                '',
                {information: `${dbname},${lan_id}`},
              ),
              // productionStageAPI(
              //   dbname,
              //   lan_id,
              //   data.crop_type_id,
              //   data.crop_name_id,
              // ),
              axiosGet(
                ROUTES.GET.ACTIVITY_SCHEDULE_API({
                  type: 'user_activity',
                  plotId: relId.value,
                  cropId: data.crop_name_id,
                  cu_rel_id: data.cu_rel_id,
                }),
                token,
                {information: `${dbname},${lan_id}`},
              ),

              // activityScheduleAPI(
              //   dbname,
              //   lan_id,
              //   token,
              //   'user_activity',
              //   relId.value,
              //   data.crop_name_id,
              //   data.cu_rel_id,
              // ),

              //  setItem(
              //    'productionStageAPI' +
              //      data.crop_type_id +
              //      data.crop_type_id,
              //    productionStage_res,
              //  ),
              setLastAct(''),
              setOverdueAct([]),
              setUpcomingAct(''),
            ]);
          } else {
            var productionStage_res = await getItem(
              'productionStageAPI' + data.crop_type_id + data.crop_type_id,
            );
          }
          // console.log('ccc', productionStage_res);
          if (productionStage_res) {
            const dataArray = productionStage_res?.data?.data?.growth_stage.map(
              data => ({
                value: data.growth_stage.fid,
                label: data.growth_stage.name,
              }),
            );
            setproductionStageAll(dataArray);
          }
          // console.log('bbb', activitySchedule);
          if (activitySchedule?.status == 200) {
            if (
              activitySchedule?.data?.data?.lastActivity !== 'No Last Activity'
            ) {
              var lastData =
                activitySchedule.data.data.lastActivity.activityName
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
            //  console.log('sch== ',activitySchedule.data.data);
            if (activitySchedule?.data?.data?.otherActivities.length > 0) {
              activitySchedule?.data?.data?.otherActivities.forEach(function (
                element,
              ) {
                var overdueData;
                if (element?.days_until_start < 0) {
                  overdueData =
                    element.activityName?.categoryName +
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
          setIsLoading(false);
        } else {
          setIsButtonDisabled(false);
          // MessageDialog({ title: 'Importent', message: 'Your previous crop has been harvested Please Add a Crop' })
          setSearchFarmerName('');
          setSearchFarmerPhone('');
          // setplotAll([])
          setModalVisible(true);
          // navigation.navigate('Dashboard');
        }
      }
    } catch (error) {
      console.log('error', error);
      Toast.show({
        text: `${error?.data?.error?.errorMessage}`,
        // text: errorMessage,
        ...AlertMesg[0],
      });
      setIsLoading(false);
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
  const setCycleDate = async () => {
    setIsButtonDisabled(true);
    let save_data = qs.stringify({
      crop_cycl_start_date:
        cycleDtartDate == '' ? saveData.cycle_start_date : cycleDtartDate,
    });
    // const productionStage_res = await setCycleDateAPI(dbname, lan_id, user_id, token, saveData.cu_rel_id, save_data);
    // // console.log(productionStage_res.data)
    // var activitySchedule = activityScheduleAPI(
    //   dbname,
    //   lan_id,
    //   token,
    //   'user_activity',
    //   saveData.plot_id,
    //   saveData.crop_name,
    //   saveData.cu_rel_id,
    // );

    var [setCycleDate, activitySchedule] = await Promise.all([
      setCycleDateAPI(
        dbname,
        lan_id,
        farmerID,
        token,
        saveData.cu_rel_id,
        save_data,
      ),
      axiosGet(
        ROUTES.GET.ACTIVITY_SCHEDULE_API({
          type: 'user_activity',
          plotId: saveData.plot_id,
          cropId: saveData.crop_name,
          cu_rel_id: saveData.cu_rel_id,
        }),
        token,
        {information: `${dbname},${lan_id}`},
      ),
      // activityScheduleAPI(
      //   dbname,
      //   lan_id,
      //   token,
      //   'user_activity',
      //   saveData.plot_id,
      //   saveData.crop_name,
      //   saveData.cu_rel_id,
      // ),
    ]);

    if (activitySchedule.status == 200) {
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
        // console.log(
        //   upcomingActivity?.activityName?.categoryName +
        //     ' (' +
        //     startDateEndDate +
        //     ')',
        // );
      }
    }

    /////
  };
  const validateForm = () => {
    if (!saveData.user_id) {
      Toast.show({
        time: 2,
        text: `${t('please_enter_farmer_name')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!saveData.plot_id) {
      Toast.show({
        time: 2,
        text: `${t('pl_en_plot_name_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!saveData.cycle_start_date) {
      Toast.show({
        time: 2,
        text: `${t('please_select_sowing_date_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!saveData.growth_stage) {
      Toast.show({
        time: 2,
        text: t('please_select_cultiveting_season_first'),
        ...AlertMesg[0],
      });
      return false;
    }
    // if (isButtonDisabled == false) {
    //     Toast.show({
    //         time: 2, text: 'Please set cycle start date', ...AlertMesg[0]
    //     })
    //     return false;
    // }
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
          text: `${t('pls_enter_activity_date')}`,
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
    return true;
  };
  const handleSave = async () => {
    Keyboard.dismiss();
    // if (!outofRange) {
    //   // Toast.show({ text: 'You are out of range', ...AlertMesg[0] });
    //   Alert.alert('You are out of range');
    //   return;
    // }
    if (validateForm()) {
      const formData = new FormData();
      formData.append('act_title', '');
      myphotoAll.forEach(photo => {
        formData.append('photo', photo);
      });
      formData.append('type', 'user_activity');
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
      formData.append('act_master_id', saveData.act_master_id);
      formData.append('cu_rel_fid', saveData.cu_rel_id);

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
      if (isOnline) {
        // const database_res = await axiosPost(
        //   ROUTES.POST.ACTIVITY_SAVE,
        //   formData,
        //   token,
        //   false,
        //   {information: `${dbname},${lan_id},${saveData.user_id}`},
        // );
        const database_res = await activitySaveAPI(
          dbname,
          lan_id,
          token,
          saveData.user_id,
          formData,
        );
        // console.log('Save', database_res);
        if (database_res?.status == 200) {
          AnalyticsLogEvent('activity_report', 'activity_report');
          navigation.popToTop();
          navigation.navigate('activityList', {action: 'addData'});
        } else if (database_res?.status == 409) {
          Toast.show({
            text: database_res?.data?.error?.errorMessage,
            ...AlertMesg[0],
          });
        } else {
          Toast.show({
            text: database_res?.data?.error?.errorMessage,
            ...AlertMesg[0],
          });
        }
      } else {
        formData.append('farmerID', saveData.user_id);
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
        navigation.popToTop();
        navigation.navigate('activityList', {action: 'addData'});
      }
    }
  };
  const handleActivityPattern = item => {
    setactivityInfoReadio({...activityInfoReadio, activityPreFormDate: item});
    setSaveData({...saveData, act_pattern: item});
    if (item === 'schedule') {
      setisActiveMenu(true);
    } else {
      setisActiveMenu(false);
    }
  };
  const handleActivityType = async item => {
    let dataArray = [];
    if (isOnline) {
      var response = await axiosGet(
        ROUTES.GET.ACTIVITY_INFO({
          cropType: CropType,
          cropName: CropName,
          actTypeID: item.value,
        }),
        token,
        {information: `${dbname},${lan_id},${farmerID}`},
      );
      // activityInfoAPI(
      //   dbname,
      //   lan_id,
      //   token,
      //   farmerID,
      //   CropType,
      //   CropName,
      //   item.value,
      // );
      await setItem(
        'activityInfo' + farmerID + CropType + CropName + item.value,
        response,
      );
    } else {
      var response = await getItem(
        'activityInfo' + farmerID + CropType + CropName + item.value,
      );
    }
    setSaveData({...saveData, act_ref_type: item.value});
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
        sdate.setDate(sdate.getDate() + element.days_from);
        const smonth = monthNames[sdate.getMonth()];
        const sday = sdate.getDate();
        const syear = sdate.getFullYear();
        const startDate = `${smonth} ${sday}, ${syear}`;
        const edate = new Date(cycleDate);
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
          label:
            element?.activity?.categoryName + ' (' + startDateEndDate + ')',
          act_master_id: element?.act_master_id,
        });
      });
      if (isButtonDisabled) {
        setActivityInfoAll(dataArray);
      }
    }
  };
  const handleActivityInfo = async item => {
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
      act_to_date: act_to_date,
      act_to_date_label: item.label,
      act_start_date: act_start_date,
      act_ref: item.value,
      act_master_id: item?.act_master_id,
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
  const onPageLoad = async () => {
    requestLivePermission();
  };

  useEffect(() => {
    onPageLoad();
  }, []);
  const handleHarvested = async data => {
    if (data == 'Yes') {
      navigation.navigate('activityList');
    } else {
      navigation.navigate('Dashboard');
    }
  };
  const handleRecord = item => {
    // setModalVisibleRecord(true);
  };
  const onStartRecordFirstItem = async () => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/firstItem.mp3`;
      await RNFS.mkdir(RNFS.DocumentDirectoryPath);
      await audioRecorderPlayer.startRecorder(path);

      audioRecorderPlayer.addRecordBackListener(async e => {
        setSoundRecordFirstItem({
          isLoggingIn: true,
          recordSecs: e.currentPosition,
          recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
        });

        if (e.currentPosition >= 60000) {
          await onStopRecordFirstItem();
          setModalVisibleRecordFirstItem(false);
        }
      });
    } catch (error) {
      console.error('Error starting recorder (first):', error);
    }
  };

  const onStopRecordFirstItem = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setSoundRecordFirstItem({
        isLoggingIn: false,
        recordSecs: 0,
        recordTime: '00:00:00',
        result,
      });
      console.log('Recording stopped (first):', result);
    } catch (error) {
      console.error('Error stopping recorder (first):', error);
    }
  };

  // ✅ SECOND RECORD
  const onStartRecordSecoundItem = async () => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/secoundItem.mp3`;
      await RNFS.mkdir(RNFS.DocumentDirectoryPath);
      await audioRecorderPlayer.startRecorder(path);

      audioRecorderPlayer.addRecordBackListener(async e => {
        setSoundRecordSecoundItem({
          isLoggingIn: true,
          recordSecs: e.currentPosition,
          recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
        });

        if (e.currentPosition >= 60000) {
          await onStopRecordSecoundItem();
          setModalVisibleRecordSecoundItem(false);
        }
      });
    } catch (error) {
      console.error('Error starting recorder (second):', error);
    }
  };

  const onStopRecordSecoundItem = useCallback(async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setSoundRecordSecoundItem({
        isLoggingIn: false,
        recordSecs: 0,
        recordTime: '00:00:00',
        result,
      });
      console.log('Recording stopped (second):', result);
    } catch (error) {
      console.error('Error stopping recorder (second):', error);
    }
  }, []);

  // ✅ THIRD RECORD
  const onStartRecordThirdItem = async () => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/thirdItem.mp3`;
      await RNFS.mkdir(RNFS.DocumentDirectoryPath);
      await audioRecorderPlayer.startRecorder(path);

      audioRecorderPlayer.addRecordBackListener(async e => {
        setSoundRecordThirdItem({
          isLoggingIn: true,
          recordSecs: e.currentPosition,
          recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
        });

        if (e.currentPosition >= 60000) {
          await onStopRecordThirdItem();
          setModalVisibleRecordThirdItem(false);
        }
      });
    } catch (error) {
      console.error('Error starting recorder (third):', error);
    }
  };

  const onStopRecordThirdItem = useCallback(async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setSoundRecordThirdItem({
        isLoggingIn: false,
        recordSecs: 0,
        recordTime: '00:00:00',
        result,
      });
      console.log('Recording stopped (third):', result);
    } catch (error) {
      console.error('Error stopping recorder (third):', error);
    }
  }, []);

  // ✅ CANCEL RECORD
  const cancelRecord = async item => {
    try {
      await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();

      if (item === 'firstItem') {
        setSoundRecordFirstItem({
          isLoggingIn: false,
          recordSecs: 0,
          recordTime: '00:00:00',
          result: '',
        });
      } else if (item === 'secoundItem') {
        setSoundRecordSecoundItem({
          isLoggingIn: false,
          recordSecs: 0,
          recordTime: '00:00:00',
          result: '',
        });
      } else if (item === 'thirdItem') {
        setSoundRecordThirdItem({
          isLoggingIn: false,
          recordSecs: 0,
          recordTime: '00:00:00',
          result: '',
        });
      }
    } catch (error) {
      console.error('Error cancelling record:', error);
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
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        <>
          <View style={styles.container}>
            <CustomHeader
              path="activityList"
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
            {modalVisible && (
              <HarvestedModel
                setModalVisible={setModalVisible}
                modalVisible={modalVisible}
                handleHarvested={handleHarvested}
              />
            )}
            <ScrollView>
              {isLoading && (
                <View style={styles.loadingScreen}>
                  <LoadingScreen />
                </View>
              )}
              <View style={styles.fromContainer}>
                <DropdownForm
                  label={t('farmer_name')}
                  data={farmerData?.[0]}
                  required={true}
                  onChange={relId => handleResultSelect(relId)}
                  val={searchFarmerName}
                />
                <InputTextForm
                  label={t('farmer_number')}
                  required={true}
                  value={searchFarmerPhone}
                  editable={false}
                />
                <DropdownForm
                  label={t('select_plot')}
                  data={plotAll}
                  required={true}
                  onChange={relId => handlePlot(relId)}
                  val={saveData.plot_Name}
                />
                {showingMenu ? (
                  nameVarityStartEnd.name != '' ? (
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
                          {nameVarityStartEnd.varity.substring(0, 12)}
                        </Text>
                      </View>
                      <View style={styles.plotSiteContainerItem}>
                        <Text style={styles.label}>{t('showing_date')}</Text>
                        <Text style={styles.value}>
                          {formatDateToMMDDYYYY(nameVarityStartEnd.cycleStarts)}
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
                  ) : null
                ) : null}
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
                  val={saveData.growth_stage}
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
                <View style={styles.activityPattern}>
                  <Text style={styles.title}>{t('activity_pattern')}</Text>
                  <RadioForm
                    label={t('schedule')}
                    selected={
                      activityInfoReadio.activityPreFormDate === 'schedule'
                    }
                    onSelect={() => handleActivityPattern('schedule')}
                  />
                  <RadioForm
                    label={t('regular')}
                    selected={
                      activityInfoReadio.activityPreFormDate === 'regular'
                    }
                    onSelect={() => handleActivityPattern('regular')}
                  />
                </View>
                {isActiveMenu ? (
                  <>
                    <DropdownForm
                      label={t('activity_type')}
                      required={true}
                      data={activityTypeAll}
                      onChange={item => handleActivityType(item)}
                      val={saveData.act_ref_type}
                    />
                    <DropdownForm
                      label={t('select_activity')}
                      required={true}
                      data={activityInfoAll}
                      onChange={item => handleActivityInfo(item)}
                      val={saveData.act_to_date_label}
                    />

                    {lastAct ? (
                      <View style={styles.plotSiteContainer}>
                        <View style={styles.detailRow}>
                          <Text style={styles.label}>Last activity</Text>
                          <Text style={styles.value1}>{lastAct}</Text>
                        </View>
                      </View>
                    ) : null}

                    {upcomingAct ? (
                      <View style={styles.plotSiteContainer}>
                        <View style={styles.detailRow}>
                          <Text style={styles.label}>Upcoming activity</Text>
                          <Text style={styles.value1}>
                            {/* {upcomingAct.activityName.categoryName +
                              ' (' +
                              formatDate(upcomingAct.activity_start_date) +
                              ' - ' +
                              formatDate(upcomingAct.activity_end_date) +
                              ')'} */}
                            {upcomingAct}
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {overdueAct?.length > 0 ? (
                      <View style={styles.plotSiteContainer}>
                        <View style={styles.detailRow}>
                          <Text style={styles.label}>Overdue Activities</Text>
                          {overdueAct.map((act, index) => (
                            <Text key={index} style={styles.value1}>
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

                        {/* {overdueAct.map((act, index) => ( */}
                        {/* <View style={styles.plotSiteContainerItem}>
                           
                          </View> */}
                      </View>
                    ) : null}
                  </>
                ) : (
                  ''
                )}

                <View style={{marginBottom: 15, marginTop: 10}}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                      <View style={styles.watermarkTextContainer}>
                        <Text style={styles.watermarkText}>{tempText}</Text>
                      </View>
                    </View>
                  )}
                </View>
                <TakePhoto
                  openImagePicker={openImagePicker}
                  selectedImage={selectedImage}
                  title={t('take_a_photo_optional')}
                />
                <RecordComp
                  selectedRecord={selectedRecord}
                  onPress={handleRecord}
                  setModalVisibleRecordFirstItem={
                    setModalVisibleRecordFirstItem
                  }
                  setModalVisibleRecordSecoundItem={
                    setModalVisibleRecordSecoundItem
                  }
                  setModalVisibleRecordThirdItem={
                    setModalVisibleRecordThirdItem
                  }
                  soundRecordFirstItem={soundRecordFirstItem}
                  soundRecordSecoundItem={soundRecordSecoundItem}
                  soundRecordThirdItem={soundRecordThirdItem}
                  title={t('record_your_comment_optional')}
                  cancelRecord={cancelRecord}
                  soundPlay={soundPlay}
                />
              </View>
            </ScrollView>
            <View style={{marginTop: 10}}>
              <ButtonForm
                label={t('submit')}
                onPress={() => handleSave()}
                loading={isLoading}
              />
            </View>
          </View>
        </>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};
export default ActivityReport;
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
    fontFamily: Fonts.Regular,
    fontSize: 15,
    color: Colors.text,
  },
  titleDate: {
    fontFamily: Fonts.Regular,

    fontSize: 12,
    color: Colors.text,
  },
  fromContainer: {
    flex: 1,
    backgroundColor: 'white',
    // padding: 10,

    padding: 20,
    // marginHorizontal: 16,
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
  requiredStar: {
    color: 'red',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
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
  value1: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    // flex: 1,
    // textAlign: 'right',
    marginBottom: 10,
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
