import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import ImageForm from '../../Common/ImageForm';
import InputTextFormWithoutLabel from '../../Common/InputTextFormWithoutLabel';
import { userDataListAPI } from '../../../config/apiHere';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import ForgotPassword from './ForgetPassword';
import Information from './Information';
import LiveHood from './LiveHood';
import CustomHeader from '../CustomHeader';

const UserList = ({ navigation }) => {
    const [userList, setuserList] = useState([]);
    const [expandedItem, setExpandedItem] = useState(null);
    const [showMenu, setshowMenu] = useState();
    const [userID, setuserID] = useState();
    

    function MenuBoxDisplay({ farmarID,menuName }) {
        const handleMenu = (menuName) => {
            navigation.navigate(menuName, { farmarID });
            // console.warn(userID,menuName)
            // setshowMenu(menuName)
            // setuserID(userID)
        }
        return (
            <View style={styles.boxMenu}>
                <View style={styles.box1_1}>
                    <TouchableOpacity onPress={() => handleMenu("password")}>
                        <View style={{ alignItems: 'center' }}>
                            <ImageForm source={require('../../Common/images/change_password_green.png')} resizeMode="cover" height={30} width={30} />
                            <Text>Password</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleMenu("information")}>
                        <View style={{ alignItems: 'center' }}>
                            <ImageForm source={require('../../Common/images/add_info_plus.png')} resizeMode="cover" height={30} width={30} />
                            <Text>Information</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleMenu("livehood")}>
                        <View style={{ alignItems: 'center' }}>
                            <ImageForm source={require('../../Common/images/add_plot_plus.png')} resizeMode="cover" height={30} width={30} />
                            <Text>Livehood</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleMenu("information1")}>
                        <View style={{ alignItems: 'center' }}>
                            <ImageForm source={require('../../Common/images/add_qust_plus.png')} resizeMode="cover" height={30} width={30} />
                            <Text>Q&A</Text>
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
                        <Text>{item}</Text>
                        <Text>{item2}</Text>
                        <Text>{item3}</Text>
                    </View>
                    <View>
                        <Text>{item4}</Text>
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
        const userListData = await getItem('userListData');
        if (userListData) {
            setuserList(userListData)
        } else {
            let response = await userDataListAPI(dbName, languageId, token, user_id);
            if (response) {
                setuserList(response.data.data)
                setItem("userListData", response.data.data)
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
            const compCode = loginUser_data.sa_company[0].company_code;
            userDataListAPI1(dbName, languageID, token, userID)
        }
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    return (
        <>
        <CustomHeader path='Dashboard' />
        <View style={{ marginHorizontal: 7, marginTop: 20, }}>
            <>
                <View style={styles.header}>
                    <ImageForm source={require('../../Common/images/farmer.png')} resizeMode="cover" height={40} width={40} />
                    <Text>{userList.count}</Text>
                    <Text>User List</Text>
                </View>
                <View style={{ paddingVertical: 7 }}>
                    <InputTextFormWithoutLabel />
                </View>
                <View>
                    {
                        userList ?
                            <FlatList
                                data={userList.rows}
                                keyExtractor={(item) => item.user_id}
                                renderItem={({ item, index }) => (
                                    <View style={{ marginBottom: 10 }}>
                                        <TouchableOpacity onPress={() => toggleItem(item.user_id)}>
                                            <UserBoxDisplay
                                                item={item.userName}
                                                item2={item.contactNumber}
                                                item3={item.CreateDateTime}
                                                item4={"Plot/Site " + item.agri_land_user_rels.length}
                                            />
                                            {
                                                expandedItem === item.user_id && (
                                                    <MenuBoxDisplay userID={item.user_id} />
                                                )
                                            }
                                        </TouchableOpacity>
                                    </View>
                                )} />
                            :
                            ""
                    }
                </View>
            </>

        </View>
        </>
    )
}
export default UserList
const styles = StyleSheet.create({
    header:
    {
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: 'center'
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
        // marginBottom: 10,
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

    containerflat: {
        flex: 1,
        padding: 16,
    },
    itemflat: {
        backgroundColor: '#f0f0f0',
        padding: 8,
        marginBottom: 8,
    },
})
