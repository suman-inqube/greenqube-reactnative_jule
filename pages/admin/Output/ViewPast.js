import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ScrollView, SafeAreaView, Dimensions } from 'react-native'
import DatePickerComp from '../../Common/DatePickerComp';
import Filter from '../../Common/Filter';
import ViewModalPast from './ViewModalPast';
import React, { useState, useEffect } from 'react'
import { getItem, setItem } from '../../../config/getDataFromStorage';
import { farmerByNameAPI, outputListAPI, SupervisoroutputEnquiryViewAPI } from '../../../config/apiHere';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import LoadingScreen from '../../Common/LoadingScreen';
import MessageDialog from '../../Common/MessageDialog';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import { useRoute, useFocusEffect, useNavigation, useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
const ViewPast = (props) => {
    const route = useRoute();
    const { t } = useTranslation();
    const isFocused = useIsFocused();
    const [farmerData, setFarmerData] = useState([]);
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
        setOutputListAll(outputListAllRaw)
        setSearchFarmerPhone('');
        setSearchFarmerName('');
        setfromDate('');
        setToDate('');
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
            if (outputList.status === 200) {
                if (outputList.data.data.rows.length === 0) {
                    Toast.show({ text: 'No Data Found. ', ...AlertMesg[0] });
                }
                setOutputListAll(outputList.data.data.rows)
                setItem("output_data", outputList.data.data.rows)
            }
        }
        else {
            MessageDialog({ title: 'Require', message: 'Please Select First data.' })
        }
    }
    const navigateToPages = async (fid, dbname, lan_id, token, user_id) => {
        // const outputFound = outputListAll.find(user => user.fid === fid);
        const output_data = await getItem('output_data')
        const outputFound = output_data.find(user => user.fid === fid);
        setIsLoading(false)
        setOutputSingle(outputFound);
        const response = await SupervisoroutputEnquiryViewAPI(dbname, lan_id, token, user_id, fid)
        if (response) {
            setPastEnquiryView(response.data.data)
        }
        setModalVisible(true)
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
                // let tempData = outputListAll.filter(item => {
                //     return item.users.userName.toLowerCase().indexOf(search.toLowerCase()) > -1;;
                // });
                // if(tempData.length===0){
                //     Toast.show({ text: 'No Data Found. ', ...AlertMesg[0] })
                // }
                // setOutputListAll(tempData)
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
                // let tempData = outputListAll.filter(item => {
                //     return item.users.contactNumber.toLowerCase().indexOf(search.toLowerCase()) > -1;;
                // });
                // if(tempData.length===0){
                //     Toast.show({ text: 'No Data Found. ', ...AlertMesg[0] })
                // }
                // setOutputListAll(tempData)
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
                return item.users.userName.toLowerCase().indexOf(name.toLowerCase()) > -1;
            });
            setOutputListAll(tempData);
            if (tempData.length === 0) {
                Toast.show({ text: 'No Data Found. ', ...AlertMesg[0] });
            }
        } else {
            let tempData = outputListAll.filter(item => {
                return item.users.contactNumber.toLowerCase().indexOf(phone.toLowerCase()) > -1;
            });
            setOutputListAll(tempData);
            if (tempData.length === 0) {
                Toast.show({ text: 'No Data Found. ', ...AlertMesg[0] });
            }
        }
    }
    const onPageLoad = async () => {
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
            const [outputList, farmerByName] = await Promise.all([
                outputListAPI(dbname, lan_id, token, user_id),
                farmerByNameAPI(dbname, lan_id, token, user_id)
            ]);
            if (outputList) {
                //getid
                // console.log(outputList.data.data.rows[0].id)
                setOutputListAll(outputList.data.data.rows);
                setOutputListRaw(outputList.data.data.rows);
                setItem("output_data", outputList.data.data.rows);
                if (route.params.io_oid != undefined) {
                    navigateToPages(route.params.io_oid, dbname, lan_id, token, user_id)
                }

            }
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
            setIsLoading(false);
        }
    };
    const filterDataRemove = () => {
        setSearchFarmerPhone("");
        setSearchFarmerName("");
        setFilterItem("");
        setFilterOption(false);
        setOutputListAll(outputListAllRaw)
        setSearchResultsList(false);
    }
    useEffect(() => {
        if (isFocused) {
            setFilterName("");
            setFilterItem("");
            setFilterOption(false);
            onPageLoad();
            // if (route.params.io_oid != undefined) {
            //     pushNotification_popup(route.params.io_oid)
            // } else {
            //     onPageLoad();
            // }
        }
    }, [isFocused]);
    const pushNotification_popup = async (fid) => {
        const [
            // outputList,
            supervisoroutputEnquiryViewAPI_res] = await Promise.all([
                // outputListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId),
                SupervisoroutputEnquiryViewAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, fid)
            ]);
        // if (outputList) {
        // setOutputListAll(outputList.data.data.rows);
        // setOutputListRaw(outputList.data.data.rows);
        // setItem("output_data", outputList.data.data.rows);
        // const outputFound = outputList.find(user => user.fid === fid);
        // setIsLoading(false)
        // setOutputSingle(outputFound);
        console.log(supervisoroutputEnquiryViewAPI_res.data)
        // if (supervisoroutputEnquiryViewAPI_res) {
        //     setPastEnquiryView(supervisoroutputEnquiryViewAPI_res.data.data)
        // }
        setModalVisible(true)
        // setTimeout(() => {
        //     if (route.params != undefined) {
        //         console.log(route.params.io_oid)
        //         navigateToPages(route.params.io_oid)
        //     }
        // }, 2000);
        // }
    }
    return (
        <>
            <View>
                {isLoading ?
                    <View style={styles.loadingScreen}><LoadingScreen /></View>
                    :
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
                            minimumDate={fromDate == "" ? "" : new Date(`${new Date(fromDate).getFullYear()}-${new Date(fromDate).getMonth() + 1}-${new Date(fromDate).getDate() + 1}`)}
                        />
                        <ViewModalPast setModalVisible={setModalVisible} modalVisible={modalVisible} outputSingle={outputSingle}
                            pastEnquiryView={pastEnquiryView}
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                        />
                        <TouchableOpacity style={styles.plusIcon} onPress={() => props.sendDataToParent(1)}>
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
                            FarmerProductNameValue={searchFarmerName}
                            FarmerProductPhoneValue={searchFarmerPhone}
                            filterDataRemove={filterDataRemove}
                        />
                        <SafeAreaView>
                            {
                                searchResultsList && searchResultsList ?
                                    <View style={styles.flatContainer}>
                                        <FlatList
                                            style={searchResults.length > 8 ? styles.flatlistHeight : ""}
                                            data={searchResults}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity onPress={() => handleResultSelect(item.label, item.phone)} style={styles.flatlistitemSearch}>
                                                    <Text style={styles.flatlisttitle}>{filterName == "PhoneNumber" ? item.phone : item.label}</Text>
                                                </TouchableOpacity>
                                            )}
                                            keyExtractor={(item, index) => index}
                                        />
                                    </View> : ""
                            }
                        </SafeAreaView>
                        <View style={{ paddingBottom: 40, height: '82%' }}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                style={{ marginBottom: filterItem != "" ? 50 : 0 }}
                                data={outputListAll}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity style={[styles.flatListContainer, { marginBottom: outputListAll.length == index + 1 ? 80 : 10 }]} onPress={() => navigateToPages(item.fid, dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId)} key={index}>
                                        <View style={styles.flatListItem}>
                                            <Text style={styles.title}>{t('crop_name')}: {item.io_crop_name && item.io_crop_name.name.substring(0, 5)}{item.io_crop_name && item.io_crop_name.name.length > 6 ? '...' : null}</Text>
                                            <Text style={styles.title}>{t('name')} : {item.users.userName.substring(0, 10)}{item.users.userName.length > 10 ? '...' : null}</Text>
                                        </View>
                                        <View style={styles.flatListItem}>
                                            {item.io_crop_variety &&
                                                <Text style={styles.title}>{t('ist_variety')}:{item.io_crop_variety && item.io_crop_variety.name.substring(0, 10)}{item.io_crop_variety && item.io_crop_variety.name.length > 14 ? '...' : null}</Text>
                                            }
                                            <Text style={styles.title}>{t('date')} : {formatDateToMMDDYYYY(item.date)}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                                }
                                keyExtractor={item => item.id}
                            />
                        </View>
                    </View>
                }
            </View>
        </>
    )
}
export default ViewPast

const styles = StyleSheet.create({
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
    flatlistitemSearch: {
        marginBottom: 10
    },
    plusIcon: {
        width: 50,
        height: 50,
        position: 'absolute',
        top: '50%',
        right: 20,
        zIndex: 999,
        elevation: 5
    },
    flatContainer: {
        backgroundColor: '#ffffff',
        position: 'absolute',
        zIndex: 999,
        bottom: 60,
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
        color: '#000000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    },
    loadingScreen: {
        position: 'relative',
        top: 100
    },
})