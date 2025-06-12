import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image, CheckBox } from 'react-native'
import React, { useEffect, useState } from 'react'
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
const ProduceInfo = () => {
    const route = useRoute();
    // const { pagename } = route.params;
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
    const [isChecked, setIsChecked] = useState(false);

    const toggleCheckbox = () => {
        setIsChecked(!isChecked);
        console.log(isChecked);
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
                setsoilTypeData(soilTypeArray);
            }
        } catch (error) {
            console.log("Error in soiltypeAPI API", error);
        }

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
                setterrainTypeData(terraintypeArray);
            }
        } catch (error) {
            console.log("Error in terraintypeAPI API", error);
        }
        try {
            let landType_res = await axios.get(config.landtypeAPI, axiosConfig);
            // console.log(landType_res.data.data);
            let landTypeArray = [];
            if (landType_res.data.data.count > 0) {
                landType_res.data.data.rows.forEach(element => {
                    landTypeArray.push({
                        value: element.id,
                        label: element.name,
                    });
                });
                setlandTypeData(landTypeArray);
            }
        } catch (error) {
            console.log("Error in landtypeAPI API", error);
        }

        try {
            const prodctionSeasionAPI = config.prodctionSeasionAPI1 + language_id + config.prodctionSeasionAPI2;
            let livelihoodType_res = await axios.get(prodctionSeasionAPI, axiosConfig1);
            let livelihoodTypeArray = [];
            if (livelihoodType_res.data.data) {
                livelihoodType_res.data.data.crop_type.forEach(element => {
                    livelihoodTypeArray.push({
                        value: element.fid,
                        label: element.name,
                    });
                });
                setlivelihoodTypeData(livelihoodTypeArray);
            }
        } catch (error) {
            console.log("Error in livelihoodType API", error);
        }

        try {
            const prodctionSeasionAPI = config.prodctionSeasionAPI1 + language_id + config.prodctionSeasionAPI2;
            let prodctionSeasion_res = await axios.get(prodctionSeasionAPI, axiosConfig1);
            // console.log(prodctionSeasionAPI);
            let prodctionSeasionArray = [];
            if (prodctionSeasion_res.data.data) {
                prodctionSeasion_res.data.data.crop_season.forEach(element => {
                    prodctionSeasionArray.push({
                        value: element.fid,
                        label: element.name,
                    });
                });
                setprodctionSeasionData(prodctionSeasionArray);
            }
        } catch (error) {
            console.log("Error in prodctionSeasion type API", error);
        }
        try {
            let landUnit_res = await axios.get(config.landunitAPI, axiosConfig);
            let landUnitArray = [];
            if (landUnit_res.data.data.count > 0) {
                landUnit_res.data.data.rows.forEach(element => {
                    landUnitArray.push({
                        value: element.id,
                        label: element.name,
                    });
                });
                setlandUnitData(landUnitArray);
            }
        } catch (error) {
            console.log("Error in landUnit type API", error);
        }

        try {
            let productionProcess_res = await axios.get(config.productionProcessAPI, axiosConfig);
            let productionProcessArray = [];
            if (productionProcess_res.data.data.count > 0) {
                productionProcess_res.data.data.rows.forEach(element => {
                    productionProcessArray.push({
                        value: element.fid,
                        label: element.name,
                    });
                });
                setproductionProcessData(productionProcessArray);
            }
        } catch (error) {
            console.log("Error in productionProcess type API", error);
        }
        try {
            let produceProductionUnit_res = await axios.get(config.produceProductionUnitAPI, axiosConfig);
            let produceProductionUnitArray = [];
            if (produceProductionUnit_res.data.data) {
                produceProductionUnit_res.data.data.rows.forEach(element => {
                    produceProductionUnitArray.push({
                        value: element.fid,
                        label: element.unit_name,
                    });
                });
                setproduceProductionUnitData(produceProductionUnitArray);
            }
        } catch (error) {
            console.log("Error in produceProductionUnit type API", error);
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
            const produceNameAPI = config.produceNameAPI1 + language_id + config.produceNameAPI2 + livelihoodType.value + config.produceNameAPI3;
            let produceName_res = await axios.get(produceNameAPI, axiosConfig1);
            let produceNameArray = [];
            if (produceName_res.data.data) {
                produceName_res.data.data.crop_name.forEach(element => {
                    produceNameArray.push({
                        value: element.crop_name.fid,
                        label: element.crop_name.name,
                    });
                });
                setproduceNameData(produceNameArray);

            }
        } catch (error) {
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
            let produceVariety_res = await axios.get(produceVarietyAPI, axiosConfig1);
            let produceVarietyArray = [];
            if (produceVariety_res.data.data) {
                produceVariety_res.data.data.crop_variety.forEach(element => {
                    produceVarietyArray.push({
                        value: element.crop_variety.fid,
                        label: element.crop_variety.name,
                    });
                });
                setproduceVarietyData(produceVarietyArray);
            }
        } catch (error) {
            console.log("Error in produceVariety API", error);
        }
    }
    const handlecycleStart = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        // console.log(x1[2] + '/' + x1[1] + '/' + x1[0]);
        const cycleStarts = x1[0] + '-' + x1[1] + '-' + x1[2];
        setstoreProduceInfo({ ...storeProduceInfo, cycleStarts: cycleStarts })
    }
    const handlecycleEnd = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        // console.log(x1[2] + '/' + x1[1] + '/' + x1[0]);
        const cycleEnds = x1[0] + '-' + x1[1] + '-' + x1[2];
        setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: cycleEnds })
    }
    const getLocation = (item) => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setstoreProduceInfo({ ...storeProduceInfo, lat: latitude, long: longitude })
            },
            (error) => {
                console.error(error);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    }

    const validationData = () => {
        if (isNotEmpty(storeProduceInfo.plotSiteName) &&
            (storeProduceInfo.terrainType.value) &&
            (storeProduceInfo.landType.value) &&
            (storeProduceInfo.soilType.value) &&
            (storeProduceInfo.landUnit.value) &&
            (storeProduceInfo.prodctionSeasion.value) &&
            (storeProduceInfo.livelihoodType.value) &&
            (storeProduceInfo.produceName.value) &&
            (storeProduceInfo.produceVariety.value) &&
            (storeProduceInfo.productionProcess.value) &&
            (storeProduceInfo.produceProductionUnit.value) &&
            (storeProduceInfo.lat) &&
            (storeProduceInfo.long) &&
            (storeProduceInfo.cycleStarts) &&
            (storeProduceInfo.cycleEnds)) {
            return true;
        }
        else {
            MessageDialog({ title: 'Require', message: 'Please fill in all required fields with valid data.' })
            return false;
        }
    }
    const handleSave = async () => {
        const res = validationData();
        console.log(res);
        if (res === true) {
            await setItem('storeProduceInfo_data', storeProduceInfo);
            // navigation.navigate(pagename, { pagename: '' });
        }


    }

    const onPageLoad = async () => {

        // await removeItem('storeProduceInfo_data');
        const storeSignup_data = await getItem('storeSignup_data');
        const storePersnolInfo_data = await getItem('storePersnolInfo_data');
        setdbName(storeSignup_data.company.dbname)
        setlanID(storePersnolInfo_data.language.value)
        allAPIHere(storeSignup_data.company.dbname, storePersnolInfo_data.language.value);
        const storeProduceInfo_data = await getItem('storeProduceInfo_data');
        if (storeProduceInfo_data) {
            setstoreProduceInfo(storeProduceInfo_data);
            if (storeProduceInfo_data.livelihoodType) {
                produceNameDataList(storeProduceInfo_data.livelihoodType, storePersnolInfo_data.language.value, storeSignup_data.company.dbname);
            }
            if (storeProduceInfo_data.produceName) {
                produceVarientyDataList(storeProduceInfo_data.produceName, storePersnolInfo_data.language.value, storeSignup_data.company.dbname);
            }
        }
        // console.log(storeProduceInfo_data);

    };
    useEffect(() => {
        onPageLoad();
    }, []);
    return (
        <>
            <ScrollView style={{ backgroundColor: '#D5FFD0' }}>
                <View style={{ backgroundColor: '#D5FFD0' }}>
                    <View style={{ paddingHorizontal: 20 }}>
                        <Logo iheight={100} iwidth={100} />
                        <InputTextForm label="Plot/Site Name" color="red" onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, plotSiteName: item })} value={storeProduceInfo.plotSiteName} />

                        <InputTextForm label="Plot/Site Record Detail (Daag No.)" onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, daagNo: item })} value={storeProduceInfo.daagNo} />

                        <InputTextForm label="Plot/Site Record Detail (Khatian No.)" onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, khatianNo: item })} value={storeProduceInfo.khatianNo} />

                        <InputTextForm label="No. of Plants/Livestock" onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, noOfPlants: item })} value={storeProduceInfo.noOfPlants} />

                        <DropdownForm label="Terrain Type" color="red" data={terrainTypeData} onChange={item => setstoreProduceInfo({ ...storeProduceInfo, terrainType: item })} val={storeProduceInfo.terrainType} />

                        <DropdownForm label="Land Type" color="red" data={landTypeData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, landType: item }) }} val={storeProduceInfo.landType} />

                        <DropdownForm label="Soil Type" color="red" data={soilTypeData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, soilType: item }) }} val={storeProduceInfo.soilType} />

                        <InputTextForm label="Plot/Site Size" onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, plotSize: item })} value={storeProduceInfo.plotSize} />

                        <DropdownForm label="Unit" color="red" data={landUnitData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, landUnit: item }) }} val={storeProduceInfo.landUnit} />

                        <View style={{ marginBottom: 4 }}>
                            <TouchableOpacity onPress={getLocation}>
                                {
                                    storeProduceInfo.lat ?
                                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text>{storeProduceInfo.lat}</Text>
                                            <Text>{storeProduceInfo.long}</Text>
                                        </View>
                                        : ""
                                }

                                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ color: 'red' }}>Tap to geo Tag the plot/site</Text>
                                    <Image source={require('./Common/images/map.png')} style={{ width: 50, height: 50 }} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <DropdownForm label="Production Season" color="red" data={prodctionSeasionData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, prodctionSeasion: item }) }} val={storeProduceInfo.prodctionSeasion} />

                        <DropdownForm label="Livelihood Type" color="red" data={livelihoodTypeData} onChange={item => HandlelivehoodType(item)} val={storeProduceInfo.livelihoodType} />

                        <DropdownForm label="Produce Name" color="red" data={produceNameData} onChange={item => HandleproduceName(item)} val={storeProduceInfo.produceName} />

                        <DropdownForm label="Produce Variety" color="red" data={produceVarietyData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, produceVariety: item }) }} val={storeProduceInfo.produceVariety} />

                        <DropdownForm label="Production Process" color="red" data={productionProcessData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, productionProcess: item }) }} val={storeProduceInfo.productionProcess} />

                        <InputTextForm label="Expected Production" color="red" onChangeText={item => setstoreProduceInfo({ ...storeProduceInfo, expectedProduction: item })} value={storeProduceInfo.expectedProduction} />

                        <DropdownForm label="Unit" color="red" data={produceProductionUnitData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, produceProductionUnit: item }) }} val={storeProduceInfo.produceProductionUnit} />

                        <View>
                            <Text style={{ marginBottom: 5, marginLeft: 5, color: 'red' }}>Cycle Starts</Text>
                            <View style={styles.passwordMainContainer}>
                                <View style={styles.passwordContainer}>
                                    <TextInput style={styles.inputTextStyle} value={storeProduceInfo.cycleStarts} />
                                    <TouchableOpacity onPress={() => setOpencycleStarts(true)}>
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
                                </View>
                            </View>
                        </View>

                        <View>
                            <Text style={{ marginBottom: 5, marginLeft: 5, color: 'red' }}>Cycle Ends</Text>
                            <View style={styles.passwordMainContainer}>
                                <View style={styles.passwordContainer}>
                                    <TextInput style={styles.inputTextStyle} value={storeProduceInfo.cycleEnds} />
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
                        <View style={{ alignItems: 'center' }}>
                            <Text>plot name : {storeProduceInfo.plotSiteName}</Text>
                            <Text>Produce Name :{storeProduceInfo.produceName.label}</Text>
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={toggleCheckbox}
                            >
                                <View style={[styles.checkbox, isChecked ? styles.checked : null]} />
                                <Text>Check this box</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View style={{ marginTop: 10, backgroundColor: '#D5FFD0' }}>
                <ButtonForm label='Next' onPress={() => handleSave('SignUpViwer')} />
            </View>
        </>
    )
}

export default ProduceInfo

const styles = StyleSheet.create({
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
        height: 40,
        marginHorizontal: 10,
        borderColor: 'gray',
    },
})
