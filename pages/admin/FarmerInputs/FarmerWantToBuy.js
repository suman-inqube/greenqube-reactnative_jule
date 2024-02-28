import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, BackHandler, FlatList, SafeAreaView, Dimensions } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import InputTextForm from '../../Common/InputTextForm';
import DropdownForm from '../../Common/DropdownForm';
import DropdownForm1 from '../../Common/DropdownForm1';
import ButtonForm from '../../Common/ButtonForm';
import DatePickerComp from '../../Common/DatePickerComp';
import { farmerAgainstSupervisorAPI, farmerByNameAPI, inputSaveAPI, problemPlotAgainstFarmerAPI, problemProduceAgainstPlotAPI, unitByListAPI } from '../../../config/apiHere';
import { getItem } from '../../../config/getDataFromStorage';
import MessageDialog from '../../Common/MessageDialog';
import { useFocusEffect } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert'
import { useTranslation } from 'react-i18next';
import HarvestedModel from '../../Common/HarvestedModel';

const unitFarm = [
    {
        value: 1,
        label: 'Full'
    }, {
        value: 2,
        label: 'Part'
    },
];

const FarmerWantToBuy = ({ navigation }) => {
    const { t } = useTranslation();
    const isFocused = useIsFocused();
    const [showingMenu, setShowingMenu] = useState(false);
    const [searchFarmerName, setSearchFarmerName] = useState();
    const [searchFarmerPhone, setSearchFarmerPhone] = useState();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({});
    const [farmerData, setFarmerData] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [plotAll, setplotAll] = useState([]);
    const [nameVarityStartEnd, setNameVarityStartEnd] = useState({
        name: "",
        varity: "",
        cycleStarts: "",
        cycleEnd: "",
        production_process: ""
    });
    const [unitData, setUnitData] = useState([]);
    const [inputSingle, setInputSingle] = useState({});
    const [saveData, setSaveData] = useState({});
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [formStep, setFormStep] = useState(1);
    const [farmerID, setfarmerID] = useState();
    const [takePhotoModel, setTakePhotoModel] = useState(false);
    const [newDate, setNewDate] = useState(new Date());
    const [approximateDate, setApproximateDate] = useState("");
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const handleSearch = (text) => {

        setShowingMenu(false)
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
        const min = 1000000000000;
        const max = 9999999999999;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        setSaveData({
            ...saveData,
            user_name: problemNameFound.userName,
            user_contact_number: problemNameFound.contactNumber,
            ref_code: randomNumber,
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
                // setSearchFarmerName('')
                // setSearchFarmerPhone('')
                setplotAll([])
                setModalVisible(true);
                navigation.navigate('FarmerDashboard');
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
        const defined_unit_value = inputSingle.agri_product_prices.filter(function (v, i) {
            return ((v.prod_price_id == item.value));
        })
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
                defined_unit_value: defined_unit_value[0].agri_unit.defined_unit_value
            })

        });

    }

    const validationData = () => {
        if (!saveData.land_rel_id) {
            Toast.show({
                time: 2, text: `${t('pl_en_plot_name_first')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!saveData.quantity) {
            Toast.show({
                time: 2, text: `${t('please_enter_quantity')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!saveData.unit_id) {

            Toast.show({
                time: 2, text: `${t('please_select_unit_first')}`, ...AlertMesg[0]
            })
            return false;
        }

        return true;

    }


    const saveHandle = async () => {
        const res = validationData()
        if (res == true) {
            if (formStep === 1) {
                setFormStep(2)
            } else {
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
                formData.append('convert_qty', saveData.defined_unit_value != "" && saveData.defined_unit_value != null ? saveData.defined_unit_value * saveData.quantity : saveData.quantity * 1);
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
                    navigation.navigate('FarmerInputList');
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
            const currentfarmerId = loginUser_data.user_id;
            const supervisorId = currentfarmerId;
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageID: languageID,
                token: token,
                userID: userID
            })
            const inputSingleData = await getItem('input_single_data');
            const min = 1000000000000;
            const max = 9999999999999;
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

            setSaveData({
                ...saveData,
                user_name: loginUser_data.userName,
                user_contact_number: loginUser_data.contactNumber,
                ref_code: randomNumber,
            })

            setfarmerID(currentfarmerId)
            const response = await problemPlotAgainstFarmerAPI(dbName, languageID, token, currentfarmerId)
            if (response) {

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

            if (inputSingleData) {
                setInputSingle(inputSingleData)

                const category = inputSingleData.productCategories && inputSingleData.productCategories[0].productCategory && inputSingleData.productCategories[0].productCategory.name

                const sub_category = inputSingleData.productCategories && inputSingleData.productCategories[1].productCategory && inputSingleData.productCategories[1].productCategory.name

                setSaveData({
                    ...saveData,
                    sub_category: sub_category,
                    category: category
                })

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
    };
    function handleClear() {
        setSearchFarmerName('')
        setSearchFarmerPhone('')
        setApproximateDate("")
        setSaveData({
            ...saveData,
            district_id: "",
            entity_name_id: "",
            entity_type_id: "",
            entity_variety_id: "",
            farmer_id: "",
            fulfill_status: "",
            land_rel_id: "",
            district_id: "",
            entity_name_id: "",
            unit_id: "",
            io_prod_id: "",
            user_name: "",
            user_contact_number: "",
            type: "",
            transaction_type: "",
            block_id: "",
            ref_code: "",
            land_rel_id: "",
            date: "",
        })

        setFormStep(1)
        setShowingMenu(false)
        setdbLanTokUsr({})

        setFarmerData([]);
        setSearchResults([]);
        setplotAll([]);
        setNameVarityStartEnd({
            name: "",
            varity: "",
            cycleStarts: "",
            cycleEnd: "",
            production_process: ""
        });
        setUnitData([]);
        setInputSingle({});
        setSaveData({});
    }
    useFocusEffect(
        useCallback(() => {
            handleClear()
            onPageLoad();
            const onBackPress = () => { navigation.navigate('FarmerInputList'); return true; };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );
    const HandlerGoBack = () => {
        navigation.navigate('FarmerInputList');
    }
    const handleHarvested = async (data) => {
        if (data == 'Yes') {
            navigation.navigate('FarmerDashboard');
        } else {
            navigation.navigate('FarmerDashboard');
        }
    }
    return (
        <View style={{ flex: 1 }}>
            <DatePickerComp
                openDate={openDatePicker}
                newDate={newDate}
                setOpenDate={setOpenDatePicker}
                handleDatePicker={handleDatePicker}
            />
            <CustomHeader path={'FarmerInputList'} HandlerGoBack={HandlerGoBack} />
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
            {modalVisible && <HarvestedModel setModalVisible={setModalVisible} modalVisible={modalVisible} handleHarvested={handleHarvested} />}
            <ScrollView>
                <View style={styles.formContainer}>
                    {
                        formStep === 1 ?
                            <>
                                <DropdownForm label={t('addland_select_plot')} data={plotAll} color="red" onChange={relId => handlePlot(relId)} />
                                {showingMenu ?
                                    <View style={styles.plotSiteView}>
                                        <View style={styles.plotSiteViewItem}>
                                            <Text style={styles.plotSiteViewItemTitle}>{t('crop_name')}</Text>
                                            <Text style={styles.plotSiteViewItemTitle}>{t('crop_veriety')}</Text>
                                            <Text style={styles.plotSiteViewItemTitle}>{t('showing_date')}</Text>
                                            <Text style={styles.plotSiteViewItemTitle}>{t('harvesting_date_auto_calculated')}</Text>
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




                                <InputTextForm label={t('category')} value={saveData.category} />

                                <InputTextForm label={t('sub_category')} value={saveData.sub_category} />
                                <InputTextForm label={t('product_name')} value={inputSingle.product_name} />

                                <DropdownForm label={t('requirement_status')} data={unitFarm} onChange={((item) => handleUnitFarm(item))} val={1} />

                                <View style={styles.quanContainer}>
                                    <View style={styles.quanContainerItem}>
                                        <InputTextForm label={t('select_quantity_input')} onChangeText={(item) => setSaveData({ ...saveData, quantity: item })} />
                                    </View>
                                    <View style={styles.quanContainerItem}>
                                        <DropdownForm label={t('select_unit_input')} data={unitData} onChange={(item) => handleUnit(item)} />
                                    </View>
                                </View>
                            </> : <>
                                <InputTextForm label={t('farmer_reg_state')} value={saveData.state_name} />
                                <InputTextForm label={t('select_district_county')} value={saveData.district_name} />
                                <InputTextForm label={t('select_block_sub_county_upzila')} value={saveData.subdiv_name} />

                                <View >
                                    <Text style={{ color: "#000" }}>{t('approximate_date')}</Text>
                                    <TouchableOpacity style={styles.appromimateContainer} onPress={() => setOpenDatePicker(!openDatePicker)}>
                                        <Text style={{ color: "#000" }}>{approximateDate}</Text><Image source={require('../../Common/images/calendar.png')} style={{ width: 30, height: 30 }} />
                                    </TouchableOpacity>
                                </View>

                            </>
                    }
                </View>
            </ScrollView>
            <ButtonForm label={formStep == 1 ? `${t('next')}` : `${t('submit')}`} onPress={() => saveHandle()} />
            <Root></Root>
        </View>
    )
}

export default FarmerWantToBuy

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