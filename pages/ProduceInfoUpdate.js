import { StyleSheet, StatusBar, Text, View, ScrollView, TextInput, TouchableOpacity, Image, CheckBox, Button, SafeAreaView } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import Logo from './Common/Logo'
import ButtonForm from './Common/ButtonForm'
import { useNavigation, useRoute } from '@react-navigation/native';
import InputTextForm from './Common/InputTextForm'
import DropdownForm from './Common/DropdownForm';
import config from '../config';
import axios from 'axios';
import ImageForm from './Common/ImageForm';
import DatePicker from 'react-native-date-picker';
import Geolocation from '@react-native-community/geolocation';
import { getItem, setItem, removeItem } from '../config/getDataFromStorage';
import { isNotEmpty } from './Common/ValidationFunctions';
import MessageDialog from './Common/MessageDialog';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CrashlyticsRecordError } from './Crashlytics/CrashlyticsRecordError';
import DeviceInfo from './DeviceInfo';
import { Root, Popup, Toast, SPSheet } from 'react-native-popup-confirm-toast';
import { AlertMesg } from './Common/ToastAlert';
import BottomSheetTakePhoto from './Common/BottomSheetTakePhoto';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import CameraScreen from './Common/VideoCamera';
const ProduceInfoUpdate = () => {
    const { netConnection } = DeviceInfo();
    const ForegroundLocationData = useSelector(state => state.locationData);
    const { t } = useTranslation();
    const route = useRoute();
    const { pagename, arrayIndex } = route.params;
    const navigation = useNavigation();
    const [dbName, setdbName] = useState();
    const [lanID, setlanID] = useState();

    const [storeProduceInfoInArray, setstoreProduceInfoInArray] = useState([])
    const [storeProduceInfo, setstoreProduceInfo] = useState({
        plotSiteName: "",
        daagNo: "",
        khatianNo: "",
        noOfPlants: "",
        terrainType: "",
        landType: "",
        soilType: "",
        plotSize: "",
        landUnit: "",
        landUnitName: "",
        landUnitSize: "",
        prodctionSeasion: "",
        livelihoodType: "",
        produceName: "",
        produceVariety: "",
        productionProcess: "",
        expectedProduction: "",
        produceProductionUnit: "",
        cycleStarts: "",
        cycleEnds: "",
        lat: "",
        long: "",
        photographs: "",
        treeLat: "",
        treeLong: ""
    });
    const [newdate, setnewDate] = useState(new Date())
    const [opencycleStarts, setOpencycleStarts] = useState(false)
    const [opencycleEnds, setOpencycleEnds] = useState(false)
    const [terrainTypeData, setterrainTypeData] = useState([]);
    const [landTypeData, setlandTypeData] = useState([]);
    const [soilTypeData, setsoilTypeData] = useState([]);
    const [landUnitData, setlandUnitData] = useState([]);
    const [prodctionSeasionData, setprodctionSeasionData] = useState([]);
    const [livelihoodTypeData, setlivelihoodTypeData] = useState([]);
    const [produceNameData, setproduceNameData] = useState([]);
    const [produceVarietyData1, setproduceVarietyData1] = useState([]);
    const [produceVarietyData, setproduceVarietyData] = useState([]);
    const [productionProcessData, setproductionProcessData] = useState([]);
    const [produceProductionUnitData, setproduceProductionUnitData] = useState([]);
    const [isChecked, setIsChecked] = useState(false);
    const [photographs, setPhotographs] = useState([
        { uri: "", type: "", name: "", id: "", oldimgName: "" },
        { uri: "", type: "", name: "", id: "", oldimgName: "" },
        { uri: "", type: "", name: "", id: "", oldimgName: "" },
        { uri: "", type: "", name: "", id: "", oldimgName: "" },
    ]);
    const [plotRecord, setPlotRecord] = useState({
        uri: "", type: "", name: ""
    });
    const [plotVideo, setPlotVideo] = useState({
        uri: "", type: "", name: "", id: ""
    });
    const [individualTreeImg, setIndividualTreeImg] = useState({
        uri: "", type: "", name: ""
    });
    const camera = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingStart, setRecordingStart] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);

    const toggleCheckbox = () => {
        setIsChecked(!isChecked);
        // console.log(isChecked);
    };

    const allAPIHere = async (dbname, language_id) => {
        const axiosConfig = {
            headers: {
                'information': `${dbname},${language_id}`,
                'Accept': 'application/json'
            },
        };
        const axiosConfig1 = {
            headers: {
                'information': `${dbname}`,
                'Accept': 'application/json'
            },
        };
        const prodctionSeasionAPI = config.prodctionSeasionAPI1 + language_id + config.prodctionSeasionAPI2;
        var soilTypeArray = [];
        var terraintypeArray = [];
        var landTypeArray = [];
        var livelihoodTypeArray = [];
        var prodctionSeasionArray = [];
        var landUnitArray = [];
        var productionProcessArray = [];
        var produceProductionUnitArray = [];
        try {
            if (netConnection) {
                const [soilType_res, terraintype_res, landType_res, livelihoodType_res, prodctionSeasion_res,
                    landUnit_res, productionProcess_res, produceProductionUnit_res] = await Promise.all([
                        axios.get(config.soiltypeAPI, axiosConfig),
                        axios.get(config.terraintypeAPI, axiosConfig),
                        axios.get(config.landtypeAPI, axiosConfig),
                        axios.get(prodctionSeasionAPI, axiosConfig1),
                        axios.get(prodctionSeasionAPI, axiosConfig1),
                        axios.get(config.landunitAPI, axiosConfig),
                        axios.get(config.productionProcessAPI, axiosConfig),
                        axios.get(config.produceProductionUnitAPI, axiosConfig)
                    ])
                if (soilType_res.data.data.count > 0) {
                    soilType_res.data.data.rows.forEach(element => {
                        soilTypeArray.push({
                            value: element.id,
                            label: element.name,
                        });
                    });
                }
                if (terraintype_res.data.data.count > 0) {
                    terraintype_res.data.data.rows.forEach(element => {
                        terraintypeArray.push({
                            value: element.id,
                            label: element.name,
                        });
                    });
                }
                if (landType_res.data.data.count > 0) {
                    landType_res.data.data.rows.forEach(element => {
                        landTypeArray.push({
                            value: element.id,
                            label: element.name,
                        });
                    });
                }
                if (livelihoodType_res.data.data) {
                    livelihoodType_res.data.data.crop_type.forEach(element => {
                        livelihoodTypeArray.push({
                            value: element.fid,
                            label: element.name,
                        });
                    });
                }
                if (prodctionSeasion_res.data.data) {
                    prodctionSeasion_res.data.data.crop_season.forEach(element => {
                        prodctionSeasionArray.push({
                            value: element.fid,
                            label: element.name,
                        });
                    });
                }
                if (landUnit_res.data.data.count > 0) {
                    landUnit_res.data.data.rows.forEach(element => {
                        landUnitArray.push({
                            value: element.id,
                            label: element.name,
                            sizevalue: element.unit_value,
                        });
                    });
                }
                if (productionProcess_res.data.data.count > 0) {
                    productionProcess_res.data.data.rows.forEach(element => {
                        productionProcessArray.push({
                            value: element.fid,
                            label: element.name,
                        });
                    });
                }
                if (produceProductionUnit_res.data.data) {
                    produceProductionUnit_res.data.data.rows.forEach(element => {
                        produceProductionUnitArray.push({
                            value: element.fid,
                            label: element.unit_name,
                        });
                    });
                }
            } else {
                [
                    soilTypeArray,
                    terraintypeArray,
                    landTypeArray,
                    livelihoodTypeArray,
                    prodctionSeasionArray,
                    landUnitArray,
                    productionProcessArray,
                    produceProductionUnitArray,
                ] = await Promise.all([
                    getItem('soilType_res'),
                    getItem('terraintype_res'),
                    getItem('landType_res'),
                    getItem('livelihoodType_res'),
                    getItem('prodctionSeasion_res'),
                    getItem('landUnit_res'),
                    getItem('productionProcess_res'),
                    getItem('produceProductionUnit_res'),
                ]);

            }
            setlandUnitData(landUnitArray);
            setsoilTypeData(soilTypeArray);
            setterrainTypeData(terraintypeArray);
            setlandTypeData(landTypeArray);
            setlivelihoodTypeData(livelihoodTypeArray);
            setprodctionSeasionData(prodctionSeasionArray);
            setproductionProcessData(productionProcessArray);
            setproduceProductionUnitData(produceProductionUnitArray);
        } catch (error) {
            CrashlyticsRecordError(error.response)
        }

    }
    const HandlelivehoodType = async (livelihoodType) => {
        setstoreProduceInfo({ ...storeProduceInfo, livelihoodType: livelihoodType })
        produceNameDataList(livelihoodType, lanID, dbName);
    }
    const produceNameDataList = async (livelihoodType, language_id, dbName) => {
        const axiosConfig1 = {
            headers: {
                'information': `${dbName}`,
                'Accept': 'application/json'
            },
        };
        try {
            let produceNameArray = [];
            let produceName_offline_list_arr = [];
            let produceName_offline_list = await getItem('produceName_res');
            const produceNameAPI = config.produceNameAPI1 + language_id + config.produceNameAPI2 + livelihoodType.value + config.produceNameAPI3;
            if (netConnection) {
                let produceName_res = await axios.get(produceNameAPI, axiosConfig1);
                if (produceName_res.data.data) {
                    produceName_res.data.data.crop_name.forEach(element => {
                        produceNameArray.push({
                            value: element.crop_name.fid,
                            label: element.crop_name.name,
                        });
                    });
                    if (produceName_offline_list != null && produceName_offline_list.length > 0) {
                        if (produceName_offline_list[0][livelihoodType.value] != undefined) {
                            JSON.parse(
                                produceName_offline_list[0][livelihoodType.value],
                            ).push({
                                [livelihoodType.value]: JSON.stringify(produceNameArray),
                            });
                        } else {
                            produceName_offline_list.push({
                                [livelihoodType.value]: JSON.stringify(produceNameArray),
                            });
                        }
                    } else {
                        produceName_offline_list_arr.push({
                            [livelihoodType.value]: JSON.stringify(produceNameArray),
                        });
                        produceName_offline_list = produceName_offline_list_arr;
                    }
                    await setItem('produceName_res', produceName_offline_list);
                }
            } else {
                if (produceName_offline_list) {
                    produceName_offline_list_arr = produceName_offline_list.filter(
                        function (v, i) {
                            return (
                                produceName_offline_list[i][livelihoodType.value] != undefined
                            );
                        },
                    );
                    if (produceName_offline_list_arr.length != 0) {
                        produceNameArray = JSON.parse(
                            produceName_offline_list_arr[0][livelihoodType.value],
                        );
                    } else {
                        produceNameArray = [];
                    }
                }
            }
            setproduceNameData(produceNameArray);
        } catch (error) {
            CrashlyticsRecordError(error.response)
            console.log("Error in produceName API", error);
        }
    }
    const HandleproduceName = async (produceName) => {
        setstoreProduceInfo({ ...storeProduceInfo, produceName: produceName })
        produceVarientyDataList(produceName, lanID, dbName);
    }
    const produceVarientyDataList = async (produceName, language_id, dbName) => {
        const axiosConfig1 = {
            headers: {
                'information': `${dbName}`,
                'Accept': 'application/json'
            },
        };
        try {
            const produceVarietyAPI = config.produceVarietyAPI1 + language_id + config.produceVarietyAPI2 + storeProduceInfo.livelihoodType + config.produceVarietyAPI3 + produceName.value;
            let produceVarietyArray = [];
            let produceVariety_offline_list_arr = [];
            let produceVariety_offline_list = await getItem('produceVariety_res');
            if (netConnection) {
                let produceVariety_res = await axios.get(produceVarietyAPI, axiosConfig1);
                if (produceVariety_res.data.data) {
                    produceVariety_res.data.data.crop_variety.forEach(element => {
                        produceVarietyArray.push({
                            value: element.crop_variety.fid,
                            label: element.crop_variety.name,
                        });
                    });
                    if (produceVariety_offline_list != null && produceVariety_offline_list.length > 0) {
                        if (produceVariety_offline_list[0][produceName.value] != undefined) {
                            JSON.parse(
                                produceVariety_offline_list[0][produceName.value],
                            ).push({ [produceName.value]: JSON.stringify(produceVarietyArray), });
                        } else {
                            produceVariety_offline_list.push({
                                [produceName.value]: JSON.stringify(produceVarietyArray),
                            });
                        }
                    } else {
                        produceVariety_offline_list_arr.push({
                            [produceName.value]: JSON.stringify(produceVarietyArray),
                        });
                        produceVariety_offline_list = produceVariety_offline_list_arr;
                    }
                    await setItem('produceVariety_res', produceVariety_offline_list);
                }
            } else {
                if (produceVariety_offline_list) {
                    produceVariety_offline_list_arr = produceVariety_offline_list.filter(
                        function (v, i) {
                            return (
                                produceVariety_offline_list[i][produceName.value] != undefined
                            );
                        },
                    );
                    if (produceVariety_offline_list_arr.length != 0) {
                        produceVarietyArray = JSON.parse(
                            produceVariety_offline_list_arr[0][produceName.value],
                        );
                    } else {
                        produceVarietyArray = [];
                    }
                }
            }
            setproduceVarietyData(produceVarietyArray);
        } catch (error) {
            CrashlyticsRecordError(error.response)
            console.log("Error in produceVariety API", error);
        }
    }
    const handlecycleEnd = async (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const cycleEnds = x1[0] + '-' + x1[1] + '-' + x1[2];
        setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: cycleEnds });
    }
    const getLocation = async (item) => {
        const fusedLocation = await getItem('fusedLocation');
        const { latitude, longitude } = fusedLocation;
        // if (ForegroundLocationData != null) {
        //     setstoreProduceInfo({ ...storeProduceInfo, lat: ForegroundLocationData.latitude, long: ForegroundLocationData.longitude })
        // }
        // if (
        //   fusedLocation != null && longitude.toString().length == 10 && latitude.toString().length == 10
        // ) {
        if (item == "tree") {
            setstoreProduceInfo({ ...storeProduceInfo, treeLat: latitude, treeLong: longitude })
        } else {
            setstoreProduceInfo({ ...storeProduceInfo, lat: latitude, long: longitude })
        }
        // } else {
        //   Toast.show({
        //     text: 'Please try again to reach the accurancy',
        //     ...AlertMesg[0],
        //   });
        // }

    }
    const handleLandUnit = async (item) => {
        let landUnitSize;
        if (item.sizevalue > 0) {
            landUnitSize = storeProduceInfo.plotSize * item.sizevalue;
        } else {
            landUnitSize = storeProduceInfo.plotSize * 1;
        }
        setstoreProduceInfo({
            ...storeProduceInfo,
            sizevalue: item.sizevalue,
            landUnit: item.value,
            landUnitSize: landUnitSize,
            landUnitName: item.label,
        });
    }

    const handleSave = async () => {
        if (storeProduceInfo.plotSize == "") {
            Toast.show({ time: 3, text: `${t('please_enter_unit')}`, ...AlertMesg[0] });
        } else if (!storeProduceInfo.productionProcess.value) {
            Toast.show({ time: 3, text: `${t('please_give_yeild_size')}`, ...AlertMesg[0] });
        } else if (storeProduceInfo.livelihoodType == "") {
            Toast.show({ time: 3, text: `${t('please_select_crop_type_first')}`, ...AlertMesg[0] });
        } else if (storeProduceInfo.produceName == "") {
            Toast.show({ time: 3, text: `${t('please_select_crop_name_first')}`, ...AlertMesg[0] })
        } else if (storeProduceInfo.produceVariety == "") {
            Toast.show({ time: 3, text: `${t('please_select_crop_veriety_first')}`, ...AlertMesg[0] })
        } else {
            await removeItem('storeProduceInfo_data');
            storeProduceInfoInArray[arrayIndex]["photographs"] = photographs;
            storeProduceInfoInArray[arrayIndex]["plotRecord"] = plotRecord;
            storeProduceInfoInArray[arrayIndex]["plotVideo"] = plotVideo;
            storeProduceInfoInArray[arrayIndex]["individualTreeImg"] = individualTreeImg;
            storeProduceInfoInArray[arrayIndex].storeProduceInfo = storeProduceInfo;
            await setItem('storeProduceInfo_data', storeProduceInfoInArray);
            setPhotographs([
                { uri: "", type: "", name: "", id: "", oldimgName: "" },
                { uri: "", type: "", name: "", id: "", oldimgName: "" },
                { uri: "", type: "", name: "", id: "", oldimgName: "" },
                { uri: "", type: "", name: "", id: "", oldimgName: "" },
            ]);
            navigation.navigate(pagename, { pagename: '' });
        }
    }
    const onPageLoad = async () => {
        const [storeSignup_data, storePersnolInfo_data,
            storeProduceInfo_data, produceVariety] = await Promise.all([
                getItem('storeSignup_data'),
                getItem('storePersnolInfo_data'),
                getItem('storeProduceInfo_data'),
                getItem('produceVariety')
            ]);
        if (storeProduceInfo_data) {
            const photographsValue = [...photographs];
            storeProduceInfo_data[arrayIndex].photographs.map((data, e) => {
                photographsValue[e] = data;
            });
            setPhotographs(photographsValue)
            const plotRecord = storeProduceInfo_data[arrayIndex].plotRecord;
            setPlotRecord(plotRecord);
            const plotVideo = storeProduceInfo_data[arrayIndex].plotVideo;
            setPlotVideo(plotVideo);
            const individualTreeImg = storeProduceInfo_data[arrayIndex].individualTreeImg;
            setIndividualTreeImg(individualTreeImg);
        }
        const dbName = storeSignup_data.company.dbname;
        const languageID = storePersnolInfo_data.language.value;
        setdbName(dbName)
        setlanID(languageID)
        allAPIHere(dbName, languageID);
        let produceVarietyArray = [];
        if (produceVariety) {
            produceVariety.crop_variety.forEach(element => {
                produceVarietyArray.push({
                    value: element.crop_variety.fid,
                    label: element.crop_variety.name,
                });
            });
            setproduceVarietyData(produceVarietyArray);
        }
        if (storeProduceInfo_data) {
            setstoreProduceInfoInArray(storeProduceInfo_data);
            setstoreProduceInfo(storeProduceInfo_data[arrayIndex].storeProduceInfo)
            if (storeProduceInfo_data[arrayIndex].storeProduceInfo.livelihoodType) {
                produceNameDataList(storeProduceInfo_data[arrayIndex].storeProduceInfo.livelihoodType, languageID, dbName);
                produceVarientyDataList(storeProduceInfo_data[arrayIndex].storeProduceInfo.produceName, languageID, dbName);
            }
            if (storeProduceInfo_data[arrayIndex].storeProduceInfo.produceName && storeProduceInfo_data[arrayIndex].storeProduceInfo.livelihoodType) {
                produceVarientyDataList(storeProduceInfo_data[arrayIndex].storeProduceInfo.produceName, languageID, dbName);
            }
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            onPageLoad();
        }, [netConnection])
    );
    const openlaunchCamera = (id, index) => {
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
                let imageUri = response.uri || response.assets?.[0]?.uri;
                console.log(response.assets[0].fileName)
                const photographsValue = [...photographs];
                photographsValue[index] = { uri: response.assets[0].uri, type: response.assets[0].type, id: id, name: response.assets[0].fileName }
                setPhotographs(photographsValue);
                SPSheet.hide();
            }
        });
    };
    const openlaunchImageLibrary = (id, index, type) => {
        const photographsValue = [...photographs];
        const options = {
            mediaType: 'photo',
            includeBase64: true,
            maxHeight: 200,
            maxWidth: 200,
        };
        launchImageLibrary(options, response => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('Image picker error: ', response.error);
            } else {
                let imageUri = response.uri || response.assets[0].base64;
                if (type == "plotRecord") {
                    setPlotRecord({ ...plotRecord, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName, id: id })
                } else {
                    photographsValue[index] = { uri: response.assets[0].uri, type: response.assets[0].type, id: id, name: response.assets[0].fileName }
                    setPhotographs(photographsValue);
                }
                SPSheet.hide();
            }
        });
    };
    const onStartRecording = async (id) => {
        if (!camera.current) {
            return;
        }
        setIsRecording(true);
        if (isRecording == false) {
            camera.current.startRecording({
                onRecordingFinished: (video) => {
                    setPlotVideo({
                        ...plotVideo, uri: `file:///${video.path}`, type: "", name: "", id: id
                    })
                    setIsRecording(false);
                    setRecordingStart(false);
                    console.log(video)
                },
                onRecordingError: (error) => {
                    setRecordingDuration(0);
                    console.error(error);
                    setIsRecording(false);
                    setRecordingStart(false);
                },
            });
        } else {
            camera.current?.stopRecording();
            setRecordingDuration(0);
        }
    };
    return (
        <Root>
            {/* <ForegroundLocationService /> */}
            <StatusBar barStyle="light-content" backgroundColor="#023316" />
            {recordingStart ?
                <CameraScreen recordingDuration={recordingDuration} plotVideo={plotVideo} camera={camera} isRecording={isRecording} onStartRecording={onStartRecording} setRecordingDuration={setRecordingDuration} />
                : <>
                    <ScrollView style={{ backgroundColor: '#D5FFD0' }}>
                        <View style={{ paddingHorizontal: 20, marginBottom: 120 }}>
                            <Logo iheight={100} iwidth={100} />
                            <InputTextForm label={t('pre_plot_name')} color="black" onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, plotSiteName: item })} value={storeProduceInfo.plotSiteName} />

                            <InputTextForm label={t('khatian_no')} onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, khatianNo: item })} value={storeProduceInfo.khatianNo} />

                            <InputTextForm label={t('no_of_plants')} onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, noOfPlants: item })} value={storeProduceInfo.noOfPlants} editable={false} />

                            <DropdownForm label={t('addland_terrain_type')} color="black" data={terrainTypeData} onChange={item => setstoreProduceInfo({ ...storeProduceInfo, terrainType: item })} val={storeProduceInfo.terrainType.label} />

                            <DropdownForm label={t('addland_soil_type')} color="black" data={landTypeData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, landType: item }) }} val={storeProduceInfo.landType.label} />

                            <DropdownForm label={t('select_soil_type')} color="black" data={soilTypeData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, soilType: item }) }} val={storeProduceInfo.soilType.label} />

                            <InputTextForm label={t('addland_landsize')} onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, plotSize: item })} value={storeProduceInfo.plotSize} />

                            <DropdownForm label={t('addland_unit')} color="black" data={landUnitData} onChange={(item) => handleLandUnit(item)} val={storeProduceInfo.landUnitName} />

                            <View style={{ marginBottom: 4 }}>
                                <TouchableOpacity onPress={() => getLocation("")}>
                                    {
                                        storeProduceInfo.lat ?
                                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={{ color: '#000' }}>{storeProduceInfo.lat}</Text>
                                                <Text style={{ color: '#000' }}>{storeProduceInfo.long}</Text>
                                            </View>
                                            : ""
                                    }

                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ color: 'red' }}>{t('tap_to_get_latitude_and_longitude')}</Text>
                                        <Image source={require('./Common/images/map.png')} style={{ width: 50, height: 50 }} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.title, { marginVertical: 20 }]}>Photographs of Plot</Text>
                            <View style={styles.photographsContainer}>
                                {
                                    photographs.map((data, index) => {
                                        if (index < 4) {
                                            return (
                                                <BottomSheetTakePhoto key={index}
                                                    openlaunchCamera={() => openlaunchCamera(data.id, index)}
                                                    openlaunchImageLibrary={() => openlaunchImageLibrary(data.id, index, "")}
                                                    uploadTreeImage={data}
                                                    TakePhoto={"Take Photo"}
                                                    ChooseFromGallery={"Choose From Gallery"}
                                                    Cancel={"Cancel"}
                                                    height={250}
                                                />
                                            )
                                        }
                                    })
                                }
                                {/* {photographs.map((data, index) => {
                                    if (index < 4) {
                                        return (
                                            <BottomSheetTakePhoto key={index}
                                                openlaunchCamera={() => openlaunchCamera(data.id, index)}
                                                openlaunchImageLibrary={() => openlaunchImageLibrary(data.id, index, "")}
                                                uploadTreeImage={data}
                                                TakePhoto={"Take Photo"}
                                                ChooseFromGallery={"Choose From Gallery"}
                                                Cancel={"Cancel"}
                                                height={250}
                                            />
                                        )
                                    }
                                })} */}
                            </View>
                            <Text style={[styles.title, { marginVertical: 20 }]}>UPload Land Record as proof of ownership</Text>
                            <TouchableOpacity onPress={() => openlaunchImageLibrary(plotRecord.id, 5, 'plotRecord')}>
                                {plotRecord.name == "" ? <Image source={require('./Common/images/adobereader.png')} style={{ width: 80, height: 80 }} />
                                    : <Image
                                        source={{ uri: plotRecord.uri }}
                                        style={{ width: 60, height: 60, marginBottom: 10 }}
                                        resizeMode="contain"
                                    />}
                            </TouchableOpacity>
                            <View style={{ marginVertical: 20 }}>
                                <BottomSheetTakePhoto
                                    title={"Short Video Clip of Plantation"}
                                    openlaunchCamera={() => { setRecordingStart(true), SPSheet.hide() }}
                                    openlaunchImageLibrary={() => { setRecordingStart(true), SPSheet.hide() }}
                                    // uploadTreeImage={photographsFour}
                                    TakePhoto={"Take Video"}
                                    // ChooseFromGallery={"Choose From Gallery"}
                                    Cancel={"Cancel"}
                                    height={200}
                                    VideoProps={plotVideo.uri}
                                />
                            </View>
                            <Text style={[styles.title, { marginVertical: 20 }]}>Photograph of Individual Tree</Text>
                            <TouchableOpacity onPress={() => openlaunchImageLibrary(plotRecord.id, 5, 'individualTree')} style={{ opacity: 0.7 }}>
                                {individualTreeImg.name == "" ? <Image source={require('./Common/images/camera.jpeg')} style={{ width: 60, height: 60 }} />
                                    : <Image
                                        source={{ uri: individualTreeImg.uri }}
                                        style={{ width: 60, height: 60, marginBottom: 10 }}
                                        resizeMode="contain"
                                    />}
                            </TouchableOpacity>
                            <DropdownForm label={t('addcrop_cultivating_season')} color="black" data={prodctionSeasionData} onChange={item => {
                                setstoreProduceInfo({
                                    ...storeProduceInfo, prodctionSeasion: item,
                                    livelihoodType: "",
                                    produceName: "",
                                    produceVariety: ""
                                })
                            }} val={storeProduceInfo.prodctionSeasion.label} />
                            <DropdownForm label={t('addcrop_croptype')} color="black" data={livelihoodTypeData} onChange={item => HandlelivehoodType(item)} val={storeProduceInfo.livelihoodType.label} />

                            <DropdownForm label={t('select_crop_name')} color="black" data={produceNameData} onChange={item => HandleproduceName(item)} val={storeProduceInfo.produceName.label} />

                            <DropdownForm label={t('select_crop_variety')} color="black" data={produceVarietyData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, produceVariety: item }) }} val={storeProduceInfo.produceVariety.label} />



                            <DropdownForm label={t('production_system')} color="black" data={productionProcessData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, productionProcess: item }) }} val={storeProduceInfo.productionProcess.label} />

                            <InputTextForm label={t('expected_yield')} color="black" onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, expectedProduction: item })} value={storeProduceInfo.expectedProduction} />

                            <DropdownForm label={t('select_unit')} color="black" data={produceProductionUnitData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, produceProductionUnit: item }) }} val={storeProduceInfo.produceProductionUnit.label} />
                            <View style={{ marginBottom: 4 }}>
                                <TouchableOpacity onPress={() => getLocation("tree")}>

                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ color: '#000' }}>{storeProduceInfo.treeLat}</Text>
                                        <Text style={{ color: '#000' }}>{storeProduceInfo.treeLong}</Text>
                                    </View>


                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ color: 'red' }}>{t('tap_to_get_latitude_and_longitude')}</Text>
                                        <Image source={require('./Common/images/map.png')} style={{ width: 50, height: 50 }} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View>
                                <Text style={{ marginBottom: 5, marginLeft: 5, color: 'red' }}>{t('showing_date')}</Text>
                                <View style={styles.passwordMainContainer}>
                                    <View style={styles.passwordContainer}>
                                        <Text style={styles.inputTextStyle} onPress={() => setOpencycleEnds(true)}>{storeProduceInfo.cycleEnds}</Text>
                                        <TouchableOpacity onPress={() => setOpencycleEnds(true)}>
                                            <ImageForm
                                                source={require('./Common/images/date.png')}
                                                resizeMode="cover"
                                                height={30}
                                                width={30}
                                            />
                                        </TouchableOpacity>
                                        <DatePicker
                                            modal
                                            mode="date"
                                            open={opencycleEnds}
                                            date={newdate}
                                            minimumDate={storeProduceInfo.cycleEnds == "" ? "" : new Date(`${new Date(storeProduceInfo.cycleEnds).getFullYear()}-${new Date(storeProduceInfo.cycleEnds).getMonth() + 1}-${new Date(storeProduceInfo.cycleEnds).getDate() + 1}`)}
                                            onConfirm={(item) => {
                                                handlecycleEnd(item)
                                                setOpencycleEnds(false)
                                            }}
                                            onCancel={() => {
                                                setOpencycleEnds(false)
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                    </ScrollView>
                    <View style={{ marginTop: 10 }}>
                        <ButtonForm label={t('save')} onPress={() => handleSave('SignUpViwer')} />
                    </View>
                </>}
        </Root>
    )
}

export default ProduceInfoUpdate

const styles = StyleSheet.create({
    container: {
        margin: 10
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: 'black',
        borderRadius: 3,
        marginRight: 8,
    },
    checked: {
        backgroundColor: 'blue', // Change to the desired color when checked
    },
    passwordMainContainer: {
        flex: 1,
        alignItems: 'center',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        width: '100%',
        paddingEnd: 8,
        backgroundColor: 'white',
        height: 40,
        marginBottom: 15,
    },
    inputTextStyle: {
        flex: 1,
        paddingHorizontal: 5,
        paddingVertical: 10,
        marginHorizontal: 10,
        borderColor: 'gray',
        color: '#000'
    },
    photographsContainer: {
        flexDirection: "row",
        justifyContent: "space-around"
    },
    title: {
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    }
})
