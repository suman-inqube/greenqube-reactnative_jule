import { FlatList, StyleSheet, Text, TouchableOpacity, View, BackHandler } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import moment from "moment";
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { trainingListAPI } from '../../../config/apiHere';
import { useTranslation } from 'react-i18next';
import FormsTitle from '../../Common/FormsTitle';
import { userCreateContext } from '../../Context/usersCreateContext';
const TrainingList = () => {
    //GQR-67
    const { loginUser_data, CustomHeader, t, AlertMesg, onBackPress, getItem, setItem, logoImage, topBanner, Root, Toast } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id, agri_user_addresses } = loginUser_data;
    //GQR-67
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [noticeList, setTrainingList] = useState([]);
    const detailItem = async (itemId) => {
        await setItem("userNoticeId", itemId);
        navigation.navigate('Training', { pagename: 'Training', noticeId: itemId });
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
        let response = await trainingListAPI(dbName, languageID, userID, state_id, district_id, subdiv_id, "supervisor", "training");
        if (response) {
            if (response.data.data.rows != 0) {
                setTrainingList(response.data.data)
                setItem("userTrainingList", response.data.data)
            } else {
                Toast.show({ text: `${t('no_data_found')}`, ...AlertMesg[0] })
            }
        }
    }
    const onPageLoad = async () => {
        const { agri_state, agri_district, agri_subdivision } = agri_user_addresses[0];
        trainingList(dbname, lan_id, user_id, agri_state.fid, agri_district.fid, agri_subdivision.fid);
    };
    useEffect(() => {
        if (isFocused) {
            onPageLoad();
            onBackPress(() => { navigation.navigate('Dashboard'); return true; })
        }
    }, [isFocused]);
    const HandlerGoBack = () => {
        navigation.navigate('Dashboard')
    }
    return (
        <>
            <View style={{ flex: 1 }} >
                <CustomHeader path='Dashboard' HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
                <FormsTitle title={t('training_support')} />
                <View>
                    {
                        noticeList ?
                            <FlatList
                                style={{ marginBottom: 300, marginHorizontal: '2.5%' }}
                                showsVerticalScrollIndicator={false}
                                data={noticeList.rows}
                                keyExtractor={(item) => item.fid}
                                renderItem={({ item, index }) => (
                                    <View style={{ marginBottom: 10 }}>
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
            <Root></Root>
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
        fontFamily: 'Poppins-Regular',
        textAlign: 'right',
        fontWeight: 'bold',
        fontStyle: 'italic',
        textDecorationLine: 'underline',
        marginTop: 20,
        fontSize: 14,
    },
    textOne:
    {
        color: 'black',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    },
})
