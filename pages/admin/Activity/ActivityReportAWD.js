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
  Linking,
  InteractionManager,
} from 'react-native';
import {PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  useRef,
  useMemo,
} from 'react';
import {launchCamera} from 'react-native-image-picker';
import {
  inputOutputRoutePipeImagesLatLong,
  activityInfoAPI,
  activitySaveAPI,
  addUserPipeActivity,
  getUniquePipeNames,
  addPrevPipeActivity,
  activityTypeAPIAWD,
  farmerByNameAPI,
  plotAgainstFarmerAPI,
  produceAgainstPlotAPI,
  productionStageAPI,
  setCycleDateAPI,
  PipeListDetails,
  inputOutputRoutePipeImages,
  activityScheduleAPI,
  problemProduceAgainstPlotAPI,
  problemProductionStageAPI,
} from '../../../config/apiHere';
import {formatDateToMMDDYYYY} from '../../Common/DateChanger';
import HarvestedModel from '../../Common/HarvestedModel';
import SoundRecord from '../../Common/SoundRecord';
import RNFS from 'react-native-fs';
import CustomAlert from '../../Common/CustomAlert';
import * as AudioRecorderPlayerPkg from 'react-native-audio-recorder-player';
const AudioRecorderPlayer =
  AudioRecorderPlayerPkg.default || AudioRecorderPlayerPkg;
const audioRecorderPlayer =
  typeof AudioRecorderPlayer === 'function'
    ? new AudioRecorderPlayer()
    : AudioRecorderPlayer;
