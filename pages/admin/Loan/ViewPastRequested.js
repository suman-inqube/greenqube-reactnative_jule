import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    Image, Dimensions, SafeAreaView, Keyboard
} from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import { useNavigation } from '@react-navigation/native';
import { loanRouteListAPI } from './LoanAPI';
import { userCreateContext } from '../../Context/usersCreateContext';
const ViewPastRequested = ({ setActiveBtn }) => {
    //GQR-67
    const { loginUser_data, LoadingScreen, t, Toast,
        AlertMesg, getItem, Root, effective_dates, DatePickerComp, Filter, handleFilter,
        farmerData } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    //GQR-67
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
    const [loanList, setLoanList] = useState([]);
    const [loanListRaw, setLoanListRaw] = useState([]);
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
    const [statusName, setStatusName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [selectedName, setSelectedName] = useState('');
    const [farmerID, setfarmerID] = useState();
    const [currency, setCurrencyt] = useState("");
    const [statusAll, setTtatusAll] = useState([
        { value: 2, "label": t('Approved') },
        { value: 1, "label": t('pending') },
        { value: 3, "label": t('Rejected') }]);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
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
        setFilterOption(false);
        setFilterName(value);
        setFilterItem(value);
        setSearchFarmerPhone('');
        setSearchFarmerName('');
        setStatusName('')
        setfromDate("");
        setToDate("");
        setLoanList(loanListRaw);
    }
    const handleDatePicker = (item) => {
        const effective_date = effective_dates(item);
        setfromDate(effective_date)
    }
    const handleDatePicker2 = (item) => {
        const effective_date = effective_dates(item);
        setToDate(effective_date)
    }
    const onPageLoad = async () => {
        setIsLoading(true);
        const [currency_res, response] = await Promise.all([
            getItem('currency'),
            loanRouteListAPI(dbname, lan_id, token, user_id, "", "", "")
        ])
        if (response?.status == 200) {
            if (response.data.data.rows.length != 0) {
                Promise.all([
                    setIsLoading(false),
                    setLoanList(response.data.data.rows),
                    setLoanListRaw(response.data.data.rows),
                    setCurrencyt(currency_res)
                ])
            } else {
                setIsLoading(false);
                Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] });
            }
        }
    }
    const handleFilterList = async (item) => {
        if (filterName === 'Farmer/Product Name' || filterName === 'PhoneNumber') {
            handleFilter(item, filterName, farmerData, loanListRaw, setSearchFarmerPhone, setSearchFarmerName, setSearchResultsList, loanList, setSearchResults);
        }
        // else if (filterName === 'PhoneNumber') {
        //     handleFilter(item, filterName, farmerData, loanListRaw, setSearchFarmerPhone, setSearchFarmerName, setSearchResultsList, loanList, setSearchResults);
        // }
        else if (filterName === 'statusFilter') {
            setSearchResultsList(true);
            setStatusName(search);
            const result = statusAll.filter(item => item.label.toLowerCase().includes(search.toLowerCase()));
            if (search == "") {
                setSearchResultsList(false);
                setLoanList(loanListRaw);
            } else {
                setSearchResultsList(true);
            }
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
            let tempData = loanListRaw.filter(item => { return item.status == currentfarmerId });
            setLoanList(tempData)
        } else if (name !== '') {
            let tempData = loanListRaw.filter(item => { return item.agri_user.userName.toLowerCase().indexOf(name.toLowerCase()) > -1 });
            setLoanList(tempData)
        } else {
            let tempData = loanListRaw.filter(item => { return item.agri_user.contactNumber.toLowerCase().indexOf(phone.toLowerCase()) > -1 });
            setLoanList(tempData)
        }
    }
    const filterfromAndToDate = () => {
        if (fromDate != "" && toDate != "") {
            let tempData = loanListRaw.filter(item => { return (item.created_at.slice(0, 10) >= fromDate && item.created_at.slice(0, 10) <= toDate) });
            setLoanList(tempData)
        }
    }
    const filterDataRemove = () => {
        setSearchFarmerPhone("");
        setSearchFarmerName("");
        setStatusName("");
        setFilterItem("");
        setFilterName("");
        setFilterOption(false);
        setLoanList(loanListRaw);
        setSearchResultsList(false);
    }
    useEffect(() => {
        filterfromAndToDate();
    }, [fromDate, toDate])
    useEffect(() => {
        onPageLoad();
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => { setKeyboardVisible(true); });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => { setKeyboardVisible(false); });
        return () => { keyboardDidHideListener.remove(); keyboardDidShowListener.remove() };
    }, [])
    const navigate = (LoanEnquiryDetail, item) => {
        navigation.navigate('LoanEnquiryDetail', item)
    }
    return (
        <Root>
            <SafeAreaView style={{ flex: 1 }}>
                <View>
                    {openFromDate && <DatePickerComp openDate={openFromDate} newDate={newFromDate} setOpenDate={setOpenFromDate} handleDatePicker={handleDatePicker} />}
                    {openToDate && <DatePickerComp openDate={openToDate} newDate={newToDate} setOpenDate={setOpenToDate} handleDatePicker={handleDatePicker2} minimumDate={fromDate == "" ? "" : new Date(`${new Date(fromDate).getFullYear()}-${new Date(fromDate).getMonth() + 1}-${new Date(fromDate).getDate() + 1}`)} />}
                    {
                        searchResultsList && searchResultsList ?
                            <View style={isKeyboardVisible ? styles.flatContainerLengthUp : styles.flatContainer}>
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
                            onChangeText={(item) => handleFilterList(item)}
                            FarmerProductNameValue={searchFarmerName}
                            FarmerProductPhoneValue={searchFarmerPhone}
                            statusNameValue={statusName}
                            filterDataRemove={filterDataRemove}
                            statusFilter={true}
                        />
                    }
                    <View>
                        {isLoading ?
                            <View style={styles.loadingScreen}><LoadingScreen /></View>
                            : ""}
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={loanList}
                            style={filterName !== "" ? { marginBottom: 130 } : { marginBottom: 90 }}
                            renderItem={({ item }) => {
                                // var date = new Date(item.agri_user.CreateDateTime.split("T")[0]);
                                var date = new Date(item.created_at.split("T")[0]);
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
                                            {item?.sanctioned_date && <Text style={styles.title}>{t('SanctionedDate')}:{sanctioned_date.toString().substring(3, 15)}</Text>}
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
        </Root>
    )
}

export default ViewPastRequested

const styles = StyleSheet.create({
    container: {
        marginBottom: 600
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
        top: '70%',
        // buttom: 200,
        right: 20,
        zIndex: 999
    },
    flatContainer: {
        backgroundColor: '#ffffff',
        position: 'absolute',
        zIndex: 999,
        // bottom: '100%',
        top: '10%',
        left: 0,
        marginHorizontal: '5%',
        width: '90%',
        elevation: 10,
        borderRadius: 10,
        padding: 10
    },
    flatContainerLengthUp: {
        backgroundColor: '#ffffff',
        position: 'absolute',
        zIndex: 999,
        // bottom: '100%',
        top: '15%',
        left: 0,
        marginHorizontal: '5%',
        width: '90%',
        elevation: 10,
        borderRadius: 10,
        padding: 10
    },
    flatlisttitle: {
        padding: 10,
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 13
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
        marginVertical: 2,
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    }
})