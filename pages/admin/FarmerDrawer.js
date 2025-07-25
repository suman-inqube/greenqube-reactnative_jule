import React, { useEffect, useState,useContext } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Dimensions, } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import i18next from '../services/i18next';
import { useTranslation } from 'react-i18next';
import { StackActions, useNavigation } from '@react-navigation/native';
import { userCreateContext } from '../Context/usersCreateContext';
const FarmerDrawer = (props) => {
  const { loginUser_data, t, getItem, removeItem, DeviceInfo } = useContext(userCreateContext);
  const { dbname, lan_id, token, user_id, carbonFlag } = loginUser_data;
  const { netConnection } = DeviceInfo();
  const navigation = useNavigation();
  const [side_menu_option, set_side_menu_option] = useState("")
  const onPageLoad = async () => {
    const [loginUser_data, side_menu_option] = await Promise.all([
      getItem('loginUser_data'),
      getItem('side_menu_option')
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
        { text: `${t('cancle')}`, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: `${t('ok')}`, onPress: () => { removeData() } },
      ],
      { cancelable: false });

  }
  const removeData = async () => {
    if (netConnection) {
      await Promise.all([
        removeItem("logoImageData"),
        removeItem('loginUser_data'),
        removeItem("profileImgData"),
        removeItem("userNameData"),
        removeItem("userType"),
        removeItem("bottomBannerData"),
        removeItem("topBannerData"),
        removeItem("currency"),
        removeItem('fcmToken'),
        removeItem('company_website'),
        removeItem("side_menu_option"),
      ]);
      const popAction = StackActions.pop(1);
      navigation.dispatch(popAction);
      navigation.navigate('Login');
    } else {
      Alert.alert("You are offline hence cannot proceed");
    }
  }
  const navigateToPages = (pageName) => {
    if (netConnection) {
      navigation.navigate(pageName, { onPageName: "CustomDrawer" });
    }
  };
  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{marginBottom: 80}}>
          <TouchableOpacity
            style={[styles.container, props.style]}
            activeOpacity={1}
            onPress={() => props.setModalVisible(!props.modalVisible)}>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={styles.memuContainer}
                onPress={() => navigateToPages('FarmerProfile')}>
                <View style={[styles.menuItem, {marginTop: 8}]}>
                  <Image
                    source={require('../Common/images/user_menu.png')}
                    style={[{height: 28, width: 28, tintColor: '#FFF'}]}
                  />
                  <Text style={styles.menuText}>{t('profile')}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.memuContainer}
                onPress={() => navigateToPages('FarmerLiveHood')}>
                <View style={styles.menuItem}>
                  <Image
                    source={require('../Common/images/land.png')}
                    style={[{height: 30, width: 30, tintColor: '#FFF'}]}
                  />
                  <Text style={styles.menuText}>
                    {t('plot_and_crop_details')}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.memuContainer}
                onPress={() => navigateToPages('PackageOfPractices')}>
                <View style={styles.menuItem}>
                  <Image
                    source={require('../Common/images/scientific_farming.png')}
                    style={[{height: 30, width: 30, tintColor: '#FFF'}]}
                  />
                  <Text style={styles.menuText}>{t('scientific_farming')}</Text>
                </View>
              </TouchableOpacity>
              {side_menu_option?.soil_testing ? (
                <TouchableOpacity
                  style={styles.memuContainer}
                  onPress={() => navigateToPages('SoilHealthManagement')}>
                  <View style={styles.menuItem}>
                    <Image
                      source={require('../Common/images/soil.png')}
                      style={[{height: 30, width: 30, tintColor: '#FFF'}]}
                    />
                    <Text style={styles.menuText}>
                      {t('soil_health_management')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.memuContainer}>
                  <View style={styles.menuItem}>
                    <Image
                      source={require('../Common/images/soil.png')}
                      style={[{height: 30, width: 30, tintColor: '#FFF'}]}
                    />
                    <Text style={styles.menuText}>
                      {t('soil_health_management')}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              {side_menu_option?.agri_calculator ? (
                <TouchableOpacity
                  style={styles.memuContainer}
                  onPress={() => navigateToPages('Calculator')}>
                  <View style={styles.menuItem}>
                    <Image
                      source={require('../Common/images/calculator.png')}
                      style={[{height: 25, width: 25}]}
                    />
                    <Text style={styles.menuText}>{t('agri_calculator')}</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.memuContainer}>
                  <View style={styles.menuItem}>
                    <Image
                      source={require('../Common/images/calculator.png')}
                      style={[{height: 25, width: 25}]}
                    />
                    <Text style={styles.menuText}>{t('agri_calculator')}</Text>
                  </View>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.memuContainer}
                onPress={() => navigateToPages('FarmerFarmIncomeExpenseList')}>
                <View style={styles.menuItem}>
                  <Image
                    source={require('../Common/images/insurance_menu.png')}
                    style={[{height: 25, width: 25}]}
                  />
                  <Text style={styles.menuText}>
                    {t('farm_income_amp_expense')}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.memuContainer}
                onPress={() => navigateToPages('FarmerLoan')}>
                <View style={styles.menuItem}>
                  <Image
                    source={require('../Common/images/dash_apply_for_loan_off.png')}
                    style={[{height: 30, width: 30, tintColor: '#FFF'}]}
                  />
                  <Text style={styles.menuText}>
                    {t('loan_ninquiry_far_dash')}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.memuContainer}
                onPress={() => navigateToPages('FarmerInsuranceEnquiry')}>
                <View style={styles.menuItem}>
                  <Image
                    source={require('../Common/images/dash_apply_for_insurance_off.png')}
                    style={[{height: 30, width: 30, tintColor: '#FFF'}]}
                  />
                  <Text style={styles.menuText}>{t('ins_inq_far_dash')}</Text>
                </View>
              </TouchableOpacity>
              {carbonFlag ? (
                <TouchableOpacity
                  style={styles.memuContainer}
                  onPress={() =>
                    navigateToPages('FarmerInstrumentWiseActivityView')
                  }>
                  <View style={styles.menuItem}>
                    <Image
                      source={require('../Common/images/activity_report_only.png')}
                      style={[{height: 30, width: 30, tintColor: '#FFF'}]}
                    />
                    <Text style={styles.menuText}>
                      {t('instrument_Wise_Activity_View')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                ''
              )}
              <TouchableOpacity
                style={styles.memuContainer}
                onPress={() => navigateToPages('FarmerChangePassword')}>
                <View style={styles.menuItem}>
                  <Image
                    source={require('../Common/images/change_password_white.png')}
                    style={[{height: 30, width: 30}]}
                  />
                  <Text style={styles.menuText}>{t('change_password')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.memuContainer}
                onPress={() => handleLogout()}>
                <View style={styles.menuItem}>
                  <Image
                    source={require('../Common/images/logout.png')}
                    style={[{height: 25, width: 25}]}
                  />
                  <Text style={styles.menuText}>{t('sign_out')}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
export default FarmerDrawer
const styles = StyleSheet.create({
  container: {
    // position: 'absolute',
    // bottom: '55%',
    // width: '100%',
    // position:'relative'
    marginTop: 30
  },
  modalView: {
    // flex: 1, width: '70%', height: Dimensions.get('window').height,
    // backgroundColor: '#023913',
    // position: 'absolute',
    // top: 5,
    // right: 0,
  },
  memuContainer: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#023913'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#ebffaa',
    paddingBottom: 5
  },
  menuText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#FFF',
    fontFamily: 'Poppins-Regular'

  }

})