import React, {lazy, useEffect, memo, useCallback, useMemo} from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
  Text,
  StatusBar,
  Platform,
} from 'react-native';
const ImageForm = lazy(() => import('../Common/ImageForm'));
import {useNavigation, useRoute} from '@react-navigation/native';
import {goBack} from '../utils/NavigationUtils';
import {Colors, Fonts} from '../utils/Constants';
import {useDrawerStatus} from '@react-navigation/drawer';
import {useTranslation} from 'react-i18next';
const DASHBOARD_TITLE = 'Dashboard';
const DAILY_SALES_TITLE = 'Daily Sales Report';
const FARMER_DASHBOARD_TITLE = 'FarmerDashboard';
const TITLES_WITHOUT_FILTER = [
  DASHBOARD_TITLE,
  DAILY_SALES_TITLE,
  FARMER_DASHBOARD_TITLE,
];
const IMAGES = {
  back: require('../Common/images/back.png'),
  logo: require('../Common/images/logo.png'),
  logoIcon: require('../Common/images/logoIcon.png'),
  setting: require('../Common/images/setting.png'),
  fourDot: require('../Common/images/4dot.png'),
  dashboard: require('../Common/images/dashboard.jpeg'),
};
const BackButton = memo(({onPress}) => (
  <TouchableOpacity onPress={onPress}>
    <Image source={IMAGES.back} resizeMode="contain" style={styles.backIcon} />
  </TouchableOpacity>
));

const LogoImage = memo(({isDashboard}) => (
  <Image
    source={isDashboard ? IMAGES.logo : IMAGES.logoIcon}
    style={isDashboard ? styles.dashboardLogo : styles.regularLogo}
    resizeMode="contain"
  />
));

const RoundButton = memo(({onPress, imageSource, style}) => (
  <TouchableOpacity style={[styles.roundButton, style]} onPress={onPress}>
    <Image source={imageSource} style={styles.buttonIcon} />
  </TouchableOpacity>
));

const CompanyLogo = memo(({logoImage}) => (
  // <View style={styles.companyLogoContainer}>

  <ImageForm
    source={{uri: logoImage}}
    resizeMode="contain"
    height={45}
    width={45}
  />
  // </View>
));

