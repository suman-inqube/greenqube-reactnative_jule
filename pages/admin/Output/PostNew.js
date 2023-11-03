import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, BackHandler, FlatList, SafeAreaView, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import DropdownForm from '../../Common/DropdownForm';
import DropdownForm1 from '../../Common/DropdownForm1';
import InputTextForm from '../../Common/InputTextForm';
import ButtonForm from '../../Common/ButtonForm';
import DatePickerComp from '../../Common/DatePickerComp';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { getItem } from '../../../config/getDataFromStorage';
import { farmerAgainstSupervisorAPI, farmerByNameAPI, livelihoodNameVarietyLandrelAPI, outputSaveAPI, problemPlotAgainstFarmerAPI, produceAgainstPlotAPI, unitByListAPI } from '../../../config/apiHere';
import axios from 'axios';
import MessageDialog from '../../Common/MessageDialog';
const unitFarm = [
    {
        value: 1,
        label: 'Full'
    }, {
        value: 2,
        label: 'Part'
    },
];
const PostNew = (props) => {
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [farmerData, setFarmerData] = useState();
    const [searchFarmerName, setSearchFarmerName] = useState();
    const [searchFarmerPhone, setSearchFarmerPhone] = useState();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: "",
        languageId: "",
        token: "",
        supervisorId: ""
    });
    const [saveData, setSaveData] = useState({});
    const [farmerID, setfarmerID] = useState();
    const [searchResults, setSearchResults] = useState([]);
    const [plotAll, setplotAll] = useState([]);
    const [liveliHoodType, setLiveliHoodType] = useState([]);
    const [produceName, setProduceName] = useState([]);
    const [produceVariety, setProduceVariety] = useState([]);
    const [nameVarityLivelihood, setNameVarityLivelihood] = useState({
        name: "",
        varity: "",
        livelihood: "",
    });
    const [unitData, setUnitData] = useState([]);
    const [nextpage, setNextPage] = useState(1);
    const [takePhotoModel, setTakePhotoModel] = useState(false);
    const [newDate, setNewDate] = useState(new Date());
    const [approximateDate, setApproximateDate] = useState("");
    const [openDatePicker, setOpenDatePicker] = useState(false)
    const [isOther, setIsOther] = useState(false);

    const handleSearch = (text) => {
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
        //   console.warn(JSON.stringify(dbLanTokUsr,null,2));
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
        const response = await problemPlotAgainstFarmerAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, currentfarmerId)

        if (response) {
            //    return console.warn(JSON.stringify(currentfarmerId,null,2));
            const dataArray = [{
                value: currentfarmerId,
                label: "other",
                user_id: currentfarmerId,
            }];
            response.data.data.forEach(element => {
                dataArray.push({
                    value: element.rel_id,
                    label: element.plot_no,
                    user_id: element.user_id,
                });
            });
            setplotAll(dataArray)

        }
    }

    const handlePlot = async (relId) => {

        if (relId.label == 'other') {
            setIsOther(true)
            const farmer_all = await farmerAgainstSupervisorAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, farmerID)
            const problemNameFound = farmer_all.data.data.rows.find(user => user.user_id === relId.user_id);
            // return console.log(JSON.stringify(relId, null, 2))

            if (problemNameFound) {

                setSaveData({
                    ...saveData,
                    type: "",
                    farmer_id: relId.user_id,
                    transaction_type: 2,
                    fulfill_status: 0,
                    state_name: problemNameFound.agri_user_addresses[0].agri_state.state_name,
                    district_name: problemNameFound.agri_user_addresses[0].agri_district.district_name,
                    subdiv_name: problemNameFound.agri_user_addresses[0].agri_subdivision.subdiv_name,
                    state_id: problemNameFound.agri_user_addresses[0].state,
                    district_id: problemNameFound.agri_user_addresses[0].district,
                    block_id: problemNameFound.agri_user_addresses[0].subdivision,

                })
            }
        }
        else {
            setIsOther(false)
            const livelyhoodNameVerity = await livelihoodNameVarietyLandrelAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, relId.user_id, relId.value)
            if (livelyhoodNameVerity) {
                const farmer_all = await farmerAgainstSupervisorAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, farmerID)
                const problemNameFound = farmer_all.data.data.rows.find(user => user.user_id === relId.user_id);

                if (problemNameFound) {
                    setProduceName([{
                        value: livelyhoodNameVerity.data.data.rows[0].crop_name.fid,
                        label: livelyhoodNameVerity.data.data.rows[0].crop_name.name
                    }])
                    setProduceVariety([{
                        value: livelyhoodNameVerity.data.data.rows[0].crop_variety.fid,
                        label: livelyhoodNameVerity.data.data.rows[0].crop_variety.name
                    }])

                    setLiveliHoodType([{
                        value: livelyhoodNameVerity.data.data.rows[0].crop_type.fid,
                        label: livelyhoodNameVerity.data.data.rows[0].crop_type.name
                    }])

                    setNameVarityLivelihood({
                        ...nameVarityLivelihood,
                        name: livelyhoodNameVerity.data.data.rows[0].crop_name.fid,
                        varity: livelyhoodNameVerity.data.data.rows[0].crop_variety.fid,
                        livelihood: livelyhoodNameVerity.data.data.rows[0].crop_type.fid,
                    })
                    setSaveData({
                        ...saveData,
                        type: "",
                        farmer_id: relId.user_id,
                        land_rel_id: relId.value,
                        transaction_type: 2,
                        fulfill_status: 0,
                        state_name: problemNameFound.agri_user_addresses[0].agri_state.state_name,
                        district_name: problemNameFound.agri_user_addresses[0].agri_district.district_name,
                        subdiv_name: problemNameFound.agri_user_addresses[0].agri_subdivision.subdiv_name,
                        state_id: problemNameFound.agri_user_addresses[0].state,
                        district_id: problemNameFound.agri_user_addresses[0].district,
                        block_id: problemNameFound.agri_user_addresses[0].subdivision,
                        entity_type_id: livelyhoodNameVerity.data.data.rows[0].crop_type.fid,
                        entity_name_id: livelyhoodNameVerity.data.data.rows[0].crop_name.fid,
                        entity_variety_id: livelyhoodNameVerity.data.data.rows[0].crop_variety.fid,
                    })

                }
            }
        }
    }

    const handleDatePicker = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        // console.log(x1[2] + '/' + x1[1] + '/' + x1[0]);
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setApproximateDate(effective_date)
    }
    const handleBackButtonClick = () => {
        if (nextpage == 2) {
            setNextPage(1)
            return true;
        }
    }
    const handleUnit = (item) => {
        // return console.log("unit_id:", item.label);
        setSaveData({
            ...saveData,
            unit_id: item.label
        })
    }

    const openImagePicker = (item) => {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
            maxHeight: 200,
            maxWidth: 200,
        };
        launchCamera(options, response => {
            if (response.didCancel) {
                console.log('User cancelled camera');
            } else if (response.error) {
                console.log('Camera Error: ', response.error);
            } else {
                let imageUri = response.uri || response.assets?.[0]?.uri;
                const newPhoto = { uri: imageUri, type: 'image/jpeg', name: imageUri }
            }
        });
    };


    const onPageLoad = async () => {

        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageId = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const supervisorId = loginUser_data.user_id;
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageId: languageId,
                token: token,
                supervisorId: supervisorId
            })


            const unitByList = await unitByListAPI(dbName, languageId);
            // console.log(JSON.stringify(inputSingleData, null, 2));
            if (unitByList) {
                setUnitData(unitByList.data.data.rows)
                const dataArray = [];
                unitByList.data.data.rows.forEach(element => {
                    dataArray.push({
                        value: element.fid,
                        label: element.unit_sname,
                    });

                    setUnitData(dataArray)
                });
            }

            const response = await farmerByNameAPI(dbName, languageId, token, supervisorId)
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
        }
    };

    const validationData = () => {
        if (
            (searchFarmerName) &&
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
        const res = validationData();
        if (res == true) {
            if (nextpage === 1) {
                setNextPage(2)
                // return console.log(saveData);
            }
            else {
                const formDataObject = new FormData();
                formDataObject.append('date', approximateDate);
                formDataObject.append('district_id', saveData.district_id);
                formDataObject.append('entity_name_id', saveData.entity_name_id);
                formDataObject.append('entity_type_id', saveData.entity_type_id);
                formDataObject.append('entity_variety_id', saveData.entity_variety_id);
                formDataObject.append('farmer_id', saveData.farmer_id);
                formDataObject.append('fulfill_status', saveData.fulfill_status);
                formDataObject.append('land_rel_id', saveData.land_rel_id);
                formDataObject.append('quantity', saveData.quantity);
                formDataObject.append('ref_code', saveData.ref_code);
                formDataObject.append('block_id', saveData.block_id);
                formDataObject.append('transaction_type', saveData.transaction_type);
                formDataObject.append('type', saveData.type);
                formDataObject.append('user_contact_number', saveData.user_contact_number);
                formDataObject.append('user_name', saveData.user_name);
                formDataObject.append('unit_id', saveData.unit_id);
                formDataObject.append('photo', "");
                formDataObject.append('others', saveData.others);
                // return console.log(formDataObject);   
                const database_res = await outputSaveAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, formDataObject);
                if (database_res) {
                    MessageDialog({ title: 'Successful', message: "Successfull Add Data" })
                    props.sendDataToParent("2")
                }

            }
        }
    }

    useEffect(() => {
        onPageLoad();
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonClick);
        };
    }, [nextpage]);


    return (
        <>
            <DatePickerComp
                openDate={openDatePicker}
                newDate={newDate}
                setOpenDate={setOpenDatePicker}
                handleDatePicker={handleDatePicker}
            />
            <View style={styles.container}>
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
                <ScrollView showsVerticalScrollIndicator={false}>
                    {nextpage == 1 ?
                        <>
                            <InputTextForm label="Farmer/Producer Name" color="black" value={searchFarmerName}
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

                            {
                                isOther ?
                                    <InputTextForm label='Other' onChangeText={(item) => setSaveData({ ...saveData, others: item })} />
                                    :
                                    <>
                                        <DropdownForm label={'LiveLiHood Type'} data={liveliHoodType} color="red" onChange={relId => handlePlot(relId)} val={nameVarityLivelihood.livelihood} />

                                        <DropdownForm label={'Produce Name'} data={produceName} color="red" onChange={relId => handlePlot(relId)} val={nameVarityLivelihood.name} />

                                        <DropdownForm label={'Produce Variety'} data={produceVariety} color="red" onChange={relId => handlePlot(relId)} val={nameVarityLivelihood.varity} />
                                    </>

                            }

                            <DropdownForm label='Is it for your entire unit/farm' data={unitFarm} onChange={((item) => console.log(item))} val={1} />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ width: '45%' }}>
                                    <InputTextForm label='Quantity' onChangeText={(item) => setSaveData({ ...saveData, quantity: item })} />
                                </View>

                                <View style={{ width: '45%' }}>
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
                                    <Text style={{ color: "#000" }}>{approximateDate}</Text>
                                    <Image source={require('../../Common/images/calendar.png')} style={{ width: 30, height: 30 }} />
                                </TouchableOpacity>
                            </View>

                            <View  >
                                <Text style={{ color: "#000" }}>Take a photo (optional)</Text>
                                <TouchableOpacity style={styles.takePhotoContainer} onPress={() => openImagePicker()}>

                                    <Image source={require('../../Common/images/camera.jpeg')} style={{ width: 30, height: 30 }} />
                                </TouchableOpacity>
                            </View>
                        </>}
                </ScrollView>
            </View>
            <ButtonForm label={nextpage == 1 ? 'Next' : 'Submit'} onPress={() => saveHandle()} />
        </>
    )
}

export default PostNew

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '90%',
        marginHorizontal: '5%',
        marginVertical: 10,
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
    takePhotoContainer: {
        borderWidth: 0.5,
        padding: 5,
        backgroundColor: '#FFF',
        borderRadius: 5,
        alignItems: 'flex-end',
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