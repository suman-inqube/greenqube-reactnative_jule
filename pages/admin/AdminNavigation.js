import React, {Suspense, lazy} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import CustomDrawer from './CustomDrawer';
import {Colors} from '../utils/Constants';

const Stack = createNativeStackNavigator();

// ✅ Lazy loaded screens
const Dashboard = lazy(() => import('./Dashboard'));
const UserList = lazy(() => import('./userlist/UserList'));
const ActivityList = lazy(() => import('./Activity/ActivityList'));
const ActivityDetail = lazy(() => import('./Activity/ActivityDetail'));
const ActivityReport = lazy(() => import('./Activity/ActivityReport'));
const ActivityReportAWD = lazy(() => import('./Activity/ActivityReportAWD'));
const ForgotPassword = lazy(() => import('./userlist/ForgetPassword'));
const Information = lazy(() => import('./userlist/Information'));
const LiveHood = lazy(() => import('./userlist/LiveHood'));
const PlotList = lazy(() => import('./userlist/PlotList'));
const CrateProblemUser = lazy(() => import('./userlist/CrateProblemUser'));
const InputList = lazy(() => import('./Inputs/InputList'));
const PastEnquiries = lazy(() => import('./Inputs/PastEnquiries'));
const Profile = lazy(() => import('./Menu/Profile'));
const ListProblem = lazy(() => import('./Problem/ListProblem'));
const CreateProblem = lazy(() => import('./Problem/CrateProblem'));
const ViewProblem = lazy(() => import('./Problem/ViewProblem'));
const WantToBuy = lazy(() => import('./Inputs/WantToBuy'));
const OutPut = lazy(() => import('./Output/OutPut'));
const PostNew = lazy(() => import('./Output/PostNew'));
const ViewPast = lazy(() => import('./Output/ViewPast'));
const LoanEnquiry = lazy(() => import('./Loan/LoanEnquiry'));
const LoanViewPastRequested = lazy(() => import('./Loan/ViewPastRequested'));
const LoanEnquiryDetail = lazy(() => import('./Loan/LoanEnquiryDetail'));
const LoanRequest = lazy(() => import('./Loan/LoanRequest'));
const Training = lazy(() => import('./Training/Training'));
const TrainingList = lazy(() => import('./Training/TrainingList'));
const UsefulInformation = lazy(() =>
  import('./Usefullinformation/UsefulInformation'),
);
const UsefulInformationList = lazy(() =>
  import('./Usefullinformation/UsefulInformationList'),
);
const InsuranceEnquiry = lazy(() => import('./Insurance/InsuranceEnquiry'));
const InsuranceViewPastRequested = lazy(() =>
  import('./Insurance/ViewPastRequested'),
);
const RequestForInsurance = lazy(() =>
  import('./Insurance/RequestForInsurance'),
);
const DailySalesReport = lazy(() =>
  import('./DailySalesReport/DailySalesReport'),
);
const SalesDetail = lazy(() => import('./DailySalesReport/SalesDetail'));
const DealerReport = lazy(() => import('./DailySalesReport/DealerReport'));
const FarmerReport = lazy(() => import('./DailySalesReport/FarmerReport'));
const FarmIncomeExpenseList = lazy(() =>
  import('./FarmIncomeExpense/FarmIncomeExpenseList'),
);
const FarmIncomeExpenseView = lazy(() =>
  import('./FarmIncomeExpense/FarmIncomeExpenseView'),
);
const AddIcome = lazy(() => import('./FarmIncomeExpense/AddIcome'));
const AddExpense = lazy(() => import('./FarmIncomeExpense/AddExpense'));
const PersonalInformation = lazy(() =>
  import('./UserRegistation/PersonalInformation'),
);
const FinancialInformation = lazy(() =>
  import('./UserRegistation/FinancialInformation'),
);
const PlotSiteProduceInformation = lazy(() =>
  import('./UserRegistation/PlotSiteProduceInformation'),
);
const RegistationSignUpViwer = lazy(() =>
  import('./UserRegistation/RegistationSignUpViwer'),
);
const ChangePassword = lazy(() => import('./ChangePassword/ChangePassword'));
const InstrumentWiseActivityView = lazy(() =>
  import('./Activity/InstrumentWiseActivityView'),
);
const InstrumentWiseActivityDetails = lazy(() =>
  import('./Activity/InstrumentWiseActivityDetails'),
);
const Business = lazy(() => import('./Business/Business'));

function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: 'transparent'},
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
      <Stack.Screen
        name="LoanViewPastRequested"
        component={LoanViewPastRequested}
      />
      <Stack.Screen name="LoanRequest" component={LoanRequest} />
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
      <Stack.Screen
        name="InsuranceViewPastRequested"
        component={InsuranceViewPastRequested}
      />
      <Stack.Screen
        name="RequestForInsurance"
        component={RequestForInsurance}
      />
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
      <Stack.Screen
        name="InstrumentWiseActivityView"
        component={InstrumentWiseActivityView}
      />
      <Stack.Screen
        name="InstrumentWiseActivityDetails"
        component={InstrumentWiseActivityDetails}
      />
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
        drawerLabelStyle: {marginLeft: -20},
        drawerStyle: {
          backgroundColor: Colors.drawer,
          width: '65%',
          marginLeft: -0.2,
        },
        sceneContainerStyle: {backgroundColor: Colors.drawer, zIndex: 100},
      }}>
      <Drawer.Screen
        name="AdminStack"
        component={AdminStack}
        options={{title: 'Admin Dashboard'}}
      />
    </Drawer.Navigator>
  );
};

export default AdminNavigation;
