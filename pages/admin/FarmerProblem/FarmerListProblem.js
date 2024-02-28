import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Keyboard,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Filter from '../../Common/Filter';
import DatePickerComp from '../../Common/DatePickerComp';
import FormsTitle from '../../Common/FormsTitle';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import {
    farmerByNameAPI,
    problemListAPI,
    farmerProblemListAPI,
} from '../../../config/apiHere';
import { useFocusEffect } from '@react-navigation/native';
import LoadingScreen from '../../Common/LoadingScreen';
import CustomHeader from '../CustomHeader';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { onBackPress } from '../../Common/BackPressHandler';
import DeviceInfo from '../../DeviceInfo';
const FarmerListProblem = ({ navigation }) => {
    const { netConnection } = DeviceInfo();
    const { t } = useTranslation();
    const isFocused = useIsFocused();
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [farmerData, setFarmerData] = useState();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        pageNo: 1,
    });
    const [activeBtn, setActiveBtn] = useState(1);
    const [problemAll, setProblemAll] = useState([]);
    const [problemAllRaw, setProblemAllRaw] = useState([]);
    const [filterItem, setFilterItem] = useState('');
    const [page, setpage] = useState(1);
    const [dbName, setdbName] = useState('');
    const [langID, setlangID] = useState('');
    const [farmerID, setFarmerID] = useState('');
    const [filterOption, setFilterOption] = useState(false);
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [newToDate, setnewToDate] = useState(new Date());
    const [openFromDate, setOpenFromDate] = useState(false);
    const [openToDate, setOpenToDate] = useState(false);
    const [showMenu, setshowMenu] = useState(null);
    const [fromDate, setfromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [fromDateFilter, setFromDateFilter] = useState('');
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [filterName, setFilterName] = useState('');
    const handleDatePicker = item => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setfromDate(effective_date);
        setFromDateFilter(effective_date);
    };
    const handleDatePicker2 = async item => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setToDate(effective_date);
        if (fromDateFilter) {
            const searchItem = '';
            const from_date = fromDateFilter;
            const to_date = effective_date;
            const mobileNo = '';
            const response = await problemListAPI(
                dbLanTokUsr.dbName,
                dbLanTokUsr.languageId,
                dbLanTokUsr.supervisorId,
                dbLanTokUsr.pageNo,
                searchItem,
                from_date,
                to_date,
                mobileNo,
            );
            if (response) {
                setProblemAll(response.data.data.rows);
                setItem('problem_Data', response.data.data);
            }
        } else {
            MessageDialog({ title: 'Require', message: 'Please Select First data.' });
        }
    };
    const filterOptionShow = () => {
        if (!filterOption) {
            setFilterOption(true);
        } else {
            setFilterOption(false);
        }
    };
    const onchangeFilterItem = value => {
        setFilterName(value);
        setFilterItem(value);
        setFilterOption(false);
        setProblemAll(problemAllRaw);
        setSearchFarmerName('');
        setSearchFarmerPhone('');
        setfromDate('');
        setToDate('');
    };

    const navigateToPages = (pageName, fid) => {
        setItem('problem_id_data', fid);
        navigation.navigate(pageName);
    };
    const handleFilter = async search => {
        if (filterName === 'Farmer/Product Name') {
            setSearchFarmerPhone('');
            setSearchFarmerName(search);
            const result = farmerData.filter(item =>
                item.label.toLowerCase().includes(search.toLowerCase()),
            );
            if (search == '') {
                setSearchResultsList(false);
                setProblemAll(problemAllRaw);
            } else {
                let tempData = problemAllRaw.filter(item => {
                    return (
                        item.agri_user.userName
                            .toLowerCase()
                            .indexOf(search.toLowerCase()) > -1
                    );
                });
                setProblemAll(tempData);
                setSearchResultsList(true);
            }
            if (result) {
                setSearchResults(result);
            }
        } else if (filterName === 'PhoneNumber') {
            setSearchFarmerName('');
            setSearchFarmerPhone(search);
            const result = farmerData.filter(item =>
                item.phone.toLowerCase().includes(search.toLowerCase()),
            );
            if (search == '') {
                setSearchResultsList(false);
                setProblemAll(problemAllRaw);
            } else {
                let tempData = problemAllRaw.filter(item => {
                    return (
                        item.agri_user.contactNumber
                            .toLowerCase()
                            .indexOf(search.toLowerCase()) > -1
                    );
                });
                setProblemAll(tempData);
                setSearchResultsList(true);
            }
            if (result) {
                setSearchResults(result);
            }
        }
    };
    const handleResultSelect = async (name, user_id1, phone) => {
        setIsLoading(true);
        setSearchResultsList(false);
        setSearchFarmerPhone(phone);
        setSearchFarmerName(name);
        setSearchResults([]);
        if (name !== '') {
            let user_id = user_id1;
            let from_date = '';
            let to_date = '';
            let mobileNo = '';
            const response = await problemListAPI(
                dbLanTokUsr.dbName,
                dbLanTokUsr.languageId,
                dbLanTokUsr.supervisorId,
                0,
                user_id,
                from_date,
                to_date,
                mobileNo,
            );
            if (response) {
                setIsLoading(false);
                setProblemAll(response.data.data.rows);
                // setProblemAllRaw(response.data.data.rows)
            }
        } else {
            let tempData = problemAll.filter(item => {
                return (
                    item.agri_user.contactNumber
                        .toLowerCase()
                        .indexOf(phone.toLowerCase()) > -1
                );
            });
            setProblemAll(tempData);
        }
    };

    const myProblemList = async () => {
        setActiveBtn(1);
        if (netConnection) {
            const response = await farmerProblemListAPI(
                dbName,
                langID,
                farmerID,
                1,
                'crop_problem',
                page,
            );
            await setItem('farmerProblemList', response);
            response = await getItem('farmerProblemList');
            if (response) {
                setProblemAll(response.data.data.rows);
                setProblemAllRaw(response.data.data.rows);
                setItem('problem_Data', response.data.data);
                setIsLoading(false);
            }
        } else {
            const response = await getItem('farmerProblemList');
            if (response) {
                setProblemAll(response.data.data.rows);
                setProblemAllRaw(response.data.data.rows);
                setItem('problem_Data', response.data.data);
            }
        }
    };
    const otherProblemList = async () => {
        setActiveBtn(2);
        if (netConnection) {
            const response = await farmerProblemListAPI(
                dbName,
                langID,
                farmerID,
                2,
                'crop_problem',
                page,
            );
            await setItem('otherFarmerProblemList', response);
            response = await getItem('otherFarmerProblemList');
            if (response) {
                setProblemAll(response.data.data.rows);
                setProblemAllRaw(response.data.data.rows);
                setItem('problem_Data', response.data.data);
                setIsLoading(false);
            }
        } else {
            const response = await getItem('otherFarmerProblemList');
            if (response) {
                setProblemAll(response.data.data.rows);
                setProblemAllRaw(response.data.data.rows);
                setItem('problem_Data', response.data.data);
            }
        }
    };
    const handlePage = async value => {
        setIsLoading(true);
        const currentPageNo = page;
        if (value === 'next') {
            if (netConnection) {
                const nextPage = page + 1;
                const response = await farmerProblemListAPI(
                    dbName,
                    langID,
                    farmerID,
                    activeBtn,
                    'crop_problem',
                    nextPage,
                );
                if (response) {
                    if (response.data.data.rows.length > 0) {
                        setpage(nextPage);
                        setProblemAll(response.data.data.rows);
                        setItem('problem_Data', response.data.data);
                        setIsLoading(false);
                    } else {
                        setpage(page);
                        setIsLoading(false);
                        return;
                    }
                }
            } else {
            }
        }
        if (value === 'previous') {
            if (netConnection) {
                if (page === 1) {
                    setIsLoading(false);
                    return;
                } else {
                    const prePage = page - 1;
                    const response = await farmerProblemListAPI(
                        dbName,
                        langID,
                        farmerID,
                        activeBtn,
                        'crop_problem',
                        prePage,
                    );
                    await setItem('farmerProblemList', response);
                    response = await getItem('farmerProblemList');
                    if (response) {
                        if (response.data.data.rows.length > 0) {
                            setpage(prePage);
                            setProblemAll(response.data.data.rows);
                            setItem('problem_Data', response.data.data);
                            setIsLoading(false);
                        }
                    }
                }
            } else {
            }
        }
    };
    const onPageLoad = async () => {
        setActiveBtn(1);
        setpage(1);
        setfromDate('');
        setToDate('');
        setFilterItem(''), setFilterOption(false);
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageId = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const supervisorId = loginUser_data.owner.user_id;
            const farmerId = loginUser_data.user_id;
            setdbName(dbName);
            setlangID(languageId);
            setFarmerID(farmerId);
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageId: languageId,
                token: token,
                supervisorId: supervisorId,
                farmerId: farmerId,
            });
            if (netConnection) {
                var response = await farmerProblemListAPI(
                    dbName,
                    languageId,
                    farmerId,
                    1,
                    'crop_problem',
                    page,
                );
                await setItem('farmerProblemList', response);
            } else {
                var response = await getItem('farmerProblemList');
            }
            if (response) {
                const totalPage = Math.ceil(response.data.data.count / 20);
                setdbLanTokUsr({
                    ...dbLanTokUsr, totalPage: totalPage,
                });
                setProblemAll(response.data.data.rows);
                setProblemAllRaw(response.data.data.rows);
                setItem('problem_Data', response.data.data);
                setIsLoading(false);
            }
        }
    };
    useFocusEffect(
        React.useCallback(() => {
            if (isFocused) {
                setIsLoading(true);
            } else {
                setIsLoading(true);
            }
            setFilterOption(false);
            onPageLoad();
            const keyboardDidShowListener = Keyboard.addListener(
                'keyboardDidShow',
                () => {
                    setKeyboardVisible(true);
                },
            );
            const keyboardDidHideListener = Keyboard.addListener(
                'keyboardDidHide',
                () => {
                    setKeyboardVisible(false);
                },
            );
            return () => {
                keyboardDidHideListener.remove();
                keyboardDidShowListener.remove();
            };
        }, [netConnection]),
    );
    const HandlerGoBack = () => {
        navigation.navigate('FarmerDashboard');
    };
    function handleBackPress() {
        navigation.navigate('FarmerDashboard');
        return true;
    }
    useEffect(() => {
        onBackPress(handleBackPress);
    }, []);
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <CustomHeader path="FarmerDashboard" HandlerGoBack={HandlerGoBack} />
                <FormsTitle title={t('problem_reporting')} />

                <View style={styles.btnContainer}>
                    <TouchableOpacity
                        style={activeBtn === 1 ? styles.btnActive : styles.btn}
                        onPress={() => myProblemList()}>
                        <Text
                            style={activeBtn === 1 ? styles.btnActiveTitle : styles.btnTitle}>
                            {t('my_question')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={activeBtn === 2 ? styles.btnActive : styles.btn}
                        onPress={() => otherProblemList()}>
                        <Text
                            style={activeBtn === 2 ? styles.btnActiveTitle : styles.btnTitle}>
                            {t('other_question')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <View style={styles.loadingScreen}>
                        <LoadingScreen />
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={problemAll}
                            renderItem={({ item }) => {
                                return (
                                    <TouchableOpacity
                                        style={styles.wrapper}
                                        onPress={() =>
                                            navigateToPages('FarmerViewProblem', item.fid)
                                        }>
                                        <Text style={styles.title}>
                                            {t('problem_title')} : {item.question_title}
                                        </Text>
                                        <Text style={styles.title}>
                                            {t('date')} : {formatDateToMMDDYYYY(item.updated_at)}
                                        </Text>
                                    </TouchableOpacity>
                                );
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
                )}
            </View>
            <TouchableOpacity
                style={styles.plusIconContainer}
                onPress={() => navigateToPages('FarmerCreateProblem', 123)}>
                <Image
                    source={require('../../Common/images/plus.png')}
                    resizeMode="cover"
                    style={{ width: 50, height: 50 }}
                />
            </TouchableOpacity>
        </SafeAreaView>
    );
};
export default FarmerListProblem;
const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        fontSize: 14,
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: '2%',
    },
    btn: {
        elevation: 10,
        backgroundColor: '#FFF',
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderRadius: 10,
        width: '47%',
    },
    btnActive: {
        backgroundColor: '#a1dc17',
        elevation: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderRadius: 10,
        width: '47%',
    },
    btnActiveTitle: {
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
    },
    btnTitle: {
        textAlign: 'center',
        color: '#000',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
    },
    prevNextPage: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        position: 'relative',
        bottom: 0,
    },
    wrapper: {
        marginHorizontal: '2.5%',
        backgroundColor: '#FFF',
        marginVertical: 10,
        padding: 10,
        borderRadius: 8,
    },
    flatListItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
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
        elevation: 3,
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
        padding: 10,
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
        padding: 10,
    },
    flatlistHeight: {
        height: Dimensions.get('window').height / 4,
    },

    flatlisttitle: {
        color: '#000',
        marginVertical: 6,
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },
    flatlistitem: {},
    loadingScreen: {
        position: 'relative',
        top: 100,
    },
});
