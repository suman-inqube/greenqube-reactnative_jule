import { StyleSheet, Text, View, Keyboard } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { PlotSiteUserLandDetails, problemPlotAgainstFarmerAPI } from '../../config/apiHere';
import loginUserDataController from './loginUserDataController';
import axios from 'axios';
import config from '../../config';
import { getItem } from '../../config/getDataFromStorage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Root, SPSheet, Toast } from 'react-native-popup-confirm-toast';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { greenZownlistMultiLatLong, greenZownTreeImg, greenZownRouteUserLandEdit } from '../../config/apiHere';
import { AlertMesg } from '../Common/ToastAlert';
import { useTranslation } from 'react-i18next';
import { onBackPress } from '../Common/BackPressHandler';
const FarmerLiveHoodController = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const camera = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [plotAll, setplotAll] = useState([]);
    const { GetLoginUserData, loginUserData } = loginUserDataController();
    const { dbname, lan_id, token, user_id } = loginUserData;
    const [terrainTypeAll, setterrainTypeAll] = useState([]);
    const [soilTypeAll, setsetsoilTypeAll] = useState([]);
    const [landTypeAll, setlandTypeAll] = useState([]);
    const [unitAll, setUnitAll] = useState([]);
    const [plotDetails, setPlotDetails] = useState({
        name: "", value: ""
    })
    const [treeainTypeData, setTreeainTypeData] = useState({
        name: "", value: "",
    });
    const [landTypeAllData, setlandTypeAllData] = useState({
        name: "", value: "",
    });
    const [soilTypeData, setsoilTypeData] = useState({
        name: "", value: "",
    });
    const [landUnitData, setlandUnitData] = useState({
        name: "", value: "",
    });
    const [photographsOne, setPhotographsOne] = useState({
        uri: "", type: "", name: "", id: "", oldimgName: "",
    });
    const [photographsTwo, setPhotographsTwo] = useState({
        uri: "", type: "", name: "", id: "", oldimgName: "",
    });
    const [photographsThree, setPhotographsThree] = useState({
        uri: "", type: "", name: "", id: "", oldimgName: "",
    });
    const [photographsFour, setPhotographsFour] = useState({
        uri: "", type: "", name: "", id: "", oldimgName: "",
    });
    const [landSize, setlandSize] = useState("");
    const [khasraNo, setKhasraNo] = useState("");
    const [location, setLocation] = useState([
        { latitude: "", longitude: "" },
        { latitude: "", longitude: "" },
        { latitude: "", longitude: "" },
        { latitude: "", longitude: "" }
    ]);
    const [plotVideo, setPlotVideo] = useState("");
    const [plotRecord, setPlotRecord] = useState({
        uri: "", type: "", name: "", oldimgName: ""
    });
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [photo_to_be_deleted, setphoto_to_be_deleted] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingStart, setRecordingStart] = useState(false)
    const [videoData, setVideo] = useState();
    const onPageLoad = async () => {
        setIsLoading(true);
        const [GetLoginUserDataRes] = await Promise.all([
            GetLoginUserData(),
        ]);
        if (GetLoginUserDataRes) {
            const { dbname, lan_id, token, user_id } = GetLoginUserDataRes;
            const axiosConfig = {
                headers: {
                    'information': `${dbname},${lan_id}`,
                    'Accept': 'application/json'
                },
            };
            const [plotSiteApi] = await Promise.all([
                problemPlotAgainstFarmerAPI(dbname, lan_id, token, user_id),
                terraintype_resAPI(axiosConfig),
                soilType_resAPI(axiosConfig),
                landType_resAPI(axiosConfig),
                landunit_resAPI(axiosConfig),
            ]);
            if (plotSiteApi.status == 200) {
                setIsLoading(false);
                const dataArray = [];
                plotSiteApi.data.data.forEach(element => {
                    dataArray.push({
                        value: element.rel_id,
                        label: element.plot_no
                    });
                });
                setplotAll(dataArray);
            }
        }
    }
    useEffect(() => {
        if (isFocused) {
            onPageLoad();
            onBackPress(handleBackPress);
        }
    }, [isFocused])
    function handleBackPress() {
        navigation.navigate("userList");
        return true;
    }
    const terraintype_resAPI = async (axiosConfig) => {
        try {
            let terraintype_res = await axios.get(config.terraintypeAPI, axiosConfig);
            let terraintypeArray = [];
            if (terraintype_res.data.data.count > 0) {
                terraintype_res.data.data.rows.forEach(element => {
                    terraintypeArray.push({
                        value: element.id,
                        label: element.name,
                    });
                });
                setterrainTypeAll(terraintypeArray);
            }
        } catch (error) {
            console.log("Error in terraintypeAPI API", error);
        }
    }
    const soilType_resAPI = async (axiosConfig) => {
        try {
            let soilType_res = await axios.get(config.soiltypeAPI, axiosConfig);
            let soilTypeArray = [];
            if (soilType_res.data.data.count > 0) {
                soilType_res.data.data.rows.forEach(element => {
                    soilTypeArray.push({
                        value: element.id,
                        label: element.name,
                    });
                });
                setsetsoilTypeAll(soilTypeArray);
            }
        } catch (error) {
            console.log("Error in soiltypeAPI API", error);
        }
    }
    const landType_resAPI = async (axiosConfig) => {
        try {
            let landType_res = await axios.get(config.landtypeAPI, axiosConfig);
            let landTypeArray = [];
            if (landType_res.data.data.count > 0) {
                landType_res.data.data.rows.forEach(element => {
                    landTypeArray.push({
                        value: element.id,
                        label: element.name,
                    });
                });
                setlandTypeAll(landTypeArray);
            }
        } catch (error) {
            console.log("Error in landtypeAPI API", error);
        }
    }
    const landunit_resAPI = async (axiosConfig) => {
        try {
            let landunitAPI = await axios.get(config.landunitAPI, axiosConfig);
            const landunitArray = [];
            if (landunitAPI.data.data.count > 0) {
                // setfarmerData({ ...farmerData, unit_valueArr: JSON.stringify(landunitAPI.data.data.rows) })
                landunitAPI.data.data.rows.forEach(element => {
                    landunitArray.push({
                        value: element.id,
                        label: element.name,
                    });
                });
                setUnitAll(landunitArray);
            }
        } catch (error) {
            console.log("Error in landtypeAPI API", error);
        }
    }
    const onChangePlotDetails = async (item) => {
        setIsLoading(true)
        const { value, label } = item;
        setPlotDetails({ ...plotDetails, name: label, value: value });
        const [PlotSiteUserLandDetailsRes, multiLatLongRes, treeImgRes] = await Promise.all([
            PlotSiteUserLandDetails(dbname, lan_id, token, user_id),
            greenZownlistMultiLatLong(dbname, lan_id, value),
            greenZownTreeImg(dbname, lan_id, value)
        ])
        if (PlotSiteUserLandDetailsRes.status == 200) {
            const { khatian_no, terrain_type_id,
                lan_type_id, soil_type_id, land_unit_id, land_size, terrain_type, lan_type, soil_type, land_unit } = PlotSiteUserLandDetailsRes.data.data[0];
            setKhasraNo(khatian_no);
            setTreeainTypeData({ ...treeainTypeData, name: terrain_type.name, value: terrain_type.fid });
            setlandTypeAllData({ ...landTypeAllData, name: lan_type.name, value: lan_type.fid });
            setsoilTypeData({ ...soilTypeData, name: soil_type.name, value: soil_type.fid });
            setlandUnitData({ ...landUnitData, name: land_unit.name, value: land_unit.fid });
            setlandSize(land_size);
        }
        if (multiLatLongRes.status == 200) {
            const { data } = multiLatLongRes.data;
            const values = [...location];
            data.map((data, index) => {
                values[index] = { latitude: data.latitude, longitude: data.longitude }
            })
            setLocation(values);
        }
        if (treeImgRes.status == 200) {
            const { data } = treeImgRes.data;
            const arrayId = [];
            data.map((data, index) => {
                if (data.term_type == "plot_image") {
                    if (index == 0) {
                        setPhotographsOne({
                            ...photographsOne, uri: data.file_path, type: data.file_ext, name: data.file_name, id: data.file_id, oldimgName: data.file_name
                        })
                    } else if (index == 1) {
                        setPhotographsTwo({
                            ...photographsTwo, uri: data.file_path, type: data.file_ext, name: data.file_name, id: data.file_id, oldimgName: data.file_name
                        })
                    } else if (index == 2) {
                        setPhotographsThree({
                            ...photographsThree, uri: data.file_path, type: data.file_ext, name: data.file_name, id: data.file_id, oldimgName: data.file_name
                        })
                    } else if (index == 3) {
                        setPhotographsFour({
                            ...photographsFour, uri: data.file_path, type: data.file_ext, name: data.file_name, id: data.file_id, oldimgName: data.file_name
                        })
                    }
                } else if (data.term_type == "plot_record") {
                    setPlotRecord({
                        ...plotRecord, uri: data.file_path, type: data.file_ext, name: data.file_name, oldimgName: data.file_name
                    })
                } else if (data.term_type == "plot_video") {
                    setPlotVideo(data.file_path);
                }
            });
            const plot_image = data.filter(e => e.term_type == "plot_image");
            const plot_record = data.filter(e => e.term_type == "plot_record");
            const plot_video = data.filter(e => e.term_type == "plot_video");
            [1, 2, 3].map((data, index) => {
                if (plot_image[0] == undefined) {
                    setPhotographsOne({
                        ...photographsOne, uri: "", type: "", name: "", id: "", oldimgName: ""
                    })
                }
                if (plot_image[1] == undefined) {
                    setPhotographsTwo({
                        ...photographsTwo, uri: "", type: "", name: "", id: "", oldimgName: ""
                    })
                }
                if (plot_image[2] == undefined) {
                    setPhotographsThree({
                        ...photographsThree, uri: "", type: "", name: "", id: "", oldimgName: ""
                    })
                }
                if (plot_image[3] == undefined) {
                    setPhotographsFour({
                        ...photographsFour, uri: "", type: "", name: "", id: "", oldimgName: ""
                    })
                }
            });
            [1].map((data, index) => {
                if (plot_record[0] == undefined) {
                    setPlotRecord({
                        ...plotRecord, uri: "", type: "", name: "", oldimgName: ""
                    });
                }
            });
            [1].map((data, index) => {
                if (plot_video[0] == undefined) {
                    setPlotVideo("")
                }
            });
        }
        setIsLoading(false);
    }
    const handleCurrentLatLong = async (index) => {
        const fusedLocation = await getItem('fusedLocation');
        const values = [...location];
        const { latitude, longitude } = fusedLocation;
        if (fusedLocation != null && longitude.toString().length == 10 && latitude.toString().length == 10) {
            values[index] = { "latitude": latitude, "longitude": longitude }
            setLocation(values);
        } else {
            Toast.show({ text: 'Please try again to reach the accurancy', ...AlertMesg[0] });
        }
    }
    const addMoreLocation = async () => {
        setLocation([...location, { lat: "", long: "" }])
    }
    const openlaunchCamera = (item, id, index) => {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
            maxHeight: 200,
            maxWidth: 200,
        };
        launchCamera(options, async response => {
            const values = [...photo_to_be_deleted];
            if (response.didCancel) {
                console.log('User cancelled camera');
            } else if (response.error) {
                console.log('Camera Error: ', response.error);
            } else {
                let imageUri = response.uri || response.assets?.[0]?.uri;
                if (item == "one") {
                    setPhotographsOne({ ...photographsOne, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                } else if (item == "two") {
                    setPhotographsTwo({ ...photographsTwo, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                } else if (item == "three") {
                    setPhotographsThree({ ...photographsThree, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                } else if (item == "foue") {
                    setPhotographsFour({ ...photographsFour, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                }
                if (index != "" && id != "") {
                    values[index] = id;
                    setphoto_to_be_deleted(values);
                }
                SPSheet.hide();
            }
        });
    };
    const openlaunchImageLibrary = (item, id, index) => {
        const values = [...photo_to_be_deleted];
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
                if (item == "one") {
                    setPhotographsOne({ ...photographsOne, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                } else if (item == "two") {
                    setPhotographsTwo({ ...photographsTwo, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                } else if (item == "three") {
                    setPhotographsThree({ ...photographsThree, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                } else if (item == "foue") {
                    setPhotographsFour({ ...photographsFour, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                } else if (item == "plotRecord") {
                    setPlotRecord({ ...plotRecord, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                }
                if (index != "" && id != "") {
                    values[index] = id;
                    setphoto_to_be_deleted(values);
                }
                SPSheet.hide();
            }
        });
    };
    const openlaunchCameraVider = async () => {
        navigation.navigate('VideoCamera', {
            farmeruserID: "farmeruserID",
            agri_land_user_rels: "agri_land_user_rels"
        });
    }
    const onChangeKhatianNo = async (item) => {
        setKhasraNo(item);
    }
    const onChangeTreeType = async (item) => {
        const { label, value } = item;
        setTreeainTypeData({ ...treeainTypeData, name: label, value: value });
    }
    const onChangelandType = async (item) => {
        const { label, value } = item;
        setlandTypeAllData({ ...landTypeAllData, name: label, value: value });
    }
    const onChangeSoilType = async (item) => {
        const { label, value } = item;
        setsoilTypeData({ ...soilTypeData, name: label, value: value });
    }
    const onChangeyieldamount = async (item) => {
        setlandSize(item);
    }
    const onChangeProductionUnit = async (item) => {
        const { label, value } = item;
        setlandUnitData({ ...landUnitData, name: label, value: value });
    }
    const onPressSubmit = async () => {
        Keyboard.dismiss();
        const deleted_id = photo_to_be_deleted.filter(e => e != undefined || e != "");
        if (plotDetails.value == "") {
            Toast.show({ text: t('please_select_plot_first'), ...AlertMesg[0] });
        } else if (landSize == "") {
            Toast.show({ text: "Please Select Give Production Size", ...AlertMesg[0] });
        } else if (landUnitData.value == "") {
            Toast.show({ text: t('please_select_yeild_unit'), ...AlertMesg[0] });
        } else if (location[0].latitude == "") {
            Toast.show({ text: t('please_submit_location_first'), ...AlertMesg[0] });
        } else {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('plot_no', plotDetails.name);
            formData.append('khatian_no', khasraNo);
            formData.append('terrain_type_id', treeainTypeData.value);
            formData.append('lan_type_id', landTypeAllData.value);
            formData.append('soil_type_id', soilTypeData.value);
            formData.append('land_unit_id', landUnitData.value);
            formData.append('land_size', landSize);
            formData.append('latlong_data', JSON.stringify(location));
            if (plotVideo != "") {
                formData.append('plot_video', {
                    uri: plotVideo,
                    type: 'video/mp4',
                    name: 'video.mp4',
                });
            }
            if (plotRecord.oldimgName != plotRecord.name) {
                formData.append('plot_record', plotRecord);
            }
            if (photo_to_be_deleted.length > 0) {
                formData.append('photo_to_be_deleted', deleted_id);
            }
            if (photographsOne.oldimgName != photographsOne.name) {
                formData.append('plot_image', photographsOne);
            }
            if (photographsTwo.oldimgName != photographsTwo.name) {
                formData.append('plot_image', photographsTwo);
            }
            if (photographsThree.oldimgName != photographsThree.name) {
                formData.append('plot_image', photographsThree);
            }
            if (photographsFour.oldimgName != photographsFour.name) {
                formData.append('plot_image', photographsFour);
            }
            const response = await greenZownRouteUserLandEdit(dbname, lan_id, user_id, token, plotDetails.value, formData);
            console.log(response.data)
            if (response != undefined) {
                if (response.status == 200) {
                    Toast.show({ text: t('your_request_submitted'), ...AlertMesg[0] });
                    setTimeout(() => {
                        navigation.navigate("FarmerDashboard");
                    }, 1200);
                }
                setIsLoading(false);
            } else {
                setIsLoading(false);
                Toast.show({ text: 'Network error please try again', ...AlertMesg[0] });
            }
        }
    }
    const formatTime = seconds => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(
            remainingSeconds,
        ).padStart(2, '0')}`;
    };
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingDuration(prevDuration => prevDuration + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }

        return () => {
            clearInterval(interval);
        };
    }, [isRecording]);
    const onStartRecording = async () => {
        if (!camera.current) {
            return;
        }
        setIsRecording(true);
        if (isRecording == false) {
            camera.current.startRecording({
                onRecordingFinished: (video) => {
                    setVideo(video);
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
    return {
        isLoading,
        onChangePlotDetails,
        terrainTypeAll,
        soilTypeAll,
        landTypeAll,
        unitAll,
        khasraNo,
        treeainTypeData,
        landTypeAllData,
        soilTypeData,
        landUnitData,
        landSize,
        location,
        handleCurrentLatLong,
        addMoreLocation,
        photographsOne,
        photographsTwo,
        photographsThree,
        photographsFour,
        openlaunchCamera,
        openlaunchImageLibrary,
        openlaunchCameraVider,
        onPressSubmit,
        plotVideo,
        plotRecord,
        onChangeKhatianNo,
        onChangeTreeType,
        onChangelandType,
        onChangeSoilType,
        onChangeyieldamount,
        onChangeProductionUnit,
        camera,
        isRecording,
        videoData,
        setVideo,
        setIsRecording,
        recordingStart,
        setRecordingStart,
        plotDetails,
        recordingDuration,
        setRecordingDuration,
        formatTime,
        onStartRecording,
        plotAll
    }

}

export default FarmerLiveHoodController