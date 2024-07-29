import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, FlatList, SafeAreaView, Dimensions } from 'react-native'
import React, { useState, useCallback, useContext } from 'react'
import { farmerAgainstSupervisorAPI, inputSaveAPI, problemPlotAgainstFarmerAPI, problemProduceAgainstPlotAPI, unitByListAPI } from '../../../config/apiHere';
import MessageDialog from '../../Common/MessageDialog';
import { useFocusEffect } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import HarvestedModel from '../../Common/HarvestedModel';
import { userCreateContext } from '../../Context/usersCreateContext';
const FarmerWantToBuy = ({ navigation }) => {
    //GQR-67
    const { loginUser_data, Root, Toast, InputTextForm,
        DropdownForm, ButtonForm, AlertMesg, DatePickerComp,
        CustomHeader, t, onBackPress, getItem, logoImage, topBanner, FormsTitle, effective_dates } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    //GQR-67
    const unitFarm = [
        {
            value: 1,
            label: `${t('full')}`
        }, {
            value: 2,
            label: `${t('part')}`
        },
    ];
    const [showingMenu, setShowingMenu] = useState(false);
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
    const [newDate, setNewDate] = useState(new Date());
    const [approximateDate, setApproximateDate] = useState("");
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const handleResultSelect = async (name, currentfarmerId, phone) => {
        setSearchResultsList(false)
        const min = 1000000000000;
        const max = 9999999999999;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        setSaveData({ ...saveData, user_name: name, user_contact_number: phone, ref_code: randomNumber })
        setSearchResults([]);
        setfarmerID(currentfarmerId)
        const response = await problemPlotAgainstFarmerAPI(dbname, lan_id, token, currentfarmerId)
        if (response?.status == 200) {
            const dataArray = response?.data?.data.map(data => ({ value: data.rel_id, label: data.plot_no, user_id: data.user_id }))
            setplotAll(dataArray)
        }
    }
    const handlePlot = async (relId) => {
        const farmer_all = await farmerAgainstSupervisorAPI(dbname, lan_id, farmerID)
        const problemNameFound = farmer_all?.data?.data?.rows.find(user => user.user_id === relId.user_id);
        const min = 1000000000000;
        const max = 9999999999999;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        setSaveData({
            ...saveData,
            user_name: problemNameFound?.userName,
            user_contact_number: problemNameFound?.contactNumber,
            ref_code: randomNumber,
            type: "",
            farmer_id: relId.user_id,
            land_rel_id: relId.value,
            transaction_type: 1,
            fulfill_status: 0,
            state_name: problemNameFound?.agri_user_addresses[0]?.agri_state?.state_name,
            district_name: problemNameFound?.agri_user_addresses[0]?.agri_district?.district_name,
            subdiv_name: problemNameFound?.agri_user_addresses[0]?.agri_subdivision?.subdiv_name,
            state_id: problemNameFound?.agri_user_addresses[0]?.state,
            district_id: problemNameFound?.agri_user_addresses[0]?.district,
            subdiv_id: problemNameFound?.agri_user_addresses[0]?.subdivision,
        })
        const response = await problemProduceAgainstPlotAPI(dbname, lan_id, farmerID, relId.value)
        if (response?.status == 200) {
            setNameVarityStartEnd({
                ...nameVarityStartEnd,
                name: response?.data?.data?.rows[0].crop_name.name,
                varity: response?.data?.data?.rows[0].crop_variety.name,
                cycleStarts: response?.data?.data?.rows[0].sowing_date,//sowing_date
                cycleEnd: response?.data?.data?.rows[0].harvesting_date,
                production_process: response?.data?.data?.rows[0].farmer_production_system.name,
            });
            const dateString = response?.data?.data?.rows[0].harvesting_date;
            const harvesting_date = new Date(dateString);
            const currentDate = new Date();
            if (harvesting_date > currentDate) {
                setShowingMenu(true)
            } else {

                MessageDialog({ title: 'Importent', message: `${t('your_previous_crop_hervested')} ${t('add_a_new_crop')}` })
                setplotAll([])
                setModalVisible(true);
                navigation.navigate('FarmerDashboard');
            }
        }
    }
    const handleDatePicker = (item) => {
        const effective_date = effective_dates(item);
        setSaveData({ ...saveData, date: effective_date })
        setApproximateDate(effective_date)

    }
    function formatDateToMMDDYYYY(inputDate) {
        const date = new Date(inputDate);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    }

    const handleUnitFarm = (item) => {

    }
    const handleUnit = async (item) => {
        let entity_type_id = "";
        let entity_name_id = "";
        let io_prod_id = inputSingle.fid;
        let unit_id = item.label;
        let entity_variety_id = item.value;
        let pp_qty = item.pp_qty;
        const unitRes = await unitByListAPI(dbname, lan_id, 1, item.sub_type);
        if (unitRes?.status == 200) {
            const rows = unitRes?.data?.data?.rows[0];
            const defined_unit_value = inputSingle.agri_product_prices.filter(function (v, i) {
                return ((v.prod_price_id == item.value));
            })
            inputSingle.productCategories.forEach(element => {
                if (element.productCategory.iotype) {
                    entity_type_id = element.productCategory.iotype.entity_type_id;
                    entity_name_id = element.productCategory.iotype.entity_name_id;
                } else {
                    entity_type_id = element.productCategory.ioname.entity_type_id;
                    entity_name_id = element.productCategory.ioname.entity_name_id;
                }
                setSaveData({
                    ...saveData,
                    entity_type_id: entity_type_id,
                    entity_name_id: entity_name_id,
                    entity_variety_id: entity_variety_id,
                    io_prod_id: io_prod_id,
                    // unit_id: unit_id,
                    // defined_unit_value: defined_unit_value[0].agri_unit.defined_unit_value,
                    unit_id: item?.label,
                    unit_fid: item?.value,
                    unit_sname: item?.unit_sname,
                    unit_sub_type: item?.sub_type,
                    defined_unit_value: item?.defined_unit_value,
                    filter_unit_fid: rows?.fid,
                    pp_qty: pp_qty
                })
            });
        }
    }
    const validationData = () => {
        if (!saveData.land_rel_id) {
            Toast.show({ time: 2, text: `${t('pl_en_plot_name_first')}`, ...AlertMesg[0] });
            return false;
        }
        if (!saveData.quantity) {
            Toast.show({ time: 2, text: `${t('please_enter_quantity')}`, ...AlertMesg[0] });
            return false;
        }
        if (!saveData.unit_id) {
            Toast.show({ time: 2, text: `${t('please_select_unit_first')}`, ...AlertMesg[0] });
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
                formData.append('state_id', saveData.state_id);//
                formData.append('transaction_type', saveData.transaction_type);
                formData.append('type', saveData.type);
                formData.append('user_contact_number', saveData.user_contact_number);
                formData.append('user_name', saveData.user_name);
                formData.append('io_prod_id', saveData.io_prod_id);
                formData.append('unit_id', saveData.unit_id);
                formData.append('convert_qty', saveData.defined_unit_value != "" && saveData.defined_unit_value != null ? saveData.defined_unit_value * saveData.quantity : saveData.quantity * 1);
                //change this key saveData.unit_sname 
                // formData.append('unit_id', saveData.unit_sname);
                //new key add
                // formData.append('sub_ftype', saveData.unit_sub_type);
                // formData.append('unit_fid', saveData.unit_fid);
                // formData.append('default_unit_fid', saveData.filter_unit_fid);
                //
                // formData.append('pp_qty', saveData.pp_qty);
                const database_res = await inputSaveAPI(dbname, lan_id, token, saveData.farmer_id, formData);
                if (database_res?.status == 200) {
                    // MessageDialog({ title: ' ', message: t('Data_submitted_successfully') })
                    Toast.show({ time: 3, text: t('Data_submitted_successfully'), ...AlertMesg[0] })
                    setShowingMenu(false);
                    for (const key in saveData) {
                        if (saveData.hasOwnProperty(key)) {
                            delete saveData[key];
                        }
                    }
                    setFormStep(1);
                    setTimeout(() => {
                        navigation.navigate('FarmerInputList');
                    }, 1300);
                }

            }
        }
    }
    const onPageLoad = async () => {
        const inputSingleData = await getItem('input_single_data');
        const min = 1000000000000;
        const max = 9999999999999;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        setSaveData({ ...saveData, user_name: loginUser_data.userName, user_contact_number: loginUser_data.contactNumber, ref_code: randomNumber, })
        setfarmerID(user_id)
        const response = await problemPlotAgainstFarmerAPI(dbname, lan_id, token, user_id)
        if (response?.status == 200) {
            const dataArray = response?.data?.data.map(data => ({ value: data.rel_id, label: data.plot_no, user_id: data.user_id }));
            setplotAll(dataArray)
        }
        if (inputSingleData) {
            setInputSingle(inputSingleData)
            let category = "";
            let sub_category = "";
            if (inputSingleData?.productCategories[0].productCategory.iotype != null) {
                const { entity_type, entity_name } = inputSingleData?.productCategories[0]?.productCategory.iotype;
                category = entity_type.name;
                sub_category = entity_name.name;
            } else {
                const { entity_type, entity_name } = inputSingleData?.productCategories[0]?.productCategory.ioname;
                category = entity_type.name;
                sub_category = entity_name.name;
            }
            setSaveData({ ...saveData, sub_category: sub_category, category: category })
            const dataArray = [];
            inputSingleData?.agri_product_prices.forEach(element => {
                dataArray.push({
                    value: element?.prod_price_id,
                    label: element?.agri_unit.unit_name,
                    // label: `${element.quantity} ${element.agri_unit.unit_name}`,
                    pp_qty: element.quantity,
                    fid: element?.agri_unit?.fid,
                    unit_sname: element?.agri_unit?.unit_sname,
                    sub_type: element?.agri_unit?.sub_type,
                    defined_unit_value: element?.agri_unit?.defined_unit_value
                });
            });
            setUnitData(dataArray);
        }
    };
    function handleClear() {
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
            pp_qty: ""
        });
        setFormStep(1)
        setShowingMenu(false)
        setSearchResults([]);
        setplotAll([]);
        setNameVarityStartEnd({ name: "", varity: "", cycleStarts: "", cycleEnd: "", production_process: "" });
        setUnitData([]);
        setInputSingle({});
        setSaveData({});
    }
    const handleBackPress = () => { navigation.navigate('FarmerInputList'); return true; }
    useFocusEffect(
        useCallback(() => {
            handleClear()
            onPageLoad();
            onBackPress(handleBackPress);
        }, [])
    );
    const HandlerGoBack = () => navigation.navigate('FarmerInputList');
    const handleHarvested = async (data) => {
        if (data == 'Yes') {
            navigation.navigate('FarmerDashboard');
        } else {
            navigation.navigate('FarmerDashboard');
        }
    }
    return (
        <View style={{ flex: 1 }}>
            <DatePickerComp openDate={openDatePicker} newDate={newDate} setOpenDate={setOpenDatePicker} handleDatePicker={handleDatePicker} />
            <CustomHeader path={'FarmerInputList'} HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
            <FormsTitle title={t('want_to_buy_seed_de')} />
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

export default FarmerWantToBuy;
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
        color: "#000", marginVertical: 5
    },
    quanContainer: {
        flexDirection: 'row', justifyContent: 'space-between'
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