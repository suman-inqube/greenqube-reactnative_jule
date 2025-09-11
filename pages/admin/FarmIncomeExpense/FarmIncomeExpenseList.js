import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Dimensions,
  BackHandler,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {useFocusEffect, useRoute} from '@react-navigation/native';

import DatePickerComp from '../../Common/DatePickerComp';
import {farmaccountsListAPI} from '../../../config/apiHere';
import {formatDateToDateName} from '../../Common/DateChanger';
import {userCreateContext} from '../../Context/usersCreateContext';
import {Colors, Fronts} from '../../utils/Constants';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Marquee} from '@animatereactnative/marquee';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PaginationNav from '../../Components/PaginationNav';
import FloatingActionButton from '../../Components/FloatingActionButton';
import {getActionsIncomeExpense} from '../../utils/options';

const FarmIncomeExpenseList = ({navigation}) => {
  //GQR-67
  const {
    dbLanTokUsr,
    setdbLanTokUsr,
    loginUser_data,
    LoadingScreen,
    CustomHeader,
    t,
    getItem,
    AlertMesg,
    onBackPress,
    setItem,
    logoImage,
    topBanner,
    Root,
    Toast,
    SPSheet,
    effective_dates,
    farmerData,
    navigationBarHeight,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  const {pageNo} = dbLanTokUsr;
  const route = useRoute();

  //GQR-67
  const [currency, setCurrency] = useState('');
  const [farmAccount, setFarmAccount] = useState([]);
  const [farmAccountRaw, setFarmAccountRaw] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [searchFarmerName, setSearchFarmerName] = useState({
    label: '',
    value: '',
  });
  const [searchFarmerPhone, setSearchFarmerPhone] = useState({
    label: '',
    value: '',
  });
  const [filterItem, setFilterItem] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const onPageLoad = async (
    pageNo,
    farmerId = '',
    phoneNumber = '',
    fromDate = '',
    toDate = '',
  ) => {
    setIsLoading(true);
    const [curr, response] = await Promise.all([
      getItem('currency'),
      farmaccountsListAPI(
        dbname,
        lan_id,
        token,
        user_id,
        pageNo,
        farmerId,
        fromDate,
        toDate,
      ),
    ]);
    setCurrency(curr);
    if (response?.status == 200) {
      setTotalPages(Math.ceil(response?.data?.data.count / 20));
      setFarmAccount(response.data.data.rows);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (route?.params?.action === 'addData') {
      Toast.show({text: t('Data_submitted_successfully'), ...AlertMesg[0]});
      setTotalPages(1);
      onPageLoad(1, '');
      setPage(1);
    }
  }, [route?.params]);

  const ShowIncome = props => {
    const incomeItem = props.income.filter(
      item1 => item1.inexType?.taxonomy === 'income',
    );
    if (incomeItem) {
      let incomeAmount = 0;
      incomeItem.forEach(element => {
        incomeAmount += parseFloat(element.amount) || 0;
      });
      return incomeAmount.toFixed(2);
    }
  };
  const ShowExpense = props => {
    const expenseItem = props.expense.filter(
      item1 => item1.inexType?.taxonomy === 'expense',
    );
    if (expenseItem) {
      let expenseAmount = 0;
      expenseItem.forEach(element => {
        expenseAmount += parseFloat(element.amount) || 0;
      });
      return expenseAmount.toFixed(2);
    }
  };
  const navigateToPages = async (pageName, index) => {
    setItem('farm_in_ex_id', farmAccount[index]);
    navigation.navigate(pageName);
  };
  useEffect(() => {
    onPageLoad(page);
  }, [page]);

  const filterOptionShow = useCallback(async () => {
    const {openFilterSheet} = await import('../../Components/FilterSheet');
    openFilterSheet({
      options: ['farmer', 'phone', 'date', ''],
      t: t,
      dropdownData: farmerData,
      filterItem: filterItem,
      setFilterItem: setFilterItem,
      setSearchFarmerName: setSearchFarmerName,
      setSearchFarmerPhone: setSearchFarmerPhone,
      searchFarmerName: searchFarmerName,
      searchFarmerPhone: searchFarmerPhone,
      title: 'Choose Status',
      handleFilterResult: handleFilterResult,
      handleFilterRemove: handleFilterRemove,
      setFromDate: setFromDate,
      setToDate: setToDate,
      fromDate: fromDate,
      toDate: toDate,
      effective_dates: effective_dates,
      navigationBarHeight: navigationBarHeight,
      height: 180,
    });
  }, [filterItem, searchFarmerName, searchFarmerPhone, fromDate, toDate]);
  const handleFilterResult = useCallback(
    ({filter, fromDate, toDate, farmerName, farmerPhone, sheetCarbonType}) => {
      try {
        setFilterItem(filter);
        setFromDate(fromDate);
        setToDate(toDate);
        setSearchFarmerName({
          label: farmerName?.label,
          value: farmerName?.value,
        });
        setSearchFarmerPhone({
          label: farmerPhone?.label,
          value: farmerPhone?.value,
        });
        setPage(1);
        let fid = '';
        if (filter == 'PhoneNumber') {
          fid = farmerPhone?.value;
        }
        if (filter == 'Farmer/Product Name') {
          fid = farmerName?.value;
        }
        setPage(1);
        console.log(fid);
        onPageLoad(1, fid, '', fromDate, toDate);
        console.log(filter);
      } catch (error) {
        console.log(error);
      }
    },
    [filterItem, fromDate, toDate, searchFarmerName, searchFarmerPhone],
  );
  const handleFilterRemove = () => {
    try {
      setFromDate('');
      setToDate('');
      setSearchFarmerName({label: '', value: ''});
      setSearchFarmerPhone({label: '', value: ''});
      setFilterItem('');
      onPageLoad(1);
      setPage(1);
    } catch (error) {
      console.log(error);
    }
  };
  const renderCustomHeader = useMemo(
    () => (
      <CustomHeader
        path="Dashboard"
        logoImage={logoImage}
        topBanner={topBanner}
        filterOptionShow={filterOptionShow}
        t={t}
      />
    ),
    [filterOptionShow],
  );
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        <View style={styles.mainContainer}>
          {renderCustomHeader}
          {isLoading && (
            <View style={styles.loadingScreen}>
              <LoadingScreen />
            </View>
          )}
          <FlatList
            data={farmAccount}
            renderItem={({item, index}) => (
              <TouchableOpacity
                style={styles.wrapper}
                key={index}
                onPress={() => navigateToPages('FarmIncomeExpenseView', index)}>
                <View style={styles.cardHeader}>
                  <View style={styles.marqueeContainer}>
                    <Text style={styles.cardTitle}>
                      {t('name')} :{' '}
                      <Text
                        style={styles.cardTitleRe}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {item.agri_user && item.agri_user.userName}
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <MaterialIcons
                      name="chevron-right"
                      size={20}
                      color="#2e7d32"
                    />
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>{t('addcrop_plot')} :</Text>
                  <Text
                    style={styles.value}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.land_info && item.land_info.plot_no}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>{t('showing_date')} :</Text>
                  <Text style={styles.value}>
                    {formatDateToDateName(item.sowing_date)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>
                    {t('total_income_sum') + '(' + currency + ')'}:
                  </Text>
                  <Text
                    style={styles.value}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {<ShowIncome income={item.income_expense} />}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>{t('farmer_number')} : </Text>
                  <Text
                    style={styles.value}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.agri_user && item.agri_user.contactNumber}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>
                    {t('knowyourplot_cropinfo_cropname').substring(0, 13)} :
                  </Text>
                  <Text
                    style={styles.value}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.crop_name && item.crop_name.name}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>
                    {t('harvesting_date_auto_calculated')} :{' '}
                  </Text>
                  <Text
                    style={styles.value}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {formatDateToDateName(item.harvesting_date)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>
                    {t('total_exp_sum') + '(' + currency + ')'}:
                  </Text>
                  <Text style={styles.value}>
                    {<ShowExpense expense={item.income_expense} />}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index}
            showsVerticalScrollIndicator={false}
          />
          <PaginationNav
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
            t={t}
          />
          <FloatingActionButton
            position="right"
            actions={getActionsIncomeExpense(t, styles, Colors)}
            color={Colors.useGreen}
            onPressItem={name => {
              if (name === 'add_income') {
                navigation.navigate('AddIcome'); // Navigate to Add Income screen
              } else if (name === 'add_expense') {
                navigation.navigate('AddExpense'); // Navigate to Add Expense screen
              }
            }}
            showBackground={true}
            overlayColor="rgba(22, 17, 17, 0.35)"
            distanceToEdge={{vertical: 80, horizontal: 25}}
          />
        </View>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmIncomeExpenseList;

const styles = StyleSheet.create({
  mainContainer: {backgroundColor: Colors.pageBackground, flex: 1},

  prevNextPage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    position: 'relative',
    bottom: 0,
  },
  wrapper: {
    backgroundColor: 'white',

    marginVertical: 8,
    borderRadius: 20,
    borderLeftWidth: 5,
    borderLeftColor: Colors.borderGreen,
    // flexDirection: 'row',
    // alignItems: 'center',
    // marginBottom: 8,
    paddingHorizontal: 15,
    marginHorizontal: '4%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 4,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: Colors.border,
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,
    // padding: 10,
    // padding: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 14,
    // fontWeight: '600',
    color: Colors.useGreen,
    // marginLeft: 5,
    fontFamily: 'Poppins-SemiBold',
  },
  cardTitleRe: {
    fontSize: 14,
    // fontWeight: '600',
    color: Colors.useGreen,
    // marginLeft: 5,
    fontFamily: 'Poppins-Regular',
  },
  marqueeContainer: {
    flex: 1,
    // marginLeft: 10,
    marginRight: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    // borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    // paddingTop: 8,
    marginLeft: 5,
  },
  viewDetailsText: {
    fontSize: 12,
    color: Colors.useGreen,
    // marginRight: 4,
    fontFamily: 'Poppins-Regular',
  },
  activityListContainer: {
    marginBottom: 10,
  },
  addExpense: {
    position: 'absolute',
    bottom: 80,
    backgroundColor: 'green',
    width: 110,
    paddingVertical: 10,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  addIncome: {
    position: 'absolute',
    right: 0,
    bottom: 80,
    backgroundColor: 'green',
    width: 110,
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  addExpenseTitle: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  addIncomTitle: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  flatContainer: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    bottom: '100%',
    left: 0,
    marginHorizontal: '5%',
    width: '90%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },
  flatlistHeight: {
    height: Dimensions.get('window').height / 2.5,
  },

  flatlisttitle: {
    color: '#000',
    marginVertical: 6,
  },
  flatlistitem: {},

  title: {
    fontSize: 13,
    color: Colors.text,
    marginLeft: 5,
    fontFamily: 'Poppins-SemiBold',
    paddingBottom: 5,
  },
  titleRe: {
    fontSize: 13,
    color: Colors.text,
    marginLeft: 5,
    fontFamily: 'Poppins-Regular',
    paddingBottom: 5,
  },
  titleBottomPre: {
    fontSize: 12,
    color: 'white',
    marginLeft: 5,
    fontFamily: 'Poppins-SemiBold',
    // paddingBottom: 5,
  },
  titleBottomMid1: {
    fontSize: 12,
    color: 'white',
    // marginRight: 8,
    fontFamily: 'Poppins-SemiBold',
    // paddingBottom: 5,
  },
  titleBottomMid2: {
    fontSize: 12,
    color: 'white',
    marginLeft: 10,
    fontFamily: 'Poppins-SemiBold',
    // paddingBottom: 5,
  },
  titleBottomNet: {
    fontSize: 12,
    color: 'white',
    marginLeft: 5,
    fontFamily: 'Poppins-SemiBold',
    // paddingBottom: 5,
  },
  activityListItem: {
    width: '100%',
    // alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 5,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
    // flex: 1,
  },
  value: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',

    textAlign: 'right',
  },
  loadingScreen: {
    position: 'absolute',
    top: '45%',
    zIndex: 999,
    left: '45%',
  },
});
