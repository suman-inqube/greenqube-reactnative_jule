import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Keyboard,
  ScrollView,
  FlatList,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import TakePhoto from '../Activity/TakePhoto';
import RecordComp from '../Activity/RecordComp';
import {launchCamera} from 'react-native-image-picker';
import Marker, {Position} from 'react-native-image-marker';
import {
  farmerByNameAPI,
  problemPlotAgainstFarmerAPI,
  problemProduceAgainstPlotAPI,
  problemProductionStageAPI,
  problemSaveAPI,
  problemSeverityAPI,
  problemTypeNameAPI,
} from '../../../config/apiHere';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import {formatDateToMMDDYYYY} from '../../Common/DateChanger';
import {useIsFocused} from '@react-navigation/native';
import SoundRecord from '../../Common/SoundRecord';
import HarvestedModel from '../../Common/HarvestedModel';
const audioRecorderPlayer = new AudioRecorderPlayer();
// audioRecorderPlayer.setSubscriptionDuration(0.09);
import AudioPlayerView from '../../Common/AudioPlayerView';
import {userCreateContext} from '../../Context/usersCreateContext';
import axios from 'axios';
import {Colors, Fronts} from '../../utils/Constants';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DatePickerField from '../../Common/DatePickerField';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
const CreateProblem = ({navigation}) => {
  //GQR-65
  const {
    dbLanTokUsr,
    setdbLanTokUsr,
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
    FormsTitle,
    DropdownForm,
    effective_dates,
    InputTextForm,
    DatePickerComp,
    ButtonForm,
    isOnline,
    farmerData,
    coords,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id, FcmUserToken, owner} = loginUser_data;
  //GQR-65
  const {netConnection} = DeviceInfo();
  const isFocused = useIsFocused();
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFarmerName, setSearchFarmerName] = useState();
  const [searchFarmerPhone, setSearchFarmerPhone] = useState();
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [farmerID, setFarmerID] = useState();
  const [plotAll, setPlotAll] = useState([]);
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
  const [addAffectedDate, setAddAffectedDate] = useState(false);
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
    plot_id: '',
  });
  const [myphotoAll, setMyPhotoAll] = useState([]);
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
  const handleResultSelect = useCallback(async item => {
    // console.log('Full farmer item data:', JSON.stringify(item, null, 2));
    const {label: name, value: currentfarmerId, phone, FcmUserToken} = item;

    // console.log('Selected farmer FCM token:', FcmUserToken);
    setSearchResultsList(false);
    setSearchFarmerPhone(phone);
    // setSelectedName(name);
    setSearchFarmerName(name);
    setShowingMenu(false);
    setSearchResults([]);
    setFarmerID(currentfarmerId);
    setSaveData(prev => ({...prev, farmer_fcm: FcmUserToken}));
    if (isOnline) {
      var response = await axiosGet(
        ROUTES.GET.PROBLEM_PLOT_AGAINST_FARMER({
          farmerID: currentfarmerId,
        }),
        token,
        {information: `${dbname},${lan_id}`},
      );
      // problemPlotAgainstFarmerAPI(
      //   dbname,
      //   lan_id,
      //   token,
      //   currentfarmerId,
      // );
      await setItem('problemPlotAgainstFarmer' + currentfarmerId, response);
    } else {
      var response = await getItem(
        'problemPlotAgainstFarmer' + currentfarmerId,
      );
    }
    console.log('farmerToken', response.status);
    if (response) {
      //GQR-65
      const dataArray = response?.data?.data.map(data => ({
        value: data.rel_id,
        label: data.plot_no,
      }));
      //GQR-65
      setPlotAll(dataArray);
    }
  }, []);
  const handlePlot = useCallback(async relId => {
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
      // problemProduceAgainstPlotAPI(
      //   dbname,
      //   lan_id,
      //   farmerID,
      //   relId.value,
      // );
      await setItem(
        'problemProduceAgainstPlot' + farmerID + relId.value,
        response,
      );
    } else {
      var response = await getItem(
        'problemProduceAgainstPlot' + farmerID + relId.value,
      );
    }
    console.log('problemProduceAgainstPlot', response?.status);
    if (response?.status == 200) {
      setNameVarityStartEnd(prev => ({
        ...prev,
        name: response?.data?.data?.crop_name.name,
        varity: response?.data?.data?.crop_variety.name,
        cycleStarts: response?.data?.data?.sowing_date,
        cycleEnd: response?.data?.data?.harvesting_date,
        production_process: response?.data?.data?.farmer_production_system.name,
      }));
      const dateString = response?.data?.data?.harvesting_date;
      const harvesting_date = new Date(dateString);
      const currentDate = new Date();
      if (harvesting_date > currentDate) {
        setShowingMenu(true);
        setSaveData(prev => ({
          ...prev,
          crop_season_id: response?.data?.data?.crop_season_id,
          crop_type_id: response?.data?.data?.crop_type_id,
          crop_variety_id: response?.data?.data?.crop_variety_id,
          crop_name_id: response?.data?.data?.crop_name_id,
          plot_id: relId.value,
          harvesting_date: response?.data?.data?.harvesting_date,
          sowing_date: response?.data?.data?.sowing_date,
          production_system:
            response?.data?.data?.farmer_production_system.fa_id,
          agent_id: user_id,
        }));
        if (isOnline) {
          var productionStage_res = await axiosGet(
            ROUTES.GET.PRODUCTION_STAGE({
              languageID: lan_id,
              cropTypeId: response?.data?.data?.crop_type_id,
              cropNameID: response?.data?.data?.crop_name_id,
            }),
            '',
            {information: `${dbname},${lan_id}`},
          );

          // problemProductionStageAPI(
          //   dbname,
          //   lan_id,
          //   response?.data?.data?.crop_type_id,
          //   response?.data?.data?.crop_name_id,
          // );
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
        console.log('problemProductionStageAPI', productionStage_res?.status);
        if (productionStage_res) {
          const dataArray = productionStage_res?.data?.data?.growth_stage.map(
            data => ({
              value: data.growth_stage.fid,
              label: data.growth_stage.name,
            }),
          );

          setproductionStageAll(dataArray);
        }
      } else {
        setModalVisible(true);
        setSearchFarmerName('');
        setSearchFarmerPhone('');
        setPlotAll([]);
      }
    }
  }, []);
  const openImagePicker = useCallback(
    item => {
      const options = {
        mediaType: 'photo',
        includeBase64: true,
        maxHeight: 200,
        maxWidth: 200,
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
            backgroundImage: {src: imageUri, scale: 1},
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
                positionOptions: {position: Position.bottomLeft},
                style: {
                  color: '#df2020',
                  fontSize: 2,
                  fontName: 'Arial',
                  textBackgroundStyle: {padding: '10% 10%', color: '#00000000'},
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
          setSelectedImage({...selectedImage, [item]: `file://${path}`});
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
    },
    [myphotoAll, myTitleAll],
  );
  const addPhoto = newPhoto => {
    setMyPhotoAll([...myphotoAll, newPhoto]);
  };
  const addTitle = newTitle => {
    setMyTitleAll([...myTitleAll, newTitle]);
  };
  const handleDatePicker = item => {
    const effective_date = effective_dates(item);
    setaffectedDate(effective_date);
    setSaveData({...saveData, affected_date: effective_date});
  };
  const handleProblemType = useCallback(
    problem_type => {
      setSaveData(prev => ({
        ...prev,
        problem_type_id: problem_type.value,
      }));

      setNameVarityStartEnd(prev => ({
        ...prev,
        question_title1: problem_type.label, // only update this key, keep all others
      }));

      const problemNameFound = problemAll.find(
        user => user.fid === problem_type.value,
      );

      if (problemNameFound) {
        const dataArray = problemNameFound?.problem_type.map(data => ({
          value: data.problem_name.fid,
          label: data.problem_name.name,
        }));
        setProblemNameAll(dataArray);
      }
    },
    [problemAll],
  );

  const handleProblemName = useCallback(
    problem_name => {
      setSaveData(prev => ({
        ...prev,
        problem_name_id: problem_name.value,
        question_title:
          nameVarityStartEnd.name +
          ',' +
          nameVarityStartEnd.question_title1 +
          ',' +
          problem_name.label,
      }));
    },
    [nameVarityStartEnd],
  );
  const onPageLoad = async () => {
    const {latitude, longitude} = coords || {};
    setSaveData({...saveData, latitude: latitude, longitude: longitude});
    setdbLanTokUsr({
      ...dbLanTokUsr,
      FcmUserToken: FcmUserToken,
      owner: owner.FcmUserToken,
    });
    if (isOnline) {
      var [problemName_res, severity_res] = await Promise.all([
        axiosGet(ROUTES.GET.PROBLEM_TYPE_NAME(), token, {
          information: `${dbname},${lan_id}`,
        }),

        // problemTypeNameAPI(dbname, lan_id, token),

        axiosGet(ROUTES.GET.PROBLEM_SEVERITY(), '', {
          information: `${dbname},${lan_id}`,
        }),

        // problemSeverityAPI(dbname, lan_id),
      ]);
      console.log('problemTypeNameAPI', problemName_res.status);
      if (problemName_res?.status == 200) {
        await Promise.all([
          setItem('supervisorProblemTypeName', problemName_res),
          setItem('severity_res', severity_res),
        ]);
      }
    } else {
      var [problemName_res, severity_res] = await Promise.all([
        getItem('supervisorProblemTypeName'),
        getItem('severity_res'),
      ]);
    }
    setProblemAll(problemName_res?.data?.data);
    if (problemName_res) {
      const dataArray = problemName_res?.data?.data.map(data => ({
        value: data.fid,
        label: data.name,
      }));
      setProblemTypeAll(dataArray);
      setIsLoading(false);
    }
    console.log('severity_res', severity_res.status);
    if (severity_res) {
      const dataArray = severity_res?.data?.data?.rows.map(data => ({
        value: data.fid,
        label: data.name,
      }));
      setSeverityAll(dataArray);
    }
  };
  const validateForm = () => {
    if (!farmerID) {
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
        text: `${t('please_select_plot_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!saveData.growth_stage) {
      Toast.show({
        time: 2,
        text: `${t('please_select_cultiveting_season_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!saveData.problem_type_id) {
      Toast.show({
        time: 2,
        text: `${t('please_select_problem_type')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!saveData.problem_name_id) {
      Toast.show({
        time: 2,
        text: `${t('please_select_problem')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!saveData.severity_id) {
      Toast.show({
        time: 2,
        text: `${t('please_select_severity')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!saveData.affected_date) {
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
        text: `${t('gpsalertdialogmessage')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    return true;
  };
  const handleSave = useCallback(async () => {
    Keyboard.dismiss();

    if (validateForm()) {
      //
      let array = [];
      const formData = new FormData();
      console.log('IMAGE UPLOADED2222:', JSON.stringify(myphotoAll));

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
      // formData.append("agent_fcm", dbLanTokUsr.owner);
      formData.append('farmer_fcm', saveData.farmer_fcm);
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
      if (isOnline) {
        const database_res = await problemSaveAPI(
          dbname,
          lan_id,
          token,
          farmerID,
          formData,
        );
        console.log('database_res', database_res);
        if (database_res.status === 200) {
          navigation.navigate('ProblemList', {action: 'addData'});
        }
      } else {
        formData.append('farmerID', farmerID);
        let timeStamp = Date.now();
        await setItem('off' + timeStamp, formData);
        let offlineDataArr = await getItem('offlineSupervisorProblemData');
        if (offlineDataArr) {
          await setItem(
            'offlineSupervisorProblemData',
            offlineDataArr + ',' + 'off' + timeStamp,
          );
        } else {
          await setItem('offlineSupervisorProblemData', 'off' + timeStamp);
        }
        navigation.navigate('ProblemList', {action: 'addData'});
      }
    }
  }, [
    myphotoAll,
    myTitleAll,
    saveData,
    soundRecordFirstItem,
    soundRecordSecoundItem,
    soundRecordThirdItem,
  ]);
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
  const handleHarvested = async data => {
    if (data == 'Yes') {
      navigation.navigate('ProblemList');
    } else {
      navigation.navigate('Dashboard');
    }
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  const cancelRecord = useCallback(async item => {
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
  }, []);
  const soundPlay = useCallback(async item => {
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
  }, []);
  const handleGrowthStage = useCallback(
    item => setSaveData(saveData => ({...saveData, growth_stage: item.value})),
    [],
  );
  const handleChangeQuestionTitle = useCallback(
    item => setSaveData(saveData => ({...saveData, question_title: item})),
    [],
  );
  const handleChangeQuestionDescription = useCallback(
    item => setSaveData(saveData => ({...saveData, question_desc: item})),
    [],
  );
  const handleSeverityChange = useCallback(
    item => setSaveData(saveData => ({...saveData, severity_id: item.value})),
    [],
  );
  const handleActivityPerFromDate = useCallback(() => {
    setAddAffectedDate(true);
  }, []);

  const renderCustomHeader = useMemo(
    () => (
      <CustomHeader
        path="ProblemList"
        logoImage={logoImage}
        topBanner={topBanner}
      />
    ),
    [],
  );
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        <View style={styles.container}>
          {renderCustomHeader}
          <DatePickerComp
            openDate={addAffectedDate}
            newDate={newFromDate}
            setOpenDate={setAddAffectedDate}
            handleDatePicker={handleDatePicker}
          />
          {modalVisibleRecordFirstItem && (
            <SoundRecord
              modalVisibleRecord={modalVisibleRecordFirstItem}
              setModalVisibleRecord={setModalVisibleRecordFirstItem}
              onStartRecordFirstItem={onStartRecordFirstItem}
              onStopRecordFirstItem={onStopRecordFirstItem}
              soundRecord={soundRecordFirstItem}
            />
          )}
          {modalVisibleRecordSecoundItem && (
            <SoundRecord
              modalVisibleRecord={modalVisibleRecordSecoundItem}
              setModalVisibleRecord={setModalVisibleRecordSecoundItem}
              onStartRecordFirstItem={onStartRecordSecoundItem}
              onStopRecordFirstItem={onStopRecordSecoundItem}
              soundRecord={soundRecordSecoundItem}
            />
          )}
          {modalVisibleRecordThirdItem && (
            <SoundRecord
              modalVisibleRecord={modalVisibleRecordThirdItem}
              setModalVisibleRecord={setModalVisibleRecordThirdItem}
              onStartRecordFirstItem={onStartRecordThirdItem}
              onStopRecordFirstItem={onStopRecordThirdItem}
              soundRecord={soundRecordThirdItem}
            />
          )}

          {modalVisible && (
            <HarvestedModel
              setModalVisible={setModalVisible}
              modalVisible={modalVisible}
              handleHarvested={handleHarvested}
            />
          )}
          <ScrollView showsVerticalScrollIndicator={false}>
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
                onChange={handleResultSelect}
              />
              {/* {console.log('📊 farmerData[0]:', farmerData?.[0])} */}

              {/* <InputTextForm
                label={t('farmer_name')}
                value={searchFarmerName}
                onChangeText={farmerName => handleSearch(farmerName)}
              /> */}
              <InputTextForm
                label={t('farmer_number')}
                value={searchFarmerPhone}
                editable={false}
              />
              <DropdownForm
                label={t('plot')}
                data={plotAll}
                required={true}
                onChange={handlePlot}
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
                onChange={handleGrowthStage}
              />
              <DropdownForm
                label={t('problem_type')}
                required={true}
                data={problemTypeAll}
                onChange={handleProblemType}
              />
              <DropdownForm
                label={t('select_problem')}
                required={true}
                data={problemNameAll}
                onChange={handleProblemName}
              />
              <DropdownForm
                label={t('select_severity')}
                required={true}
                data={severityAll}
                onChange={handleSeverityChange}
              />
              <InputTextForm
                label={t('production_system')}
                value={nameVarityStartEnd.production_process}
                editable={false}
              />
              <DatePickerField
                label={t('agent_crop_problem_affected_date')}
                value={affectedDate}
                onPress={handleActivityPerFromDate}
                required={true}
              />
              <InputTextForm
                label={t('enter_problem_title')}
                onChangeText={handleChangeQuestionTitle}
                value={saveData.question_title}
              />
              <InputTextForm
                label={t('enter_problem_description')}
                onChangeText={handleChangeQuestionDescription}
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
          </ScrollView>
          <ButtonForm label={t('submit')} onPress={handleSave} />
        </View>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};

export default CreateProblem;

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
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  fromContainer: {
    flex: 1,
    padding: 16,
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
