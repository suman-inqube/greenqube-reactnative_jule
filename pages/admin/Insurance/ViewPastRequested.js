import {
    StyleSheet, Text,
    View, FlatList, TouchableOpacity, Image, SafeAreaView, ScrollView, Dimensions
} from 'react-native'
import React, { useState, useEffect } from 'react'
import DatePickerComp from '../../Common/DatePickerComp';
import Filter from '../../Common/Filter';
import ViewPast from './ViewPast';
import {
    InsuranceListAPI,
} from '../../../config/apiHere';
import { loanRouteFarmerListAPI } from '../Loan/LoanAPI';
import { getItem } from '../../../config/getDataFromStorage';
import LoadingScreen from '../../Common/LoadingScreen';
import { useTranslation } from 'react-i18next';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { useRoute, useFocusEffect, useNavigation, useIsFocused, useNavigationState } from '@react-navigation/native';
import { AlertMesg } from '../../Common/ToastAlert';
const ViewPastRequested = ({ setActiveBtn }) => {
    const { t } = useTranslation();
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
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: '',
        languageID: '',
        token: '',
        userID: ''
    });
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
        setInsuranceList(insuranceListRow);
        setfromDate("");
        setToDate("");
        setSearchResultsList(false);
    }
    const handleDatePicker = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setfromDate(effective_date)
        // console.log(effective_date);
    }
    const handleDatePicker2 = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setToDate(effective_date)
    }
    const handleFilter = (search) => {
        if (filterName === 'Farmer/Product Name') {
            setSearchFarmerPhone('');
            setSearchFarmerName(search);
            const result = farmerData.filter(item =>
                item.label.toLowerCase().includes(search.toLowerCase())
            );
            if (search == "") {
                setSearchResultsList(false);
                setInsuranceList(insuranceListRow);
            } else {
                let tempData = insuranceListRow.filter(item => {
                    return item.agri_user.userName.toLowerCase().indexOf(search.toLowerCase()) > -1;;
                });
                setInsuranceList(tempData)
                setSearchResultsList(true);
            }
            if (result) {
                setSearchResults(result);
            }
        } else if (filterName === 'PhoneNumber') {
            setSearchFarmerName('');
            setSearchFarmerPhone(search);
            const result = farmerData.filter(item =>
                item.phone.toLowerCase().includes(search.toLowerCase())
            );
            if (search == "") {
                setSearchResultsList(false);
                setInsuranceList(insuranceListRow)
            } else {
                let tempData = insuranceListRow.filter(item => {
                    return item.agri_user.contactNumber.toLowerCase().indexOf(search.toLowerCase()) > -1;;
                });
                setInsuranceList(tempData);
                setSearchResultsList(false);
            }
            if (result) {
                setSearchResults(result);
            }
        }
    }
    const handleResultSelect = async (name, currentfarmerId, phone) => {
        setSearchResultsList(false);
        setSearchFarmerPhone(phone)
        setSearchFarmerName(name);
        setSearchResults([]);
        if (name !== '') {
            let tempData = insuranceListRow.filter(item => {
                return item.agri_user.userName.toLowerCase().indexOf(name.toLowerCase()) > -1;;
            });
            setInsuranceList(tempData);
        } else {
            let tempData = insuranceListRow.filter(item => {
                return item.agri_user.contactNumber.toLowerCase().indexOf(phone.toLowerCase()) > -1;;
            });
            setInsuranceList(tempData);
        }
    }
    const onPageLoad = async () => {
        setIsLoading(true);
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
            const [response, farmerByName] = await Promise.all([
                InsuranceListAPI(dbName, languageID, token, userID, "", "", ""),
                loanRouteFarmerListAPI(dbName, languageID, token, userID)
            ]);
            if (response) {
                if (response.data.data.rows.length == 0) {
                    Toast.show({
                        text: `${t('no_data_found')}`, ...AlertMesg[0]
                    })
                }
                setIsLoading(false);
                setInsuranceList(response.data.data.rows);
                setInsuranceListRow(response.data.data.rows)
            }
            if (farmerByName.status === 200) {
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
    const filterfromAndToDate = () => {
        if (fromDate != "" && toDate != "") {
            let tempData = insuranceListRow.filter(item => {
                return (item.agri_user.CreateDateTime.slice(0, 10) >= fromDate &&
                    item.agri_user.CreateDateTime.slice(0, 10) <= toDate);
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
                        onChangeText={(item) => handleFilter(item)}
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