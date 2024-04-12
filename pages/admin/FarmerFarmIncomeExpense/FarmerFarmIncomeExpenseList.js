import { StyleSheet, Text, View, TouchableOpacity, FlatList, SafeAreaView, Dimensions } from 'react-native'
import React, { useState } from 'react'
import Filter from '../../Common/FarmerFilter';
import CustomHeader from '../CustomHeader';
import DatePickerComp from '../../Common/DatePickerComp';
import { useFocusEffect } from '@react-navigation/native';
import LoadingScreen from '../../Common/LoadingScreen';
import { farmerFarmaccountsListAPI, farmerByNameAPI } from '../../../config/apiHere';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import { formatDateToDateName } from '../../Common/DateChanger';
import { useTranslation } from 'react-i18next';
const FarmerFarmIncomeExpenseList = ({ navigation }) => {
    const { t } = useTranslation();
    const [currency, setcurrency] = useState("");
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
        const curr = await getItem('currency');
        setcurrency(curr)
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageId = loginUser_data.lan_id;
            const token = loginUser_data.token;
            // const supervisorId = loginUser_data.owner.user_id;
            const supervisorId = loginUser_data.user_id;
            const fromDate = '';
            const toDate = '';
            const response = await farmerFarmaccountsListAPI(dbName, languageId, token, supervisorId, 1, fromDate, toDate)
            if (response) {
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
                setItem("farm_account", response.data.data.rows)
                setIsLoading(false)
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
                setIsLoading(false)
                return;
            } else {
                const nextPage = currentPageNo + 1
                setdbLanTokUsr({ ...dbLanTokUsr, pageNo: nextPage })
                const farmerId = '';
                const fromDate = '';
                const toDate = '';
                const response = await farmerFarmaccountsListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, nextPage, fromDate, toDate)
                if (response) {
                    setFarmAccount(response.data.data.rows)
                    setFarmAccountRaw(response.data.data.rows)
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
                const response = await farmerFarmaccountsListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, prePage, fromDate, toDate)
                if (response) {
                    setFarmAccount(response.data.data.rows)
                    setFarmAccountRaw(response.data.data.rows)
                    setItem("farm_account", response.data.data.rows)
                    setIsLoading(false)
                }
            }
        }
    }
    const handleFilter = async (search) => {

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
            const response = await farmerFarmaccountsListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, 0, fromDate, effective_date)
            if (response) {
                setFarmAccount(response.data.data.rows)
                setFarmAccountRaw(response.data.data.rows)
                setItem("farm_account", response.data.data.rows)
                setIsLoading(false)
            }
        } else {
            MessageDialog({ title: 'Require', message: 'Please Select First data.' })
        }

    }
    const filterDataRemove = async () => {
        setFilterItem("");
        setFilterOption(false);
        setToDate("");
        setfromDate("");
        const response = await farmerFarmaccountsListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, "0", fromDate, toDate)
        if (response) {
            setFarmAccount(response.data.data.rows)
            setFarmAccountRaw(response.data.data.rows)
            setItem("farm_account", response.data.data.rows)
            setIsLoading(false)
        }
    }

    const navigateToPages = async (pageName, index) => {
        setItem("farm_in_ex_id", farmAccount[index])
        navigation.navigate(pageName);
    };
    useFocusEffect(
        React.useCallback(() => {
            // calculateIncomes()
            onPageLoad()
        }, [])
    );
    const HandlerGoBack = () => {
        navigation.navigate('FarmerDashboard');
    }
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader path='FarmerDashboard' HandlerGoBack={HandlerGoBack} />
            <DatePickerComp
                openDate={openFromDate}
                newDate={newFromDate}
                setOpenDate={setOpenFromDate}
                handleDatePicker={handleDatePicker}
            />
            <DatePickerComp
                openDate={openToDate}
                newDate={newToDate}
                setOpenDate={setOpenToDate}
                handleDatePicker={handleDatePicker2}
                minimumDate={fromDate == "" ? "" : new Date(`${new Date(fromDate).getFullYear()}-${new Date(fromDate).getMonth() + 1}-${new Date(fromDate).getDate() + 1}`)}
            />
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
            {
                isLoading ? <LoadingScreen /> :
                    <>
                        <FlatList
                            data={farmAccount}
                            renderItem={({ item, index }) => {
                                return (
                                    // substring(0, 7)+'..'
                                    <TouchableOpacity style={styles.wrapper} key={index} onPress={() => navigateToPages('FarmerFarmIncomeExpenseView', index)}>
                                        <View style={styles.activityListContainer}>
                                            <View style={styles.activityListItem}>
                                                <Text style={styles.title}>{t('addcrop_plot')} : {item.land_info && item.land_info.plot_no.substring(0, 17) + '..'}</Text>
                                                <Text style={styles.title}>{t('showing_date')} : {formatDateToDateName(item.sowing_date).substring(0, 7) + '..'}</Text>
                                                <Text style={styles.title}>
                                                    {t('total_income_sum') + "(" + currency + ")"} : {
                                                        <ShowIncome income={item.income_expense} />
                                                    }
                                                </Text>
                                            </View>
                                            <View style={styles.activityListItem}>
                                                <Text style={styles.title}>{t('name')} : {item.crop_name && item.crop_name.name.substring(0, 7) + '..'}</Text>
                                                <Text style={styles.title}>{t('name')} : {formatDateToDateName(item.harvesting_date).substring(0, 6) + '..'}</Text>
                                                <Text style={styles.title}>
                                                    {t('total_exp_sum') + "(" + currency + ")"} : {<ShowExpense expense={item.income_expense} />}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                            keyExtractor={(item, index) => index}
                            showsVerticalScrollIndicator={false}
                        />
                        <TouchableOpacity style={styles.addExpense} onPress={() => navigation.navigate("FarmerAddExpense")}>
                            <Text style={styles.addExpenseTitle}>Add Expense</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addIncome} onPress={() => navigation.navigate("FarmerAddIncome")}>
                            <Text style={styles.addIncomTitle}>Add Income</Text>
                        </TouchableOpacity>
                        <View style={styles.prevNextPage}>
                            <TouchableOpacity onPress={() => handlePage('previous')}>
                                <Text style={styles.title}>Prev Page</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handlePage('next')}>
                                <Text style={styles.title}>Next Page</Text>
                            </TouchableOpacity>
                        </View>

                    </>
            }

        </View >
    )
}

export default FarmerFarmIncomeExpenseList

const styles = StyleSheet.create({
    prevNextPage: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        position: 'relative',
        bottom: 0
    },
    wrapper: {
        width: '90%',
        marginHorizontal: '5%',
        backgroundColor: '#FFF',
        elevation: 5,
        marginVertical: 10,
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
        fontFamily: 'Poppins-SemiBold'
    },
    addIncomTitle: {
        color: '#FFF',
        textAlign: 'center',
        fontFamily: 'Poppins-SemiBold'
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
    flatlistHeight: {
        height: Dimensions.get('window').height / 2.5
    },

    flatlisttitle: {
        color: '#000',
        marginVertical: 6
    },
    flatlistitem: {
    },
    title: {
        color: '#000',
        marginVertical: 2,
        fontFamily: 'Poppins-Regular'
    },
    activityListItem: {
        width: '50%'
    }
})