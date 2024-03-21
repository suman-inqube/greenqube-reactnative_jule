import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { PlotSiteUserLandDetails } from '../../config/apiHere';
import loginUserDataController from './loginUserDataController';
import axios from 'axios';
import config from '../../config';
import { getItem } from '../../config/getDataFromStorage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Root, SPSheet, Toast } from 'react-native-popup-confirm-toast';
import { useNavigation, useIsFocused } from '@react-navigation/native';
const LiveHoodController = (farmeruserID) => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [isLoading, setIsLoading] = useState(false);
    const { GetLoginUserData, loginUserData } = loginUserDataController();
    const { dbname, lan_id, token, user_id } = loginUserData;
    const [terrainTypeAll, setterrainTypeAll] = useState([]);
    const [soilTypeAll, setsetsoilTypeAll] = useState([]);
    const [landTypeAll, setlandTypeAll] = useState([]);
    const [unitAll, setUnitAll] = useState([]);
    const [treeainTypeData, setTreeainTypeData] = useState({
        name: "",
        value: "",
    });
    const [landTypeAllData, setlandTypeAllData] = useState({
        name: "",
        value: "",
    });
    const [soilTypeData, setsoilTypeData] = useState({
        name: "",
        value: "",
    });
    const [landUnitData, setlandUnitData] = useState({
        name: "",
        value: "",
    });
    const [photographsOne, setPhotographsOne] = useState({
        uri: "",
        type: "",
        name: ""
    });
    const [photographsTwo, setPhotographsTwo] = useState({
        uri: "",
        type: "",
        name: ""
    });
    const [photographsThree, setPhotographsThree] = useState({
        uri: "",
        type: "",
        name: ""
    });
    const [photographsFour, setPhotographsFour] = useState({
        uri: "",
        type: "",
        name: ""
    });
    const [landSize, setlandSize] = useState("");
    const [khasraNo, setKhasraNo] = useState("");
    const [location, setLocation] = useState([
        { latitude: "", longitude: "" },
        { latitude: "", longitude: "" },
        { latitude: "", longitude: "" },
        { latitude: "", longitude: "" }
    ])
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
        }
    }, [isFocused])
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
        const { value, label } = item;
        const PlotSiteUserLandDetailsRes = await PlotSiteUserLandDetails(dbname, lan_id, token, farmeruserID);
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
    const openlaunchCamera = (item) => {
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
                if (item == "one") {
                    setPhotographsOne({ ...photographsOne, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                } else if (item == "two") {
                    setPhotographsTwo({ ...photographsTwo, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                } else if (item == "three") {
                    setPhotographsThree({ ...photographsThree, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                } else if (item == "foue") {
                    setPhotographsFour({ ...photographsFour, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                }
                SPSheet.hide();
            }
        });
    };
    const openlaunchImageLibrary = (item) => {
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
                }
                SPSheet.hide();
            }
        });
    };
    const openlaunchCameraVider = async () => {
        navigation.navigate('VideoCamera');
    }
    const onPressSubmit = async () => {

    }
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
        onPressSubmit
    }

}

export default LiveHoodController