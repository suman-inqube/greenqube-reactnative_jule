import { StyleSheet, Text, View, ScrollView, Keyboard, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState, useCallback, useContext } from 'react'
import { useNavigation, useRoute, useIsFocused, useFocusEffect } from '@react-navigation/native';
import ImageForm from '../../Common/ImageForm';
import {
    TterrainTypeAPI,
    landTypeAPI,
    soilTypeAPI,
    landUnitAPI,
    ProducceSeasionAPI,
    livelihoodTypeAPI,
    produceNameDataListAPI,
    produceVarietyAPI,
    ProductionProcessDataAPI,
    ProduceProductionUnitDataAPI
} from './UserRegistationAPI';
import { userCreateContext } from '../../Context/usersCreateContext';
const PlotSiteProduceInformation = () => {
    //GQR-65
    const { dbLanTokUsr, InputTextForm, getItem, setItem, AlertMesg, t, ButtonForm, onBackPress, DeviceInfo,
        DropdownForm, Root, Toast, CustomHeader, FormsTitle, logoImage, topBanner, DatePicker, LoadingScreen } = useContext(userCreateContext);
    //GQR-65
    const { netConnection } = DeviceInfo();
    const route = useRoute();
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
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
        produceProductionUnitValue: "",
        cycleStarts: "",
        cycleEnds: "",
        lat: "",
        long: ""
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
    const [produceVarietyData, setproduceVarietyData] = useState([]);
    const [productionProcessData, setproductionProcessData] = useState([]);
    const [produceProductionUnitData, setproduceProductionUnitData] = useState([]);
    const [produceAddDetails, setProduceAddDetails] = useState([]);
    const [currentlatlong, setCurrentlatlong] = useState({ lat: "", long: "" });
    const [remove, setRemove] = useState("");
    const [path, setPath] = useState("");
    const onPageLoad = async () => {
        //GQR-65
        const { dbName, languageId, token, supervisorId, company, country } = dbLanTokUsr;
        //GQR-65
        var terraintypeArray = [];
        var landTypeArray = [];
        var soilTypeArray = [];
        var landUnitArray = [];
        var prodctionSeasionArray = [];
        var livelihoodTypeArray = [];
        var productionProcessArray = [];
        var produceProductionUnitArray = [];
        if (netConnection) {
            var [tterrainType_res, landType_res, soilType_res, landUnit_res, producceSeasion_res,
                livelihoodType_res, productionProcessData_res, produceProductionUnitData_res
            ] = await Promise.all([
                TterrainTypeAPI(dbName, languageId),
                landTypeAPI(dbName, languageId),
                soilTypeAPI(dbName, languageId),
                landUnitAPI(dbName, languageId),
                ProducceSeasionAPI(dbName, languageId),
                livelihoodTypeAPI(dbName, languageId),
                ProductionProcessDataAPI(dbName, languageId),
                ProduceProductionUnitDataAPI(dbName, languageId),
            ]);
            //GQR-65
            if (tterrainType_res?.status === 200) {
                terraintypeArray = tterrainType_res?.data?.data?.rows?.map(data => ({ value: data.id, label: data.name }));
            }
            if (landType_res?.status === 200) {
                landTypeArray = landType_res?.data?.data?.rows?.map(data => ({ value: data.id, label: data.name }));
            }
            if (soilType_res?.status === 200) {
                soilTypeArray = soilType_res?.data?.data?.rows?.map(data => ({ value: data.id, label: data.name }));
            }
            if (landUnit_res?.status === 200) {
                landUnitArray = landUnit_res?.data?.data?.rows.map(data => ({ value: data.id, label: data.name, sizevalue: data.unit_value }));
            }
            if (producceSeasion_res?.status === 200) {
                prodctionSeasionArray = producceSeasion_res?.data?.data?.crop_season?.map(data => ({ value: data.fid, label: data.name }))
            }
            if (livelihoodType_res?.status === 200) {
                livelihoodTypeArray = livelihoodType_res?.data?.data?.crop_type?.map(data => ({ value: data.fid, label: data.name }));
            }
            if (productionProcessData_res?.status === 200) {
                productionProcessArray = productionProcessData_res?.data?.data?.rows?.map(data => ({ value: data.fid, label: data.name }))
            }
            if (produceProductionUnitData_res?.status === 200) {
                produceProductionUnitArray = produceProductionUnitData_res?.data?.data?.rows.map(data => ({ value: data.fid, label: data.unit_name }))
            }
            // const [terraintypeArray, landTypeArray, soilTypeArray, landUnitArray, prodctionSeasionArray,
            //     livelihoodTypeArray, productionProcessArray, produceProductionUnitArray] = await Promise.all([
            //         tterrainType_res?.data?.data?.rows?.map(data => ({ value: data.id, label: data.name })),
            //         landType_res?.data?.data?.rows?.map(data => ({ value: data.id, label: data.name })),
            //         soilType_res?.data?.data?.rows?.map(data => ({ value: data.id, label: data.name })),
            //         landUnit_res?.data?.data?.rows.map(data => ({ value: data.id, label: data.name, sizevalue: data.unit_value })),
            //         producceSeasion_res?.data?.data?.crop_season?.map(data => ({ value: data.fid, label: data.name })),
            //         livelihoodType_res?.data?.data?.crop_type?.map(data => ({ value: data.fid, label: data.name })),
            //         productionProcessData_res?.data?.data?.rows?.map(data => ({ value: data.fid, label: data.name })),
            //         produceProductionUnitData_res?.data?.data?.rows.map(data => ({ value: data.fid, label: data.unit_name }))
            //     ])
            //GQR-65
            await Promise.all([
                setItem('terraintypeArray', terraintypeArray),
                setItem('landTypeArray', landTypeArray),
                setItem('soilTypeArray', soilTypeArray),
                setItem('landUnitArray', landUnitArray),
                setItem('prodctionSeasionArray', prodctionSeasionArray),
                setItem('livelihoodTypeArray', livelihoodTypeArray),
                setItem('productionProcessArray', productionProcessArray),
                setItem('produceProductionUnitArray', produceProductionUnitArray),
            ])
        } else {
            var [terraintypeArray, landTypeArray, soilTypeArray, landUnitArray, prodctionSeasionArray,
                livelihoodTypeArray, productionProcessArray, produceProductionUnitArray] = await Promise.all([
                    getItem('terraintypeArray'),
                    getItem('landTypeArray'),
                    getItem('soilTypeArray'),
                    getItem('landUnitArray'),
                    getItem('prodctionSeasionArray'),
                    getItem('livelihoodTypeArray'),
                    getItem('productionProcessArray'),
                    getItem('produceProductionUnitArray'),
                ]);
        }
        if (terraintypeArray) {
            setterrainTypeData(terraintypeArray);
        }
        if (landTypeArray) {
            setlandTypeData(landTypeArray);
        }
        if (soilTypeArray) {
            setsoilTypeData(soilTypeArray);
        }
        if (landUnitArray) {
            setlandUnitData(landUnitArray);
        }
        if (prodctionSeasionArray) {
            setprodctionSeasionData(prodctionSeasionArray);
        }
        if (livelihoodTypeArray) {
            setlivelihoodTypeData(livelihoodTypeArray);
        }
        if (productionProcessArray) {
            setproductionProcessData(productionProcessArray);
        }
        if (produceProductionUnitArray) {
            setproduceProductionUnitData(produceProductionUnitArray);
        }
    };
    useEffect(() => {
        if (isFocused) {
            onPageLoad();
            if (typeof route.params != "undefined") {
                setstoreProduceInfo({ ...storeProduceInfo, ...route.params.editItem });
                if (route.params.data === "remove") {
                    setRemove("remove");
                    emptyData();
                    setstoreProduceInfoInArray([]);
                } else {
                    setRemove("");
                }
                if (typeof route.params.pagename != 'undefined') {
                    setPath(route.params.pagename);
                } else {
                    setPath("");
                }
                if (route.params.editItem == undefined) {
                    setCurrentlatlong({ ...currentlatlong, lat: "", long: "" })
                }
            } else {
                setPath("");
            }
        }
    }, [isFocused, netConnection]);
    const handleBackPress = () => {
        navigation.navigate(path != "" ? path : 'FinancialInformation'); return true;
    }
    useFocusEffect(
        useCallback(() => {
            onBackPress(handleBackPress);
        })
    );
    const emptyData = () => {
        setstoreProduceInfo({
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
            produceProductionUnitValue: "",
            cycleStarts: "",
            cycleEnds: "",
            lat: "",
            long: ""
        });
    }
    const HandlelivehoodType = async (livelihoodType) => {
        setstoreProduceInfo({
            ...storeProduceInfo,
            livelihoodType: livelihoodType.label,
            livelihoodTypeValue: livelihoodType.value,
            produceName: "", produceNameValue: "",
            produceVariety: "", produceVarietyValue: ""
        })
        produceNameDataList(dbLanTokUsr.dbName, dbLanTokUsr.languageId, livelihoodType);
    }
    const produceNameDataList = async (dbName, language_id, livelihoodType) => {
        let produceNameArray = [];
        if (netConnection) {
            const produceNameAPI = await produceNameDataListAPI(dbName, language_id, livelihoodType.value);
            if (produceNameAPI?.status === 200) {
                produceNameArray = produceNameAPI?.data?.data?.crop_name?.map(data => ({ value: data.crop_name.fid, label: data.crop_name.name }))
            }
            await setItem('produceNameAPI', produceNameArray);
        } else {
            produceNameArray = await getItem('produceNameAPI');
        }
        setproduceNameData(produceNameArray);
    }
    const HandleproduceName = async (produceName) => {
        setstoreProduceInfo({
            ...storeProduceInfo,
            produceName: produceName.label,
            produceNameValue: produceName.value,
            produceVariety: "", produceVarietyValue: ""
        })
        produceVarientyDataList(dbLanTokUsr.dbName, dbLanTokUsr.languageId, storeProduceInfo.livelihoodType, produceName.value);
    }
    const produceVarientyDataList = async (dbName, languageID, livelihoodType, produceName) => {
        let produceVarietyArray = [];
        if (netConnection) {
            let produceVariety_res = await produceVarietyAPI(dbName, languageID, livelihoodType, produceName);
            if (produceVariety_res?.status == 200) {
                produceVarietyArray = produceVariety_res?.data?.data?.crop_variety?.map(data => ({ value: data.crop_variety.fid, label: data.crop_variety.name }));
            }
            await setItem('produceVarietyArray', produceVarietyArray)
        } else {
            produceVarietyArray = await getItem('produceVarietyArray')
        }
        setproduceVarietyData(produceVarietyArray);
    }
    const handlecycleStart = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const cycleStarts = x1[0] + '-' + x1[1] + '-' + x1[2];
        setstoreProduceInfo({ ...storeProduceInfo, cycleStarts: cycleStarts })
    }
    const handlecycleEnd = async (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const cycleEnds = x1[0] + '-' + x1[1] + '-' + x1[2];
        if (storeProduceInfo.cycleStarts != "") {
            setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: cycleEnds });
        }
    }
    const saveInObject = async () => {
        if (validationData()) {
            if (route.params.arrayIndex == undefined) {
                const newData = [...storeProduceInfoInArray, storeProduceInfo];
                setstoreProduceInfoInArray(newData);
                emptyFieldsValue();
            }
        }
    }
    useEffect(() => {
        if (storeProduceInfo.plotSiteName != "") {
            saveInObject();
        }
    }, [storeProduceInfo.cycleEnds]);
    const produceRemoveDetails = (index) => {
        const values = [...produceAddDetails];
        values.splice(index, 1);
        setstoreProduceInfoInArray(values);
    }
    const validationData = () => {
        if (!storeProduceInfo.plotSiteName) {
            Toast.show({ time: 3, text: `${t('pl_en_plot_name_first')}`, ...AlertMesg[0] });
            setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: "" });
            return false;
        }
        if (!storeProduceInfo.terrainType) {
            Toast.show({ time: 3, text: `${t('please_select_terrain_type_first')}`, ...AlertMesg[0] });
            setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: "" });
            return false;
        }
        if (!storeProduceInfo.landType) {
            Toast.show({ time: 3, text: `${t('please_select_land_type_first')}`, ...AlertMesg[0] });
            setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: "" });
            return false;
        }
        if (!storeProduceInfo.soilType) {
            Toast.show({ time: 3, text: `${t('please_select_soil_type_first')}`, ...AlertMesg[0] });
            setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: "" });
            return false;
        }
        if (!storeProduceInfo.plotSize) {
            Toast.show({ time: 3, text: `${t('please_enter_unit')}`, ...AlertMesg[0] });
            setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: "" });
            return false;
        }
        if (!storeProduceInfo.landUnit) {
            Toast.show({ time: 3, text: `${t('please_select_unit_first')}`, ...AlertMesg[0] });
            setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: "" });
            return false;
        }
        if (!storeProduceInfo.prodctionSeasion) {
            Toast.show({ time: 3, text: `${t('please_select_cultiveting_season_first')}`, ...AlertMesg[0] });
            setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: "" });
            return false;
        }
        if (!storeProduceInfo.livelihoodType) {
            Toast.show({ time: 3, text: `${t('please_select_crop_type_first')}`, ...AlertMesg[0] });
            setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: "" });
            return false;
        }
        if (!storeProduceInfo.produceName) {
            Toast.show({ time: 3, text: `${t('please_select_crop_name_first')}`, ...AlertMesg[0] });
            setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: "" });
            return false;
        }
        if (!storeProduceInfo.produceVariety) {
            Toast.show({ time: 3, text: `${t('please_select_crop_veriety_first')}`, ...AlertMesg[0] });
            setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: "" });
            return false;
        }
        if (!storeProduceInfo.productionProcess) {
            Toast.show({ time: 3, text: `${t('please_select_production_system_first')}`, ...AlertMesg[0] });
            setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: "" });
            return false;
        }
        if (!storeProduceInfo.produceProductionUnit) {
            Toast.show({ time: 3, text: `${t('please_give_yeild_size')}`, ...AlertMesg[0] });
            setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: "" });
            return false;
        }
        if (!storeProduceInfo.lat) {
            Toast.show({ time: 3, text: `${t('tap_to_get_latitude_and_longitude')}`, ...AlertMesg[0] });
            setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: "" });
            return false;
        }
        if (!storeProduceInfo.cycleStarts) {
            Toast.show({ time: 3, text: `${t('select_enddate_first')}`, ...AlertMesg[0] })
            return false;
        }
        if (!storeProduceInfo.cycleEnds) {
            Toast.show({ time: 3, text: `${t('select_enddate_first')}`, ...AlertMesg[0] })
            return false;
        }
        return true;
    }
    const handleLandUnit = async (item) => {
        let landUnitSize;
        if (item.sizevalue > 0) {
            landUnitSize = storeProduceInfo.plotSize * item.sizevalue
        } else {
            landUnitSize = storeProduceInfo.plotSize * 1
        }
        setstoreProduceInfo({ ...storeProduceInfo, sizevalue: item.sizevalue, landUnit: item.value, landUnitSize: landUnitSize, landUnitName: item.label, });
    }
    const getLocationData = async () => {
        setIsLoading(true);
        const fusedLocation = await getItem('fusedLocation')
        const { latitude, longitude } = fusedLocation;
        if (fusedLocation != null && longitude.toString().length == 10 && latitude.toString().length == 10) {
            setstoreProduceInfo({ ...storeProduceInfo, lat: fusedLocation.latitude, long: fusedLocation.longitude });
        } else {
            Toast.show({ text: 'Please try again to reach the accurancy', ...AlertMesg[0] });
        }
        setIsLoading(false);
    }
    const emptyFieldsValue = () => {
        setstoreProduceInfo({
            plotSiteName: "",
            daagNo: "",
            khatianNo: "",
            noOfPlants: "",
            terrainType: "",
            landType: "",
            soilType: "",
            plotSize: "",
            landUnit: "",
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
            long: ""
        });
    }
    const handleSave = async () => {
        Keyboard.dismiss();
        if (typeof route.params != "undefined" && route.params.arrayIndex != undefined) {
            const storeArr = await getItem('storeProduceInfo_data')
            const values = [...storeArr];
            values[route.params.arrayIndex] = storeProduceInfo;
            await setItem('storeProduceInfo_data', values);
            if (validationData()) {
                navigation.navigate('RegistationSignUpViwer', { data: remove });
            }
        } else if (storeProduceInfoInArray.length !== 0) {
            await setItem('storeProduceInfo_data', storeProduceInfoInArray);
            navigation.navigate('RegistationSignUpViwer', { data: remove });
        } else if (storeProduceInfoInArray.length === 0) {
            if (validationData()) {
                // await setItem('storeProduceInfo_data', storeProduceInfoInArray);
                // navigation.navigate('RegistationSignUpViwer', { data: remove });
            }
        }
    }
    const HandlerGoBack = () => {
        if (path != '') {
            navigation.navigate(path)
        } else {
            navigation.navigate('FinancialInformation')
        }
    }
    return (
        <>
            <CustomHeader path={path != "" ? path : 'FinancialInformation'} HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
            <FormsTitle title={t('reg_land_crop_information')} />
            <View style={styles.container}>
                {isLoading ?
                    <View style={styles.loadingScreen}><LoadingScreen /></View>
                    : ""}
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.formContainer}>
                        <View style={{ paddingHorizontal: 20 }}>
                            <InputTextForm label={t('add_plot')} color="red" onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, plotSiteName: item })} value={storeProduceInfo.plotSiteName} />
                            <InputTextForm label={t('daag_no')} onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, daagNo: item })} value={storeProduceInfo.daagNo} />
                            <InputTextForm label={t('khatian_no')} onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, khatianNo: item })} value={storeProduceInfo.khatianNo} />
                            <InputTextForm label={t('no_of_plants')} onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, noOfPlants: item })} value={storeProduceInfo.noOfPlants} />
                            <DropdownForm label={t('select_terrain_type')} color="red" data={terrainTypeData} onChange={item => setstoreProduceInfo({ ...storeProduceInfo, terrainType: item.label, terrainTypeValue: item.value })} val={storeProduceInfo.terrainType} />
                            <DropdownForm label={t('select_land_type')} color="red" data={landTypeData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, landType: item.label, landTypeValue: item.value }) }} val={storeProduceInfo.landType} />
                            <DropdownForm label={t('addland_soil_type')} color="red" data={soilTypeData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, soilType: item.label, soilTypeValue: item.value }) }} val={storeProduceInfo.soilType} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ width: '45%' }}>
                                    <InputTextForm label={t('plot_size')} color="red" onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, plotSize: item })} value={storeProduceInfo.plotSize} keyboardType="numeric" />
                                </View>
                                <View style={{ width: '45%' }}>
                                    <DropdownForm label={t('select_unit')} color="red" data={landUnitData} onChange={(item) => handleLandUnit(item)} val={storeProduceInfo.landUnit} />
                                </View>
                            </View>
                            <View style={{ marginBottom: 4 }}>
                                <TouchableOpacity onPress={getLocationData}  >
                                    {
                                        // addLatlong ?
                                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={styles.text}>{storeProduceInfo.lat}</Text>
                                            <Text style={styles.text}>{storeProduceInfo.long}</Text>
                                        </View>
                                        // : ""
                                    }
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={[styles.text, { color: '#ff0000' }]}>{t('tap_to_get_latitude_and_longitude')}</Text>
                                        <Image source={require('../../Common/images/map.png')} style={{ width: 50, height: 50 }} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <DropdownForm label={t('addcrop_select_cultivating_season')} color="red"
                                data={prodctionSeasionData}
                                onChange={item => {
                                    setstoreProduceInfo({ ...storeProduceInfo, prodctionSeasion: item.label, prodctionSeasionValue: item.value, livelihoodType: "", livelihoodTypeValue: "", produceName: "", produceNameValue: "", produceVariety: "", produceVarietyValue: "" })
                                }}
                                val={storeProduceInfo.prodctionSeasion} />
                            <DropdownForm label={t('select_crop_type')} color="red" data={livelihoodTypeData} onChange={item => HandlelivehoodType(item)} val={storeProduceInfo.livelihoodType} />
                            <DropdownForm label={t('select_crop_name')} color="red" data={produceNameData} onChange={item => HandleproduceName(item)} val={storeProduceInfo.produceName} />
                            <DropdownForm label={t('select_crop_variety')} color="red" data={produceVarietyData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, produceVariety: item.label, produceVarietyValue: item.value }) }} val={storeProduceInfo.produceVariety} />
                            <DropdownForm label={t('production_system')} color="red" data={productionProcessData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, productionProcess: item.label, productionProcessValue: item.value }) }} val={storeProduceInfo.productionProcess} />
                            <InputTextForm label={t('expected_yield')} color="red" onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, expectedProduction: item })} value={storeProduceInfo.expectedProduction} keyboardType="numeric" />
                            <DropdownForm label={t('select_unit')} color="red" data={produceProductionUnitData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, produceProductionUnit: item.label, produceProductionUnitValue: item.value }) }} val={storeProduceInfo.produceProductionUnit} />
                            <View>
                                <Text style={{ marginBottom: 5, marginLeft: 5, color: 'red' }}>{t('showing_date')}</Text>
                                <View style={styles.passwordMainContainer}>
                                    <TouchableOpacity style={styles.passwordContainer} onPress={() => setOpencycleStarts(true)}>
                                        <View style={{ width: '90%' }}>
                                            <Text style={styles.text}>{storeProduceInfo.cycleStarts}</Text>
                                        </View>
                                        <ImageForm source={require('../../Common/images/date.png')} resizeMode="cover" height={30} width={30} />
                                        <DatePicker modal mode="date" open={opencycleStarts} date={newdate} onConfirm={(item) => { handlecycleStart(item); setOpencycleStarts(false) }}
                                            onCancel={() => { setOpencycleStarts(false) }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View>
                                <Text style={{ marginBottom: 5, marginLeft: 5, color: 'red' }}>{t('harvesting_date_auto_calculated')}</Text>
                                <View style={styles.passwordMainContainer}>
                                    <TouchableOpacity style={styles.passwordContainer} onPress={() => setOpencycleEnds(true)}>
                                        <View style={{ width: '90%' }}>
                                            <Text style={styles.text}>{storeProduceInfo.cycleEnds}</Text>
                                        </View>
                                        <ImageForm source={require('../../Common/images/date.png')} resizeMode="cover" height={30} width={30} />
                                        <DatePicker modal mode="date" format="YYYY-MM-DD" open={opencycleEnds} date={newdate}
                                            minimumDate={storeProduceInfo.cycleStarts == "" ? "" : new Date(`${new Date(storeProduceInfo.cycleStarts).getFullYear()}-${new Date(storeProduceInfo.cycleStarts).getMonth() + 1}-${new Date(storeProduceInfo.cycleStarts).getDate() + 1}`)}
                                            onConfirm={(item) => { handlecycleEnd(item); setOpencycleEnds(false) }}
                                            onCancel={() => { setOpencycleEnds(false) }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {
                                route.params.arrayIndex == undefined ?
                                    <TouchableOpacity
                                        onPress={saveInObject}
                                        style={{ alignItems: 'center' }} activeOpacity={.7}>
                                        <Text style={styles.addBtn}>{t('click_to_add_more_plot')}</Text>
                                    </TouchableOpacity>
                                    : ""
                            }
                            <View style={{ marginBottom: 10 }}>{
                                route.params.arrayIndex == undefined ?
                                    storeProduceInfoInArray.map((data, index) => {
                                        return (
                                            <View style={styles.moreContainer} key={index}>
                                                <View style={styles.moreTextContainer}>
                                                    <Text style={styles.moreText}>{data.plotSiteName}</Text>
                                                    <Text style={styles.moreText} >{data.produceName}</Text>
                                                    <Text style={styles.moreText}>{data.produceVariety}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => produceRemoveDetails(index)}>
                                                    <Image source={require('../../Common/images/x-mark.png')} style={styles.xMarkImage} />
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    }) : null}
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <ButtonForm label={route.params.arrayIndex == undefined ? `${t('next')}` : `${t('save')}`} onPress={() => handleSave('SignUpViwer')} />
            </View>
            <Root></Root>
        </>
    )
}

