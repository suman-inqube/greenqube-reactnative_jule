import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Keyboard,
  RefreshControl,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {loanRouteListAPI} from './LoanAPI_copy';
import {userCreateContext} from '../../Context/usersCreateContext';
import {Colors, Fonts} from '../../utils/Constants';
import {Marquee} from '@animatereactnative/marquee';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import ListCard from '../../Components/ListCard';
import {ROUTES} from '../../utils/Routes';
import {axiosDelete, axiosGet, axiosPut, axiosPost} from '../../utils/api';

const LoanViewPastRequested = ({setActiveBtn}) => {
  //GQR-67
  const {
    loginUser_data,
    LoadingScreen,
    t,
    Toast,
    AlertMesg,
    getItem,
    Root,
    effective_dates,
    DatePickerComp,
    Filter,
    handleFilter,
    farmerData,
    CustomHeader,
    logoImage,
    topBanner,
    navigationBarHeight,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-67
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [filterOption, setFilterOption] = useState(false);
  const [filterItem, setFilterItem] = useState('');
  const [filterName, setFilterName] = useState('');
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [newToDate, setnewToDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loanList, setLoanList] = useState([]);
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  const [statusName, setStatusName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [farmerID, setfarmerID] = useState();
  const [currency, setCurrencyt] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute();

  const [statusAll, setTtatusAll] = useState([
    {value: 2, label: t('Approved')},
    {value: 1, label: t('pending')},
    {value: 3, label: t('Rejected')},
  ]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const onchangeFilterItem = value => {
    if (value == 'statusFilter') {
      setSearchResultsList(true);
      setSearchResults(statusAll);
    }
    setFilterOption(false);
    setFilterName(value);
    setFilterItem(value);
    setSearchFarmerPhone('');
    setSearchFarmerName('');
    setStatusName('');
    setFromDate('');
    setToDate('');
    setLoanList(loanListRaw);
  };
  const handleDatePicker = item => {
    const effective_date = effective_dates(item);
    setFromDate(effective_date);
  };
  const handleDatePicker2 = item => {
    const effective_date = effective_dates(item);
    setToDate(effective_date);
  };
  const onPageLoad = async (
    farmer_id = '',
    from_date = '',
    to_date = '',
    farmer_mobile = '',
  ) => {
    setIsLoading(true);
    const [currency_res, response] = await Promise.all([
      getItem('currency'),

      axiosGet(
        ROUTES.GET.LOAN_LIST({
          farmer_id: farmer_id,
          from_date: from_date,
          to_date: to_date,
          farmer_mobile: farmer_mobile,
        }),
        token,
        {information: `${dbname},${lan_id}`},
      ),
      // loanRouteListAPI(
      //   dbname,
      //   lan_id,
      //   token,
      //   user_id,
      //   farmer_id,
      //   from_date,
      //   to_date,
      //   farmer_mobile,
      // ),
    ]);
    if (response?.status == 200) {
      if (response?.data?.data?.rows?.length != 0) {
        Promise.all([
          setIsLoading(false),
          setLoanList(response?.data?.data?.rows),
          setCurrencyt(currency_res),
        ]);
      } else {
        setIsLoading(false);
        Toast.show({time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0]});
      }
    }
  };
  useEffect(() => {
    // filterfromAndToDate();
  }, [fromDate, toDate]);
  useEffect(() => {
    onPageLoad('', '', '', '');
  }, []);
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
      height: 200,
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
        onPageLoad(farmerName?.value, fromDate, toDate, farmerPhone?.label);
      } catch (error) {}
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
      onPageLoad();
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (route?.params?.action === 'addData') {
      Toast.show({text: t('Data_submitted_successfully'), ...AlertMesg[0]});

      onPageLoad();
    }
  }, [route?.params]);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await onPageLoad();
    setRefreshing(false);
  }, []);
  const navigate = (LoanEnquiryDetail, item) => {
    navigation.navigate('LoanEnquiryDetail', item);
  };
  const HandlerGoBack = () => navigation.navigate('Dashboard');
  const renderCustomHeader = useMemo(
    () => (
      <CustomHeader
        path="Dashboard"
        HandlerGoBack={HandlerGoBack}
        logoImage={logoImage}
        topBanner={topBanner}
        filterOptionShow={filterOptionShow}
        t={t}
      />
    ),
    [filterOptionShow],
  );

  const getStatusStyle = status => {
    switch (status) {
      case 1:
        return styles.pending;
      case 2:
        return styles.approved;
      case 3:
        return styles.rejected;
      default:
        return {};
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 1:
        return t('pending');
      case 2:
        return t('Approved');
      case 3:
        return t('Rejected');
      default:
        return '';
    }
  };

  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        {renderCustomHeader}
        <SafeAreaView
          style={{flex: 1, backgroundColor: Colors.background_light}}>
          <View style={{}}>
            {openFromDate && (
              <DatePickerComp
                openDate={openFromDate}
                newDate={newFromDate}
                setOpenDate={setOpenFromDate}
                handleDatePicker={handleDatePicker}
              />
            )}
            {openToDate && (
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
            )}
          </View>
          {searchResultsList && searchResultsList ? (
            <View
              style={
                isKeyboardVisible
                  ? styles.flatContainerLengthUp
                  : styles.flatContainer
              }>
              <FlatList
                showsVerticalScrollIndicator={false}
                style={searchResults.length > 8 ? styles.flatlistHeight : ''}
                data={searchResults}
                renderItem={({item}) => (
                  <TouchableOpacity
                    onPress={() =>
                      handleResultSelect(item.label, item.value, item.phone)
                    }
                    style={styles.flatlistitem}>
                    <Text style={styles.flatlisttitle}>
                      {filterName == 'PhoneNumber' ? item.phone : item.label}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index}
              />
            </View>
          ) : (
            ''
          )}
          <View>
            {isLoading ? (
              <View style={styles.loadingScreen}>
                <LoadingScreen />
              </View>
            ) : (
              ''
            )}
            <FlatList
              showsVerticalScrollIndicator={false}
              data={loanList}
              renderItem={({item, index}) => {
                var date = new Date(item.created_at.split('T')[0]);
                var sanctioned_date = new Date(item.sanctioned_date);

                const cardItems = [
                  {
                    label: t('loan_amt') + `(${currency})`,
                    value: item.loan_amount,
                    valueStyle: styles.titleLone,
                  },
                  {
                    label: t('sta_'),
                    value: getStatusText(item.status),
                    valueStyle: [styles.value, getStatusStyle(item.status)],
                  },
                  ...(item?.loan_sanctioned
                    ? [
                        {
                          label: t('LoanSanctioned') + `(${currency})`,
                          value: item.loan_sanctioned,
                        },
                      ]
                    : []),
                  {
                    label: t('number_caps'),
                    value: item.agri_user.contactNumber,
                  },
                  {
                    label: t('date'),
                    value: date.toString().substring(4, 15),
                  },
                  ...(item?.sanctioned_date
                    ? [
                        {
                          label: t('SanctionedDate'),
                          value: sanctioned_date.toString().substring(3, 15),
                        },
                      ]
                    : []),
                  ...(item?.loan_ord_id
                    ? [
                        {
                          label: t('LoanOrderID'),
                          value: item.loan_ord_id.substring(-1, 9),
                        },
                      ]
                    : []),
                ];

                return (
                  <ListCard
                    onPress={() => navigate('LoanEnquiryDetail', item)}
                    title={`${t('name')}: ${item.agri_user.userName}`}
                    items={cardItems}
                    index={index}
                    borderColor={Colors.borderGreen}
                  />
                );
              }}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[Colors.green]}
                  tintColor={Colors.green}
                />
              }
            />
          </View>
        </SafeAreaView>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};
