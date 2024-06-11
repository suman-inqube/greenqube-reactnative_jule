import { FlatList, StyleSheet, Text, TouchableOpacity, View, TextInput, Keyboard } from 'react-native'
import React, { useState, useEffect, useCallback, useContext } from 'react'
import ImageForm from '../../Common/ImageForm';
import { userDataListAPI } from './UsersAPI';
import { useIsFocused } from '@react-navigation/native';
//GQR-66
import { userCreateContext } from '../../Context/usersCreateContext';
//GQR-66
const UserList = ({ navigation }) => {
    //GQR-66
    const { dbLanTokUsr, setdbLanTokUsr, loginUser_data, LoadingScreen, CustomHeader, t, AlertMesg, onBackPress, getItem,
        setItem, logoImage, topBanner, Root, Toast } = useContext(userCreateContext);
    //GQR-66
    const isFocused = useIsFocused();
    const [isLoading, setIsLoading] = useState(false);
    const [userList, setuserList] = useState([]);
    const [expandedItem, setExpandedItem] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    function MenuBoxDisplay({ farmeruserID, agri_land_user_rels, menuName }) {
        const handleMenu = (menuName) => {
            const PlotdataArray = agri_land_user_rels?.agri_land_user_rels.map(data => ({ value: data.rel_id, label: data.plot_no }))
            let file_path = "";
            if (agri_land_user_rels.agri_files[0] != undefined) {
                file_path = agri_land_user_rels.agri_files[0].file_path;
            }
            navigation.navigate(menuName, {
                farmeruserID: farmeruserID, agri_land_user_rels: PlotdataArray, userName: agri_land_user_rels.userName, contactNumber: agri_land_user_rels.contactNumber, profileImage: file_path, gender: agri_land_user_rels.gender, farmer_type: agri_land_user_rels.farmer_type
            });
        }
        return (
            <View style={styles.boxMenu}>
                <View style={styles.box1_1}>
                    <TouchableOpacity onPress={() => handleMenu("password")}>
                        <View style={{ alignItems: 'center' }}>
                            <ImageForm source={require('../../Common/images/change_password_green.png')} resizeMode="cover" height={30} width={30} />
                            <Text style={styles.titleBottom}>{t('forgot_password')}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleMenu("information")}>
                        <View style={{ alignItems: 'center' }}>
                            <ImageForm source={require('../../Common/images/add_info_plus.png')} resizeMode="cover" height={30} width={30} />
                            <Text style={[styles.titleBottom, { marginVertical: 8 }]}>{t('far_list_information')}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleMenu("livehood")}>
                        <View style={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                            <ImageForm source={require('../../Common/images/add_plot_plus.png')} resizeMode="cover" height={30} width={30} />
                            <Text style={styles.titleBottom}>{t('farming_details')}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleMenu("CrateProblemUser")}>
                        <View style={{ alignItems: 'center' }}>
                            <ImageForm source={require('../../Common/images/add_qust_plus.png')} resizeMode="cover" height={30} width={30} />
                            <Text style={[styles.titleBottom, { marginVertical: 8 }]}>{t('q_a')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    function UserBoxDisplay({ item, item2, item3, item4 }) {
        return (
            <View style={styles.box1}>
                <View style={styles.box1_1}>
                    <View>
                        <Text style={styles.title}>{item}</Text>
                        <Text style={styles.title}>{item2}</Text>
                        <Text style={styles.title}>{item3}</Text>
                    </View>
                    <View>
                        <Text style={styles.title}>{item4}</Text>
                    </View>
                </View>
            </View>
        );
    }
    const toggleItem = useCallback((itemId) => {
        if (expandedItem === itemId) {
            setExpandedItem(null);
        } else {
            setExpandedItem(itemId);
        }
    }, [])
    const userDataListAPI1 = async (dbName, languageId, token, user_id) => {
        setIsLoading(true);
        let response = await userDataListAPI(dbName, languageId, token, user_id, dbLanTokUsr.pageNo, '');
        if (response.status === 200) {
            setPhoneNumber('');
            const totalPage = Math.ceil(response.data.data.count / 20);
            setdbLanTokUsr({
                ...dbLanTokUsr,
                pageNo: 1,
                currentPage: '',
                totalPage: totalPage
            });
            setIsLoading(false);
            setuserList(response.data.data)
            setItem("userListData", response.data.data)
        } else {
            setIsLoading(false);
            const userListData = await getItem('userListData');
            setuserList(userListData)
        }
    }
    const onPageLoad = async () => {
        const { dbname, lan_id, token, user_id } = loginUser_data;
        userDataListAPI1(dbname, lan_id, token, user_id);
    };
    const handleBackPress = () => {
        navigation.navigate('Dashboard'); return true;
    }
    useEffect(() => {
        if (isFocused) {
            if (phoneNumber == "") {
                onPageLoad();
            }
            onBackPress(handleBackPress);
        }
    }, [isFocused]);
    const handlePage = async (value) => {
        let currentPage = dbLanTokUsr.pageNo + 1;
        if (value === 'next') {
            if (dbLanTokUsr.totalPage >= currentPage) {
                setIsLoading(true);
                setdbLanTokUsr({ ...dbLanTokUsr, pageNo: currentPage })
                const response = await userDataListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, currentPage, '');
                if (response.status === 200) {
                    setIsLoading(false);
                    setuserList(response.data.data);
                }
            } else {
                setIsLoading(false);
                Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] })
            }
        } else if (value === 'previous') {
            let currentPage = dbLanTokUsr.pageNo - 1;
            if (dbLanTokUsr.pageNo !== 1) {
                setIsLoading(true);
                setdbLanTokUsr({ ...dbLanTokUsr, pageNo: currentPage })
                const response = await userDataListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, currentPage, '');
                if (response.status === 200) {
                    setIsLoading(false);
                    setuserList(response.data.data);
                }
            }
        }
    }
    const searchByPhoneNumber = async () => {
        Keyboard.dismiss();
        const response = await userDataListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, '0', phoneNumber);
        if (response.status === 200) {
            if (response.data.data.count != 0) {
                setuserList(response.data.data);
            } else {
                Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] })
            }
        }
    }
    const changePhoneNumber = useCallback((num) => {
        setPhoneNumber(num);
        if (num == "") {
            Keyboard.dismiss();
            userDataListAPI1(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId);
        }
    }, [])
    const HandlerGoBack = () => {
        setuserList([]);
        setPhoneNumber('');
        navigation.navigate('Dashboard')
    }
    return (
        <Root>
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <CustomHeader path='Dashboard' HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
                <View style={{ marginTop: 10, flex: 1 }}>
                    <View style={styles.header}>
                        <View style={{ alignItems: 'center' }}>
                            <ImageForm source={require('../../Common/images/farmer.png')} resizeMode="cover" height={40} width={40} />
                            <Text style={styles.title}>{userList && userList.count} {t('farmers')}</Text>
                        </View>
                        <Text style={[styles.title, { fontWeight: '700', fontSize: 17 }]}>{t('farmer_list')}</Text>
                    </View>
                    <View style={styles.searchContainer}>
                        <View style={styles.textInputContainer}>
                            <TextInput placeholder={t('search_phone_by_number')}
                                keyboardType='numeric'
                                placeholderTextColor={'#000'} maxLength={10} style={styles.textInput}
                                onChangeText={(num) => changePhoneNumber(num)} value={phoneNumber} />
                        </View>
                        <TouchableOpacity onPress={searchByPhoneNumber} style={styles.searchIcon}>
                            <ImageForm source={require('../../Common/images/search.png')} resizeMode="cover" height={40} width={40} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ backgroundColor: '#e7e7e7' }}>
                        <View style={styles.LoadingScreen}>
                            {isLoading ? <LoadingScreen /> : null}
                        </View>
                        {userList ?
                            <>
                                <View style={styles.LoadingScreen}>
                                    {isLoading ? <LoadingScreen /> : null}
                                </View>
                                <FlatList
                                    initialNumToRender={7}
                                    showsVerticalScrollIndicator={false}
                                    data={userList.rows}
                                    style={userList && userList.count != 0 ? typeof userList.rows == "object" ? { marginBottom: 188, paddingTop: 10 } : "" : ""}
                                    keyExtractor={(item) => item.user_id}
                                    renderItem={({ item, index }) => (
                                        <View style={{ marginBottom: 10, marginHorizontal: '3%', backgroundColor: '#FFF', borderRadius: 20 }}>
                                            <TouchableOpacity onPress={() => toggleItem(item.user_id)} activeOpacity={0.7}>
                                                <UserBoxDisplay
                                                    item={item.userName}
                                                    item2={item.contactNumber}
                                                    item3={item.CreateDateTime.substring(-1, 10)}
                                                    item4={t('plots') + " : " + item.agri_land_user_rels.length}
                                                />
                                                {
                                                    expandedItem === item.user_id && (
                                                        <MenuBoxDisplay farmeruserID={item.user_id} agri_land_user_rels={item} />
                                                    )
                                                }
                                            </TouchableOpacity>
                                        </View>
                                    )
                                    } />
                            </>
                            : ""}
                    </View>
                    <View style={styles.prevNextPage}>
                        {userList && userList.count != 0 ?
                            <TouchableOpacity onPress={() => handlePage('previous')}  >
                                <Text style={styles.title}>{t('prev_page')}</Text>
                            </TouchableOpacity> : null}

                        {userList && userList.count != 0 ? <TouchableOpacity onPress={() => handlePage('next')} >
                            <Text style={styles.title}>{t('next_page')}</Text>
                        </TouchableOpacity> : null}
                    </View>
                </View>
            </View>
        </Root>
    )
}
const styles = StyleSheet.create({
    header:
    {
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: 'center',
        marginHorizontal: '10%'
    },
    box1:
    {
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        height: 80,
        backgroundColor: 'white',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 1,
        paddingVertical: 30
    },
    box1_1: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20
    },
    boxMenu: {
        borderBottomStartRadius: 10,
        borderBottomEndRadius: 10,
        borderTopWidth: 1,
        borderColor: 'green',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        header: 150,
        elevation: 2,
        paddingVertical: 10
    },
    containerflat: {
        flex: 1,
        padding: 16,
    },
    itemflat: {
        backgroundColor: '#f0f0f0',
        padding: 8,
        marginBottom: 8,
    },
    title: {
        color: '#000',
        lineHeight: 25,
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    },
    titleBottom: {
        color: '#000',
        fontFamily: 'Poppins-Regular'
    },
    prevNextPage: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#ffffff'
    },
    LoadingScreen: {
        position: 'absolute',
        top: 100,
        left: '45%',
        zIndex: 999
    },
    searchContainer: {
        marginHorizontal: '3%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        alignItems: 'center',
        paddingHorizontal: 10,
        borderRadius: 10,
        marginVertical: 7,
        elevation: 1,
        backgroundColor: '#FFF',
    },
    textInput: {
        height: 45,
        width: '100%',
        color: '#000',
        fontFamily: 'Poppins-Regular',
        lineHeight: 18
    },
    searchIcon: {
        width: '10%',
    },
    textInputContainer: {
        width: '90%',
    }
});
export default UserList;
