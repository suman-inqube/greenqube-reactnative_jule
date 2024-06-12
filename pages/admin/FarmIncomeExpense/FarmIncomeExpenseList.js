import { StyleSheet, Text, View, TouchableOpacity, FlatList, SafeAreaView, Dimensions, BackHandler } from 'react-native'
import React, { useState, useEffect } from 'react'
import Filter from '../../Common/Filter';
import CustomHeader from '../CustomHeader';
import DatePickerComp from '../../Common/DatePickerComp';
import { useFocusEffect } from '@react-navigation/native';
import LoadingScreen from '../../Common/LoadingScreen';
import { farmaccountsListAPI, farmerByNameAPI } from '../../../config/apiHere';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import { formatDateToDateName } from '../../Common/DateChanger';
import { useTranslation } from 'react-i18next';
import { AlertMesg } from '../../Common/ToastAlert';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
const FarmIncomeExpenseList = ({ navigation }) => {
    const { t } = useTranslation();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: "",
        languageId: "",
        token: "",
        supervisorId: "",
        totalPage: "",
        pageNo: 1,
    });
    const [farmAccount, setFarmAccount] = useState([]);
    const [farmAccountRaw, setFarmAccountRaw] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [farmerData, setFarmerData] = useState([]);
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
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageId = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const supervisorId = loginUser_data.user_id;
            const farmerId = '';
            const fromDate = '';
            const toDate = '';
            var response = await farmaccountsListAPI(dbName, languageId, token, supervisorId, 1, farmerId, fromDate, toDate)
            if (response.status == 200) {
                const totalPage = Math.ceil(response.data.data.count / 20)
                setdbLanTokUsr({
                    ...dbLanTokUsr,
                    dbName: dbName,
                    languageId: languageId,
                    token: token,
                    supervisorId: supervisorId,
                    totalPage: totalPage,
                    pageNo: 1,
                });
                setFarmAccount(response.data.data.rows)
                setFarmAccountRaw(response.data.data.rows)
                // setItem("farm_account", response.data.data.rows)
                setIsLoading(false)
            }
            const farmerByName = await farmerByNameAPI(dbName, languageId, token, supervisorId)
            if (farmerByName) {
                const dataArray = [];
                farmerByName.data.data.rows.forEach(element => {
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
    const ShowIncome = (props) => {
        const incomeItem = props.income.filter(item1 => item1.inexType?.taxonomy === 'income');
        if (incomeItem) {
            let incomeAmount = 0;
            incomeItem.forEach(element => {
                incomeAmount += parseInt(element.amount)
            });
            return incomeAmount + ".0"
        }
    }
    const ShowExpense = (props) => {
        const expenseItem = props.expense.filter(item1 => item1.inexType?.taxonomy === 'expense');
        if (expenseItem) {
            let expenseAmount = 0;
            expenseItem.forEach(element => {
                expenseAmount += parseInt(element.amount)
            });
            return expenseAmount + ".0"
        }
    }
    const handlePage = async (value) => {
        setIsLoading(true)
        const currentPageNo = dbLanTokUsr.pageNo
        const totalPage = dbLanTokUsr.totalPage
        if (value === 'next') {
            if (totalPage === currentPageNo) {
                setIsLoading(false);
                Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] });
                setFarmAccount([]);
            } else {
                const nextPage = currentPageNo + 1
                setdbLanTokUsr({ ...dbLanTokUsr, pageNo: nextPage })
                const farmerId = '';
                const fromDate = '';
                const toDate = '';
                const response = await farmaccountsListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, nextPage, farmerId, fromDate, toDate)
                if (response) {
                    setFarmAccount(response.data.data.rows)
                    // setFarmAccountRaw(response.data.data.rows)
                    setItem("farm_account", response.data.data.rows)
                    setIsLoading(false)
                }
            }
        }
        if (value === 'previous') {
            if (currentPageNo === 1) {
                setIsLoading(false)
                return;
            } else {
                const farmerId = '';
                const fromDate = '';
                const toDate = '';
                const prePage = currentPageNo - 1
                setdbLanTokUsr({ ...dbLanTokUsr, pageNo: prePage })
                const response = await farmaccountsListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, prePage, farmerId, fromDate, toDate)
                if (response) {
                    setFarmAccount(response.data.data.rows)
                    // setFarmAccountRaw(response.data.data.rows)
                    setItem("farm_account", response.data.data.rows)
                    setIsLoading(false)
                }
            }
        }
    }
    const handleFilter = async (search) => {
        if (filterName === 'Farmer/Product Name') {
            setSearchFarmerPhone('');
            setSearchFarmerName(search);
            const result = farmerData.filter(item =>
                item.label.toLowerCase().includes(search.toLowerCase())
            );
            if (search == "") {
                setSearchResultsList(false);
                setFarmAccount(farmAccountRaw)
            } else {

                // let tempData = farmAccount.filter(item => {
                //     item.agri_user.userName.toLowerCase().indexOf(search.toLowerCase()) > -1;
                // });
                // setFarmAccount(tempData)
                setSearchResultsList(true);
            }
            if (result) {
                setSearchResults(result);
            }
        } else if (filterName === 'PhoneNumber') {
            setSearchFarmerName('');
            setSearchFarmerPhone(search);
            const result = farmerData.filter(item =>
                item.phone.toLowerCase().includes(search.toLowerCase())
            );
            if (search == "") {
                setSearchResultsList(false);
                setFarmAccount(farmAccountRaw)
            } else {
                // let tempData = farmAccount.filter(item => {
                //     return item.agri_user.contactNumber.toLowerCase().indexOf(search.toLowerCase()) > -1;;
                // });
                // setFarmAccount(tempData)
                setSearchResultsList(true);
            }
            if (result) {
                setSearchResults(result);
            }
        }
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
            const response = await farmaccountsListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, 0, farmerId, fromDate, toDate)
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
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setfromDate(effective_date)
        setFromDateFilter(effective_date)
    }
    const handleDatePicker2 = async (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setToDate(effective_date)
        if (fromDateFilter) {
            const farmerId = '';
            const fromDate = fromDateFilter;
            const toDate = effective_date;
            const response = await farmaccountsListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, 0, farmerId, fromDate, toDate)
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
        const onBackPress = () => {
            navigation.navigate('Dashboard'); return true;
        };
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []);
    const HandlerGoBack = () => navigation.navigate('Dashboard');
    return (
        <Root>
            <View style={{ flex: 1 }}>
                <CustomHeader path='Dashboard' HandlerGoBack={HandlerGoBack} />
                {openFromDate && <DatePickerComp
                    openDate={openFromDate}
                    newDate={newFromDate}
                    setOpenDate={setOpenFromDate}
                    handleDatePicker={handleDatePicker}
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
                    onChangeText={(item) => handleFilter(item)}
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
                    isLoading ? <View style={styles.loadingScreen}><LoadingScreen /></View> :
                        <>
                            <FlatList
                                data={farmAccount}
                                renderItem={({ item, index }) => {
                                    return (
                                        <TouchableOpacity style={styles.wrapper} key={index} onPress={() => navigateToPages('FarmIncomeExpenseView', index)}>
                                            <View style={styles.activityListContainer}>
                                                <View style={styles.activityListItem}>
                                                    <Text style={styles.title}>{t('name')} : {item.agri_user && item.agri_user.userName.substring(0, 14) + '..'} </Text>
                                                    <Text style={styles.title}>{t('addcrop_plot')} : {item.land_info && item.land_info.plot_no.substring(0, 17) + '..'}</Text>
                                                    <Text style={styles.title}>{t('showing_date')} : {formatDateToDateName(item.sowing_date).substring(0, 7) + '..'}</Text>
                                                    <Text style={styles.title}>
                                                        {t('total_income_sum')} (Rs.): {
                                                            <ShowIncome income={item.income_expense} />
                                                        }
                                                    </Text>
                                                </View>
                                                <View style={styles.activityListItem}>
                                                    <Text style={styles.title}>{t('farmer_number')} : {item.agri_user && item.agri_user.contactNumber.substring(0, 5) + '..'}</Text>
                                                    <Text style={styles.title}>{t('knowyourplot_cropinfo_cropname').substring(0, 13)} : {item.crop_name && item.crop_name.name.substring(0, 4) + '..'}</Text>
                                                    <Text style={styles.title}>{t('harvesting_date_auto_calculated')} : {formatDateToDateName(item.harvesting_date).substring(0, 6) + '..'}</Text>
                                                    <Text style={styles.title}>
                                                        {t('total_exp_sum')} (Rs.): {<ShowExpense expense={item.income_expense} />}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }}
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
                        </>
                }
            </View >
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
        bottom: 60,
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
        fontSize: 14
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
        top: 100
    },
})