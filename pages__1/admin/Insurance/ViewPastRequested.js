import {
    StyleSheet, Text,
    View, FlatList, TouchableOpacity, Image, Dimensions, Keyboard
} from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import ViewPast from './ViewPast';
import {
    InsuranceListAPI,
} from '../../../config/apiHere';
import { userCreateContext } from '../../Context/usersCreateContext';
const ViewPastRequested = ({ setActiveBtn }) => {
    //GQR-67
    const { loginUser_data, LoadingScreen, t, Toast,
        AlertMesg, Root, DatePickerComp
        , Filter, farmerData, effective_dates, handleFilter } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
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
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
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
        setInsuranceList(insuranceListRow);
        setfromDate("");
        setToDate("");
        setSearchResultsList(false);
    }
    const handleDatePicker = (item) => {
        const effective_date = effective_dates(item);
        setfromDate(effective_date);
    }
    const handleDatePicker2 = (item) => {
        const effective_date = effective_dates(item);
        setToDate(effective_date);
    }
    const handleFilterList = (item) => {
        handleFilter(item, filterName, farmerData, insuranceListRow, setSearchFarmerPhone, setSearchFarmerName, setSearchResultsList, insuranceList, setSearchResults);
    }
    const handleResultSelectList = async (item) => {
        const { label, phone, value } = item;
        setSearchResultsList(false);
        setSearchFarmerPhone(phone)
        setSearchFarmerName(label);
        setSearchResults([]);
        if (label !== '') {
            let tempData = insuranceListRow.filter(item => { return item.agri_user.userName.toLowerCase().indexOf(label.toLowerCase()) > -1 });
            setInsuranceList(tempData);
        } else {
            let tempData = insuranceListRow.filter(item => { return item.agri_user.contactNumber.toLowerCase().indexOf(phone.toLowerCase()) > -1 });
            setInsuranceList(tempData);
        }
    }
    const onPageLoad = async () => {
        setIsLoading(true);
        const response = await InsuranceListAPI(dbname, lan_id, token, user_id, "", "", "");
        if (response?.status == 200) {
            if (response.data.data.rows.length == 0) {
                Toast.show({ text: `${t('no_data_found')}`, ...AlertMesg[0] })
            }
            setIsLoading(false);
            setInsuranceList(response.data.data.rows);
            setInsuranceListRow(response.data.data.rows)
        }
    };
    const filterfromAndToDate = () => {
        if (fromDate != "" && toDate != "") {
            let tempData = insuranceListRow.filter(item => { return (item.agri_user.CreateDateTime.slice(0, 10) >= fromDate && item.agri_user.CreateDateTime.slice(0, 10) <= toDate) });
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
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => { setKeyboardVisible(true); });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => { setKeyboardVisible(false); });
        return () => { keyboardDidHideListener.remove(); keyboardDidShowListener.remove() };
    }, [])
    const handleSetModalVisible = (item) => {
        setModalVisible(true);
        setModalVisibleData(item)
    }
    const filterDataRemove = () => {
        setFilterItem("");
        setFilterOption(false);
        setInsuranceList(insuranceListRow);
    }
    return (
        <Root>
            <View style={{ flex: 1 }}>
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
                {
                    searchResultsList && searchResultsList ?
                        <View style={isKeyboardVisible ? styles.flatContainerLengthUp : styles.flatContainer}>
                            <FlatList
                                style={searchResults.length > 8 ? styles.flatlistHeight : ""}
                                data={searchResults}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => handleResultSelectList(item)} style={styles.flatlistitem}>
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
                        onChangeText={(item) => handleFilterList(item)}
                        FarmerProductNameValue={searchFarmerName}
                        FarmerProductPhoneValue={searchFarmerPhone}
                        filterDataRemove={filterDataRemove}
                    />
                </View>
                {isLoading ?
                    <View style={styles.loadingScreen}><LoadingScreen /></View>
                    : ""}
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={insuranceList}
                    renderItem={({ item }) => {
                        var mydate = new Date(item.agri_user.CreateDateTime.split("T")[0]);
                        return (
                            <TouchableOpacity style={styles.flatListContainer} onPress={() => handleSetModalVisible(item)}>
                                <View style={styles.flatListItem}>
                                    <Text style={styles.text}>{t('plot_to_be_insured').substring(-1, 12)}:{item.ins_plots.length}</Text>
                                    <Text style={styles.text}>{t('farmer_reg_nm')} : {item.agri_user.userName.substring(-1, 12)}...</Text>
                                </View>
                                <View style={styles.flatListItem}>
                                    <Text style={styles.text}>{t('date')} :{mydate.toString().substring(4, 15)}</Text>
                                    <Text style={styles.text}>{t('far_list_number')}:{item.agri_user.contactNumber}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                    keyExtractor={(item, index) => index}
                />
            </View>
        </Root>
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
        // bottom: '100%',
        top: '10%',
        left: 0,
        marginHorizontal: '5%',
        width: '90%',
        elevation: 10,
        borderRadius: 10,
        padding: 10
    },
    flatContainerLengthUp: {
        backgroundColor: '#ffffff',
        position: 'absolute',
        zIndex: 999,
        // bottom: '100%',
        top: '16%',
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
        fontSize: 12,
        marginVertical: 2,
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    },
    loadingScreen: {
        position: 'relative',
        top: 100
    },
})