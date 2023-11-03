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
import ActivityReport from './Activity/ActivityReport';

import ForgotPassword from './userlist/ForgetPassword';
import Information from './userlist/Information';
import LiveHood from './userlist/LiveHood';

import InputList from './Inputs/InputList';
import PastEnquiries from './Inputs/PastEnquiries';
import Profile from './Menu/Profile';
import ListProblem from './Problem/ListProblem';
import CreateProblem from './Problem/CrateProblem';
import ViewProblem from './Problem/ViewProblem';
import CustomDrawer from './CustomDrawer';
import WantToBuy from './Inputs/WantToBuy';

import OutPut from './Output/OutPut';
import PostNew from './Output/PostNew';
import ViewPast from './Output/ViewPast';

import LoanEnquiry from './Loan/LoanEnquiry';
import LoanEnquiryDetail from './Loan/LoanEnquiryDetail';
import Training from './Training/Training';
import TrainingList from './Training/TrainingList';
import UsefulInformation from './Usefullinformation/UsefulInformation';
import UsefulInformationList from './Usefullinformation/UsefulInformationList';


const Drawer = createDrawerNavigator();
const AdminNavigation = () => {

    let fpoDetailsList = async (dbName, languageID, token, userID, compCode) => {
        let response = await fpodetailsDataListAPI(dbName, languageID, token, userID, compCode);

        if (response.data) {
            const agri_files = response.data.data[0].agri_files;


            const foundbotomBannerFind = agri_files.find((item) => item.term_type === 'fpo_promobanner');
            // console.log(foundbotomBannerFind);
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
            // console.log(loginUser_data);
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
            drawerContent={props => <CustomDrawer />}
            screenOptions={{
                headerShown: false,
                // header: () => <CustomHeader />,
                drawerPosition: 'right',
                drawerActiveTintColor: '#f8f8f8',
                drawerActiveBackgroundColor: '#093514',
                drawerInactiveTintColor: '#FFF',
                drawerStatusBarAnimation: 'fade',
                drawerItemStyle: {
                    borderBottomWidth: 1.3,
                    borderBottomColor: '#baffa0',
                    marginHorizontal: 20
                },
                drawerLabelStyle: {
                    marginLeft: -20
                },
                // overlayColor: 'transparent',
                drawerStyle: {
                    backgroundColor: '#093514',
                    width: '80%',
                    marginTop: 50
                    // position: 'absolute',
                    // top: 40,

                },
            }}>

                

            <Drawer.Screen name="Dashboard" component={Dashboard} />

            <Drawer.Screen name="Trainig" component={Training} />
            <Drawer.Screen name="TraingList" component={TrainingList} />

            <Drawer.Screen name="UsefulInformation" component={UsefulInformation} />
            <Drawer.Screen name="UsefulInformationList" component={UsefulInformationList} />

            <Drawer.Screen name="ProblemCreate" component={CreateProblem} />
            <Drawer.Screen name="ProblemList" component={ListProblem} />
            <Drawer.Screen name="ProblemView" component={ViewProblem} />
         
            <Drawer.Screen name="OutPutList" component={OutPut} />
            <Drawer.Screen name="PostNew" component={PostNew} /> 
            <Drawer.Screen name="ViewPast" component={ViewPast} />

            <Drawer.Screen name="Loan" component={LoanEnquiry} />
            <Drawer.Screen name="LoanEnquiryDetail" component={LoanEnquiryDetail} />    

            <Drawer.Screen name="InputList" component={InputList} />
            <Drawer.Screen name="WantToBuy" component={WantToBuy} />
            <Drawer.Screen name="PastEnquiry" component={PastEnquiries} />
        
            <Drawer.Screen name="activityList" component={ActivityList} />
            <Drawer.Screen name="activityReport" component={ActivityReport} />
            <Drawer.Screen name="activityDetail" component={ActivityDetail} />

            <Drawer.Screen name="Profile" component={Profile} />

            <Drawer.Screen name="userList" component={UserList} />
            <Drawer.Screen name="password" component={ForgotPassword} />
            <Drawer.Screen name="information" component={Information} />
            <Drawer.Screen name="livehood" component={LiveHood} />


        </Drawer.Navigator >
    )
}

export default AdminNavigation

const styles = StyleSheet.create({})
