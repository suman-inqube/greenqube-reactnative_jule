import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, PermissionsAndroid } from 'react-native'
import React, { useState, useEffect } from 'react';
import DatePickerComp from '../../Common/DatePickerComp';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import { inputEnquiryViewAPI, inputPastEnquiryListAPI, problemListAPI } from '../../../config/apiHere';
import Geolocation from '@react-native-community/geolocation';
import CustomHeader from '../CustomHeader';
import PastEnquiriesModel from './PastEnquiriesModel';
import Filter from '../../Common/Filter';
import LoadingScreen from '../../Common/LoadingScreen';
const PastEnquiries = ({ navigation }) => {
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
    const [problemFromDate, setProblemFromDate] = useState("")
    const [problemToDate, setProblemToDate] = useState("")
    const [pastEnquiries, setPastEnquiries] = useState(false);
    const [pastEnquirySingle, setPastEnquirySingle] = useState(false);
    const [pastEnquiryView, setPastEnquiryView] = useState([]);
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

    const navigateToPages = async (fid) => {
        setIsLoading(true)
        const EnquiryFound = inputPastEnquiryAll.find(user => user.fid === fid);
        setPastEnquirySingle(EnquiryFound);
        setPastEnquiries(true)
        const response = await inputEnquiryViewAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, fid)
        setIsLoading(false)
        if (response) {
            setPastEnquiryView(response.data.data)
        }


    };

    const onPageLoad = async () => {
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageId = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const supervisorId = loginUser_data.user_id;
            const response = await inputPastEnquiryListAPI(dbName, languageId, token, supervisorId)
            if (response) {
                setdbLanTokUsr({
                    ...dbLanTokUsr,
                    dbName: dbName,
                    languageId: languageId,
                    token: token,
                    supervisorId: supervisorId
                });
                setInputPastEnquiryAll(response.data.data.rows)
                setItem("input_past_enquiry_Data", response.data.data)
                setIsLoading(false)

            }
        }
    };
    const handleDatePicker = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setProblemFromDate(effective_date)
    }

    const handleDatePicker2 = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setProblemToDate(effective_date)
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
    return (
        <>
            {
                isLoading ?
                    <LoadingScreen />
                    :
                    <View style={{ flex: 1 }}>
                       <CustomHeader path="Dashboard" />
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
                        <Filter
                            title={'Past Enquries'}
                            filterItem={filterItem}
                            filterOption={filterOption}
                            setOpenToDate={setOpenToDate}
                            filterOptionShow={filterOptionShow}
                            onchangeFilterItem={onchangeFilterItem}
                            setOpenFromDate={setOpenFromDate}
                            fromDate={problemFromDate}
                            newToDate={problemToDate}
                            category={true}
                        />
                        <PastEnquiriesModel setModalVisible={setPastEnquiries} modalVisible={pastEnquiries} pastEnquirySingle={pastEnquirySingle} pastEnquiryView={pastEnquiryView}
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }} />
                        <FlatList
                            data={inputPastEnquiryAll}
                            renderItem={({ item }) => {
                                return (
                                    <TouchableOpacity style={styles.wrapper} onPress={() => navigateToPages(item.fid)}>
                                        <Text style={styles.title}>Title : {item.ioProduPrice && item.ioProduPrice.mk_product.product_name}</Text>
                                        <View style={styles.flatListItem}>
                                            <Text style={styles.title}>Name : {item.users && item.users.userName}</Text>
                                            <Text style={styles.title}>Phone : {item.users && item.users.contactNumber}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                            keyExtractor={(item, index) => index}
                        />
                    </View>
            }
        </>
    )
}

export default PastEnquiries
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
        width: "90%",
        marginHorizontal: '5%',
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