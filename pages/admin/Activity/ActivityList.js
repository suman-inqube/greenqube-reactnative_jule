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
import React, { useState } from 'react';
import ImageForm from '../../Common/ImageForm';
import RadioForm from '../../Common/RadioForm';
import DatePickerComp from '../../Common/DatePickerComp';
import WidgetsSide from '../../Common/WidgetsSide';
import Filter from '../../Common/Filter';


const ActivityList = ({ navigation }) => {
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
    const onchangeFilterItem = (value) => {
        setFilterItem(value);
        setFilterOption(false);
    }
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
            <View>
            </View>
            <FlatList
                data={DATA}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity style={styles.wrapper}>
                            <View style={styles.activityListContainer}>
                                <View style={styles.activityListItem}>
                                    <Text style={styles.title}>Farmer/Product Na...</Text>
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
                }}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
            />
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
