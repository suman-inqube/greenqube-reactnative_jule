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
import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { loanRouteListAPI } from './LoanAPI_copy';
import { userCreateContext } from '../../Context/usersCreateContext';
import { Colors, Fonts } from '../../utils/Constants';
import { Marquee } from '@animatereactnative/marquee';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
const LoanViewPastRequested = ({ setActiveBtn }) => {
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
    topBanner, navigationBarHeight
  } = useContext(userCreateContext);
  const { dbname, lan_id, token, user_id } = loginUser_data;
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

  const [statusAll, setTtatusAll] = useState([
    { value: 2, label: t('Approved') },
    { value: 1, label: t('pending') },
    { value: 3, label: t('Rejected') },
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
  const onPageLoad = async (farmer_id = '', from_date = '', to_date = '', farmer_mobile = '') => {
    setIsLoading(true);
    const [currency_res, response] = await Promise.all([
      getItem('currency'),
      loanRouteListAPI(dbname, lan_id, token, user_id, farmer_id, from_date, to_date, farmer_mobile),
    ]);
    if (response?.status == 200) {
      if (response.data.data.rows.length != 0) {
        Promise.all([
          setIsLoading(false),
          setLoanList(response.data.data.rows),
          setCurrencyt(currency_res),
        ]);
      } else {
        setIsLoading(false);
        Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] });
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
    const { openFilterSheet } = await import('../../Components/FilterSheet');
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
  }, [filterItem, searchFarmerName, searchFarmerPhone, fromDate, toDate])
  const handleFilterResult = useCallback(
    ({ filter, fromDate, toDate, farmerName, farmerPhone, sheetCarbonType }) => {
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
        onPageLoad(farmerName?.value, fromDate, toDate, farmerPhone?.label)
      } catch (error) {

      }
    },
    [filterItem, fromDate, toDate, searchFarmerName, searchFarmerPhone],
  );
  const handleFilterRemove = () => {
    try {
      setFromDate('');
      setToDate('');
      setSearchFarmerName({ label: '', value: '' });
      setSearchFarmerPhone({ label: '', value: '' });
      setFilterItem('');
      onPageLoad();
    } catch (error) {
      console.log(error);
    }
  };
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    requestAnimationFrame(async () => {
      // await onPageLoad("refreshing");
      await onPageLoad();
      setRefreshing(false);
    });
  }, []);
  const navigate = (LoanEnquiryDetail, item) => {
    navigation.navigate('LoanEnquiryDetail', item);
  };
  const HandlerGoBack = () => navigation.navigate('Dashboard');
  const renderCustomHeader = useMemo(() => <CustomHeader
    path="Dashboard"
    HandlerGoBack={HandlerGoBack}
    logoImage={logoImage}
    topBanner={topBanner}
    filterOptionShow={filterOptionShow}
    t={t}
  />, [filterOptionShow]);
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        {renderCustomHeader}
        <SafeAreaView
          style={{ flex: 1, backgroundColor: Colors.background_light }}>
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
                      `${new Date(fromDate).getFullYear()}-${new Date(fromDate).getMonth() + 1
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
                renderItem={({ item }) => (
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
              // style={
              //   filterName !== '' ? { marginBottom: 130 } : { marginBottom: 40 }
              // }
              renderItem={({ item }) => {
                // var date = new Date(item.agri_user.CreateDateTime.split("T")[0]);
                var date = new Date(item.created_at.split('T')[0]);
                var sanctioned_date = new Date(item.sanctioned_date);
                return (
                  <TouchableOpacity
                    style={styles.flatListContainer}
                    onPress={() => navigate('LoanEnquiryDetail', item)}>
                    <View style={styles.flatListItem}>
                      <View style={styles.cardHeader}>
                        <View style={styles.marqueeContainer}>
                          <Text style={styles.cardTitle}>
                            {t('name')}:{' '}
                            <Text style={styles.cardTitleRe}>
                              {item.agri_user.userName}
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
                        <Text style={styles.label}>
                          {t('loan_amt') + `(${currency})`}:
                        </Text>
                        <Text style={styles.titleLone}>{item.loan_amount}</Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.label}>{t('sta_')}:</Text>
                        <Text
                          style={[
                            styles.value,
                            item.status == 1 && styles.pending,
                            item.status == 2 && styles.approved,
                            item.status == 3 && styles.rejected,
                          ]}>
                          {item.status == 1 && t('pending')}
                          {item.status == 2 && t('Approved')}
                          {item.status == 3 && t('Rejected')}
                        </Text>
                      </View>

                      {item?.loan_sanctioned && (
                        <View style={styles.detailRow}>
                          <Text style={styles.label}>
                            {t('LoanSanctioned') + `(${currency})`}:
                          </Text>
                          <Text style={styles.value}>
                            {item.loan_sanctioned}
                          </Text>
                        </View>
                      )}

                      <View style={styles.detailRow}>
                        <Text style={styles.label}>{t('number_caps')}:</Text>
                        <Text style={styles.value}>
                          {item.agri_user.contactNumber}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>{t('date')}: </Text>
                        <Text style={styles.value}>
                          {date.toString().substring(4, 15)}
                        </Text>
                      </View>

                      {item?.sanctioned_date && (
                        <View style={styles.detailRow}>
                          <Text style={styles.label}>
                            {t('SanctionedDate')}:
                          </Text>
                          <Text style={styles.value}>
                            {sanctioned_date.toString().substring(3, 15)}
                          </Text>
                        </View>
                      )}
                      {item?.loan_ord_id && (
                        <View style={styles.detailRow}>
                          <Text style={styles.label}>{t('LoanOrderID')}: </Text>
                          <Text style={styles.value}>
                            {item.loan_ord_id.substring(-1, 9)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index}
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
    shadowOffset: { width: 0, height: 4 },
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
    color: Colors.borderGreen,
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
  titleLone: {
    fontSize: 13,
    color: '#D10000',
    marginLeft: 5,
    fontFamily: 'Poppins-SemiBold',
    paddingBottom: 5,
  }, //D10000
  titleRe: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 5,
    fontFamily: 'Poppins-Regular',
    paddingBottom: 5,
  },
  titlePen: {
    fontSize: 14,
    color: '#a66607ff',
    marginLeft: 5,
    fontFamily: 'Poppins-SemiBold',
    paddingBottom: 5,
  },
  titleApp: {
    fontSize: 14,
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

  ////////////////////////////////////////////////////////////
  //   container: {
  //     marginBottom: 600,
  //   },
  //   flatListContainer: {
  //     marginHorizontal: '2%',
  //     flexDirection: 'row',
  //     backgroundColor: '#FFF',
  //     padding: 6,
  //     marginBottom: 10,
  //     borderRadius: 10,
  //     elevation: 5,
  //   },
  //   flatListItem: {
  //     width: '50%',
  //   },
  //   plusIcon: {
  //     width: 50,
  //     height: 50,
  //     position: 'absolute',
  //     top: '70%',
  //     // buttom: 200,
  //     right: 20,
  //     zIndex: 999,
  //   },
  //   flatContainer: {
  //     backgroundColor: '#ffffff',
  //     position: 'absolute',
  //     zIndex: 999,
  //     // bottom: '100%',
  //     top: '10%',
  //     left: 0,
  //     marginHorizontal: '5%',
  //     width: '90%',
  //     elevation: 10,
  //     borderRadius: 10,
  //     padding: 10,
  //   },
  flatContainerLengthUp: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    // bottom: '100%',
    top: '15%',
    left: 0,
    marginHorizontal: '5%',
    width: '90%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },
  //   flatlisttitle: {
  //     padding: 10,
  //     color: '#000',
  //     fontFamily: 'Poppins-Regular',
  //     fontSize: 13,
  //   },
  //   flatlistHeight: {
  //     height: Dimensions.get('window').height / 2.5,
  //   },
  //   loadingScreen: {
  //     position: 'relative',
  //     top: 100,
  //   },
  //   title: {
  //     color: '#000',
  //     marginVertical: 2,
  //     fontFamily: 'Poppins-Regular',
  //     fontSize: 14,
  //   },
});
