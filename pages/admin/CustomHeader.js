import React, { lazy, useEffect, memo } from 'react';
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
const CustomHeader = ({
  path,
  HandlerGoBack,
  banner,
  logoImage,
  topBanner,
  show,
  filterOptionShow,
}) => {
  const drawerStatus = useDrawerStatus();
  const { t } = useTranslation();
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
  };
  const navigation = useNavigation();
  const route = useRoute();
  const title = titleMap[route.name] ?? route.name;
  console.log(title);
  const openDrawer = () => {
    navigation.openDrawer();
  };
  useEffect(() => {
    navigation.closeDrawer();
  }, []);
  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle={drawerStatus === 'open' ? 'light-content' : 'light-content'}
        backgroundColor={drawerStatus === 'open' ? Colors.drawer : '#003c04'}
      />
      <View
        style={
          Platform.OS === 'android'
            ? styles.androidContainer
            : styles.iosContainer
        }>
        <View style={styles.rightContainer}>
          <TouchableOpacity onPress={() => goBack()}>
            <Image
              source={require('../Common/images/back.png')}
              resizeMode="contain"
              style={{ width: 24, height: 24, tintColor: '#ffffffff' }}
            />
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity> */}
          {title == 'Dashboard' ? (
            <Image
              source={require('../Common/images/logo.png')}
              style={{ width: 100, height: 43 }}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={require('../Common/images/logoIcon.png')}
              style={{ width: 50, height: 40 }}
              resizeMode="contain"
            />
          )}
          {title != 'Dashboard' ? (
            <View>
              <Text style={styles.titleText}>{title}</Text>
            </View>
          ) : null}
        </View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              marginRight: 10,
              alignItems: 'center',
              flex: 1,
              paddingVertical: 35,
              overflow: 'hidden',
            }}>
            {logoImage && title == 'Dashboard' ? (
              <View
                style={{
                  width: 32,
                  backgroundColor: 'white',
                  height: 32,
                  borderRadius: 12,
                  marginLeft: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 10,
                  overflow: 'hidden',
                }}>
                <ImageForm
                  source={{ uri: logoImage }}
                  resizeMode="contain"
                  // resizeMode='cover'
                  height={50}
                  width={50}
                />
              </View>
            ) : null}

            {!['Dashboard', 'Daily Sales Report'].includes(title) ? (
              <TouchableOpacity
                style={{
                  width: 32,
                  backgroundColor: 'white',
                  height: 32,
                  borderRadius: 12,
                  marginLeft: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 10,
                }}
                onPress={() => filterOptionShow()}>
                <Image
                  source={require('../Common/images/setting.png')}
                  style={{ width: 25, height: 25 }}
                />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={openDrawer}
              style={{
                width: 32,
                backgroundColor: 'white',
                height: 32,
                borderRadius: 12,
                marginLeft: 10,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}>
              <Image
                source={require('../Common/images/4dot.png')}
                style={{ width: 25, height: 25 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View>
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
      </View>
    </View>
  );
};

export default memo(CustomHeader);
const styles = StyleSheet.create({
  mainContainer: {
    // borderBottomWidth: 2,
    // marginTop:StatusBar.currentHeight,
    backgroundColor: '#003c04',
    // flex: 1,
    width: '100%',
    height: 70,
    justifyContent: 'center',
  },
  androidContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    // paddingVertical: 3
  },
  iosContainer: {
    marginTop: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    // paddingVertical: 3
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    justifyContent: 'center',
  },
  image: {
    width: 200,
    // width: width * 100,
    height: 200,
  },
  titleText: {
    color: Colors.background,
    fontSize: 16,
    fontFamily: Fonts.Regular,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
