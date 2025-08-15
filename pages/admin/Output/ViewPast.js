import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native'
import ViewModalPast from './ViewModalPast';
import React, { useState, useEffect, useContext } from 'react'
import { outputListAPI, SupervisoroutputEnquiryViewAPI } from '../../../config/apiHere';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import MessageDialog from '../../Common/MessageDialog';
import { useRoute, useIsFocused } from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
import { Colors, Fonts } from '../../utils/Constants';
const ViewPast = (props) => {
    //GQR-67
    const { loginUser_data, t, AlertMesg, LoadingScreen, Filter, setItem, effective_dates, DatePickerComp, Toast, getItem, farmerData } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    //GQR-67
    const route = useRoute();
    const isFocused = useIsFocused();
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
    const [outputListAll, setOutputListAll] = useState([]);
    const [outputListAllRaw, setOutputListRaw] = useState([]);
    const [outputSingle, setOutputSingle] = useState();
    const [pastEnquiryView, setPastEnquiryView] = useState([]);
    const [result, setresult] = useState({ qty: '', total: '' });
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
        const effective_date = effective_dates(item);
        setfromDate(effective_date)
        setFromDateFilter(effective_date)
    }
    const handleDatePicker2 = async (item) => {
        const effective_date = effective_dates(item);
        setToDate(effective_date)
        if (fromDateFilter) {
            let farmer_id = "";
            let fromDate = fromDateFilter;
            let toDate = effective_date;
            let mobileNo = "";
            const outputList = await outputListAPI(dbname, lan_id, token, user_id, farmer_id, fromDate, toDate, mobileNo);
            if (outputList.status === 200) {
                if (outputList.data.data.rows.length === 0) {
                    Toast.show({ text: t('no_data_found'), ...AlertMesg[0] });
                }
                setOutputListAll(outputList.data.data.rows)
                setItem("output_data", outputList.data.data.rows)
            }
        }
        else {
            // MessageDialog({ title: 'Require', message: 'Please Select First data.' })
            Toast.show({ text: 'Please Select First data.', ...AlertMesg[0] });

        }
    }
    const navigateToPages = async (fid, dbname, lan_id, token, user_id) => {
        const output_data = await getItem('output_data')
        const outputFound = output_data.find(user => user.fid === fid);
        setIsLoading(false)
        setOutputSingle(outputFound);
        const response = await SupervisoroutputEnquiryViewAPI(dbname, lan_id, token, user_id, fid)
        if (response?.status == 200) {
            setPastEnquiryView(response?.data?.data);
            var qty = 0;
            var total = 0;
            response?.data?.data.map((data, index) => {
                qty = qty + parseFloat(data.pro_qty);
                total = total + parseFloat(data.grand_total);
            });
            setresult({ ...result, qty: qty, total: total });
        }
        setModalVisible(true)
    };
    const handleFilter = async (search) => {
        if (filterName === 'Farmer/Product Name') {
            setSearchFarmerPhone('');
            setSearchFarmerName(search);
            const result = farmerData.filter(item => item.label.toLowerCase().includes(search.toLowerCase()));
            if (search == "") {
                setSearchResultsList(false);
                setOutputListAll(outputListAllRaw)
            } else {
                // let tempData = outputListAll.filter(item => {
                //     return item.users.userName.toLowerCase().indexOf(search.toLowerCase()) > -1;;
                // });
                // if(tempData.length===0){
                //     Toast.show({ text: t('no_data_found'), ...AlertMesg[0] })
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
            const result = farmerData.filter(item => item.phone.toLowerCase().includes(search.toLowerCase()));
            if (search == "") {
                setSearchResultsList(false);
                setOutputListAll(outputListAllRaw)
            } else {
                // let tempData = outputListAll.filter(item => {
                //     return item.users.contactNumber.toLowerCase().indexOf(search.toLowerCase()) > -1;;
                // });
                // if(tempData.length===0){
                //     Toast.show({ text: t('no_data_found'), ...AlertMesg[0] })
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
            let tempData = outputListAll.filter(item => { return item.users.userName.toLowerCase().indexOf(name.toLowerCase()) > -1; });
            setOutputListAll(tempData);
            if (tempData.length === 0) {
                Toast.show({ text: t('no_data_found'), ...AlertMesg[0] });
            }
        } else {
            let tempData = outputListAll.filter(item => { return item.users.contactNumber.toLowerCase().indexOf(phone.toLowerCase()) > -1; });
            setOutputListAll(tempData);
            if (tempData.length === 0) {
                Toast.show({ text: t('no_data_found'), ...AlertMesg[0] });
            }
        }
    }
    const onPageLoad = async () => {
        const outputList = await outputListAPI(dbname, lan_id, token, user_id);
        if (outputList?.status == 200) {
            setOutputListAll(outputList.data.data.rows);
            setOutputListRaw(outputList.data.data.rows);
            await setItem("output_data", outputList.data.data.rows);
            if (route.params.io_oid != undefined) {
                navigateToPages(route.params.io_oid, dbname, lan_id, token, user_id)
            }
        }
        setIsLoading(false);
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
                // outputListAPI(dbname, lan_id, token, user_id),
                SupervisoroutputEnquiryViewAPI(dbname, lan_id, token, user_id, fid)
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
            <View style={{ flexGrow: 1, backgroundColor: Colors.background_light }}>
                {isLoading ?
                    <View style={styles.loadingScreen}><LoadingScreen /></View>
                    :
                    <View>
                        {openFromDate && <DatePickerComp
                            openDate={openFromDate}
                            newDate={newFromDate}
                            setOpenDate={setOpenFromDate}
                            handleDatePicker={handleDatePicker}
                        />}
                        {openToDate && <DatePickerComp
                            openDate={openToDate}
                            newDate={newToDate}
                            setOpenDate={setOpenToDate}
                            handleDatePicker={handleDatePicker2}
                            minimumDate={fromDate == "" ? "" : new Date(`${new Date(fromDate).getFullYear()}-${new Date(fromDate).getMonth() + 1}-${new Date(fromDate).getDate() + 1}`)}
                        />}
                        <ViewModalPast setModalVisible={setModalVisible} modalVisible={modalVisible} outputSingle={outputSingle}
                            pastEnquiryView={pastEnquiryView} qty={result}
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
                        <View style={{ paddingBottom: 40, }}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                style={{ marginBottom: filterItem != "" ? 50 : 0 }}
                                data={outputListAll}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity style={[styles.flatListContainer, { marginBottom: outputListAll.length == index + 1 ? 80 : 10 }]} onPress={() => navigateToPages(item.fid, dbname, lan_id, token, user_id)} key={index}>
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
        top: '10%',
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