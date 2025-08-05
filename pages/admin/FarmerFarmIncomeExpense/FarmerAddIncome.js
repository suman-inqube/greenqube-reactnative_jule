import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState, useContext } from 'react'
import HeadDropDown from './FarmerHeadDropDown';
import { useFocusEffect } from '@react-navigation/native';
import { farmaccountsIncomeListAPI, problemPlotAgainstFarmerAPI, problemProduceAgainstPlotAPI, farmIncomeExpenceSaveAPI,addModuleForView } from '../../../config/apiHere';
import DropdownForm from '../../Common/DropdownForm';
import MessageDialog from '../../Common/MessageDialog';
import axios from 'axios';
import { userCreateContext } from '../../Context/usersCreateContext';
import { plotHook } from '../../hooks/plotHook';
const FarmerAddIncome = ({ navigation }) => {
    //GQR-67
    const { loginUser_data, FormsTitle, ButtonForm, CustomHeader, DatePickerComp, t, getItem, logoImage, topBanner, effective_dates, onBackPress, Root, Toast, AlertMesg, isOnline } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id, owner } = loginUser_data;
    //GQR-67
    const { problemPlotAgainstFarmer, plotAll, setplotAll } = plotHook(dbname, lan_id, token, user_id, isOnline);
    const [showingMenu, setShowingMenu] = useState(false);
    const [nameVarityStartEnd, setNameVarityStartEnd] = useState({ name: "", varity: "" });
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
        const values = [...data];
        values[index][name] = text;
        setData(values);
    }
    const handleChangeAddCatID = (index, text, name) => {
        const values = [...data];
        values[index][name] = text.value;
        setData(values);
    }
    const handleChangeAddDate = (index, text, name) => {
        const values = [...data];
        values[index][name] = text;
        setData(values);
    }
    const handleDatePicker = (item) => {
        const effective_date = effective_dates(item);
        setfromDate(effective_date)
        handleChangeAddDate(isIndex, effective_date, "date")
    }
    function handleClear() {
        setData([{ type: "cost_production", cat_id: "", amount: "", date: "" }])
        setplotAll([])
        setShowingMenu(false)
        setInComeAll([])
        setfromDate("")
    }
    const onPageLoad = async () => {
        handleClear();
        const curr = await getItem('currency');
        setCurrency(curr)
        setfarmerID(user_id)
        problemPlotAgainstFarmer();
    };
    useFocusEffect(
        React.useCallback(() => {
            onPageLoad();
            onBackPress(() => { navigation.navigate('FarmerFarmIncomeExpenseList'); return true; })
        }, [])
    );
    const handlePlot = async (relId) => {
        const response = await problemProduceAgainstPlotAPI(dbname, lan_id, farmerID, relId.value)
        if (response?.status == 200) {
            setNameVarityStartEnd({ ...nameVarityStartEnd, name: response.data.data.crop_name?.name, varity: response.data.data.crop_variety?.name })
            const dateString = response?.data?.data?.harvesting_date;
            const harvesting_date = new Date(dateString);
            const currentDate = new Date();
            if (harvesting_date > currentDate) {
                setShowingMenu(true)
                setSaveData({
                    ...saveData,
                    land_rel_id: relId.value,
                    crop_name_id: response.data.data.crop_name_id,
                    harvesting_date: response.data.data.harvesting_date,
                    sowing_date: response.data.data.sowing_date,
                    // plot_size: response.data.data.land_info.land_size,
                    // plot_size: response.data.data.land_info.land_unit.name,
                    plot_size: response.data.data.land_info.land_size + " " + response.data.data.land_info.land_unit?.name,
                    createdBy: user_id,
                })
                const response_farmIncome = await farmaccountsIncomeListAPI(dbname, lan_id, farmerID)
                if (response_farmIncome?.status == 200) {
                    addModuleForView(dbname, lan_id, farmerID,token, "IncomeExpense User", "module_hit", "incomeExpense_user", 1)
                    const dataArray = response_farmIncome?.data?.data?.rows.map(data => ({ value: data.fid, label: data.categoryName }));
                    setInComeAll(dataArray)
                }
            } else {
                // MessageDialog({ title: 'Importent', message: `${t('your_previous_crop_hervested')} ${t('add_a_new_crop')}` })
                Toast.show({ time: 3, text: `${t('your_previous_crop_hervested')} ${t('add_a_new_crop')}`, ...AlertMesg[0] })
                setplotAll([]);
                setTimeout(() => {
                    navigation.navigate('FarmerDashboard');
                }, 1300);
            }
        }
    }
    const handleSave = async () => {
        // return console.log(data);
        console.log(saveData?.land_rel_id=="");
        let grand_total = 0
        data.forEach(element => {
            grand_total += parseInt(element.amount)
        });
        // return console.log("grand_total", grand_total);
        // const qs = require('qs');
        // let save_data = qs.stringify({
        //     'land_rel_id': saveData.land_rel_id,
        //     'crop_name_id': saveData.crop_name_id,
        //     'harvesting_date': saveData.harvesting_date.substring(0, 10),
        //     'sowing_date': saveData.sowing_date,
        //     'createdBy': saveData.createdBy,
        //     'type': 'cost_production',
        //     'plot_size': saveData.plot_size,
        //     'grand_total': grand_total,
        //     'expense_total': '0',
        //     'cost_head': JSON.stringify(data)
        // });
        // const response = await farmIncomeExpenceSaveAPI(dbname, lan_id, token, farmerID, save_data);
        // if (response?.status == 200) {
        //     navigation.navigate('FarmerFarmIncomeExpenseList');
        // }
    }
    const HandlerGoBack = () => navigation.navigate('FarmerFarmIncomeExpenseList');
    return (
        <Root>
            <View style={{ flex: 1 }}>
                <DatePickerComp openDate={openFromDate} newDate={newFromDate} setOpenDate={setOpenFromDate} handleDatePicker={handleDatePicker} />
                <CustomHeader path='FarmerFarmIncomeExpenseList' HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
                <FormsTitle title={t('add_income')} />
                <View style={styles.formContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>
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
                        <View style={{ marginBottom: 400 }}>
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
                </View>
                <TouchableOpacity onPress={addMoreExpense} style={styles.addMore}>
                    <Text style={styles.addMoreText} >{t('add_more')}</Text>
                </TouchableOpacity>
            </View>
            <ButtonForm label={t('submit')} onPress={() => handleSave()} />
        </Root>
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
        fontSize: 18,
        color: 'green',
        fontFamily: 'Poppins-Regular'
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
        right: '-4%',
        // bottom: 0,
        top: "75%",
        zIndex: 999,
        backgroundColor: 'green',
        width: 100,
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