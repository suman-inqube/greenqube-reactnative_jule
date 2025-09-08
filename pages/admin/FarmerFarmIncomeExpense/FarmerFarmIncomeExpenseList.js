import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {farmerFarmaccountsListAPI} from '../../../config/apiHere';
import {formatDateToDateName} from '../../Common/DateChanger';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerFilter from '../../Common/FarmerFilter';
import {Colors, Fronts} from '../../utils/Constants';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Marquee} from '@animatereactnative/marquee';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const FarmerFarmIncomeExpenseList = ({navigation}) => {
  //GQR-67
  const {
    dbLanTokUsr,
    setdbLanTokUsr,
    loginUser_data,
    LoadingScreen,
    CustomHeader,
    DatePickerComp,
    t,
    getItem,
    setItem,
    logoImage,
    topBanner,
    handlePageList,
    effective_dates,
    handleFilter,
    Filter,
    Root,
    Toast,
    AlertMesg,
    FormsTitle,
    navigationBarHeight,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  const {pageNo} = dbLanTokUsr;
  //GQR-67
  const [currency, setcurrency] = useState('');
  const [farmAccount, setFarmAccount] = useState([]);
  const [farmAccountRaw, setFarmAccountRaw] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  const [filterName, setFilterName] = useState('');
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [filterOption, setFilterOption] = useState(false);
  const [filterItem, setFilterItem] = useState('');
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [newToDate, setnewToDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  // const filterOptionShow = () => {
  //   if (!filterOption) {
  //     setFilterOption(true);
  //   } else {
  //     setFilterOption(false);
  //   }
  // };
  const onchangeFilterItem = value => {
    setFilterName(value);
    setFilterItem(value);
    setFilterOption(false);
  };
  const filterOptionShow = async () => {
    try {
      const {openFilterSheet} = await import('../../Components/FilterSheet');
      openFilterSheet({
        options: ['', '', 'date', ''],
        // onchangeFilterItem: onchangeFilterItem,
        t: t,
        dropdownData: [],
        filterItem: filterItem,
        setFilterItem: setFilterItem,
        title: 'Choose Status',
        handleFilterResult: handleFilterResult,
        handleFilterRemove: handleFilterRemove,
        setFromDate: setFromDate,
        setToDate: setToDate,
        fromDate: fromDate,
        toDate: toDate,
        effective_dates: effective_dates,
        carbonFlag: false,
        CARBON_TYPE: [],
        navigationBarHeight: navigationBarHeight,
        height: 140,
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleFilterResult = useCallback(
    ({filter, fromDate, toDate, farmerName, farmerPhone, sheetCarbonType}) => {
      try {
        setFilterItem(filter);
        setFromDate(fromDate);
        setToDate(toDate);

        onPageLoad(
          fromDate,
          toDate,
          // filter,
        );
      } catch (error) {
        console.log(error, 'error');
      }
    },
    [],
  );
  const handleFilterRemove = () => {};
  const onPageLoad = async (fromDate = '', toDate = '') => {
    const curr = await getItem('currency');
    setcurrency(curr);

    const response = await farmerFarmaccountsListAPI(
      dbname,
      lan_id,
      token,
      user_id,
      1,
      fromDate,
      toDate,
    );
    if (response?.status == 200) {
      const totalPage = Math.ceil(response.data.data.count / 20);
      setdbLanTokUsr({...dbLanTokUsr, totalPage: totalPage, pageNo: 1});
      setFarmAccount(response.data.data.rows);
      setFarmAccountRaw(response.data.data.rows);
      setItem('farm_account', response.data.data.rows);
      setIsLoading(false);
    }
  };
  const ShowIncome = props => {
    const incomeItem = props.income.filter(
      item1 => item1.inexType?.taxonomy === 'income',
    );
    if (incomeItem) {
      let incomeAmount = 0;
      incomeItem.forEach(element => {
        incomeAmount += parseInt(element.amount);
      });
      return incomeAmount + '.0';
    }
  };
  const ShowExpense = props => {
    const expenseItem = props.expense.filter(
      item1 => item1.inexType?.taxonomy === 'expense',
    );
    if (expenseItem) {
      let expenseAmount = 0;
      expenseItem.forEach(element => {
        expenseAmount += parseInt(element.amount);
      });
      return expenseAmount + '.0';
    }
  };
  const handlePage = async value => {
    setIsLoading(true);
    const currentPageNo = dbLanTokUsr.pageNo;
    const totalPage = dbLanTokUsr.totalPage;
    if (value === 'next') {
      if (totalPage === currentPageNo) {
        setIsLoading(false);
        return;
      } else {
        const nextPage = currentPageNo + 1;
        setdbLanTokUsr({...dbLanTokUsr, pageNo: nextPage});
        const fromDate = '';
        const toDate = '';
        const response = await farmerFarmaccountsListAPI(
          dbname,
          lan_id,
          token,
          user_id,
          nextPage,
          fromDate,
          toDate,
        );
        if (response?.status == 200) {
          setFarmAccount(response.data.data.rows);
          setFarmAccountRaw(response.data.data.rows);
          setItem('farm_account', response.data.data.rows);
          setIsLoading(false);
        }
      }
    }
    if (value === 'previous') {
      if (currentPageNo === 1) {
        setIsLoading(false);
        return;
      } else {
        const fromDate = '';
        const toDate = '';
        const prePage = currentPageNo - 1;
        setdbLanTokUsr({...dbLanTokUsr, pageNo: prePage});
        const response = await farmerFarmaccountsListAPI(
          dbname,
          lan_id,
          token,
          user_id,
          prePage,
          fromDate,
          toDate,
        );
        if (response?.status == 200) {
          setFarmAccount(response.data.data.rows);
          setFarmAccountRaw(response.data.data.rows);
          setItem('farm_account', response.data.data.rows);
          setIsLoading(false);
        }
      }
    }
    setIsLoading(false);
  };
  const handleDatePicker = item => {
    const effective_date = effective_dates(item);
    setfromDate(effective_date);
    setFromDateFilter(effective_date);
  };
  const handleDatePicker2 = async item => {
    const effective_date = effective_dates(item);
    setToDate(effective_date);
    if (fromDateFilter) {
      const fromDate = fromDateFilter;
      const response = await farmerFarmaccountsListAPI(
        dbname,
        lan_id,
        token,
        user_id,
        0,
        fromDate,
        effective_date,
      );
      if (response?.status == 200) {
        setFarmAccount(response.data.data.rows);
        setFarmAccountRaw(response.data.data.rows);
        setItem('farm_account', response.data.data.rows);
        setIsLoading(false);
      }
    } else {
      // MessageDialog({ title: 'Require', message: 'Please Select First data.' })
      Toast.show({time: 3, text: 'Please Select First data.', ...AlertMesg[0]});
    }
  };
  const filterDataRemove = async () => {
    setFilterItem('');
    setFilterOption(false);
    setToDate('');
    setfromDate('');
    const response = await farmerFarmaccountsListAPI(
      dbname,
      lan_id,
      token,
      user_id,
      '0',
      '',
      '',
    );
    if (response?.status == 200) {
      setFarmAccount(response.data.data.rows);
      setFarmAccountRaw(response.data.data.rows);
      setItem('farm_account', response.data.data.rows);
      setIsLoading(false);
    }
  };

  const navigateToPages = async (pageName, index) => {
    setItem('farm_in_ex_id', farmAccount[index]);
    navigation.navigate(pageName);
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  const renderCustomHeader = useMemo(
    () => <CustomHeader t={t} filterOptionShow={filterOptionShow} />,
    [filterOptionShow],
  );
  const HandlerGoBack = () => navigation.navigate('FarmerDashboard');
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        <View style={styles.mainContainer}>
          {/* <CustomHeader
            path="FarmerDashboard"
            HandlerGoBack={HandlerGoBack}
            logoImage={logoImage}
            topBanner={topBanner}
          /> */}
          {renderCustomHeader}
          {/* <FormsTitle title={t('income_expense_list')} /> */}
          {/* <View style={{marginVertical: 10}}>
            <DatePickerComp
              openDate={openFromDate}
              newDate={newFromDate}
              setOpenDate={setOpenFromDate}
              handleDatePicker={handleDatePicker}
            />
            <DatePickerComp
              openDate={openToDate}
              newDate={newToDate}
              setOpenDate={setOpenToDate}
              handleDatePicker={handleDatePicker2}
              minimumDate={
                fromDate == ''
                  ? ''
                  : new Date(
                      `${new Date(fromDate).getFullYear()}-${
                        new Date(fromDate).getMonth() + 1
                      }-${new Date(fromDate).getDate() + 1}`,
                    )
              }
            />
            <FarmerFilter
              filterItem={filterItem}
              filterOption={filterOption}
              setOpenToDate={setOpenToDate}
              fromDate={fromDate}
              newToDate={toDate}
              setOpenFromDate={setOpenFromDate}
              filterOptionShow={filterOptionShow}
              onchangeFilterItem={onchangeFilterItem}
              onChangeText={item => handleFilter(item)}
              FarmerProductNameValue={searchFarmerName}
              FarmerProductPhoneValue={searchFarmerPhone}
              //   title={t('Filter')}
              filterDataRemove={filterDataRemove}
            />
          </View> */}
          {isLoading ? (
            <LoadingScreen />
          ) : (
            <>
              <FlatList
                data={farmAccount}
                renderItem={({item, index}) => (
                  <TouchableOpacity
                    style={styles.wrapper}
                    key={index}
                    onPress={() =>
                      navigateToPages('FarmerFarmIncomeExpenseView', index)
                    }>
                    <View style={styles.cardHeader}>
                      <View style={styles.marqueeContainer}>
                        <Text style={styles.cardTitle}>
                          {t('addcrop_plot')} :{'  '}
                          <Text
                            style={styles.cardTitleRe}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {item.land_info && item.land_info.plot_no}
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
                      <Text style={styles.label}>{t('showing_date')} : </Text>
                      <Text
                        style={styles.value}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {formatDateToDateName(item.sowing_date)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>
                        {t('total_income_sum') + '(' + currency + ')'} :
                      </Text>
                      <Text style={styles.value}>
                        {<ShowIncome income={item.income_expense} />}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>
                        {t('knowyourplot_cropinfo_cropname')} :
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
                        {t('harvesting_date_auto_calculated')} :
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
                        {t('total_exp_sum') + '(' + currency + ')'} :
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
              <View
                style={{
                  backgroundColor: '#003c04',
                  justifyContent: 'space-between', // This will distribute space evenly
                  alignItems: 'center',
                  flexDirection: 'row',
                  height: '8%',
                  paddingHorizontal: 16,
                  borderTopLeftRadius: 30,
                  borderTopRightRadius: 30,
                }}>
                <TouchableOpacity
                  onPress={() => handlePage('previous')}
                  style={{
                    flex: 1,
                    alignItems: 'flex-start',
                  }}>
                  <View style={{}}>
                    <MaterialIcons
                      name="chevron-left"
                      size={25}
                      color="white"
                    />
                    <Text style={styles.titleBottomPre}>{t('Pre')}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('FarmerAddExpense')}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingRight: 20,
                  }}>
                  <View style={{width: '110%', alignItems: 'center'}}>
                    <MaterialIcons
                      name="add-circle-outline"
                      size={25}
                      color="white"
                    />
                    <Text style={styles.titleBottomMid1}>
                      {t('add_expense')}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('FarmerAddIncome')}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingLeft: 20,
                  }}>
                  <View style={{alignItems: 'center', width: '110%'}}>
                    <MaterialIcons
                      name="currency-rupee"
                      size={24}
                      color="white"
                    />
                    <Text style={styles.titleBottomMid2}>
                      {t('add_income')}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handlePage('next')}
                  style={{flex: 1, alignItems: 'flex-end'}}>
                  <View style={{alignItems: 'center'}}>
                    <MaterialIcons
                      name="chevron-right"
                      size={25}
                      color="white"
                    />
                    <Text style={styles.titleBottomNet}>{t('Next')}</Text>
                  </View>
                </TouchableOpacity>
                {/* </View> */}
              </View>
            </>
          )}
        </View>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerFarmIncomeExpenseList;

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
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
    marginLeft: 5,
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
    marginLeft: 10,
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
});
