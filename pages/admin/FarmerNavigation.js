import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import FarmerDashboard from './FarmerDashboard';
import CustomHeader from './CustomHeader';
import { getItem, setItem } from '../../config/getDataFromStorage';
import { fpodetailsDataListAPI } from '../../config/apiHere';
import FarmerActivityList from './FarmerActivity/FarmerActivityList';
import FarmerActivityDetail from './FarmerActivity/FarmerActivityDetail';
import FarmerActivityReport from './FarmerActivity/FarmerActivityReport';
import FarmerActivityReportAWD from './FarmerActivity/FarmerActivityReportAWD';
import FarmerInputList from './FarmerInputs/FarmerInputList';
import FarmerPastEnquiries from './FarmerInputs/FarmerPastEnquiries';
import FarmerProfile from './FarmerProfile/FarmerProfile';
import FarmerListProblem from './FarmerProblem/FarmerListProblem';
import FarmerCreateProblem from './FarmerProblem/FarmerCrateProblem';
import FarmerViewProblem from './FarmerProblem/FarmerViewProblem';
import FarmerDrawer from './FarmerDrawer';
import FarmerWantToBuy from './FarmerInputs/FarmerWantToBuy';

import FarmerOutPut from './FarmerOutput/FarmerOutPut';
import FarmerPostNew from './FarmerOutput/FarmerPostNew';
import FarmerViewPast from './FarmerOutput/FarmerViewPast';
import PlotListFarmer from './FarmerProductDetails/PlotListFarmer';
// import FarmerLiveHood from './FarmerProductDetails/FarmerLiveHood';
import FarmerChangePassword from './FarmerProfile/FarmerChangePassword';

import FarmerLoanEnquiry from './FarmerLoan/FarmerLoanEnquiry';
import FarmerLoanEnquiryDetail from './FarmerLoan/FarmerLoanEnquiryDetail';
import FarmerTraining from './Training/FarmerTraining';
import FarmerTrainingList from './Training/FarmerTrainingList';
import FarmerUsefulInformation from './Usefullinformation/FarmerUsefulInformation';
import FarmerUsefulInformationList from './Usefullinformation/FarmerUsefulInformationList';
import FarmerInsuranceEnquiry from './FarmerInsurance/FarmerInsuranceEnquiry';
import DailySalesReport from './DailySalesReport/DailySalesReport';
import SalesDetail from './DailySalesReport/SalesDetail';
import DealerReport from './DailySalesReport/DealerReport';
import FarmerReport from './DailySalesReport/FarmerReport';

import FarmerFarmIncomeExpenseList from './FarmerFarmIncomeExpense/FarmerFarmIncomeExpenseList';
import FarmerFarmIncomeExpenseView from './FarmerFarmIncomeExpense/FarmerFarmIncomeExpenseView';
import FarmerAddIncome from './FarmerFarmIncomeExpense/FarmerAddIncome';
import FarmerAddExpense from './FarmerFarmIncomeExpense/FarmerAddExpense';
import Weather from './Weather/Weather';
import Calculator from './Calculator';
import PackageOfPractices from './PackageOfPractices';
import PackageOfPracticesDetails from './PackageOfPractices/PackageOfPracticesDetails';
import PackageItemDetails from './PackageOfPractices/PackageItemDetails';
import SoilHealthManagement from './SoilHealth';
import PostRequest from './SoilHealth/PostRequest';
import MySoil from './SoilHealth/MySoil';
import SampleRequested from './SoilHealth/SampleRequested';
import SampleReport from './SoilHealth/SampleReport';
import AudioPlayerView from '../Common/AudioPlayerView';
import FarmerInstrumentWiseActivityDetails from './FarmerActivity/FarmerInstrumentWiseActivityDetails';
import FarmerInstrumentWiseActivityView from './FarmerActivity/FarmerInstrumentWiseActivityView';

