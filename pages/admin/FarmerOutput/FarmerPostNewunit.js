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
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { useNavigation } from '@react-navigation/native';
import { AlertMesg } from '../../Common/ToastAlert'
import { useTranslation } from 'react-i18next';
const unitFarm = [
    {
        value: 1,
        label: 'Full'
    }, {
        value: 2,
        label: 'Part'
    },
];
const FarmerPostNew = (props) => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [farmerData, setFarmerData] = useState([]);
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
    const [regionaldatas, setregionaldatas] = useState({
        state: "",
        district: "",
        block: "",
    })
    const handleSearch = (text) => {
        setSearchFarmerName(text);
        setSearchFarmerPhone('');
        if (farmerData.length > 0) {
            const result = farmerData.filter(item =>
                item.label.toLowerCase().includes(text.toLowerCase())
            );
            if (result) {
                setSearchResultsList(true)
                setSearchResults(result);
            }
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
            const [livelyhoodNameVerity, farmer_all] = await Promise.all([
                livelihoodNameVarietyLandrelAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, relId.user_id, relId.value),
                farmerAgainstSupervisorAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, farmerID)
            ]);
            // const livelyhoodNameVerity = await livelihoodNameVarietyLandrelAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, relId.user_id, relId.value)
            if (livelyhoodNameVerity) {
                // const farmer_all = await farmerAgainstSupervisorAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, farmerID)
                const problemNameFound = farmer_all.data.data.rows.find(user => user.user_id === relId.user_id);
                // console.log(JSON.stringify(livelyhoodNameVerity, null, 2))
                if (problemNameFound) {
                    if (new Date(livelyhoodNameVerity.data.data.rows[0].harvesting_date) > new Date()) {
                        await Promise.all([
                            setProduceName([{
                                value: livelyhoodNameVerity.data.data.rows[0].crop_name.fid,
                                label: livelyhoodNameVerity.data.data.rows[0].crop_name.name
                            }]),
                            setProduceVariety([{
                                value: livelyhoodNameVerity.data.data.rows[0].crop_variety.fid,
                                label: livelyhoodNameVerity.data.data.rows[0].crop_variety.name
                            }]),
                            setLiveliHoodType([{
                                value: livelyhoodNameVerity.data.data.rows[0].crop_type.fid,
                                label: livelyhoodNameVerity.data.data.rows[0].crop_type.name
                            }]),
                            setNameVarityLivelihood({
                                ...nameVarityLivelihood,
                                name: livelyhoodNameVerity.data.data.rows[0].crop_name.fid,
                                varity: livelyhoodNameVerity.data.data.rows[0].crop_variety.fid,
                                livelihood: livelyhoodNameVerity.data.data.rows[0].crop_type.fid,
                            }),
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
                                others: "",
                            })
                        ])
                    } else {
                        MessageDialog({ title: 'Importent', message: `${t('your_previous_crop_hervested')} ${t('add_a_new_crop')}` })

                        navigation.navigate('FarmerDashboard');
                    }

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
            setApproximateDate("");
            setSaveData({
                ...saveData,
                land_rel_id: "",
                quantity: "",
                unit_id: "",
            })
            setNameVarityLivelihood({
                ...nameVarityLivelihood,
                name: '',
                varity: '',
                livelihood: '',
            })
            setNextPage(1)
            return true;
        }
    }
    const handleUnit = async (item) => {
        const unitRes = await unitByListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, 1, item.sub_type);
        if (unitRes?.status == 200) {
            const rows = unitRes?.data?.data?.rows[0];
            setSaveData({
                ...saveData,
                unit_id: item?.label,
                unit_fid: item?.value,
                unit_sname: item?.unit_sname,
                unit_sub_type: item?.sub_type,
                defined_unit_value: item?.defined_unit_value,
                filter_unit_fid: rows?.fid
            });
        }
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
        const [loginUser_data, state,
            district, block] = await Promise.all([
                getItem('loginUser_data'),
                getItem("state"),
                getItem("district"),
                getItem("block")
            ])
        if (loginUser_data) {
            setregionaldatas({
                ...regionaldatas,
                state: state,
                district: district,
                block: block,
            })
            const dbName = loginUser_data.dbname;
            const languageId = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const currentfarmerId = loginUser_data.user_id;
            const supervisorId = currentfarmerId;
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageId: languageId,
                token: token,
                supervisorId: supervisorId
            })

            setfarmerID(currentfarmerId)
            const response = await problemPlotAgainstFarmerAPI(dbName, languageId, token, currentfarmerId)

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


            const unitByList = await unitByListAPI(dbName, languageId);
            // console.log(JSON.stringify(inputSingleData, null, 2));
            if (unitByList) {
                setUnitData(unitByList.data.data.rows)
                const dataArray = [];
                unitByList.data.data.rows.forEach(element => {
                    dataArray.push({
                        value: element.fid,
                        label: element.unit_name,
                        unit_sname: element.unit_sname,
                        sub_type: element.sub_type,
                        defined_unit_value: element.defined_unit_value
                    });

                    setUnitData(dataArray)
                });
            }

            const min = 1000000000000;
            const max = 9999999999999;
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

            setSaveData({
                ...saveData,
                user_name: loginUser_data.userName,
                user_contact_number: loginUser_data.contactNumber,
                ref_code: randomNumber,
            })
        }
    };

    const validationData = () => {
        // if (!saveData.land_rel_id) {
        //     Toast.show({
        //         time: 2, text: `${t('please_select_plot')}`, ...AlertMesg[0]
        //     })
        //     return false;
        // }
        if (!saveData.quantity) {
            Toast.show({
                time: 2, text: `${t('select_quantity_input')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!saveData.unit_id) {
            Toast.show({
                time: 2, text: `${t('select_unit_input')}`, ...AlertMesg[0]
            })
            return false;
        } else if (approximateDate == "" && nextpage == 2) {
            Toast.show({ text: `${t('approximate_date')}`, ...AlertMesg[0] });
            return false;
        }
        return true;
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
                formDataObject.append('farmer_id', saveData.farmer_id);
                formDataObject.append('state_id', saveData.state_id);
                formDataObject.append('district_id', saveData.district_id);
                formDataObject.append('block_id', saveData.block_id);
                formDataObject.append('entity_name_id', saveData.entity_name_id);
                formDataObject.append('entity_type_id', saveData.entity_type_id);
                formDataObject.append('entity_variety_id', saveData.entity_variety_id);
                formDataObject.append('fulfill_status', saveData.fulfill_status);
                formDataObject.append('land_rel_id', saveData.land_rel_id);
                formDataObject.append('quantity', saveData.quantity);
                formDataObject.append('ref_code', saveData.ref_code);
                formDataObject.append('transaction_type', saveData.transaction_type);
                formDataObject.append('type', saveData.type);
                formDataObject.append('user_contact_number', saveData.user_contact_number);
                formDataObject.append('user_name', saveData.user_name);
                // formDataObject.append('unit_id', saveData.unit_id);
                formDataObject.append('photo', "");
                formDataObject.append('others', saveData.others);
                formDataObject.append('convert_qty', saveData.defined_unit_value != "" && saveData.defined_unit_value != null ? saveData.defined_unit_value * saveData.quantity : saveData.quantity * 1);
                //return console.log(formDataObject);  
                //change this key saveData.unit_sname 
                formDataObject.append('unit_id', saveData.unit_sname);
                //new key add
                formDataObject.append('sub_ftype', saveData.unit_sub_type);
                formDataObject.append('unit_fid', saveData.unit_fid);
                formDataObject.append('default_unit_fid', saveData.filter_unit_fid);
                // 
                const database_res = await outputSaveAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, formDataObject);

                // console.log(database_res);
                if (database_res) {
                    Toast.show({ text: t('Data_submitted_successfully'), ...AlertMesg[0] });
                    setTimeout(() => {
                        props.sendDataToParent(2)
                    }, 2000);
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

                <ScrollView showsVerticalScrollIndicator={false}>
                    {nextpage == 1 ?
                        <>

                            <DropdownForm label={t('addland_select_plot')} data={plotAll} color="red" onChange={relId => handlePlot(relId)} />

                            {
                                isOther ?
                                    <InputTextForm label={t('other')} value={saveData.others} onChangeText={(others) => setSaveData({ ...saveData, others: others })} />
                                    :
                                    <>
                                        <DropdownForm label={t('addcrop_croptype')} data={liveliHoodType} color="red" onChange={relId => handlePlot(relId)} val={nameVarityLivelihood.livelihood} />

                                        <DropdownForm label={t('crop_name')} data={produceName} color="red" onChange={relId => handlePlot(relId)} val={nameVarityLivelihood.name} />

                                        <DropdownForm label={t('crop_veriety')} data={produceVariety} color="red" onChange={relId => handlePlot(relId)} val={nameVarityLivelihood.varity} />
                                    </>

                            }

                            <DropdownForm label={t('requirement_status')} data={unitFarm} onChange={((item) => console.log(item))} val={1} />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ width: '45%' }}>
                                    <InputTextForm label={t('quantity')} onChangeText={(item) => setSaveData({ ...saveData, quantity: item })} />
                                </View>

                                <View style={{ width: '45%' }}>
                                    <DropdownForm label={t('select_unit_input')} data={unitData} onChange={(item) => handleUnit(item)} />
                                </View>
                            </View>
                        </> : <>
                            <InputTextForm label={regionaldatas.state == "" ? t('state_col') : t(`${regionaldatas.state}`)} value={saveData.state_name} />
                            <InputTextForm label={regionaldatas.district == "" ? t('select_district_county') : t(`${regionaldatas.district}`)} value={saveData.district_name} />
                            <InputTextForm label={regionaldatas.block == "" ? t('select_block_sub_county_upzila') : t(`${regionaldatas.block}`)} value={saveData.subdiv_name} />

                            <View >
                                <Text style={{ color: "#000" }}>{t('approximate_date')}</Text>
                                <TouchableOpacity style={styles.appromimateContainer} onPress={() => setOpenDatePicker(!openDatePicker)}>
                                    <Text style={{ color: "#000" }}>{approximateDate}</Text>
                                    <Image source={require('../../Common/images/calendar.png')} style={{ width: 30, height: 30 }} />
                                </TouchableOpacity>
                            </View>


                        </>}
                </ScrollView>
            </View>
            <ButtonForm label={nextpage == 1 ? `${t('next')}` : `${t('submit')}`} onPress={() => saveHandle()} />
            <Root></Root>
        </>
    )
}
export default FarmerPostNew
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '90%',
        marginHorizontal: '5%',
        marginVertical: 10,
        marginBottom: 50
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