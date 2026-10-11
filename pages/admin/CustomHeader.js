import React, { useEffect, memo, useCallback, useMemo } from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
  Text,
  StatusBar,
  Platform,
} from 'react-native';
import ImageForm from '../Common/ImageForm';
import { useNavigation, useRoute } from '@react-navigation/native';
import { goBack } from '../utils/NavigationUtils';
import { Colors, Fonts } from '../utils/Constants';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';

const DASHBOARD_TITLE = 'Dashboard';
const DAILY_SALES_TITLE = 'Daily Sales Report';
const FARMER_DASHBOARD_TITLE = 'FarmerDashboard';

const TITLES_WITHOUT_FILTER = new Set([
  DASHBOARD_TITLE,
  DAILY_SALES_TITLE,
  FARMER_DASHBOARD_TITLE,
]);

const IMAGES = {
  back: require('../Common/images/back.png'),
  logo: require('../Common/images/logo.png'),
  logoIcon: require('../Common/images/logoIcon.png'),
  setting: require('../Common/images/setting.png'),
  fourDot: require('../Common/images/4dot.png'),
  dashboard: require('../Common/images/dashboard.jpeg'),
};

const ROUTE_TITLE_CONFIG = {
  Dashboard: { static: DASHBOARD_TITLE },
  Profile: { key: 'profile' },
  Settings: { static: 'App Settings' },
  activityList: { key: 'my_activities' },
  ProblemList: { key: 'problem_reporting' },
  FarmerFarmIncomeExpenseList: { key: 'income_expense_list' },
  FarmIncomeExpenseList: { key: 'income_expense_list' },
  FarmIncomeExpenseView: { key: 'income_expense_list' },
  AddExpense: { key: 'add_expense' },
  AddIcome: { key: 'add_income' },
  ChangePassword: { key: 'change_password' },
  LoanEnquiryDetail: { key: 'loan_enquiry_detail' },
  LoanRequest: { key: 'loan_request_n' },
  LoanViewPastRequested: { key: 'view_loan_nrequested' },
  InsuranceViewPastRequested: { key: 'Insu_enquiry_detail' },
  RequestForInsurance: { key: 'request_for_ninsurance' },
  FarmerLoanViewPastRequested: { key: 'view_loan_nrequested' },
  FarmerLoanEnquiryDetail: { key: 'Loan Enquiry Detail' },
  FarmerLoanRequest: { key: 'loan_request_n' },
  FarmerInsuViewPastRequested: { key: 'Insu_enquiry_detail' },
  FarmerRequestForInsurance: { key: 'request_for_ninsurance' },
  PestisideCalculator: { key: 'pestiside_calculator' },
  FertilizerCalculator: { key: 'fertilizer_calculator' },
  FarmerInstrumentWiseActivityView: { key: 'instrument_Wise_Activity_View' },
  FarmerChangePassword: { key: 'change_password' },
  FarmerAddExpense: { key: 'add_expense' },
  FarmerAddIncome: { key: 'add_income' },
  FarmerFarmIncomeExpenseView: { key: 'income_expense_View' },
  InstrumentWiseActivityView: { key: 'instrument_Wise_Activity_View' },
  activityDetail: { key: 'act_detail_' },
  DailySalesReport: { key: 'daily_sales_report' },
  OutPutList: { key: 'want_to_sell' },
  userList: { key: 'farmer_list' },
  FarmerListProblem: { key: 'problem_reporting' },
  FarmerCreateProblem: { key: 'add_crop_problem' },
  FarmerActivityList: { key: 'my_activities' },
  FarmerActivityDetail: { key: 'act_detail_' },
  FarmerActivityReportAWD: { key: 'report_activity_AWD' },
  FarmerActivityReport: { key: 'report_activity' },
  ActivityReportAWD: { key: 'report_activity_AWD' },
  activityReport: { key: 'report_activity' },
  ProblemView: { key: 'plot_and_crop_problem' },
  ProblemCreate: { key: 'add_crop_problem' },
  FarmerViewProblem: { key: 'plot_and_crop_problem' },
  FinancialInformation: { key: 'financial_information' },
  PlotSiteProduceInformation: { key: 'reg_land_crop_information' },
  RegistationSignUpViwer: { key: 'Registation_SignUp_Viwer' },
  PostNew: { key: 'Post_New' },
  password: { key: 'forgot_password' },
  information: { key: 'useful_ninformation_dash' },
  CrateProblemUser: { key: 'problem_reporting' },
  InputList: { key: 'agri_inputs_ninquiry_far_dash' },
  PersonalInformation: { key: 'personal_information' },
  FarmerViewPast: { key: 'view_output_nposted' },
  FarmerPostNew: { key: 'post_output_n' },
  FarmerUsefulInformationList: { key: 'dash_useful_information_list' },
  FarmerUsefulInformation: { key: 'dash_useful_information' },
  FarmerTrainingList: { key: 'training_support_list' },
  FarmerTraining: { key: 'training_support' },
  FarmerLiveHood: { key: 'farm_product' },
  PackageOfPractices: { key: 'scientific_farming' },
  PackageOfPracticesDetails: { key: 'Details' },
  PackageItemDetails: { key: 'Package_Item_Details' },
  SoilHealthManagement: { key: 'soil_health_management' },
  PostRequest: { key: 'request_soil_testing' },
  MySoil: { key: 'my_soil' },
  InstrumentWiseActivityDetails: { key: 'activity_Pipe_Images' },
  FarmerInstrumentWiseActivityDetails: { key: 'activity_Pipe_Images' },
  FarmerInputList: { key: 'products' },
  FarmerPastEnquiry: { key: 'past_enq' },
  FarmerWantToBuy: { key: 'want_to_buy_seed_de' },
  WantToBuy: { key: 'want_to_buy_seed_de' },
  PastEnquiry: { key: 'past_enq' },
  TraingList: { key: 'training_support_list' },
  DealerReport: { key: 'dealer_report' },
  FarmerReport: { key: 'farmer_report' },
  SalesDetail: { key: 'sales_detail' },
  FarmerDashboard: { static: FARMER_DASHBOARD_TITLE },
  FarmerProfile: { key: 'farmer_profile' },
  UsefulInformationList: { key: 'dash_useful_information_list' },
  UsefulInformation: { key: 'dash_useful_information' },
  livehood: { key: 'farm_product' },
  PlotStatusUpdate: { key: 'Plot_Status_Update' },
  Market: { key: 'plot_status' },
  UpcomingActivity: { key: 'upcomming_act' },
  PendingActivity: { key: 'Pending Activity' },
  FarmerUpcomingActivity: { key: 'upcomming_act' },
  FarmerPendingActivity: { key: 'Pending Activity' },
  ActivityPlotWise: { key: 'plot_season_wise_activity' },
  FarmerActivityPlotWise: { key: ' Plot & Season wise Activity' },
  PlotWiseMap: { key: 'Map_View' },
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#1c571cff',
    width: '100%',
    minHeight: 70,
    justifyContent: 'center',
  },
  headerContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 15,
    ...(Platform.OS === 'ios' ? { marginTop: 30 } : {}),
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#ffffff',
  },
  dashboardLogo: {
    width: 100,
    height: 43,
    marginLeft: 10,
  },
  regularLogo: {
    width: 50,
    height: 40,
    marginLeft: 10,
  },
  titleText: {
    color: Colors.background,
    fontSize: 16,
    fontFamily: Fonts.Regular,
    marginLeft: 15,
    flex: 1,
  },
  roundButton: {
    width: 32,
    backgroundColor: 'white',
    height: 32,
    borderRadius: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  buttonIcon: {
    width: 25,
    height: 25,
  },
  companyLogoContainer: {
    width: 35,
    backgroundColor: 'white',
    height: 35,
    borderRadius: 30,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  defaultBanner: {
    width: '100%',
    height: 200,
  },
});

