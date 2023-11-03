import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { userDataListAPI, usefulInfoListAPI } from '../../../config/apiHere';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import moment from "moment";
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../CustomHeader';


const UsefulInformationList = () => {
    const navigation = useNavigation();
    const [noticeList, setNoticeList] = useState([]);

    const detailItem = async (itemId) => {
       
        await setItem("userNoticeId", itemId);
        const userNoticeListData = await getItem('userNoticeId')
        console.log(userNoticeListData);
        navigation.navigate('UsefulInformation', { pagename: 'UsefulInformation', noticeId: itemId });

    }

    function UserBoxDisplay({ item, item2, item3, item4 }) {
        return (

            <View style={styles.box1}>
                <View style={styles.box1_1}>
                    <View>
                        <Text style={styles.textOne}>{item}</Text>
                        <Text>{item2}</Text>  
                    </View>
                    <View>
                        <Text style={styles.readMore}>{item4}</Text>
                    </View>
                </View>
            </View>
        );
    }

    const usefulInfoList = async (dbName, languageID, userID, state_id, district_id, subdiv_id) => {
        const userNoticeListData = await getItem('userNoticeList');
        if (userNoticeListData) {
            setNoticeList(userNoticeListData)
        } else {
        let response = await usefulInfoListAPI(dbName, languageID, userID, state_id, district_id, subdiv_id, "supervisor", "general_info");
        // console.log(JSON.stringify(response.data, null, 2));
            if (response) {
                setNoticeList(response.data.data)
                setItem("userNoticeList", response.data.data)
            }
                
        }
    }



    const onPageLoad = async () => {
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const userID = loginUser_data.user_id;
            const state_id = loginUser_data.agri_user_addresses[0].agri_state.fid;
            const district_id = loginUser_data.agri_user_addresses[0].agri_district.fid;
            const subdiv_id = loginUser_data.agri_user_addresses[0].agri_subdivision.fid;

            usefulInfoList(dbName, languageID, userID, state_id, district_id, subdiv_id)
        }
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    return (
        <View style={{ marginHorizontal: 7, marginTop: 20, }}>
            <CustomHeader path='Training List' />
        
            <View style={styles.titleContainer}>
                <Text style={[styles.title, { paddingBottom: 8, paddingTop: 4, fontWeight: '700', fontWeight: 'bold', fontSize: 18 }]}>
                    Useful Information
                </Text>
            </View>
                                <View>
                                    {
                    noticeList ?
                                            <FlatList
                            data={noticeList.rows}
                                                keyExtractor={(item) => item.fid}
                                                renderItem={({ item, index }) => (
                                                    <View style={{ marginBottom: 10 }}>
                                                        <TouchableOpacity onPress={() => detailItem(item.fid)}>
                                                            <UserBoxDisplay
                                                                item={item.post_name}
                                                               
                                                                item2={moment(item.updated_at).utc().format('YYYY-MM-DD')}
                                                                item4={"Read More"}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                )} />
                                            :
                                            ""
                                    }
                                </View>
        </View>
    )
}

    export default UsefulInformationList

const styles = StyleSheet.create({
    header:
    {
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: 'center'
    },
    titleContainer: {
        width: "95%",
        alignItems: 'flex-end',
        paddingVertical: 10,
    },
    box1:
    {
        // marginBottom: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        height: 70,
        backgroundColor: 'white',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },

    box1_1: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
    },
    boxMenu:
    {
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        backgroundColor: 'white',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },
    readMore:
    {
        color: "lightblue",
        fontFamily: "Arial",
        textAlign: 'right',
        fontWeight: 'bold',
        fontStyle: 'italic',
        textDecorationLine: 'underline',
        marginTop: 20,
    },
    textOne:
    {
        color: "black",
        fontFamily: "Arial",
        fontWeight: 'bold',
    },
})
