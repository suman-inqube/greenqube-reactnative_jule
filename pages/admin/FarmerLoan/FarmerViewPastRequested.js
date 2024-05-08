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
    const [statusName, setStatusName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [selectedName, setSelectedName] = useState('');
    const [farmerID, setfarmerID] = useState();
    const [statusAll, setTtatusAll] = useState([
        { value: 2, "label": 'Approved' },
        { value: 1, "label": 'Pending' },
        { value: 3, "label": 'Rejected' }]);
    // const[timefilter,setTimeFilter]=useState(false);
    const filterOptionShow = () => {
        if (!filterOption) {
            setFilterOption(true);
        } else {
            setFilterOption(false);
        }
    }
    const onchangeFilterItem = (value) => {
        if (value == "statusFilter") {
            setSearchResultsList(true);
            setSearchResults(statusAll);
        }
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
            if (response?.status == 200) {
                setLoanList(response.data.data.rows);
                setLoanListRaw(response.data.data.rows)
            }
        }
        setIsLoading(false);
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
        if (response?.status == 200) {
            setIsLoading(false);
            setLoanList(response.data.data.rows);
            setLoanListRaw(response.data.data.rows)
        }
    }
    const navigate = (FarmerLoanEnquiryDetail, item) => {
        // store.dispatch(updateLoan(item));
        navigation.navigate('FarmerLoanEnquiryDetail', item)
    }
    const handleFilter = async (search) => {
        if (filterName === 'statusFilter') {
            setSearchResultsList(true);
            setStatusName(search);
            const result = statusAll.filter(item =>
                item.label.toLowerCase().includes(search.toLowerCase())
            );
            if (result) {
                setSearchResults(result);
            }
        }
    }
    const handleResultSelect = async (name, currentfarmerId, phone) => {
        setSearchResultsList(false);
        setSearchFarmerPhone(phone)
        setSelectedName(name);
        setSearchFarmerName(name);
        setStatusName(name);
        setSearchResults([]);
        setfarmerID(currentfarmerId)
        if (name == "Pending" || name == "Rejected" || name == "Approved") {
            let tempData = loanListRaw.filter(item => {
                return item.status == currentfarmerId;
            });
            setLoanList(tempData)
        }
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

                {
                    searchResultsList && searchResultsList ?
                        <View style={styles.flatContainer}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
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
                        statusNameValue={statusName}
                        onlyDate={true}
                        filterDataRemove={filterDataRemove}
                        statusFilter={true}
                    />
                }
                <View>
                    {isLoading ?
                        <View style={styles.loadingScreen}>
                            <LoadingScreen />
                        </View>
                        : ""}
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={loanList}
                        style={filterName !== "" ? { marginBottom: 40 } : { marginBottom: 40 }}
                        renderItem={({ item }) => {
                            var date = new Date(item.agri_user.CreateDateTime.split("T")[0]);
                            var sanctioned_date = new Date(item.sanctioned_date);
                            return (
                                <TouchableOpacity style={styles.flatListContainer} onPress={() => navigate('LoanEnquiryDetail', item)}>
                                    <View style={styles.flatListItem}>
                                        <Text style={styles.title}>{t('name')}:{item.agri_user.userName}</Text>
                                        <Text style={styles.title}>{t('loan_amt') + `(${currency})`}:{item.loan_amount.substring(-1, 4)}...</Text>
                                        <Text style={styles.title}>{t('sta_')}:{item.status == 1 && t('pending')}{item.status == 2 && t('Approved')}{item.status == 3 && t('Rejected')} </Text>
                                        {item?.loan_sanctioned && <Text style={styles.title}>{t('LoanSanctioned') + `(${currency})`}:{item.loan_sanctioned.substring(-1, 3)}...</Text>}
                                    </View>
                                    <View style={styles.flatListItem}>
                                        <Text style={styles.title}>{t('number_caps')}:{item.agri_user.contactNumber}</Text>
                                        <Text style={styles.title}>{t('date')}:{date.toString().substring(4, 15)}</Text>
                                        {item?.sanctioned_date && <Text style={styles.title}>{t('SanctionedDate')}:{sanctioned_date.toString().substring(7, 15)}</Text>}
                                        {item?.loan_ord_id && <Text style={styles.title}>{t('LoanOrderID')}:{item.loan_ord_id.substring(-1, 9)}</Text>}
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
        marginHorizontal: '2%',
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 6,
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
        width: '95%',
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