const BackButton = memo(({ onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
    <Image source={IMAGES.back} resizeMode="contain" style={styles.backIcon} />
  </TouchableOpacity>
));

const LogoImage = memo(({ isDashboard }) => (
  <Image
    source={isDashboard ? IMAGES.logo : IMAGES.logoIcon}
    style={isDashboard ? styles.dashboardLogo : styles.regularLogo}
    resizeMode="contain"
  />
));

const RoundButton = memo(({ onPress, imageSource, style }) => (
  <TouchableOpacity
    style={[styles.roundButton, style]}
    onPress={onPress}
    activeOpacity={0.7}
    hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
    <Image source={imageSource} style={styles.buttonIcon} />
  </TouchableOpacity>
));

const CompanyLogo = memo(({ logoImage }) => (
  <ImageForm
    source={{ uri: logoImage }}
    resizeMode="contain"
    height={45}
    width={45}
  />
));

const BannerImage = memo(({ topBanner }) =>
  topBanner ? (
    <ImageForm
      source={{ uri: topBanner }}
      resizeMode="cover"
      height={200}
      width="100%"
    />
  ) : (
    <Image source={IMAGES.dashboard} style={styles.defaultBanner} />
  ),
);

const CustomHeader = memo(
  ({
    HandlerGoBack,
    banner,
    logoImage,
    topBanner,
    show,
    filterOptionShow,
  }) => {
    const drawerStatus = useDrawerStatus();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute();

    const title = useMemo(() => {
      const config = ROUTE_TITLE_CONFIG[route.name];
      if (!config) return route.name;
      return config.static ?? t(config.key);
    }, [route.name, t]);

    const isDashboard = title === DASHBOARD_TITLE || title === FARMER_DASHBOARD_TITLE;
    const showFilter = !TITLES_WITHOUT_FILTER.has(title) && !!filterOptionShow;
    const showBanner = show && !banner && (topBanner || true);

    const handleGoBack = useCallback(() => {
      if (HandlerGoBack) {
        HandlerGoBack();
      } else {
        goBack();
      }
    }, [HandlerGoBack]);

    const openDrawer = useCallback(() => {
      navigation.openDrawer();
    }, [navigation]);

    const handleFilterPress = useCallback(() => {
      if (filterOptionShow) {
        filterOptionShow();
      }
    }, [filterOptionShow]);

    const statusBarProps = useMemo(
      () => ({
        barStyle: 'light-content',
        backgroundColor: drawerStatus === 'open' ? Colors.drawer : '#1c571cff',
      }),
      [drawerStatus],
    );

    useEffect(() => {
      navigation.closeDrawer();
    }, [navigation]);

    return (
      <View style={styles.mainContainer}>
        <StatusBar {...statusBarProps} />

        <View style={styles.headerContainer}>
          <View style={styles.leftContainer}>
            <BackButton onPress={handleGoBack} />
            <LogoImage isDashboard={isDashboard} />
            {!isDashboard && <Text style={styles.titleText}>{title}</Text>}
          </View>
          <View style={styles.rightSection}>
            {logoImage && isDashboard && <CompanyLogo logoImage={logoImage} />}

            {showFilter && (
              <RoundButton
                onPress={handleFilterPress}
                imageSource={IMAGES.setting}
              />
            )}

            <RoundButton onPress={openDrawer} imageSource={IMAGES.fourDot} />
          </View>
        </View>
        {showBanner && <BannerImage topBanner={topBanner} />}
      </View>
    );
  },
);

CustomHeader.displayName = 'CustomHeader';

export default memo(CustomHeader);