const BannerImage = memo(({topBanner}) =>
  topBanner ? (
    <ImageForm
      source={{uri: topBanner}}
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
    path,
    HandlerGoBack,
    banner,
    logoImage,
    topBanner,
    show,
    filterOptionShow,
  }) => {
    console.log('logoImage123', "logoImage");
    const drawerStatus = useDrawerStatus();
    const {t} = useTranslation();
    const navigation = useNavigation();
    const route = useRoute();
    const titleMap = useMemo(
      () => ({
        Dashboard: 'Dashboard',
        Profile: t('profile'),
        Settings: 'App Settings',
        activityList: 'Activity List',
        ProblemList: t('problem_reporting'),
        FarmerFarmIncomeExpenseList: t('income_expense_list'),
        FarmIncomeExpenseList: t('income_expense_list'),
        FarmIncomeExpenseView: t('income_expense_list'),
        AddExpense: t('add_expense'),
        AddIcome: t('add_income'),
        ChangePassword: t('change_password'),
        LoanEnquiryDetail: t('loan_enquiry_detail'),
        LoanRequest: t('loan_request_n'),
        LoanViewPastRequested: t('view_loan_nrequested'),
        InsuranceViewPastRequested: t('Insu_enquiry_detail'),
        RequestForInsurance: t('request_for_ninsurance'),
        FarmerLoanViewPastRequested: t('view_loan_nrequested'),
        FarmerLoanEnquiryDetail: t('Loan Enquiry Detail'),
        FarmerLoanRequest: t('loan_request_n'),
        FarmerInsuViewPastRequested: t('Insu_enquiry_detail'),
        FarmerRequestForInsurance: t('request_for_ninsurance'),
        PestisideCalculator: t('pestiside_calculator'),
        FertilizerCalculator: t('fertilizer_calculator'),
        FarmerInstrumentWiseActivityView: t('instrument_Wise_Activity_View'),
        FarmerChangePassword: t('change_password'),
        FarmerAddExpense: t('add_expense'),
        FarmerAddIncome: t('add_income'),
        FarmerFarmIncomeExpenseView: t('income_expense_View'),
        InstrumentWiseActivityView: t('instrument_Wise_Activity_View'),
        activityDetail: t('act_detail_'),
        DailySalesReport: t('daily_sales_report'),
        OutPutList: t('want_to_sell'),
        userList: t('farmer_list'),
        FarmerListProblem: t('problem_reporting'),
        FarmerCreateProblem: t('add_crop_problem'),
        FarmerActivityList: t('my_activities'),
        FarmerActivityDetail: t('act_detail_'),
        FarmerActivityReportAWD: t('report_activity_AWD'),
        FarmerActivityReport: t('report_activity'),
        ActivityReportAWD: t('report_activity_AWD'),
        activityReport: t('report_activity'),
        ProblemView: t('plot_and_crop_problem'),
        ProblemCreate: t('add_crop_problem'),
        FarmerViewProblem: t('plot_and_crop_problem'),
        FinancialInformation: t('financial_information'),
        PlotSiteProduceInformation: t('reg_land_crop_information'),
        RegistationSignUpViwer: t('Registation_SignUp_Viwer'),
        PostNew: t('Post_New'),
        password: t('forgot_password'),
        activityList: t('my_activities'),
        information: t('useful_ninformation_dash'),
        CrateProblemUser: t('problem_reporting'),
        InputList: t('agri_inputs_ninquiry_far_dash'),
        PersonalInformation: t('personal_information'),
        FarmerViewPast: t('view_output_nposted'),
        FarmerPostNew: t('post_output_n'),
        FarmerUsefulInformationList: t('dash_useful_information_list'),
        FarmerUsefulInformation: t('dash_useful_information'),
        FarmerTrainingList: t('training_support_list'),
        FarmerTraining: t('training_support'),
        FarmerLiveHood: t('Livelihood'),
        PackageOfPractices: t('scientific_farming'),
        PackageOfPracticesDetails: t('Details'),
        PackageItemDetails: t('Package_Item_Details'),
        SoilHealthManagement: t('soil_health_management'),
        PostRequest: t('request_soil_testing'),
        MySoil: t('my_soil'),
        InstrumentWiseActivityDetails: t('activity_Pipe_Images'),
        FarmerInstrumentWiseActivityDetails: t('activity_Pipe_Images'),
        FarmerInputList: t('products'),
        FarmerPastEnquiry: t('past_enq'),
        FarmerWantToBuy: t('want_to_buy_seed_de'),
        WantToBuy: t('want_to_buy_seed_de'),
        PastEnquiry: t('past_enq'),
        TraingList: t('training_support_list'),
        DealerReport: t('dealer_report'),
        FarmerReport: t('farmer_report'),
        SalesDetail: t('sales_detail'),
        FarmerInputList: t('products'),
        FarmerDashboard: 'FarmerDashboard',
        FarmerProfile: t('farmer_profile'),
        UsefulInformationList: t('dash_useful_information_list'),
        UsefulInformation: t('dash_useful_information'),
        livehood: t('Livelihood'),
        PlotStatusUpdate: t('PlotStatusUpdate'),
        Market: t('Plot Status'),
        UpcomingActivity: t('upcomming_act'),
        PendingActivity: t('Pending Activity'),
      }),

      [t],
    );
    const title = useMemo(
      () => titleMap[route.name] ?? route.name,
      [titleMap, route.name],
    );
    console.log('Screen-', route.name);
    const isDashboard = useMemo(
      () => title === DASHBOARD_TITLE || title === FARMER_DASHBOARD_TITLE,
      [title],
    );
    const showFilter = useMemo(
      () => !TITLES_WITHOUT_FILTER.includes(title) && filterOptionShow,
      [title, filterOptionShow],
    );
    const showBanner = useMemo(
      () => show && !banner && (topBanner || true),
      [show, banner, topBanner],
    );
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

        <View
          style={Platform.select({
            android: styles.androidContainer,
            ios: styles.iosContainer,
          })}>
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

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#1c571cff',
    width: '100%',
    minHeight: 70,
    justifyContent: 'center',
  },
  androidContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  iosContainer: {
    marginTop: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 15,
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

export default memo(CustomHeader);
