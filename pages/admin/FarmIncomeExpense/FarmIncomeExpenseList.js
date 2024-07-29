import { StyleSheet, Text, View, TouchableOpacity, FlatList, SafeAreaView, Dimensions, BackHandler } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import DatePickerComp from '../../Common/DatePickerComp';
import { farmaccountsListAPI } from '../../../config/apiHere';
import { formatDateToDateName } from '../../Common/DateChanger';
import { userCreateContext } from '../../Context/usersCreateContext';
const FarmIncomeExpenseList = ({ navigation }) => {
    //GQR-67
    const { dbLanTokUsr, setdbLanTokUsr, loginUser_data, LoadingScreen, CustomHeader, t, getItem, AlertMesg, onBackPress, setItem, logoImage, topBanner, Root, Toast, SPSheet, DeviceInfo, handlePageList, effective_dates, farmerData, handleFilter, Filter } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    const { pageNo } = dbLanTokUsr;
    //GQR-67
    const [currency, setcurrency] = useState("");
    const [farmAccount, setFarmAccount] = useState([]);
    const [farmAccountRaw, setFarmAccountRaw] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [filterName, setFilterName] = useState("");
    const [fromDateFilter, setFromDateFilter] = useState('');
    const [filterOption, setFilterOption] = useState(false);
    const [filterItem, setFilterItem] = useState("");
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [newToDate, setnewToDate] = useState(new Date());
    const [openFromDate, setOpenFromDate] = useState(false);
    const [openToDate, setOpenToDate] = useState(false);
    const [fromDate, setfromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const filterOptionShow = () => {
        if (!filterOption) {
            setFilterOption(true);
        } else {
            setFilterOption(false);
        }
    }
    const onchangeFilterItem = (value) => {
        setFilterName(value);
        setFilterItem(value);
        setFilterOption(false);
    }
    const onPageLoad = async () => {
        const farmerId = '';
        const fromDate = '';
        const toDate = '';
        const [curr, response] = await Promise.all([
            getItem('currency'),
            farmaccountsListAPI(dbname, lan_id, token, user_id, 1, farmerId, fromDate, toDate)
        ]);
        setcurrency(curr);
        if (response?.status == 200) {
            const totalPage = Math.ceil(response.data.data.count / 20)
            setdbLanTokUsr({ ...dbLanTokUsr, totalPage: totalPage, pageNo: 1 });
            setFarmAccount(response.data.data.rows);
            setFarmAccountRaw(response.data.data.rows);
            setIsLoading(false)
        }
    };
    const ShowIncome = (props) => {
        const incomeItem = props.income.filter(item1 => item1.inexType?.taxonomy === 'income');
        if (incomeItem) {
            let incomeAmount = 0;
            incomeItem.forEach(element => { incomeAmount += parseInt(element.amount) });
            return incomeAmount + ".0"
        }
    }
    const ShowExpense = (props) => {
        const expenseItem = props.expense.filter(item1 => item1.inexType?.taxonomy === 'expense');
        if (expenseItem) {
            let expenseAmount = 0;
            expenseItem.forEach(element => { expenseAmount += parseInt(element.amount) });
            return expenseAmount + ".0"
        }
    }
    const handlePage = async (value) => {
        handlePageList(value, setIsLoading, token, pageNo, farmaccountsListAPI, setFarmAccount, dbname, lan_id, user_id);
    }
    const handleFilterList = async (item) => {
        handleFilter(item, filterName, farmerData, farmAccountRaw, setSearchFarmerPhone, setSearchFarmerName, setSearchResultsList, setFarmAccount, setSearchResults);
    }
    const handleResultSelect = async (name, user_id1, phone) => {
        setSearchResultsList(false);
        setSearchFarmerPhone(phone)
        setSearchFarmerName(name);
        setSearchResults([]);
        if (name !== '') {
            const farmerId = user_id1
            const fromDate = '';
            const toDate = '';
            const response = await farmaccountsListAPI(dbname, lan_id, token, user_id, 0, farmerId, fromDate, toDate)
            if (response) {
                const totalPage = Math.ceil(response.data.data.count / 20)
                setFarmAccount(response.data.data.rows)
            }
        } else {
            let tempData = farmAccount.filter(item => {
                return item.agri_user.contactNumber.toLowerCase().indexOf(phone.toLowerCase()) > -1;;
            });
            setFarmAccount(tempData)
        }
    }
    const handleDatePicker = (item) => {
        const effective_date = effective_dates(item);
        setfromDate(effective_date)
        setFromDateFilter(effective_date)
    }
    const handleDatePicker2 = async (item) => {
        const effective_date = effective_dates(item);
        setToDate(effective_date)
        if (fromDateFilter) {
            const farmerId = '';
            const fromDate = fromDateFilter;
            const toDate = effective_date;
            const response = await farmaccountsListAPI(dbname, lan_id, token, user_id, 0, farmerId, fromDate, toDate)
            if (response) {
                setFarmAccount(response.data.data.rows)
                // setFarmAccountRaw(response.data.data.rows)
                setItem("farm_account", response.data.data.rows)
                setIsLoading(false)
            }
        } else {
            MessageDialog({ title: 'Require', message: 'Please Select First data.' })
        }
    }
    const navigateToPages = async (pageName, index) => {
        setItem("farm_in_ex_id", farmAccount[index])
        navigation.navigate(pageName);
    };
    const filterDataRemove = () => {
        setSearchFarmerName("");
        setSearchFarmerPhone("");
        setFilterItem("");
        setFilterOption(false);
        setSearchResultsList(false);
        setfromDate("");
        setToDate("");
        setFarmAccount(farmAccountRaw)
    }
    useEffect(() => {
        onPageLoad();
        onBackPress(() => { navigation.navigate('Dashboard'); return true });
    }, []);
    const HandlerGoBack = () => navigation.navigate('Dashboard');
    return (
        <Root>
            <View style={{ flex: 1 }}>
                <CustomHeader path='Dashboard' HandlerGoBack={HandlerGoBack} logoImage={logoImage}
                    topBanner={topBanner} />
                {openFromDate && <DatePickerComp openDate={openFromDate} newDate={newFromDate} setOpenDate={setOpenFromDate} handleDatePicker={handleDatePicker}
                />}
                {openToDate && <DatePickerComp
                    openDate={openToDate}
                    newDate={newToDate}
                    setOpenDate={setOpenToDate}
                    handleDatePicker={handleDatePicker2}
                    minimumDate={fromDate == "" ? "" : new Date(`${new Date(fromDate).getFullYear()}-${new Date(fromDate).getMonth() + 1}-${new Date(fromDate).getDate() + 1}`)}
                />}
                <Filter
                    filterItem={filterItem}
                    filterOption={filterOption}
                    setOpenToDate={setOpenToDate}
                    fromDate={fromDate}
                    newToDate={toDate}
                    setOpenFromDate={setOpenFromDate}
                    filterOptionShow={filterOptionShow}
                    onchangeFilterItem={onchangeFilterItem}
                    onChangeText={(item) => handleFilterList(item)}
                    FarmerProductNameValue={searchFarmerName}
                    FarmerProductPhoneValue={searchFarmerPhone}
                    title={t('income_expense_list')}
                    filterDataRemove={filterDataRemove}
                />
                <SafeAreaView>
                    {
                        searchResultsList && searchResultsList ?
                            <View style={styles.flatContainer}>
                                <FlatList
                                    style={searchResults.length > 8 ? styles.flatlistHeight : ""}
                                    data={searchResults}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity onPress={() => handleResultSelect(item.label, item.value, item.phone)} style={styles.flatlistitem}>
                                            <Text style={styles.flatlisttitle}>{filterName == "PhoneNumber" ? item.phone : item.label}</Text>
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(item, index) => index}
                                />
                            </View> : ""
                    }
                </SafeAreaView>
                {
                    isLoading &&
                    <View style={styles.loadingScreen}><LoadingScreen /></View>
                }
                <FlatList
                    data={farmAccount}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity style={styles.wrapper} key={index} onPress={() => navigateToPages('FarmIncomeExpenseView', index)}>
                            <View style={styles.activityListContainer}>
                                <View style={styles.activityListItem}>
                                    <Text style={styles.title}>{t('name')} : {item.agri_user && item.agri_user.userName.substring(0, 14) + '..'} </Text>
                                    <Text style={styles.title}>{t('addcrop_plot')} : {item.land_info && item.land_info.plot_no.substring(0, 17) + '..'}</Text>
                                    <Text style={styles.title}>{t('showing_date')} : {formatDateToDateName(item.sowing_date).substring(0, 7) + '..'}</Text>
                                    <Text style={styles.title}>
                                        {t('total_income_sum') + "(" + currency + ")"}: {
                                            <ShowIncome income={item.income_expense} />
                                        }
                                    </Text>
                                </View>
                                <View style={styles.activityListItem}>
                                    <Text style={styles.title}>{t('farmer_number')} : {item.agri_user && item.agri_user.contactNumber.substring(0, 5) + '..'}</Text>
                                    <Text style={styles.title}>{t('knowyourplot_cropinfo_cropname').substring(0, 13)} : {item.crop_name && item.crop_name.name.substring(0, 4) + '..'}</Text>
                                    <Text style={styles.title}>{t('harvesting_date_auto_calculated')} : {formatDateToDateName(item.harvesting_date).substring(0, 6) + '..'}</Text>
                                    <Text style={styles.title}>
                                        {t('total_exp_sum') + "(" + currency + ")"}: {<ShowExpense expense={item.income_expense} />}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                    }
                    keyExtractor={(item, index) => index}
                    showsVerticalScrollIndicator={false}
                />
                <TouchableOpacity style={styles.addExpense} onPress={() => navigation.navigate("AddExpense")}>
                    <Text style={styles.addExpenseTitle}>{t('add_expense')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addIncome} onPress={() => navigation.navigate("AddIcome")}>
                    <Text style={styles.addIncomTitle}>{t('add_income')}</Text>
                </TouchableOpacity>
                <View style={styles.prevNextPage}>
                    <TouchableOpacity onPress={() => handlePage('previous')}>
                        <Text style={styles.title}>{t('prev_page')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handlePage('next')}>
                        <Text style={styles.title}>{t('next_page')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Root>
    )
}

