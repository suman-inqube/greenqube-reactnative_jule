import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, SafeAreaView, Dimensions, Keyboard, BackHandler } from 'react-native'
import React, { useState, useEffect, useContext } from 'react';
import { farmerByNameAPI, problemListAPI } from '../../../config/apiHere';
import { useFocusEffect } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
const ListProblem = ({ navigation }) => {
    //GQR-67
    const { dbLanTokUsr, setdbLanTokUsr, loginUser_data, LoadingScreen, CustomHeader, t, onBackPress, getItem,
        setItem, logoImage, topBanner, Root, DeviceInfo, effective_dates, DatePickerComp, Filter, handleFilter, handleResultSelect, handlePageList } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    const { pageNo } = dbLanTokUsr;
    //GQR-67
    const { netConnection } = DeviceInfo();
    const isFocused = useIsFocused();
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [farmerData, setFarmerData] = useState([]);
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
            const response = await problemListAPI(dbname, lan_id, user_id, pageNo, searchItem, from_date, to_date, mobileNo)
            if (response?.status == 200) {
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
        handlePageList(value, setIsLoading, pageNo, problemListAPI, setProblemAll, dbname, lan_id, user_id);
    }
    const navigateToPages = (pageName, fid) => {
        setItem("problem_id_data", fid)
        navigation.navigate(pageName);
    };
    const onPageLoad = async () => {
        setIsLoading(true);
        if (netConnection) {
            var [response, farmerByName] = await Promise.all([
                problemListAPI(dbname, lan_id, user_id, 1),
                farmerByNameAPI(dbname, lan_id, token, user_id)
            ]);
            if (response?.status == 200) {
                await Promise.all([
                    setItem('problemTypeName', response),
                    setItem('farmerByName' + user_id, farmerByName)
                ]);
            }
        } else {
            var [response, farmerByName] = await Promise.all([
                getItem('problemTypeName'),
                getItem('farmerByName' + user_id)
            ]);
        }
        if (response?.status == 200) {
            setIsLoading(false);
            const totalPage = Math.ceil(response.data.data.count / 20)
            setdbLanTokUsr({ ...dbLanTokUsr, totalPage: totalPage, pageNo: 1 });
            setProblemAll(response.data.data.rows)
            setProblemAllRaw(response.data.data.rows)
            setItem("problem_Data", response.data.data)
            setIsLoading(false)
        }
        if (farmerByName?.status == 200) {
            //GQR-67
            const dataArray = farmerByName?.data?.data?.rows.map(data => ({ value: data.user_id, label: data.userName, phone: data.contactNumber }))
            //GQR-67
            setFarmerData(dataArray)
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
        // setProblemAll([]);
        // setProblemAllRaw([]);
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
        // setProblemAll([]);
        // setProblemAllRaw([]);
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
    }, [isFocused, netConnection])
    useFocusEffect(
        React.useCallback(() => {
            setFilterOption(false);
            const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => { setKeyboardVisible(true); });
            const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => { setKeyboardVisible(false); });
            return () => { keyboardDidHideListener.remove(); keyboardDidShowListener.remove(); };
        }, [])
    );
    const handleFilterList = (item) => {
        handleFilter(item, filterName, farmerData, problemAllRaw, setSearchFarmerPhone, setSearchFarmerName, setSearchResultsList, setProblemAll, setSearchResults);
    }
    const handleResultSelectList = (item) => {
        const { label, value, phone } = item
        handleResultSelect(label, value, phone, problemAll, problemListAPI, setIsLoading, setSearchResultsList, setSearchFarmerPhone, setSearchFarmerName, setSearchResults, setProblemAll)
    }
    return (
        <Root>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <CustomHeader path="Dashboard" HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
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