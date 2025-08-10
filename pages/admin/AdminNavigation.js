import React from 'react';
import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from './CustomDrawer';

import Dashboard from './Dashboard';
import UserList from './userlist/UserList';
import ActivityList from './Activity/ActivityList';
import ActivityDetail from './Activity/ActivityDetail';
import ActivityReport from './Activity/ActivityReport';
import ActivityReportAWD from './Activity/ActivityReportAWD';
import ForgotPassword from './userlist/ForgetPassword';
import Information from './userlist/Information';
import LiveHood from './userlist/LiveHood';
import PlotList from './userlist/PlotList';
import CrateProblemUser from './userlist/CrateProblemUser';
import InputList from './Inputs/InputList';
import PastEnquiries from './Inputs/PastEnquiries';
import Profile from './Menu/Profile';
import ListProblem from './Problem/ListProblem';
import CreateProblem from './Problem/CrateProblem';
import ViewProblem from './Problem/ViewProblem';
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
import { Colors } from '../utils/Constants';

const Stack = createNativeStackNavigator();

function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Training" component={Training} />
      <Stack.Screen name="TraingList" component={TrainingList} />
      <Stack.Screen name="UsefulInformation" component={UsefulInformation} />
      <Stack.Screen
        name="UsefulInformationList"
        component={UsefulInformationList}
      />
      <Stack.Screen name="ProblemCreate" component={CreateProblem} />
      <Stack.Screen name="ProblemList" component={ListProblem} />
      <Stack.Screen name="ProblemView" component={ViewProblem} />
      <Stack.Screen name="OutPutList" component={OutPut} />
      <Stack.Screen name="PostNew" component={PostNew} />
      <Stack.Screen name="ViewPast" component={ViewPast} />
      <Stack.Screen name="Loan" component={LoanEnquiry} />
      <Stack.Screen name="LoanEnquiryDetail" component={LoanEnquiryDetail} />
      <Stack.Screen name="InputList" component={InputList} />
      <Stack.Screen name="WantToBuy" component={WantToBuy} />
      <Stack.Screen name="PastEnquiry" component={PastEnquiries} />
      <Stack.Screen name="activityList" component={ActivityList} />
      <Stack.Screen name="activityReport" component={ActivityReport} />
      <Stack.Screen name="ActivityReportAWD" component={ActivityReportAWD} />
      <Stack.Screen name="activityDetail" component={ActivityDetail} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="userList" component={UserList} />
      <Stack.Screen name="password" component={ForgotPassword} />
      <Stack.Screen name="information" component={Information} />
      <Stack.Screen name="livehood" component={PlotList} />
      <Stack.Screen name="CrateProblemUser" component={CrateProblemUser} />
      <Stack.Screen name="InsuranceEnquiry" component={InsuranceEnquiry} />
      <Stack.Screen name="DailySalesReport" component={DailySalesReport} />
      <Stack.Screen name="SalesDetail" component={SalesDetail} />
      <Stack.Screen name="DealerReport" component={DealerReport} />
      <Stack.Screen name="FarmerReport" component={FarmerReport} />
      <Stack.Screen
        name="FarmIncomeExpenseList"
        component={FarmIncomeExpenseList}
      />
      <Stack.Screen
        name="FarmIncomeExpenseView"
        component={FarmIncomeExpenseView}
      />
      <Stack.Screen name="AddIcome" component={AddIcome} />
      <Stack.Screen name="AddExpense" component={AddExpense} />
      <Stack.Screen
        name="PersonalInformation"
        component={PersonalInformation}
      />
      <Stack.Screen
        name="FinancialInformation"
        component={FinancialInformation}
      />
      <Stack.Screen
        name="PlotSiteProduceInformation"
        component={PlotSiteProduceInformation}
      />
      <Stack.Screen
        name="RegistationSignUpViwer"
        component={RegistationSignUpViwer}
      />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="Business" component={Business} />
    </Stack.Navigator>
  );
}

const Drawer = createDrawerNavigator();
const AdminNavigation = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        // header: () => <CustomHeader />,

        drawerType: 'slide',
        drawerPosition: 'right',
        drawerActiveTintColor: '#f8f8f8',
        drawerActiveBackgroundColor: Colors.drawer,
        overlayColor: 'transparent',
        drawerInactiveTintColor: '#FFF',
        drawerStatusBarAnimation: 'fade',
        drawerItemStyle: {
          borderBottomWidth: 1.3,
          borderBottomColor: '#baffa0',
          marginHorizontal: 20,
        },
        drawerLabelStyle: {
          marginLeft: -20,
        },
        drawerStyle: {
          backgroundColor: Colors.drawer, //dark brown //'#0f1e47',dark blue //'#1a5f3c dark green'//'#093514',green
          width: '65%', // pre-80%
          // marginTop: 50,
          marginLeft: -0.2,
        },
        sceneContainerStyle: { backgroundColor: Colors.drawer, zIndex: 100 },
      }}>
      <Drawer.Screen
        name="AdminStack"
        component={AdminStack}
        options={{ title: 'Admin Dashboard' }}
      />
    </Drawer.Navigator>
  );
};

export default AdminNavigation;

const styles = StyleSheet.create({});
