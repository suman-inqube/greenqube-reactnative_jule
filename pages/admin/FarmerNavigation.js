import {StatusBar, StyleSheet} from 'react-native';
import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FarmerDrawer from './FarmerDrawer';

// All Screens
import FarmerDashboard from './FarmerDashboard';
import PlotListFarmer from './FarmerProductDetails/PlotListFarmer';
import FarmerActivityPlotWise from './FarmerProductDetails/FarmerActivityPlotWise';

import FarmerTraining from './Training/FarmerTraining';
import FarmerTrainingList from './Training/FarmerTrainingList';
import FarmerUsefulInformation from './Usefullinformation/FarmerUsefulInformation';
import FarmerUsefulInformationList from './Usefullinformation/FarmerUsefulInformationList';
import FarmerCreateProblem from './FarmerProblem/FarmerCrateProblem';
import FarmerListProblem from './FarmerProblem/FarmerListProblem';
import FarmerViewProblem from './FarmerProblem/FarmerViewProblem';
// import FarmerOutPut from './FarmerOutput/FarmerOutPut';
import FarmerPostNew from './FarmerOutput/FarmerPostNew';
import FarmerViewPast from './FarmerOutput/FarmerViewPast';
import FarmerLoanEnquiry from './FarmerLoan/FarmerLoanEnquiry';
import FarmerLoanEnquiryDetail from './FarmerLoan/FarmerLoanEnquiryDetail';
import FarmerLoanViewPastRequested from './FarmerLoan/FarmerViewPastRequested';
import FarmerLoanRequest from './FarmerLoan/FarmerLoanRequest';
import FarmerInputList from './FarmerInputs/FarmerInputList';
import FarmerWantToBuy from './FarmerInputs/FarmerWantToBuy';
import FarmerPastEnquiries from './FarmerInputs/FarmerPastEnquiries';
import FarmerActivityList from './FarmerActivity/FarmerActivityList';
import FarmerActivityReport from './FarmerActivity/FarmerActivityReport';
import FarmerActivityReportAWD from './FarmerActivity/FarmerActivityReportAWD';
import FarmerActivityDetail from './FarmerActivity/FarmerActivityDetail';
import FarmerProfile from './FarmerProfile/FarmerProfile';
import FarmerInsuranceEnquiry from './FarmerInsurance/FarmerInsuranceEnquiry';
import FarmerInsuViewPastRequested from './FarmerInsurance/FarmerViewPastRequested';
import FarmerRequestForInsurance from './FarmerInsurance/FarmerRequestForInsurance';
import DailySalesReport from './DailySalesReport/DailySalesReport';
import SalesDetail from './DailySalesReport/SalesDetail';
import DealerReport from './DailySalesReport/DealerReport';
import FarmerReport from './DailySalesReport/FarmerReport';
import FarmerFarmIncomeExpenseList from './FarmerFarmIncomeExpense/FarmerFarmIncomeExpenseList';
import FarmerFarmIncomeExpenseView from './FarmerFarmIncomeExpense/FarmerFarmIncomeExpenseView';
import FarmerAddIncome from './FarmerFarmIncomeExpense/FarmerAddIncome';
import FarmerAddExpense from './FarmerFarmIncomeExpense/FarmerAddExpense';
import FarmerChangePassword from './FarmerProfile/FarmerChangePassword';
import Weather from './Weather/Weather';
import Calculator from './Calculator';
import PestisideCalculator from './Calculator/PestisideCalculator';
import FertilizerCalculator from './Calculator/FertilizerCalculator';
import PackageOfPractices from './PackageOfPractices';
import PackageOfPracticesDetails from './PackageOfPractices/PackageOfPracticesDetails';
import PackageItemDetails from './PackageOfPractices/PackageItemDetails';
import SoilHealthManagement from './SoilHealth';
import PostRequest from './SoilHealth/PostRequest';
import MySoil from './SoilHealth/MySoil';
import SampleRequested from './SoilHealth/SampleRequested';
import SampleReport from './SoilHealth/SampleReport';
import AudioPlayerView from '../Common/AudioPlayerView';
import {Colors} from '../utils/Constants';
import FarmerInstrumentWiseActivityView from './FarmerActivity/FarmerInstrumentWiseActivityView';
import FarmerInstrumentWiseActivityDetails from './FarmerActivity/FarmerInstrumentWiseActivityDetails';
import FarmerUpcomingActivity from './FarmerActivity/FarmerUpcomingActivity';
import FarmerPendingActivity from './FarmerActivity/FarmerPendingActivity';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const FarmerMainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: {backgroundColor: 'transparent'},
    }}>
    <Stack.Screen name="FarmerDashboard" component={FarmerDashboard} />
    <Stack.Screen name="FarmerLiveHood" component={PlotListFarmer} />
    <Stack.Screen
      name="FarmerActivityPlotWise"
      component={FarmerActivityPlotWise}
    />

    <Stack.Screen name="FarmerTraining" component={FarmerTraining} />
    <Stack.Screen name="FarmerTrainingList" component={FarmerTrainingList} />
    <Stack.Screen
      name="FarmerUsefulInformation"
      component={FarmerUsefulInformation}
    />
    <Stack.Screen
      name="FarmerUsefulInformationList"
      component={FarmerUsefulInformationList}
    />
    <Stack.Screen name="FarmerCreateProblem" component={FarmerCreateProblem} />
    <Stack.Screen name="FarmerListProblem" component={FarmerListProblem} />
    <Stack.Screen name="FarmerViewProblem" component={FarmerViewProblem} />
    {/* <Stack.Screen name="FarmerOutPutList" component={FarmerOutPut} /> */}
    <Stack.Screen name="FarmerPostNew" component={FarmerPostNew} />
    <Stack.Screen name="FarmerViewPast" component={FarmerViewPast} />
    <Stack.Screen name="FarmerLoan" component={FarmerLoanEnquiry} />
    <Stack.Screen
      name="FarmerLoanEnquiryDetail"
      component={FarmerLoanEnquiryDetail}
    />
    <Stack.Screen
      name="FarmerLoanViewPastRequested"
      component={FarmerLoanViewPastRequested}
    />
    <Stack.Screen name="FarmerLoanRequest" component={FarmerLoanRequest} />
    <Stack.Screen name="FarmerInputList" component={FarmerInputList} />
    <Stack.Screen name="FarmerWantToBuy" component={FarmerWantToBuy} />
    <Stack.Screen name="FarmerPastEnquiry" component={FarmerPastEnquiries} />
    <Stack.Screen name="FarmerActivityList" component={FarmerActivityList} />
    <Stack.Screen
      name="FarmerActivityReport"
      component={FarmerActivityReport}
    />
    <Stack.Screen
      name="FarmerActivityReportAWD"
      component={FarmerActivityReportAWD}
    />
    <Stack.Screen
      name="FarmerActivityDetail"
      component={FarmerActivityDetail}
    />
    <Stack.Screen
      name="FarmerUpcomingActivity"
      component={FarmerUpcomingActivity}
    />
    <Stack.Screen
      name="FarmerPendingActivity"
      component={FarmerPendingActivity}
    />
    <Stack.Screen name="FarmerProfile" component={FarmerProfile} />
    <Stack.Screen
      name="FarmerInsuranceEnquiry"
      component={FarmerInsuranceEnquiry}
    />
    <Stack.Screen
      name="FarmerInsuViewPastRequested"
      component={FarmerInsuViewPastRequested}
    />
    <Stack.Screen
      name="FarmerRequestForInsurance"
      component={FarmerRequestForInsurance}
    />
    <Stack.Screen name="DailySalesReport" component={DailySalesReport} />
    <Stack.Screen name="SalesDetail" component={SalesDetail} />
    <Stack.Screen name="DealerReport" component={DealerReport} />
    <Stack.Screen name="FarmerReport" component={FarmerReport} />
    <Stack.Screen
      name="FarmerFarmIncomeExpenseList"
      component={FarmerFarmIncomeExpenseList}
    />
    <Stack.Screen
      name="FarmerFarmIncomeExpenseView"
      component={FarmerFarmIncomeExpenseView}
    />
    <Stack.Screen name="FarmerAddIncome" component={FarmerAddIncome} />
    <Stack.Screen name="FarmerAddExpense" component={FarmerAddExpense} />
    <Stack.Screen
      name="FarmerChangePassword"
      component={FarmerChangePassword}
    />
    <Stack.Screen name="Weather" component={Weather} />
    <Stack.Screen name="Calculator" component={Calculator} />
    <Stack.Screen name="PestisideCalculator" component={PestisideCalculator} />

    <Stack.Screen
      name="FertilizerCalculator"
      component={FertilizerCalculator}
    />
    <Stack.Screen
      name="FarmerInstrumentWiseActivityView"
      component={FarmerInstrumentWiseActivityView}
    />
    <Stack.Screen
      name="FarmerInstrumentWiseActivityDetails"
      component={FarmerInstrumentWiseActivityDetails}
    />

    <Stack.Screen name="PackageOfPractices" component={PackageOfPractices} />
    <Stack.Screen
      name="PackageOfPracticesDetails"
      component={PackageOfPracticesDetails}
    />
    <Stack.Screen name="PackageItemDetails" component={PackageItemDetails} />
    <Stack.Screen
      name="SoilHealthManagement"
      component={SoilHealthManagement}
    />
    <Stack.Screen name="PostRequest" component={PostRequest} />
    <Stack.Screen name="MySoil" component={MySoil} />
    <Stack.Screen name="SampleRequested" component={SampleRequested} />
    <Stack.Screen name="SampleReport" component={SampleReport} />
    <Stack.Screen name="AudioPlayerView" component={AudioPlayerView} />
  </Stack.Navigator>
);

const FarmerNavigation = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <FarmerDrawer {...props} />}
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
        sceneContainerStyle: {backgroundColor: Colors.drawer, zIndex: 100},
      }}>
      <Drawer.Screen name="FarmerMainStack" component={FarmerMainStack} />
    </Drawer.Navigator>
  );
};

export default FarmerNavigation;
