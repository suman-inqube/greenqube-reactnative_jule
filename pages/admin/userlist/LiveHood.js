import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Keyboard, } from 'react-native'
import React, { useState, useEffect, useCallback, useContext } from 'react'
import {
    ProductionSeasonAndApi, ProductionProcessAPI, ProductionUnitAPI,
    livelihoodCropAndPlotDetailsAPI, PlotSiteUserLandDetails, UpdateLandCropdetailsAPI, AddLandCropDetailsAPI
} from '../../../config/apiHere'
import config from '../../../config';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
const qs = require('qs');
import HarvestedModel from './HarvestedModel';
import { CrashlyticsRecordError } from '../../Crashlytics/CrashlyticsRecordError';
//GQR-65
import { userCreateContext } from '../../Context/usersCreateContext';
const LiveHood = ({ sendDataToParent }) => {
    //GQR-65
    const { loginUser_data, t, AlertMesg, onBackPress, getItem, logoImage, topBanner, Root, Toast, LoadingScreen, DatePickerComp,
        FormsTitle, CustomHeader, ButtonFormBottom, InputTextForm, DropdownForm, effective_dates } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    //GQR-65
    const navigation = useNavigation();
    const route = useRoute();
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
    const [terrainTypeAll, setterrainTypeAll] = useState([]);
    const [soilTypeAll, setsetsoilTypeAll] = useState([]);
    const [landTypeAll, setlandTypeAll] = useState([]);
    const [unitAll, setUnitAll] = useState([]);
    const [location, setLocation] = useState([
        { latitude: "", longitude: "" },
        { latitude: "", longitude: "" },
        { latitude: "", longitude: "" }
    ])
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
        const [productSeasonresRes, cropAndPlotDetails,] = await Promise.all([
            ProductionSeasonAndApi(dbname, lan_id, ''),
            livelihoodCropAndPlotDetailsAPI(dbname, lan_id, farmeruserID, findData.value),
        ]);
        if (cropAndPlotDetails?.status === 200) {
            if (cropAndPlotDetails.data.data.rows.length != 0) {
                const data = cropAndPlotDetails.data.data.rows[0];
                plotSiteUserLandDetails.map((dataLandDetails, index) => {
                    if (dataLandDetails?.rel_id == findData.value) {
                        if (new Date() < new Date(data.harvesting_date) != true) {
                            setModalVisible(true)
                        } else {
                            setEdit(true);
                        }
                        setIsLoading(false);
                        setfarmerData({
                            ...farmerData,
                            createdBy: user_id,
                            plot_no: data?.land_info?.plot_no,
                            cu_rel_id: data?.cu_rel_id,
                            land_rel_id: findData?.value,
                            daag_no: dataLandDetails?.daag_no,
                            khatian_no: dataLandDetails?.khatian_no,
                            plant_number: dataLandDetails?.plant_number,
                            land_size: dataLandDetails?.land_size,
                            plot_Site: findData?.value,
                            plot_Site_Name: findData?.label,
                            expectedProduction: data?.yield_amount,
                            cycleStartDate: data?.sowing_date,
                            cycleEndDate: data?.harvesting_date.substring(-1, 10),
                            terrainType: dataLandDetails?.terrain_type?.name,
                            terrainTypeValue: dataLandDetails?.terrain_type?.fid,
                            landType: dataLandDetails?.lan_type?.name,
                            landTypeValue: dataLandDetails?.lan_type?.fid,
                            soilType: dataLandDetails?.soil_type?.name,
                            soilTypeValue: dataLandDetails?.soil_type?.fid,
                            unit: dataLandDetails?.land_unit?.name,
                            unitValue: dataLandDetails?.land_unit?.fid,
                            productionSeason: data?.crop_season?.name,
                            productionSeasonValue: data?.crop_season?.fid,
                            livelihoodType: data?.crop_type?.name,
                            livelihoodTypeValue: data?.crop_type?.fid,
                            produceName: data?.crop_name?.name,
                            produceNameValue: data?.crop_name?.fid,
                            produceVariety: data?.crop_variety?.name,
                            produceVarietyValue: data?.crop_variety?.fid,
                            productionProcess: data?.farmer_production_system?.name,
                            productionProcessValue: data?.farmer_production_system?.fid,
                            unitProduct: data?.agri_unit && data?.agri_unit.unit_name,
                            unitProductValue: data?.agri_unit && data?.agri_unit?.fid,
                            unit_value: dataLandDetails?.land_unit.unit_value,
                        })
                        return;
                    }
                })
                const agri_land_user_latlongs = data.land_info.agri_land_user_latlongs;
                const values = [...location];
                if (values.length < agri_land_user_latlongs.length) {
                    values[0] = { latitude: plotSiteUserLandDetails[0].latitude, longitude: plotSiteUserLandDetails[0].longitude }
                    agri_land_user_latlongs.map((data, index) => {
                        if (data.latitude != "") { values[index] = { latitude: data.latitude, longitude: data.longitude } }
                    });
                    setLocation(values);
                } else {
                    const values = [];
                    values[0] = { latitude: plotSiteUserLandDetails[0].latitude, longitude: plotSiteUserLandDetails[0].longitude };
                    location.map((locationData, index) => {
                        if (agri_land_user_latlongs[index] != undefined) {
                            values[index] = { latitude: agri_land_user_latlongs[index].latitude, longitude: agri_land_user_latlongs[index].longitude };
                        } else {
                            if (agri_land_user_latlongs[0] == undefined) {
                                values[index + 1] = { latitude: "", longitude: "" };
                            } else {
                                values[index] = { latitude: "", longitude: "" };
                            }
                        }
                    })
                    setLocation(values);
                }
            }
        }
        if (productSeasonresRes?.status === 200) {
            const productSeasonresResArr = productSeasonresRes?.data?.data?.crop_season.map(data => ({ value: data?.fid, label: data?.name }));
            const livelihoodTypeArr = productSeasonresRes?.data?.data?.crop_type.map(data => ({ value: data?.fid, label: data?.name }));
            setProductionSeason(productSeasonresResArr);
            setLivelihoodType(livelihoodTypeArr);
        }
    };
    const locationEmpty = () => {
        setLocation([{ latitude: "", longitude: "" }, { latitude: "", longitude: "" },
        { latitude: "", longitude: "" }])
    }
    const onPageLoad = async () => {
        try {
            const axiosConfig = {
                headers: {
                    'information': `${dbname},${lan_id}`,
                    'Accept': 'application/json'
                },
            };
            const [plotSiteUserLandDetails_res] = await Promise.all([
                PlotSiteUserLandDetails(dbname, lan_id, token, farmeruserID),
                terraintype_resAPI(axiosConfig),
                soilType_resAPI(axiosConfig),
                landType_resAPI(axiosConfig),
                landunit_resAPI(axiosConfig),
                produceVarietyAPI(dbname, lan_id),
                productionProcessAPI(dbname, lan_id),
            ]);
            if (plotSiteUserLandDetails_res?.status === 200) {
                setplotSiteUserLandDetails(plotSiteUserLandDetails_res.data.data);
            }
        } catch (error) {
            CrashlyticsRecordError(error)
        }
    }
    const handleBackPress = () => {
        navigation.navigate('userList'); return true;
    }
    useEffect(() => {
        onPageLoad();
        locationEmpty();
        onBackPress(handleBackPress);
    }, []);

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
    const handleDatePicker = (item) => setfarmerData({ ...farmerData, cycleStartDate: effective_dates(item) });
    const handleDatePicker2 = (item) => setfarmerData({ ...farmerData, cycleEndDate: effective_dates(item) });
    const addMoreLocation = async () => setLocation([...location, { lat: "", long: "" }]);
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
            setfarmerData({ ...farmerData, [name]: item.label, [value]: item.value, ['unit_value']: selectUnitValue })
        } else {
            setfarmerData({ ...farmerData, [name]: item.label, [value]: item.value });
            if (name === "terrainType") {
                livelihoodTypeAPI(dbname, lan_id, item.value, '');
            }
            if (name === "produceVariety") {
                produceVarietyAPI(dbname, lan_id);
            }
            if (name === "productionProcess") {
                productionProcessAPI(dbname, lan_id);
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
            livelihoodTypeAPI(dbname, lan_id, item.value, '');
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
            produceNameAPI(dbname, lan_id, farmerData.livelihoodTypeValue, item.value);
        }
    }
    const terraintype_resAPI = async (axiosConfig) => {
        try {
            let terraintype_res = await axios.get(config.terraintypeAPI, axiosConfig);
            if (terraintype_res?.status == 200) {
                const terraintypeArray = terraintype_res.data.data.rows.map(data => ({ value: data.id, label: data?.name }))
                setterrainTypeAll(terraintypeArray);
            }
        } catch (error) {
            console.log("Error in terraintypeAPI API", error);
        }
    }
    const soilType_resAPI = async (axiosConfig) => {
        try {
            let soilType_res = await axios.get(config.soiltypeAPI, axiosConfig);
            if (soilType_res?.status == 200) {
                const soilTypeArray = soilType_res?.data?.data?.rows.map(data => ({ value: data.id, label: data?.name }));
                setsetsoilTypeAll(soilTypeArray);
            }
        } catch (error) {
            console.log("Error in soiltypeAPI API", error);
        }
    }
    const landType_resAPI = async (axiosConfig) => {
        try {
            let landType_res = await axios.get(config.landtypeAPI, axiosConfig);
            if (landType_res?.status == 200) {
                const landTypeArray = landType_res?.data?.data?.rows.map(data => ({ value: data.id, label: data?.name }));
                setlandTypeAll(landTypeArray);
            }
        } catch (error) {
            console.log("Error in landtypeAPI API", error);
        }
    }
    const landunit_resAPI = async (axiosConfig) => {
        try {
            let landunitAPI = await axios.get(config.landunitAPI, axiosConfig);
            if (landunitAPI?.status == 200) {
                setfarmerData({ ...farmerData, unit_valueArr: JSON.stringify(landunitAPI.data.data.rows) });
                const landunitArray = landunitAPI?.data?.data?.rows.map(data => ({ value: data.id, label: data?.name }));
                setUnitAll(landunitArray);
            }
        } catch (error) {
            console.log("Error in landtypeAPI API", error);
        }
    }
    const livelihoodTypeAPI = async (dbName, languageID, crop_type_id, crop_name_id) => {
        const productSeasonresRes = await ProductionSeasonAndApi(dbName, languageID, crop_type_id, crop_name_id);
        if (productSeasonresRes?.status === 200) {
            const productSeasonresResArr = productSeasonresRes?.data?.data?.crop_season.map(data => ({ value: data?.fid, label: data?.name }));
            const livelihoodTypeArr = productSeasonresRes?.data?.data?.crop_type.map(data => ({ value: data?.fid, label: data?.name }));
            const produceNameArr = productSeasonresRes?.data?.data?.crop_name.map(data => ({ value: data.crop_name?.fid, label: data.crop_name?.name }))
            setProductionSeason(productSeasonresResArr);
            setLivelihoodType(livelihoodTypeArr);
            setProduceName(produceNameArr);
        }
    }
    const produceNameAPI = async (dbName, languageID, crop_type_id, crop_name_id) => {
        const productSeasonresRes = await ProductionSeasonAndApi(dbName, languageID, crop_type_id, crop_name_id);
        if (productSeasonresRes?.status == 200) {
            const produceVariety = productSeasonresRes?.data?.data?.crop_variety.map(data => ({ value: data.crop_variety?.fid, label: data.crop_variety?.name }))
            setProduceVariety(produceVariety);
        }
    }
    const produceVarietyAPI = async (dbName, languageID) => {
        const productionProcessRes = await ProductionProcessAPI(dbName, languageID);
        if (productionProcessRes?.status == 200) {
            const productionProcessArr = productionProcessRes?.data?.data?.rows.map(data => ({ value: data?.fid, label: data?.name, }));
            setProductionProcess(productionProcessArr);
        }
    }
    const productionProcessAPI = async (dbName, languageID) => {
        const ProductionUnitRes = await ProductionUnitAPI(dbName, languageID);
        if (ProductionUnitRes?.status == 200) {
            const productionUnitArr = ProductionUnitRes?.data?.data?.rows.map(data => ({ value: data?.fid, label: data.unit_name }));
            setProductionUnit(productionUnitArr);
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
                createdBy: user_id,
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
                const AddLandCropDetails_res = await AddLandCropDetailsAPI(dbname, lan_id, farmeruserID, token, save_data, '', '');
                if (AddLandCropDetails_res.status === 200) {
                    locationEmpty();
                    Toast.show({ text: t('l_c_add_succ'), ...AlertMesg[0] });
                    setTimeout(() => { navigation.navigate('Dashboard') }, 2000);
                }
            } else {
                const updateLandCropdetails_res = await UpdateLandCropdetailsAPI(dbname, lan_id, farmeruserID, token, save_data, farmerData.land_rel_id, farmerData.cu_rel_id)
                if (updateLandCropdetails_res.status === 200) {
                    locationEmpty();
                    Toast.show({ text: t('l_c_update_succ'), ...AlertMesg[0] });
                    setTimeout(() => { navigation.navigate('Dashboard') }, 2000);
                }
            }
        }
    }
    const handleUserData = async () => {
        setUserData("addUserData");
        setEdit("")
        RemoveFarmerData();
        locationEmpty();
    }
    const handleAddUserData = (name, data) => setfarmerData({ ...farmerData, [`${name}`]: data });
    const HandlerGoBack = () => navigation.navigate('userList');
    return (
        <>
            <Root>
                {/* <ForegroundLocationService /> */}
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
                <CustomHeader path='userList' HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
                <FormsTitle title={t('plot_and_crop_details')} />
                {isLoading ? <View style={styles.LoadingScreen}>
                    <LoadingScreen />
                </View> : null}
                <HarvestedModel setModalVisible={setModalVisible} modalVisible={modalVisible} handleHarvested={handleHarvested} />
                <ScrollView style={{ marginHorizontal: 30, marginVertical: 10, }} showsVerticalScrollIndicator={false}>
                    <View style={{ marginBottom: 40, }}>
                        {
                            userData == "addUserData" ?
                                <InputTextForm label={t('addland_select_plot')} color="red" value={farmerData.plot_Site_Name} onChangeText={(text) => handleAddUserData("plot_Site_Name", text)} />
                                : <DropdownForm label={t('addland_select_plot')} color="red" data={agri_land_user_rels} onChange={(item) => { handlePlot(item), locationEmpty() }} val={farmerData.plot_Site_Name} />
                        }
                        <InputTextForm label={t('daag_no')} value={farmerData.daag_no} onChangeText={(text) => handleAddUserData("daag_no", text)} />
                        <InputTextForm label={t('khatian_no')} value={farmerData.khatian_no} onChangeText={(text) => handleAddUserData("khatian_no", text)} />

                        <InputTextForm label={t('no_of_plants')} value={farmerData.plant_number} onChangeText={(text) => handleAddUserData("plant_number", text)} />

                        <DropdownForm label={t('select_terrain_type')} color="red"
                            data={terrainTypeAll} val={farmerData.terrainType}
                            onChange={item => { handleAddData(item, 'terrainType', 'terrainTypeValue') }} />
                        <DropdownForm label={t('select_land_type')} color="red" data={landTypeAll}
                            onChange={item => { handleAddData(item, 'landType', 'landTypeValue') }}
                            val={farmerData.landTypeValue} />
                        <DropdownForm label={t('addland_soil_type_dv')} color="red" data={soilTypeAll}
                            onChange={item => { handleAddData(item, 'soilType', 'soilTypeValue') }}
                            val={farmerData.soilType} />
                        <View style={styles.plotSiteUnit}>
                            <View style={{ width: '45%' }}>
                                <InputTextForm label={t('pre_land_size')} color="red" value={farmerData.land_size} onChangeText={(text) => handleAddUserData("land_size", text)} />
                            </View>
                            <View style={{ width: '45%' }}>
                                <DropdownForm label={t('select_unit')} color="red" data={unitAll}
                                    onChange={item => { handleAddData(item, 'unit', 'unitValue') }}
                                    val={farmerData.unit} />
                            </View>
                        </View>
                        <View style={styles.locationContainer}>
                            {
                                location && location.map((data, index) => (
                                    <TouchableOpacity key={index} onPress={() => handleCurrentLatLong(index)}>
                                        <View style={styles.latlongContainer}>
                                            <Text style={styles.title}>{data && data.latitude && data.latitude == "" ? "0.0" : data.latitude}</Text>
                                            <Text style={styles.title}>{data && data.longitude && data.longitude == "" ? "0.0" : data.longitude}</Text>
                                        </View>
                                        <View style={styles.latlongContainer}>
                                            <Text style={styles.title}>{t('tap_to_get_latitude_and_longitude')}</Text>
                                            {/* <TouchableOpacity onPress={() => handleCurrentLatLong(index)}> */}
                                            <Image
                                                source={require('../../Common/images/location.png')}
                                                style={{ width: 40, height: 40 }}
                                                resizeMode="contain"
                                            />
                                            {/* </TouchableOpacity> */}
                                        </View>
                                    </TouchableOpacity>
                                )
                                )
                            }
                        </View>
                        <DropdownForm label={t('addcrop_select_cultivating_season')} color="red"
                            data={productionSeason}
                            onChange={item => { handleAddDataproductionSeason(item, 'productionSeason', 'productionSeasonValue') }}
                            val={farmerData.productionSeason} disable={edit} />
                        <DropdownForm label={t('addcrop_croptype')} color="red"
                            data={livelihoodType}
                            onChange={item => { handleAddDatalivelihoodType(item, 'livelihoodType', 'livelihoodTypeValue') }}
                            val={farmerData.livelihoodType} disable={edit == "" ? harvested == "same produce" ? true : false : edit} />
                        <DropdownForm label={t('crop_name')} color="red"
                            data={produceName}
                            onChange={item => { handleAddDataproduceName(item, 'produceName', 'produceNameValue') }}
                            val={farmerData.produceName} disable={edit == "" ? harvested == "same produce" ? true : false : edit} />
                        <DropdownForm label={t('crop_veriety')} color="red"
                            data={produceVariety}
                            onChange={item => { handleAddData(item, 'produceVariety', 'produceVarietyValue') }}
                            val={farmerData.produceVariety} disable={edit == "" ? harvested == "same produce" ? true : false : edit} />
                        <DropdownForm label={t('production_system')} color="red"
                            data={productionProcess}
                            onChange={item => { handleAddData(item, 'productionProcess', 'productionProcessValue') }}
                            val={farmerData.productionProcess} disable={edit} />
                        <View style={styles.plotSiteUnit}>
                            <View style={{ width: '45%' }}>
                                <InputTextForm label={t('expected_yield')} keyboardType='number-pad' color="red" value={farmerData.expectedProduction}
                                    onChangeText={(text) => handleAddUserData("expectedProduction", text)} />
                            </View>
                            <View style={{ width: '45%' }}>
                                <DropdownForm label={`${t('select_unit_input')}` + "\n"} color="red" data={productionUnit}
                                    onChange={item => { handleAddData(item, 'unitProduct', 'unitProductValue') }}
                                    val={farmerData.unitProduct} disable={edit} />
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => setopenCycleStart(true)} activeOpacity={9}>
                            <Text style={{ marginBottom: 5, color: '#f40000' }}>{t('showing_date')}</Text>
                            <View style={styles.calenderContainer} >
                                <Text style={{ color: '#000' }}>{farmerData.cycleStartDate}</Text>
                                <Image source={require('../../Common/images/calendar.png')} style={{ width: 20, height: 20 }} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setopenCycleEnd(true)} activeOpacity={9}>
                            <Text style={{ marginBottom: 5, color: '#f40000', marginTop: 10 }}>{t('harvesting_date_auto_calculated')}</Text>
                            <View style={styles.calenderContainer} >
                                <Text style={{ color: '#000' }}>{farmerData.cycleEndDate}</Text>
                                <Image source={require('../../Common/images/calendar.png')} style={{ width: 20, height: 20 }} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.clickAddMorePlots} onPress={() => handleUserData()}>
                            <Text style={styles.clickAddMorePlotsTitle}>{t('click_to_add_more_plot')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <TouchableOpacity style={styles.locationAddMoreContainer} onPress={addMoreLocation}                >
                    <Text style={[styles.title, { color: '#FFF', marginRight: 20 }]}>{t('AddLocation')}</Text>
                </TouchableOpacity>
                <ButtonFormBottom label={t('submit')} onPress={() => handleUserListUpdate()} />
            </Root>
        </>
    )
}
export default LiveHood;
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
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
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
        color: '#FFF',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    },
    LoadingScreen: {
        position: 'absolute',
        top: '52%',
        left: '45%',
        zIndex: 9999
    }
})
