import { StyleSheet, Text, View, ScrollView, Keyboard, TouchableOpacity, Image, CheckBox, Button, BackHandler, PermissionsAndroid, Linking, Alert } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import ButtonForm from '../../Common/ButtonForm';
import { useNavigation, useRoute, useIsFocused, useFocusEffect } from '@react-navigation/native';
import InputTextForm from '../../Common/InputTextForm';
import DropdownForm from '../../Common/DropdownForm';
import ImageForm from '../../Common/ImageForm';
import DatePicker from 'react-native-date-picker';
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import { Root, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import Geolocation from '@react-native-community/geolocation';
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
import { getItem, setItem, removeItem } from '../../../config/getDataFromStorage';
import { useTranslation } from 'react-i18next';
import LoadingScreen from '../../Common/LoadingScreen';
import { useSelector } from 'react-redux';
import DeviceInfo from '../../DeviceInfo';
const PlotSiteProduceInformation = () => {
    // const fusedLocation = useSelector(state => state.locationData);
    const { netConnection } = DeviceInfo();
    const { t } = useTranslation();
    const route = useRoute();
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [addLatlong, setAddLatlong] = useState(false);
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
    const [produceVarietyData1, setproduceVarietyData1] = useState([]);
    const [produceVarietyData, setproduceVarietyData] = useState([]);
    const [productionProcessData, setproductionProcessData] = useState([]);
    const [produceProductionUnitData, setproduceProductionUnitData] = useState([]);
    const [dbLanTokUsr, setdbLanTokUsr] = useState({ dbName: '', languageID: '', token: '', userID: '' });
    const [produceAddDetails, setProduceAddDetails] = useState([]);
    const [currentlatlong, setCurrentlatlong] = useState({
        lat: "",
        long: ""
    });
    const [remove, setRemove] = useState("");
    const [path, setPath] = useState("");
    const onPageLoad = async () => {
        const [loginUser_data
        ] = await Promise.all([
            getItem('loginUser_data')
        ]);
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: loginUser_data.dbname,
                languageID: loginUser_data.lan_id,
                token: loginUser_data.token,
                userID: loginUser_data.user_id,
            });
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
                    TterrainTypeAPI(dbName, languageID),
                    landTypeAPI(dbName, languageID),
                    soilTypeAPI(dbName, languageID),
                    landUnitAPI(dbName, languageID),
                    ProducceSeasionAPI(dbName, languageID),
                    livelihoodTypeAPI(dbName, languageID),
                    ProductionProcessDataAPI(dbName, languageID),
                    ProduceProductionUnitDataAPI(dbName, languageID),
                ]);
                if (tterrainType_res.status === 200) {
                    tterrainType_res.data.data.rows.forEach(element => {
                        terraintypeArray.push({
                            value: element.id,
                            label: element.name,
                        });
                    });
                }
                if (landType_res.status === 200) {
                    landType_res.data.data.rows.forEach(element => {
                        landTypeArray.push({
                            value: element.id,
                            label: element.name,
                        });
                    });

                }
                if (soilType_res.status === 200) {
                    soilType_res.data.data.rows.forEach(element => {
                        soilTypeArray.push({
                            value: element.id,
                            label: element.name,
                        });
                    });

                }
                if (landUnit_res.status === 200) {
                    landUnit_res.data.data.rows.forEach(element => {
                        landUnitArray.push({
                            value: element.id,
                            label: element.name,
                            sizevalue: element.unit_value,
                        });
                    });
                }
                if (producceSeasion_res.status === 200) {
                    producceSeasion_res.data.data.crop_season.forEach(element => {
                        prodctionSeasionArray.push({
                            value: element.fid,
                            label: element.name,
                        });
                    });
                }
                if (livelihoodType_res.status === 200) {
                    livelihoodType_res.data.data.crop_type.forEach(element => {
                        livelihoodTypeArray.push({
                            value: element.fid,
                            label: element.name,
                        });
                    });
                }
                if (productionProcessData_res.status === 200) {
                    productionProcessData_res.data.data.rows.forEach(element => {
                        productionProcessArray.push({
                            value: element.fid,
                            label: element.name,
                        });
                    });
                }
                if (produceProductionUnitData_res.status === 200) {
                    produceProductionUnitData_res.data.data.rows.forEach(element => {
                        produceProductionUnitArray.push({
                            value: element.fid,
                            label: element.unit_name,
                        });
                    });
                }
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
        }
    };
    useEffect(() => {
        if (isFocused) {
            setAddLatlong(false);
            onPageLoad();
            if (typeof route.params != "undefined") {
                setstoreProduceInfo({ ...storeProduceInfo, ...route.params.editItem });
                // setCurrentlatlong({ ...currentlatlong, ...route.params.editItem })
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
            } else {
                setPath("");
            }
        }
    }, [isFocused, netConnection]);
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate(path != "" ? path : 'FinancialInformation'); return true;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress); // detect back button press
            return () =>
                BackHandler.removeEventListener('hardwareBackPress');
        })
    );
    useEffect(() => {
        if (isFocused) {
            if (route.params.editItem == undefined) {
                setCurrentlatlong({ ...currentlatlong, lat: "", long: "" })
            }
        }
    }, [isFocused]);
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
        setstoreProduceInfo({ ...storeProduceInfo, livelihoodType: livelihoodType.label, livelihoodTypeValue: livelihoodType.value })
        produceNameDataList(dbLanTokUsr.dbName, dbLanTokUsr.languageID, livelihoodType);
    }
    const produceNameDataList = async (dbName, language_id, livelihoodType) => {
        let produceNameArray = [];
        if (netConnection) {
            const produceNameAPI = await produceNameDataListAPI(dbName, language_id, livelihoodType.value);
            if (produceNameAPI.status === 200) {
                produceNameAPI.data.data.crop_name.forEach(element => {
                    produceNameArray.push({
                        value: element.crop_name.fid,
                        label: element.crop_name.name,
                    });
                });
            }
            await setItem('produceNameAPI', produceNameArray);
        } else {
            produceNameArray = await getItem('produceNameAPI');
        }
        setproduceNameData(produceNameArray);
    }
    const HandleproduceName = async (produceName) => {
        setstoreProduceInfo({ ...storeProduceInfo, produceName: produceName.label, produceNameValue: produceName.value })
        produceVarientyDataList(dbLanTokUsr.dbName, dbLanTokUsr.languageID, storeProduceInfo.livelihoodType, produceName.value);
    }
    const produceVarientyDataList = async (dbName, languageID, livelihoodType, produceName) => {
        let produceVarietyArray = [];
        if (netConnection) {
            let produceVariety_res = await produceVarietyAPI(dbName, languageID, livelihoodType, produceName);
            if (produceVariety_res.status) {
                // await setItem("produceVariety", produceVariety_res.data.data)
                produceVariety_res.data.data.crop_variety.forEach(element => {
                    produceVarietyArray.push({
                        value: element.crop_variety.fid,
                        label: element.crop_variety.name,
                    });
                });
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
                setAddLatlong(false);
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
            Toast.show({
                time: 3, text: `${t('pl_en_plot_name_first')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!storeProduceInfo.terrainType) {
            Toast.show({
                time: 3, text: `${t('please_select_terrain_type_first')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!storeProduceInfo.landType) {
            Toast.show({
                time: 3, text: `${t('please_select_land_type_first')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!storeProduceInfo.soilType) {
            Toast.show({
                time: 3, text: `${t('please_select_soil_type_first')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!storeProduceInfo.plotSize) {
            Toast.show({
                time: 3, text: `${t('please_enter_unit')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!storeProduceInfo.landUnit) {
            Toast.show({
                time: 3, text: `${t('please_select_unit_first')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!storeProduceInfo.prodctionSeasion) {
            Toast.show({
                time: 3, text: `${t('please_select_cultiveting_season_first')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!storeProduceInfo.livelihoodType) {
            Toast.show({
                time: 3, text: `${t('please_select_crop_type_first')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!storeProduceInfo.produceName) {
            Toast.show({
                time: 3, text: `${t('please_select_crop_name_first')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!storeProduceInfo.produceVariety) {
            Toast.show({
                time: 3, text: `${t('please_select_crop_veriety_first')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!storeProduceInfo.productionProcess) {
            Toast.show({
                time: 3, text: `${t('please_select_production_system_first')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!storeProduceInfo.produceProductionUnit) {
            Toast.show({
                time: 3, text: `${t('please_give_yeild_size')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!storeProduceInfo.lat) {
            Toast.show({
                time: 3, text: `${t('tap_to_get_latitude_and_longitude')}`, ...AlertMesg[0]
            })
            return false;
        }


        // if (!storeProduceInfo.lat) {
        //     Toast.show({
        //         time: 3, text: 'Please Submit Location First', ...AlertMesg[0]
        //     })
        //     return false;
        // }

        if (!storeProduceInfo.cycleStarts) {
            Toast.show({
                time: 3, text: `${t('select_enddate_first')}`, ...AlertMesg[0]
            })
            return false;
        }

        // if (!storeProduceInfo.cycleEnds) {
        //     Toast.show({
        //         time: 3, text: 'Please Select Crop Cycle End Date First', ...AlertMesg[0]
        //     })
        //     return false;
        // }

        return true;
    }
    const handleLandUnit = async (item) => {
        let landUnitSize;
        if (item.sizevalue > 0) {
            landUnitSize = storeProduceInfo.plotSize * item.sizevalue
        } else {
            landUnitSize = storeProduceInfo.plotSize * 1
        }
        setstoreProduceInfo({
            ...storeProduceInfo,
            landUnit: item.value,
            landUnitSize: landUnitSize,
            landUnitName: item.label,
        });
    }
    const getLocationData = async () => {
        setAddLatlong(true);
        setIsLoading(true);
        const fusedLocation = await getItem('fusedLocation')
        const { latitude, longitude } = fusedLocation;
        // const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        // if (granted) {
        //     // if (currentlatlong.lat == "") {
        //     //     getLocation();
        //     // }
        //     // Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
        // } else {
        //     Alert.alert(
        //         ``,
        //         `Your GPS seems to be disabled, do you want to enable it?`,
        //         [
        //             { text: `${t('cancle')}`, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        //             { text: `${t('ok')}`, onPress: () => Linking.openSettings('android.settings.SETTINGS') },
        //         ],
        //         { cancelable: false });
        // }
        // if (currentlatlong.lat == "") {
        //     Alert.alert(
        //         ``,
        //         `Your GPS seems to be disabled, do you want to enable it?`,
        //         [
        //             { text: `${t('cancle')}`, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        //             {
        //                 text: `${t('ok')}`, onPress: () => Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS')
        //                 // Linking.openSettings('android.settings.SETTINGS')
        //             },
        //         ],
        //         { cancelable: false });
        // }
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
            const values = [...storeProduceInfoInArray];
            values[route.params.arrayIndex] = storeProduceInfo;
            await setItem('storeProduceInfo_data', values);
            if (validationData()) {
                navigation.navigate('RegistationSignUpViwer', { data: remove });
            }
        } else if (storeProduceInfoInArray.length !== 0) {
            await setItem('storeProduceInfo_data', storeProduceInfoInArray);
            navigation.navigate('RegistationSignUpViwer', { data: remove });
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
            <CustomHeader path={path != "" ? path : 'FinancialInformation'} HandlerGoBack={HandlerGoBack} />
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
                                    {/* <DropdownForm label="Unit" color="red" data={landUnitData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, landUnit: item }) }} val={storeProduceInfo.landUnit} /> */}
                                    <DropdownForm label={t('select_unit')} color="red" data={landUnitData} onChange={(item) => handleLandUnit(item)} val={storeProduceInfo.landUnit} />
                                </View>
                            </View>

                            <View style={{ marginBottom: 4 }}>
                                <TouchableOpacity
                                    onPress={getLocationData}
                                >
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

                            <DropdownForm label={t('addcrop_select_cultivating_season')} color="red" data={prodctionSeasionData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, prodctionSeasion: item.label, prodctionSeasionValue: item.value }) }} val={storeProduceInfo.prodctionSeasion} />

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
                                        <ImageForm
                                            source={require('../../Common/images/date.png')}
                                            resizeMode="cover"
                                            height={30}
                                            width={30}
                                        />
                                        <DatePicker
                                            modal
                                            mode="date"
                                            open={opencycleStarts}
                                            date={newdate}

                                            onConfirm={(item) => {
                                                handlecycleStart(item)
                                                setOpencycleStarts(false)
                                            }}
                                            onCancel={() => {
                                                setOpencycleStarts(false)
                                            }}
                                        />
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
                                        <ImageForm
                                            source={require('../../Common/images/date.png')}
                                            resizeMode="cover"
                                            height={30}
                                            width={30}
                                        />
                                        <DatePicker
                                            modal
                                            mode="date"
                                            format="YYYY-MM-DD"
                                            open={opencycleEnds}
                                            date={newdate}
                                            minimumDate={storeProduceInfo.cycleStarts == "" ? "" : new Date(`${new Date(storeProduceInfo.cycleStarts).getFullYear()}-${new Date(storeProduceInfo.cycleStarts).getMonth() + 1}-${new Date(storeProduceInfo.cycleStarts).getDate() + 1}`)}
                                            onConfirm={(item) => {
                                                handlecycleEnd(item)
                                                setOpencycleEnds(false)
                                            }}
                                            onCancel={() => {
                                                setOpencycleEnds(false)
                                            }}
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
                            <View style={{ marginBottom: 10 }}>
                                {
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
                                        }) : null
                                }
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