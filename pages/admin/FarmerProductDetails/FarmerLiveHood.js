import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, BackHandler, Keyboard } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import ButtonForm from '../../Common/ButtonForm'
import InputTextForm from '../../Common/InputTextForm'
import DropdownForm from '../../Common/DropdownForm'
import { getItem } from '../../../config/getDataFromStorage'
import {
    fetchBlockAPI, fetchDistrictAPI, fetchStateAPI, problemPlotAgainstFarmerAPI,
    ProductionSeasonAndApi, ProductionProcessAPI, ProductionUnitAPI,
    livelihoodCropAndPlotDetailsAPI, PlotSiteUserLandDetails, UpdateLandCropdetailsAPI, AddLandCropDetailsAPI
} from '../../../config/apiHere'
import config from '../../../config';
import axios from 'axios';
import ButtonFormBottom from '../../Common/ButtonFormBottom';
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import DatePickerComp from '../../Common/DatePickerComp';
import { useRoute, useFocusEffect, useNavigation, useIsFocused } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { Root, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import LoadingScreen from '../../Common/LoadingScreen';
const qs = require('qs');
import HarvestedModel from './HarvestedModel';
import { useTranslation } from 'react-i18next';
import { CrashlyticsRecordError } from '../../Crashlytics/CrashlyticsRecordError'
const FarmerLiveHood = ({ navigation }) => {
    const { t } = useTranslation();
    // const navigation = useNavigation();
    const route = useRoute();
    const isFocused = useIsFocused();
    const [farmeruserID, setFarmeruserID] = useState("");
    const [plotSite, setPlotSite] = useState([])
    const [plotAll, setplotAll] = useState([]);
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
        supervisorID: ''
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
    const [harvested, setHarvested] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [plotSiteUserLandDetails, setplotSiteUserLandDetails] = useState([]);
    const [edit, setEdit] = useState("")
    const handlePlot = async (findData) => {
        setIsLoading(true);
        setHarvested("");
        const [productSeasonresRes, cropAndPlotDetails,
            // plotSiteUserLandDetails_res
        ] = await Promise.all([
            ProductionSeasonAndApi(dbLanTokUsr.dbName, dbLanTokUsr.languageID, ''),
            livelihoodCropAndPlotDetailsAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmeruserID, findData.value),
            // PlotSiteUserLandDetails(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, farmeruserID)
        ]);
        if (cropAndPlotDetails.status === 200) {
            if (cropAndPlotDetails.data.data.rows.length != 0) {
                const data = cropAndPlotDetails.data.data.rows[0];
                // if (plotSiteUserLandDetails_res.status === 200) {
                plotSiteUserLandDetails.map((dataLandDetails, index) => {
                    if (dataLandDetails.rel_id == findData.value) {
                        if (new Date(data.sowing_date) < new Date(data.harvesting_date) != true) {
                            setModalVisible(true)
                        } else {
                            setEdit(true);
                        }
                        setIsLoading(false);
                        setfarmerData({
                            ...farmerData,
                            createdBy: dbLanTokUsr.supervisorID,
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
                            terrainType: dataLandDetails.terrain_type?.name,
                            terrainTypeValue: dataLandDetails.terrain_type?.fid,
                            landType: dataLandDetails.lan_type?.name,
                            landTypeValue: dataLandDetails.lan_type?.fid,
                            soilType: dataLandDetails.soil_type?.name,
                            soilTypeValue: dataLandDetails.soil_type?.fid,
                            unit: dataLandDetails.land_unit?.name,
                            unitValue: dataLandDetails.land_unit?.fid,
                            productionSeason: data.crop_season?.name,
                            productionSeasonValue: data.crop_season?.fid,
                            livelihoodType: data.crop_type?.name,
                            livelihoodTypeValue: data.crop_type?.fid,
                            produceName: data.crop_name?.name,
                            produceNameValue: data.crop_name?.fid,
                            produceVariety: data.crop_variety?.name,
                            produceVarietyValue: data.crop_variety?.fid,
                            productionProcess: data.farmer_production_system?.name,
                            productionProcessValue: data.farmer_production_system?.fid,
                            unitProduct: data.agri_unit?.unit_name,
                            unitProductValue: data.agri_unit?.fid,
                            unit_value: dataLandDetails.land_unit.unit_value
                        })
                        return;
                    }
                })
                const values = [...location];
                values[0] = { latitude: plotSiteUserLandDetails[0].latitude, longitude: plotSiteUserLandDetails[0].longitude }
                data.land_info.agri_land_user_latlongs.map((data, index) => {
                    values[index] = { latitude: data.latitude, longitude: data.longitude }
                });
                setLocation(values);

            }
        }
        if (productSeasonresRes.status === 200) {
            const productSeasonresResArr = [];
            const livelihoodTypeArr = [];
            productSeasonresRes.data.data.crop_season.map((data, index) => {
                productSeasonresResArr.push({
                    value: data?.fid,
                    label: data?.name,
                });
            });
            productSeasonresRes.data.data.crop_type.map((data, index) => {
                livelihoodTypeArr.push({
                    value: data?.fid,
                    label: data?.name,
                });
            });
            setProductionSeason(productSeasonresResArr);
            setLivelihoodType(livelihoodTypeArr);
        }
    };
    const onPageLoad = async () => {
        try {
            const loginUser_data = await getItem('loginUser_data');
            if (loginUser_data) {
                setFarmeruserID(loginUser_data.user_id)
                const dbName = loginUser_data.dbname;
                const languageID = loginUser_data.lan_id;
                const user_id = loginUser_data.user_id;
                const token = loginUser_data.token;
                const supervisorID = loginUser_data.owner.user_id;
                const axiosConfig = {
                    headers: {
                        'information': `${dbName},${languageID}`,
                        'Accept': 'application/json'
                    },
                };
                const plotSiteApi = await problemPlotAgainstFarmerAPI(dbName, languageID, token, user_id);
                if (plotSiteApi) {
                    const dataArray = [];
                    plotSiteApi.data.data.forEach(element => {
                        dataArray.push({
                            value: element.rel_id,
                            label: element.plot_no
                        });
                    });
                    setplotAll(dataArray)
                }
                const [plotSiteUserLandDetails_res] = await Promise.all([
                    PlotSiteUserLandDetails(dbName, languageID, token, user_id),
                    terraintype_resAPI(axiosConfig),
                    soilType_resAPI(axiosConfig),
                    landType_resAPI(axiosConfig),
                    landunit_resAPI(axiosConfig),
                    produceVarietyAPI(dbName, languageID),
                    productionProcessAPI(dbName, languageID),
                ]);
                if (plotSiteUserLandDetails_res.status === 200) {
                    setplotSiteUserLandDetails(plotSiteUserLandDetails_res.data.data);
                }
                setdbLanTokUsr({
                    ...dbLanTokUsr,
                    dbName: dbName,
                    languageID: languageID,
                    userID: user_id,
                    token: token,
                    supervisorID: supervisorID
                });
            };
        } catch (error) {
            CrashlyticsRecordError(error.response)
        }
    }
    useEffect(() => {
        RemoveFarmerData();
        if (isFocused) {
            setUserData("");
            onPageLoad();
            setLocation([{ latitude: "", longitude: "" }, { latitude: "", longitude: "" }, { latitude: "", longitude: "" }])
            const onBackPress = () => {
                RemoveFarmerData();
                navigation.navigate('FarmerDashboard'); return true;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
    }, [isFocused]);
    const RemoveFarmerData = () => {
        setfarmerData({
            ...farmerData,
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
            // unit_valueArr: "",
        });
    }
    const handleHarvested = async (data) => {
        setHarvested(data);
        setEdit("");
        if (data === "same produce") {
            setfarmerData({
                ...farmerData,
                cycleStartDate: "",
                cycleEndDate: "",
            })
        } else {
            setfarmerData({
                ...farmerData,
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
                expectedProduction: "",
                cycleStartDate: "",
                cycleEndDate: "",
            });
        }
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
    const handleCurrentLatLong = async (index) => {
        const fusedLocation = await getItem('fusedLocation');
        const { latitude, longitude } = fusedLocation;
        const values = [...location];
        if (fusedLocation != null && longitude.toString().length == 10 && latitude.toString().length == 10) {
            values[index] = { "latitude": latitude, "longitude": longitude }
            setLocation(values);
        } else {
            Toast.show({ text: 'Please try again to reach the accurancy', ...AlertMesg[0] });
        }
    }
    const handleAddData = async (item, name, value) => {
        let selectUnitValue = "";
        if (name === 'unit') {
            if (farmerData.unit_valueArr != "") {
                JSON.parse(farmerData.unit_valueArr).map((data, index) => {
                    if (item.value === data?.fid) {
                        selectUnitValue = data.unit_value;
                    }
                });
            }
            ///****** *///
            setfarmerData({ ...farmerData, [name]: item.label, [value]: item.value, ['unit_value']: selectUnitValue })
        } else {
            setfarmerData({ ...farmerData, [name]: item.label, [value]: item.value });
            /******/
            if (name === "terrainType") {
                livelihoodTypeAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, item.value, '');
            }
            if (name === "produceVariety") {
                produceVarietyAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID);
            }
            if (name === "productionProcess") {
                productionProcessAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID);
            }
        }
    };
    const handleAddDataproductionSeason = (item, name, value) => {
        setfarmerData({
            ...farmerData,
            [name]: item.label, [value]: item.value,
            livelihoodType: "",
            livelihoodTypeValue: "",
            produceName: "",
            produceNameValue: "",
            produceVariety: "",
            produceVarietyValue: "",
            productionProcess: "",
            productionProcessValue: "",
        })
    }
    const handleAddDatalivelihoodType = async (item, name, value) => {
        setfarmerData({
            ...farmerData, [name]: item.label,
            [value]: item.value,
            produceName: "",
            produceNameValue: "",
            produceVariety: "",
            produceVarietyValue: "",
        })
        if (name === 'livelihoodType') {
            livelihoodTypeAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, item.value, '');
        }
    }
    const handleAddDataproduceName = async (item, name, value) => {
        setfarmerData({
            ...farmerData, [name]: item.label,
            [value]: item.value,
            produceVariety: "",
            produceVarietyValue: "",
        })
        if (name === 'produceName') {
            produceNameAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmerData.livelihoodTypeValue, item.value);
        }
    }
    const terraintype_resAPI = async (axiosConfig) => {
        try {
            let terraintype_res = await axios.get(config.terraintypeAPI, axiosConfig);
            let terraintypeArray = [];
            if (terraintype_res.data.data.count > 0) {
                terraintype_res.data.data.rows.forEach(element => {
                    terraintypeArray.push({
                        value: element.id,
                        label: element?.name,
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
                        label: element?.name,
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
                        label: element?.name,
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
                        label: element?.name,
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
                    value: data?.fid,
                    label: data?.name,
                });
            });
            productSeasonresRes.data.data.crop_type.map((data, index) => {
                livelihoodTypeArr.push({
                    value: data?.fid,
                    label: data?.name,
                });
            });
            productSeasonresRes.data.data.crop_name.map((data, index) => {
                produceNameArr.push({
                    value: data.crop_name?.fid,
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
                value: data.crop_variety?.fid,
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
                    value: data?.fid,
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
                    value: data?.fid,
                    label: data?.unit_name,
                });
            })
            setProductionUnit(productionUnitArr)
        }
    }
    const handleUserListUpdate = async () => {
        Keyboard.dismiss();
        const locationArry = [];
        const latlongArr = [];
        location.map((data, index) => {
            if (data.latitude != "" && data.latitude != undefined) {
                locationArry.push("latitude")
                latlongArr.push({ "latitude": data.latitude, "longitude": data.longitude })
            }
        })
        if (farmerData.plot_Site_Name == "") {
            Toast.show({ text: `${t('please_add_plot_name_first')}`, ...AlertMesg[0] })
        } else if (farmerData.terrainTypeValue == "") {
            Toast.show({ text: `${t('please_select_terrain_type_first')}`, ...AlertMesg[0] });
        } else if (farmerData.landTypeValue == "") {
            Toast.show({ text: `${t('please_enter_plot_name_first')}`, ...AlertMesg[0] });
        } else if (farmerData.soilTypeValue == "") {
            Toast.show({ text: `${t('please_select_soil_type_first')}`, ...AlertMesg[0] });
        } else if (farmerData.unitValue == "") {
            Toast.show({ text: `${t('please_select_unit_first')}`, ...AlertMesg[0] });
        } else if (farmerData.land_size == "") {
            Toast.show({ text: `${t('please_enter_unit')}`, ...AlertMesg[0] });
        } else if (locationArry.length == 0) {
            Toast.show({ text: `${t('please_submit_location_first')}`, ...AlertMesg[0] });
        } else if (farmerData.productionSeasonValue == "") {
            Toast.show({ text: `${t('please_select_cultiveting_season_first')}`, ...AlertMesg[0] });
        } else if (farmerData.livelihoodTypeValue == "") {
            Toast.show({ text: `${t('please_select_crop_type_first')}`, ...AlertMesg[0] });
        } else if (farmerData.produceNameValue == "") {
            Toast.show({ text: `${t('please_select_crop_name_first')}`, ...AlertMesg[0] });
        } else if (farmerData.produceVarietyValue == "") {
            Toast.show({ text: `${t('please_select_crop_veriety_first')}`, ...AlertMesg[0] });
        } else if (farmerData.productionProcessValue == "") {
            Toast.show({ text: `${t('please_select_production_system_first')}`, ...AlertMesg[0] });
        } else if (farmerData.expectedProduction == "") {
            Toast.show({ text: `${t('please_give_yeild_size')}`, ...AlertMesg[0] });
        } else if (farmerData.unitProductValue == "") {
            Toast.show({ text: `${t('please_select_yeild_unit')}`, ...AlertMesg[0] });
        } else if (farmerData.cycleStartDate == "") {
            Toast.show({ text: 'Please Select Planting Date', ...AlertMesg[0] });
        } else if (farmerData.cycleEndDate == "") {
            Toast.show({ text: `${t('select_enddate_first')}`, ...AlertMesg[0] });
        } else {
            let land_convert_size_value = "";
            //land_convert_size_value fix
            if (farmerData.unit_value == null || farmerData.unit_value == "" || farmerData.unit_value == undefined) {
                land_convert_size_value = farmerData.land_size * 1
            } else {
                land_convert_size_value = farmerData.land_size * farmerData.unit_value
            }
            const latlongArrString = JSON.stringify(latlongArr);
            let save_data = qs.stringify({
                plot_no: farmerData.plot_Site_Name,
                createdBy: dbLanTokUsr.userID,
                daag_no: farmerData.daag_no,
                khatian_no: farmerData.khatian_no,
                plant_number: farmerData.plant_number,
                terrain_type_id: farmerData.terrainTypeValue,
                lan_type_id: farmerData.landTypeValue,
                soil_type_id: farmerData.soilTypeValue,
                land_unit_id: farmerData.unitValue,
                land_size: farmerData.land_size,
                land_convert_size: land_convert_size_value,
                latitude: latlongArr[0].latitude,
                longitude: latlongArr[0].longitude,
                status: 1,
                crop_season_id: farmerData.productionSeasonValue,
                crop_type_id: farmerData.livelihoodTypeValue,
                crop_name_id: farmerData.produceNameValue,
                crop_variety_id: farmerData.produceVarietyValue,
                sowing_date: farmerData.cycleStartDate,
                harvesting_date: farmerData.cycleEndDate,
                is_primary: 0,
                certified_seed: "No",
                have_land_title: "No",
                production_system: farmerData.productionProcessValue,
                have_fertilizer: "Yes",
                buy_pesticide: "Yes",
                yield_amount: farmerData.expectedProduction,
                yield_unit: farmerData.unitProductValue,
                crop_cycl_start_date: "2004-02-29",
                // crop_cycl_start_date: farmerData.cycleStartDate,
                latlong_data: latlongArrString,
            });
            if (userData == "addUserData") {
                const AddLandCropDetails_res = await AddLandCropDetailsAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmeruserID, dbLanTokUsr.token, save_data, '', '');
                if (AddLandCropDetails_res.status === 200) {
                    Toast.show({ text: 'Plot/Site Produce Add Succesfully', ...AlertMesg[0] });
                    setTimeout(() => {
                        navigation.navigate('FarmerDashboard')
                    }, 2000);
                }
            } else {
                const updateLandCropdetails_res = await UpdateLandCropdetailsAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmeruserID, dbLanTokUsr.token, save_data, farmerData.land_rel_id, farmerData.cu_rel_id)
                if (updateLandCropdetails_res.status === 200) {
                    Toast.show({ text: 'Plot/Site Produce Updateed Succesfully', ...AlertMesg[0] });
                    setTimeout(() => {
                        navigation.navigate('FarmerDashboard')
                    }, 2000);
                }
            }
        }
    }
    const handleUserData = async () => {
        setUserData("addUserData");
        setEdit("");
        RemoveFarmerData();
    }
    const handleAddUserData = (name, data) => {
        setfarmerData({ ...farmerData, [`${name}`]: data });
    }
    const HandlerGoBack = () => {
        navigation.navigate('FarmerDashboard');
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
                <CustomHeader path='FarmerDashboard' HandlerGoBack={HandlerGoBack} />
                <FormsTitle title={'Plot/Site & Produce Details'} />
                {isLoading ? <View style={styles.LoadingScreen}>
                    <LoadingScreen />
                </View> : null}
                <HarvestedModel setModalVisible={setModalVisible} modalVisible={modalVisible} handleHarvested={handleHarvested} />
                <ScrollView style={{ marginHorizontal: 30, marginVertical: 10, }} showsVerticalScrollIndicator={false}>
                    <View style={{ marginBottom: 40, }}>
                        {
                            userData == "addUserData" ?
                                <InputTextForm label="Plot/Site" color="red" value={farmerData.plot_Site_Name} onChangeText={(text) => handleAddUserData("plot_Site_Name", text)} />
                                : <DropdownForm label="Plot/Site" color="red" data={plotAll} onChange={(relId) => handlePlot(relId)} val={farmerData.plot_Site_Name} />
                        }
                        <InputTextForm label="Plot/Site Record Detail (Daag No.)" value={farmerData.daag_no} onChangeText={(text) => handleAddUserData("daag_no", text)} />
                        <InputTextForm label="Plot/Site Record Detail (Khatian No.)" value={farmerData.khatian_no} onChangeText={(text) => handleAddUserData("khatian_no", text)} />

                        <InputTextForm label="No. of Plants/Livestock" value={farmerData.plant_number} onChangeText={(text) => handleAddUserData("plant_number", text)} />

                        <DropdownForm label="Terrain Type" color="red"
                            data={terrainTypeAll} val={farmerData.terrainType}
                            onChange={item => { handleAddData(item, 'terrainType', 'terrainTypeValue') }} />
                        <DropdownForm label="Land Type" color="red" data={landTypeAll}
                            onChange={item => { handleAddData(item, 'landType', 'landTypeValue') }}
                            val={farmerData.landTypeValue} />
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
                                                <Text style={styles.title}>Tap to geo tag the plot/site</Text>
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
                            onChange={item => { handleAddDataproductionSeason(item, 'productionSeason', 'productionSeasonValue') }}
                            val={farmerData.productionSeason} disable={edit} />
                        <DropdownForm label="Livelihood Type" color="red"
                            data={livelihoodType}
                            onChange={item => { handleAddDatalivelihoodType(item, 'livelihoodType', 'livelihoodTypeValue') }}
                            val={farmerData.livelihoodType} disable={edit == "" ? harvested == "same produce" ? true : false : edit} />
                        <DropdownForm label="Produce Name" color="red"
                            data={produceName}
                            onChange={item => { handleAddDataproduceName(item, 'produceName', 'produceNameValue') }}
                            val={farmerData.produceName} disable={edit == "" ? harvested == "same produce" ? true : false : edit} />
                        <DropdownForm label="Produce Variety" color="red"
                            data={produceVariety}
                            onChange={item => { handleAddData(item, 'produceVariety', 'produceVarietyValue') }}
                            val={farmerData.produceVariety} disable={edit == "" ? harvested == "same produce" ? true : false : edit} />
                        <DropdownForm label="Production Process" color="red"
                            data={productionProcess}
                            onChange={item => { handleAddData(item, 'productionProcess', 'productionProcessValue') }}
                            val={farmerData.productionProcess} disable={edit} />
                        <View style={styles.plotSiteUnit}>
                            <View style={{ width: '45%' }}>
                                <InputTextForm label={"Expected \nProduction"} color="red" value={farmerData.expectedProduction} onChangeText={(text) => handleAddUserData("expectedProduction", text)} />
                            </View>
                            <View style={{ width: '45%' }}>
                                <DropdownForm label={"Unit\n"} color="red" data={productionUnit}
                                    onChange={item => { handleAddData(item, 'unitProduct', 'unitProductValue') }}
                                    val={farmerData.unitProduct} disable={edit} />
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

export default FarmerLiveHood

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
