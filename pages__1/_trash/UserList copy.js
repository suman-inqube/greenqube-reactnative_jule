import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import ImageForm from '../Common/ImageForm';
import InputTextFormWithoutLabel from '../Common/InputTextFormWithoutLabel';
import { userDataListAPI } from '../../config/apiHere';
import { getItem } from '../../config/getDataFromStorage';

const data = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
    // Add more data items as needed
];
function UserBoxDisplay({ name1, name2, name3, name4 }) {
    return (

        <View style={styles.box1}>
            <View style={styles.box1_1}>
                <View>
                    <Text>{name1}</Text>
                    <Text>{name2}</Text>
                    <Text>{name3}</Text>
                </View>
                <View>
                    <Text>{name4}</Text>
                </View>
            </View>
        </View>
    );
}
function MenuBoxDisplay({ name, name1, imageurl }) {
    return (
        <View style={styles.boxMenu}>
            <View style={styles.box1_1}>
                <ImageForm source={require('../Common/images/change_password_green.png')} resizeMode="cover" height={30} width={30} />
                <ImageForm source={require('../Common/images/add_info_plus.png')} resizeMode="cover" height={30} width={30} />
                <ImageForm source={require('../Common/images/add_plot_plus.png')} resizeMode="cover" height={30} width={30} />
                <ImageForm source={require('../Common/images/add_qust_plus.png')} resizeMode="cover" height={30} width={30} />
            </View>
        </View>


    );
}
const UserList = () => {
    const [flag, setflag] = useState(0);
    const [showHide, setshowHide] = useState(0);
    const [userListData, setuserListData] = useState([]);
    const handleShowHide = (num) => {
        if (flag === 0) {
            setshowHide(0);
            setflag(num);
        }
        else {
            setshowHide(num);
            setflag(num);
        }
        console.log(showHide);
    }

    let userListApi = async (dbname, languageID, token, userID) => {
        let response = await userDataListAPI(dbname, languageID, token, userID);
        // console.log(JSON.stringify(response.data.data, null, 2));
        if (response.data) {
            setuserListData(JSON.stringify(response.data.data));
        }

    }
    const onLoadPage = async () => {
        const loginUser_data = await getItem('loginUser_data');
        // console.log('Readable log:', JSON.stringify(loginUser_data.sa_company[0].company_code, null, 2));
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const userID = loginUser_data.user_id;
            userListApi(dbName, languageID, token, userID);
        }
    }
    useEffect(() => {
        onLoadPage();
    }, []);
    return (
        <View style={{ marginHorizontal: 7, marginTop: 20, }}>
            <View style={styles.header}>
                <ImageForm source={require('../Common/images/farmer.png')} resizeMode="cover" height={40} width={40} />
                <Text>User List</Text>
                <Text>User List</Text>
            </View>
            <View style={{ paddingVertical: 7 }}>
                <InputTextFormWithoutLabel />
            </View>

            {
                userListData ?
                    // userListData.rows.map((item) =>
                    // (
                    //     <View style={styles.itemflat} key={item.id}>
                    //         <Text>{userListData}</Text>
                    //     </View>
                    // )
                    // )
                    // <FlatList
                    //     data={userListData.rows}
                    //     keyExtractor={(item) => item.fid}
                    //     renderItem={({ item }) => (
                    //         <View style={styles.itemflat} key={item.fid}>
                    //             <Text>{item.fid}</Text>
                    //         </View>
                    //     )}
                    // />
                    <View style={styles.itemflat}>
                        <Text>total cournt{userListData.count}</Text>
                    </View>
                    :
                    ""
            }

            {/* <TouchableOpacity onPress={() => handleShowHide(1)}>
                <UserBoxDisplay name="User" name1="Registration" />
            </TouchableOpacity>
            {
                showHide === 1 ?
                    <MenuBoxDisplay name="User" name1="Registration" />
                    : ""
            } */}


        </View>
    )
}

export default UserList

const styles = StyleSheet.create({
    header:
    {
        flex: 1,
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
