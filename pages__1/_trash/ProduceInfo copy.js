import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Logo from './Common/Logo'
import ButtonForm from './Common/ButtonForm'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import InputTextForm from './Common/InputTextForm'
import DropdownForm from './Common/DropdownForm';
import config from '../config';
import axios from 'axios';
import ImageForm from './Common/ImageForm';
import DatePicker from 'react-native-date-picker';
import Geolocation from '@react-native-community/geolocation';
const ProduceInfo = () => {
    const navigation = useNavigation();
    const currentDB = 'greenqube_farm_sme_demo_1';
    const currentLang = '1';
    const [produceInfoStore, setproduceInfoStore] = useState({
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
    const allAPIHere = async () => {
        const axiosConfig = {
            headers: {
                'information': `${currentDB},${currentLang}`,
                'Accept': 'application/json'
            },
        };
        const axiosConfig1 = {
            headers: {
                'information': `${currentDB}`,
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
            const prodctionSeasionAPI = config.prodctionSeasionAPI1 + currentLang + config.prodctionSeasionAPI2;
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
            const prodctionSeasionAPI = config.prodctionSeasionAPI1 + currentLang + config.prodctionSeasionAPI2;
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
            if (produceProductionUnit_res.data.data.count > 0) {
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

    const HandlelivehoodType = async (item) => {
        // console.log(item);
        setproduceInfoStore({ ...produceInfoStore, livelihoodType: item })
        const axiosConfig1 = {
            headers: {
                'information': `${currentDB}`,
                'Accept': 'application/json'
            },
        };
        try {
            const produceNameAPI = config.produceNameAPI1 + currentLang + config.produceNameAPI2 + item + config.produceNameAPI3;
            // console.log(item);
            let produceName_res = await axios.get(produceNameAPI, axiosConfig1);
            // console.log(produceName_res.data.data.crop_name[2].crop_name.name);
            let produceNameArray = [];
            if (produceName_res.data.data) {
                produceName_res.data.data.crop_name.forEach(element => {
                    // console.log(element.name);
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
    const HandleproduceName = async (item) => {
        // console.log(item);
        setproduceInfoStore({ ...produceInfoStore, produceName: item })
        const axiosConfig1 = {
            headers: {
                'information': `${currentDB}`,
                'Accept': 'application/json'
            },
        };
        try {
            const produceVarietyAPI = config.produceVarietyAPI1 + currentLang + config.produceVarietyAPI2 + produceInfoStore.livelihoodType + config.produceVarietyAPI3 + item;
            // console.log(produceVarietyAPI);
            let produceVariety_res = await axios.get(produceVarietyAPI, axiosConfig1);
            // console.log(produceVariety_res.data.data.crop_name[2].crop_name.name);
            let produceVarietyArray = [];
            if (produceVariety_res.data.data) {
                produceVariety_res.data.data.crop_variety.forEach(element => {
                    // console.log(element.name);
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
        setproduceInfoStore({ ...produceInfoStore, cycleStarts: cycleStarts })
    }
    const handlecycleEnd = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        // console.log(x1[2] + '/' + x1[1] + '/' + x1[0]);
        const cycleEnds = x1[0] + '-' + x1[1] + '-' + x1[2];
        setproduceInfoStore({ ...produceInfoStore, cycleEnds: cycleEnds })
    }
    const getLocation = (item) => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setproduceInfoStore({ ...produceInfoStore, lat: latitude, long: longitude })
                // setLocation({ latitude, longitude });
                console.log({ latitude, longitude });
            },
            (error) => {
                console.error(error);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    }

    const handleSave = async (pagename) => {
        await AsyncStorage.setItem('produceInfo_data', JSON.stringify(produceInfoStore));
        navigation.navigate('SignUpViwer');
        // console.log(produceInfoStore);
    }
    const checkLocalStorage = async () => {

        const produceInfo_data1 = await AsyncStorage.getItem("produceInfo_data");
        const financial_data = JSON.parse(produceInfo_data1);
        console.log(financial_data);
    }
    useEffect(() => {
        allAPIHere();
        checkLocalStorage();
    }, []);
    return (
        <>
            <ScrollView style={{ backgroundColor: '#ffff' }}>
                <View style={{ backgroundColor: '#fff' }}>
                    <View style={{ paddingHorizontal: 20 }}>
                        <Logo iheight={100} iwidth={100} />
                        <InputTextForm label="Plot/Site Name" color="red" onChangeText={item => setproduceInfoStore({ ...produceInfoStore, plotSiteName: item })} value={produceInfoStore.plotSiteName} />

                        <InputTextForm label="Plot/Site Record Detail (Daag No.)" onChangeText={item => setproduceInfoStore({ ...produceInfoStore, daagNo: item })} />

                        <InputTextForm label="Plot/Site Record Detail (Khatian No.)" onChangeText={item => setproduceInfoStore({ ...produceInfoStore, khatianNo: item })} />

                        <InputTextForm label="No. of Plants/Livestock" onChangeText={item => setproduceInfoStore({ ...produceInfoStore, noOfPlants: item })} />

                        <DropdownForm label="Terrain Type" color="red" data={terrainTypeData} onChange={item => setproduceInfoStore({ ...produceInfoStore, terrainType: item.value })} />

                        <DropdownForm label="Land Type" color="red" data={landTypeData} onChange={item => { setproduceInfoStore({ ...produceInfoStore, landType: item.value }) }} />

                        <DropdownForm label="Soil Type" color="red" data={soilTypeData} onChange={item => { setproduceInfoStore({ ...produceInfoStore, soilType: item.value }) }} />

                        <InputTextForm label="Plot/Site Size" onChangeText={item => setproduceInfoStore({ ...produceInfoStore, plotSize: item })} />

                        <DropdownForm label="Unit" color="red" data={landUnitData} onChange={item => { setproduceInfoStore({ ...produceInfoStore, landUnit: item.value }) }} />
                        <View style={{ marginBottom: 4 }}>
                            <TouchableOpacity onPress={getLocation}>
                                {
                                    produceInfoStore.lat ?
                                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text>{produceInfoStore.lat}</Text>
                                            <Text>{produceInfoStore.long}</Text>
                                        </View>
                                        : ""
                                }

                                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text>Tap to geo Tag the plot/site</Text>
                                    <Image source={require('./Common/images/map.png')} style={{ width: 50, height: 50 }} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <DropdownForm label="Production Season" color="red" data={prodctionSeasionData} onChange={item => { setproduceInfoStore({ ...produceInfoStore, prodctionSeasion: item.value }) }} />

                        <DropdownForm label="Livelihood Type" color="red" data={livelihoodTypeData} onChange={item => HandlelivehoodType(item.value)} />

                        <DropdownForm label="Produce Name" color="red" data={produceNameData} onChange={item => HandleproduceName(item.value)} />

                        <DropdownForm label="Produce Variety" color="red" data={produceVarietyData} onChange={item => { setproduceInfoStore({ ...produceInfoStore, produceVariety: item.value }) }} />

                        <DropdownForm label="Production Process" color="red" data={productionProcessData} onChange={item => { setproduceInfoStore({ ...produceInfoStore, productionProcess: item.value }) }} />

                        <InputTextForm label="Expected Production" onChangeText={item => setproduceInfoStore({ ...produceInfoStore, expectedProduction: item })} />

                        <DropdownForm label="Production Process" color="red" data={produceProductionUnitData} onChange={item => { setproduceInfoStore({ ...produceInfoStore, produceProductionUnit: item.value }) }} />

                        <View>
                            <Text style={{ marginBottom: 5, marginLeft: 5, }}>Cycle Starts</Text>
                            <View style={styles.passwordMainContainer}>
                                <View style={styles.passwordContainer}>
                                    <TextInput style={styles.inputTextStyle} value={produceInfoStore.cycleStarts} />
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
                            <Text style={{ marginBottom: 5, marginLeft: 5, }}>Cycle Ends</Text>
                            <View style={styles.passwordMainContainer}>
                                <View style={styles.passwordContainer}>
                                    <TextInput style={styles.inputTextStyle} value={produceInfoStore.cycleEnds} />
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
