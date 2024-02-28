import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    Image, Dimensions, ScrollView, BackHandler, SafeAreaView
} from 'react-native'
import React, { useState, useEffect } from 'react'
import DatePickerComp from '../../Common/DatePickerComp';
import Filter from '../../Common/Filter';
import { useNavigation } from '@react-navigation/native';
// import { loanRouteListAPI } from '../../../config/apiHere';
import { getItem } from '../../../config/getDataFromStorage';
import LoadingScreen from '../../Common/LoadingScreen';
import { loanRouteFarmerListAPI, loanRouteListAPI } from './LoanAPI';
const ViewPastRequested = ({ setActiveBtn }) => {
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
    const [farmerData, setfarmerData] = useState();
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
    }
    const handleDatePicker2 = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setToDate(effective_date)
    }
    const onPageLoad = async () => {
        // requestLivePermission();
        setIsLoading(true);
        const loginUser_data = await getItem('loginUser_data');
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
            // const farmerByName = await loanRouteFarmerListAPI(dbName, languageID, token, userID)
            if (farmerByName) {
                const dataArray = [];
                farmerByName.data.data.rows.forEach(element => {
                    dataArray.push({
                        value: element.user_id,
                        label: element.userName,
                        phone: element.contactNumber,
                    });
                });
                setfarmerData(dataArray)
            }
        }
    };
    const handleFilter = async (search) => {
        setfromDate("");
        setToDate("");
        if (filterName === 'Farmer/Product Name') {
            setSearchFarmerPhone('');
            setSearchFarmerName(search);
            const result = farmerData.filter(item =>
                item.label.toLowerCase().includes(search.toLowerCase())
            );
            if (search == "") {
                setSearchResultsList(false);
                setLoanList(loanListRaw)
            } else {
                let tempData = loanList.filter(item => {
                    return item.agri_user.userName.toLowerCase().indexOf(search.toLowerCase()) > -1;;
                });
                setLoanList(tempData)
                // setData(tempData);
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
                setLoanList(loanListRaw)
            } else {
                let tempData = loanList.filter(item => {
                    return item.agri_user.contactNumber.toLowerCase().indexOf(search.toLowerCase()) > -1;;
                });
                setLoanList(tempData)
                // setData(tempData);
                setSearchResultsList(true);
            }
            if (result) {
                setSearchResults(result);
            }
        }

        // const onSearch = search => {
        //     if (search !== '') {
        //   let tempData = data.filter(item => {
        //     return item.country.toLowerCase().indexOf(search.toLowerCase()) > -1;
        //   });
        //       setData(tempData);
        //     } else {
        //       setData(countries);
        //     }
        //   };
    }
    const handleResultSelect = async (name, currentfarmerId, phone) => {
        setSearchResultsList(false);
        setSearchFarmerPhone(phone)
        setSelectedName(name);
        setSearchFarmerName(name);
        setSearchResults([]);
        setfarmerID(currentfarmerId)
        if (name !== '') {
            let tempData = loanList.filter(item => {
                return item.agri_user.userName.toLowerCase().indexOf(name.toLowerCase()) > -1;;
            });
            setLoanList(tempData)
        } else {
            let tempData = loanList.filter(item => {
                return item.agri_user.contactNumber.toLowerCase().indexOf(phone.toLowerCase()) > -1;;
            });
            setLoanList(tempData)
        }
    }

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
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View>
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
                />

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
                    />
                }
                <View>
                    {isLoading ?
                        <View style={styles.loadingScreen}><LoadingScreen /></View>
                        : ""}
                    <FlatList
                        data={loanList}
                        style={filterName !== "" ? { marginBottom: 130 } : { marginBottom: 100 }}
                        renderItem={({ item }) => {
                            var mydate = new Date(item.agri_user.CreateDateTime.split("T")[0]);
                            return (
                                <TouchableOpacity style={styles.flatListContainer} onPress={() => navigation.navigate('LoanEnquiryDetail', item)}>
                                    <View style={styles.flatListItem}>
                                        <Text style={styles.title}>Loan Amt.(Rs):{item.loan_amount.substring(-1, 5)}...</Text>
                                        <Text style={styles.title}>Name:{item.agri_user.userName}</Text>
                                    </View>
                                    <View style={styles.flatListItem}>
                                        <Text style={styles.title}>Date :{mydate.toString().substring(4, 15)}</Text>
                                        <Text style={styles.title}>Number :{item.agri_user.contactNumber}</Text>
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

export default ViewPastRequested

const styles = StyleSheet.create({
    container: {
        marginBottom: 600
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
    loadingScreen: {
        position: 'relative',
        top: 100
    },
    title: {
        color: '#000',
        fontSize: 12,
        marginVertical: 3
    }

})