import { BackHandler, Button, FlatList, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { userDataListAPI, usefulInfoListAPI } from '../../../config/apiHere';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import moment from "moment";
import CustomHeader from '../CustomHeader';
import { useFocusEffect, useNavigation, useRoute, useIsFocused, StackActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import FormsTitle from '../../Common/FormsTitle';
const UsefulInformationList = () => {
    const isFocused = useIsFocused();
    const { t } = useTranslation();
    const scheme = useColorScheme();
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
                    <View style={{width:'80%'}}>
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
        // if (userNoticeListData) {
        //     setNoticeList(userNoticeListData)
        // } else {
        let response = await usefulInfoListAPI(dbName, languageID, userID, state_id, district_id, subdiv_id, "supervisor", "general_info");
        if (response) {
            if (response.data.data.rows != 0) {
                setNoticeList(response.data.data)
                setItem("userNoticeList", response.data.data)
            } else {
                Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] })
            }
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
            usefulInfoList(dbName, languageID, userID, state_id, district_id, subdiv_id)
        }
    };
    useEffect(() => {
        if (isFocused) {
            onPageLoad();
        }
    }, [isFocused]);
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => { navigation.navigate('Dashboard'); return true; };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );
    const HandlerGoBack = () => {
        navigation.navigate('Dashboard');
    }
    return (
        <Root>
            <View style={{ flex: 1 }} >
                <CustomHeader path='Dashboard' HandlerGoBack={HandlerGoBack} />
                <FormsTitle title={t('dash_useful_information')} />
                <View style={{ flex: 1 }}>
                    {
                        noticeList ?
                            <FlatList
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
        </Root>
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
        marginHorizontal:'2.5%',
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
        color: "#18a7d7",
        textAlign: 'right',
        fontStyle: 'italic',
        textDecorationLine: 'underline',
        marginTop: 20,
        fontFamily:'Poppins-Regular',
        fontSize:14,
    },
    textOne:
    {
        color: 'black',
        // color: "black",
        fontFamily:'Poppins-Regular',
        fontSize:14,
    },
})
