import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect, useCallback, useContext } from 'react'
import { usefulInfoListAPI } from '../../../config/apiHere';
import moment from "moment";
import { useFocusEffect, useNavigation, useRoute, useIsFocused, StackActions } from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
const UsefulInformationList = () => {
    //GQR-67
    const { loginUser_data, CustomHeader, t, AlertMesg, onBackPress, setItem, logoImage, topBanner, Root, Toast, FormsTitle, } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id, agri_user_addresses } = loginUser_data;
    //GQR-67
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [noticeList, setNoticeList] = useState([]);
    const detailItem = async (itemId) => {
        await setItem("userNoticeId", itemId);
        navigation.navigate('UsefulInformation', { pagename: 'UsefulInformation', noticeId: itemId });
    }
    function UserBoxDisplay({ item, item2, item3, item4 }) {
        return (
            <View style={styles.box1}>
                <View style={styles.box1_1}>
                    <View style={{ width: '80%' }}>
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
        let response = await usefulInfoListAPI(dbName, languageID, userID, state_id, district_id, subdiv_id, "supervisor", "general_info");
        if (response?.status == 200) {
            if (response.data.data.rows != 0) {
                setNoticeList(response.data.data)
                setItem("userNoticeList", response.data.data)
            } else {
                Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] })
            }
        }
    }
    const onPageLoad = async () => {
        const { agri_state, agri_district, agri_subdivision } = agri_user_addresses[0];
        usefulInfoList(dbname, lan_id, user_id, agri_state.fid, agri_district.fid, agri_subdivision.fid);
    };
    useEffect(() => {
        if (isFocused) {
            onPageLoad();
        }
    }, [isFocused]);
    const handleBackPress = () => {
        navigation.navigate('Dashboard'); return true;
    }
    useFocusEffect(
        useCallback(() => {
            onBackPress(handleBackPress);
        }, [])
    );
    const HandlerGoBack = () => navigation.navigate('Dashboard');
    return (
        <Root>
            <View style={{ flex: 1 }} >
                <CustomHeader path='Dashboard' HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
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
        marginHorizontal: '2.5%',
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
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },
    textOne:
    {
        color: 'black',
        // color: "black",
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },
})
