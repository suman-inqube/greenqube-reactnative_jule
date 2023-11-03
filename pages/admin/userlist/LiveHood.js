import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import ButtonForm from '../../Common/ButtonForm'
import InputTextForm from '../../Common/InputTextForm'
import DropdownForm from '../../Common/DropdownForm'
import RadioForm from '../../Common/RadioForm'
import ImageForm from '../../Common/ImageForm'
import ImagePlaceHolderCircle from '../../Common/ImagePlaceHolderCircle'
import { getItem } from '../../../config/getDataFromStorage'
import { fetchBlockAPI, fetchDistrictAPI, fetchStateAPI } from '../../../config/apiHere'
import { launchImageLibrary } from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker'
import config from '../../../config'
import axios from 'axios'
import ButtonFormBottom from '../../Common/ButtonFormBottom'
import CustomHeader from '../CustomHeader'
const LiveHood = ({ sendDataToParent, farmerID }) => {
    const [plotAll, setplotAll] = useState([]);
    const [farmerFoundPlotAll, setfarmerFoundPlotAll] = useState([]);
    const [farmerData, setfarmerData] = useState({});
    const [terrainTypeAll, setterrainTypeAll] = useState([]);
    const [soilTypeAll, setsetsoilTypeAll] = useState([]);
    const [landTypeAll, setlandTypeAll] = useState([]);
    const [open, setOpen] = useState(false)
    const [dbName, setdbName] = useState();
    const [languageID, setlanguageID] = useState();
    const [selectedImage, setSelectedImage] = useState(null);


    const getPlot = async (item) => {
        // console.warn(JSON.stringify(item,null,2));
        if (item) {
            const dataArray = [];
            item.forEach(element => {
                // console.warn(element.plot_no);
                dataArray.push({
                    value: element.plot_no,
                    label: element.plot_no,
                });
            });
            setplotAll(dataArray);
        }
    }

    const sendDataToParentOnClick = () => {
        sendDataToParent(null);
    };
    const handlePlot = (findData) => {
        const farmerFound = farmerFoundPlotAll.find(item => item.plot_no === findData.value);
        setfarmerData({
            daag_no: farmerFound.daag_no,
            khatian_no: farmerFound.khatian_no,
            plant_number: farmerFound.plant_number,
        })
        // console.warn(JSON.stringify(farmerFound,null,2));

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
                setlandTypeAll(landTypeArray);
            }
        } catch (error) {
            console.log("Error in landtypeAPI API", error);
        }

        // try {
        //     const prodctionSeasionAPI = config.prodctionSeasionAPI1 + language_id + config.prodctionSeasionAPI2;
        //     let livelihoodType_res = await axios.get(prodctionSeasionAPI, axiosConfig1);
        //     let livelihoodTypeArray = [];
        //     if (livelihoodType_res.data.data) {
        //         livelihoodType_res.data.data.crop_type.forEach(element => {
        //             livelihoodTypeArray.push({
        //                 value: element.fid,
        //                 label: element.name,
        //             });
        //         });
        //         setlivelihoodTypeData(livelihoodTypeArray);
        //     }
        // } catch (error) {
        //     console.log("Error in livelihoodType API", error);
        // }

        // try {
        //     const prodctionSeasionAPI = config.prodctionSeasionAPI1 + language_id + config.prodctionSeasionAPI2;
        //     let prodctionSeasion_res = await axios.get(prodctionSeasionAPI, axiosConfig1);
        //     // console.log(prodctionSeasionAPI);
        //     let prodctionSeasionArray = [];
        //     if (prodctionSeasion_res.data.data) {
        //         prodctionSeasion_res.data.data.crop_season.forEach(element => {
        //             prodctionSeasionArray.push({
        //                 value: element.fid,
        //                 label: element.name,
        //             });
        //         });
        //         setprodctionSeasionData(prodctionSeasionArray);
        //     }
        // } catch (error) {
        //     console.log("Error in prodctionSeasion type API", error);
        // }

        // try {
        //     let landUnit_res = await axios.get(config.landunitAPI, axiosConfig);
        //     let landUnitArray = [];
        //     if (landUnit_res.data.data.count > 0) {
        //         landUnit_res.data.data.rows.forEach(element => {
        //             landUnitArray.push({
        //                 value: element.id,
        //                 label: element.name,
        //             });
        //         });
        //         setlandUnitData(landUnitArray);
        //     }
        // } catch (error) {
        //     console.log("Error in landUnit type API", error);
        // }

        // try {
        //     let productionProcess_res = await axios.get(config.productionProcessAPI, axiosConfig);
        //     let productionProcessArray = [];
        //     if (productionProcess_res.data.data.count > 0) {
        //         productionProcess_res.data.data.rows.forEach(element => {
        //             productionProcessArray.push({
        //                 value: element.fid,
        //                 label: element.name,
        //             });
        //         });
        //         setproductionProcessData(productionProcessArray);
        //     }
        // } catch (error) {
        //     console.log("Error in productionProcess type API", error);
        // }

        // try {
        //     let produceProductionUnit_res = await axios.get(config.produceProductionUnitAPI, axiosConfig);
        //     let produceProductionUnitArray = [];
        //     if (produceProductionUnit_res.data.data) {
        //         produceProductionUnit_res.data.data.rows.forEach(element => {
        //             produceProductionUnitArray.push({
        //                 value: element.fid,
        //                 label: element.unit_name,
        //             });
        //         });
        //         setproduceProductionUnitData(produceProductionUnitArray);
        //     }
        // } catch (error) {
        //     console.log("Error in produceProductionUnit type API", error);
        // }

    }

    const onPageLoad = async () => {
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            allAPIHere(dbName, languageID)
        const userListData = await getItem('userListData');
        if (userListData) {
            const farmerArray = userListData.rows
            const farmerFound = farmerArray.find(user => user.user_id === 'bac1b395-3468-4c94-97f6-6f4e14c3efdd');
            if (farmerFound) {
                if (farmerFound.agri_land_user_rels) {
                    setfarmerFoundPlotAll(farmerFound.agri_land_user_rels);
                    getPlot(farmerFound.agri_land_user_rels);
                }
            }
        }
    };
}

    useEffect(() => {
        onPageLoad();
    }, []);
    return (
        <>
        <CustomHeader path='userList' />
            <ScrollView style={{ marginHorizontal: 10,marginVertical: 10, }}>
                <View style={{ marginBottom: 40, }}>

                    <>
                        <DropdownForm label="Plot/Site Size" data={plotAll} onChange={(item) => handlePlot(item)} />

                        <InputTextForm label="Plot/Site Record Detail (Daag No.)" value={farmerData.daag_no} />

                        <InputTextForm label="Plot/Site Record Detail (Khatian No.)" value={farmerData.khatian_no} />

                        <InputTextForm label="No. of Plants/Livestock" value={farmerData.plant_number} />

                        <DropdownForm label="Terrain Type" color="red" data={terrainTypeAll} val={farmerData.terrainType} onChange={item => { setfarmerData({ ...farmerData, landType: item }) }} />

                        <DropdownForm label="Land Type" color="red" data={landTypeAll} onChange={item => { setfarmerData({ ...farmerData, landType: item }) }} val={farmerData.landType} />

                        <DropdownForm label="Soil Type" color="red" data={soilTypeAll} onChange={item => { setfarmerData({ ...farmerData, soilType: item }) }} val={farmerData.soilType} />
                    </>
                </View>
            </ScrollView>
            <ButtonFormBottom label='Submit' onPress={() => handleUserListUpdate()} />
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
})
