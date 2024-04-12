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
import CrateProblemUser from './userlist/CrateProblemUser';

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
import InsuranceEnquiry from './Insurance/InsuranceEnquiry';
import DailySalesReport from './DailySalesReport/DailySalesReport';
import SalesDetail from './DailySalesReport/SalesDetail';
import DealerReport from './DailySalesReport/DealerReport';
import FarmerReport from './DailySalesReport/FarmerReport';

import FarmIncomeExpenseList from './FarmIncomeExpense/FarmIncomeExpenseList';
import FarmIncomeExpenseView from './FarmIncomeExpense/FarmIncomeExpenseView';
import AddIcome from './FarmIncomeExpense/AddIcome';
import AddExpense from './FarmIncomeExpense/AddExpense';

import PersonalInformation from './UserRegistation/PersonalInformation';
import FinancialInformation from './UserRegistation/FinancialInformation';
import PlotSiteProduceInformation from './UserRegistation/PlotSiteProduceInformation';
import RegistationSignUpViwer from './UserRegistation/RegistationSignUpViwer';
import ChangePassword from './ChangePassword/ChangePassword';
import Business from './Business/Business';
const Drawer = createDrawerNavigator();
const AdminNavigation = () => {
    return (
        <Drawer.Navigator
            drawerContent={props => <CustomDrawer />}
            screenOptions={{
                headerShown: false,
                // header: () => <CustomHeader options={{unmountOnBlur:true}} />,
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
                    marginTop: 50,
                    // position: 'absolute',
                    // top: 40,
                },
                // style: { backgroundColor: "transparent", opacity: 0, shadowOpacity: 0, shadowColor: "transparent" }

            }}>



            <Drawer.Screen name="Dashboard" component={Dashboard} />

            <Drawer.Screen name="Training" component={Training} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="TraingList" component={TrainingList} />

            <Drawer.Screen name="UsefulInformation" component={UsefulInformation} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="UsefulInformationList" component={UsefulInformationList} options={{ gestureEnabled: false }} />

            <Drawer.Screen name="ProblemCreate" component={CreateProblem} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="ProblemList" component={ListProblem} options={{ gestureEnabled: false }} />
            <Drawer.Screen name="ProblemView" component={ViewProblem} options={{ unmountOnBlur: true, gestureEnabled: false }} />

            <Drawer.Screen name="OutPutList" component={OutPut} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="PostNew" component={PostNew} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="ViewPast" component={ViewPast} options={{ unmountOnBlur: true, gestureEnabled: false }} />

            <Drawer.Screen name="Loan" component={LoanEnquiry} options={{ gestureEnabled: false }} />
            <Drawer.Screen name="LoanEnquiryDetail" component={LoanEnquiryDetail} options={{ unmountOnBlur: true, gestureEnabled: false }} />

            <Drawer.Screen name="InputList" component={InputList} options={{ gestureEnabled: false }} />
            <Drawer.Screen name="WantToBuy" component={WantToBuy} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="PastEnquiry" component={PastEnquiries} options={{ unmountOnBlur: true, gestureEnabled: false }} />

            <Drawer.Screen name="activityList" component={ActivityList} options={{ gestureEnabled: false }} />
            <Drawer.Screen name="activityReport" component={ActivityReport} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="activityDetail" component={ActivityDetail} options={{ unmountOnBlur: true, gestureEnabled: false }} />

            <Drawer.Screen name="Profile" component={Profile} options={{ unmountOnBlur: true, gestureEnabled: false }} />

            <Drawer.Screen name="userList" component={UserList} options={{ gestureEnabled: false }} />
            <Drawer.Screen name="password" component={ForgotPassword} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="information" component={Information} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="livehood" component={LiveHood} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="CrateProblemUser" component={CrateProblemUser} options={{ unmountOnBlur: true, gestureEnabled: false }} />

            <Drawer.Screen name="InsuranceEnquiry" component={InsuranceEnquiry} options={{ unmountOnBlur: true, gestureEnabled: false }} />

            <Drawer.Screen name="DailySalesReport" component={DailySalesReport} options={{ gestureEnabled: false }} />
            <Drawer.Screen name="SalesDetail" component={SalesDetail} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="DealerReport" component={DealerReport} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="FarmerReport" component={FarmerReport} options={{ unmountOnBlur: true, gestureEnabled: false }} />

            <Drawer.Screen name="FarmIncomeExpenseList" component={FarmIncomeExpenseList} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="FarmIncomeExpenseView" component={FarmIncomeExpenseView} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="AddIcome" component={AddIcome} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="AddExpense" component={AddExpense} options={{ unmountOnBlur: true, gestureEnabled: false }} />

            <Drawer.Screen name="PersonalInformation" component={PersonalInformation} options={{ gestureEnabled: false }} />
            <Drawer.Screen name="FinancialInformation" component={FinancialInformation} options={{ gestureEnabled: false }} />
            <Drawer.Screen name="PlotSiteProduceInformation" component={PlotSiteProduceInformation} options={{ gestureEnabled: false }} />
            <Drawer.Screen name="RegistationSignUpViwer" component={RegistationSignUpViwer} options={{ gestureEnabled: false }} />

            <Drawer.Screen name="ChangePassword" component={ChangePassword} options={{ unmountOnBlur: true, gestureEnabled: false }} />
            <Drawer.Screen name="Business" component={Business} options={{ unmountOnBlur: true, gestureEnabled: false }} />


        </Drawer.Navigator>
    )
}

export default AdminNavigation

const styles = StyleSheet.create({})
