import React, {useEffect, useState} from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import {DrawerActions} from '@react-navigation/native';
import {getItem, removeItem} from '../../config/getDataFromStorage';
import i18next from '../services/i18next';
import {useTranslation} from 'react-i18next';
import {StackActions, useNavigation} from '@react-navigation/native';
import DeviceInfo from '../DeviceInfo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors, Fonts} from '../utils/Constants';

const FarmerDrawer = props => {
  const {state} = props; // Access navigation state
  const activeRouteName = props?.state?.routes[props?.state?.index]?.name;
  const {netConnection} = DeviceInfo();
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [side_menu_option, set_side_menu_option] = useState('');

  const profileRoutes = ['FarmerProfile', 'FarmerChangePassword'];
  const plotInfoRoutes = ['FarmerLiveHood'];
  const FarmerFarmIncomeExpenseListRoutes = ['FarmerFarmIncomeExpenseList'];
  const FarmerInstrumentWiseActivityView = ['FarmerInstrumentWiseActivityView'];

  const farmFincRoutes = ['FarmerLoan', 'FarmerInsuranceEnquiry'];
  const practiceRoutes = ['PackageOfPractices', 'SoilHealthManagement'];
  const calculatorRoutes = ['PestisideCalculator', 'FertilizerCalculator'];
  const isSubRouteActive = subRoutes => {
    return subRoutes.some(route => route === activeRouteName);
  };

  const isActive = screenName => activeRouteName === screenName;

  const isParentActive = (mainRoute, childRoutes) =>
    isActive(mainRoute) || isSubRouteActive(childRoutes);

  // State for expanded menus
  const [profileExpanded, setProfileExpanded] = useState(
    isSubRouteActive(profileRoutes),
  );
  const [plotInfoExpanded, setPlotInfoExpanded] = useState(
    isSubRouteActive(plotInfoRoutes),
  );
  const [
    FarmerInstrumentWiseActivityViewExpanded,
    setFarmerInstrumentWiseActivityViewExpanded,
  ] = useState(isSubRouteActive(FarmerInstrumentWiseActivityView));
  const [practiceExpanded, setPracticeExpanded] = useState(
    isSubRouteActive(practiceRoutes),
  );
  const [farmFincExpanded, setFarmFincExpanded] = useState(
    isSubRouteActive(farmFincRoutes),
  );
  const [calculatorExpanded, setCalculatorExpanded] = useState(
    isSubRouteActive(calculatorRoutes),
  );

  // Helper functions

  const handleMenuExpand = menuName => {
    // Close all menus first
    setProfileExpanded(false);
    setPlotInfoExpanded(false);
    setPracticeExpanded(false);
    setFarmFincExpanded(false);
    setCalculatorExpanded(false);
    setFarmerInstrumentWiseActivityViewExpanded(false);

    // Then open the selected menu
    switch (menuName) {
      case 'profile':
        setProfileExpanded(!profileExpanded);
        break;
      case 'plotInfo':
        setPlotInfoExpanded(!plotInfoExpanded);
        break;
      case 'practice':
        setPracticeExpanded(!practiceExpanded);
        break;
      case 'farmFinc':
        setFarmFincExpanded(!farmFincExpanded);
        break;
      case 'calculator':
        setCalculatorExpanded(!calculatorExpanded);
        break;
      case 'FarmerInstrumentWiseActivityView':
        setFarmerInstrumentWiseActivityViewExpanded(
          !FarmerInstrumentWiseActivityViewExpanded,
        );
        break;
    }
  };

  const onPageLoad = async () => {
    const [loginUser_data, side_menu_option] = await Promise.all([
      getItem('loginUser_data'),
      getItem('side_menu_option'),
    ]);
    set_side_menu_option(side_menu_option);
    i18next.changeLanguage(`${loginUser_data.lan_id}`);
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  const handleLogout = async () => {
    Alert.alert(
      `${t('app_name')}`,
      `${t('close_app')}`,
      [
        {
          text: `${t('cancle')}`,
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: `${t('ok')}`,
          onPress: () => {
            removeData();
          },
        },
      ],
      {cancelable: false},
    );
  };
  // const removeData = async () => {
  //   if (netConnection) {
  //     await Promise.all([
  //       removeItem('logoImageData'),
  //       removeItem('loginUser_data'),
  //       removeItem('profileImgData'),
  //       removeItem('userNameData'),
  //       removeItem('userType'),
  //       removeItem('bottomBannerData'),
  //       removeItem('topBannerData'),
  //       removeItem('currency'),
  //       removeItem('fcmToken'),
  //       removeItem('company_website'),
  //       removeItem('side_menu_option'),
  //     ]);
  //     const popAction = StackActions.pop(1);
  //     navigation.dispatch(popAction);
  //     navigation.navigate('Login');
  //   } else {
  //     Alert.alert('You are offline hence cannot proceed');
  //   }
  // };
  const removeData = async () => {
    if (netConnection) {
      // Only remove specific items, keep rememberData if "Remember Me" was checked
      const rememberData = await getItem('rememberData');
      const shouldRemember = rememberData && rememberData.contactNumber;

      await Promise.all([
        removeItem('logoImageData'),
        removeItem('loginUser_data'),
        removeItem('profileImgData'),
        removeItem('userNameData'),
        removeItem('userType'),
        removeItem('bottomBannerData'),
        removeItem('topBannerData'),
        removeItem('currency'),
        removeItem('fcmToken'),
        removeItem('company_website'),
        removeItem('side_menu_option'),
      ]);
      if (!shouldRemember) {
        await removeItem('rememberData');
      }
      navigation.dispatch(StackActions.replace('Login'));
    } else {
      Alert.alert('You are offline hence cannot proceed');
    }
  };
  const navigateToPages = pageName => {
    if (netConnection) {
       navigation.navigate('FarmerNavigation', {
          screen: 'FarmerMainStack',
          params: { screen: pageName },
        });
    }
  };
  return (
    <>
      {/* <StatusBar barStyle="light-content" backgroundColor={Colors.drawer} /> */}
      <View style={styles.mainView}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{marginBottom: 80}}>
            <TouchableOpacity
              style={[
                styles.memuContainer,
                isActive('FarmerDashboard') && styles.activeSingleMenu, // Apply active style
              ]}
              onPress={() => navigateToPages('FarmerDashboard')}>
              <View style={[styles.menuItemCal]}>
                <View
                  style={[
                    styles.iconView,
                    isActive('FarmerDashboard') && styles.activeIcon, // Apply active style
                  ]}>
                  <MaterialIcons
                    name="home"
                    size={25}
                    color={isActive('FarmerDashboard') ? '#030635' : '#030730'}
                  />
                </View>
                {/* <Image
                source={require('../Common/images/add_tree.png')}
                style={[{height: 30, width: 30, tintColor: '#FFF'}]}
              /> */}
                <Text
                  style={[
                    styles.menuText,
                    isActive('FarmerDashboard') && styles.activeText, // Active text color
                  ]}>
                  {t('Home')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Profile Section */}
            <TouchableOpacity
              style={styles.memuContainer}
              onPress={() => handleMenuExpand('profile')}>
              <View style={[styles.menuItem, {marginTop: 8}]}>
                <View style={styles.iconView}>
                  <MaterialIcons name={'person'} size={22} color="#030730" />
                  {/* <Image
                  source={require('../Common/images/user_menu.png')}
                  style={[{height: 28, width: 28, tintColor: '#030730'}]}
                /> */}
                </View>
                <Text
                  style={[
                    styles.menuText,
                    isParentActive('FarmerProfile', profileRoutes) &&
                      styles.activeText,
                    isParentActive('FarmerProfile', profileRoutes) && {
                      color: Colors.primary_light,
                    },
                  ]}>
                  {t('profile')}
                </Text>
                <MaterialIcons
                  name={profileExpanded ? 'expand-less' : 'expand-more'}
                  size={22}
                  color="#d5dbd7"
                  style={{marginLeft: 5}}
                />
              </View>
            </TouchableOpacity>
            {profileExpanded && (
              <>
                <View style={{marginBottom: 30}}>
                  <TouchableOpacity
                    style={[
                      styles.subMenu,
                      {paddingLeft: 30},
                      isActive('FarmerProfile') && styles.activeSubMenu,
                    ]}
                    onPress={() => navigateToPages('FarmerProfile')}>
                    <View style={styles.subMenuItem}>
                      <MaterialIcons
                        name="supervisor-account"
                        size={22}
                        color={
                          isActive('FarmerProfile') ? '#030635' : '#eaf3ee'
                        }
                      />

                      {/* <Image
                    source={require('../Common/images/user_menu.png')}
                    style={[
                      {height: 20, width: 20},
                      isActive('FarmerProfile') && {tintColor: '#030635'},
                    ]}
                  /> */}
                      <Text
                        style={[
                          styles.subText,
                          isActive('FarmerProfile') && styles.activeSubText,
                        ]}>
                        {t('profile')}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.subMenu,
                      {paddingLeft: 30},
                      isActive('FarmerChangePassword') && styles.activeSubMenu,
                    ]}
                    onPress={() => navigateToPages('FarmerChangePassword')}>
                    <View style={styles.subMenuItem}>
                      <MaterialIcons
                        name="lock-reset"
                        size={22}
                        color={
                          isActive('FarmerChangePassword')
                            ? '#030635'
                            : '#eaf3ee'
                        }
                      />
                      {/* <Image
                    source={require('../Common/images/change_password_white.png')}
                    style={[
                      {height: 20, width: 20},
                      isActive('FarmerChangePassword') && {
                        tintColor: '#030635',
                      },
                    ]}
                  /> */}
                      <Text
                        style={[
                          styles.subText,
                          isActive('FarmerChangePassword') &&
                            styles.activeSubText,
                        ]}>
                        {t('change_password')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Plot & Crop Details Section */}
            <TouchableOpacity
              style={[
                styles.memuContainer,
                isActive('FarmerLiveHood') && styles.activeSingleMenu, // Apply active style
              ]}
              onPress={() => navigateToPages('FarmerLiveHood')}>
              <View style={[styles.menuItemCal]}>
                <View
                  style={[
                    styles.iconView,
                    isActive('FarmerLiveHood') && styles.activeIcon, // Apply active style
                  ]}>
                  <Image
                    source={require('../Common/images/land.png')}
                    style={[
                      {height: 20, width: 20},
                      isActive('FarmerLiveHood')
                        ? {
                            tintColor: 'black',
                          }
                        : {tintColor: 'black'},
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.menuText,
                    isActive('FarmerLiveHood') && styles.activeText, // Active text color
                  ]}>
                  {t('plot_and_crop')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* {plotInfoExpanded && (
            <TouchableOpacity
              style={[
                styles.subMenu,
                {paddingLeft: 30},
                isActive('FarmerLiveHood') && styles.activeSubMenu,
              ]}
              onPress={() => navigateToPages('FarmerLiveHood')}>
              <View style={styles.subMenuItem}>
                <Image
                  source={require('../Common/images/land.png')}
                  style={[
                    {height: 20, width: 20},
                    isActive('FarmerLiveHood') && {tintColor: '#030635'},
                  ]}
                />
                <Text
                  style={[
                    styles.subText,
                    isActive('FarmerLiveHood') && styles.activeSubText,
                  ]}>
                  {t('plot_and_crop_details')}
                </Text>
              </View>
            </TouchableOpacity>
          )} */}

            {/* Scientific Farming Section */}
            <TouchableOpacity
              style={styles.memuContainer}
              onPress={() => handleMenuExpand('practice')}>
              <View style={styles.menuItem}>
                <View style={styles.iconView}>
                  {/* <MaterialIcons name="science" size={22} color="#030635" /> */}
                  <Image
                    source={require('../Common/images/plant.png')}
                    style={[{height: 22, width: 22, tintColor: '#030730'}]}
                  />
                </View>
                <Text
                  style={[
                    styles.menuText,
                    isParentActive('PackageOfPractices', practiceRoutes) &&
                      styles.activeText,
                    isParentActive('PackageOfPractices', practiceRoutes) && {
                      color: Colors.primary_light,
                    },
                  ]}>
                  {t('scientific_farming')}
                </Text>
                <MaterialIcons
                  name={practiceExpanded ? 'expand-less' : 'expand-more'}
                  size={22}
                  color="#d5dbd7"
                  style={{marginLeft: 5}}
                />
              </View>
            </TouchableOpacity>
            {practiceExpanded && (
              <>
                <View style={{marginBottom: 30}}>
                  <TouchableOpacity
                    style={[
                      styles.subMenu,
                      {paddingLeft: 30},
                      isActive('PackageOfPractices') && styles.activeSubMenu,
                    ]}
                    onPress={() => navigateToPages('PackageOfPractices')}>
                    <View style={styles.subMenuItem}>
                      <Image
                        source={require('../Common/images/plant.png')}
                        style={[
                          {height: 20, width: 20},
                          {
                            tintColor: isActive('PackageOfPractices')
                              ? '#030635'
                              : '#eaf3ee',
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.subText,
                          isActive('PackageOfPractices') &&
                            styles.activeSubText,
                        ]}>
                        {t('scientific_farming')}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.subMenu,
                      {paddingLeft: 30},
                      isActive('SoilHealthManagement') && styles.activeSubMenu,
                    ]}
                    onPress={() => navigateToPages('SoilHealthManagement')}>
                    <View style={styles.subMenuItem}>
                      <Image
                        source={require('../Common/images/soil.png')}
                        style={[
                          {height: 22, width: 22},
                          {
                            tintColor: isActive('SoilHealthManagement')
                              ? '#030635'
                              : '#eaf3ee',
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.subText,
                          isActive('SoilHealthManagement') &&
                            styles.activeSubText,
                        ]}>
                        {t('soil_health_management')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* <TouchableOpacity style={[styles.subMenu, {paddingLeft: 30}]}>
                  <View style={styles.subMenuItem}>
                    <Image
                      source={require('../Common/images/soil.png')}
                      style={[{height: 20, width: 20, tintColor: '#b3f4bf'}]}
                    />
                    <Text style={styles.subText}>
                      {t('soil_health_management')}
                    </Text>
                  </View>
                </TouchableOpacity> */}
              </>
            )}

            {/* Calculator Section */}

            <TouchableOpacity
              style={styles.memuContainer}
              onPress={() => handleMenuExpand('calculator')}>
              <View style={[styles.menuItem, {marginTop: 8}]}>
                <View style={styles.iconView}>
                  <MaterialIcons name="calculate" size={22} color="#030730" />

                  {/* <Image
                  source={require('../Common/images/calculator.png')}
                  style={[{height: 25, width: 25, tintColor: '#030730'}]}
                /> */}
                </View>

                <Text
                  style={[
                    styles.menuText,
                    isParentActive('PestisideCalculator', profileRoutes) &&
                      styles.activeText,
                    isParentActive('PestisideCalculator', profileRoutes) && {
                      color: Colors.primary_light,
                    },
                  ]}>
                  {t('agri_calculator')}
                </Text>
                <MaterialIcons
                  name={calculatorExpanded ? 'expand-less' : 'expand-more'}
                  size={22}
                  color="#d5dbd7"
                  style={{marginLeft: 5}}
                />
              </View>
            </TouchableOpacity>
            {calculatorExpanded && (
              <>
                <View style={{marginBottom: 30}}>
                  <TouchableOpacity
                    style={[
                      styles.subMenu,
                      {paddingLeft: 30},
                      isActive('PestisideCalculator') && styles.activeSubMenu,
                    ]}
                    onPress={() => navigateToPages('PestisideCalculator')}>
                    <View style={styles.subMenuItem}>
                      <MaterialIcons
                        name="percent"
                        size={22}
                        color={
                          isActive('PestisideCalculator')
                            ? '#030635'
                            : '#eaf3ee'
                        }
                      />

                      {/* <Image
                    source={require('../Common/images/user_menu.png')}
                    style={[
                      {height: 20, width: 20},
                      isActive('FarmerProfile') && {tintColor: '#030635'},
                    ]}
                  /> */}
                      <Text
                        style={[
                          styles.subText,
                          isActive('PestisideCalculator') &&
                            styles.activeSubText,
                        ]}>
                        {t('pestiside_calculator')}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.subMenu,
                      {paddingLeft: 30},
                      isActive('FertilizerCalculator') && styles.activeSubMenu,
                    ]}
                    onPress={() => navigateToPages('FertilizerCalculator')}>
                    <View style={styles.subMenuItem}>
                      <MaterialIcons
                        name="difference"
                        size={22}
                        color={
                          isActive('FertilizerCalculator')
                            ? '#030635'
                            : '#eaf3ee'
                        }
                      />
                      {/* <Image
                    source={require('../Common/images/change_password_white.png')}
                    style={[
                      {height: 20, width: 20},
                      isActive('FarmerChangePassword') && {
                        tintColor: '#030635',
                      },
                    ]}
                  /> */}
                      <Text
                        style={[
                          styles.subText,
                          isActive('FertilizerCalculator') &&
                            styles.activeSubText,
                        ]}>
                        {t('fertilizer_calculator')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Farm Accounts Section */}
            <TouchableOpacity
              style={[
                styles.memuContainer,
                isActive('FarmerFarmIncomeExpenseList') &&
                  styles.activeSingleMenu, // Apply active style
              ]}
              onPress={() => navigateToPages('FarmerFarmIncomeExpenseList')}>
              <View style={[styles.menuItemCal]}>
                <View
                  style={[
                    styles.iconView,
                    isActive('FarmerFarmIncomeExpenseList') &&
                      styles.activeIcon, // Apply active style
                  ]}>
                  <MaterialIcons
                    name="account-balance"
                    size={22}
                    color="#030730"
                  />
                </View>
                {/* <Image
                  source={require('../Common/images/insurance_menu.png')}
                  style={[{height: 25, width: 25, tintColor: '#030730'}]}
                /> */}

                <Text
                  style={[
                    styles.menuText,
                    isActive('FarmerFarmIncomeExpenseList') &&
                      styles.activeText, // Active text color
                  ]}>
                  {t('farm_income_amp_expense')}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.memuContainer}
              onPress={() => handleMenuExpand('farmFinc')}>
              <View style={styles.menuItem}>
                <View style={styles.iconView}>
                  <MaterialIcons name="payment" size={22} color="#030730" />

                  {/* <Image
                  source={require('../Common/images/insurance_menu.png')}
                  style={[{height: 25, width: 25, tintColor: '#030730'}]}
                /> */}
                </View>
                <Text
                  style={[
                    styles.menuText,
                    isParentActive(
                      'FarmerFarmIncomeExpenseList',
                      farmFincRoutes,
                    ) && styles.activeText,
                    isParentActive(
                      'FarmerFarmIncomeExpenseList',
                      farmFincRoutes,
                    ) && {
                      color: Colors.primary_light,
                    },
                  ]}>
                  {t('Finance')}
                </Text>
                <MaterialIcons
                  name={farmFincExpanded ? 'expand-less' : 'expand-more'}
                  size={22}
                  color="#d5dbd7"
                  style={{marginLeft: 5}}
                />
              </View>
            </TouchableOpacity>
            {farmFincExpanded && (
              <>
                <View style={{marginBottom: 10}}>
                  <TouchableOpacity
                    style={[
                      styles.subMenu,
                      {paddingLeft: 30},
                      isActive('FarmerLoan') && styles.activeSubMenu,
                    ]}
                    onPress={() =>
                      navigateToPages('FarmerLoanViewPastRequested')
                    }>
                    <View style={styles.subMenuItem}>
                      <MaterialIcons
                        name="real-estate-agent"
                        size={20}
                        color={isActive('FarmerLoan') ? '#030635' : '#eaf3ee'}
                      />
                      {/* <Image
                    source={require('../Common/images/dash_apply_for_loan_off.png')}
                    style={[
                      {height: 20, width: 20},
                      isActive('FarmerLoan') && {tintColor: '#030635'},
                    ]}
                  /> */}
                      <Text
                        style={[
                          styles.subText,
                          isActive('FarmerLoan') && styles.activeSubText,
                        ]}>
                        {t('L_view_loan_nrequested')}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.subMenu,
                      {paddingLeft: 30},
                      isActive('FarmerLoan') && styles.activeSubMenu,
                    ]}
                    onPress={() => navigateToPages('FarmerLoanRequest')}>
                    <View style={styles.subMenuItem}>
                      <MaterialIcons
                        name="assignment-add"
                        size={20}
                        color={isActive('FarmerLoan') ? '#030635' : '#eaf3ee'}
                      />
                      {/* <Image
                    source={require('../Common/images/dash_apply_for_loan_off.png')}
                    style={[
                      {height: 20, width: 20},
                      isActive('FarmerLoan') && {tintColor: '#030635'},
                    ]}
                  /> */}
                      <Text
                        style={[
                          styles.subText,
                          isActive('FarmerLoan') && styles.activeSubText,
                        ]}>
                        {t('loan_request_n')}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.subMenu,
                      {paddingLeft: 30},
                      isActive('FarmerInsuranceEnquiry') &&
                        styles.activeSubMenu,
                    ]}
                    onPress={() =>
                      navigateToPages('FarmerInsuViewPastRequested')
                    }>
                    <View style={styles.subMenuItem}>
                      <MaterialIcons
                        name="security"
                        size={20}
                        color={
                          isActive('FarmerInsuranceEnquiry')
                            ? '#030635'
                            : '#eaf3ee'
                        }
                      />
                      {/* <Image
                    source={require('../Common/images/dash_apply_for_insurance_off.png')}
                    style={[
                      {height: 20, width: 20},
                      isActive('FarmerInsuranceEnquiry') && {
                        tintColor: '#030635',
                      },
                    ]}
                  /> */}
                      <Text
                        style={[
                          styles.subText,
                          isActive('FarmerInsuranceEnquiry') &&
                            styles.activeSubText,
                        ]}>
                        {t('Insu_enquiry_detail')}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.subMenu,
                      {paddingLeft: 30},
                      isActive('FarmerInsuranceEnquiry') &&
                        styles.activeSubMenu,
                    ]}
                    onPress={() =>
                      navigateToPages('FarmerRequestForInsurance')
                    }>
                    <View style={styles.subMenuItem}>
                      <MaterialIcons
                        name="maps-ugc"
                        size={20}
                        color={
                          isActive('FarmerInsuranceEnquiry')
                            ? '#030635'
                            : '#eaf3ee'
                        }
                      />
                      {/* <Image
                    source={require('../Common/images/dash_apply_for_insurance_off.png')}
                    style={[
                      {height: 20, width: 20},
                      isActive('FarmerInsuranceEnquiry') && {
                        tintColor: '#030635',
                      },
                    ]}
                  /> */}
                      <Text
                        style={[
                          styles.subText,
                          isActive('FarmerInsuranceEnquiry') &&
                            styles.activeSubText,
                        ]}>
                        {t('request_for_ninsurance')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}
            {/* FarmerInstrumentWiseActivityView */}
            <TouchableOpacity
              style={[
                styles.memuContainer,
                isActive('FarmerInstrumentWiseActivityView') &&
                  styles.activeSingleMenu, // Apply active style
              ]}
              onPress={() =>
                navigateToPages('FarmerInstrumentWiseActivityView')
              }>
              <View style={[styles.menuItemCal]}>
                <View
                  style={[
                    // styles.iconView,
                    isActive('FarmerInstrumentWiseActivityView') &&
                      styles.activeIcon, // Apply active style
                  ]}>
                  <View style={styles.iconView}>
                    <MaterialIcons
                      name="local-activity"
                      size={22}
                      color="#030730"
                    />
                  </View>
                </View>
                <Text
                  style={[
                    styles.menuText,
                    isActive('FarmerInstrumentWiseActivityView') &&
                      styles.activeText, // Active text color
                  ]}>
                  {t('instrument_Wise_Activity_View')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Logout Section */}
            <TouchableOpacity
              style={styles.memuContainer}
              onPress={handleLogout}>
              <View style={styles.menuItem}>
                <View style={styles.iconView}>
                  <MaterialIcons name="logout" size={22} color="#030730" />
                  {/* <Image
                  source={require('../Common/images/logout.png')}
                  style={[{height: 25, width: 25, tintColor: '#030730'}]}
                /> */}
                </View>
                <Text style={styles.menuText}>{t('sign_out')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
};
export default FarmerDrawer;
const styles = StyleSheet.create({
  mainView: {
    marginTop: 70,
    flex: 1,
    marginBottom: 30,
  },
  container: {
    marginTop: 30,
  },
  memuContainer: {
    paddingVertical: 12,
    backgroundColor: Colors.drawer,
  },
  subMenu: {
    backgroundColor: Colors.drawer,
    justifyContent: 'center',
    marginRight: 5,
    borderEndStartRadius: 50,
    paddingVertical: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#d5dbd7',
    paddingBottom: 8,
    marginTop: 0,
    height: 50, // Fixed height for consistent alignment
  },
  menuItemHome: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#d5dbd7',
    // paddingBottom: 8,
    marginTop: 0,
    height: 35, // Match other menu items
  },
  menuItemCal: {
    flexDirection: 'row',
    // alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.Lcolor,
    // marginBottom: 20,
    height: 50, // Fixed height for consistent alignment
  },
  activeSingleMenu: {
    backgroundColor: Colors.Lcolor,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    height: 50,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    height: 40, // Fixed height for submenu items
  },
  menuText: {
    marginLeft: 12,
    fontSize: 15,
    color: Colors.Lcolor,
    fontFamily: 'Poppins-Regular',
    // Allow text to take available space
  },
  subText: {
    marginLeft: 12,
    fontSize: 14,
    color: Colors.Lcolor,
    fontFamily: 'Poppins-Regular',
    paddingRight: 25,
  },
  iconView: {
    backgroundColor: Colors.Lcolor,
    borderRadius: 55,
    // padding: 6,
    marginLeft: 8,
    width: 30, // Fixed width
    height: 30, // Fixed height
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconViewHome: {
    backgroundColor: '#fff6ba',
    borderRadius: 5,
    marginLeft: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeMenu: {
    backgroundColor: '#d5dbd7',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  activeText: {
    color: '#102018',
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
  },
  activeIcon: {
    // backgroundColor: '#95af98',
  },
  activeSubMenu: {
    backgroundColor: '#d5dbd7',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  activeSubText: {
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
  },

  /////////////////////////////////////////////////////
  // mainView: {
  //   marginTop: 150,
  // },
  // container: {
  //   marginTop: 30,
  // },
  // memuContainer: {
  //   paddingVertical: 10,
  //   backgroundColor: '#192911',
  // },
  // subMenu: {
  //   backgroundColor: '#192911',
  //   justifyContent: 'center',
  //   marginRight: 5,
  //   borderEndStartRadius: 50,
  // },
  // menuItem: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#abc7ae',
  //   paddingBottom: 6,
  //   marginTop: 20,
  // },
  // menuItemHome: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#abc7ae',
  //   paddingBottom: 6,
  //   marginTop: 30,
  // },
  // subMenuItem: {
  //   flexDirection: 'row',
  //   paddingBottom: 10,
  //   marginTop: 10,
  // },
  // menuText: {
  //   marginLeft: 10,
  //   fontSize: 16,
  //   color: 'white',
  //   fontFamily: 'Poppins-Regular',
  // },
  // subText: {
  //   marginLeft: 10,
  //   fontSize: 15,
  //   color: 'white',
  //   fontFamily: 'Poppins-Regular',
  //   paddingRight: 25,
  // },
  // iconView: {
  //   backgroundColor: '#fff6ba',
  //   borderRadius: 5,
  //   padding: 3,
  //   // overflow: 'hidden',
  // },
  // iconViewHome: {
  //   backgroundColor: '#fff6ba', // Yellow background
  //   borderRadius: 5,
  //   // padding: 5, // This adds space around the icon
  //   marginRight: 10, // Add space between icon and text
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   // Add these to prevent the icon from being cut off:
  //   overflow: 'hidden', // Ensures content stays within bounds
  //   height: 35, // Fixed height
  //   width: 35, // Fixed width
  // },
  // activeMenu: {
  //   backgroundColor: '#abc7ae',
  //   width: '100%',
  //   borderTopLeftRadius: 15,
  //   borderBottomLeftRadius: 15,
  //   height: 50,
  // },
  // activeText: {
  //   color: 'black',
  //   fontSize: 16.5,
  //   fontFamily: 'Poppins-SemiBold',
  // },
  // activeIcon: {
  //   backgroundColor: '#abc7ae',
  //   // borderRadius: 5,
  //   // // marginLeft: 5,
  //   // marginTop: 1,
  //   // zIndex: 1000,
  //   // marginLeft: 5,
  // },
  // activeSubMenu: {
  //   flex: 1,
  //   backgroundColor: '#abc7ae',
  //   width: '100%',
  //   borderTopLeftRadius: 20,
  //   borderBottomLeftRadius: 20,
  //   height: 45,
  //   marginTop: 10,
  // },
  // activeSubText: {
  //   color: 'black',
  //   fontFamily: 'Poppins-SemiBold',
  // },

  /////////////////////////////////////////////////////////////////
  // container: {
  //   // position: 'absolute',
  //   // bottom: '55%',
  //   // width: '100%',
  //   // position:'relative'
  //   marginTop: 30,
  // },
  // modalView: {
  //   // flex: 1, width: '70%', height: Dimensions.get('window').height,
  //   // backgroundColor: '#023913',
  //   // position: 'absolute',
  //   // top: 5,
  //   // right: 0,
  // },
  // memuContainer: {
  //   paddingVertical: 8,
  //   paddingHorizontal: 15,
  //   backgroundColor: '#023913',
  // },
  // menuItem: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   borderBottomWidth: 1.5,
  //   borderBottomColor: '#ebffaa',
  //   paddingBottom: 5,
  // },
  // menuText: {
  //   marginLeft: 10,
  //   fontSize: 15,
  //   color: '#FFF',
  //   fontFamily: 'Poppins-Regular',
  // },
});
