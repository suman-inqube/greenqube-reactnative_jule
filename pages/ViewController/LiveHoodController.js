import { StyleSheet, Text, View, Keyboard } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { PlotSiteUserLandDetails, addUserLandAPI } from '../../config/apiHere';
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
const LiveHoodController = (farmeruserID, agri_land_user_rels) => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const camera = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
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
    const [photographs, setPhotographs] = useState([
        { uri: "", type: "", name: "", id: "", oldimgName: "" },
        { uri: "", type: "", name: "", id: "", oldimgName: "" },
        { uri: "", type: "", name: "", id: "", oldimgName: "" },
        { uri: "", type: "", name: "", id: "", oldimgName: "" },
    ]);
    const [plotType, setPlotType] = useState("edit")
    const [landSize, setlandSize] = useState("");
    const [khasraNo, setKhasraNo] = useState("");
    const [location, setLocation] = useState([
        { latitude: "", longitude: "", type: "land" },
        { latitude: "", longitude: "", type: "land" },
        { latitude: "", longitude: "", type: "land" },
        { latitude: "", longitude: "", type: "land" }
    ]);
    const [plotVideo, setPlotVideo] = useState({
        uri: "", type: "", name: "", id: ""
    });
    const [plotRecord, setPlotRecord] = useState({
        uri: "", type: "", name: ""
    });
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [photo_to_be_deleted, setphoto_to_be_deleted] = useState([]);
    const [photo_to_be_deleted_record, setphoto_to_be_deleted_record] = useState([]);
    const [photo_to_be_deleted_video, setphoto_to_be_deleted_video] = useState([""]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingStart, setRecordingStart] = useState(false)
    const [videoData, setVideo] = useState();
    const [storePlotArray, setstorePlotArray] = useState([])
    const [locationArray, setLocationArray] = useState([]);
    const [plotRecordArray, setPlotRecordArray] = useState([]);
    const [plotVideoArray, setPlotVideoArray] = useState([]);
    const onPageLoad = async () => {
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
            await Promise.all([
                terraintype_resAPI(axiosConfig),
                soilType_resAPI(axiosConfig),
                landType_resAPI(axiosConfig),
                landunit_resAPI(axiosConfig)
            ])
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
        console.log(value)
        setPlotDetails({ ...plotDetails, name: label, value: value });
        const [PlotSiteUserLandDetailsRes, multiLatLongRes, treeImgRes] = await Promise.all([
            PlotSiteUserLandDetails(dbname, lan_id, token, farmeruserID),
            greenZownlistMultiLatLong(dbname, lan_id, value),
            greenZownTreeImg(dbname, lan_id, value)
        ])
        if (PlotSiteUserLandDetailsRes.status == 200) {
            const PlotSiteDetails = PlotSiteUserLandDetailsRes.data.data.filter(e => e.rel_id == value);
            if (PlotSiteDetails) {
                const { khatian_no, terrain_type_id,
                    lan_type_id, soil_type_id, land_unit_id, land_size, terrain_type, lan_type, soil_type, land_unit } = PlotSiteDetails[0];
                setKhasraNo(khatian_no);
                setTreeainTypeData({ ...treeainTypeData, name: terrain_type.name, value: terrain_type.fid });
                setlandTypeAllData({ ...landTypeAllData, name: lan_type.name, value: lan_type.fid });
                setsoilTypeData({ ...soilTypeData, name: soil_type.name, value: soil_type.fid });
                setlandUnitData({ ...landUnitData, name: land_unit.name, value: land_unit.fid });
                setlandSize(land_size);
            }
        }
        if (multiLatLongRes.status == 200) {
            const { data } = multiLatLongRes.data;
            const values = [...location];
            data.map((data, index) => {
                values[index] = { latitude: data.latitude, longitude: data.longitude, type: "land" }
            })
            setLocation(values);
        }
        if (treeImgRes.status == 200) {
            const { data } = treeImgRes.data;
            const arrayId = [];
            const photographsValue = [...photographs];
            const plot_image = data.filter(e => e.term_type == "plot_image");
            const plot_record = data.filter(e => e.term_type == "plot_record");
            const plot_video = data.filter(e => e.term_type == "plot_video");
            [1, 2, 3, 4].map((data, index) => {
                if (plot_image[index] == undefined) {
                    photographsValue[index] = { uri: "", type: "", name: "", id: "", oldimgName: "" }
                } else {
                    photographsValue[index] = { uri: plot_image[index].file_path, type: plot_image[index].file_ext, name: plot_image[index].file_name, id: plot_image[index].file_id, oldimgName: plot_image[index].file_name }
                }
            });
            setPhotographs(photographsValue);
            [1].map((data, index) => {
                if (plot_record[0] == undefined) {
                    setPlotRecord({
                        ...plotRecord, uri: "", type: "", name: "", oldimgName: "", id: ""
                    });
                } else {
                    setPlotRecord({
                        ...plotRecord, uri: plot_record[index].file_path, type: plot_record[index].file_ext, name: plot_record[index].file_name, oldimgName: plot_record[index].file_name, id: plot_record[index].file_id
                    })
                }
            });
            [1].map((data, index) => {
                if (plot_video[0] == undefined) {
                    setPlotVideo({
                        ...plotVideo, uri: "", type: "", name: "", id: ""
                    })
                } else {
                    setPlotVideo({
                        ...plotVideo, uri: plot_video[index].file_path, type: "", name: "", id: plot_video[index].file_id
                    })
                }
            });
        }
        setIsLoading(false);
    }
    onchangePlotName = (item) => {
        setPlotDetails({ ...plotDetails, name: item, value: "" });
    }
    const handleCurrentLatLong = async (index) => {
        const fusedLocation = await getItem('fusedLocation');
        const values = [...location];
        const { latitude, longitude } = fusedLocation;
        if (fusedLocation != null && longitude.toString().length == 10 && latitude.toString().length == 10) {
            values[index] = { "latitude": latitude, "longitude": longitude, type: "land" }
            setLocation(values);
        } else {
            Toast.show({ text: 'Please try again to reach the accurancy', ...AlertMesg[0] });
        }
    }
    const addMoreLocation = async () => {
        setLocation([...location, { lat: "", long: "" }])
    }
    const openlaunchCamera = (id, index) => {
        console.error(id, "***", index)
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
                const photographsValue = [...photographs];
                photographsValue[index] = { uri: response.assets[0].uri, type: response.assets[0].type, id: id, name: response.assets[0].fileName }
                setPhotographs(photographsValue);
                values[index] = id;
                setphoto_to_be_deleted(values);
                SPSheet.hide();
            }
        });
    };
    const openlaunchImageLibrary = (id, index, type) => {
        const values = [...photo_to_be_deleted];
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
                values[index] = id;
                setphoto_to_be_deleted(values);
                SPSheet.hide();
            }
        });
    };
    const openlaunchCameraVider = async () => {
        navigation.navigate('VideoCamera', {
            farmeruserID: farmeruserID,
            agri_land_user_rels: agri_land_user_rels
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
    const validationData = () => {
        if (plotDetails.name == "") {
            Toast.show({ text: `${t('please_add_plot_name_first')}`, ...AlertMesg[0] });
            return false;
        } else if (treeainTypeData.name == "") {
            Toast.show({ text: `${t('please_select_terrain_type_first')}`, ...AlertMesg[0] });
            return false;
        } else if (landTypeAllData.name == "") {
            Toast.show({ text: `${t('please_select_plot_first')}`, ...AlertMesg[0] });
            return false;
        } else if (soilTypeData.name == "") {
            Toast.show({ text: `${t('please_select_soil_type_first')}`, ...AlertMesg[0] });
            return false;
        } else if (landSize == "") {
            Toast.show({ text: "Please Select Give Production Size", ...AlertMesg[0] });
            return false;
        } else if (landUnitData.value == "") {
            Toast.show({ text: t('please_select_yeild_unit'), ...AlertMesg[0] });
            return false;
        } else if (location[0].latitude == "") {
            Toast.show({ text: t('please_submit_location_first'), ...AlertMesg[0] });
            return false;
        } else {
            return true;
        }
    }
    const onPressSubmit = async () => {
        Keyboard.dismiss();
        const deleted_id = photo_to_be_deleted.filter(e => e != undefined || e != "");
        if (validationData()) {
            setIsLoading(true)
            const formData = new FormData();
            formData.append('plot_no', plotDetails.name);
            formData.append('khatian_no', khasraNo);
            formData.append('terrain_type_id', treeainTypeData.value);
            formData.append('lan_type_id', landTypeAllData.value);
            formData.append('soil_type_id', soilTypeData.value);
            formData.append('land_unit_id', landUnitData.value);
            formData.append('land_size', landSize);
            formData.append('latlong_data', JSON.stringify(location));
            if (plotVideo.id == "" && plotVideo.uri != "") {
                const videoName = plotVideo.uri.split("cache/")
                formData.append('plot_video', {
                    uri: plotVideo.uri,
                    type: 'video/mp4',
                    name: videoName[1],
                });
            }
            if (plotRecord.oldimgName != plotRecord.name) {
                formData.append('plot_record', plotRecord);
            }
            if (deleted_id.length > 0) {
                formData.append('photo_to_be_deleted', deleted_id);
            }
            photographs.map((data, index) => {
                if (data.oldimgName != data.name) {
                    formData.append('plot_image', data);
                }
            })
            const response = await greenZownRouteUserLandEdit(dbname, lan_id, user_id, token, plotDetails.value, formData);
            if (response != undefined) {
                if (response.status == 200) {
                    setIsLoading(false)
                    Toast.show({ text: t('your_request_submitted'), ...AlertMesg[0] });
                    setTimeout(() => {
                        navigation.navigate("Dashboard");
                    }, 1200);
                }
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
    const onStartRecording = async (id) => {
        console.error(id)
        const values = [...photo_to_be_deleted];
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
                    values[6] = id;
                    setphoto_to_be_deleted(values);
                    // setPlotVideo(`file:///${video.path}`);
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
    const addMorePlot = () => {
        if (plotType == "edit") {
            setPlotType("add");
            emptyState();
        } else {
            if (validationData()) {
                const plotName = plotDetails.name;
                const treeainTypeDataValue = treeainTypeData.value;
                const treeainTypeDataName = treeainTypeData.name;
                const landTypeAllDataValue = landTypeAllData.value;
                const soilTypeDataValue = soilTypeData.value;
                const landUnitDataValue = landUnitData.value;
                const storePlotArrayData = [...storePlotArray, {
                    plotName,
                    treeainTypeDataName,
                    treeainTypeDataValue,
                    landTypeAllDataValue,
                    soilTypeDataValue,
                    landUnitDataValue,
                    location,
                    photographs,
                    plotVideo,
                    plotRecord,
                    khasraNo: khasraNo,
                    landSize: landSize
                }];
                setstorePlotArray(storePlotArrayData);
                emptyState();
            }
        }
    }
    const emptyState = () => {
        setPlotDetails({ ...plotDetails, name: "", value: "" });
        setKhasraNo("");
        setlandSize("");
        setTreeainTypeData({ ...treeainTypeData, name: "", value: "" });
        setlandTypeAllData({ ...landTypeAllData, name: "", value: "" });
        setsoilTypeData({ ...soilTypeData, name: "", value: "" });
        setlandUnitData({ ...landUnitData, name: "", value: "" });
        setLocation([
            { latitude: "", longitude: "" },
            { latitude: "", longitude: "" },
            { latitude: "", longitude: "" },
            { latitude: "", longitude: "" }
        ]);
        setPhotographs([
            { uri: "", type: "", name: "", id: "", oldimgName: "" },
            { uri: "", type: "", name: "", id: "", oldimgName: "" },
            { uri: "", type: "", name: "", id: "", oldimgName: "" },
            { uri: "", type: "", name: "", id: "", oldimgName: "" },
        ]);
        setPlotVideo({ uri: "", type: "", name: "", id: "" })
        setPlotRecord({ uri: "", type: "", name: "", id: "" });
    }
    const addUserLand = async () => {
        Keyboard.dismiss();
        let dataArr = [];
        const formData = new FormData();
        let plot_img_length = 1;
        if (storePlotArray.length > 0) {
            setIsLoading(true);
            storePlotArray.map((data, index) => {
                let latDataArr = [];
                let plotImageArr = [];
                const { plotName, landTypeAllDataValue, landUnitDataValue, location,
                    photographs, plotRecord, plotVideo, soilTypeDataValue,
                    treeainTypeDataValue, khasraNo, landSize } = data;
                storePlotArray[index].location.map((latData, e) => {
                    const { latitude, longitude } = latData;
                    if (latitude != "") {
                        latDataArr.push(latData)
                    }
                })
                storePlotArray[index].photographs.map((photographsData, e) => {
                    const { name } = photographsData;
                    if (name != "") {
                        formData.append(`plot_image_${plot_img_length++}`, photographsData);
                        console.log(plot_img_length)
                    }
                });
                console.log(plotImageArr);
                if (plotImageArr.length > 0) {
                    formData.append(`plot_image_${index + 1}`, plotImageArr);
                }
                if (plotRecord.name != "") {
                    formData.append(`plot_record_${index + 1}`, plotRecord);
                }
                if (plotVideo.id == "" && plotVideo.uri != "") {
                    const videoName = plotVideo.uri.split("cache/")
                    formData.append(`plot_video_${index + 1}`, {
                        uri: plotVideo.uri,
                        type: 'video/mov',
                        name: videoName[1],
                    });
                }
                dataArr.push({
                    "user_id": farmeruserID,
                    "plot_no": plotName,
                    "khatian_no": khasraNo,
                    "terrain_type_id": treeainTypeDataValue,
                    "lan_type_id": landTypeAllDataValue,
                    "soil_type_id": soilTypeDataValue,
                    "land_unit_id": landUnitDataValue,
                    "land_size": landSize,
                    "createdBy": user_id,
                    "agri_land_user_latlongs": latDataArr
                });

            });
            formData.append("data", JSON.stringify(dataArr));
            const response = await addUserLandAPI(dbname, lan_id, user_id, token, farmeruserID, formData, dataArr.length);
            if (response.status == 200) {
                setIsLoading(false);
                setstorePlotArray([]);
                Toast.show({ text: t('your_request_submitted'), ...AlertMesg[0] });
                setTimeout(() => {
                    navigation.navigate("Dashboard");
                }, 1200);
            }
        } else {
            if (validationData()) {

            } else {

            }
        }
        // addUserLand
    }
    const produceRemoveDetails = (index) => {
        const values = [...storePlotArray];
        values.splice(index, 1);
        setstorePlotArray(values);
    }
    return {
        isLoading,
        onChangePlotDetails,
        onchangePlotName,
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
        photographs,
        addMorePlot,
        plotType,
        addUserLand,
        storePlotArray,
        produceRemoveDetails
    }

}

export default LiveHoodController