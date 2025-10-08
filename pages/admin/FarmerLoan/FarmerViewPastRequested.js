import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import Filter from '../../Common/FarmerFilter';
import {useNavigation, useRoute} from '@react-navigation/native';
import LoadingScreen from '../../Common/LoadingScreen';
import {loanRouteListAPI} from './FarmerLoanAPI';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants';
import {Marquee} from '@animatereactnative/marquee';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ListCard from '../../Components/ListCard';

const FarmerLoanViewPastRequested = ({setActiveBtn}) => {
  //GQR-67
  const {
    loginUser_data,
    DatePickerComp,
    t,
    getItem,
    effective_dates,
    CustomHeader,
    logoImage,
    topBanner,
    navigationBarHeight,
    Root,
    Toast,
    AlertMesg,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id, owner} = loginUser_data;
  //GQR-67
  const [currency, setcurrency] = useState('');
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [filterOption, setFilterOption] = useState(false);
  const [filterItem, setFilterItem] = useState('');
  const [filterName, setFilterName] = useState('');
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [newToDate, setnewToDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  // const [fromDate, setfromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loanList, setLoanList] = useState([]);
  const [loanListRaw, setLoanListRaw] = useState([]);
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  const [statusName, setStatusName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [farmerID, setfarmerID] = useState();
  const [fromDate, setFromDate] = useState('');
  const route = useRoute();

  const [statusAll, setTtatusAll] = useState([
    {value: 2, label: t('Approved')},
    {value: 1, label: t('pending')},
    {value: 3, label: t('Rejected')},
  ]);
  // const filterOptionShow = () => {
  //   if (!filterOption) {
  //     setFilterOption(true);
  //   } else {
  //     setFilterOption(false);
  //   }
  // };
  const onchangeFilterItem = value => {
    if (value == 'statusFilter') {
      setSearchResultsList(true);
      setSearchResults(statusAll);
    }
    setFilterName(value);
    setFilterItem(value);
    setFilterOption(false);
  };

  const filterOptionShow = async () => {
    Alert.alert('done');
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

  const handleDatePicker = item => {
    const effective_date = effective_dates(item);
    setfromDate(effective_date);
    setToDate('');
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

  const handleDatePicker2 = async item => {
    const effective_date = effective_dates(item);
    setToDate(effective_date);
    const response = await loanRouteListAPI(
      dbname,
      lan_id,
      token,
      user_id,
      fromDate,
      effective_date,
      '',
    );
    if (response) {
      setIsLoading(false);
      setLoanList(response?.data?.data?.rows);
      setLoanListRaw(response?.data?.data?.rows);
    }
  };
  const onPageLoad = async (fromDate = '', toDate = '') => {
    setIsLoading(true);
    const curr = await await getItem('currency');
    setcurrency(curr);
    const response = await loanRouteListAPI(
      dbname,
      lan_id,
      token,
      user_id,
      '',
      '',
      '',
    );
    if (response?.status == 200) {
      setLoanList(response?.data?.data?.rows);
      setLoanListRaw(response?.data?.data?.rows);
    }
    setIsLoading(false);
  };
  const filterfromAndToDate = () => {
    if (fromDate != '' && toDate != '') {
      let tempData = loanList.filter(item => {
        return (
          item.created_at.slice(0, 10) >= fromDate &&
          item.created_at.slice(0, 10) <= toDate
        );
      });
      setLoanList(tempData);
    }
  };
  useEffect(() => {
    filterfromAndToDate();
  }, [fromDate, toDate]);
  useEffect(() => {
    onPageLoad();
  }, []);
  useEffect(() => {
    if (route?.params?.action === 'addData') {
      Toast.show({text: t('Data_submitted_successfully'), ...AlertMesg[0]});

      onPageLoad();
    }
  }, [route?.params]);
  const filterDataRemove = async () => {
    setFilterItem('');
    setFilterOption(false);
    setToDate('');
    setfromDate('');
    const response = await loanRouteListAPI(
      dbname,
      lan_id,
      token,
      user_id,
      '',
      '',
      '',
    );
    if (response?.status == 200) {
      setIsLoading(false);
      setLoanList(response?.data?.data?.rows);
      setLoanListRaw(response?.data?.data?.rows);
    }
  };
  const navigate = (FarmerLoanEnquiryDetail, item) => {
    navigation.navigate('FarmerLoanEnquiryDetail', item);
  };
  const handleFilter = async search => {
    if (filterName === 'statusFilter') {
      setSearchResultsList(true);
      setStatusName(search);
      const result = statusAll.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase()),
      );
      if (search == '') {
        setSearchResultsList(false);
        setLoanList(loanListRaw);
      } else {
        setSearchResultsList(true);
      }
      if (result) {
        setSearchResults(result);
      }
    }
  };
  const handleResultSelect = async (name, currentfarmerId, phone) => {
    setSearchResultsList(false);
    setSearchFarmerPhone(phone);
    setSelectedName(name);
    setSearchFarmerName(name);
    setStatusName(name);
    setSearchResults([]);
    setfarmerID(currentfarmerId);
    if (name == 'Pending' || name == 'Rejected' || name == 'Approved') {
      let tempData = loanListRaw.filter(item => {
        return item.status == currentfarmerId;
      });
      setLoanList(tempData);
    }
  };
  const HandlerGoBack = () => navigation.navigate('FarmerDashboard');
  const renderCustomHeader = useMemo(
    () => <CustomHeader t={t} filterOptionShow={filterOptionShow} />,
    [filterOptionShow],
  );
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
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        {renderCustomHeader}
        <View style={styles.mainContainer}>
          {/* <View style={styles.main}> */}
          {/* <View style={{}}>
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
        </View>
        {searchResultsList && searchResultsList ? (
          <View style={styles.flatContainer}>
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
        )} */}
          {/* <TouchableOpacity
          style={styles.plusIcon}
          onPress={() => setActiveBtn(1)}>
          <Image
            source={require('../../Common/images/plus.png')}
            style={{width: 50, height: 50}}
          />
        </TouchableOpacity> */}
          {/* {isLoading ? (
          ''
        ) : (
          <View style={{marginVertical: 10}}>
            <Filter
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
              statusNameValue={statusName}
              onlyDate={true}
              filterDataRemove={filterDataRemove}
              statusFilter={true}
            />
          </View>
        )} */}

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
            style={filterName !== '' ? {marginBottom: 40} : {marginBottom: 40}}
            renderItem={({item, index}) => {
              var date = new Date(item.created_at.split('T')[0]);
              var sanctioned_date = new Date(item.sanctioned_date);
              const cardItems = [
                {
                  label: t('sta_'),
                  value: getStatusText(item.status),
                  valueStyle: getStatusStyle(item.status),
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
                        value: item.loan_ord_id,
                      },
                    ]
                  : []),
              ];

              return (
                <ListCard
                  onPress={() => navigate('FarmerLoanEnquiryDetail', item)}
                  title={`${t('loan_amt')} (${currency}): ${item.loan_amount}`}
                  titleStyle={styles.redTitle}
                  items={cardItems}
                  index={index}
                  borderColor={Colors.borderGreen}
                />
              );
            }}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
        {/* </View> */}
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};
export default FarmerLoanViewPastRequested;

