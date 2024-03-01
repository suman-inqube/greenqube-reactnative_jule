import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, SafeAreaView, Dimensions, Keyboard, BackHandler } from 'react-native'
import React, { useState, useEffect } from 'react';
import Filter from '../../Common/Filter';
import DatePickerComp from '../../Common/DatePickerComp';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import { farmerByNameAPI, problemListAPI } from '../../../config/apiHere';
import { useFocusEffect } from '@react-navigation/native';
import LoadingScreen from '../../Common/LoadingScreen';
import CustomHeader from '../CustomHeader';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import DeviceInfo from '../../DeviceInfo';
const ListProblem = ({ navigation }) => {
    const { netConnection } = DeviceInfo();
    const { t } = useTranslation();
    const isFocused = useIsFocused();
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [farmerData, setFarmerData] = useState([]);
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        pageNo: 1
    });
    const [problemAll, setProblemAll] = useState([]);
    const [problemAllRaw, setProblemAllRaw] = useState([]);
    const [filterItem, setFilterItem] = useState("");
    const [filterOption, setFilterOption] = useState(false);
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [newToDate, setnewToDate] = useState(new Date());
    const [openFromDate, setOpenFromDate] = useState(false);
    const [openToDate, setOpenToDate] = useState(false);
    const [showMenu, setshowMenu] = useState(null);
    const [fromDate, setfromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [fromDateFilter, setFromDateFilter] = useState('');
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [filterName, setFilterName] = useState("");
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
            const searchItem = '';
            const from_date = fromDateFilter;
            const to_date = effective_date;
            const mobileNo = '';
            const response = await problemListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.supervisorId, dbLanTokUsr.pageNo, searchItem, from_date, to_date, mobileNo)
            if (response) {
                setProblemAll(response.data.data.rows)
                setItem("problem_Data", response.data.data)
            }
        } else {
            MessageDialog({ title: 'Require', message: 'Please Select First data.' })
        }
    }
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
        setProblemAll(problemAllRaw);
        setSearchFarmerName("");
        setSearchFarmerPhone("");
        setfromDate("");
        setToDate("");
    }
    const handlePage = async (value) => {
        setIsLoading(true)
        const currentPageNo = dbLanTokUsr.pageNo
        const totalPage = dbLanTokUsr.totalPage
        if (value === 'next') {
            if (totalPage === currentPageNo) {
                setProblemAll([])
                Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] })
                setIsLoading(false)
                return;
            } else {
                const nextPage = currentPageNo + 1
                setdbLanTokUsr({ ...dbLanTokUsr, pageNo: nextPage })
                const response = await problemListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.supervisorId, nextPage)
                if (response) {
                    setProblemAll(response.data.data.rows)
                    setItem("problem_Data", response.data.data)
                    setIsLoading(false)
                }
            }
        }
        if (value === 'previous') {
            if (currentPageNo === 1) {
                const prePage = currentPageNo - 1
                setdbLanTokUsr({ ...dbLanTokUsr, pageNo: prePage })
                const response = await problemListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.supervisorId, prePage)
                if (response) {
                    setProblemAll(response.data.data.rows)
                    setItem("problem_Data", response.data.data)
                    setIsLoading(false)
                }
            } else {
                const prePage = currentPageNo - 1
                setdbLanTokUsr({ ...dbLanTokUsr, pageNo: prePage })
                const response = await problemListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.supervisorId, prePage)
                if (response) {
                    setProblemAll(response.data.data.rows)
                    setItem("problem_Data", response.data.data)
                    setIsLoading(false)
                }
            }
        }
    }
    const navigateToPages = (pageName, fid) => {
        setItem("problem_id_data", fid)
        navigation.navigate(pageName);
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
                setProblemAll(problemAllRaw)
            } else {
                let tempData = problemAllRaw.filter(item => {
                    return item.agri_user.userName.toLowerCase().indexOf(search.toLowerCase()) > -1;
                });
                // setProblemAll(tempData)
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
                setProblemAll(problemAllRaw);
            } else {
                // let tempData = problemAllRaw.filter(item => {
                //     return item.agri_user.contactNumber.toLowerCase().indexOf(search.toLowerCase()) > -1;;
                // });
                // setProblemAll(tempData)
                setSearchResultsList(true);
            }
            if (result) {
                setSearchResults(result);
            }
        }
    }
    const handleResultSelect = async (name, user_id1, phone) => {
        setIsLoading(true)
        setSearchResultsList(false);
        setSearchFarmerPhone(phone)
        setSearchFarmerName(name);
        setSearchResults([]);
        if (name !== '') {
            let user_id = user_id1
            let from_date = ''
            let to_date = ''
            let mobileNo = ''
            const response = await problemListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.supervisorId, 0, user_id, from_date, to_date, mobileNo)
            if (response) {
                setIsLoading(false)
                setProblemAll(response.data.data.rows)
                // setProblemAllRaw(response.data.data.rows)
            }
        } else {
            let tempData = problemAll.filter(item => {
                return item.agri_user.contactNumber.toLowerCase().indexOf(phone.toLowerCase()) > -1;;
            });
            setProblemAll(tempData)
        }
    }
    const onPageLoad = async () => {
        setIsLoading(true);
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageId = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const supervisorId = loginUser_data.user_id;
            if (netConnection) {
                var [response, farmerByName] = await Promise.all([
                    problemListAPI(dbName, languageId, supervisorId, 1),
                    farmerByNameAPI(dbName, languageId, token, supervisorId)
                ]);
                await Promise.all([
                    setItem('problemTypeName', response),
                    setItem('farmerByName' + supervisorId, farmerByName)
                ]);
            } else {
                var [response, farmerByName] = await Promise.all([
                    getItem('problemTypeName'),
                    getItem('farmerByName' + supervisorId)
                ]);
            }
            if (response) {
                setIsLoading(false);
                const totalPage = Math.ceil(response.data.data.count / 20)
                setdbLanTokUsr({
                    ...dbLanTokUsr,
                    dbName: dbName,
                    languageId: languageId,
                    token: token,
                    supervisorId: supervisorId,
                    totalPage: totalPage,
                });
                setProblemAll(response.data.data.rows)
                setProblemAllRaw(response.data.data.rows)
                setItem("problem_Data", response.data.data)
                setIsLoading(false)
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
        }
    };
    const filterDataRemove = () => {
        setSearchFarmerPhone("");
        setSearchFarmerName("");
        setFilterItem("");
        setFilterOption(false);
        setProblemAll(problemAllRaw);
        setSearchResultsList(false);
    }
    const HandlerGoBack = () => {
        setToDate("");
        setfromDate("");
        setFilterItem("");
        setSearchFarmerPhone("");
        setSearchFarmerName("");
        setFilterOption(false);
        setSearchResultsList(false);
        navigation.navigate('Dashboard');
    }
    useEffect(() => {
        if (isFocused) {
            if (searchFarmerName == "" && searchFarmerPhone == "" && fromDate == "" && toDate == "") {
                onPageLoad();
            }
            const onBackPress = () => {
                setToDate("");
                setfromDate("");
                setFilterItem("");
                setSearchFarmerPhone("");
                setSearchFarmerName("");
                setFilterOption(false);
                setSearchResultsList(false);
                navigation.navigate('Dashboard');
                return true;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
    }, [isFocused, netConnection])
    useFocusEffect(
        React.useCallback(() => {
            setFilterOption(false);
            const keyboardDidShowListener = Keyboard.addListener(
                'keyboardDidShow', () => { setKeyboardVisible(true); }
            );
            const keyboardDidHideListener = Keyboard.addListener(
                'keyboardDidHide', () => { setKeyboardVisible(false); }
            );
            return () => {
                keyboardDidHideListener.remove();
                keyboardDidShowListener.remove();
            };
        }, [])
    );
    return (
        <Root>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <CustomHeader path="Dashboard" HandlerGoBack={HandlerGoBack} />
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
                        title={t('problem_reporting')}
                        filterDataRemove={filterDataRemove}
                    />
                    <>
                        {
                            searchResultsList && searchResultsList ?
                                <View View style={isKeyboardVisible ? styles.flatContainerLengthUp : styles.flatContainer}>
                                    <FlatList
                                        style={searchResults.length > 8 ? styles.flatlistHeight : ""}
                                        data={searchResults}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity onPress={() => handleResultSelect(item.label, item.value, item.phone)} style={styles.flatlistitem}>
                                                <Text style={[styles.flatlisttitle, { color: 'black' }]}>{filterName == "PhoneNumber" ? item.phone : item.label}</Text>
                                            </TouchableOpacity>
                                        )}
                                        keyExtractor={(item, index) => index}
                                    />
                                </View> : ""
                        }
                    </>
                    {isLoading ? <View style={styles.loadingScreen}><LoadingScreen /></View> : null}
                    <>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={problemAll}
                            renderItem={({ item }) => {
                                return (
                                    <TouchableOpacity style={styles.wrapper} onPress={() => navigateToPages('ProblemView', item.fid)}>
                                        <Text style={styles.title}>{t('problem_title')} : {item.question_title.substring(0, 30)}</Text>
                                        <View style={styles.flatListItem}>
                                            <Text style={styles.title}>{t('name')} : {item.agri_user.userName}</Text>
                                            <Text style={styles.title}>{t('far_list_number')} : {item.agri_user.contactNumber}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                            keyExtractor={(item, index) => index}
                        />
                        <View style={styles.prevNextPage}>
                            <TouchableOpacity onPress={() => handlePage('previous')}>
                                <Text style={styles.title}>{t('prev_page')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handlePage('next')}>
                                <Text style={styles.title}>{t('next_page')}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                </View>
                <TouchableOpacity style={styles.plusIconContainer} onPress={() => navigateToPages('ProblemCreate', 123)}>
                    <Image
                        source={require('../../Common/images/plus.png')}
                        resizeMode="cover" style={{ width: 50, height: 50 }}
                    />
                </TouchableOpacity>
            </SafeAreaView>
        </Root>
    )
}
export default ListProblem;
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
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
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
        bottom: 50,
        elevation: 5,
        zIndex: 99,
        width: 60,
        height: 60,
        backgroundColor: '#4BAE4F',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        elevation: 3
    },
    flatContainer: {
        // backgroundColor: '#ffffff',
        // position: 'absolute',
        // zIndex: 999,
        // bottom: '100%',
        // left: 0,
        // marginHorizontal: '5%',
        // width: '90%',
        // elevation: 10,
        // borderRadius: 10,
        // padding: 10,
        // bottom:100
        backgroundColor: '#ffffff',
        position: 'absolute',
        zIndex: 999,
        left: 0,
        // top:30,
        marginTop: 60,
        bottom: '65%',
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
        left: 0,
        // top: 30,
        bottom: '45%',
        marginHorizontal: '5%',
        width: '90%',
        elevation: 10,
        borderRadius: 10,
        padding: 10
    },
    flatlistHeight: {
        height: Dimensions.get('window').height / 4
    },
    flatlisttitle: {
        color: '#000',
        marginVertical: 6,
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },
    flatlistitem: {
    },
    loadingScreen: {
        position: 'absolute',
        top: '50%',
        left: '45%',
        zIndex: 999
    },
})