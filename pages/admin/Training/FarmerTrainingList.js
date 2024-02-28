import { BackHandler, Button, FlatList, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
// import { userDataListAPI, trainingListAPI } from '../../../../config/apiHere';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import moment from "moment";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { faremerTrainingListAPI, cropListApi } from '../../../config/apiHere';
import CustomHeader from '../CustomHeader';
import { useTranslation } from 'react-i18next';
import FormsTitle from '../../Common/FormsTitle';
import { onBackPress } from '../../Common/BackPressHandler';
const FarmerTrainingList = () => {
    const { t } = useTranslation();
    const scheme = useColorScheme();
    const navigation = useNavigation();
    const [noticeList, setTrainingList] = useState([]);

    const detailItem = async (itemId) => {

        await setItem("userNoticeId", itemId);
        const userNoticeListData = await getItem('userNoticeId')
        console.log(userNoticeListData);
        navigation.navigate('FarmerTraining', { pagename: 'FarmerTraining', noticeId: itemId });
    }
    function handleBackPress() {
        navigation.navigate("FarmerDashboard");
        return true;
    }
    useEffect(() => {
        onBackPress(handleBackPress);
    }, [])
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

    const trainingList = async (dbName, languageID, userID, state_id, district_id, subdiv_id, cropId) => {
        const trainingListData = await getItem('userTrainingList');
        // if (trainingListData) {
        //     setTrainingList(trainingListData)
        // } else {
        let response = await faremerTrainingListAPI(dbName, languageID, userID, state_id, district_id, subdiv_id, cropId, "farmer", "training");
        if (response) {
            setTrainingList(response.data.data)
            setItem("userTrainingList", response.data.data)
        }

        // }
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
            const response = await cropListApi(dbName, languageID, userID);
            if (response.status == 200) {
                let cropId = "";
                const datam = response.data.data.rows
                datam.map(async (item) => {
                    cropId = cropId + item.crop_name_id + ",";
                });
                const newCropId = cropId.substring(0, cropId.length - 1);
                trainingList(dbName, languageID, userID, state_id, district_id, subdiv_id, newCropId)
                // console.log(JSON.stringify(newCropId, null, 2));
            }
        }
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => { navigation.navigate('FarmerDashboard'); return true; };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );
    const HandlerGoBack = () => {
        navigation.navigate('FarmerDashboard');
    }
    return (
        <>
            <View style={{ flex: 2 }} >
                <CustomHeader path='FarmerDashboard' HandlerGoBack={HandlerGoBack} />
                <FormsTitle title={t('training_support')} />
                <View style={{ flex: 1 }}>
                    {
                        noticeList ?
                            <FlatList
                                style={{ marginHorizontal: '2.5%' }}
                                data={noticeList.rows}
                                keyExtractor={(item) => item.fid}
                                renderItem={({ item, index }) => (
                                    <View>
                                        <TouchableOpacity onPress={() => detailItem(item.fid)}>
                                            <UserBoxDisplay
                                                item={item.post_name}

                                                item2={moment(item.updated_at).utc().format('YYYY-MM-DD')}
                                                item4={t('read_more')}
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

export default FarmerTrainingList

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
        marginBottom: 10,
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
        color: 'black',
        fontFamily: "Arial",
        fontWeight: 'bold',
    },
})
