import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import Dashboard from './Dashboard';
import CustomHeader from './CustomHeader';
import { getItem, setItem } from '../../config/getDataFromStorage';
import { fpodetailsDataListAPI } from '../../config/apiHere';
import UserList from './userlist/UserList';
import ActivityList from './Activity/ActivityList';
import ActivityDetail from './Activity/ActivityDetail';

const Drawer = createDrawerNavigator();
const AdminNavigation = () => {

    let fpoDetailsList = async (dbName, languageID, token, userID, compCode) => {
        let response = await fpodetailsDataListAPI(dbName, languageID, token, userID, compCode);

        if (response.data) {
            const agri_files = response.data.data[0].agri_files;


            const foundbotomBannerFind = agri_files.find((item) => item.term_type === 'fpo_promobanner');
            await setItem("bottomBannerData", foundbotomBannerFind.file_path)


            const foundlogoFindFind = agri_files.find((item) => item.term_type === 'fpo_logo');
            await setItem("logoImageData", foundlogoFindFind.file_path)


            const foundtopBannerFind = agri_files.find((item) => item.term_type === 'fpo_banner');
            await setItem("topBannerData", foundtopBannerFind.file_path)
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
            fpoDetailsList(dbName, languageID, token, userID, compCode);
            await setItem("userNameData", loginUser_data.userName)
            const profileImg = loginUser_data.agri_files.find((item) => item.term_type === '1');
            await setItem("profileImgData", profileImg.file_path)
        }
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    return (
        <Drawer.Navigator
            drawerPosition="right"
            screenOptions={{
                header: () => <CustomHeader />,
            }}>
        {/* <Drawer.Navigator> */}
            < Drawer.Screen name="Dashboard" component={Dashboard} />
            < Drawer.Screen name="activityList" component={ActivityList} />
            < Drawer.Screen name="userList" component={UserList} />
        </Drawer.Navigator >
    )
}

export default AdminNavigation

const styles = StyleSheet.create({})
