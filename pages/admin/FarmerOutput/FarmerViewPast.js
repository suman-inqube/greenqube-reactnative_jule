import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ScrollView, SafeAreaView, Dimensions } from 'react-native'
import DatePickerComp from '../../Common/DatePickerComp';
import Filter from '../../Common/FarmerFilter';
import ViewModalPast from './FarmerViewModalPast';
import React, { useState, useEffect } from 'react'
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import { FarmeroutputListAPI, outputEnquiryViewAPI } from '../../../config/apiHere';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import LoadingScreen from '../../Common/LoadingScreen';
import MessageDialog from '../../Common/MessageDialog';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import { useTranslation } from 'react-i18next';
const FarmerViewPast = () => {
    const route = useRoute();
    const { t } = useTranslation();
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
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: "",
        languageId: "",
        token: "",
        supervisorId: ""
    });
    const [outputListAll, setOutputListAll] = useState([]);
    const [outputListAllRaw, setOutputListRaw] = useState([]);
    const [outputSingle, setOutputSingle] = useState();
    const [pastEnquiryView, setPastEnquiryView] = useState([]);
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
        setFromDateFilter(effective_date)
        setToDate("")
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
            const outputList = await FarmeroutputListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, fromDate, toDate);
            if (outputList) {
                setOutputListAll(outputList.data.data.rows)
                setItem("output_data", outputList.data.data.rows)
            }
        }
        else {
            MessageDialog({ title: 'Require', message: 'Please Select First data.' })
        }
    }
    const navigateToPages = async (fid, dbname, lan_id, token, user_id) => {
        // setIsLoading(true)
        const output_data = await getItem('output_data');
        const outputFound = output_data.find(user => user.fid === fid);
        await setItem('output_single_data', outputFound)
        setOutputSingle(outputFound);
        setModalVisible(true)
        const response = await outputEnquiryViewAPI(dbname, lan_id, token, user_id, fid)
        // setIsLoading(false)
        if (response) {
            setPastEnquiryView(response.data.data)
        }
    };

    const handleFilter = async (search) => {
        if (filterName === 'Farmer/Product Name') {
            setSearchFarmerPhone('');
            setSearchFarmerName(search);
            const result = farmerData.filter(item =>
                item.label.toLowerCase().includes(search.toLowerCase())
            );
            if (search == "") {
                setSearchResultsList(false);
                setOutputListAll(outputListAllRaw)
            } else {
                let tempData = outputListAll.filter(item => {
                    return item.users.userName.toLowerCase().indexOf(search.toLowerCase()) > -1;;
                });
                setOutputListAll(tempData)
                setSearchResultsList(true);
            }
            if (result) {
                setSearchResults(result);
            }
        } else if (filterName === 'PhoneNumber') {
            // console.log(search);
            setSearchFarmerName('');
            setSearchFarmerPhone(search);
            const result = farmerData.filter(item =>
                item.phone.toLowerCase().includes(search.toLowerCase())
            );
            if (search == "") {
                setSearchResultsList(false);
                setOutputListAll(outputListAllRaw)
            } else {
                let tempData = outputListAll.filter(item => {
                    return item.users.contactNumber.toLowerCase().indexOf(search.toLowerCase()) > -1;;
                });
                setOutputListAll(tempData)
                // setData(tempData);
                setSearchResultsList(true);
            }
            if (result) {
                setSearchResults(result);
            }
        }
    }

    const handleResultSelect = async (name, phone) => {
        setSearchResultsList(false);
        setSearchFarmerPhone(phone)
        setSearchFarmerName(name);
        setSearchResults([]);
        if (name !== '') {
            let tempData = outputListAll.filter(item => {
                return item.users.userName.toLowerCase().indexOf(name.toLowerCase()) > -1;;
            });
            setOutputListAll(tempData)
        } else {
            let tempData = outputListAll.filter(item => {
                return item.users.contactNumber.toLowerCase().indexOf(phone.toLowerCase()) > -1;;
            });
            setOutputListAll(tempData)
        }
    }

    const onPageLoad = async () => {
        // console.log("nice");
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const { dbname, lan_id, token, user_id } = loginUser_data;
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbname,
                languageId: lan_id,
                token: token,
                supervisorId: user_id
            });
            const outputList = await FarmeroutputListAPI(dbname, lan_id, token, user_id, fromDate, toDate);
            //   console.log(JSON.stringify(outputList, null, 2));
            if (outputList) {
                setOutputListAll(outputList.data.data.rows);
                setOutputListRaw(outputList.data.data.rows);
                setItem("output_data", outputList.data.data.rows);
                if (route.params != undefined) {
                    navigateToPages(route.params.io_oid, dbname, lan_id, token, user_id)
                }
            }
            setIsLoading(false);
        }
    };
    const filterDataRemove = async () => {
        setFilterItem("");
        setFilterOption(false);
        setToDate("");
        setfromDate("");
        const outputList = await FarmeroutputListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, "", "");
        if (outputList) {
            setOutputListAll(outputList.data.data.rows)
            setOutputListRaw(outputList.data.data.rows)
            setItem("output_data", outputList.data.data.rows)
        }
        setIsLoading(false)
    }

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
                <View style={styles.loadingScreen}><LoadingScreen /></View>
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
                        pastEnquiryView={pastEnquiryView}
                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
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
                        filterDataRemove={filterDataRemove}
                        onlyDate={true}
                    />
                    <View style={{ paddingBottom: 8, height: '80%' }}>
                        <FlatList
                            data={outputListAll}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }) => {
                                return (
                                    <TouchableOpacity style={styles.flatListContainer} onPress={() => navigateToPages(item.fid, dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId)} key={index}>
                                        <View style={styles.flatListItem}>
                                            <Text style={styles.title}>{t('crop_name')}: {item.io_crop_name && item.io_crop_name.name.substring(0, 5)}{item.io_crop_name && item.io_crop_name.name.length > 6 ? '...' : null}</Text>
                                            <Text style={styles.title}>{t('name')} : {item.users.userName.substring(0, 10)}{item.users.userName.length > 10 ? '...' : null}</Text>
                                        </View>
                                        <View style={styles.flatListItem}>
                                            {item.io_crop_variety &&
                                                <Text style={styles.title}>{t('ist_variety')}:{item.io_crop_variety && item.io_crop_variety.name.substring(0, 14)}{item.io_crop_variety && item.io_crop_variety.name.length > 14 ? '...' : null}</Text>
                                            }
                                            <Text style={styles.title}>{t('date')} : {formatDateToMMDDYYYY(item.date)}</Text>
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
export default FarmerViewPast

const styles = StyleSheet.create({
    flatListContainer: {
        marginHorizontal: '2.5%',
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
    title: {
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    },
    loadingScreen: {
        position: 'absolute',
        top: 130,
        zIndex: 999,
        left: '45%'
    },
})