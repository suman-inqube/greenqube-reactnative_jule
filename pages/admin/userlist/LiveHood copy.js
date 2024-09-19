import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, BackHandler } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import ButtonForm from '../../Common/ButtonForm'
import InputTextForm from '../../Common/InputTextForm'
import DropdownForm from '../../Common/DropdownForm'
import { getItem } from '../../../config/getDataFromStorage'
import {
    fetchBlockAPI, fetchDistrictAPI, fetchStateAPI,
    ProductionSeasonAndApi, ProductionProcessAPI, ProductionUnitAPI,
    livelihoodCropAndPlotDetailsAPI, PlotSiteUserLandDetails, UpdateLandCropdetailsAPI, AddLandCropDetailsAPI
} from '../../../config/apiHere'
import config from '../../../config';
import axios from 'axios';
import ButtonFormBottom from '../../Common/ButtonFormBottom';
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import DatePickerComp from '../../Common/DatePickerComp';
import { useRoute, useFocusEffect, useNavigation,useIsFocused } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { Root, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import LoadingScreen from '../../Common/LoadingScreen';
const qs = require('qs');
const LiveHood = ({ sendDataToParent }) => {
    const navigation = useNavigation();
    const route = useRoute();
    const isFocused = useIsFocused();
    const { farmeruserID, agri_land_user_rels } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [farmerData, setfarmerData] = useState({
        createdBy: "",
        plot_no: "",
        cu_rel_id: "",
        land_rel_id: "",
        daag_no: "",
        khatian_no: "",
        plant_number: "",
        land_size: "",
        plot_Site: "",
        plot_Site_Name: "",
        expectedProduction: "",
        cycleStartDate: "",
        cycleEndDate: "",
        terrainType: "",
        terrainTypeValue: "",
        landType: "",
        landTypeValue: "",
        soilType: "",
        soilTypeValue: "",
        unit: "",
        unitValue: "",
        productionSeason: "",
        productionSeasonValue: "",
        livelihoodType: "",
        livelihoodTypeValue: "",
        produceName: "",
        produceNameValue: "",
        produceVariety: "",
        produceVarietyValue: "",
        productionProcess: "",
        productionProcessValue: "",
        unitProduct: "",
        unitProductValue: "",
        unit_valueArr: "",
        unit_value: "",
    });
    const [currentlatlong, setCurrentlatlong] = useState({
        lat: "",
        long: ""
    })
    const [terrainTypeAll, setterrainTypeAll] = useState([]);
    const [soilTypeAll, setsetsoilTypeAll] = useState([]);
    const [landTypeAll, setlandTypeAll] = useState([]);
    const [unitAll, setUnitAll] = useState([]);
    const [location, setLocation] = useState([
        { latitude: "", longitude: "" },
        { latitude: "", longitude: "" },
        { latitude: "", longitude: "" }
    ])
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: '',
        languageID: '',
        token: '',
        userID: '',
    });
    const [newDate, setnewDate] = useState(new Date());
    const [penCycleStart, setopenCycleStart] = useState(false);
    const [penCycleEnd, setopenCycleEnd] = useState(false);
    const [issuenewDate, setIssueNewDate] = useState(new Date());
    const [productionSeason, setProductionSeason] = useState([]);
    const [livelihoodType, setLivelihoodType] = useState([]);
    const [produceName, setProduceName] = useState([]);
    const [produceVariety, setProduceVariety] = useState([]);
    const [productionProcess, setProductionProcess] = useState([]);
    const [productionUnit, setProductionUnit] = useState([]);
    const [userData, setUserData] = useState("");
    const sendDataToParentOnClick = () => {
        sendDataToParent(null);
    };
    const handlePlot = async (findData) => {
        setIsLoading(true);
        const [productSeasonresRes, cropAndPlotDetails,
            plotSiteUserLandDetails_res
        ] = await Promise.all([
            ProductionSeasonAndApi(dbLanTokUsr.dbName, dbLanTokUsr.languageID, ''),
            livelihoodCropAndPlotDetailsAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmeruserID, findData.value),
            PlotSiteUserLandDetails(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, farmeruserID)
        ]);
        if (cropAndPlotDetails.status === 200) {
            if (cropAndPlotDetails.data.data.rows.length != 0) {
                const data = cropAndPlotDetails.data.data.rows[0];
                const [
                    livelihoodType_res,
                    produceName_res] = await Promise.all([
                        livelihoodTypeAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, data.crop_type.fid, ''),
                        produceNameAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, data.crop_type.fid, data.crop_name.fid)
                    ]);
                data.land_info.agri_land_user_latlongs.map((data, index) => {
                    setLocation([{ "latitude": data.latitude, "longitude": data.longitude }])
                });
                if (plotSiteUserLandDetails_res.status === 200) {
                    plotSiteUserLandDetails_res.data.data.map((dataLandDetails, index) => {
                        if (dataLandDetails.rel_id == findData.value) {
                            setIsLoading(false);
                            setfarmerData({
                                ...farmerData,
                                createdBy: dbLanTokUsr.userID,
                                plot_no: data.land_info.plot_no,
                                cu_rel_id: data.cu_rel_id,
                                land_rel_id: findData.value,
                                daag_no: dataLandDetails.daag_no,
                                khatian_no: dataLandDetails.khatian_no,
                                plant_number: dataLandDetails.plant_number,
                                land_size: dataLandDetails.land_size,
                                plot_Site: findData.value,
                                plot_Site_Name: findData.label,
                                expectedProduction: data.yield_amount,
                                cycleStartDate: data.sowing_date,
                                cycleEndDate: data.harvesting_date.substring(-1, 10),
                                terrainType: dataLandDetails.terrain_type.name,
                                terrainTypeValue: dataLandDetails.terrain_type.fid,
                                landType: dataLandDetails.lan_type.name,
                                landTypeValue: dataLandDetails.lan_type.fid,
                                soilType: dataLandDetails.soil_type.name,
                                soilTypeValue: dataLandDetails.soil_type.fid,
                                unit: dataLandDetails.land_unit.name,
                                unitValue: dataLandDetails.land_unit.fid,
                                productionSeason: data.crop_season.name,
                                productionSeasonValue: data.crop_season.fid,
                                livelihoodType: data.crop_type.name,
                                livelihoodTypeValue: data.crop_type.fid,
                                produceName: data.crop_name.name,
                                produceNameValue: data.crop_name.fid,
                                produceVariety: data.crop_variety.name,
                                produceVarietyValue: data.crop_variety.fid,
                                productionProcess: data.farmer_production_system.name,
                                productionProcessValue: data.farmer_production_system.fid,
                                unitProduct: data.yield_unit,
                                unitProductValue: data.land_info.land_unit_id,
                                unit_value: dataLandDetails.unit_value
                            })
                            return;
                        }
                    })
                }
            }
        }
        if (productSeasonresRes.status === 200) {
            const productSeasonresResArr = [];
            const livelihoodTypeArr = [];
            productSeasonresRes.data.data.crop_season.map((data, index) => {
                productSeasonresResArr.push({
                    value: data.fid,
                    label: data.name,
                });
            });
            productSeasonresRes.data.data.crop_type.map((data, index) => {
                livelihoodTypeArr.push({
                    value: data.fid,
                    label: data.name,
                });
            });
            setProductionSeason(productSeasonresResArr);
            setLivelihoodType(livelihoodTypeArr);
        }
    };
    const allAPIHere = async (dbname, language_id) => {
        const axiosConfig = {
            headers: {
                'information': `${dbname},${language_id}`,
                'Accept': 'application/json'
            },
        };
        await Promise.all([
            terraintype_resAPI(axiosConfig),
            soilType_resAPI(axiosConfig),
            landType_resAPI(axiosConfig),
            landunit_resAPI(axiosConfig),
            produceVarietyAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID),
            productionProcessAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID),
        ]);
    }
    const onPageLoad = async () => {
        const [loginUser_data, userListData] = await Promise.all([
            getItem('loginUser_data'),
        ]);
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const user_id = loginUser_data.user_id;
            const token = loginUser_data.token;
            allAPIHere(dbName, languageID);
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageID: languageID,
                userID: user_id,
                token: token
            })
        };
    }
    const getLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentlatlong({ ...currentlatlong, lat: latitude, long: longitude })
            },
            (error) => {
                console.error(error);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    }
    useEffect(() => {
        if (isFocused) {
            RemoveFarmerData();
            setUserData("");
            onPageLoad();
            getLocation();
            setLocation([{ latitude: "", longitude: "" }, { latitude: "", longitude: "" }, { latitude: "", longitude: "" }])
            const onBackPress = () => {
                RemoveFarmerData();
                navigation.navigate('userList'); return true;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
    }, [isFocused]);
    const RemoveFarmerData = () => {
        setfarmerData({
            createdBy: "",
            plot_no: "",
            cu_rel_id: "",
            land_rel_id: "",
            daag_no: "",
            khatian_no: "",
            plant_number: "",
            land_size: "",
            plot_Site: "",
            plot_Site_Name: "",
            expectedProduction: "",
            cycleStartDate: "",
            cycleEndDate: "",
            terrainType: "",
            terrainTypeValue: "",
            landType: "",
            landTypeValue: "",
            soilType: "",
            soilTypeValue: "",
            unit: "",
            unitValue: "",
            productionSeason: "",
            productionSeasonValue: "",
            livelihoodType: "",
            livelihoodTypeValue: "",
            produceName: "",
            produceNameValue: "",
            produceVariety: "",
            produceVarietyValue: "",
            productionProcess: "",
            productionProcessValue: "",
            unitProduct: "",
            unitProductValue: "",
            unit_value: "",
            unit_valueArr: "",
        });
    }
    const handleDatePicker = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setfarmerData({ ...farmerData, cycleStartDate: effective_date })
    }
    const handleDatePicker2 = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setfarmerData({ ...farmerData, cycleEndDate: effective_date })
    }
    const addMoreLocation = async () => {
        setLocation([...location, { lat: "", long: "" }])
    }
    const handleCurrentLatLong = (index) => {
        const values = [...location];
        values[index] = { latitude: currentlatlong.lat, longitude: currentlatlong.long }
        setLocation(values);
    }
    const handleAddData = async (item, name, value) => {
        let selectUnitValue = "";
        if (name === 'unit') {
            if (farmerData.unit_valueArr != "") {
                JSON.parse(farmerData.unit_valueArr).map((data, index) => {
                    if (item.value === data.fid) {
                        selectUnitValue = data.unit_value;
                    }
                });
            }
            livelihoodTypeAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, item.value, '');
        }
        setfarmerData({ ...farmerData, [name]: item.label, [value]: item.value, ['unit_value']: selectUnitValue })
        if (name === 'livelihoodType') {
            livelihoodTypeAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, item.value, '');
        }
        if (name === 'produceName') {
            produceNameAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmerData.livelihoodTypeValue, item.value);
        }
        if (name === "produceVariety") {
            produceVarietyAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID);
        }
        if (name === "productionProcess") {
            productionProcessAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID);
        }
    };
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
                setfarmerData({ ...farmerData, unit_valueArr: JSON.stringify(landunitAPI.data.data.rows) })
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
    const livelihoodTypeAPI = async (dbName, languageID, crop_type_id, crop_name_id) => {
        const productSeasonresRes = await ProductionSeasonAndApi(dbName, languageID, crop_type_id, crop_name_id);
        if (productSeasonresRes.status === 200) {
            const productSeasonresResArr = [];
            const livelihoodTypeArr = [];
            const produceNameArr = [];
            productSeasonresRes.data.data.crop_season.map((data, index) => {
                productSeasonresResArr.push({
                    value: data.fid,
                    label: data.name,
                });
            });
            productSeasonresRes.data.data.crop_type.map((data, index) => {
                livelihoodTypeArr.push({
                    value: data.fid,
                    label: data.name,
                });
            });
            productSeasonresRes.data.data.crop_name.map((data, index) => {
                produceNameArr.push({
                    value: data.crop_name.fid,
                    label: data.crop_name.name,
                });
            });
            setProductionSeason(productSeasonresResArr);
            setLivelihoodType(livelihoodTypeArr);
            setProduceName(produceNameArr)
        }
    }
    const produceNameAPI = async (dbName, languageID, crop_type_id, crop_name_id) => {
        const produceVariety = [];
        const productSeasonresRes = await ProductionSeasonAndApi(dbName, languageID, crop_type_id, crop_name_id);
        productSeasonresRes.data.data.crop_variety.map((data, index) => {
            produceVariety.push({
                value: data.crop_variety.fid,
                label: data.crop_variety.name,
            });
        })
        setProduceVariety(produceVariety)
    }
    const produceVarietyAPI = async (dbName, languageID) => {
        const productionProcessArr = [];
        const productionProcessRes = await ProductionProcessAPI(dbName, languageID);
        if (productionProcessRes.status == 200) {
            productionProcessRes.data.data.rows.map((data, index) => {
                productionProcessArr.push({
                    value: data.fid,
                    label: data.name,
                });
            })
            setProductionProcess(productionProcessArr)
        }
    }
    const productionProcessAPI = async (dbName, languageID) => {
        const productionUnitArr = [];
        const ProductionUnitRes = await ProductionUnitAPI(dbName, languageID);
        if (ProductionUnitRes.status == 200) {
            ProductionUnitRes.data.data.rows.map((data, index) => {
                productionUnitArr.push({
                    value: data.fid,
                    label: data.unit_name,
                });
            })
            setProductionUnit(productionUnitArr)
        }
    }
    const handleUserListUpdate = async () => {
        const locationArry = [];
        location.map((data, index) => {
            if (data.latitude != "") {
                locationArry.push("latitude")
            }
        })
        if (farmerData.plot_Site_Name == "") {
            Toast.show({ text: 'Please add plot name First', ...AlertMesg[0] });
        } else if (farmerData.terrainTypeValue == "") {
            Toast.show({ text: 'Please Select Terrain Type First', ...AlertMesg[0] });
        } else if (farmerData.landTypeValue == "") {
            Toast.show({ text: 'Please Select Plot/Site First', ...AlertMesg[0] });
        } else if (farmerData.soilTypeValue == "") {
            Toast.show({ text: 'Please Select Soil Type First', ...AlertMesg[0] });
        } else if (farmerData.unitValue == "") {
            Toast.show({ text: 'Please Select Unit First', ...AlertMesg[0] });
        } else if (farmerData.land_size == "") {
            Toast.show({ text: 'Please Enter Plot/Site Size', ...AlertMesg[0] });
        } else if (locationArry.length == 0) {
            Toast.show({ text: 'Please Submit Location Size', ...AlertMesg[0] });
        } else if (farmerData.productionSeasonValue == "") {
            Toast.show({ text: 'Please Select Production Season First', ...AlertMesg[0] });
        } else if (farmerData.livelihoodTypeValue == "") {
            Toast.show({ text: 'Please Select Livelihood Type First', ...AlertMesg[0] });
        } else if (farmerData.produceNameValue == "") {
            Toast.show({ text: 'Please Select Producr Name/Type First', ...AlertMesg[0] });
        } else if (farmerData.produceVarietyValue == "") {
            Toast.show({ text: 'Please Select Produce Variety  First', ...AlertMesg[0] });
        } else if (farmerData.productionProcessValue == "") {
            Toast.show({ text: 'Please Select Production Process In Produce Details First', ...AlertMesg[0] });
        } else if (farmerData.expectedProduction == "") {
            Toast.show({ text: 'Please Select Give Production Size', ...AlertMesg[0] });
        } else if (farmerData.unitProductValue == "") {
            Toast.show({ text: 'Please Select Production Unit', ...AlertMesg[0] });
        } else if (farmerData.cycleStartDate == "") {
            Toast.show({ text: 'Please Select Planting Date', ...AlertMesg[0] });
        } else if (farmerData.cycleEndDate == "") {
            Toast.show({ text: 'Please Select Crop Cycle End Date First', ...AlertMesg[0] });
        } else {
            var formData;
            formData = new URLSearchParams();
            formData.append("createdBy", dbLanTokUsr.userID);
            if (userData == "addUserData") {
                formData.append("plot_no", farmerData.plot_Site_Name);
            }
            formData.append("daag_no", farmerData.daag_no);
            formData.append("khatian_no", farmerData.khatian_no);
            formData.append("plant_number", farmerData.plant_number);
            formData.append("terrain_type_id", farmerData.terrainTypeValue);
            formData.append("lan_type_id", farmerData.landTypeValue);
            formData.append("soil_type_id", farmerData.soilTypeValue);
            formData.append("land_unit_id", farmerData.unitValue);
            formData.append("land_size", farmerData.land_size);
            formData.append("land_convert_size", farmerData.land_size * farmerData.unit_value == null || farmerData.unit_value == "" || farmerData.unit_value == "undefined" ? 1 : farmerData.unit_value);
            formData.append("latitude", location[0].latitude);
            formData.append("longitude", location[0].longitude);
            formData.append("status", 1);//add
            formData.append("crop_season_id", farmerData.productionSeasonValue);
            formData.append("crop_type_id", farmerData.livelihoodTypeValue);
            formData.append("crop_name_id", farmerData.produceNameValue);
            formData.append("crop_variety_id", farmerData.produceVarietyValue);
            formData.append("sowing_date", farmerData.cycleStartDate);
            formData.append("harvesting_date", farmerData.cycleEndDate);
            formData.append("is_primary", 0);//add0
            formData.append("certified_seed", "NO");
            formData.append("have_land_title", "NO");
            formData.append("production_system", farmerData.productionProcessValue);
            formData.append("have_fertilizer", "Yes");
            formData.append("buy_pesticide", "Yes");
            formData.append("yield_amount", farmerData.expectedProduction);
            formData.append("yield_unit", farmerData.unitProductValue);
            formData.append("crop_cycl_start_date", "2004-02-29");
            formData.append("latlong_data", JSON.stringify(location));
            if (userData == "addUserData") {
                const AddLandCropDetails_res = await AddLandCropDetailsAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmeruserID, dbLanTokUsr.token, qs.stringify(formData),'','');
                console.log(AddLandCropDetails_res.data)
                if (AddLandCropDetails_res.status === 200) {
                    Toast.show({ text: 'Plot/Site Produce Add Succesfully', ...AlertMesg[0] });
                    // setTimeout(() => {
                    //     RemoveFarmerData();
                    //     navigation.navigate('Dashboard')
                    // }, 2000);
                }
            } else {
                const updateLandCropdetails_res = await UpdateLandCropdetailsAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmeruserID, dbLanTokUsr.token, qs.stringify(formData), farmerData.land_rel_id, farmerData.cu_rel_id)
                console.log(updateLandCropdetails_res.data)
                if (updateLandCropdetails_res.status === 200) {
                    Toast.show({ text: 'Plot/Site Produce Updateed Succesfully', ...AlertMesg[0] });
                    // setTimeout(() => {
                    //     RemoveFarmerData();
                    //     navigation.navigate('Dashboard')
                    // }, 2000);
                }
            }
        }
    }
    const handleUserData = async () => {
        setUserData("addUserData");
        RemoveFarmerData();
    }
    const handleAddUserData = (name, data) => {
        setfarmerData({ ...farmerData, [`${name}`]: data });
    }
    return (
        <>
            <Root>
                <DatePickerComp
                    openDate={penCycleStart}
                    newDate={newDate}
                    setOpenDate={setopenCycleStart}
                    handleDatePicker={handleDatePicker} />
                <DatePickerComp
                    openDate={penCycleEnd}
                    newDate={issuenewDate}
                    minimumDate={farmerData.cycleStartDate == "" ? "" : new Date(`${new Date(farmerData.cycleStartDate).getFullYear()}-${new Date(farmerData.cycleStartDate).getMonth() + 1}-${new Date(farmerData.cycleStartDate).getDate() + 1}`)}
                    setOpenDate={setopenCycleEnd}
                    handleDatePicker={handleDatePicker2} />
                <CustomHeader path='userList' />
                <FormsTitle title={'Plot/Site & Produce Ditails'} />
                {isLoading ? <View style={styles.LoadingScreen}>
                    <LoadingScreen />
                </View> : null}
                <ScrollView style={{ marginHorizontal: 30, marginVertical: 10, }} showsVerticalScrollIndicator={false}>
                    <View style={{ marginBottom: 40, }}>

                        {
                            userData == "addUserData" ?
                                <InputTextForm label="Plot/Site" color="red" value={farmerData.plot_Site_Name} onChangeText={(text) => handleAddUserData("plot_Site_Name", text)} />
                                : <DropdownForm label="Plot/Site" color="red" data={agri_land_user_rels} onChange={(item) => handlePlot(item)} val={farmerData.plot_Site_Name} />
                        }

                        <InputTextForm label="Plot/Site Record Detail (Daag No.)" value={farmerData.daag_no} onChangeText={(text) => handleAddUserData("daag_no", text)} />

                        <InputTextForm label="Plot/Site Record Detail (Khatian No.)" value={farmerData.khatian_no} onChangeText={(text) => handleAddUserData("khatian_no", text)} />

                        <InputTextForm label="No. of Plants/Livestock" value={farmerData.plant_number} onChangeText={(text) => handleAddUserData("plant_number", text)} />

                        <DropdownForm label="Terrain Type" color="red"
                            data={terrainTypeAll} val={farmerData.terrainType}
                            onChange={item => { handleAddData(item, 'terrainType', 'terrainTypeValue') }} />
                        <DropdownForm label="Land Type" color="red" data={landTypeAll}
                            onChange={item => { handleAddData(item, 'landType', 'landTypeValue') }}
                            val={farmerData.landType} />
                        <DropdownForm label="Soil Type" color="red" data={soilTypeAll}
                            onChange={item => { handleAddData(item, 'soilType', 'soilTypeValue') }}
                            val={farmerData.soilType} />
                        <View style={styles.plotSiteUnit}>
                            <View style={{ width: '45%' }}>
                                <InputTextForm label="Plot/Site Size" color="red" value={farmerData.land_size} onChangeText={(text) => handleAddUserData("land_size", text)} />
                            </View>
                            <View style={{ width: '45%' }}>
                                <DropdownForm label="Unit" color="red" data={unitAll}
                                    onChange={item => { handleAddData(item, 'unit', 'unitValue') }}
                                    val={farmerData.unit} />
                            </View>
                        </View>
                        <View style={styles.locationContainer}>
                            {
                                location && location.map((data, index) => {
                                    return (
                                        <View key={index}>
                                            <View style={styles.latlongContainer}>
                                                <Text style={styles.title}>{data.latitude == "" ? "0.0" : data.latitude}</Text>
                                                <Text style={styles.title}>{data.longitude == "" ? "0.0" : data.longitude}</Text>
                                            </View>
                                            <View style={styles.latlongContainer}>
                                                <Text style={styles.title}>Top to geo tag the plot/site</Text>
                                                <TouchableOpacity onPress={() => handleCurrentLatLong(index)}>
                                                    <Image
                                                        source={require('../../Common/images/location.png')}
                                                        style={{ width: 35, height: 35 }}
                                                        resizeMode="contain"
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )
                                })
                            }
                        </View>
                        <DropdownForm label="Production Season" color="red"
                            data={productionSeason}
                            onChange={item => { handleAddData(item, 'productionSeason', 'productionSeasonValue') }}
                            val={farmerData.productionSeason} />
                        <DropdownForm label="Livelihood Type" color="red"
                            data={livelihoodType}
                            onChange={item => { handleAddData(item, 'livelihoodType', 'livelihoodTypeValue') }}
                            val={farmerData.livelihoodType} disable={userData == "addUserData" ? "" : true} />
                        <DropdownForm label="Produce Name" color="red"
                            data={produceName}
                            onChange={item => { handleAddData(item, 'produceName', 'produceNameValue') }}
                            val={farmerData.produceName} disable={userData == "addUserData" ? "" : true} />
                        <DropdownForm label="Produce Variety" color="red"
                            data={produceVariety}
                            onChange={item => { handleAddData(item, 'produceVariety', 'produceVarietyValue') }}
                            val={farmerData.produceVariety} disable={userData == "addUserData" ? "" : true} />
                        <DropdownForm label="Production Process" color="red"
                            data={productionProcess}
                            onChange={item => { handleAddData(item, 'productionProcess', 'productionProcessValue') }}
                            val={farmerData.productionProcess} />
                        <View style={styles.plotSiteUnit}>
                            <View style={{ width: '45%' }}>
                                <InputTextForm label={"Expected \nProduction"} color="red" value={farmerData.expectedProduction} onChangeText={(text) => handleAddUserData("expectedProduction", text)} />
                            </View>
                            <View style={{ width: '45%' }}>
                                <DropdownForm label={"Unit\n"} color="red" data={productionUnit}
                                    onChange={item => { handleAddData(item, 'unitProduct', 'unitProductValue') }}
                                    val={farmerData.unitProduct} />
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => setopenCycleStart(true)} activeOpacity={9}>
                            <Text style={{ marginBottom: 5, color: '#f40000' }}>Cycle Starts</Text>
                            <View style={styles.calenderContainer} >
                                <Text style={{ color: '#000' }}>{farmerData.cycleStartDate}</Text>
                                <Image
                                    source={require('../../Common/images/calendar.png')}
                                    style={{ width: 20, height: 20 }}
                                />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setopenCycleEnd(true)} activeOpacity={9}>
                            <Text style={{ marginBottom: 5, color: '#f40000', marginTop: 10 }}>Cycle Ends</Text>
                            <View style={styles.calenderContainer} >
                                <Text style={{ color: '#000' }}>{farmerData.cycleEndDate}</Text>
                                <Image
                                    source={require('../../Common/images/calendar.png')}
                                    style={{ width: 20, height: 20 }}
                                />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.clickAddMorePlots} onPress={() => handleUserData()}>
                            <Text style={styles.clickAddMorePlotsTitle}>CLICK TO ADD MORE PLOTS/SITES</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <TouchableOpacity style={styles.locationAddMoreContainer}
                    onPress={addMoreLocation}
                >
                    <Text style={{ color: '#fff', marginRight: 15 }}>Add Location</Text>
                </TouchableOpacity>

                <ButtonFormBottom label='Submit' onPress={() => handleUserListUpdate()} />
            </Root>
        </>
    )
}

export default LiveHood

const styles = StyleSheet.create({
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
        height: 40,
        marginHorizontal: 10,
        borderColor: 'gray',
    },
    plotSiteUnit: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    locationContainer: {},
    latlongContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        marginHorizontal: 5
    },
    calenderContainer: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 10,
        elevation: 1,
        height: 45,
    },
    title: {
        color: '#000'
    },
    locationAddMoreContainer: {
        position: 'absolute',
        bottom: 100,
        right: 0,
        backgroundColor: '#025502',
        paddingVertical: 10,
        paddingLeft: 20,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    clickAddMorePlots: {
        backgroundColor: '#045004',
        marginHorizontal: 35,
        paddingVertical: 15,
        marginVertical: 20,
        borderRadius: 20
    },
    clickAddMorePlotsTitle: {
        textAlign: 'center',
        color: '#FFF'
    },
    LoadingScreen: {
        position: 'absolute',
        top: '52%',
        left: '45%',
        zIndex: 9999
    }
})