export default PlotSiteProduceInformation

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        flex: 1,
        paddingTop: 10
    },
    formContainer: {
        backgroundColor: '#ffffff',
        marginBottom: 60
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headersTitle: {
        fontSize: 19,
        fontWeight: 'bold',
        textAlign: 'right',
        marginRight: '2.5%',
        color: '#000'
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
        backgroundColor: 'blue',
    },
    passwordMainContainer: {
        flex: 1,
        alignItems: 'center',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#f3ecec',
        borderWidth: 1.5,
        borderRadius: 8,
        width: '100%',
        paddingEnd: 8,
        backgroundColor: 'white',
        height: 50,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    inputTextStyle: {
        flex: 1,
        height: 50,
        marginHorizontal: 10,
        borderColor: 'gray',
    },
    moreContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: '10%',
        marginVertical: '3%'
    },
    xMarkImage: {
        width: 20,
        height: 20
    },
    moreTextContainer: {
        borderLeftWidth: 5,
        borderLeftColor: 'green',
        paddingLeft: 10
    },
    moreText: {
        color: "#000",
        fontSize: 10
    },
    addBtn: {
        backgroundColor: 'green',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        color: '#FFFFFF',
        elevation: 5,
        fontFamily: 'Poppins-SemiBold'
    },
    logo: {
        width: 250,
        height: 100,
        resizeMode: 'contain',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
        marginLeft: 60,
    },
    text: {
        color: '#000'
    },
    loadingScreen: {
        position: 'absolute',
        top: 100,
        zIndex: 999,
        left: '40%'
    },
    text: {
        fontFamily: 'Poppins-Regular',
        color: '#000'
    }
})