const qs = require('qs');
import AudioPlayerView from '../../Common/AudioPlayerView';
import {userCreateContext} from '../../Context/usersCreateContext';
import {AnalyticsLogEvent} from '../../Analytics';
import {isPointInPolygon, getDistance} from 'geolib';
import TakePhotoPipe from '../../Common/TakePhotoPipe';
import ActivityMap from '../../Common/ActivityMap';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {CrashlyticsRecordError} from '../../Crashlytics/CrashlyticsRecordError';
import MyErrorBoundary from '../../Common/MyErrorBoundary';
import {Colors, Fronts} from '../../utils/Constants';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {use} from 'i18next';
import {axiosGet, axiosPost} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
import {captureRef} from 'react-native-view-shot';
import {getHighAccuracyLocation} from '../../utils/getHighAccuracyLocation';
import {showAIValidationError} from '../../utils/showAIValidationError';
import SecurityWrapper from '../../SecurityCheck/SecurityWrapper';
import PipeDetailsCard from '../../../Components/PipeDetailsCard';
import {isWithin20Meters} from '../../Common/calculateAreaFun';
import ScannerModal from '../../Common/ScannerModal';
import {Camera} from 'react-native-vision-camera';
import {getItem, removeItem} from '../../../config/getDataFromStorage';
const ActivityReportAWD = ({navigation}) => {
  const isScanningRef = useRef(false);
  const lastScannedRef = useRef(null);
  //GQR-67
  const {
    loginUser_data,
    LoadingScreen,
    CustomHeader,
    t,
    AlertMesg,
    getItem,
    setItem,
    logoImage,
    topBanner,
    Root,
    Toast,
    SPSheet,
    DeviceInfo,
    effective_dates,
    InputTextForm,
    DropdownForm,
    ButtonForm,
    DatePickerComp,
    isOnline,
    coords,
    farmerData,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  // const { pageNo } = dbLanTokUsr;
  //GQR-67
  const [isAfterToday, setIsAfterToday] = useState(false);
  const today = new Date();

  // 7 days ago
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(today.getDate() - 10);

  const [minimumSelectableDate, setMinimumSelectableDate] = useState(
    new Date(),
  );

  const [isLoading, setIsLoading] = useState(false);
  const [showingMenu, setShowingMenu] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [searchFarmerName, setSearchFarmerName] = useState({
    label: '',
    value: '',
    phone: '',
  });
  const [dafaultLatLon, setDefaultLatLon] = useState({
    latitude: 22.15454,
    longitude: 22.515451,
    accuracy: 5,
  });
  const [farmerID, setFarmerID] = useState();
  const [plotAll, setPlotAll] = useState([]);
  const [productionStageAll, setProductionStageAll] = useState([]);
  const [activityTypeAll, setActivityTypeAll] = useState([]);
  const [activityInfoAll, setActivityInfoAll] = useState([]);
  const [singlePlot, setsinglePlot] = useState({});
  const [CropType, setCropType] = useState();
  const [CropName, setCropName] = useState();
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [cycleStartDate, srtCycleStartDate] = useState(false);
  const [activityPreDate, setActivityPreDate] = useState(false);
  const [scan, setScan] = useState(false);
  const [cycleDtartDate, setCycleStartDate] = useState('');
  const [pipeQR, setPipeQR] = useState(0);
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
  const [replaceImgKey, setReplaceImgKey] = useState({
    arrayPosition: '',
    imgPosition: '',
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
    act_pattern: 'schedule',
    user_id: '',
    plot_id: '',
    plot_Name: '',
    crop_name: '',
    crop_variety: '',
    growth_stage: '',
    act_perform_date: '',
    cu_rel_id: '',
    cycle_start_date: '',
    act_master_id: '',
    field_type: '',
  });
  const [nameVarityStartEnd, setNameVarityStartEnd] = useState({
    name: '',
    varity: '',
    cycleStarts: '',
    cycleEnd: '',
    productionSeasonSdId: '',
  });
  // const [myphoto, setmyPhoto] = useState(null);
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
  const [outofRangeCheck, setOutofRangeCheck] = useState(false);
  const [pipeLatLong, setPipeLatLong] = useState([]);
  const [overdueAct, setOverdueAct] = useState([]);
  const [lastAct, setLastAct] = useState();
  const [minDateAct, setMinDateAct] = useState(true);
  const [minDateGap, setMinDateGap] = useState();
  const [lastPerfromedDate, setLastPerfromedDate] = useState('');
  const [newPerFromDate, setNewPerFromDate] = useState('');
  const [upcomingAct, setUpcomingAct] = useState('');

  const [scheduleInfo, setScheduleInfo] = useState({
    lastAct: '',
    upcomingAct: '',
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

  const minimumActivityDate = useMemo(() => {
    if (!minDateGap) return null;

    // const date = new Date();
    const date = new Date(lastPerfromedDate);

    date.setDate(date.getDate() + minDateGap);
    // date.setDate(date.getDate() - minDateGap);
    return date;
  }, [minDateGap]);
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
      if (allPipes.length === 0) {
        console.log('No existing pipe');
        return true;
      }

      for (const existingPipe of allPipes) {
        const distance = getDistance(
          {latitude: lat, longitude: lon},
          {latitude: existingPipe.latitude, longitude: existingPipe.longitude},
        );

        // if (distance < 20) {
        //   Alert.alert(
        //     'Too Close!',
        //     `Move at least 20 meters away from existing Pipe "${existingPipe.name}".`,
        //     [{text: 'OK', style: 'cancel'}],
        //   );
        //   return false;
        // }
      }
      return true;
    } catch (error) {
      console.log('Error in checkPipeDistance:', error);
      return true; // Allow proceeding if there's an error
    }
  };
  const requestCameraPermission = async () => {
    const result = await request(
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA,
    );

    if (result !== RESULTS.GRANTED) {
      CustomAlert(
        'Permission Denied',
        'Camera permission is required',
        true,
        'OK',
      );
      return false;
    }
    return true;
  };
  const handleDatePicker = async item => {
    const effective_date = effective_dates(item);
    setCycleStartDate(effective_date);
  };
  const handleDatePicker2 = item => {
    setNewPerFromDate(item);
    const effective_date = effective_dates(item);
    setActivityPreFormDate(effective_date);
    setSaveData({...saveData, act_perform_date: effective_date});
  };
  const handleResultSelect = useCallback(
    async item => {
      setIsLoading(true);
      const {label: name, value: currentfarmerId, phone} = item || {};
      // setSearchFarmerPhone(phone);
      // setSelectedName(name);
      // setSearchFarmerName(name);
      // setSearchResults([]);
      setShowingMenu(false);
      setSearchFarmerName(prev => ({
        ...prev,
        label: name,
        value: currentfarmerId,
        phone,
      }));
      setFarmerID(currentfarmerId);
      setSaveData({...saveData, plot_id: '', plot_Name: ''});
      setNameVarityStartEnd({
        ...nameVarityStartEnd,
        name: '',
        varity: '',
        cycleStarts: '',
        cycleEnd: '',
        productionSeasonSdId: '',
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
        setPlotAll(dataArray);
        if (isOnline) {
          var activityType_res = await axiosGet(
            ROUTES.GET.ACTIVITY_TYPE_AWD(),
            '',
            {information: `${dbname},${lan_id},${currentfarmerId}`},
          );
          // activityTypeAPIAWD(
          //   dbname,
          //   lan_id,
          //   currentfarmerId,
          // );
          await setItem('activityType' + currentfarmerId, activityType_res);
        } else {
          var activityType_res = await getItem(
            'activityType' + currentfarmerId,
          );
        }
        if (activityType_res?.status == 200) {
          const dataArray = activityType_res?.data?.data?.rows.map(data => ({
            value: data.fid,
            label: data.categoryName,
            field_type: data.field_type,
          }));
          setActivityTypeAll(dataArray);
        }
      }
      setIsLoading(false);
    },
    [isOnline],
  );
  const handlePlot = useCallback(
    async relId => {
      try {
        const {latitude, longitude} = coords || {};
        var latlong;
        if (latitude == '' && longitude == '') {
          latlong = await getHighAccuracyLocation();
        }
        const lat = latitude === '' ? latlong.latitude : latitude;
        const lon = longitude === '' ? latlong.longitude : longitude;
        setIsLoading(true);
        if (isOnline) {
          var [response] = await Promise.all([
            axiosGet(
              ROUTES.GET.PROBLEM_PRODUCE_AGAINST_PLOT({
                relID: relId.value,
              }),
              '',
              {
                information: `${dbname},${lan_id},${farmerID}`,
              },
            ),
            // produceAgainstPlotAPI(dbname, lan_id, farmerID, relId.value),
          ]);
          await setItem(
            'produceAgainstPlot' + farmerID + relId.value,
            response,
          );
        } else {
          var response = await getItem(
            'produceAgainstPlot' + farmerID + relId.value,
          );
        }
        if (response) {
          if (
            response?.data?.data?.land_info?.agri_land_user_latlongs.length > 2
          ) {
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
          const latandlongArr =
            response?.data?.data?.land_info?.agri_land_user_latlongs?.map(
              (_data, _index) => ({
                longitude: parseFloat(_data.longitude),
                latitude: parseFloat(_data.latitude),
              }),
            );
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
            setMinimumSelectableDate(new Date(cycle_start_date));
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
              // cycle_start_date: cycle_start_date,
              cu_rel_id: data.cu_rel_id,
              cycle_start_date: cycle_start_date,
              crop_season: data?.crop_season?.fid,
              latitude: lat,
              longitude: lon,
              growth_stage: '',
              act_ref_type: '',
              act_to_date: '',
              act_to_date_label: '',
              act_start_date: '',
              act_ref: '',
              act_master_id: '',
              field_type: '',
            }));
            // setsinglePlot(response.data.data.rows);
            setCropType(data.crop_type.fid);
            setCropName(data.crop_name.fid);
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
            if (isOnline) {
              var [productionStage_res, activitySchedule, pipeLatLongRes] =
                await Promise.all([
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
                      type: 'carbon_activity',
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
                  //   'carbon_activity',
                  //   relId.value,
                  //   data.crop_name_id,
                  //   data.cu_rel_id,
                  // ),

                  axiosGet(
                    ROUTES.GET.INPUT_OUTPUT_ROUTE_PIPE_IMG_LAT_LONG({
                      plot_fid: relId.value,
                      cropfid: data.crop_name.fid,
                      cu_rel_id: data.cu_rel_id,
                    }),
                    '',
                    {information: `${dbname},${lan_id},${farmerID}`},
                  ),
                  // inputOutputRoutePipeImagesLatLong(
                  //   dbname,
                  //   lan_id,
                  //   farmerID,
                  //   relId.value,
                  //   data.crop_name.fid,
                  //   data.cu_rel_id,
                  // ),
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
              const dataArray =
                productionStage_res?.data?.data?.growth_stage.map(data => ({
                  value: data.growth_stage.fid,
                  label: data.growth_stage.name,
                }));
              setProductionStageAll(dataArray);
            }
            if (activitySchedule.status == 200) {
              setIsLoading(false);
              console.log(
                'Last Activity=',
                JSON.stringify(activitySchedule?.data?.data),
              );
              if (
                activitySchedule?.data?.data?.lastActivity !==
                'No Last Activity'
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
                // setLastPerfromedDate(
                //   activitySchedule?.data?.data?.lastActivity?.act_perform_date,
                // );
                // checkDate(
                //   activitySchedule?.data?.data?.lastActivity?.act_perform_date,
                // );
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
                  sdate.setDate(sdate.getDate() + upcomingActivity?.days_from);
                  const smonth = monthNames[sdate.getMonth()];
                  const sday = sdate.getDate();
                  const syear = sdate.getFullYear();
                  const startDate = `${smonth} ${sday}, ${syear}`;
                  const edate = new Date(cycleDate);
                  edate.setDate(edate.getDate() + upcomingActivity?.days_to);
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
            setIsLoading(false);
          } else {
            setIsButtonDisabled(false);
            // MessageDialog({ title: 'Importent', message: 'Your previous crop has been harvested Please Add a Crop' })
            setSearchFarmerName(prev => ({
              ...prev,
              label: '',
              value: '',
              phone: '',
            }));
            // setplotAll([])
            setModalVisible(true);
          }
        }
        if (pipeLatLongRes?.status == 200) {
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
      } catch (error) {
        CrashlyticsRecordError(error, 'ActivityReportAWD', 'handlePlot');
        console.log(error);
      }
    },
    [farmerID],
  );

  const checkDate = minDateGap => {
    const today = new Date();

    // subtract 10 days from today minDateGap
    const tenDaysBefore = new Date(today);
    tenDaysBefore.setDate(today.getDate() - 10);

    // given date string
    const compareDate = new Date(lastPerfromedDate);

    compareDate.setDate(compareDate.getDate() + minDateGap);

    if (tenDaysBefore > compareDate) {
      tenDaysAgo.setDate(compareDate);
      console.log(
        'Today - 10 days is GREATER than 2026-02-02',
        compareDate,
        tenDaysBefore,
      );
    } else {
      tenDaysAgo.setDate(compareDate);
      console.log(
        'Today - 10 days is NOT greater than 2026-02-02',
        compareDate,
        tenDaysBefore,
      );
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
  // const setCycleDate = async () => {
  //   try {
  //     setIsButtonDisabled(true);
  //     setOverdueAct([]);
  //     let save_data = qs.stringify({
  //       crop_cycl_start_date:
  //         cycleDtartDate == '' ? saveData.cycle_start_date : cycleDtartDate,
  //     });
  //     // const productionStage_res = await setCycleDateAPI(dbname, lan_id, user_id, token, saveData.cu_rel_id, save_data);
  //     // var activitySchedule = activityScheduleAPI(
  //     //   dbname,
  //     //   lan_id,
  //     //   token,
  //     //   'carbon_activity',
  //     //   saveData.plot_id,
  //     //   saveData.crop_name,
  //     //   saveData.cu_rel_id,
  //     // );
  //     var [
  //       // setCycleDate,
  //       activitySchedule,
  //     ] = await Promise.all([
  //       // setCycleDateAPI(
  //       //   dbname,
  //       //   lan_id,
  //       //   farmerID,
  //       //   token,
  //       //   saveData.cu_rel_id,
  //       //   save_data,
  //       // ),
  //       axiosGet(
  //         ROUTES.GET.ACTIVITY_SCHEDULE_API({
  //           type: 'carbon_activity',
  //           plotId: saveData.plot_id,
  //           cropId: saveData.crop_name,
  //           cu_rel_id: saveData.cu_rel_id,
  //         }),
  //         token,
  //         { information: `${dbname},${lan_id}` },
  //       ),
  //       // activityScheduleAPI(
  //       //   dbname,
  //       //   lan_id,
  //       //   token,
  //       //   'carbon_activity',
  //       //   saveData.plot_id,
  //       //   saveData.crop_name,
  //       //   saveData.cu_rel_id,
  //       // ),
  //     ]);
  //     if (activitySchedule.status == 200) {
  //       if (activitySchedule?.data?.data?.lastActivity !== 'No Last Activity') {
  //         var lastData =
  //           activitySchedule?.data?.data?.lastActivity?.activityName
  //             ?.categoryName +
  //           ' (' +
  //           formatDate(
  //             activitySchedule?.data?.data?.lastActivity?.act_start_date,
  //           ) +
  //           ' - ' +
  //           formatDate(
  //             activitySchedule?.data?.data?.lastActivity?.act_to_date,
  //           ) +
  //           ')';

  //         setLastAct(lastData);
  //       }

  //       if (activitySchedule?.data?.data?.otherActivities.length > 0) {
  //         activitySchedule?.data?.data?.otherActivities.forEach(function (
  //           element,
  //         ) {
  //           var overdueData;
  //           if (element?.days_until_start < 0) {
  //             overdueData =
  //               element?.activityName.categoryName +
  //               ' (' +
  //               formatDate(element?.activity_start_date) +
  //               ' - ' +
  //               formatDate(element?.activity_end_date) +
  //               ')';
  //             //  console.log("00",overdueData);
  //             setOverdueAct(prevItems => [...prevItems, overdueData]);
  //           }
  //           // setOverdueAct(prevItems => [...prevItems, overdueData]);
  //         });
  //         const upcomingActivity =
  //           activitySchedule?.data?.data?.otherActivities?.find(
  //             item => item.days_until_start >= 0,
  //           );
  //         // console.log(upcomingActivity.days_from);
  //         if (upcomingActivity != undefined) {
  //           const monthNames = [
  //             'January',
  //             'February',
  //             'March',
  //             'April',
  //             'May',
  //             'June',
  //             'July',
  //             'August',
  //             'September',
  //             'October',
  //             'November',
  //             'December',
  //           ];
  //           const cycleDate =
  //             cycleDtartDate == '' ? saveData.cycle_start_date : cycleDtartDate;
  //           // const cycleDate =
  //           //   data.crop_cycl_start_date == null ||
  //           //   data.crop_cycl_start_date == '2004-02-29'
  //           //     ? data.sowing_date
  //           //     : data.crop_cycl_start_date;

  //           const sdate = new Date(cycleDate);
  //           sdate.setDate(sdate.getDate() + upcomingActivity?.days_from);
  //           const smonth = monthNames[sdate.getMonth()];
  //           const sday = sdate.getDate();
  //           const syear = sdate.getFullYear();
  //           const startDate = `${smonth} ${sday}, ${syear}`;
  //           const edate = new Date(cycleDate);
  //           edate.setDate(edate.getDate() + upcomingActivity?.days_to);
  //           const emonth = monthNames[edate.getMonth()];
  //           const eday = edate.getDate();
  //           const eyear = edate.getFullYear();
  //           const endDate = `${emonth} ${eday}, ${eyear}`;
  //           const startDateEndDate = `${startDate}-${endDate}`;

  //           setUpcomingAct(
  //             upcomingActivity?.activityName?.categoryName +
  //             ' (' +
  //             startDateEndDate +
  //             ')',
  //           );
  //         }
  //         // console.log(
  //         //   upcomingActivity?.activityName?.categoryName +
  //         //     ' (' +
  //         //     startDateEndDate +
  //         //     ')',
  //         // );
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error)
  //     CrashlyticsRecordError(error, 'ActivityReportAWD', 'setCycleDate');
  //   }
  // };
  const setCycleDate = async () => {
    try {
      setIsButtonDisabled(true);
      let save_data = qs.stringify({
        crop_cycl_start_date:
          cycleDtartDate == '' ? saveData.cycle_start_date : cycleDtartDate,
      });
      // const productionStage_res = await setCycleDateAPI(dbname, lan_id, user_id, token, saveData.cu_rel_id, save_data);
      // var activitySchedule = activityScheduleAPI(
      //   dbname,
      //   lan_id,
      //   token,
      //   'carbon_activity',
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
      console.log(
        'Last Activity=',
        JSON.stringify(activitySchedule?.data?.data),
      );
      if (activitySchedule.status == 200) {
        console.log(
          'Last Activity=',
          JSON.stringify(activitySchedule?.data?.data),
        );
        if (activitySchedule?.data?.data?.lastActivity !== 'No Last Activity') {
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
            sdate.setDate(sdate.getDate() + upcomingActivity?.days_from);
            const smonth = monthNames[sdate.getMonth()];
            const sday = sdate.getDate();
            const syear = sdate.getFullYear();
            const startDate = `${smonth} ${sday}, ${syear}`;
            const edate = new Date(cycleDate);
            edate.setDate(edate.getDate() + upcomingActivity?.days_to);
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
    } catch (error) {
      CrashlyticsRecordError(error, 'ActivityReportAWD', 'setCycleDate');
    }
  };
  // const validateForm = () => {
  //   if (!saveData.plot_id) {
  //     Toast.show({
  //       time: 2,
  //       text: t('pl_en_plot_name_first'),
  //       ...AlertMesg[0],
  //     });
  //     return false;
  //   }
  //   if (!saveData.cycle_start_date) {
  //     Toast.show({
  //       time: 2,
  //       text: t('please_select_sowing_date_first'),
  //       ...AlertMesg[0],
  //     });
  //     return false;
  //   }
  //   if (!saveData.growth_stage) {
  //     Toast.show({
  //       time: 2,
  //       text: t('please_select_growth_stage'),
  //       ...AlertMesg[0],
  //     });
  //     return false;
  //   }
  //   if (isButtonDisabled == false) {
  //     Toast.show({
  //       time: 2,
  //       text: t('please_select_sowing_date_first'),
  //       ...AlertMesg[0],
  //     });
  //     return false;
  //   }
  //   if (saveData.act_pattern === 'schedule') {
  //     if (!saveData.act_ref_type) {
  //       Toast.show({
  //         time: 2,
  //         text: t('Please_enter_activity_type'),
  //         ...AlertMesg[0],
  //       });
  //       return false;
  //     }
  //     if (!saveData.act_ref) {
  //       Toast.show({
  //         time: 2,
  //         text: t('Please_enter_activity'),
  //         ...AlertMesg[0],
  //       });
  //       return false;
  //     }
  //   }

  //   if (saveData.field_type == 'add') {
  //     if (pipeDetails.length == 0) {
  //       Toast.show({
  //         time: 2,
  //         text: t('Please add pipe properly'),
  //         ...AlertMesg[0],
  //       });
  //       return false;
  //     }
  //   }
  //   if (saveData.field_type == 'select') {
  //     if (selectPipeList.value == '') {
  //       Toast.show({
  //         time: 2,
  //         text: t('Please select pipe'),
  //         ...AlertMesg[0],
  //       });
  //       return false;
  //     }
  //     if (
  //       selectedImagePipe?.firstItem == '' ||
  //       selectedImagePipe?.secondItem == ''
  //     ) {
  //       Toast.show({
  //         time: 2,
  //         text: t('Please enter pipe image'),
  //         ...AlertMesg[0],
  //       });
  //       return false;
  //     }
  //   }
  //   if (!saveData.act_perform_date) {
  //     Toast.show({
  //       time: 2,
  //       text: t('Please_enter_perform_date'),
  //       ...AlertMesg[0],
  //     });
  //     return false;
  //   }
  //   if (!saveData.latitude) {
  //     Toast.show({
  //       time: 2,
  //       text: t('gpsalertdialogmessage'),
  //       ...AlertMesg[0],
  //     });
  //     return false;
  //   }
  //   if (!cycleDtartDate && !isButtonDisabled) {
  //     Toast.show({ text: t('please_select_sowing_date_first'), ...AlertMesg[0] });
  //     return false;
  //   }

  //   if (!isGeoFence) {
  //     Toast.show({ text: 'Plot is not geofenced ', ...AlertMesg[0] });

  //     return;
  //   }
  //   if (!outofRangeCheck) {
  //     Toast.show({ text: 'You are out of range', ...AlertMesg[0] });

  //     return;
  //   }
  //   return true;
  // };
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
      if (pipeDetails.length == 0) {
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
        text: t('gps alert dialog message'),
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
      // Alert.alert('You are out of range');
      return;
    }
    if (!outofRangeCheck) {
      Toast.show({text: 'You are out of range', ...AlertMesg[0]});
      // Alert.alert('You are out of range');
      return;
    }

    return true;
  };
  const handleSave = async () => {
    Keyboard.dismiss();
    if (validateForm()) {
      setIsLoading(true);
      
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
          setPipeDetails([]);

          // showAIValidationError(database_res);
          const cleanFileName = name => name.replace(/^\d+-/, '');
          const failedNamesSet =
            database_res?.data?.error?.errorMessage?.failed.map(i =>
              cleanFileName(i.image_name),
            );
          const failedSet = new Set(failedNamesSet);
          const updatedPipeDetails = pipeDetails.map(pipeGroup => {
            return pipeGroup.map(item => {
              // Check if this item is an array of images
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
          const msg = showAIValidationError(database_res);
          Toast.show({
            time: 10,
            text: msg,
            ...AlertMesg[0],
          });

          setIsLoading(false);
        }
        if (database_res?.status == 200) {
          setIsLoading(false);
          setPipeDetails([]);

          AnalyticsLogEvent('activity_report', 'activity_report');
          navigation.popToTop();
          navigation.navigate('activityList', {action: 'addData'});
        } else if (database_res?.status == 409) {
          setIsLoading(false);
          setPipeDetails([]);

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
        navigation.popToTop();
        navigation.navigate('activityList', {action: 'addData'});
      }
    }
    setIsLoading(false);
  };
  const handleActivityType = useCallback(
    async item => {
      try {
        let dataArray = [];
        var response;
        if (isOnline) {
          response = await axiosGet(
            ROUTES.GET.ACTIVITY_INFO({
              cropType: CropType,
              cropName: CropName,
              actTypeID: item.value,
            }),
            token,
            {information: `${dbname},${lan_id},${farmerID}`},
          );
          //  response =await activityInfoAPI(
          //   dbname,
          //   lan_id,
          //   token,
          //   farmerID,
          //   CropType,
          //   CropName,
          //   item.value,
          // );
          console.log(
            'activityInfo',
            JSON.stringify(response?.data?.data?.rows[0]?.activity?.min_gap),
          );
          if (response?.status == 200) {
            setMinDateGap(response?.data?.data?.rows[0]?.activity?.min_gap);
            // checkDate(response?.data?.data?.rows[0]?.activity?.min_gap)

            await setItem(
              'activityInfo' + farmerID + CropType + CropName + item.value,
              response,
            );
          }
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
          // console.log('dataArray', JSON.stringify(dataArray));

          if (isButtonDisabled) {
            setActivityInfoAll(dataArray);
          }
          setPipeListDetailsResArr([]);
        } else {
          setActivityInfoAll([]);
        }
      } catch (error) {
        Toast.show({
          text: `${error.errorMessage}`,
          ...AlertMesg[0],
        });
        CrashlyticsRecordError(
          error,
          'ActivityReportAWD',
          'handleActivityType',
        );
      }
    },
    [CropType, CropName, isButtonDisabled],
  );
  const [PipeListDetailsArr, setPipeListDetailsResArr] = useState([]);
  const handleActivityInfo = useCallback(
    async item => {
      console.log(
        ROUTES.GET.UNIQUE_PIPE_NAME({
          plot_id: saveData.plot_id,
          cu_rel_id: saveData.cu_rel_id,
          act_name_fid: item?.act_master_id,
        }),
        token,
        {information: `${dbname},${lan_id},${farmerID}`},
      );
      setIsAfterToday(true);
      setMinDateAct(true);
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(today.getDate() - 10);
      setLastPerfromedDate(tenDaysAgo);
      try {
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
          act_to_date: act_to_date,
          act_to_date_label: item.label,
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
        const PipeListDetailsRes = await axiosGet(
          ROUTES.GET.UNIQUE_PIPE_NAME({
            plot_id: saveData.plot_id,
            cu_rel_id: saveData.cu_rel_id,
            act_name_fid: item?.act_master_id,
          }),
          token,
          {information: `${dbname},${lan_id},${farmerID}`},
        );
        // getUniquePipeNames(
        //   dbname,
        //   lan_id,
        //   token,
        //   farmerID,
        //   saveData.plot_id,
        //   item?.act_master_id,
        //   saveData.cu_rel_id,
        // );
        if (PipeListDetailsRes?.status == 200) {
          console.log(
            'pipe data=',
            JSON.stringify(PipeListDetailsRes?.data?.data),
          );
          const pipeDetailsArr = PipeListDetailsRes?.data?.data?.map(
            (_data, _index) => ({
              value: _data.pipe_pid,
              label: _data.pipe_name,
              lastActivityPerfromDate:
                _data?.lastActivityInfo?.act_perform_date,
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
      } catch (error) {
        CrashlyticsRecordError(
          error,
          'ActivityReportAWD',
          'handleActivityInfo',
        );
      }
    },
    [saveData.plot_id, saveData.cu_rel_id],
  );
  //basudev
  const [selectPipeList, setselectPipeList] = useState({
    label: '',
    value: '',
    latlongs: {},
  });
  const handleActivityPipeManual = useCallback(
    _item => {
      const {
        pipeFiles,
        pipeLatLong,
        label,
        value,
        latlongs,
        lastActivityPerfromDate,
      } = _item || {};
      const isNotEmpty = value =>
        value !== null && value !== undefined && String(value).trim() !== '';
      console.log('lastActivityPerfromDate==', lastActivityPerfromDate);
      if (isNotEmpty(lastActivityPerfromDate)) {
        const compareDate = new Date(lastActivityPerfromDate);
        compareDate.setDate(compareDate.getDate() + minDateGap);

        const today = new Date();
        const afterToday = compareDate > today;

        setLastPerfromedDate(compareDate);
        console.log(
          '2026-02-04 is TODAY',
          isAfterToday,
          minDateGap,
          compareDate,
          today,
        );
        if (compareDate > today) {
          console.log('2026-02-04 is not TODAY', compareDate);
          const formattedDate = compareDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          Toast.show({
            time: 3,
            text: `Selected activity cannot be submitted before  ${formattedDate}`,
            ...AlertMesg[0],
          });
          setMinDateAct(false);
          setIsAfterToday(false);
        } else {
          setMinDateAct(true);
          setIsAfterToday(true);
          console.log('2026-02-04 is TODAY', compareDate);
        }
      } else {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(today.getDate() - 10);

        setLastPerfromedDate(tenDaysAgo);
      }
      setselectPipeList({...selectPipeList, label, value, latlongs: latlongs});
    },
    [minDateGap, selectPipeList],
  );

  const handleActivityPipe = async scannedValue => {
    if (!scannedValue) return;
     setPipeNumber('');

    if (saveData.field_type == 'add') {
      if (isScanningRef.current) return;
      if (lastScannedRef.current === scannedValue) return;

      isScanningRef.current = true;
      lastScannedRef.current = scannedValue;

      try {

        const scanedData = await axiosGet(
          ROUTES.GET.UNIQUE_SCAN_CODE({
            unique_id: scannedValue,
          }),
          token,
          {information: `${dbname},${lan_id},${farmerID}`},
          '','pipeQrDetails'
        );
         console.log('pi value111=', JSON.stringify(scanedData));
        if (scanedData?.status == 200) {
          setPipeNumber(scannedValue);
        } else if (scanedData?.status == 409) {
          console.log('pipe data555=', JSON.stringify(scanedData));
          Toast.show({
            time: 3,
            text: `QR Code is already registered with activity pipe.`,
            ...AlertMesg[0],
          });
        }
      } catch (error) {
        console.log('pipe error=', JSON.stringify(error));
        Toast.show({
          time: 3,
          text: `QR Code is already registered with activity pipe.`,
          ...AlertMesg[0],
        });
      } finally {
        // 🔓 allow next scan after delay
        setTimeout(() => {
          isScanningRef.current = false;
        }, 1500);
      }
    } else {
      const matchedPipe = PipeListDetailsArr.find(
        item =>
          item?.label?.toString().trim().toLowerCase() ===
          scannedValue.toString().trim().toLowerCase(),
      );

      if (matchedPipe) {
        const isNotEmpty = value =>
          value !== null && value !== undefined && String(value).trim() !== '';
        if (isNotEmpty(matchedPipe.lastActivityPerfromDate)) {
          const compareDate = new Date(matchedPipe.lastActivityPerfromDate);
          compareDate.setDate(compareDate.getDate() + minDateGap);

          const today = new Date();
          const afterToday = compareDate > today;

          setLastPerfromedDate(compareDate);
          console.log(
            '2026-02-04 is TODAY',
            isAfterToday,
            minDateGap,
            compareDate,
            today,
          );
          if (compareDate > today) {
            console.log('2026-02-04 is not TODAY', compareDate);
            const formattedDate = compareDate.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            Toast.show({
              time: 3,
              text: `Selected activity cannot be submitted before  ${formattedDate}`,
              ...AlertMesg[0],
            });
            setMinDateAct(false);
            setIsAfterToday(false);
          } else {
            setMinDateAct(true);
            setIsAfterToday(true);
            console.log('2026-02-04 is TODAY', compareDate);
          }
        } else {
          const tenDaysAgo = new Date();
          tenDaysAgo.setDate(today.getDate() - 10);

          setLastPerfromedDate(tenDaysAgo);
        }
        setselectPipeList({
          ...selectPipeList,
          value: matchedPipe.value,
          label: matchedPipe.label,
          latlongs: matchedPipe.latlongs,
          lastActivityPerfromDate: matchedPipe.lastActivityPerfromDate,
        });
      } else {
        // ❌ Not found
        console.warn('Pipe not found:', scannedValue);

        Alert.alert(
          'Invalid Instrument',
          'Scanned instrument is not available in the plot',
        );
      }
    }
  };
  const onPageLoad = async () => {
    try {
      const QRFlag = await getItem('pipeQR');
      setPipeQR(QRFlag);
      console.log('QRFlag==', getItem('pipeQR'));
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
    } catch (error) {
      CrashlyticsRecordError(
        error,
        'SupervisorActivityReportAWD',
        'onPageLoad',
      );
    }
  };

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      console.log('Camera permission:', status);
    })();
    const task = InteractionManager.runAfterInteractions(() => {
      onPageLoad();
      // startWatchingLocation();
    });
    return () => {
      task.cancel();
      // stopWatchingLocation();
    };
  }, []);

  const handleHarvested = async data => {
    if (data == 'Yes') {
      navigation.navigate('Dashboard');
    } else {
      navigation.navigate('Dashboard');
    }
  };
  const handleRecord = item => {
    // setModalVisibleRecord(true);
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
      setSoundRecordSecoundItem({isLoggingIn: false, result: result});
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
      setSoundRecordThirdItem({isLoggingIn: false, result: result});
      // console.log("Stopped recording:", result);
      // navigation.navigate(navPath, { result: result,name:name });
    } catch (error) {
      console.error('Error stopping the recording:', error);
    }
    // }
  }, []);
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
  const addMorePipe = useCallback(
    field_type => {
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
    },
    [pipeNumber, selectedImagePipe],
  );

  const openImagePickerPipe = useCallback(async item => {
    setCameraItem(item);
    setModalVisibleMap(true);
  }, []);
  const handleRemovedpipeDetails = useCallback(
    _inde => {
      try {
        const values = [...pipeDetails];
        values.splice(_inde, 1);
        setPipeDetails(values);
      } catch (error) {
        console.error(error);
      }
    },
    [pipeDetails],
  );
  const [modalVisibleMap, setModalVisibleMap] = useState(false);
  const [plotPolygon, setPlotPolygon] = useState([]);
  const [cameraItem, setCameraItem] = useState('');
  const [tempImage, setTempImage] = useState(null);
  const [tempText, setTempText] = useState('');
  const watermarkViewRef = useRef(null);
  const TakePhoto = useCallback(
    async replaceImgKey => {
      const {latitude, longitude} = coords || {};
      let latlong;
      if (!latitude || !longitude) {
        latlong = await getHighAccuracyLocation();
      }

      const lat = latitude || latlong?.latitude || 0;
      const lon = longitude || latlong?.longitude || 0;
      // console.log('field_type', JSON.stringify(activityInfoAll[0].field_type));
      // console.log('field_type1233', pipe_fieldType.current);
      if (pipe_fieldType.current === 1) {
        const isPipeInstall = await checkPipeDistance(lat, lon);
        if (!isPipeInstall) {
          return;
        }
      }
      const options = {
        mediaType: 'photo',
        includeBase64: true,
        maxHeight: 800,
        maxWidth: 800,
        includeExtra: true,
      };

      launchCamera(options, async response => {
        try {
          if (!response) {
            CustomAlert('Camera Error:', 'Response is blank.', true, 'OK');
            return;
          }
          if (response.didCancel) {
            CustomAlert('Error_Cancel', 'User cancelled camera', true, 'OK');
            return;
          }
          if (response.errorCode) {
            CustomAlert('Camera Error:', response.errorMessage, true, 'OK');
            return;
          }

          const asset = response.assets?.[0];
          if (!asset?.uri) {
            CustomAlert('Error', 'No image captured', true, 'OK');
            return;
          }

          const timestamp = Date.now();
          const formattedDate = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).format(timestamp);

          const watermarkText = `${formattedDate}\nLat: ${lat}, Lon: ${lon}`;

          setTempImage(asset.uri);
          setTempText(watermarkText);

          setTimeout(async () => {
            try {
              const uri = await captureRef(watermarkViewRef, {
                format: 'jpg',
                quality: 1,
                width: 800,
                height: 800,
              });
              const fileName = asset.fileName || `photo_${timestamp}.jpg`;
              const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
              await RNFS.copyFile(uri, destPath);

              setTempImage(null);
              setTempText('');
              if (replaceImgKey.arrayPosition === '') {
                setSelectedImagePipe(prev => ({
                  ...prev,
                  [cameraItem]: `file://${destPath}`,
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
              console.log('Watermarked image saved:', destPath);
            } catch (error) {
              console.log('Capture Error:', error);
              setTempImage(null);
              setTempText('');
            }
          }, 700);
        } catch (error) {
          CustomAlert('Catch Error ', error, true, 'OK');
        } finally {
          setModalVisibleMap(false);
        }
      });
    },
    [
      cameraItem,
      setSelectedImagePipe,
      setModalVisibleMap,
      pipeLatLong,
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
  const pipeEdit = _index => {
    const values = [...pipeDetails];
    values.splice(_index, 1);
    setPipeDetails(values);
  };
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
                path="activityList"
                logoImage={logoImage}
                topBanner={topBanner}
              />
              {scan && (
                <ScannerModal
                  onScan={value => handleActivityPipe(value)}
                  onClose={() => setScan(false)}
                />
              )}
              <DatePickerComp
                openDate={cycleStartDate}
                newDate={newFromDate}
                setOpenDate={srtCycleStartDate}
                handleDatePicker={handleDatePicker}
                minimumDate={minimumSelectableDate}
              />
              <DatePickerComp
                openDate={activityPreDate}
                newDate={newFromDate}
                setOpenDate={setActivityPreDate}
                handleDatePicker={handleDatePicker2}
                minimumDate={lastPerfromedDate}
                maximumDate={today}
              />
              {/* <DatePickerComp
                openDate={activityPreDate}
                newDate={newFromDate}
                setOpenDate={setActivityPreDate}
                handleDatePicker={handleDatePicker2}
                minimumDate={checkDate(minDateGap)}
                maximumDate={today}
              /> */}
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
              {isLoading && (
                <View style={styles.loadingScreen}>
                  <LoadingScreen />
                </View>
              )}
              <ScrollView>
                <View style={styles.fromContainer}>
                  <DropdownForm
                    label={t('farmer_name')}
                    data={farmerData?.[0]}
                    required={true}
                    onChange={handleResultSelect}
                    val={searchFarmerName?.label}
                  />
                  <InputTextForm
                    label={t('farmer_number')}
                    required={true}
                    value={searchFarmerName?.phone}
                    editable={false}
                  />
                  <DropdownForm
                    label={t('select_plot')}
                    data={plotAll}
                    required={true}
                    onChange={handlePlot}
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
                    ) : null
                  ) : null}
                  <DropdownForm
                    label={t('growth_stage')}
                    required={true}
                    data={productionStageAll}
                    onChange={handlegrowth_stage}
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

                      {overdueAct.length > 0 ? (
                        <View style={styles.plotSiteContainer}>
                          <View style={styles.detailRow}>
                            <Text style={styles.label}>Due Activities</Text>
                            {overdueAct.map((act, index) => (
                              <View
                                key={index}
                                style={styles.bulletPointContainer}>
                                <Text style={styles.bulletPoint}>•</Text>
                                <Text
                                  key={index}
                                  style={[styles.value1, styles.leftAlign]}>
                                  {act}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ) : null}

                      {upcomingAct ? (
                        <View style={styles.plotSiteContainer}>
                          <View style={styles.detailRow}>
                            <Text style={styles.label}>Upcoming activity</Text>
                            <View style={styles.bulletPointContainer}>
                              <Text style={styles.bulletPoint}>•</Text>
                              <Text style={[styles.value1, styles.leftAlign]}>
                                {upcomingAct}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ) : null}

                      {saveData.field_type != '' &&
                        // activityPattern
                        saveData.field_type != null && (
                          <View
                            style={{
                              borderWidth: 0.5,
                              borderColor: Colors.useGreen,
                              borderRadius: 8,
                              padding: 10,
                            }}>
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
                              {t('Enter Pipe Detail')}
                            </Text>
                            <View>
                              {pipeQR == 1 ? (
                                saveData.field_type == 'add' ? (
                                  <View
                                    style={{marginVertical: 30, height: 45}}>
                                    <TouchableOpacity
                                      activeOpacity={0.8}
                                      style={styles.pipeInputScan}
                                      onPress={() => {
                                        setScan(true);
                                      }}>
                                      <View style={styles.inputWrapper}>
                                        <InputTextForm
                                          label={t('Enter Instrument Name')}
                                          editable={false}
                                          required={true}
                                          value={pipeNumber}
                                        />
                                      </View>

                                      <Image
                                        source={require('../../Common/images/scan.png')}
                                        style={styles.icon}
                                        resizeMode="contain"
                                      />
                                    </TouchableOpacity>
                                  </View>
                                ) : (
                                  <View
                                    style={{marginVertical: 30, height: 45}}>
                                    <TouchableOpacity
                                      activeOpacity={0.8}
                                      style={styles.pipeInputScan}
                                      onPress={() => {
                                        setScan(true);
                                      }}>
                                      <View style={styles.inputWrapper}>
                                        <InputTextForm
                                          label={t('Enter Instrument Name')}
                                          editable={false}
                                          required={true}
                                          value={selectPipeList.label}
                                        />
                                      </View>

                                      <Image
                                        source={require('../../Common/images/scan.png')}
                                        style={styles.icon}
                                        resizeMode="contain"
                                      />
                                    </TouchableOpacity>
                                  </View>
                                )
                              ) : saveData.field_type == 'add' ? (
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
                                  onChange={handleActivityPipeManual}
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
                                    <View style={styles.watermarkTextContainer}>
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

                              <PipeDetailsCard
                                pipeDetails={pipeDetails}
                                pipeEdit={pipeEdit}
                                TakePhotoFailed={TakePhotoFailed}
                              />
                            </View>
                          </View>
                        )}
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
                      disabled={!isAfterToday}
                      style={styles.activityPerFromDate}
                      onPress={() => {
                        setActivityPreDate(true);
                      }}>
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
              </ScrollView>
              <ButtonForm
                label={t('submit')}
                onPress={() => handleSave()}
                loading={isLoading}
              />
            </View>
          </SecurityWrapper>
        </Root>
      </MyErrorBoundary>
    </FarmerDrawerScreenWrapper1>
  );
};
export default ActivityReportAWD;
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
    padding: 16,
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
  pipeInputScan: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingRight: 10,
    height: 45,
    backgroundColor: '#fff',
  },

  inputWrapper: {
    flex: 1, // takes remaining space
    justifyContent: 'center',
  },

  icon: {
    width: 20,
    height: 20,
    marginLeft: 10,
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

  plotSiteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2faffff',

    marginVertical: 8,
    borderRadius: 20,
    borderLeftWidth: 3,
    borderLeftColor: Colors.borderGreen,
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
    top: '45%',
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
    fontSize: 12,
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