export default LoanViewPastRequested;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.containerGreen,
    marginHorizontal: '3%',
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  container: {
    flex: 1,
  },
  flatListContainer: {
    marginHorizontal: '2%',
  },
  plusIcon: {
    width: 40,
    height: 40,
    position: 'absolute',
    top: 500,
    right: 20,
    zIndex: 999,
    elevation: 5,
  },
  flatContainer: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    bottom: '100%',
    left: 0,
    marginHorizontal: '2.5%',
    width: '95%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },
  flatlisttitle: {
    padding: 10,
    color: '#000',
  },
  flatlistHeight: {
    height: Dimensions.get('window').height / 2.5,
  },
  loadingScreen: {
    position: 'relative',
    top: 100,
  },
  titleLone: {
    fontSize: 13,
    color: '#D10000',
    fontFamily: 'Poppins-SemiBold',
  },
  value: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    textAlign: 'right',
  },
  pending: {
    color: '#a66607ff',
    fontFamily: 'Poppins-SemiBold',
  },
  approved: {
    color: '#236432ff',
    fontFamily: 'Poppins-SemiBold',
  },
  rejected: {
    color: '#b83535ff',
    fontFamily: 'Poppins-SemiBold',
  },
  flatContainerLengthUp: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    top: '15%',
    left: 0,
    marginHorizontal: '5%',
    width: '90%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },
});
