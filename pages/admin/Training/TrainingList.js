import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect } from 'react'
// import { userDataListAPI, trainingListAPI } from '../../../../config/apiHere';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import moment from "moment";
import { useNavigation } from '@react-navigation/native';
import { trainingListAPI } from '../../../config/apiHere';
import CustomHeader from '../CustomHeader';


const TrainingList = () => {
    const navigation = useNavigation();
    const [noticeList, setTrainingList] = useState([]);

    const detailItem = async (itemId) => {

        await setItem("userNoticeId", itemId);
        const userNoticeListData = await getItem('userNoticeId')
        console.log(userNoticeListData);
        navigation.navigate('Trainig', { pagename: 'Trainig', noticeId: itemId });

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

    const trainingList = async (dbName, languageID, userID, state_id, district_id, subdiv_id) => {
        const trainingListData = await getItem('userTrainingList');
        if (trainingListData) {
            setTrainingList(trainingListData)
        } else {
            let response = await trainingListAPI(dbName, languageID, userID, state_id, district_id, subdiv_id, "supervisor", "training");
        
             console.log(JSON.stringify(response.data, null, 2));
            if (response) {
                setTrainingList(response.data.data)
                setItem("userTrainingList", response.data.data)
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

            trainingList(dbName, languageID, userID, state_id, district_id, subdiv_id)
        }
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    return (
        <>
        
        <View style={{ marginHorizontal: 7, marginTop: 20, }}>
        <CustomHeader path='Training List' />
            <View style={styles.titleContainer}>
                <Text style={[styles.title, { paddingBottom: 8, paddingTop: 4, fontWeight: '700', fontWeight: 'bold', fontSize: 18 }]}>
                    Training
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

        </>
    )
}

export default TrainingList

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
