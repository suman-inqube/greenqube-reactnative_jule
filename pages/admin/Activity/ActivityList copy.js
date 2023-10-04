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

const DATA = [
    {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        title: 'First Item',
    },
    {
        id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
        title: 'Second Item',
    },
    {
        id: '58694a0f-3da1-471f-bd96-145571e29d72',
        title: 'Third Item',
    },
    {
        id: '58694a0f-3da1-471f-bd96-145571e29d72sdfsfsdfdsf',
        title: 'Third Item',
    },
    {
        id: '58694a0f-3da1-471f-bd96-145571e29d72sdfsfsdsdsdfdsf',
        title: 'Third Item',
    },
    {
        id: '58694a0f-3da1-471f-bd96-145571e29d7sdfsdfawerw2sdfsfsdfdsf',
        title: 'Third Item',
    },
];
const ActivityList = ({ navigation }) => {
    const [activityAll, setactivityAll] = useState(false);
    const [filterOption, setFilterOption] = useState(false);
    const [filterItem, setFilterItem] = useState("");
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [newToDate, setnewToDate] = useState(new Date());
    const [openFromDate, setOpenFromDate] = useState(false)
    const [openToDate, setOpenToDate] = useState(false)
    const filterOptionShow = () => {
        if (!filterOption) {
            setFilterOption(true);
        } else {
            setFilterOption(false);
        }
    }

    const fatchActivityListAPI = async (dbName, languageID, token, userID) => {
        const activityData = await getItem('activity_Data');
        if (activityData) {
            setactivityAll(activityData)
        } else {
            const response = await activityListAPI(dbName, languageID, token, userID)
            if (response) {
                setactivityAll(response.data.data)
                setItem("activity_Data", response.data.data)
            }
        }
    }

    const onchangeFilterItem = (value) => {
        setFilterItem(value);
        setFilterOption(false);
    }
    const onPageLoad = async () => {
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const userID = loginUser_data.user_id;
            fatchActivityListAPI(dbName, languageID, token, userID)

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
                        keyExtractor={(item) => item.uact_id}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity style={styles.wrapper}>
                                <View style={styles.activityListContainer}>
                                    <View style={styles.activityListItem}>
                                        <Text style={styles.title}>this {item.type}</Text>
                                        <Text style={styles.title}>Farmer/Product Na...</Text>
                                        <Text style={styles.title}>Farmer/Product Na...</Text>
                                    </View>
                                    <View style={styles.activityListItem}>
                                        <Text style={styles.title}>Farmer/Product Na...</Text>
                                        <Text style={styles.title}>Farmer/Product Na...</Text>
                                        <Text style={styles.title}>Farmer/Product Na...</Text>
                                    </View>
                                </View>
                                <Text style={styles.title}>Cycle Start Date:Aug29,2023</Text>
                            </TouchableOpacity>
                        )
                        }
                        showsVerticalScrollIndicator={false}
                    />
                    : ''
            }
            <View style={styles.prevNextPage}>
                <TouchableOpacity>
                    <Text style={styles.title}>Prev Page</Text>
                </TouchableOpacity>
                <TouchableOpacity>
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
