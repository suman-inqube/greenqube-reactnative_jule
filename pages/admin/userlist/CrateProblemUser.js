import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, FlatList, SafeAreaView, Dimensions } from 'react-native'
import { PermissionsAndroid } from 'react-native'
import Geolocation from '@react-native-community/geolocation';
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react'
import TakePhoto from '../Activity/TakePhoto';
import RecordComp from '../Activity/RecordComp';
import { launchCamera } from 'react-native-image-picker';
import Marker, { Position } from "react-native-image-marker";
import ButtonForm from '../../Common/ButtonForm';
import { farmerByNameAPI, problemPlotAgainstFarmerAPI, problemProduceAgainstPlotAPI, problemProductionStageAPI, problemSaveAPI, problemSeverityAPI, problemTypeNameAPI } from '../../../config/apiHere';
import MessageDialog from '../../Common/MessageDialog';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import { useRoute, useIsFocused } from '@react-navigation/native';
import SoundRecord from '../../Common/SoundRecord';
import { userCreateContext } from '../../Context/usersCreateContext';
const audioRecorderPlayer = new AudioRecorderPlayer();
const CrateProblemUser = ({ navigation }) => {
    //GQR-66
    const { DropdownForm, InputTextForm, FormsTitle, DatePickerComp, loginUser_data, LoadingScreen, CustomHeader, t, AlertMesg, onBackPress, getItem,
        setItem, logoImage, topBanner, Root, Toast } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    //GQR-66
    const isFocused = useIsFocused();
    const route = useRoute();
    const { agri_land_user_rels, contactNumber,
        farmer_type, farmeruserID, userName } = route.params;
    const [isLoading, setIsLoading] = useState(true);
    const [farmerData, setFarmerData] = useState([]);
    const [searchFarmerName, setSearchFarmerName] = useState();
    const [searchFarmerPhone, setSearchFarmerPhone] = useState();
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [CropType, setCropType] = useState();
    const [CropName, setCropName] = useState();
    const [searchResults, setSearchResults] = useState([]);
    const [selectedName, setSelectedName] = useState('');
    const [farmerID, setfarmerID] = useState();
    const [plotAll, setplotAll] = useState([]);
    const [productionStageAll, setproductionStageAll] = useState([]);
    const [problemAll, setProblemAll] = useState([]);
    const [problemTypeAll, setProblemTypeAll] = useState([]);
    const [problemNameAll, setProblemNameAll] = useState([]);
    const [severityAll, setSeverityAll] = useState([]);
    const [nameVarityStartEnd, setNameVarityStartEnd] = useState({
        name: "",
        varity: "",
        cycleStarts: "",
        cycleEnd: "",
        production_process: "",
        question_title1: "",
    });
    const [affectedDate, setaffectedDate] = useState("");
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [addAffectedDate, setaddAffectedDate] = useState(false);
    const [selectedImage, setSelectedImage] = useState({
        firstItem: "",
        secondItem: "",
        thirdItem: "",
    });
    const [selectedRecord, setSelectedRecord] = useState({
        firstItemRecord: "",
        secondItemRecord: "",
        thirdItemRecord: "",
    });
    const [saveData, setSaveData] = useState({
        agent_fcm: "",
        farmer_fcm: "eJ_QQHq1Qq-337QqKYbK4A:APA91bFCGrfq6XPr7dc7UyWMFoPdaY9fGryYS6JSByN5QPY7WlLOIXtmWU1-Z16RfuDhqf7InNwiHIhJh1_W6J-MYl97s7FA-xodzjza5J_DKKoVodUJfiqLyZIy56Tvicr0vsIbDGAj ",
        latitude: "",
        longitude: "",
        question_type: "crop_problem",
        land_unit_id: "",
        affected_area: "",
        category_id: "",
        affected_date: "",
        question_title: "",
        question_desc: "",
        severity_id: "",
    });
    const [myphotoAll, setmyPhotoAll] = useState([]);
    const [myTitleAll, setMyTitleAll] = useState([]);
    const [myphoto, setmyPhoto] = useState(null);
    const [myphotoTitle, setmyPhotoTitle] = useState([]);
    const [showingMenu, setShowingMenu] = useState(false);
    const [modalVisibleRecordFirstItem, setModalVisibleRecordFirstItem] = useState(false);
    const [modalVisibleRecordSecoundItem, setModalVisibleRecordSecoundItem] = useState(false);
    const [modalVisibleRecordThirdItem, setModalVisibleRecordThirdItem] = useState(false);
    const [soundRecordFirstItem, setSoundRecordFirstItem] = useState({
        item: '1',
        isLoggingIn: false,
        recordSecs: 0,
        recordTime: '00:00:00',
        result: ""
    });
    const [soundRecordSecoundItem, setSoundRecordSecoundItem] = useState({
        item: '2',
        isLoggingIn: false,
        recordSecs: 0,
        recordTime: '00:00:00',
        result: ""
    });
    const [soundRecordThirdItem, setSoundRecordThirdItem] = useState({
        item: '3',
        isLoggingIn: false,
        recordSecs: 0,
        recordTime: '00:00:00',
        result: ""
    });
    const handleResultSelect = async (name, currentfarmerId, phone) => {
        setSearchResultsList(false);
        setSearchFarmerPhone(phone);
        setSelectedName(name);
        setSearchFarmerName(name);
        setShowingMenu(false);
        setSearchResults([]);
        setfarmerID(currentfarmerId)
        const response = await problemPlotAgainstFarmerAPI(dbname, lan_id, token, currentfarmerId)
        if (response) {
            const dataArray = [];
            response.data.data.forEach(element => {
                dataArray.push({
                    value: element.rel_id,
                    label: element.plot_no
                });
            });
            setplotAll(dataArray)
        }
    }
    const handlePlot = async (relId) => {
        const response = await problemProduceAgainstPlotAPI(dbname, lan_id, farmerID, relId.value)
        if (response) {
            setNameVarityStartEnd({
                ...nameVarityStartEnd,
                name: response?.data?.data?.crop_name.name,
                varity: response?.data?.data?.crop_variety.name,
                cycleStarts: response?.data?.data?.sowing_date,
                cycleEnd: response?.data?.data?.harvesting_date,
                production_process: response?.data?.data?.farmer_production_system.name,
            })
            const dateString = response?.data?.data?.harvesting_date;
            const harvesting_date = new Date(dateString);
            const currentDate = new Date();
            if (harvesting_date > currentDate) {
                setShowingMenu(true)
                setSaveData({
                    ...saveData,
                    crop_season_id: response?.data?.data?.crop_season_id,
                    crop_type_id: response?.data?.data?.crop_type_id,
                    crop_variety_id: response?.data?.data?.crop_variety_id,
                    crop_name_id: response.data.data?.crop_name_id,
                    plot_id: relId?.value,
                    harvesting_date: response?.data.data?.harvesting_date,
                    sowing_date: response?.data?.data?.sowing_date,
                    production_system: response?.data?.data?.farmer_production_system.fa_id,
                    agent_id: user_id,
                })
                setCropType(response?.data?.data?.crop_type.fid)
                setCropName(response?.data?.data?.crop_name.fid)
                const productionStage_res = await problemProductionStageAPI(dbname, lan_id, response?.data?.data?.crop_type_id, response?.data?.data?.crop_name_id)
                if (productionStage_res) {
                    const dataArray = [];
                    productionStage_res.data.data.growth_stage.forEach(element => {
                        dataArray.push({
                            value: element.growth_stage.fid,
                            label: element.growth_stage.name
                        });
                    });
                    setproductionStageAll(dataArray)
                }
            } else {
                // MessageDialog({ title: 'Importent', message: `${t('your_previous_crop_hervested')} ${t('add_a_new_crop')}` })
                Toast.show({ text: `${t('your_previous_crop_hervested')} ${t('add_a_new_crop')}`, ...AlertMesg[0] })
                setSearchFarmerName('')
                setSearchFarmerPhone('')
                setplotAll([])
                setTimeout(() => {
                    navigation.navigate('Dashboard');
                }, 1300);
            }
        }
    }
    const openImagePicker = (item) => {
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

                    backgroundImage: {
                        src: imageUri,
                        scale: 1,
                    },
                    watermarkTexts: [{
                        text: `${saveData.latitude},${saveData.longitude},${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(timestamp)}`,

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
                    }],
                    scale: 1,
                    quality: 100,

                    filename: `${response.assets[0].fileName}`,
                    saveFormat: `${response.assets[0].type}`,
                    maxSize: 1000,
                };
                let path = await Marker.markText(options)
                setSelectedImage({
                    ...selectedImage, [item]: `file://${path}`
                });
                const newPhoto = { uri: `file://${path}`, type: 'image/jpeg', name: `file://${path}` }
                // const newTitle = {}
                addPhoto(newPhoto);

                // let imageUri = response.uri || response.assets?.[0]?.uri;
                // setSelectedImage({ ...selectedImage, [item]: imageUri });
                // const newPhoto = { uri: imageUri, type: 'image/jpeg', name: imageUri }
                const newTitle = {}
                // addPhoto(newPhoto);
                addTitle(newTitle)

            }
        });
    };
    const addPhoto = (newPhoto) => {
        setmyPhotoAll([...myphotoAll, newPhoto]);
    };
    const addTitle = (newTitle) => {
        setMyTitleAll([...myTitleAll, newTitle]);
    };
    const handleDatePicker = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setaffectedDate(effective_date)
        setSaveData({ ...saveData, affected_date: effective_date })
    }
    const handleProblemType = (problem_type) => {
        setSaveData({
            ...saveData,
            problem_type_id: problem_type.value,
        })
        setNameVarityStartEnd({
            ...nameVarityStartEnd,
            question_title1: problem_type.label,

        })
        const problemNameFound = problemAll.find(user => user.fid === problem_type.value);
        if (problemNameFound) {
            const dataArray = [];
            problemNameFound.problem_type.forEach(element => {
                dataArray.push({
                    value: element.problem_name.fid,
                    label: element.problem_name.name,
                });
            });
            setProblemNameAll(dataArray)
        }
    };
    const handleProblemName = (problem_name) => {
        setSaveData({
            ...saveData,
            problem_name_id: problem_name.value,
            question_title: nameVarityStartEnd.name + "," + nameVarityStartEnd.question_title1 + "," + problem_name.label
        })
    };
    const handleSearch = (text) => {
        setSearchFarmerName(text);
        setSearchFarmerPhone('');
        if (farmerData.length > 0) {
            const result = farmerData.filter(item =>
                item.label.toLowerCase().includes(text.toLowerCase())
            );
            if (result) {
                setSearchResultsList(true)
                setSearchResults(result);
            }
        }
    };
    const requestLivePermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                Geolocation.getCurrentPosition(data =>
                    setSaveData({
                        ...saveData,
                        latitude: data.coords.latitude,
                        longitude: data.coords.longitude,
                    })
                )
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
            agent_fcm: "",
            farmer_fcm: "eJ_QQHq1Qq-337QqKYbK4A:APA91bFCGrfq6XPr7dc7UyWMFoPdaY9fGryYS6JSByN5QPY7WlLOIXtmWU1-Z16RfuDhqf7InNwiHIhJh1_W6J-MYl97s7FA-xodzjza5J_DKKoVodUJfiqLyZIy56Tvicr0vsIbDGAj ",
            latitude: "",
            longitude: "",
            question_type: "crop_problem",
            land_unit_id: "",
            affected_area: "",
            category_id: "",
            affected_date: "",
            question_title: "",
            question_desc: "",
            production_process: "",
            severity_id: "",
        })
        setaffectedDate("");
        setShowingMenu(false)
        setproductionStageAll([]);
        setProblemAll([]);
        setProblemTypeAll([]);
        setProblemNameAll([]);
        setSeverityAll([]);
        setSelectedImage({
            firstItem: "",
            secondItem: "",
            thirdItem: "",
        });
        setNameVarityStartEnd({
            ...nameVarityStartEnd,
            name: "",
            varity: "",
            cycleStarts: "",
            cycleEnd: "",
            production_process: "",
        })
    }
    const onPageLoad = async () => {
        handleClear();
        requestLivePermission();
        const [problemName_res, response, severity_res] = await Promise.all([
            problemTypeNameAPI(dbname, lan_id, token),
            farmerByNameAPI(dbname, lan_id, token, user_id),
            problemSeverityAPI(dbname, lan_id)
        ]);
        if (problemName_res?.status == 200) {
            setProblemAll(problemName_res.data.data);
            const dataArray = problemName_res?.data?.data.map(element => ({ value: element.fid, label: element.name }))
            setProblemTypeAll(dataArray)
            setIsLoading(false)
        }
        if (severity_res?.status == 200) {
            const dataArray = severity_res?.data?.data?.rows.map(element => ({ value: element.fid, label: element.name }));
            setSeverityAll(dataArray)
        }
        if (response?.status == 200) {
            const dataArray = response?.data?.data?.rows.map(element => ({ value: element.user_id, label: element.userName, phone: element.contactNumber }))
            setFarmerData(dataArray)
        }
    };
    const validateForm = () => {
        if (!farmerID) {
            Toast.show({
                time: 2, text: t('please_enter_farmer_name'), ...AlertMesg[0]
            })
            return false;
        }
        if (!saveData.plot_id) {
            Toast.show({
                time: 2, text: t('pl_en_plot_name_first'), ...AlertMesg[0]
            })
            return false;
        }
        if (!saveData.growth_stage) {
            Toast.show({
                time: 2, text: t('please_select_cultiveting_season_first'), ...AlertMesg[0]
            })
            return false;
        }
        if (!saveData.problem_type_id) {
            Toast.show({
                time: 2, text: t('please_select_problem_type'), ...AlertMesg[0]
            })
            return false;
        }
        if (!saveData.problem_name_id) {
            Toast.show({
                time: 2, text: t('please_select_problem'), ...AlertMesg[0]
            })
            return false;
        }
        if (!saveData.severity_id) {
            Toast.show({
                time: 2, text: t('please_select_severity'), ...AlertMesg[0]
            })
            return false;
        }
        if (!saveData.affected_date) {
            Toast.show({
                time: 2, text: t('Please_enter_perform_date'), ...AlertMesg[0]
            })
            return false;
        }
        if (!saveData.latitude) {
            Toast.show({
                time: 2, text: t('gpsalertdialogmessage'), ...AlertMesg[0]
            })
            return false;
        }
        return true;
    }
    const handleSave = async () => {
        if (validateForm()) {
            let array = [];
            const formData = new FormData();
            myphotoAll.forEach((photo) => {
                formData.append("photo", photo);
            });
            formData.append("file_title", JSON.stringify(myTitleAll));
            if (soundRecordFirstItem.result != "") {
                formData.append("audio", {
                    name: 'firstItem.mp3',
                    type: 'audio/mp3',
                    uri: `file://${RNFS.DocumentDirectoryPath}/firstItem.mp3`
                });
            }
            if (soundRecordSecoundItem.result != "") {
                formData.append("audio", {
                    name: 'secoundItem.mp3',
                    type: 'audio/mp3',
                    uri: `file://${RNFS.DocumentDirectoryPath}/secoundItem.mp3`
                });
            }
            if (soundRecordThirdItem.result != "") {
                formData.append("audio", {
                    name: 'thirdItem.mp3',
                    type: 'audio/mp3',
                    uri: `file://${RNFS.DocumentDirectoryPath}/thirdItem.mp3`
                });
            }
            formData.append("post_meta_info", JSON.stringify(array));
            // formData.append("agent_fcm", saveData.agent_fcm);
            formData.append("farmer_fcm", saveData.farmer_fcm);
            formData.append("latitude", saveData.latitude);
            formData.append("longitude", saveData.longitude);
            formData.append("question_type", saveData.question_type);
            formData.append("land_unit_id", saveData.land_unit_id);
            formData.append("category_id", saveData.category_id);
            formData.append("affected_area", saveData.affected_area);
            formData.append("crop_season_id", saveData.crop_season_id);
            formData.append("crop_type_id", saveData.crop_type_id);
            formData.append("crop_variety_id", saveData.crop_variety_id);
            formData.append("crop_name_id", saveData.crop_name_id);
            formData.append("plot_id", saveData.plot_id);
            formData.append("harvesting_date", saveData.harvesting_date);
            formData.append("sowing_date", saveData.sowing_date);
            formData.append("production_system", saveData.production_system);
            formData.append("agent_id", saveData.agent_id);
            formData.append("growth_stage_id", saveData.growth_stage);
            formData.append("problem_type_id", saveData.problem_type_id);
            formData.append("problem_name_id", saveData.problem_name_id);
            formData.append("affected_date", saveData.affected_date);
            formData.append("question_title", saveData.question_title);
            formData.append("question_desc", saveData.question_desc);
            formData.append("severity_id", saveData.severity_id);
            const database_res = await problemSaveAPI(dbname, lan_id, token, farmerID, formData);
            if (database_res.status === 200) {
                handleClear()
                // MessageDialog({ title: 'Successful', message: "Successfull Add Data" })
                Toast.show({ text: t('Data_submitted_successfully'), ...AlertMesg[0] })
                setTimeout(() => {
                    navigation.navigate('userList');
                }, 1500);
            }
        }
    }
    const onStartRecordFirstItem = async () => {
        const path = RNFS.DocumentDirectoryPath + "/firstItem.mp3";
        await RNFS.mkdir(RNFS.DocumentDirectoryPath);
        await audioRecorderPlayer.startRecorder(path);
        audioRecorderPlayer.addRecordBackListener(e => {
            setSoundRecordFirstItem({
                isLoggingIn: true,
                recordSecs: e.currentPosition,
                recordTime: audioRecorderPlayer.mmssss(
                    Math.floor(e.currentPosition),
                ),
            });
            // console.log('Recording . . . ', e.currentPosition);
            return;
        });
    };
    const onStartRecordSecoundItem = async () => {
        const path = RNFS.DocumentDirectoryPath + "/secoundItem.mp3";
        await RNFS.mkdir(RNFS.DocumentDirectoryPath);
        await audioRecorderPlayer.startRecorder(path);
        audioRecorderPlayer.addRecordBackListener(e => {
            setSoundRecordSecoundItem({
                isLoggingIn: true,
                recordSecs: e.currentPosition,
                recordTime: audioRecorderPlayer.mmssss(
                    Math.floor(e.currentPosition),
                ),
            });
            // console.log('Recording . . . ', e.currentPosition);
            return;
        });
    };
    const onStartRecordThirdItem = async () => {
        const path = RNFS.DocumentDirectoryPath + "/thirdItem.mp3";
        await RNFS.mkdir(RNFS.DocumentDirectoryPath);
        await audioRecorderPlayer.startRecorder(path);
        audioRecorderPlayer.addRecordBackListener(e => {
            setSoundRecordThirdItem({
                isLoggingIn: true,
                recordSecs: e.currentPosition,
                recordTime: audioRecorderPlayer.mmssss(
                    Math.floor(e.currentPosition),
                ),
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
            setSoundRecordFirstItem({ ...soundRecordFirstItem, isLoggingIn: false, result: result });
            // console.log("Stopped recording:", result);
            // navigation.navigate(navPath, { result: result,name:name });
        } catch (error) {
            console.error("Error stopping the recording:", error);
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
            console.error("Error stopping the recording:", error);
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
            console.error("Error stopping the recording:", error);
        }
        // }
    }, []);
    useEffect(() => {
        setSoundRecordFirstItem({
            item: '1',
            isLoggingIn: false,
            recordSecs: 0,
            recordTime: '00:00:00',
            result: ""
        });
        setSoundRecordSecoundItem({
            item: '2',
            isLoggingIn: false,
            recordSecs: 0,
            recordTime: '00:00:00',
            result: ""
        });
        setSoundRecordThirdItem({
            item: '3',
            isLoggingIn: false,
            recordSecs: 0,
            recordTime: '00:00:00',
            result: ""
        });
        if (isFocused) {
            setplotAll(agri_land_user_rels);
            setfarmerID(farmeruserID);
            setSearchFarmerName(userName);
            setSearchFarmerPhone(contactNumber);
            onPageLoad();
            onBackPress(() => { navigation.navigate('userList'); return true; })
        }
    }, [isFocused]);
    const HandlerGoBack = () => {
        navigation.navigate('userList');
    }
    return (
      <View style={styles.container}>
        <CustomHeader
          path="userList"
          HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />
        <DatePickerComp
          openDate={addAffectedDate}
          newDate={newFromDate}
          setOpenDate={setaddAffectedDate}
          handleDatePicker={handleDatePicker}
        />
        <FormsTitle title={t('add_crop_problem')} />
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
        <SafeAreaView>
          {searchResultsList && searchResultsList ? (
            <View style={styles.flatContainer}>
              <FlatList
                style={searchResults.length > 8 ? styles.flatlistHeight : ''}
                data={searchResults}
                renderItem={({item}) => (
                  <TouchableOpacity
                    onPress={() =>
                      handleResultSelect(item.label, item.value, item.phone)
                    }
                    style={styles.flatlistitem}>
                    <Text style={styles.flatlisttitle}>{item.label}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index}
              />
            </View>
          ) : (
            ''
          )}
        </SafeAreaView>
        <ScrollView>
          {isLoading ? (
            <View style={styles.loadingScreen}>
              <LoadingScreen />
            </View>
          ) : (
            <View style={styles.fromContainer}>
              <InputTextForm
                label={t('farmer_name')}
                value={searchFarmerName}
                onChangeText={farmerName => handleSearch(farmerName)}
                editable={false}
              />
              <InputTextForm
                label={t('farmer_number')}
                value={searchFarmerPhone}
                editable={false}
              />
              <DropdownForm
                label={t('plot')}
                data={plotAll}
                color="red"
                onChange={relId => handlePlot(relId)}
              />
              {showingMenu ? (
                <View style={styles.plotSiteContainer}>
                  <View style={styles.plotSiteContainerCell}>
                    <View style={styles.plotSiteContainerItem}>
                      <Text style={styles.plotSiteItemText}>
                        {t('crop_name')}
                      </Text>
                    </View>
                    <View style={styles.plotSiteContainerItem}>
                      <Text style={styles.plotSiteItemText}>
                        {nameVarityStartEnd.name}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.plotSiteContainerCell}>
                    <View style={styles.plotSiteContainerItem}>
                      <Text style={styles.plotSiteItemText}>
                        {t('crop_veriety')}
                      </Text>
                    </View>
                    <View style={styles.plotSiteContainerItem}>
                      <Text style={styles.plotSiteItemText}>
                        {nameVarityStartEnd.varity}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.plotSiteContainerCell}>
                    <View style={styles.plotSiteContainerItem}>
                      <Text style={styles.plotSiteItemText}>
                        {t('showing_date')}
                      </Text>
                    </View>
                    <View style={styles.plotSiteContainerItem}>
                      <Text style={styles.plotSiteItemText}>
                        {formatDateToMMDDYYYY(nameVarityStartEnd.cycleStarts)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.plotSiteContainerCell}>
                    <View style={styles.plotSiteContainerItem}>
                      <Text style={styles.plotSiteItemText}>
                        {t('harvesting_date_auto_calculated')}
                      </Text>
                    </View>
                    <View style={styles.plotSiteContainerItem}>
                      <Text style={styles.plotSiteItemText}>
                        {formatDateToMMDDYYYY(nameVarityStartEnd.cycleEnd)}
                      </Text>
                    </View>
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
                  setSaveData({
                    ...saveData,
                    growth_stage: production_stage.value,
                  })
                }
              />
              <DropdownForm
                label={t('problem_type')}
                color="red"
                data={problemTypeAll}
                onChange={item => handleProblemType(item)}
              />
              <DropdownForm
                label={t('select_problem')}
                color="red"
                data={problemNameAll}
                onChange={item => handleProblemName(item)}
              />
              {/* <DropdownForm label="Severity" data={severityAll} onChange={item => console.log(item)} /> */}
              <DropdownForm
                label={t('select_severity')}
                color="red"
                data={severityAll}
                onChange={item =>
                  setSaveData({...saveData, severity_id: item.value})
                }
              />
              <InputTextForm
                label={t('production_system')}
                value={nameVarityStartEnd.production_process}
                editable={false}
              />
              <View>
                <Text style={{color: 'red'}}>
                  {t('agent_crop_problem_affected_date')}
                </Text>
                <TouchableOpacity
                  style={styles.activityPerFromDate}
                  onPress={() => setaddAffectedDate(true)}>
                  <Text style={{color: '#000'}}>{affectedDate}</Text>
                  <Image
                    source={require('../../Common/images/calendar.png')}
                    style={{width: 20, height: 20}}
                  />
                </TouchableOpacity>
              </View>
              <InputTextForm
                label={t('enter_problem_title')}
                onChangeText={item =>
                  setSaveData({...saveData, question_title: item})
                }
                value={saveData.question_title}
              />
              <InputTextForm
                label={t('enter_problem_description')}
                onChangeText={item =>
                  setSaveData({...saveData, question_desc: item})
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
              />
            </View>
          )}
        </ScrollView>
        <View style={{marginTop: 10}}>
          <ButtonForm label={t('submit')} onPress={() => handleSave()} />
        </View>
        <Root></Root>
      </View>
    );
}

export default CrateProblemUser

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleContainer: {
        width: "95%",
        alignItems: 'flex-end',
        paddingVertical: 10,
    },
    title: {
        color: '#000',
    },
    fromContainer: {
        width: '90%',
        marginHorizontal: '5%',
        marginBottom: 50
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
    plotSiteContainer: {

        borderWidth: 0.5,
        borderColor: '#000',
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#FFF',
        marginBottom: 10
    },
    plotSiteContainerCell: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        backgroundColor: '#FFF',
        marginBottom: 2
    },
    plotSiteContainerItem: {
        width: '50%'
    },
    plotSiteItemText: {
        color: '#000',
        marginVertical: 5
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
        padding: 10
    },

    flatlisttitle: {
        padding: 10,
        color: '#000'
    },

    flatlistHeight: {
        height: Dimensions.get('window').height / 3
    },


    container_recording: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10
    },
    item_recording: {
        // backgroundColor: '#e9e9e9',
        width: '30%',
        paddingVertical: 10,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        TouchableOpacityAlign: 'center'
    },
    title_recording: {
        paddingVertical: 10,
        color: '#000'
    },
    loadingScreen: {
        position: 'absolute',
        top: 100,
        backgroundColor: "#FFF"
    },
})