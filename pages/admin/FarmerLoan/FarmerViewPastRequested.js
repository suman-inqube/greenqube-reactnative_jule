import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    Image, Dimensions, ScrollView, BackHandler, SafeAreaView
} from 'react-native'
import React, { useState, useEffect } from 'react'
import DatePickerComp from '../../Common/DatePickerComp';
import Filter from '../../Common/FarmerFilter';
import { useNavigation } from '@react-navigation/native';
import { getItem } from '../../../config/getDataFromStorage';
import LoadingScreen from '../../Common/LoadingScreen';
import { loanRouteFarmerListAPI, loanRouteListAPI } from './FarmerLoanAPI';
import { useTranslation } from 'react-i18next';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
const FarmerViewPastRequested = ({ setActiveBtn }) => {
    const { t } = useTranslation();
    const [currency, setcurrency] = useState("");
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [filterOption, setFilterOption] = useState(false);
    const [filterItem, setFilterItem] = useState("");
    const [filterName, setFilterName] = useState("");
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [newToDate, setnewToDate] = useState(new Date());
    const [openFromDate, setOpenFromDate] = useState(false);
    const [openToDate, setOpenToDate] = useState(false);
    const [fromDate, setfromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: '',
        languageID: '',
        token: '',
        userID: ''
    });
    const [farmerData, setfarmerData] = useState([]);
    const [loanList, setLoanList] = useState([]);
    const [loanListRaw, setLoanListRaw] = useState([]);
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [selectedName, setSelectedName] = useState('');
    const [farmerID, setfarmerID] = useState();
    // const[timefilter,setTimeFilter]=useState(false);
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
    const handleDatePicker = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        // console.log(item)
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setfromDate(effective_date)
        setToDate("")
    }
    const handleDatePicker2 = async (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setToDate(effective_date)
        const response = await loanRouteListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, dbLanTokUsr.userID, fromDate, effective_date, "")
        if (response) {
            setIsLoading(false);
            setLoanList(response.data.data.rows);
            setLoanListRaw(response.data.data.rows)
        }
    }
    const onPageLoad = async () => {
        setIsLoading(true);
        const [loginUser_data, curr] = await Promise.all([
            await getItem('loginUser_data'),
            await getItem('currency')
        ])
        setcurrency(curr);
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const userID = loginUser_data.user_id;
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageID: languageID,
                token: token,
                userID: userID
            })
            const [response, farmerByName] = await Promise.all([
                loanRouteListAPI(dbName, languageID, token, userID, "", "", ""),
                loanRouteFarmerListAPI(dbName, languageID, token, userID)
            ]);
            // const response = await loanRouteListAPI(dbName, languageID, token, userID, "", "", "")
            if (response) {
                setIsLoading(false);
                setLoanList(response.data.data.rows);
                setLoanListRaw(response.data.data.rows)
            }
        }
    };


    const filterfromAndToDate = () => {
        if (fromDate != "" && toDate != "") {
            let tempData = loanList.filter(item => {
                return (item.agri_user.CreateDateTime.slice(0, 10) >= fromDate &&
                    item.agri_user.CreateDateTime.slice(0, 10) <= toDate);
            });
            setLoanList(tempData)
        }
    }
    useEffect(() => {
        filterfromAndToDate();
    }, [fromDate, toDate])
    useEffect(() => {
        onPageLoad();
    }, [])
    const filterDataRemove = async () => {
        setFilterItem("");
        setFilterOption(false);
        setToDate("");
        setfromDate("");
        const response = await loanRouteListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, dbLanTokUsr.userID, "", "", "")
        if (response) {
            setIsLoading(false);
            setLoanList(response.data.data.rows);
            setLoanListRaw(response.data.data.rows)
        }
    }
    const navigate = (FarmerLoanEnquiryDetail, item) => {
        // store.dispatch(updateLoan(item));
        navigation.navigate('FarmerLoanEnquiryDetail', item)
    }
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
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


                <TouchableOpacity style={styles.plusIcon} onPress={() => setActiveBtn(1)}>
                    <Image source={require('../../Common/images/plus.png')} style={{ width: 50, height: 50 }} />
                </TouchableOpacity>
                {isLoading ? "" :
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
                        onlyDate={true}
                        filterDataRemove={filterDataRemove}
                    />
                }
                <View>
                    {isLoading ?
                        <View style={styles.loadingScreen}><LoadingScreen /></View>
                        : ""}
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={loanList}
                        style={filterName !== "" ? { marginBottom: 30 } : { marginBottom: 30 }}
                        renderItem={({ item }) => {
                            var mydate = new Date(item.agri_user.CreateDateTime.split("T")[0]);
                            return (
                                <TouchableOpacity style={styles.flatListContainer} onPress={() => navigate('FarmerLoanEnquiryDetail', item)}>
                                    <View style={styles.flatListItem}>
                                        <Text style={styles.title}>{t('loan_amt') + `(${currency})`}:{item.loan_amount.substring(-1, 5)}...</Text>
                                        <Text style={styles.title}>{t('name')}:{item.agri_user.userName}</Text>
                                        <Text style={styles.title}>{t('sta_')}: {item.status == 1 && t('pending')} {item.status == 2 && t('Approved')} {item.status == 3 && t('Rejected')} </Text>
                                        {item?.loan_sanctioned && <Text style={styles.title}>{t('LoanSanctioned') + `(${currency})`} :{"\n"}{item.loan_sanctioned}</Text>}
                                    </View>
                                    <View style={styles.flatListItem}>
                                        <Text style={styles.title}>{t('date')}:{mydate.toString().substring(4, 15)}</Text>
                                        <Text style={styles.title}>{t('number_caps')}:{item.agri_user.contactNumber}</Text>
                                        {item?.sanctioned_date && <Text style={styles.title}>{t('SanctionedDate')} : {"\n"}{item.sanctioned_date}</Text>}
                                        {item?.loan_ord_id && <Text style={styles.title}>{t('LoanOrderID')} : {"\n"}{item.loan_ord_id}</Text>}
                                    </View>
                                </TouchableOpacity>
                            )
                        }}
                        keyExtractor={(item, index) => index}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default FarmerViewPastRequested

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flatListContainer: {
        marginHorizontal: '3%',
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 5
    },
    flatListItem: {
        width: '50%',

    },
    plusIcon: {
        width: 50,
        height: 50,
        position: 'absolute',
        top: 200,
        right: 20,
        zIndex: 999
    },
    flatContainer: {
        backgroundColor: '#ffffff',
        position: 'absolute',
        zIndex: 999,
        bottom: '100%',
        left: 0,
        marginHorizontal: '2.5%',
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
    loadingScreen: {
        position: 'relative',
        top: 100
    },
    title: {
        color: '#000',
        fontSize: 14,
        marginVertical: 3,
        fontFamily: 'Poppins-Regular'
    }

})