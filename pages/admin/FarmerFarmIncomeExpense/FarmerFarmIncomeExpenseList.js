import { StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions } from 'react-native'
import React, { useState, useContext } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { farmerFarmaccountsListAPI } from '../../../config/apiHere';
import { formatDateToDateName } from '../../Common/DateChanger';
import { userCreateContext } from '../../Context/usersCreateContext';
import FarmerFilter from '../../Common/FarmerFilter';
const FarmerFarmIncomeExpenseList = ({ navigation }) => {
    //GQR-67
    const { dbLanTokUsr, setdbLanTokUsr, loginUser_data, LoadingScreen, CustomHeader, DatePickerComp, t, getItem, setItem, logoImage, topBanner, handlePageList, effective_dates, handleFilter, Filter } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    const { pageNo } = dbLanTokUsr;
    //GQR-67
    const [currency, setcurrency] = useState("");
    const [farmAccount, setFarmAccount] = useState([]);
    const [farmAccountRaw, setFarmAccountRaw] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
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
        setcurrency(curr);
        const fromDate = '';
        const toDate = '';
        const response = await farmerFarmaccountsListAPI(dbname, lan_id, token, user_id, 1, fromDate, toDate);
        // console.log(JSON.stringify(response.data.data.rows))
        if (response?.status == 200) {
            const totalPage = Math.ceil(response.data.data.count / 20)
            setdbLanTokUsr({ ...dbLanTokUsr, totalPage: totalPage, pageNo: 1 });
            setFarmAccount(response.data.data.rows)
            setFarmAccountRaw(response.data.data.rows)
            setItem("farm_account", response.data.data.rows)
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
                const fromDate = '';
                const toDate = '';
                const response = await farmerFarmaccountsListAPI(dbname, lan_id, token, user_id, nextPage, fromDate, toDate)
                if (response?.status == 200) {
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
                const fromDate = '';
                const toDate = '';
                const prePage = currentPageNo - 1
                setdbLanTokUsr({ ...dbLanTokUsr, pageNo: prePage })
                const response = await farmerFarmaccountsListAPI(dbname, lan_id, token, user_id, prePage, fromDate, toDate)
                if (response?.status == 200) {
                    setFarmAccount(response.data.data.rows)
                    setFarmAccountRaw(response.data.data.rows)
                    setItem("farm_account", response.data.data.rows)
                    setIsLoading(false)
                }
            }
        }
        setIsLoading(false);
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
            const fromDate = fromDateFilter;
            const response = await farmerFarmaccountsListAPI(dbname, lan_id, token, user_id, 0, fromDate, effective_date)
            if (response?.status == 200) {
                setFarmAccount(response.data.data.rows);
                setFarmAccountRaw(response.data.data.rows);
                setItem("farm_account", response.data.data.rows);
                setIsLoading(false);
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
        const response = await farmerFarmaccountsListAPI(dbname, lan_id, token, user_id, "0", '', '');
        if (response?.status == 200) {
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
            onPageLoad()
        }, [])
    );
    const HandlerGoBack = () => navigation.navigate('FarmerDashboard');
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader path='FarmerDashboard' HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
            <DatePickerComp openDate={openFromDate} newDate={newFromDate} setOpenDate={setOpenFromDate} handleDatePicker={handleDatePicker} />
            <DatePickerComp openDate={openToDate} newDate={newToDate} setOpenDate={setOpenToDate} handleDatePicker={handleDatePicker2} minimumDate={fromDate == "" ? "" : new Date(`${new Date(fromDate).getFullYear()}-${new Date(fromDate).getMonth() + 1}-${new Date(fromDate).getDate() + 1}`)} />
            <FarmerFilter
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
                            renderItem={({ item, index }) => (
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
                                            <Text style={styles.title}>{t('knowyourplot_cropinfo_cropname')} : {item.crop_name && item.crop_name.name.substring(0, 7) + '..'}</Text>
                                            <Text style={styles.title}>{t('harvesting_date_auto_calculated')} : {formatDateToDateName(item.harvesting_date).substring(0, 6) + '..'}</Text>
                                            <Text style={styles.title}>
                                                {t('total_exp_sum') + "(" + currency + ")"} : {<ShowExpense expense={item.income_expense} />}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                            }
                            keyExtractor={(item, index) => index}
                            showsVerticalScrollIndicator={false}
                        />
                        <TouchableOpacity style={styles.addExpense} onPress={() => navigation.navigate("FarmerAddExpense")}>
                            <Text style={styles.addExpenseTitle}>{t('add_expense')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addIncome} onPress={() => navigation.navigate("FarmerAddIncome")}>
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

        </View>
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