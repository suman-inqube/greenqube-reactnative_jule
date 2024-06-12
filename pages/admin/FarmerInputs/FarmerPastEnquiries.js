import { BackHandler, StyleSheet, Text, View, FlatList, Image, TouchableOpacity, PermissionsAndroid } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import DatePickerComp from '../../Common/DatePickerComp';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import { inputEnquiryViewAPI, FarmerinputPastEnquiryListAPI, problemListAPI } from '../../../config/apiHere';
import Geolocation from '@react-native-community/geolocation';
import CustomHeader from '../CustomHeader';
import FarmerPastEnquiriesModel from './FarmerPastEnquiriesModel';
import Filter from '../../Common/FarmerFilter';
import LoadingScreen from '../../Common/LoadingScreen';
import { useTranslation } from 'react-i18next';
const FarmerPastEnquiries = ({ navigation }) => {
    const route = useRoute();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [dbLanTokUsr, setdbLanTokUsr] = useState({});
    const [inputPastEnquiryAll, setInputPastEnquiryAll] = useState([]);
    const [filterItem, setFilterItem] = useState("");
    const [filterOption, setFilterOption] = useState(false);
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [newToDate, setnewToDate] = useState(new Date());
    const [openFromDate, setOpenFromDate] = useState(false);
    const [openToDate, setOpenToDate] = useState(false);
    const [showMenu, setshowMenu] = useState(null);
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [pastEnquiries, setPastEnquiries] = useState(false);
    const [pastEnquirySingle, setPastEnquirySingle] = useState(false);
    const [pastEnquiryView, setPastEnquiryView] = useState([]);
    const [result, setresult] = useState({
        qty: "",
        total: "",
        grandTotal: "",
        disTotal: "",
    });
    const filterOptionShow = () => {
        if (!filterOption) {
            setFilterOption(true);
        } else {
            setFilterOption(false);
        }
    }
    const onchangeFilterItem = (value) => {
        setFilterItem(value);
        setFilterOption(false);
    }
    const navigateToPages = async (fid, dbname, lan_id, token, user_id) => {
        // setIsLoading(true)
        const input_past_enquiry_Data = await getItem('input_past_enquiry_Data');
        const EnquiryFound = input_past_enquiry_Data.find(user => user.fid === fid);
        setPastEnquirySingle(EnquiryFound);
        const response = await inputEnquiryViewAPI(dbname, lan_id, token, user_id, fid)
        if (response) {
            setPastEnquiryView(response.data.data)
            var qty = 0;
            var grandTotal = 0;
            var disTotal = 0;
            var total = 0;
            response.data.data.map((data, index) => {
                qty = qty + parseFloat(data.sqty);
                grandTotal = grandTotal + parseFloat(data.sgrand_total);
                disTotal = disTotal + parseFloat(data.sdiscount);
                total = total + parseFloat(data.total_samount);
            });
            setresult({
                ...result,
                qty: qty,
                total: total,
                grandTotal: grandTotal,
                disTotal: disTotal,
            });
        }
        setPastEnquiries(true);
    };
    const onPageLoad = async () => {
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const { dbname, lan_id, token, user_id } = loginUser_data;
            const response = await FarmerinputPastEnquiryListAPI(dbname, lan_id, token, user_id, "", "")
            if (response) {
                setdbLanTokUsr({
                    ...dbLanTokUsr,
                    dbName: dbname,
                    languageId: lan_id,
                    token: token,
                    supervisorId: user_id
                });
                setInputPastEnquiryAll(response.data.data.rows)
                setItem("input_past_enquiry_Data", response.data.data.rows);
                if (route.params != undefined) {
                    navigateToPages(route.params.io_oid, dbname, lan_id, token, user_id)
                }
                setIsLoading(false)
            }
        }
    };
    const handleDatePicker = async (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setFromDate(effective_date)
        if (toDate) {
            const inputList = await FarmerinputPastEnquiryListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, fromDate, toDate);
            if (inputList) {
                setInputPastEnquiryAll(inputList.data.data.rows)
                setItem("input_past_enquiry_Data", inputList.data.data.rows)
                setIsLoading(false)
            }
        }
    }
    const handleDatePicker2 = async (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setToDate(effective_date)
        if (fromDate) {
            const inputList = await FarmerinputPastEnquiryListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, fromDate, effective_date);
            if (inputList) {
                setInputPastEnquiryAll(inputList.data.data.rows)
                setItem("input_past_enquiry_Data", inputList.data.data.rows)
                setIsLoading(false)
            }
        }

    }
    const requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                // Geolocation.getCurrentPosition(data => console.log(data.coords))
            } else {
                console.log('Location permission denied');
            }
        } catch (err) {
            console.warn(err);
        }
    };
    useEffect(() => {
        onPageLoad();
        requestCameraPermission();
    }, []);

    useFocusEffect(
        useCallback(() => {
            onPageLoad();
            const onBackPress = () => { navigation.navigate('FarmerInputList'); return true; };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );
    const HandlerGoBack = () => navigation.navigate('FarmerInputList');
    const filterDataRemove = async () => {
        setFilterItem("");
        setFilterOption(false);
        setToDate("");
        setFromDate("");
        const inputList = await FarmerinputPastEnquiryListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, "", "");
        if (inputList) {
            setInputPastEnquiryAll(inputList.data.data.rows)
            setItem("input_past_enquiry_Data", inputList.data.data.rows)
            setIsLoading(false)
        }
    }
    return (
        <>
            <View style={{ flex: 1 }}>
                <CustomHeader path="FarmerInputList" HandlerGoBack={HandlerGoBack} />
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
                <Filter
                    title={t('past_enq')}
                    filterItem={filterItem}
                    filterOption={filterOption}
                    setOpenToDate={setOpenToDate}
                    filterOptionShow={filterOptionShow}
                    onchangeFilterItem={onchangeFilterItem}
                    setOpenFromDate={setOpenFromDate}
                    fromDate={fromDate}
                    newToDate={toDate}
                    filterDataRemove={filterDataRemove}
                    onlyDate={true}
                />
                <FarmerPastEnquiriesModel setModalVisible={setPastEnquiries} modalVisible={pastEnquiries} pastEnquirySingle={pastEnquirySingle} pastEnquiryView={pastEnquiryView}
                    qty={result}
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }} />
                {
                    isLoading ?
                        <LoadingScreen />
                        :
                        <FlatList
                            data={inputPastEnquiryAll}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                return (
                                    <TouchableOpacity style={styles.wrapper} onPress={() => navigateToPages(item.fid, dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId)}>
                                        <Text style={styles.title}>{t('product_name')} : {item.ioProduPrice && item.ioProduPrice.mk_product.product_name}</Text>
                                        <View style={styles.flatListItem}>
                                            <Text style={styles.title}>{t('name')} : {item.users && item.users.userName}</Text>
                                            <Text style={styles.title}>{t('far_list_number')} : {item.users && item.users.contactNumber}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                            keyExtractor={(item, index) => index}
                        />
                }
            </View>

        </>
    )
}

export default FarmerPastEnquiries
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    item: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    title: {
        color: '#000'
    },
    prevNextPage: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        position: 'relative',
        bottom: 0
    },
    wrapper: {
        marginHorizontal: '2.5%',
        backgroundColor: '#FFF',
        marginVertical: 10,
        padding: 10,
        borderRadius: 8
    },
    flatListItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    plusIconContainer: {
        position: 'absolute',
        right: 20,
        bottom: 100,
        elevation: 5,
        zIndex: 99,
        width: 60,
        height: 60,
        backgroundColor: '#4BAE4F',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        elevation: 3
    }
})