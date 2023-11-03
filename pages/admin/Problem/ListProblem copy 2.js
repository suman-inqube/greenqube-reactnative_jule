import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity , SafeAreaView, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react';
import Filter from '../../Common/Filter';
import DatePickerComp from '../../Common/DatePickerComp';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import { problemListAPI } from '../../../config/apiHere';
import { useFocusEffect } from '@react-navigation/native';
import LoadingScreen from '../../Common/LoadingScreen';
import CustomHeader from '../CustomHeader';
const ListProblem
    = ({ navigation }) => {
        const [isLoading, setIsLoading] = useState(false);
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

        const handleDatePicker = (item) => {
            const dt = new Date(item);
            const x = dt.toISOString().split('T');
            const x1 = x[0].split('-');
            const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
            setfromDate(effective_date)
            setFromDateFilter(effective_date)
            // console.log(fromAndToDate);
        }

        const handleDatePicker2 = async (item) => {
            const dt = new Date(item);
            const x = dt.toISOString().split('T');
            const x1 = x[0].split('-');
            const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
            setToDate(fromDateFilter)
            if (fromDateFilter) {
                const searchItem = '';
                const from_date = fromDateFilter;
                const to_date = effective_date;
                const mobileNo='';
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
            setFilterItem(value);
            setFilterOption(false);
        }

        const handlePage = async (value) => {
            setIsLoading(true)
            const currentPageNo = dbLanTokUsr.pageNo
            const totalPage = dbLanTokUsr.totalPage
            // return console.warn(currentPageNo);
            if (value === 'next') {
                if (totalPage === currentPageNo) {
                    setIsLoading(false)
                    return;
                }
                else {
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
                    setIsLoading(false)
                    return;
                }
                else {
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

        const handleFilter = async (item) => {

            if (filterItem === 'date') {
                return;
            }
            else if (filterItem === 'PhoneNumber') {
                const searchItem = '';
                const from_date = '';
                const to_date = '';
                const response = await problemListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.supervisorId, dbLanTokUsr.pageNo, searchItem, from_date, to_date, item)
                if (response) {
                    setProblemAll(response.data.data.rows)
                    setItem("problem_Data", response.data.data)
                }
            }

            else {

                const mobileNo = '';
                const from_date = '';
                const to_date = '';
                const response = await problemListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.supervisorId, dbLanTokUsr.pageNo, item, from_date, to_date, mobileNo)
                if (response) {
                    setProblemAll(response.data.data.rows)
                    setItem("problem_Data", response.data.data)
                }
            }
        }


        const onPageLoad = async () => {
            const loginUser_data = await getItem('loginUser_data');
            // console.warn(loginUser_data);
            if (loginUser_data) {
                const dbName = loginUser_data.dbname;
                const languageId = loginUser_data.lan_id;
                const token = loginUser_data.token;
                const supervisorId = loginUser_data.user_id;
                const response = await problemListAPI(dbName, languageId, supervisorId, dbLanTokUsr.pageNo)
                if (response) {

                    const totalPage = Math.ceil(response.data.data.count / 20)
                    setdbLanTokUsr({
                        ...dbLanTokUsr,
                        dbName: dbName,
                        languageId: languageId,
                        token: token,
                        supervisorId: supervisorId,
                        totalPage: totalPage,
                    });
                    // console.warn(JSON.stringify(response.data.data.rows,null,2));
                    // setactivityAll((prevData) => [...prevData, ...response.data.data.rows]);
                    setProblemAll(response.data.data.rows)
                    setProblemAllRaw(response.data.data.rows)
                    setItem("problem_Data", response.data.data)
                    setIsLoading(false)
                }
            }
        };
        useEffect(() => {
            onPageLoad();
        }, []);

        useFocusEffect(
            React.useCallback(() => {
                onPageLoad();
            }, [])
        );

        return (
            <>
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
                        title="Problem List"
                    />


                    {isLoading ? (
                        <LoadingScreen />
                    ) : (
                        <FlatList
                            data={problemAll}
                            renderItem={({ item }) => {
                                return (
                                    <TouchableOpacity style={styles.wrapper} onPress={() => navigateToPages('ProblemView', item.fid)}>
                                        <Text style={styles.title}>Title : {item.question_title}</Text>
                                        <View style={styles.flatListItem}>
                                            <Text style={styles.title}>Name : {item.agri_user.userName}</Text>
                                            <Text style={styles.title}>Phone : {item.agri_user.contactNumber}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                            keyExtractor={(item, index) => index}
                        />
                    )
                    }

                    <TouchableOpacity style={styles.plusIconContainer} onPress={() => navigateToPages('ProblemCreate', 123)}>
                        <Image
                            source={require('../../Common/images/plus.png')}
                            resizeMode="cover" style={{ width: 50, height: 50 }}
                        />
                    </TouchableOpacity>
                    <View style={styles.prevNextPage}>
                        <TouchableOpacity onPress={() => handlePage('previous')}>
                            <Text style={styles.title}>Prev Page</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handlePage('next')}>
                            <Text style={styles.title}>Next Page</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </>
        )
    }

export default ListProblem


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