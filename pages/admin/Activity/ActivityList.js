import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    StatusBar
} from 'react-native'
import React, { useEffect, useState } from 'react';
import ImageForm from '../../Common/ImageForm';
import RadioForm from '../../Common/RadioForm';
import DatePickerComp from '../../Common/DatePickerComp';
import WidgetsSide from '../../Common/WidgetsSide';
import Filter from '../../Common/Filter';
import { activityListAPI } from '../../../config/apiHere';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import ActivityDetail from './ActivityDetail';
import ActivityReport from './ActivityReport';


const ActivityList = ({ navigation }) => {
    const [activityAll, setactivityAll] = useState([]);
    const [filterOption, setFilterOption] = useState(false);
    const [filterItem, setFilterItem] = useState("");
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [newToDate, setnewToDate] = useState(new Date());
    const [openFromDate, setOpenFromDate] = useState(false)
    const [openToDate, setOpenToDate] = useState(false)
    const [dbName, setDbName] = useState('')
    const [languageID, setLanguageID] = useState('')
    const [userID, setUserID] = useState('')
    const [token, setToken] = useState('');
    const [totalPage, settotalPage] = useState(1);
    const [currentPage, setcurrentPage] = useState(1);
    const [showMenu, setshowMenu] = useState('');
    const [farmerID, setfarmerID] = useState();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        pageNo: 1
    });

    const [dbLanTokUsr1, setdbLanTokUsr1] = useState({});
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

    const fatchActivityListAPI = async (dbName, languageId, token, supervisorId, pageNo) => {

        const response = await activityListAPI(dbName, languageId, token, supervisorId, pageNo)
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
            setactivityAll((prevData) => [...prevData, ...response.data.data.rows]);
            // setactivityAll(response.data.data)
            setItem("activity_Data", response.data.data)
        }

    }

    const handlePage = async (value) => {
        // console.warn(dbLanTokUsr);
        const currentPageNo = dbLanTokUsr.pageNo
        const totalPage = dbLanTokUsr.totalPage

        if (value === 'next') {
            if (totalPage === currentPageNo) {
                const response = await activityListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, currentPage)
                if (response) {
                    setactivityAll(response.data.data.rows);
                }

            }
            else {
                const nextPage = currentPageNo + 1
                setdbLanTokUsr({ ...dbLanTokUsr, pageNo: nextPage })
                const response = await activityListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, nextPage)
                if (response) {
                    setactivityAll(response.data.data.rows);
                }
            }
        }

        if (value === 'previous') {
            if (currentPageNo === 1) {
                const response = await activityListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, currentPage)
                if (response) {
                    setactivityAll(response.data.data.rows);
                }
            }
            else {
                const prePage = currentPageNo - 1
                setdbLanTokUsr({ ...dbLanTokUsr, pageNo: prePage })
                const response = await activityListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, prePage)
                if (response) {
                    setactivityAll(response.data.data.rows);
                }
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



            fatchActivityListAPI(dbName, languageId, token, supervisorId, 1)
        }
    };
    const navigateToPages = (pageName, uact_id) => {
        navigation.navigate(pageName, { uact_id });
    };

    useEffect(() => {
        onPageLoad();
    }, []);
    return (

        <>
            {

                <View style={{ flex: 1 }}>
                    <StatusBar
                        barStyle="dark-content"
                        backgroundColor={"white"}
                        translucent
                    />

                    <DatePickerComp
                        openDate={openFromDate}
                        newDate={newFromDate}
                        setOpenDate={setOpenFromDate}
                    />
                    <DatePickerComp
                        openDate={openToDate}
                        newDate={newToDate}
                        setOpenDate={setOpenToDate}
                    />

                    <WidgetsSide location={"ActivityReport"} title={"Report Activity"} onPress={() => navigateToPages('activityReport', 123)} />

                    <Filter
                        filterItem={filterItem}
                        filterOption={filterOption}
                        setOpenToDate={setOpenToDate}
                        filterOptionShow={filterOptionShow}
                        onchangeFilterItem={onchangeFilterItem}
                    />

                    {

                        activityAll ?
                            <FlatList
                                data={activityAll}
                                renderItem={({ item }) => {
                                    return (
                                        <TouchableOpacity style={styles.wrapper} onPress={() => navigateToPages('activityDetail', item.uact_id)}>
                                            <View style={styles.activityListContainer}>
                                                <View style={styles.activityListItem}>
                                                    <Text style={styles.title}>Name : {item.agri_user.userName}</Text>
                                                    <Text style={styles.title}>Plot Name : {item.land_info.plot_no}</Text>
                                                    <Text style={styles.title}>Perform Date : {item.act_perform_date}</Text>
                                                </View>
                                                <View style={styles.activityListItem}>
                                                    <Text style={styles.title}>Phone : {item.agri_user.contactNumber}</Text>
                                                    <Text style={styles.title}>Produce : {item.cropName.name}</Text>
                                                    <Text style={styles.title}>Deviation : {item.deviation} Day</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.title}>Cycle Start Date : {item.cycle_start_date}</Text>
                                            <Text style={styles.title}>Activity Name :{item.cropActivity ? item.cropActivity.activity.categoryName : ''}</Text>

                                        </TouchableOpacity>
                                    )
                                }}
                                keyExtractor={(item, index) => index}
                                showsVerticalScrollIndicator={false}
                            />
                            : ''
                    }

                    <View style={styles.prevNextPage}>
                        <TouchableOpacity onPress={() => handlePage('previous')}>
                            <Text style={styles.title}>Prev Page</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handlePage('next')}>
                            <Text style={styles.title}>Next Page</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }

        </>
    )
}

export default ActivityList

const styles = StyleSheet.create({
    wrapper: {
        borderColor: '#efe9e9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        borderRadius: 7,
        elevation: 3,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 15,
        marginVertical: 7,
        paddingHorizontal: 20,
        paddingVertical: 15,
        // height: 100,

    },
    activityListContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    activityListItem: {
        paddingBottom: 5
    },
    prevNextPage: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        position: 'relative',
        bottom: 0
    },
    title: {
        color: '#000',
        fontSize: 15
    },
    OptionWrapper: {
        borderColor: '#efe9e9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        borderRadius: 7,
        elevation: 3,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 15,
        marginVertical: 7,
        paddingHorizontal: 20,
        paddingVertical: 10,
    }

})
