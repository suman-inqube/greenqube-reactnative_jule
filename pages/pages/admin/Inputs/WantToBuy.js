import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, BackHandler, FlatList, SafeAreaView, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import InputTextForm from '../../Common/InputTextForm';
import DropdownForm from '../../Common/DropdownForm';
import DropdownForm1 from '../../Common/DropdownForm1';
import ButtonFormBottom from '../../Common/ButtonFormBottom';
import DatePickerComp from '../../Common/DatePickerComp';
import { farmerAgainstSupervisorAPI, farmerByNameAPI, inputSaveAPI, problemPlotAgainstFarmerAPI, problemProduceAgainstPlotAPI, unitByListAPI } from '../../../config/apiHere';
import { getItem } from '../../../config/getDataFromStorage';
import MessageDialog from '../../Common/MessageDialog';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
const unitFarm = [
    {
        value: 1,
        label: 'Full'
    }, {
        value: 2,
        label: 'Part'
    },
];
const WantToBuy = ({ navigation }) => {
    const [showingMenu, setShowingMenu] = useState(false);
    const [searchFarmerName, setSearchFarmerName] = useState();
    const [searchFarmerPhone, setSearchFarmerPhone] = useState();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({});
    const [farmerData, setFarmerData] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [farmerID, setfarmerID] = useState();
    const [plotAll, setplotAll] = useState([]);
    const [nameVarityStartEnd, setNameVarityStartEnd] = useState({
        name: "",
        varity: "",
        cycleStarts: "",
        cycleEnd: "",
        production_process: ""
    });
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [inputSingle, setInputSingle] = useState({});
    const [unitData, setUnitData] = useState([]);
    const [saveData, setSaveData] = useState({});
    const [formStep, setFormStep] = useState(1);
    const [takePhotoModel, setTakePhotoModel] = useState(false);
    const [newDate, setNewDate] = useState(new Date());
    const [approximateDate, setApproximateDate] = useState("");
    const [openDatePicker, setOpenDatePicker] = useState(false);

    const handleSearch = (text) => {
        // console.log(text);
        setSearchFarmerName(text);
        setSearchFarmerPhone('');
        const result = farmerData.filter(item =>
            item.label.toLowerCase().includes(text.toLowerCase())
        );
        if (result) {
            setSearchResultsList(true)
            setSearchResults(result);
        }
    };

    const handleResultSelect = async (name, currentfarmerId, phone) => {
        setSearchResultsList(false)
        const min = 1000000000000;
        const max = 9999999999999;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

        setSaveData({
            ...saveData,
            user_name: name,
            user_contact_number: phone,
            ref_code: randomNumber,
        })
        setSearchFarmerPhone(phone)
        setSearchFarmerName(name);
        setSearchResults([]);
        setfarmerID(currentfarmerId)
        const response = await problemPlotAgainstFarmerAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, currentfarmerId)
        if (response) {
            //    return console.warn(JSON.stringify(response.data.data,null,2));
            const dataArray = [];
            response.data.data.forEach(element => {
                dataArray.push({
                    value: element.rel_id,
                    label: element.plot_no,
                    user_id: element.user_id
                });
            });
            setplotAll(dataArray)

        }
    }
    const handlePlot = async (relId) => {
        const farmer_all = await farmerAgainstSupervisorAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmerID)

        const problemNameFound = farmer_all.data.data.rows.find(user => user.user_id === relId.user_id);
        //  return console.log(JSON.stringify(problemNameFound.agri_user_addresses[0].agri_state.state_name, null, 2));
        setSaveData({
            ...saveData,
            type: "",
            farmer_id: relId.user_id,
            land_rel_id: relId.value,
            transaction_type: 1,
            fulfill_status: 0,
            state_name: problemNameFound.agri_user_addresses[0].agri_state.state_name,
            district_name: problemNameFound.agri_user_addresses[0].agri_district.district_name,
            subdiv_name: problemNameFound.agri_user_addresses[0].agri_subdivision.subdiv_name,
            state_id: problemNameFound.agri_user_addresses[0].state,
            district_id: problemNameFound.agri_user_addresses[0].district,
            subdiv_id: problemNameFound.agri_user_addresses[0].subdivision,
        })
        const response = await problemProduceAgainstPlotAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmerID, relId.value)
        if (response) {
            setNameVarityStartEnd({
                ...nameVarityStartEnd,
                name: response.data.data.rows[0].crop_name.name,
                varity: response.data.data.rows[0].crop_variety.name,
                cycleStarts: response.data.data.rows[0].crop_cycl_start_date,
                cycleEnd: response.data.data.rows[0].harvesting_date,
                production_process: response.data.data.rows[0].farmer_production_system.name,

            })
            const dateString = response.data.data.rows[0].harvesting_date;
            const harvesting_date = new Date(dateString);
            const currentDate = new Date();
            if (harvesting_date > currentDate) {
                setShowingMenu(true)
            } else {
                MessageDialog({ title: 'Importent', message: 'Your previous crop has been harvested Please Add a Crop' })
                setSearchFarmerName('')
                setSearchFarmerPhone('')
                setplotAll([])
                navigation.navigate('Dashboard');
            }
        }
    }
    const handleDatePicker = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setSaveData({ ...saveData, date: effective_date })
        setApproximateDate(effective_date)

    }
    const handleBackButtonClick = () => {
        if (formStep == 2) {
            setFormStep(1)
            return true;
        }
    }

    function formatDateToMMDDYYYY(inputDate) {
        const date = new Date(inputDate);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    }

    const handleUnitFarm = (item) => {
        // console.log(item);
        // onChange={(item) =>setSaveData({...saveData,io_prod_id: item.value,unit_id:item.label})}
    }
    const handleUnit = (item) => {
        //    return console.log(JSON.stringify(inputSingle,null,2));
        let entity_type_id = "";
        let entity_name_id = "";
        let io_prod_id = inputSingle.fid;
        let unit_id = item.label;
        let entity_variety_id = item.value;
        inputSingle.productCategories.forEach(element => {
            if (
                element.productCategory.iotype
            ) {
                entity_type_id = element.productCategory.iotype.entity_type_id;
                entity_name_id = element.productCategory.iotype.entity_name_id;

            }
            setSaveData({
                ...saveData,
                entity_type_id: entity_type_id,
                entity_name_id: entity_name_id,
                entity_variety_id: entity_variety_id,
                io_prod_id: io_prod_id,
                unit_id: unit_id,
            })

        });

    }

    const validationData = () => {
        if (
            (searchFarmerName) &&
            (saveData.land_rel_id) &&
            (saveData.quantity) &&
            (saveData.unit_id)
        ) {
            return true;
        }
        else {
            MessageDialog({ title: 'Require', message: 'Please fill in all required fields with valid data.' })
            return;
        }

    }

    const saveHandle = async () => {
        const res = validationData()

        if (res == true) {
            if (formStep === 1) {
                setFormStep(2)
            }
            else {



                const formData = new FormData();
                formData.append('date', saveData.date);
                formData.append('district_id', saveData.district_id);
                formData.append('entity_name_id', saveData.entity_name_id);
                formData.append('entity_type_id', saveData.entity_type_id);
                formData.append('entity_variety_id', saveData.entity_variety_id);
                formData.append('farmer_id', saveData.farmer_id);
                formData.append('fulfill_status', saveData.fulfill_status);
                formData.append('land_rel_id', saveData.land_rel_id);
                formData.append('quantity', saveData.quantity);
                formData.append('ref_code', saveData.ref_code);
                formData.append('block_id', saveData.subdiv_id);
                formData.append('transaction_type', saveData.transaction_type);
                formData.append('type', saveData.type);
                formData.append('user_contact_number', saveData.user_contact_number);
                formData.append('user_name', saveData.user_name);
                formData.append('io_prod_id', saveData.io_prod_id);
                formData.append('unit_id', saveData.unit_id);
                // formData.append('photo', ''); // To add an empty 'photo' field

                // return console.log(JSON.stringify(dbLanTokUsr,null,2))


                const database_res = await inputSaveAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, saveData.farmer_id, formData);
                if (database_res) {
                    MessageDialog({ title: 'Successful', message: "Successfull Add Data" })
                    setShowingMenu(false);
                    setSearchFarmerName("");
                    setSearchFarmerPhone("");
                    for (const key in saveData) {
                        if (saveData.hasOwnProperty(key)) {
                            delete saveData[key];
                        }
                    }
                    setFormStep(1)
                    navigation.navigate('InputList');
                }

            }
        }



    }
    const onPageLoad = async () => {
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const userID = loginUser_data.user_id;
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageID: languageID,
                token: token,
                userID: userID
            })
            const inputSingleData = await getItem('input_single_data');
            setInputSingle(inputSingleData)
            // console.log(JSON.stringify(inputSingleData, null, 2));
            if (inputSingleData) {
                if (inputSingleData) {
                    const dataArray = [];
                    inputSingleData.agri_product_prices.forEach(element => {
                        dataArray.push({
                            value: element.prod_price_id,
                            label: element.agri_unit.unit_name,
                        });
                    });
                    setUnitData(dataArray)
                }
            }
            const response = await farmerByNameAPI(dbName, languageID, token, userID)
            if (response) {
                const dataArray = [];
                response.data.data.rows.forEach(element => {
                    dataArray.push({
                        value: element.user_id,
                        label: element.userName,
                        phone: element.contactNumber,
                    });
                });
                setFarmerData(dataArray)
            }

            // const unitByList = await unitByListAPI(dbName, languageID);

            // console.log(JSON.stringify(inputSingleData, null, 2));
            // if (unitByList) {
            //     setUnitData(unitByList.data.data.rows)
            //     const dataArray = [];
            //     unitByList.data.data.rows.forEach(element => {
            //         dataArray.push({
            //             value: element.fid,
            //             label: element.unit_sname,
            //         });

            //         setUnitData(dataArray)
            //     });
            // }

        }
    };


    useEffect(() => {
        onPageLoad();
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonClick);
        };
    }, [formStep]);

    useFocusEffect(
        React.useCallback(() => {
            onPageLoad();
        }, [])
    );

    return (
        <View style={{ flex: 1 }}>
            <DatePickerComp
                openDate={openDatePicker}
                newDate={newDate}
                setOpenDate={setOpenDatePicker}
                handleDatePicker={handleDatePicker}
            />
            <CustomHeader path={'InputList'} />
            <FormsTitle title='Want to Buy/Lease' />
            <SafeAreaView>
                {
                    searchResultsList && searchResultsList ?
                        <View style={styles.flatContainer}>
                            <FlatList
                                style={searchResults.length > 8 ? styles.flatlistHeight : ""}
                                data={searchResults}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => handleResultSelect(item.label, item.value, item.phone)} style={styles.flatlistitem}>
                                        <Text style={styles.flatlisttitle}>{item.label}</Text>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item, index) => index}
                            />
                        </View> : ""

                }
            </SafeAreaView>
            <ScrollView>
                <View style={styles.formContainer}>
                    {
                        formStep === 1 ?
                            <>
                                <InputTextForm label='Farmer/Producer Name' value={searchFarmerName}
                                    onChangeText={(farmerName) => handleSearch(farmerName)} />

                                {/* <ScrollView horizontal={true} style={{ width: "100%" }}>
                                    <FlatList
                                        style={styles.flatlistcontainercontainer}
                                        data={searchResults}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity onPress={() => handleResultSelect(item.label, item.value, item.phone)} style={styles.flatlistitem}>
                                                <Text style={styles.flatlisttitle}>{item.label}</Text>
                                            </TouchableOpacity>
                                        )}
                                        keyExtractor={(item, index) => index}
                                    />
                                </ScrollView> */}

                                <InputTextForm label='Phone Number' value={searchFarmerPhone} />
                                <DropdownForm label="Plot/Site" data={plotAll} color="red" onChange={relId => handlePlot(relId)} />
                                {showingMenu ?
                                    <View style={styles.plotSiteView}>
                                        <View style={styles.plotSiteViewItem}>
                                            <Text style={styles.plotSiteViewItemTitle}>Produce Name</Text>
                                            <Text style={styles.plotSiteViewItemTitle}>Produce Variety</Text>
                                            <Text style={styles.plotSiteViewItemTitle}>Cycle Starts</Text>
                                            <Text style={styles.plotSiteViewItemTitle}>Cycle Ends</Text>
                                        </View>
                                        <View style={styles.plotSiteViewItem}>
                                            <Text style={styles.plotSiteViewItemTitle}>{nameVarityStartEnd.name}</Text>
                                            <Text style={styles.plotSiteViewItemTitle}>{nameVarityStartEnd.varity}</Text>
                                            <Text style={styles.plotSiteViewItemTitle}>{formatDateToMMDDYYYY(nameVarityStartEnd.cycleStarts)}</Text>
                                            <Text style={styles.plotSiteViewItemTitle}>{formatDateToMMDDYYYY(nameVarityStartEnd.cycleEnd)}</Text>
                                        </View>
                                    </View>
                                    :
                                    ''}


                                <InputTextForm label='Category' value={inputSingle.product_name} />
                                <InputTextForm label='Sub Category' value={inputSingle.product_name} />
                                <InputTextForm label='Product Name' value={inputSingle.product_name} />

                                <DropdownForm label='Is it for your entire unit/farm' data={unitFarm} onChange={((item) => handleUnitFarm(item))} val={1} />

                                <View style={styles.quanContainer}>
                                    <View style={styles.quanContainerItem}>
                                        <InputTextForm label='Quantity' onChangeText={(item) => setSaveData({ ...saveData, quantity: item })} />
                                    </View>
                                    <View style={styles.quanContainerItem}>
                                        <DropdownForm label='Unit' data={unitData} onChange={(item) => handleUnit(item)} />
                                    </View>
                                </View>
                            </> : <>
                                <InputTextForm label='State' value={saveData.state_name} />
                                <InputTextForm label='District' value={saveData.district_name} />
                                <InputTextForm label='Block/Subdivision' value={saveData.subdiv_name} />

                                <View >
                                    <Text style={{ color: "#000" }}>Approximate Date</Text>
                                    <TouchableOpacity style={styles.appromimateContainer} onPress={() => setOpenDatePicker(!openDatePicker)}>
                                        <Text style={{ color: "#000" }}>{approximateDate}</Text><Image source={require('../../Common/images/calendar.png')} style={{ width: 30, height: 30 }} />
                                    </TouchableOpacity>
                                </View>

                            </>
                    }
                </View>
            </ScrollView>
            <ButtonFormBottom label={formStep == 1 ? 'Next' : 'Submit'} onPress={() => saveHandle()} />
        </View>
    )
}

export default WantToBuy

const styles = StyleSheet.create({
    formContainer: {
        width: '90%',
        marginHorizontal: '5%',
        marginBottom: 50
    },
    plotSiteView: {
        borderWidth: 0.5,
        borderColor: '#000',
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 10,
        flexDirection: 'row',
        marginVertical: 10
    },
    plotSiteViewItem: {
        width: '50%',
    },
    plotSiteViewItemTitle: {
        color: "#000",
        marginVertical: 5
    },
    quanContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    quanContainerItem: {
        width: '45%',
    },
    appromimateContainer: {
        borderWidth: 0.5,
        padding: 5,
        backgroundColor: '#FFF',
        borderRadius: 5,
        // alignItems:'flex-end',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10

    },
    flatContainer: {
        backgroundColor: '#ffffff',
        position: 'absolute',
        zIndex: 999,
        bottom: '100%',
        left: 0,
        marginHorizontal: '5%',
        width: '90%',
        elevation: 10,
        borderRadius: 10,
        padding: 10
    },
    flatlisttitle: {
        padding: 10,
        color: '#000'
    },
    flatlistHeight: {
        height: Dimensions.get('window').height / 2.5
    }

})