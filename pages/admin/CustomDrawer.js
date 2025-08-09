import React, {memo, useEffect, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import {removeItem} from '../../config/getDataFromStorage';
import {StackActions, useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import DeviceInfo from '../DeviceInfo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors, Fonts} from '../utils/Constants';
const CustomDrawer = props => {
  const {netConnection} = DeviceInfo();
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {state} = props; // Get the navigation state from props
  const activeRouteName = state?.routes[state.index]?.name; // Get current active screen name

  const isActiveScreen = screenName => {
    return activeRouteName === screenName;
  };

  const isActiveParent = screenNames => {
    return screenNames.includes(activeRouteName);
  };

  const [profileExpanded, setProfileExpanded] = useState(false);
  const [businessExpanded, setBusinessExpanded] = useState(false);
  const [farmAccountExpanded, setFarmAccountExpanded] = useState(false);

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
  const removeData = async () => {
    if (netConnection) {
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
      ]);
      const popAction = StackActions.pop(1);
      navigation.dispatch(popAction);
      navigation.navigate('Login');
    } else {
      Alert.alert('You are offline hence cannot proceed');
    }
  };
  const navigateToPages = pageName => {
    if (netConnection) {
      navigation.navigate(pageName);
    }
  };

  const handleMenuExpand = menuName => {
    // Close all menus first
    setProfileExpanded(false);
    setBusinessExpanded(false);
    setFarmAccountExpanded(false);

    // Then open the selected menu
    switch (menuName) {
      case 'profile':
        setProfileExpanded(!profileExpanded);
        break;
      case 'business':
        setBusinessExpanded(!businessExpanded);
        break;
      case 'farmAccount':
        setFarmAccountExpanded(!farmAccountExpanded);
        break;
    }
  };

  return (
    <View style={styles.mainView}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{marginBottom: 80}}>
          <TouchableOpacity
            style={styles.memuContainer}
            onPress={() => navigateToPages('Dashboard')}>
            <View style={styles.menuItemCal}>
              <View style={styles.iconView}>
                <MaterialIcons name="home" size={22} color="#030730" />
              </View>
              <Text style={styles.menuText}>{t('Home')}</Text>
            </View>
          </TouchableOpacity>

          {/* Profile Section */}
          <TouchableOpacity
            style={styles.memuContainer}
            onPress={() => handleMenuExpand('profile')}>
            <View style={[styles.menuItem, {marginTop: 8}]}>
              <View style={styles.iconView}>
                <MaterialIcons name="person" size={22} color="#030730" />
              </View>
              <Text style={styles.menuText}>{t('profile')}</Text>
              <MaterialIcons
                name={profileExpanded ? 'expand-less' : 'expand-more'}
                size={22}
                color="#d5dbd7"
                style={{marginRight: 130}}
              />
            </View>
          </TouchableOpacity>

          {profileExpanded && (
            <View style={{marginBottom: 30}}>
              <TouchableOpacity
                style={[styles.subMenu, {paddingLeft: 30}]}
                onPress={() => navigateToPages('Profile')}>
                <View style={styles.subMenuItem}>
                  <MaterialIcons
                    name="supervisor-account"
                    size={22}
                    color="#eaf3ee"
                  />
                  <Text style={styles.subText}>{t('profile')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subMenu, {paddingLeft: 30}]}
                onPress={() => navigateToPages('ChangePassword')}>
                <View style={styles.subMenuItem}>
                  <MaterialIcons name="lock-reset" size={22} color="#eaf3ee" />
                  <Text style={styles.subText}>{t('change_password')}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Business/Traceability Section */}
          <TouchableOpacity
            style={styles.memuContainer}
            onPress={() => handleMenuExpand('business')}>
            <View style={styles.menuItem}>
              <View style={styles.iconView}>
                <MaterialIcons name="business" size={22} color="#030730" />
              </View>
              <Text style={styles.menuText}>{t('traceability')}</Text>
              <MaterialIcons
                name={businessExpanded ? 'expand-less' : 'expand-more'}
                size={22}
                color="#d5dbd7"
                style={{marginRight: 100}}
              />
            </View>
          </TouchableOpacity>

          {businessExpanded && (
            <View style={{marginBottom: 30}}>
              <TouchableOpacity
                style={[styles.subMenu, {paddingLeft: 30}]}
                onPress={() => navigateToPages('Business')}>
                <View style={styles.subMenuItem}>
                  <MaterialIcons
                    name="business-center"
                    size={22}
                    color="#eaf3ee"
                  />
                  <Text style={styles.subText}>{t('traceability')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subMenu, {paddingLeft: 30}]}
                onPress={() => navigateToPages('DailySalesReport')}>
                <View style={styles.subMenuItem}>
                  <MaterialIcons name="receipt" size={22} color="#eaf3ee" />
                  <Text style={styles.subText}>{t('daily_sales_report')}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* FARMAccount Section */}
          <TouchableOpacity
            style={styles.memuContainer}
            onPress={() => handleMenuExpand('farmAccount')}>
            <View style={styles.menuItem}>
              <View style={styles.iconView}>
                <MaterialIcons
                  name="account-balance"
                  size={22}
                  color="#030730"
                />
              </View>
              <Text style={styles.menuText}>
                {t('farm_income_amp_expense')}
              </Text>
              <MaterialIcons
                name={farmAccountExpanded ? 'expand-less' : 'expand-more'}
                size={22}
                color="#d5dbd7"
                style={{marginRight: 50}}
              />
            </View>
          </TouchableOpacity>

          {farmAccountExpanded && (
            <View style={{marginBottom: 30}}>
              <TouchableOpacity
                style={[styles.subMenu, {paddingLeft: 30}]}
                onPress={() => navigateToPages('FarmIncomeExpenseList')}>
                <View style={styles.subMenuItem}>
                  <MaterialIcons
                    name="currency-rupee"
                    size={22}
                    color="#eaf3ee"
                  />
                  <Text style={styles.subText}>
                    {t('farm_income_amp_expense')}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subMenu, {paddingLeft: 30}]}
                onPress={() => navigateToPages('Loan')}>
                <View style={styles.subMenuItem}>
                  <MaterialIcons
                    name="real-estate-agent"
                    size={22}
                    color="#eaf3ee"
                  />
                  <Text style={styles.subText}>
                    {t('loan_ninquiry_far_dash')}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subMenu, {paddingLeft: 30}]}
                onPress={() => navigateToPages('InsuranceEnquiry')}>
                <View style={styles.subMenuItem}>
                  <MaterialIcons name="security" size={22} color="#eaf3ee" />
                  <Text style={styles.subText}>{t('ins_inq_far_dash')}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Training Support - Single Menu */}
          <TouchableOpacity
            style={styles.memuContainer}
            onPress={() => navigateToPages('TraingList')}>
            <View style={styles.menuItemCal}>
              <View style={styles.iconView}>
                <MaterialIcons name="school" size={22} color="#030730" />
              </View>
              <Text style={styles.menuText}>{t('training_support')}</Text>
            </View>
          </TouchableOpacity>

          {/* Logout Section */}
          <TouchableOpacity style={styles.memuContainer} onPress={handleLogout}>
            <View style={styles.menuItem}>
              <View style={styles.iconView}>
                <MaterialIcons name="logout" size={22} color="#030730" />
              </View>
              <Text style={styles.menuText}>{t('sign_out')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default memo(CustomDrawer);
const styles = StyleSheet.create({
  mainView: {
    marginTop: 120,
    flex: 1,
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
    height: 60,
  },
  menuItemCal: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.Lcolor,
    height: 60,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    height: 40,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 15,
    color: Colors.Lcolor,
    fontFamily: 'Poppins-Regular',
    flex: 1,
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
    marginLeft: 8,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
