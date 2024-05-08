import { BackHandler, StyleSheet, Text, View, ScrollView, TextInput, FlatList, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native'
import React, { useState } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import InputTextForm from '../../Common/InputTextForm';
import HeadDropDown from './FarmerHeadDropDown';
import DatePickerComp from '../../Common/DatePickerComp';
import ButtonForm from '../../Common/ButtonForm';
import { useFocusEffect } from '@react-navigation/native';
import { farmIncomeExpenceSaveAPI, farmaccountsIncomeListAPI, farmerByNameAPI, problemPlotAgainstFarmerAPI, problemProduceAgainstPlotAPI, problemProductionStageAPI, problemSaveAPI, problemSeverityAPI, problemTypeNameAPI } from '../../../config/apiHere';
import { getItem } from '../../../config/getDataFromStorage';
import DropdownForm from '../../Common/DropdownForm';
import MessageDialog from '../../Common/MessageDialog';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import axios from 'axios';
import config from '../../../config';
import { useTranslation } from 'react-i18next';
import { CrashlyticsRecordError } from '../../Crashlytics/CrashlyticsRecordError';
const FarmerAddIncome = ({ navigation }) => {
    const { t } = useTranslation();
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [searchFarmerName, setSearchFarmerName] = useState();
    const [searchFarmerPhone, setSearchFarmerPhone] = useState();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: "",
        languageId: "",
        token: "",
        supervisorId: "",
        userId: ""
    });
    const [searchResults, setSearchResults] = useState([]);
    const [farmerData, setFarmerData] = useState([]);
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
    const [currency, setCurrency] = useState("");
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
        const [loginUser_data, curr] = await Promise.all([
            getItem('loginUser_data'),
            getItem('currency')
        ]);
        setCurrency(curr)
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageId = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const supervisorId = loginUser_data.owner.user_id;
            const user_id = loginUser_data.user_id;
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageId: languageId,
                token: token,
                supervisorId: supervisorId,
                userId: user_id
            })
            setfarmerID(user_id)

            const response = await problemPlotAgainstFarmerAPI(dbName, languageId, token, user_id)

            if (response) {
                // console.warn(JSON.stringify(response.data.data,null,2));
                // return;
                const dataArray = [];
                response.data.data.forEach(element => {
                    dataArray.push({
                        value: element.rel_id,
                        label: element.plot_no
                    });
                });
                setplotAll(dataArray)

            }

        }
    };



    useFocusEffect(
        React.useCallback(() => {
            onPageLoad();
            const onBackPress = () => { navigation.navigate('FarmerFarmIncomeExpenseList'); return true; };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);

        }, [])
    );


    const handleResultSelect = async (name, currentfarmerId, phone) => {
        setSearchResultsList(false)
        // console.warn(name, currentfarmerId, phone);
        // console.warn(JSON.stringify(searchResults, null, 2));
        setSearchFarmerPhone(phone)
        // setSelectedName(name);
        setSearchFarmerName(name);
        // setSearchResults([]);
        setfarmerID(currentfarmerId)
        // console.warn(currentfarmerId);
        const response = await problemPlotAgainstFarmerAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, currentfarmerId)

        if (response) {
            // console.warn(JSON.stringify(response.data.data,null,2));
            // return;
            const dataArray = [];
            response.data.data.forEach(element => {
                dataArray.push({
                    value: element.rel_id,
                    label: element.plot_no
                });
            });
            setplotAll(dataArray)

        }
    }



    const handlePlot = async (relId) => {
        const response = await problemProduceAgainstPlotAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, farmerID, relId.value)

        if (response) {
            //   console.warn(JSON.stringify(response.data.data.rows,null,2));
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
                    // plot_size: response.data.data.rows[0].land_info.land_size,
                    // plot_size: response.data.data.rows[0].land_info.land_unit.name,
                    plot_size: response.data.data.rows[0].land_info.land_size + " " + response.data.data.rows[0].land_info.land_unit.name,
                    createdBy: dbLanTokUsr.userId,
                })
                const response_farmIncome = await farmaccountsIncomeListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, farmerID)
                if (response_farmIncome) {
                    const dataArray = [];
                    response_farmIncome.data.data.rows.forEach(element => {
                        dataArray.push({
                            value: element.fid,
                            label: element.categoryName,
                        });
                    });
                    setInComeAll(dataArray)
                }


            } else {
                MessageDialog({ title: 'Importent', message: 'Your previous crop has been harvested Please Add a Crop' })
                setSearchFarmerName('')
                setSearchFarmerPhone('')
                setplotAll([])
                navigation.navigate('FarmerDashboard');
            }
        }
    }
    const handleSave = async () => {
        // return console.log(data);
        let grand_total = 0
        data.forEach(element => {
            grand_total += parseInt(element.amount)
        });
        // return console.log("grand_total", grand_total);
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
                // console.log(JSON.stringify(response.data));
                handleClear()
                navigation.navigate('FarmerFarmIncomeExpenseList');
            })
            .catch((error) => {
                console.log(error);
            });
    }
    const HandlerGoBack = () => {
        navigation.navigate('FarmerFarmIncomeExpenseList');
    }
    return (
        <>
            <View style={{ flex: 1 }}>
                <DatePickerComp
                    openDate={openFromDate}
                    newDate={newFromDate}
                    setOpenDate={setOpenFromDate}
                    handleDatePicker={handleDatePicker}
                />
                <CustomHeader path='FarmerFarmIncomeExpenseList' HandlerGoBack={HandlerGoBack} />
                <FormsTitle title={t('add_income')} />

                <View style={styles.formContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <DropdownForm label={t('plot')} data={plotAll} color="red" onChange={relId => handlePlot(relId)} />
                        {
                            showingMenu
                                ?
                                <View style={styles.plotContainer}>
                                    <View style={styles.plotItem}>
                                        <Text style={styles.plotItemText}>Produce Name</Text>
                                        <Text style={styles.plotItemText}>Produce Vareity</Text>
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
                                                    placeholder={t('amount') + "(" + currency + ")"}
                                                    value={data.amount}
                                                    keyboardType="numeric"
                                                    placeholderTextColor={'#000'}
                                                />
                                            </View>
                                            <View style={styles.AddExpenseItemContainer}>
                                                <View style={styles.AddExpenseItem}>
                                                    <HeadDropDown label={t('add_income_head')} data={InComeAll} name='cat_id' onChange={(text) => handleChangeAddCatID(index, text, 'cat_id')} color={'#000'} />
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
            </View>
            <ButtonForm label={t('submit')} onPress={() => handleSave()} />
        </>
    )
}
export default FarmerAddIncome

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
        top: "45%",
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
        height: Dimensions.get('window').height / 2.5
    },
    title: {
        color: '#000'
    }
})