import { Alert, BackHandler, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import ImageForm from '../../Common/ImageForm';
import InputTextFormWithoutLabel from '../../Common/InputTextFormWithoutLabel';
// import { userDataListAPI, loanRouteFarmerListAPI } from '../../../config/apiHere';
import { userDataListAPI } from './UsersAPI';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import ForgotPassword from './ForgetPassword';
import Information from './Information';
import LiveHood from './LiveHood';
import CustomHeader from '../CustomHeader';
import { useRoute, useFocusEffect, useNavigation, useIsFocused } from '@react-navigation/native';
import LoadingScreen from '../../Common/LoadingScreen';
const UserList = ({ navigation }) => {
    const isFocused = useIsFocused();
    const [isLoading, setIsLoading] = useState(false);
    const [userList, setuserList] = useState([]);
    const [userListRow, setuserListRow] = useState([]);
    const [expandedItem, setExpandedItem] = useState(null);
    const [showMenu, setshowMenu] = useState();
    const [userID, setuserID] = useState();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: '',
        languageID: '',
        token: '',
        userID: '',
        currentPageNo: 1,
        firstArrayIndex: 20,
        secondArrayIndex: 40,
    });

    function MenuBoxDisplay({ farmeruserID, agri_land_user_rels, menuName }) {

        const handleMenu = (menuName) => {
            const PlotdataArray = [];
            if (menuName == 'livehood') {
                agri_land_user_rels.agri_land_user_rels.map((data, index) => {
                    PlotdataArray.push({
                        value: data.rel_id,
                        label: data.plot_no
                    });
                })
            }

            let file_path = "";
            if (agri_land_user_rels.agri_files[0] != undefined) {
                file_path = agri_land_user_rels.agri_files[0].file_path;
            }
            if (menuName == "information1") {
                navigation.navigate("ProblemCreate")
            } else {
                navigation.navigate(menuName, {
                    farmeruserID: farmeruserID,
                    agri_land_user_rels: PlotdataArray,
                    userName: agri_land_user_rels.userName,
                    contactNumber: agri_land_user_rels.contactNumber,
                    profileImage: file_path,
                    gender: agri_land_user_rels.gender,
                    farmer_type: agri_land_user_rels.farmer_type
                });
            }
        }

        return (
            <View style={styles.boxMenu}>
                <View style={styles.box1_1}>
                    <TouchableOpacity onPress={() => handleMenu("password")}>
                        <View style={{ alignItems: 'center' }}>
                            <ImageForm source={require('../../Common/images/change_password_green.png')} resizeMode="cover" height={30} width={30} />
                            <Text style={styles.title}>{'   Forgot\nPassword'}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleMenu("information")}>
                        <View style={{ alignItems: 'center' }}>
                            <ImageForm source={require('../../Common/images/add_info_plus.png')} resizeMode="cover" height={30} width={30} />
                            <Text style={[styles.title, { marginVertical: 8 }]}>Information</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleMenu("livehood")}>
                        <View style={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                            <ImageForm source={require('../../Common/images/add_plot_plus.png')} resizeMode="cover" height={30} width={30} />
                            <Text style={styles.title}>{'Livehood\n  Details'}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleMenu("information1")}>
                        <View style={{ alignItems: 'center' }}>
                            <ImageForm source={require('../../Common/images/add_qust_plus.png')} resizeMode="cover" height={30} width={30} />
                            <Text style={[styles.title, { marginVertical: 8 }]}>Q&A</Text>
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
    const receiveDataFromChild = () => {
        setshowMenu(null);

    }
    const handleBack = () => {
        navigation.navigate("Dashboard");
    }
    const toggleItem = (itemId) => {
        if (expandedItem === itemId) {
            setExpandedItem(null);
        } else {
            setExpandedItem(itemId);
        }
    }
    const userDataListAPI1 = async (dbName, languageId, token, user_id) => {
        setIsLoading(true);
        let response = await userDataListAPI(dbName, languageId, token, user_id);
        const totalPage = Math.ceil(response.data.data.count / 20)
        if (response.status === 200) {
            setIsLoading(false);
            setuserList(response.data.data.rows);
            setuserListRow(response.data.data.rows);
            setItem("userListData", response.data.data)
        } else {
            setIsLoading(false);
            const userListData = await getItem('userListData');
            setuserList(userListData.rows)
        }
    }

    const onPageLoad = async () => {
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const userID = loginUser_data.user_id;
            const compCode = loginUser_data.sa_company[0].company_code;
            // const loanRouteFarmer=await loanRouteFarmerListAPI(dbName, languageID, token, userID);
            // console.log(JSON.stringify(loanRouteFarmer.data.data.rows[5]))
            userDataListAPI1(dbName, languageID, token, userID)
        }
    };
    useEffect(() => {
        if (isFocused) {
            onPageLoad();
            const onBackPress = () => {
                setuserList([]);
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
    }, [isFocused]);
    const handlePage = (value) => {
        // currentPageNo
        if (value == "next") {
            if (userListRow.length >= dbLanTokUsr.firstArrayIndex) {
                setuserList(userListRow.slice(dbLanTokUsr.firstArrayIndex, dbLanTokUsr.secondArrayIndex));
                setdbLanTokUsr({
                    ...dbLanTokUsr,
                    currentPageNo: dbLanTokUsr.currentPageNo + 1,
                    firstArrayIndex: dbLanTokUsr.firstArrayIndex * 2,
                    secondArrayIndex: dbLanTokUsr.secondArrayIndex * 2,
                })
            }
        } else {
            setuserList(userListRow.slice(dbLanTokUsr.firstArrayIndex, dbLanTokUsr.secondArrayIndex));
            setdbLanTokUsr({
                ...dbLanTokUsr,
                currentPageNo: dbLanTokUsr.currentPageNo - 1,
                firstArrayIndex: dbLanTokUsr.firstArrayIndex / 2,
                secondArrayIndex: dbLanTokUsr.secondArrayIndex / 2,
            })
        }
    }
    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <CustomHeader path='Dashboard' />
            <View style={{ marginTop: 20, flex: 1 }}>
                <View style={styles.header}>
                    <View style={{ alignItems: 'center' }}>
                        <ImageForm source={require('../../Common/images/farmer.png')} resizeMode="cover" height={40} width={40} />
                        <Text style={styles.title}>{userList.count} Users</Text>
                    </View>
                    <Text style={styles.title}>User List</Text>
                </View>
                <View style={{ paddingVertical: 7, marginHorizontal: '3%' }}>
                    <InputTextFormWithoutLabel placeholder={'Search Phone by Number'} />
                </View>
                <View style={{ backgroundColor: '#e7e7e7' }}>
                    <View style={styles.LoadingScreen}>
                        {isLoading ? <LoadingScreen /> : null}
                    </View>
                    {
                        userList ?
                            <FlatList
                                data={userList}
                                // style={{ marginBottom:188, paddingTop: 10 }}
                                style={userList.length != 0 ? { marginBottom: 188, paddingTop: 10 } : ""}
                                keyExtractor={(item) => item.user_id}
                                renderItem={({ item, index }) => {
                                    if (index <= 20) {
                                        return (
                                            <View style={{ marginBottom: 10, marginHorizontal: '3%', backgroundColor: '#FFF', borderRadius: 20 }}>
                                                <TouchableOpacity onPress={() => toggleItem(item.user_id)}>
                                                    <UserBoxDisplay
                                                        item={item.userName}
                                                        item2={item.contactNumber}
                                                        item3={item.CreateDateTime.substring(-1, 10)}
                                                        item4={"Plot/Site " + item.agri_land_user_rels.length}
                                                    />
                                                    {
                                                        expandedItem === item.user_id && (
                                                            <MenuBoxDisplay farmeruserID={item.user_id} agri_land_user_rels={item} />
                                                        )
                                                    }
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    }
                                }} />
                            : ""

                    }
                </View>
                <View style={styles.prevNextPage}>
                    <TouchableOpacity
                        onPress={() => handlePage('previous')}
                    >
                        <Text style={styles.title}>Prev Page</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handlePage('next')}
                    >
                        <Text style={styles.title}>Next Page</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default UserList

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
        paddingVertical: 20
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
        fontSize: 13,
        color: '#000',
        marginVertical: 1,
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
        left: '45%'
    }
})