export default FarmIncomeExpenseList

const styles = StyleSheet.create({
    prevNextPage: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        position: 'relative',
        bottom: 0
    },
    wrapper: {
        marginHorizontal: '2.5%',
        backgroundColor: '#FFF',
        elevation: 5,
        marginBottom: 15,
        borderRadius: 10,
    },
    activityListContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    addExpense: {
        position: 'absolute',
        bottom: 80,
        backgroundColor: 'green',
        width: 110,
        paddingVertical: 10,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
    },
    addIncome: {
        position: 'absolute',
        right: 0,
        bottom: 80,
        backgroundColor: 'green',
        width: 110,
        paddingVertical: 10,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20
    },
    addExpenseTitle: {
        color: '#FFF',
        textAlign: 'center',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14
    },
    addIncomTitle: {
        color: '#FFF',
        textAlign: 'center',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14
    },
    flatContainer: {
        backgroundColor: '#ffffff',
        position: 'absolute',
        zIndex: 999,
        // bottom: 60,
        top: '15%',
        left: 0,
        marginHorizontal: '5%',
        width: '90%',
        elevation: 10,
        borderRadius: 10,
        padding: 10
    },
    flatlistHeight: {
        height: Dimensions.get('window').height / 3.6
    },

    flatlisttitle: {
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        marginVertical: 5
    },
    flatlistitem: {
    },
    title: {
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    },
    activityListItem: {
        width: '50%'
    },
    loadingScreen: {
        position: 'relative',
        top: 100,
        zIndex: 999
    },
})