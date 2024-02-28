import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ScrollView, SafeAreaView, Dimensions } from 'react-native'
import DatePickerComp from '../../Common/DatePickerComp';
import FilterSearch from '../../Common/FilterSearch';
import ViewModalPast from './ViewModalPast';
import React, { useState, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import { farmerByNameAPI, outputListAPI } from '../../../config/apiHere';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import LoadingScreen from '../../Common/LoadingScreen';
import MessageDialog from '../../Common/MessageDialog';


const ViewPast = () => {
    const [farmerData, setFarmerData] = useState();
    const [searchResults, setSearchResults] = useState([]);
    const [filterOption, setFilterOption] = useState(false);
    const [filterItem, setFilterItem] = useState("");
    const [filterName, setFilterName] = useState("");
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [newToDate, setnewToDate] = useState(new Date());
    const [openFromDate, setOpenFromDate] = useState(false);
    const [openToDate, setOpenToDate] = useState(false);
    const [fromDate, setfromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [fromDateFilter, setFromDateFilter] = useState('');
    const [searchResultsList, setSearchResultsList] = useState(false);

    // sahitya
    const [isLoading, setIsLoading] = useState(true);
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: "",
        languageId: "",
        token: "",
        supervisorId: ""
    });
    const [outputListAll, setOutputListAll] = useState([]);
    const [outputSingle, setOutputSingle] = useState();
    const filterOptionShow = () => {
        if (!filterOption) {
            setFilterOption(true);
        } else {
            setFilterOption(false);
        }
    }
    const onchangeFilterItem = (value) => {
        // console.warn(value);
        // return;
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
        setFromDateFilter(effective_date)
    }
    const handleDatePicker2 = async (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setToDate(effective_date)
        if (fromDateFilter) {
            let farmer_id = "";
            let fromDate = fromDateFilter;
            let toDate = effective_date;
            let mobileNo = "";
            const outputList = await outputListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, farmer_id, fromDate, toDate, mobileNo);
            if (outputList) {
                setOutputListAll(outputList.data.data.rows)
                setItem("output_data", outputList.data.data.rows)
            }
        }
        else {
            MessageDialog({ title: 'Require', message: 'Please Select First data.' })
        }



    }

    const navigateToPages = async (fid) => {
        setIsLoading(true)
        const outputFound = outputListAll.find(user => user.fid === fid);
        // return console.log(outputFound);
        await setItem('output_single_data', outputFound)
        setIsLoading(false)
        setOutputSingle(outputFound);
        setModalVisible(true)
    };

    const handleSearch = (text) => {

        const result = farmerData.filter(item =>
            item.label.toLowerCase().includes(text.toLowerCase())
        );
        if (result) {
            // console.log(result);
            setSearchResults(result);
        }
    };

    const handleFilter = async (item) => {

        if (filterItem === 'date') {
            return;
        }

        else if (filterItem === 'PhoneNumber') {
            let farmer_id = "";
            let fromDate = "";
            let toDate = "";
            let mobileNo = item;
            const outputList = await outputListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, farmer_id, fromDate, toDate, mobileNo);
            if (outputList) {
                setOutputListAll(outputList.data.data.rows)
                setItem("output_data", outputList.data.data.rows)
            }
        }

        else {
            handleSearch(item, 'farmer_id');
            setSearchResultsList(true)
        }
    }

    const handleResultSelect = async (farmerId) => {
        console.log(farmerId);
        setSearchResults([]);
        let farmer_id = farmerId;
        let fromDate = "";
        let toDate = "";
        let mobileNo = "";
        const outputList = await outputListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, farmer_id, fromDate, toDate, mobileNo);
        // console.log(JSON.stringify(farmer_id, null, 2));
        // return console.log(JSON.stringify(outputList.data.data.rows, null, 2));
        if (outputList) {
            setOutputListAll(outputList.data.data.rows)
            setItem("output_data", outputList.data.data.rows)
        }
    }

    const onPageLoad = async () => {
        // console.log("nice");
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageId = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const supervisorId = loginUser_data.user_id;

            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageId: languageId,
                token: token,
                supervisorId: supervisorId
            });

            const outputList = await outputListAPI(dbName, languageId, token, supervisorId);
            if (outputList) {
                setOutputListAll(outputList.data.data.rows)
                setItem("output_data", outputList.data.data.rows)
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

            setIsLoading(false)
        }
    };


    useEffect(() => {
        onPageLoad();

    }, []);


    useFocusEffect(
        React.useCallback(() => {
            onPageLoad();

        }, [])
    );

    return (

        <View>
            {isLoading ?
                <LoadingScreen />
                :
                <View style={{ marginBottom: 50 }}>
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
                    <ViewModalPast setModalVisible={setModalVisible} modalVisible={modalVisible} outputSingle={outputSingle}
                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    />
                    <TouchableOpacity style={styles.plusIcon}>
                        <Image source={require('../../Common/images/plus.png')} style={{ width: 50, height: 50 }} />
                    </TouchableOpacity>

                    <FilterSearch
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


                    <View style={{ paddingBottom: 60, height: '80%' }}>
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
                        <FlatList
                            data={outputListAll}
                            renderItem={({ item, index }) => {
                                return (
                                    <TouchableOpacity style={styles.flatListContainer} onPress={() => navigateToPages(item.fid)} key={index}>
                                        <View style={styles.flatListItem}>

                                            <Text>Produce Name: {item.others ? item.others : item.io_crop_name && item.io_crop_name.name}</Text>
                                            <Text>Name : {item.users.userName}</Text>
                                        </View>
                                        <View style={styles.flatListItem}>
                                            {item.others ? '' :
                                                <Text>Produce Variety/Name...</Text>
                                            }
                                            <Text>Date : {formatDateToMMDDYYYY(item.date)}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                            keyExtractor={item => item.id}
                        />
                    </View>
                </View>
            }
        </View>
    )
}
export default ViewPast

const styles = StyleSheet.create({
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
        top: '40%',
        right: 20,
        zIndex: 999,
        elevation: 5
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
})