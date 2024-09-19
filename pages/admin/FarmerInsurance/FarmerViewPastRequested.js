import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState, useEffect, useContext } from 'react';
import Filter from '../../Common/FarmerFilter';
import ViewPast from './FarmerViewPast';
import { FarmerInsuranceListAPI } from '../../../config/apiHere';
import { userCreateContext } from '../../Context/usersCreateContext';
const ViewPastRequested = () => {
    //GQR-67
    const { loginUser_data, FormsTitle, effective_dates, LoadingScreen, onBackPress, CustomHeader, DatePickerComp, t, getItem } = useContext(userCreateContext);
    const { dbname, lan_id, token, owner, user_id } = loginUser_data;
    //GQR-67
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
    const [isLoading, setIsLoading] = useState(false);
    const [insuranceList, setInsuranceList] = useState([]);
    const [insuranceListRow, setInsuranceListRow] = useState([]);
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [modalVisibleData, setModalVisibleData] = useState({});
    const [farmerData, setfarmerData] = useState([]);
    const filterOptionShow = () => {
        if (!filterOption) {
            setFilterOption(true);
        } else {
            setFilterOption(false);
        }
    }
    const onchangeFilterItem = (value) => {
        setSearchFarmerPhone("")
        setSearchFarmerName("");
        setFilterName(value);
        setFilterItem(value);
        setFilterOption(false);
    }
    const handleDatePicker = async (item) => {
        const effective_date = effective_dates(item);
        setfromDate(effective_date)
        if (toDate) {
            const response = await FarmerInsuranceListAPI(dbname, lan_id, token, user_id, effective_date, toDate);
            if (response) {
                setIsLoading(false);
                setInsuranceList(response?.data?.data?.rows);
                setInsuranceListRow(response?.data?.data?.rows)
            }
        }
    }
    const handleDatePicker2 = async (item) => {
        const effective_date = effective_dates(item);
        setToDate(effective_date)
        if (fromDate) {
            const response = await FarmerInsuranceListAPI(dbname, lan_id, token, user_id, fromDate, effective_date);
            if (response?.status == 200) {
                setIsLoading(false);
                setInsuranceList(response?.data?.data?.rows);
                setInsuranceListRow(response?.data?.data?.rows)
            }
        }
    }
    const handleFilter = (search) => {
        if (filterName === 'Farmer/Product Name') {
            setSearchFarmerPhone('');
            setSearchFarmerName(search);
            const result = farmerData.filter(item => item.label.toLowerCase().includes(search.toLowerCase()));
            if (search == "") {
                setSearchResultsList(false);
                setInsuranceList(insuranceListRow);
            } else {
                let tempData = insuranceList.filter(item => { return item.agri_user.userName.toLowerCase().indexOf(search.toLowerCase()) > -1; });
                setInsuranceList(tempData)
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
                setInsuranceList(insuranceListRow)
            } else {
                let tempData = insuranceList.filter(item => { return item.agri_user.contactNumber.toLowerCase().indexOf(search.toLowerCase()) > -1; });
                setInsuranceList(tempData);
                setSearchResultsList(false);
            }
            if (result) {
                setSearchResults(result);
            }
        }
    }

    const onPageLoad = async () => {
        setIsLoading(true);
        const response = await FarmerInsuranceListAPI(dbname, lan_id, token, user_id, "", "");
        if (response?.status == 200) {
            setIsLoading(false);
            setInsuranceList(response?.data?.data?.rows);
            setInsuranceListRow(response?.data?.data?.rows)
        }
    };
    const filterDataRemove = async () => {
        setFilterItem("");
        setFilterOption(false);
        setToDate("");
        setfromDate("");
        const response = await FarmerInsuranceListAPI(dbname, lan_id, token, user_id, "", "");
        if (response?.status == 200) {
            setIsLoading(false);
            setInsuranceList(response?.data?.data?.rows);
            setInsuranceListRow(response?.data?.data?.rows)
        }
    }
    const filterfromAndToDate = () => {
        if (fromDate != "" && toDate != "") {
            let tempData = insuranceList.filter(item => {
                return (item.agri_user.CreateDateTime.slice(0, 10) >= fromDate && item.agri_user.CreateDateTime.slice(0, 10) <= toDate);
            });
            setInsuranceList(tempData)
        }
    }
    useEffect(() => {
        filterfromAndToDate();
    }, [fromDate, toDate])
    useEffect(() => {
        setInsuranceList(insuranceListRow);
    }, [filterName])
    useEffect(() => {
        onPageLoad();
    }, [])
    const handleSetModalVisible = (item) => {
        setModalVisible(true);
        setModalVisibleData(item)
    }
    return (
        <View style={{ flex: 1 }}>
            <DatePickerComp openDate={openFromDate} newDate={newFromDate} setOpenDate={setOpenFromDate} handleDatePicker={handleDatePicker} />
            <DatePickerComp openDate={openToDate} newDate={newToDate} setOpenDate={setOpenToDate} handleDatePicker={handleDatePicker2} minimumDate={fromDate == "" ? "" : new Date(`${new Date(fromDate).getFullYear()}-${new Date(fromDate).getMonth() + 1}-${new Date(fromDate).getDate() + 1}`)} />
            {
                insuranceList.length != 0 ?
                    <ViewPast setModalVisible={setModalVisible} modalVisible={modalVisible}
                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                        modalVisibleData={modalVisibleData}
                    /> : null
            }
            <View>
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
            </View>
            {isLoading ?
                <View style={styles.loadingScreen}><LoadingScreen /></View>
                : ""}
            <FlatList
                data={insuranceList}
                renderItem={({ item }) => {
                    var mydate = new Date(item.agri_user.CreateDateTime.split("T")[0]);
                    return (
                        <TouchableOpacity style={styles.flatListContainer} onPress={() => handleSetModalVisible(item)}>
                            <View style={styles.flatListItem}>
                                <Text style={styles.text}>{t('plot_to_be_insured')}:{item.ins_plots.length}</Text>
                                <Text style={styles.text}>{t('farmer_reg_nm')}: {item.agri_user.userName.substring(-1, 12)}...</Text>
                            </View>
                            <View style={styles.flatListItem}>
                                <Text style={styles.text}>{t('date')}:{mydate.toString().substring(4, 15)}</Text>
                                <Text style={styles.text}>{t('far_list_number')}:{item.agri_user.contactNumber}</Text>
                            </View>
                        </TouchableOpacity>
                    )
                }}
                keyExtractor={(item, index) => index}
            />
        </View>
    )
}

export default ViewPastRequested

const styles = StyleSheet.create({
    container: {
        marginBottom: 450
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
    text: {
        color: '#000',
        fontSize: 14,
        marginVertical: 3
    },
    loadingScreen: {
        position: 'relative',
        top: 100
    },
})