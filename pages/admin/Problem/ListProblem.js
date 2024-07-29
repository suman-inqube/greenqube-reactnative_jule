import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, SafeAreaView, Dimensions, Keyboard, BackHandler } from 'react-native'
import React, { useState, useEffect, useContext } from 'react';
import { problemListAPI } from '../../../config/apiHere';
import { useFocusEffect } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
const ListProblem = ({ navigation }) => {
    //GQR-67
    const { dbLanTokUsr, setdbLanTokUsr, loginUser_data, LoadingScreen, CustomHeader, t, onBackPress, getItem,
        setItem, logoImage, topBanner, Root, DeviceInfo, effective_dates, DatePickerComp, Filter, handleFilter,
        handleResultSelect, handlePageList, farmerData, isOnline } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    const { pageNo } = dbLanTokUsr;
    //GQR-67
    const { netConnection } = DeviceInfo();
    const isFocused = useIsFocused();
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [problemAll, setProblemAll] = useState([]);
    const [problemAllRaw, setProblemAllRaw] = useState([]);
    const [filterItem, setFilterItem] = useState("");
    const [filterOption, setFilterOption] = useState(false);
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [newToDate, setnewToDate] = useState(new Date());
    const [openFromDate, setOpenFromDate] = useState(false);
    const [openToDate, setOpenToDate] = useState(false);
    const [fromDate, setfromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [fromDateFilter, setFromDateFilter] = useState('');
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [filterName, setFilterName] = useState("");
    const handleDatePicker = (item) => {
        const effective_date = effective_dates(item);
        setfromDate(effective_date);
        setFromDateFilter(effective_date);
    }
    const handleDatePicker2 = async (item) => {
        const effective_date = effective_dates(item);
        setToDate(effective_date)
        if (fromDateFilter) {
            const searchItem = '';
            const from_date = fromDateFilter;
            const to_date = effective_date;
            const mobileNo = '';
            const response = await problemListAPI(dbname, lan_id, token, user_id, pageNo, searchItem, from_date, to_date, mobileNo)
            if (response?.status == 200) {
                setProblemAll(response?.data?.data?.rows)
                setItem("problem_Data", response?.data?.data)
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
        handlePageList(value, setIsLoading, token, pageNo, problemListAPI, setProblemAll, dbname, lan_id, user_id);
    }
    const navigateToPages = (pageName, fid) => {
        setItem("problem_id_data", fid)
        navigation.navigate(pageName);
    };
    const onPageLoad = async () => {
        setIsLoading(true);
        var response = [];
        if (isOnline) {
            response = await problemListAPI(dbname, lan_id, token, user_id, 1);
            if (response?.status == 200) { await setItem('problemTypeName', response) }
        } else {
            response = await getItem('problemTypeName');
        }
        if (response?.status == 200) {
            setIsLoading(false);
            const totalPage = Math.ceil(response?.data?.data.count / 20)
            setdbLanTokUsr({ ...dbLanTokUsr, totalPage: totalPage, pageNo: 1 });
            setProblemAll(response?.data?.data?.rows)
            setProblemAllRaw(response?.data?.data?.rows)
            setItem("problem_Data", response?.data?.data)
            setIsLoading(false)
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
    const handleBackPress = () => {
        setToDate("");
        setfromDate("");
        setFilterItem("");
        setSearchFarmerPhone("");
        setSearchFarmerName("");
        setFilterOption(false);
        setSearchResultsList(false);
        navigation.navigate('Dashboard');
        return true;
    }
    useEffect(() => {
        if (isFocused) {
            if (searchFarmerName == "" && searchFarmerPhone == "" && fromDate == "" && toDate == "") {
                onPageLoad();
            }
            onBackPress(handleBackPress);
        }
    }, [isFocused])
    useFocusEffect(
        React.useCallback(() => {
            setFilterOption(false);
            const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => { setKeyboardVisible(true); });
            const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => { setKeyboardVisible(false); });
            return () => { keyboardDidHideListener.remove(); keyboardDidShowListener.remove(); };
        }, [])
    );
    const handleFilterList = (item) => {
        /*
        ** [1] It is use to search by farmer's name and phone number value.
        ** [2] It is use for filter type ['Farmer/Product Name','PhoneNumber'].
        ** [3] it is use for all farmer list.
        ** [4] item List can't modify data.
        ** [5,6] farmer's name and phone number  selected value set.
        ** [7] farmer list show and hide poup.
        ** [8] set all list value.
        ** [9] search result value set.
        */
        handleFilter(item, filterName, farmerData, problemAllRaw, setSearchFarmerPhone, setSearchFarmerName, setSearchResultsList, setProblemAll, setSearchResults);
    }
    const handleResultSelectList = (item) => {
        const { label, value, phone } = item
        /*
        ** [1,2,3] label,value,phone farmer data.
        ** [4] all list data.
        ** [5] api end point.
        ** [6] loader [true/false] data set
        ** [7] farmer list show and hide poup.
        ** [8,9] farmer's name and phone number  selected value set.
        ** [10] select result data set value.
        ** [8] set all list value.
        */
        handleResultSelect(label, '', phone, problemAll, problemListAPI, setIsLoading, setSearchResultsList, setSearchFarmerPhone, setSearchFarmerName, setSearchResults, setProblemAll)
    }
    return (
        <Root>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <CustomHeader path="Dashboard" HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
                    {openFromDate && <DatePickerComp openDate={openFromDate} newDate={newFromDate} setOpenDate={setOpenFromDate} handleDatePicker={handleDatePicker} />}
                    {openToDate && <DatePickerComp openDate={openToDate} newDate={newToDate} setOpenDate={setOpenToDate} handleDatePicker={handleDatePicker2} minimumDate={fromDate == "" ? "" : new Date(`${new Date(fromDate).getFullYear()}-${new Date(fromDate).getMonth() + 1}-${new Date(fromDate).getDate() + 1}`)} />}
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

                                            <TouchableOpacity onPress={() => handleResultSelectList(item)} style={styles.flatlistitem}>
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
        top: '80%',
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
        top: '12%',
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
        top: '30%',
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