const styles = StyleSheet.create({
  mainContainer: {backgroundColor: Colors.pageBackground, flex: 1},
  main: {
    flex: 1,
    backgroundColor: Colors.containerGreen,
    marginHorizontal: '3%',
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  container: {
    flex: 1,
  },
  flatListContainer: {
    marginHorizontal: '2%',
    // marginBottom: 5,
  },
  flatListItem: {
    backgroundColor: 'white',

    marginVertical: 8,
    borderRadius: 20,
    borderLeftWidth: 5,
    borderLeftColor: Colors.borderGreen,
    // flexDirection: 'row',
    // alignItems: 'center',
    // marginBottom: 8,
    paddingHorizontal: 15,
    marginHorizontal: '2.5%',
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
  marqueeContainer: {
    flex: 1,
    // marginLeft: 10,
    marginRight: 10,
    overflow: 'hidden',
    marginTop: 10,
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
    // marginLeft: 5,
    color: '#D10000',
    fontFamily: 'Poppins-Regular',
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
  titlePen: {
    fontSize: 13,
    color: '#a66607ff',
    marginLeft: 5,
    fontFamily: 'Poppins-SemiBold',
    paddingBottom: 5,
  },
  titleApp: {
    fontSize: 13,
    color: '#236432ff',
    marginLeft: 5,
    fontFamily: 'Poppins-SemiBold',
    paddingBottom: 5,
  },
  titleRej: {
    fontSize: 13,
    color: '#b83535ff',
    marginLeft: 5,
    fontFamily: 'Poppins-SemiBold',
    paddingBottom: 5,
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
    flex: 1,
  },
  value: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    flex: 1,
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
  redTitle: {
    color: '#D10000', // Red color for loan amount
    fontFamily: 'Poppins-SemiBold',
  },
});