const Drawer = createDrawerNavigator();
const FarmerNavigation = () => {
    return (
      <Drawer.Navigator
        drawerContent={props => <FarmerDrawer />}
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
            marginHorizontal: 20,
          },
          drawerLabelStyle: {
            marginLeft: -20,
          },
          drawerStyle: {
            backgroundColor: '#093514',
            width: '80%',
            marginTop: 50,
          },
        }}>
        <Drawer.Screen name="FarmerDashboard" component={FarmerDashboard} />
        <Drawer.Screen
          name="FarmerLiveHood"
          component={PlotListFarmer}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerTraining"
          component={FarmerTraining}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerTrainingList"
          component={FarmerTrainingList}
          // options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerUsefulInformation"
          component={FarmerUsefulInformation}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerUsefulInformationList"
          component={FarmerUsefulInformationList}
          // options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerCreateProblem"
          component={FarmerCreateProblem}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerListProblem"
          component={FarmerListProblem}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerViewProblem"
          component={FarmerViewProblem}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerOutPutList"
          component={FarmerOutPut}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerPostNew"
          component={FarmerPostNew}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerViewPast"
          component={FarmerViewPast}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerLoan"
          component={FarmerLoanEnquiry}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerLoanEnquiryDetail"
          component={FarmerLoanEnquiryDetail}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerInputList"
          component={FarmerInputList}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerWantToBuy"
          component={FarmerWantToBuy}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerPastEnquiry"
          component={FarmerPastEnquiries}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerActivityList"
          component={FarmerActivityList}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerActivityReport"
          component={FarmerActivityReport}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerActivityReportAWD"
          component={FarmerActivityReportAWD}
          options={{unmountOnBlur: true}}
        />

        <Drawer.Screen
          name="FarmerActivityDetail"
          component={FarmerActivityDetail}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerProfile"
          component={FarmerProfile}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerInsuranceEnquiry"
          component={FarmerInsuranceEnquiry}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="DailySalesReport"
          component={DailySalesReport}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="SalesDetail"
          component={SalesDetail}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="DealerReport"
          component={DealerReport}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerReport"
          component={FarmerReport}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerFarmIncomeExpenseList"
          component={FarmerFarmIncomeExpenseList}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerFarmIncomeExpenseView"
          component={FarmerFarmIncomeExpenseView}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerAddIncome"
          component={FarmerAddIncome}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerAddExpense"
          component={FarmerAddExpense}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="FarmerChangePassword"
          component={FarmerChangePassword}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="Weather"
          component={Weather}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="Calculator"
          component={Calculator}
          options={{unmountOnBlur: true, gestureEnabled: false}}
        />
        <Drawer.Screen
          name="PackageOfPractices"
          component={PackageOfPractices}
          options={{unmountOnBlur: true, gestureEnabled: false}}
        />
        <Drawer.Screen
          name="PackageOfPracticesDetails"
          component={PackageOfPracticesDetails}
          options={{unmountOnBlur: true, gestureEnabled: false}}
        />
        <Drawer.Screen
          name="PackageItemDetails"
          component={PackageItemDetails}
          options={{unmountOnBlur: true, gestureEnabled: false}}
        />
        <Drawer.Screen
          name="SoilHealthManagement"
          component={SoilHealthManagement}
          options={{unmountOnBlur: true, gestureEnabled: false}}
        />
        <Drawer.Screen
          name="PostRequest"
          component={PostRequest}
          options={{unmountOnBlur: true, gestureEnabled: false}}
        />
        <Drawer.Screen
          name="MySoil"
          component={MySoil}
          options={{unmountOnBlur: true, gestureEnabled: false}}
        />
        <Drawer.Screen
          name="AudioPlayerView"
          component={AudioPlayerView}
          options={{unmountOnBlur: true, gestureEnabled: false}}
        />
          <Drawer.Screen
          name="FarmerInstrumentWiseActivityView"
          component={FarmerInstrumentWiseActivityView}
          // options={{unmountOnBlur: true, gestureEnabled: false}}
        />
            <Drawer.Screen
          name="FarmerInstrumentWiseActivityDetails"
          component={FarmerInstrumentWiseActivityDetails}
          options={{unmountOnBlur: true, gestureEnabled: false}}
        />
      </Drawer.Navigator>
    );
}

export default FarmerNavigation
