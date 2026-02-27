import React, { memo, useCallback, useState, useMemo, useContext } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { removeItem } from '../../config/getDataFromStorage';
import { StackActions, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors, Fonts } from '../utils/Constants';
import { userCreateContext } from '../Context/usersCreateContext';
const MENU_TYPES = {
  PROFILE: 'profile',
  BUSINESS: 'business',
  FARM_ACCOUNT: 'farmAccount',
  FINANCE: 'finance',
};
const STORAGE_KEYS = [
  'logoImageData',
  'loginUser_data',
  'profileImgData',
  'userNameData',
  'userType',
  'bottomBannerData',
  'topBannerData',
  'currency',
  'fcmToken',
  'company_website',
];
const MenuItem = memo(
  ({
    iconName,
    title,
    onPress,
    isExpandable = false,
    isExpanded = false,
    expandIconMarginRight = 130,
  }) => (
    <TouchableOpacity style={styles.memuContainer} onPress={onPress}>
      <View style={isExpandable ? styles.menuItem : styles.menuItemCal}>
        <View style={styles.iconView}>
          <MaterialIcons name={iconName} size={22} color="#030730" />
        </View>
        <Text style={styles.menuText}>{title}</Text>
        {isExpandable && (
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={22}
            color="#d5dbd7"
            style={{ marginRight: expandIconMarginRight }}
          />
        )}
      </View>
    </TouchableOpacity>
  ),
);
const SubMenuItem = memo(({ iconName, title, onPress }) => (
  <TouchableOpacity
    style={[styles.subMenu, { paddingLeft: 30 }]}
    onPress={onPress}>
    <View style={styles.subMenuItem}>
      <MaterialIcons name={iconName} size={22} color="#eaf3ee" />
      <Text style={styles.subText}>{title}</Text>
    </View>
  </TouchableOpacity>
));
const CustomDrawer = memo(({ state }) => {
  const {isOnline, dbLanTokUsr} = useContext(userCreateContext) || {};
  const { t } = useTranslation();
  const navigation = useNavigation();
  const activeRouteName = useMemo(
    () => state?.routes[state.index]?.name,
    [state],
  );
  const [expandedMenus, setExpandedMenus] = useState({
    profile: false,
    business: false,
    farmAccount: false,
    finance: false,
  });
  const handleLogout = useCallback(() => {
    Alert.alert(
      t('app_name'),
      t('close_app'),
      [
        {
          text: t('cancle'),
          style: 'cancel',
        },
        {
          text: t('ok'),
          onPress: removeData,
        },
      ],
      { cancelable: false },
    );
  }, [t]);

  const removeData = useCallback(async () => {
    if (!isOnline) {
      Alert.alert('You are offline hence cannot proceed');
      return;
    }
    try {
      await Promise.all(STORAGE_KEYS.map(key => removeItem(key)));
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error occurred during logout');
    }
  }, [isOnline, navigation, navigateToPages]);
  const navigateToPages = useCallback(
    pageName => {
      if (isOnline) {
        navigation.navigate('AdminNavigation', {
          screen: 'AdminStack',
          params: { screen: pageName },
        });
      }
    },
    [isOnline, navigation],
  );

  const handleMenuExpand = useCallback(menuName => {
    setExpandedMenus(prev => ({
      profile: menuName === MENU_TYPES.PROFILE ? !prev.profile : false,
      business: menuName === MENU_TYPES.BUSINESS ? !prev.business : false,
      farmAccount:
        menuName === MENU_TYPES.FARM_ACCOUNT ? !prev.farmAccount : false,
      finance: menuName === MENU_TYPES.FINANCE ? !prev.finance : false,
    }));
  }, []);

  // Memoized menu data
  const menuConfig = useMemo(
    () => [
      {
        id: 'home',
        iconName: 'home',
        title: t('Home'),
        onPress: () => navigateToPages('Dashboard'),
      },
      {
        id: 'profile',
        iconName: 'person',
        title: t('profile'),
        isExpandable: true,
        isExpanded: expandedMenus.profile,
        onPress: () => handleMenuExpand(MENU_TYPES.PROFILE),
        expandIconMarginRight: 30,
        subItems: [
          {
            iconName: 'supervisor-account',
            title: t('profile'),
            onPress: () => navigateToPages('Profile'),
          },
          {
            iconName: 'lock-reset',
            title: t('change_password'),
            onPress: () => navigateToPages('ChangePassword'),
          },
        ],
      },
      // {
      //   id: 'business',
      //   iconName: 'business',
      //   title: t('traceability'),
      //   // isExpandable: true,
      //   // isExpanded: expandedMenus.business,
      //   onPress: () => navigateToPages('Business'),
      //   // expandIconMarginRight: 30,
      //   // subItems: [
      //   //   // {
      //   //   //   iconName: 'business-center',
      //   //   //   title: t('traceability'),
      //   //   //   onPress: () => navigateToPages('Business'),
      //   //   // },
      //   //   {
      //   //     iconName: 'receipt',
      //   //     title: t('daily_sales_report'),
      //   //     onPress: () => navigateToPages('DailySalesReport'),
      //   //   },
      //   // ],
      // },

      {
        id: 'DailySalesReport',
        iconName: 'receipt',
        title: t('daily_sales_report'),
        onPress: () => navigateToPages('DailySalesReport'),
      },

      {
        id: 'farmAccount',
        iconName: 'account-balance',
        title: t('farm_income_amp_expense'),
        // isExpandable: true,
        // isExpanded: expandedMenus.farmAccount,
        onPress: () => navigateToPages('FarmIncomeExpenseList'),
      },
      {
        id: 'finance',
        iconName: 'payment',
        title: t('Finance'),
        isExpandable: true,
        isExpanded: expandedMenus.finance,
        // onPress: () => navigateToPages('FarmIncomeExpenseList'),
        onPress: () => handleMenuExpand(MENU_TYPES.FINANCE),
        expandIconMarginRight: 30,
        subItems: [
          {
            iconName: 'real-estate-agent',
            title: t('L_view_loan_nrequested'),
            onPress: () => navigateToPages('LoanViewPastRequested'),
          },
          {
            iconName: 'assignment-add',
            title: t('loan_request_n'),
            onPress: () => navigateToPages('LoanRequest'),
          },
          {
            iconName: 'security',
            title: t('Insu_enquiry_detail'),
            onPress: () => navigateToPages('InsuranceViewPastRequested'),
          },
          {
            iconName: 'maps-ugc',
            title: t('request_for_ninsurance'),
            onPress: () => navigateToPages('RequestForInsurance'),
          },
        ],
      },

      {
        id: 'training',
        iconName: 'school',
        title: t('training_support'),
        onPress: () => navigateToPages('TraingList'),
      },
      {
        id: 'instrument',
        iconName: 'local-activity',
        title: t('instrument_Wise_Activity_View'),
        onPress: () => navigateToPages('InstrumentWiseActivityView'),
      },
      // {
      //   id: 'Offline',
      //   iconName: 'local-activity',
      //   title: t('Offline'),
      //   onPress: () => navigateToPages('Offline'),
      // },
      ...(dbLanTokUsr?.offline_mode == 1
        ? [
            {
              id: 'Offline',
              iconName: 'local-activity',
              title: t('Offline'),
              onPress: () => navigateToPages('Offline'),
            },
          ]
        : []),
      {
        id: 'logout',
        iconName: 'logout',
        title: t('sign_out'),
        onPress: handleLogout,
      },
    ],
    [t, expandedMenus, handleMenuExpand, navigateToPages, handleLogout],
  );

  return (
    <View style={styles.mainView}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {menuConfig.map(menu => (
            <View key={menu.id}>
              <MenuItem
                iconName={menu.iconName}
                title={menu.title}
                onPress={menu.onPress}
                isExpandable={menu.isExpandable}
                isExpanded={menu.isExpanded}
                expandIconMarginRight={menu.expandIconMarginRight}
              />

              {menu.isExpanded && menu.subItems && (
                <View style={styles.subMenuContainer}>
                  {menu.subItems.map((subItem, index) => (
                    <SubMenuItem
                      key={`${menu.id}-${index}`}
                      iconName={subItem.iconName}
                      title={subItem.title}
                      onPress={subItem.onPress}
                    />
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
});

CustomDrawer.displayName = 'CustomDrawer';

export default CustomDrawer;

const styles = StyleSheet.create({
  mainView: {
    marginTop: 80,
    flex: 1,
    marginBottom: 20,
  },
  contentContainer: {
    marginBottom: 80,
  },
  memuContainer: {
    paddingVertical: 10,
    backgroundColor: Colors.drawer,
  },
  subMenu: {
    backgroundColor: Colors.drawer,
    justifyContent: 'center',
    marginRight: 5,
    borderEndStartRadius: 50,
    paddingVertical: 2,
  },
  subMenuContainer: {
    marginBottom: 10,
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
