import { StyleSheet, Text, View, ScrollView, TextInput, FlatList, TouchableOpacity, SafeAreaView, Dimensions, BackHandler } from 'react-native'
import React, { useState, useContext } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import InputTextForm from '../../Common/InputTextForm';
import HeadDropDown from './HeadDropDown';
import DatePickerComp from '../../Common/DatePickerComp';
import ButtonFormBottom from '../../Common/ButtonFormBottom';
import { useFocusEffect } from '@react-navigation/native';
import { farmIncomeExpenceSaveAPI, farmaccountsIncomeListAPI, farmerByNameAPI, problemPlotAgainstFarmerAPI, problemProduceAgainstPlotAPI, problemProductionStageAPI, problemSaveAPI, problemSeverityAPI, problemTypeNameAPI } from '../../../config/apiHere';
import { getItem } from '../../../config/getDataFromStorage';
import DropdownForm from '../../Common/DropdownForm';
import MessageDialog from '../../Common/MessageDialog';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import axios from 'axios';
import config from '../../../config';
import { useTranslation } from 'react-i18next';
import { Root, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import HarvestedModel from '../../Common/HarvestedModel';
import { CrashlyticsRecordError } from '../../Crashlytics/CrashlyticsRecordError';
import { userCreateContext } from '../../Context/usersCreateContext';
const AddIcome = ({ navigation }) => {
    //GQR-67
    const { dbLanTokUsr, setdbLanTokUsr, loginUser_data, LoadingScreen, CustomHeader, t, AlertMesg, onBackPress, setItem, logoImage,
        topBanner, Root, Toast, SPSheet, DeviceInfo, handlePageList, effective_dates, farmerData, handleFilter, Filter } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    const { pageNo } = dbLanTokUsr;
    //GQR-67
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [searchFarmerName, setSearchFarmerName] = useState();
    const [searchFarmerPhone, setSearchFarmerPhone] = useState();
    const [searchResults, setSearchResults] = useState([]);
    // const [farmerData, setFarmerData] = useState([]);
    const [plotAll, setplotAll] = useState([]);
    const [showingMenu, setShowingMenu] = useState(false);
    const [nameVarityStartEnd, setNameVarityStartEnd] = useState({
        name: "",
        varity: ""
    });
    const [saveData, setSaveData] = useState({
        land_rel_id: "",
        crop_name_id: "",
        sowing_date: "",
        harvesting_date: "",
        createdBy: "",
        type: "cost_production",
        plot_size: "",
        grand_total: "",
        expense_total: "",
        cost_head: ""
    });
    const [farmerID, setfarmerID] = useState();
    const [InComeAll, setInComeAll] = useState([]);
    const [isIndex, setIndex] = useState(0);
    const [data, setData] = useState([{ type: "cost_production", cat_id: "", amount: "", date: "" }]);
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [openFromDate, setOpenFromDate] = useState(false);
    const [fromDate, setfromDate] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const addMoreExpense = () => {
        setIndex(isIndex + 1)
        setData([...data, { type: "cost_production", cat_id: "", amount: "0", date: "" }])
    }
    const handleChangeAddExpense = (index, text, name) => {
        // console.log(index, text, name)
        const values = [...data];
        values[index][name] = text;
        setData(values);
    }
    const handleChangeAddCatID = (index, text, name) => {
        // console.log(index, text, name)
        const values = [...data];
        values[index][name] = text.value;
        setData(values);
    }
    const handleChangeAddDate = (index, text, name) => {
        // console.log(index, text, name)
        const values = [...data];
        values[index][name] = text;
        setData(values);
    }
    const handleDatePicker = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setfromDate(effective_date)
        handleChangeAddDate(isIndex, effective_date, "date")
        // console.log(isIndex);
    }
    function handleClear() {
        setSearchFarmerName('')
        setSearchFarmerPhone('')
        setData([{ type: "cost_production", cat_id: "", amount: "", date: "" }])
        setplotAll([])
        setShowingMenu(false)
        setInComeAll([])
        setfromDate("")
    }

    const onPageLoad = async () => {
        handleClear();
        // if (loginUser_data) {
        //     const dbName = loginUser_data.dbname;
        //     const languageId = loginUser_data.lan_id;
        //     const token = loginUser_data.token;
        //     const supervisorId = loginUser_data.user_id;
        //     setdbLanTokUsr({
        //         ...dbLanTokUsr,
        //         dbName: dbName,
        //         languageId: languageId,
        //         token: token,
        //         supervisorId: supervisorId
        //     })

        //     const response = await farmerByNameAPI(dbName, languageId, token, supervisorId)
        //     if (response) {
        //         const dataArray = [];
        //         response.data.data.rows.forEach(element => {
        //             dataArray.push({
        //                 value: element.user_id,
        //                 label: element.userName,
        //                 phone: element.contactNumber,
        //             });
        //         });
        //         setFarmerData(dataArray)
        //     }
        // }
    };
    useFocusEffect(
        React.useCallback(() => {
            onPageLoad();
            const onBackPress = () => { navigation.navigate('FarmIncomeExpenseList'); return true; };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );
    const handleResultSelect = async (name, currentfarmerId, phone) => {
        setSearchResultsList(false)
        setSearchFarmerPhone(phone)
        setSearchFarmerName(name);
        setfarmerID(currentfarmerId)
        const response = await problemPlotAgainstFarmerAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, currentfarmerId)
        if (response?.status == 200) {
            const dataArray = response?.data?.data.map(data => ({ value: data.rel_id, label: data.plot_no }));
            setplotAll(dataArray)
        }
    }
    const handleSearch = (text) => {
        setSearchFarmerName(text);
        setSearchFarmerPhone('');
        if (farmerData.length > 0) {
            const result = farmerData.filter(item => item.label.toLowerCase().includes(text.toLowerCase()));
            if (result) {
                setSearchResultsList(true)
                setSearchResults(result);
            }
        }
    };
    const handlePlot = async (relId) => {
        const response = await problemProduceAgainstPlotAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, farmerID, relId.value)
        if (response?.status == 200) {
            setNameVarityStartEnd({
                ...nameVarityStartEnd,
                name: response.data.data.rows[0].crop_name.name,
                varity: response.data.data.rows[0].crop_variety.name,
            })
            const dateString = response.data.data.rows[0].harvesting_date;
            const harvesting_date = new Date(dateString);
            const currentDate = new Date();
            if (harvesting_date > currentDate) {
                setShowingMenu(true)
                setSaveData({
                    ...saveData,
                    land_rel_id: relId.value,
                    crop_name_id: response.data.data.rows[0].crop_name_id,
                    harvesting_date: response.data.data.rows[0].harvesting_date,
                    sowing_date: response.data.data.rows[0].sowing_date,
                    plot_size: response.data.data.rows[0].land_info.land_size + " " + response.data.data.rows[0].land_info.land_unit.name,
                    createdBy: dbLanTokUsr.supervisorId,
                })
                const response_farmIncome = await farmaccountsIncomeListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, farmerID)
                if (response_farmIncome?.status == 200) {
                    const dataArray = response_farmIncome?.data?.data?.rows.map(data => ({ value: data.fid, label: data.categoryName, }));
                    setInComeAll(dataArray);
                }
            } else {
                // MessageDialog({ title: 'Importent', message: 'Your previous crop has been harvested Please Add a Crop' })
                setModalVisible(true);
                setSearchFarmerName('')
                setSearchFarmerPhone('')
                setplotAll([])
                // navigation.navigate('Dashboard');
            }
        }
    }

    const handleSave = async () => {
        if (saveData.crop_name_id == "") {
            Toast.show({ time: 2, text: `${t('please_enter_farmer_name')}`, ...AlertMesg[0] });
        } else if (saveData.land_rel_id == "") {
            Toast.show({ time: 2, text: `${t('please_enter_plot_name_first')}`, ...AlertMesg[0] });
        } else {
            let grand_total = 0
            data.forEach(element => {
                grand_total += parseInt(element.amount)
            });
            const qs = require('qs');
            let save_data = qs.stringify({
                'land_rel_id': saveData.land_rel_id,
                'crop_name_id': saveData.crop_name_id,
                'harvesting_date': saveData.harvesting_date.substring(0, 10),
                'sowing_date': saveData.sowing_date,
                'createdBy': saveData.createdBy,
                'type': 'cost_production',
                'plot_size': saveData.plot_size,
                'grand_total': grand_total,
                'expense_total': '0',
                'cost_head': JSON.stringify(data)
            });
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'http://142.93.208.31:4003/cropRoute/addUserCropRels',
                headers: {
                    'authorization': dbLanTokUsr.token,
                    'information': `${dbLanTokUsr.dbName},${dbLanTokUsr.languageId},${farmerID}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: save_data
            };
            axios.request(config)
                .then((response) => {
                    console.log(JSON.stringify(response.data));
                    handleClear()
                    navigation.navigate('FarmIncomeExpenseList');
                })
                .catch((error) => {
                    CrashlyticsRecordError(error)
                    console.log(error);
                });
        }
    }
    const HandlerGoBack = () => navigation.navigate('FarmIncomeExpenseList');
    const handleHarvested = async (data) => {
        if (data == 'Yes') {
            navigation.navigate('FarmIncomeExpenseList');
        } else {
            navigation.navigate('Dashboard');
        }
    }
    return (
        <Root>
            <View style={{ flex: 1 }}>
                <DatePickerComp
                    openDate={openFromDate}
                    newDate={newFromDate}
                    setOpenDate={setOpenFromDate}
                    handleDatePicker={handleDatePicker}
                />
                <CustomHeader path='FarmIncomeExpenseList' HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
                <FormsTitle title={t('add_income')} />
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
                <View style={styles.formContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>

                        <InputTextForm label={t('farmer_name')} value={searchFarmerName}
                            onChangeText={(farmerName) => handleSearch(farmerName)} />

                        <InputTextForm label={t('farmer_number')} value={searchFarmerPhone} />

                        <DropdownForm label={t('plot')} data={plotAll} color="red" onChange={relId => handlePlot(relId)} />
                        {
                            showingMenu
                                ?
                                <View style={styles.plotContainer}>
                                    <View style={styles.plotItem}>
                                        <Text style={styles.plotItemText}>{t('produce_name')}</Text>
                                        <Text style={styles.plotItemText}>{t('prodece_vareity')}</Text>
                                    </View>
                                    <View style={styles.plotItem} >
                                        <Text style={styles.plotItemText}>{nameVarityStartEnd.name}</Text>
                                        <Text style={styles.plotItemText}>{nameVarityStartEnd.varity}</Text>
                                    </View>
                                </View>
                                :
                                ''

                        }

                        <View style={{ marginBottom: 350 }}>
                            {
                                data.map((data, index) => {
                                    return (
                                        <View style={styles.AddExpenseContainer} key={index}>
                                            <View>
                                                <TextInput
                                                    style={styles.AddExpenseInput}
                                                    onChangeText={(text) => handleChangeAddExpense(index, text, 'amount')}
                                                    name='amount'
                                                    placeholder={t('amount')}
                                                    value={data.amount}
                                                    keyboardType="numeric"
                                                    placeholderTextColor={'#000'}
                                                />
                                            </View>
                                            <View style={styles.AddExpenseItemContainer}>
                                                <View style={styles.AddExpenseItem}>
                                                    <HeadDropDown label={t('add_income_head')} data={InComeAll} name='cat_id' onChange={(text) => handleChangeAddCatID(index, text, 'cat_id')} />
                                                </View>
                                                <TouchableOpacity onPress={() => setOpenFromDate(true)}
                                                    style={styles.AddExpenseItemDate}>
                                                    <Text style={styles.title}>{data.date == "" ? `${t('date')}` : data.date}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )
                                })
                            }
                        </View>

                    </ScrollView>
                    <TouchableOpacity onPress={addMoreExpense} style={styles.addMore}>
                        <Text style={styles.addMoreText} >{t('add_more')}</Text>
                    </TouchableOpacity>
                </View>
                <ButtonFormBottom label={t('submit')} onPress={() => handleSave()} />
            </View>
        </Root>
    )
}

export default AddIcome

const styles = StyleSheet.create({
    formContainer: {
        width: '90%',
        marginHorizontal: '5%',
    },
    AddExpenseContainer: {
        borderWidth: 1,
        marginVertical: 10,
        padding: 10,
        borderRadius: 10,
        borderColor: '#000',
        backgroundColor: '#FFF'
    },
    AddExpenseInput: {
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        marginVertical: 10,
        fontSize: 25,
        color: 'green'
    },
    AddExpenseItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    AddExpenseItem: {
        width: '60%',
        marginTop: 12
    },
    AddExpenseItemDate: {
        width: '30%',
        borderWidth: 1,
        padding: 8,
        borderRadius: 10
    },
    addMore: {
        position: 'absolute',
        right: '-6%',
        // bottom: 0,
        top: "40%",
        zIndex: 999,
        backgroundColor: 'green',
        // width: 150,
        padding: 10,
        borderTopLeftRadius: 30,
        borderBottomLeftRadius: 30,
    },
    addMoreText: {
        color: '#FFF',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    plotContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#000',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#FFF'
    },
    plotItem: {
        width: '50%'
    },
    plotItemText: {
        color: '#000',
        marginVertical: 5
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
        height: Dimensions.get('window').height / 3.2
    },
    title: {
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    }
})