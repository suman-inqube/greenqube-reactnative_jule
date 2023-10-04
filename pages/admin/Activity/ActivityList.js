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


const ActivityList = ({ navigation }) => {
    const [activityAll, setactivityAll] = useState(false);
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

    const fatchActivityListAPI = async (dbName1, languageID1, token1, userID1, pageNO1) => {
        const response = await activityListAPI(dbName1, languageID1, token1, userID1, pageNO1)
        if (response) {
            const totalPage1 = Math.ceil(response.data.data.count / 20)
            settotalPage(totalPage1)
            // console.log(JSON.stringify(response.data.data.rows[0].typeActivity.categoryName,null,2))
            setactivityAll(response.data.data)

            // setItem("activity_Data", response.data.data)
        }

    }



    const handlePage = (value) => {
        const page_no = currentPage
        if (value === 'next') {

            if (totalPage === currentPage) {

                console.warn("if",currentPage);
            }
            else {
                const nextPage = currentPage + 1
                console.warn("else", nextPage);
            }
        }

    }
    const handlePage1 = (value) => {
        const page_no = pageNOInfo.pageNO
        if (value === 'next') {
            console.warn("total page:",pageNOInfo);
            if (page_no === pageNOInfo.totalPage) {
                fatchActivityListAPI(loginInfo.dbName, loginInfo.languageID, loginInfo.token, loginInfo.userID, loginInfo.totalPage)
            }
            else {
                const nextPage = pageNOInfo.pageNO + 1
                setpageNOInfo({ ...pageNOInfo, pageNO: nextPage })
                console.warn("next:",pageNOInfo);
                fatchActivityListAPI(loginInfo.dbName, loginInfo.languageID, loginInfo.token, loginInfo.userID, nextPage)
            }
        }

    }

    const handleOpenDetailspage=(item)=>
    {
        console.warn(item);
    }
    const onPageLoad = async () => {
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName1 = loginUser_data.dbname;
            const languageID1 = loginUser_data.lan_id;
            const token1 = loginUser_data.token;
            const userID1 = loginUser_data.user_id;
            setDbName(dbName1);
            setLanguageID(languageID1);
            setToken(token1);
            setUserID(userID1);
            fatchActivityListAPI(dbName1, languageID1, token1, userID1, currentPage)
        }
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    return (


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
            <WidgetsSide location={"ActivityReport"} title={"Report Activity"} />
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
                        data={activityAll.rows}
                        renderItem={({ item }) => {
                            return (
                                <TouchableOpacity style={styles.wrapper} onPress={() => handleOpenDetailspage(item.uact_id)}>
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
                                    <Text style={styles.title}>Activity Name :{item.cropActivity.activity.categoryName}</Text>
                                </TouchableOpacity>
                            )
                        }}
                        keyExtractor={item => item.uact_id}
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
