import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Dimensions, SafeAreaView } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import Filter from '../../Common/FarmerFilter';
import { useNavigation } from '@react-navigation/native';
import LoadingScreen from '../../Common/LoadingScreen';
import { loanRouteListAPI } from './FarmerLoanAPI';
import { userCreateContext } from '../../Context/usersCreateContext';
const FarmerViewPastRequested = ({ setActiveBtn }) => {
    //GQR-67
    const { loginUser_data, DatePickerComp, t, getItem, effective_dates } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id, owner } = loginUser_data;
    //GQR-67
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
        { value: 2, "label": t('Approved') },
        { value: 1, "label": t('pending') },
        { value: 3, "label": t('Rejected') }]);
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
        const effective_date = effective_dates(item);
        setfromDate(effective_date)
        setToDate("")
    }
    const handleDatePicker2 = async (item) => {
        const effective_date = effective_dates(item);
        setToDate(effective_date)
        const response = await loanRouteListAPI(dbname, lan_id, token, user_id, fromDate, effective_date, "")
        if (response) {
            setIsLoading(false);
            setLoanList(response?.data?.data?.rows);
            setLoanListRaw(response?.data?.data?.rows)
        }
    }
    const onPageLoad = async () => {
        setIsLoading(true);
        const curr = await await getItem('currency');
        setcurrency(curr);
        const response = await loanRouteListAPI(dbname, lan_id, token, user_id, "", "", "");
        if (response?.status == 200) {
            setLoanList(response?.data?.data?.rows);
            setLoanListRaw(response?.data?.data?.rows)
        }
        setIsLoading(false);
    };
    const filterfromAndToDate = () => {
        if (fromDate != "" && toDate != "") {
            let tempData = loanList.filter(item => {
                return (item.created_at.slice(0, 10) >= fromDate && item.created_at.slice(0, 10) <= toDate);
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
        const response = await loanRouteListAPI(dbname, lan_id, token, user_id, "", "", "")
        if (response?.status == 200) {
            setIsLoading(false);
            setLoanList(response?.data?.data?.rows);
            setLoanListRaw(response?.data?.data?.rows);
        }
    }
    const navigate = (FarmerLoanEnquiryDetail, item) => {
        navigation.navigate('FarmerLoanEnquiryDetail', item)
    }
    const handleFilter = async (search) => {
        if (filterName === 'statusFilter') {
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
            let tempData = loanListRaw.filter(item => {
                return item.status == currentfarmerId;
            });
            setLoanList(tempData)
        }
    }
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <DatePickerComp openDate={openFromDate} newDate={newFromDate} setOpenDate={setOpenFromDate} handleDatePicker={handleDatePicker} />
                <DatePickerComp openDate={openToDate} newDate={newToDate} setOpenDate={setOpenToDate} handleDatePicker={handleDatePicker2} minimumDate={fromDate == "" ? "" : new Date(`${new Date(fromDate).getFullYear()}-${new Date(fromDate).getMonth() + 1}-${new Date(fromDate).getDate() + 1}`)} />
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
                        renderItem={({ item, index }) => {
                            var date = new Date(item.created_at.split("T")[0]);
                            var sanctioned_date = new Date(item.sanctioned_date);
                            return (
                                <TouchableOpacity style={styles.flatListContainer} onPress={() => navigate('LoanEnquiryDetail', item)}>
                                    <View style={styles.flatListItem}>
                                        <Text style={styles.title}>{t('name')}:{item.agri_user.userName}</Text>
                                        <Text style={styles.title}>{t('loan_amt') + `(${currency})`}:{'\n' + item.loan_amount}</Text>
                                        <Text style={styles.title}>{t('sta_')}:{item.status == 1 && t('pending')}{item.status == 2 && t('Approved')}{item.status == 3 && t('Rejected')} </Text>
                                        {item?.loan_sanctioned && <Text style={styles.title}>{t('LoanSanctioned') + `(${currency})`}:{'\n' + item.loan_sanctioned}</Text>}
                                    </View>
                                    <View style={styles.flatListItem}>
                                        <Text style={styles.title}>{t('number_caps')}:{item.agri_user.contactNumber}</Text>
                                        <Text style={styles.title}>{t('date')}:{date.toString().substring(4, 15)}</Text>
                                        {item?.sanctioned_date && <Text style={styles.title}>{t('SanctionedDate')}:{'\n' + sanctioned_date.toString().substring(3, 15)}</Text>}
                                        {item?.loan_ord_id && <Text style={styles.title}>{t('LoanOrderID')}:{item.loan_ord_id}</Text>}
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
        top: 230,
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