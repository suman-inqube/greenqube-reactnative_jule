import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions } from 'react-native'
import Filter from '../../Common/FarmerFilter';
import ViewModalPast from './FarmerViewModalPast';
import React, { useState, useContext } from 'react'
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { FarmeroutputListAPI, outputEnquiryViewAPI } from '../../../config/apiHere';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import MessageDialog from '../../Common/MessageDialog';
import { userCreateContext } from '../../Context/usersCreateContext';
const FarmerViewPast = () => {
    //GQR-67
    const { loginUser_data, LoadingScreen, DatePickerComp, t, getItem, setItem, effective_dates, Root, Popup, Toast } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    //GQR-67
    const route = useRoute();
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
    const [result, setresult] = useState({
        qty: '',
        total: '',
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
        const effective_date = effective_dates(item);
        setfromDate(effective_date)
        setFromDateFilter(effective_date)
        setToDate("")
    }
    const handleDatePicker2 = async (item) => {
        const effective_date = effective_dates(item);
        setToDate(effective_date)
        if (fromDateFilter) {
            const outputList = await FarmeroutputListAPI(dbname, lan_id, token, user_id, fromDateFilter, effective_date);
            if (outputList?.status == 200) {
                setOutputListAll(outputList?.data?.data?.rows)
                setItem("output_data", outputList?.data?.data?.rows)
            }
        }
        else {
            ///basudev
            // MessageDialog({ title: 'Require', message: 'Please Select First data.' })
            Toast.show({ time: 3, text: 'Please Select First data.', ...AlertMesg[0] })

        }
    }
    const navigateToPages = async (fid, dbname, lan_id, token, user_id) => {
        // setIsLoading(true)
        const output_data = await getItem('output_data');
        const outputFound = output_data.find(user => user.fid === fid);
        await setItem('output_single_data', outputFound)
        setOutputSingle(outputFound);
        const response = await outputEnquiryViewAPI(dbname, lan_id, token, user_id, fid)
        if (response?.status == 200) {
            setPastEnquiryView(response?.data?.data);
            var qty = 0;
            var total = 0;
            response?.data?.data.map((data, index) => { qty = qty + parseFloat(data.pro_qty); total = total + parseFloat(data.grand_total) });
            setresult({ ...result, qty: qty, total: total });
        }
        setModalVisible(true);
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
                let tempData = outputListAll.filter(item => { return item.users.userName.toLowerCase().indexOf(search.toLowerCase()) > -1; });
                setOutputListAll(tempData)
                setSearchResultsList(true);
            }
            if (result) {
                setSearchResults(result);
            }
        } else if (filterName === 'PhoneNumber') {
            setSearchFarmerName('');
            setSearchFarmerPhone(search);
            const result = farmerData.filter(item => item.phone.toLowerCase().includes(search.toLowerCase()));
            if (search == "") {
                setSearchResultsList(false);
                setOutputListAll(outputListAllRaw)
            } else {
                let tempData = outputListAll.filter(item => { return item.users.contactNumber.toLowerCase().indexOf(search.toLowerCase()) > -1; });
                setOutputListAll(tempData)
                // setData(tempData);
                setSearchResultsList(true);
            }
            if (result) {
                setSearchResults(result);
            }
        }
    }
    const onPageLoad = async () => {
        const outputList = await FarmeroutputListAPI(dbname, lan_id, token, user_id, fromDate, toDate);
        if (outputList?.status == 200) {
            setOutputListAll(outputList?.data?.data?.rows);
            setOutputListRaw(outputList?.data?.data?.rows);
            setItem("output_data", outputList?.data?.data?.rows);
            if (route.params?.data != "remove") {
                navigateToPages(route.params.io_oid, dbname, lan_id, token, user_id)
            }
        }
        setIsLoading(false);
    };
    const filterDataRemove = async () => {
        setFilterItem("");
        setFilterOption(false);
        setToDate("");
        setfromDate("");
        const outputList = await FarmeroutputListAPI(dbname, lan_id, token, user_id, "", "");
        if (outputList?.status == 200) {
            setOutputListAll(outputList?.data?.data?.rows)
            setOutputListRaw(outputList?.data?.data?.rows)
            setItem("output_data", outputList?.data?.data?.rows)
        }
        setIsLoading(false)
    }
    useFocusEffect(
        React.useCallback(() => {
            onPageLoad();
        }, [])
    );
    return (
        <Root>
            <View style={{ flexGrow: 1, marginBottom: 300 }}>
                {isLoading ?
                    <View style={styles.loadingScreen}><LoadingScreen /></View>
                    :
                    <View>
                        <DatePickerComp openDate={openFromDate} newDate={newFromDate} setOpenDate={setOpenFromDate} handleDatePicker={handleDatePicker} />
                        <DatePickerComp openDate={openToDate} newDate={newToDate} setOpenDate={setOpenToDate} handleDatePicker={handleDatePicker2} minimumDate={fromDate == "" ? "" : new Date(`${new Date(fromDate).getFullYear()}-${new Date(fromDate).getMonth() + 1}-${new Date(fromDate).getDate() + 1}`)} />
                        {modalVisible&&<ViewModalPast setModalVisible={setModalVisible} modalVisible={modalVisible} outputSingle={outputSingle} pastEnquiryView={pastEnquiryView} qty={result} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }} />}
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
                        <View style={{ paddingBottom: 8, flexGrow: 1 }}>
                            <FlatList
                                data={outputListAll}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity style={styles.flatListContainer} onPress={() => navigateToPages(item.fid, dbname, lan_id, token, user_id)} key={index}>
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
                                }
                                keyExtractor={item => item.id}
                            />
                        </View>
                    </View>
                }
            </View>
        </Root>
    )
}
export default FarmerViewPast;
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