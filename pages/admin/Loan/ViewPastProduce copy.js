import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    Image, Dimensions, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native'
import React, { useState, useEffect } from 'react'
import DatePickerComp from '../../Common/DatePickerComp';
import Filter from '../../Common/Filter';
import { useNavigation } from '@react-navigation/native';
import { loanRouteListAPI } from '../../../config/apiHere';
import { getItem } from '../../../config/getDataFromStorage';
import {
    farmerByNameAPI,
    activityTypeAPI,
    plotAgainstFarmerAPI,
    userDataListAPI,
} from '../../../config/apiHere';
const ViewPastRequested = () => {
    const navigation = useNavigation();
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
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [selectedName, setSelectedName] = useState('');
    const [farmerID, setfarmerID] = useState();
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

            const response = await loanRouteListAPI(dbName, languageID, token, userID, "", "", "")
            if (response) {
                setLoanList(response.data.data.rows)
            }
            const farmerByName = await userDataListAPI(dbName, languageID, token, userID)
            // const farmerByName = await farmerByNameAPI(dbName, languageID, token, userID)
            // userDataListAPI
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
        setSearchFarmerName(search);
        setSearchFarmerPhone('');
        
        if (filterName === 'Farmer/Product Name') {
            const result = farmerData.filter(item =>
                item.label.toLowerCase().includes(search.toLowerCase())
            );
            if (search == "") {
                setSearchResultsList(false);
            } else {
                let tempData = loanList.filter(item => {
                    return item.agri_user.userName.toLowerCase().indexOf(search.toLowerCase()) > -1;;
                });
                console.log(tempData)
                setLoanList(tempData)
                setSearchResultsList(true);
            }
            if (result) {
                setSearchResults(result);
            }
            // const response = await loanRouteListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, dbLanTokUsr.userID, '', '', '')
            // if (response) {
            //     setLoanList(response.data.data.rows)
            // }
        } else if (filterName === 'PhoneNumber') {

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
        // const response = await plotAgainstFarmerAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, currentfarmerId)
        // if (response) {

        //     // const dataArray = [];
        //     // response.data.data.forEach(element => {
        //     //     dataArray.push({
        //     //         value: element.rel_id,
        //     //         label: element.plot_no
        //     //     });
        //     // });
        //     // setplotAll(dataArray)
        //     // const activityType_res = await activityTypeAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, currentfarmerId)
        //     // if (activityType_res) {

        //     //     // console.warn("activity:",activityType_res.data.data);
        //     //     const dataArray = [];
        //     //     activityType_res.data.data.rows.forEach(element => {
        //     //         dataArray.push({
        //     //             value: element.categoryId,
        //     //             label: element.categoryName
        //     //         });
        //     //     });
        //     //     setactivityTypeAll(dataArray)
        //     // }

        // }
        if (name !== '') {
            let tempData = loanList.filter(item => {
                // return item.country.toLowerCase().indexOf(search.toLowerCase()) > -1;
                return item.agri_user.userName.toLowerCase().indexOf(name.toLowerCase()) > -1;;
            });
            setLoanList(tempData)
            // setData(tempData);
        } else {
            // setData(countries);
        }
    }
    useEffect(() => {
        onPageLoad();
    }, [])
    return (
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
            {/* <View style={{
                backgroundColor: '#ffffff',
                position: 'absolute',
                zIndex: 999,
                bottom: '100%',
                left: 0,
                marginHorizontal: '5%',
                width: '90%',
                elevation: 10,
                borderRadius: 10,
                padding: 10,
            }}>
                <Text style={{ fontSize: 25 }}>dgfdg</Text>
                <Text style={{ fontSize: 25 }}>dgfdg</Text>
                <Text style={{ fontSize: 25 }}>dgfdg</Text>
                <Text style={{ fontSize: 25 }}>dgfdg</Text>
                <Text style={{ fontSize: 25 }}>dgfdg</Text>
                <Text style={{ fontSize: 25 }}>dgfdg</Text>
            </View> */}
            {
                searchResultsList && searchResultsList ?
                    <View style={styles.flatContainer}>{
                        searchResults.map((item, index) => {
                            return (
                                <TouchableOpacity onPress={() => handleResultSelect(item.label, item.value, item.phone)} style={styles.flatlistitem} key={index}>
                                    <Text style={styles.flatlisttitle}>{item.label}</Text>
                                </TouchableOpacity>
                            )

                        })}</View> : ""

            }

            <TouchableOpacity style={styles.plusIcon}>
                <Image source={require('../../Common/images/plus.png')} style={{ width: 50, height: 50 }} />
            </TouchableOpacity>

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
            />
            <View>
                <ScrollView>
                    <View style={styles.container}>
                        {
                            loanList.map((data, index) => {
                                return (
                                    <TouchableOpacity style={styles.flatListContainer} key={index} onPress={() => navigation.navigate('LoanEnquiryDetail')}>
                                        <View style={styles.flatListItem}>
                                            <Text>Loan Amt.(Rs):{data.loan_amount.substring(-1, 4)}...</Text>
                                            <Text>Name:{data.agri_user.userName}</Text>
                                        </View>
                                        <View style={styles.flatListItem}>
                                            <Text>Date:{data.agri_user.CreateDateTime}</Text>
                                            <Text>Number :{data.agri_user.contactNumber}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

export default ViewPastRequested

const styles = StyleSheet.create({
    container: {
        marginBottom: 500
    },
    flatListContainer: {
        marginHorizontal: '5%',
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
        padding: 10,
    },
    flatlisttitle: {
        padding: 10,
        color: '#000'
    }

})