import React, { lazy, useEffect, memo, useMemo, useCallback } from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
  Text,
  StatusBar,
} from 'react-native';
const ImageForm = lazy(() => import('../Common/ImageForm'));
import { useNavigation, useRoute } from '@react-navigation/native';
import { goBack } from '../utils/NavigationUtils';
import { Colors, Fonts } from '../utils/Constants';
import { useDrawerStatus } from '@react-navigation/drawer';

import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const CustomHeader = ({
  path,
  HandlerGoBack,
  banner,
  logoImage,
  topBanner,
  show,
  filterOptionShow,
}) => {
  const insets = useSafeAreaInsets();
  const drawerStatus = useDrawerStatus();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const titleMap = {
    Dashboard: 'Dashboard',
    Profile: 'User Profile',
    Settings: 'App Settings',
    activityList: 'Activity List',
    Profile: t('profile'),
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
  };
  const title = useMemo(() => titleMap[route.name] ?? route.name, [titleMap, route.name]);
  const isDashboard = useMemo(() => title === 'Dashboard', [title]);
  const shouldShowTitle = useMemo(() => !isDashboard, [isDashboard]);
  const shouldShowFilter = useMemo(() =>
    !['Dashboard', 'Daily Sales Report'].includes(title),
    [title]
  );
  // console.log(title);
  const openDrawer = () => {
    navigation.openDrawer();
  };
  useEffect(() => {
    navigation.closeDrawer();
  }, []);
  const containerStyle = useMemo(() => [
    styles.mainContainer,
    {
      paddingTop: Platform.OS === 'ios' ? insets.top : 0,
      backgroundColor: drawerStatus === 'open' ? Colors.drawer : '#003c04',
    }
  ], [insets.top, drawerStatus]);
  const HeaderLogo = memo(({ isDashboard }) => {
    const logoSource = isDashboard
      ? require('../Common/images/logo.png')
      : require('../Common/images/logoIcon.png');

    const logoStyle = isDashboard
      ? { width: 100, height: 43 }
      : { width: 50, height: 40 };

    return (
      <Image
        source={logoSource}
        style={[styles.logo, logoStyle]}
        resizeMode="contain"
      />
    );
  });
  const HeaderIcon = memo(({ source, onPress, style, imageStyle, testID }) => (
    <TouchableOpacity
      style={[styles.iconButton, style]}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      <Image
        source={source}
        style={[styles.iconImage, imageStyle]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  ));
  const headerContentStyle = useMemo(() => [
    Platform.OS === 'android' ? styles.androidContainer : styles.iosContainer
  ], []);
  const handleGoBack = useCallback(() => {
    if (HandlerGoBack) {
      HandlerGoBack();
    } else {
      goBack();
    }
  }, [HandlerGoBack]);
  const statusBarConfig = useMemo(() => ({
    barStyle: 'light-content',
    backgroundColor: drawerStatus === 'open' ? Colors.drawer : '#003c04',
    translucent: Platform.OS === 'ios',
  }), [drawerStatus]);
  return (
    <View style={styles.wrapper}>
      <StatusBar {...statusBarConfig} />
      {/* <StatusBar
        barStyle={drawerStatus === 'open' ? 'light-content' : 'light-content'}
        backgroundColor={drawerStatus === 'open' ? Colors.drawer : '#003c04'}
      /> */}
      <LinearGradient
        colors={['#004d06', '#003c04', '#002d03']}
        style={containerStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={headerContentStyle}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            <HeaderIcon
              source={require('../Common/images/back.png')}
              onPress={handleGoBack}
              imageStyle={styles.backIcon}
              testID="back-button"
            />
            <HeaderLogo isDashboard={isDashboard} />
            {shouldShowTitle && (
              <View style={styles.titleContainer}>
                <Text style={styles.titleText} numberOfLines={1}>
                  {title}
                </Text>
              </View>
            )}
          </View>
          {show == true && banner != true && (
            <>
              {topBanner != undefined || topBanner != null ? (
                <ImageForm
                  source={{ uri: topBanner }}
                  resizeMode="cover"
                  height={200}
                  width={'100%'}
                />
              ) : (
                <Image
                  source={require('../Common/images/dashboard.jpeg')}
                  style={{ width: '100%', height: 200 }}
                />
              )}
            </>
          )}
          <View style={styles.rightSection}>
            {/* Company Logo for Dashboard */}
            {logoImage && isDashboard && (
              <View style={styles.companyLogoContainer}>
                <React.Suspense fallback={<View style={styles.logoPlaceholder} />}>
                  <ImageForm
                    source={{ uri: logoImage }}
                    resizeMode="contain"
                    height={32}
                    width={32}
                  />
                </React.Suspense>
              </View>
            )}

            {/* Filter Button */}
            {shouldShowFilter && (
              <HeaderIcon
                source={require('../Common/images/setting.png')}
                onPress={filterOptionShow}
                testID="filter-button"
              />
            )}

            {/* Menu Button */}
            <HeaderIcon
              source={require('../Common/images/4dot.png')}
              onPress={openDrawer}
              testID="menu-button"
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#003c04',
    width: '100%',
  },
  mainContainer: {
    width: '100%',
    minHeight: 70,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  androidContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  iosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  iconImage: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  logo: {
    // marginHorizontal: 12,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  titleText: {
    color: Colors.background || '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.Medium || 'System',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  companyLogoContainer: {
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  bannerContainer: {
    width: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  defaultBanner: {
    width: '100%',
    height: 200,
  },
});
export default memo(CustomHeader);

