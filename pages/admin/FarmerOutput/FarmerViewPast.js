import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import Filter from '../../Common/FarmerFilter';
import ViewModalPast from './FarmerViewModalPast';
import React, {
  useState,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {
  FarmeroutputListAPI,
  outputEnquiryViewAPI,
} from '../../../config/apiHere';
import {formatDateToMMDDYYYY} from '../../Common/DateChanger';
import MessageDialog from '../../Common/MessageDialog';
import {userCreateContext} from '../../Context/usersCreateContext';
import {Colors, Fonts} from '../../utils/Constants';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import SkeletonProblemCard from '../../Components/Skeleton/SkeletonProblemCard';
import {getActionsPostNewOutputFarmer} from '../../utils/options';
import AnimatedCard from '../../Components/AnimatedCard';
import {FloatingAction} from 'react-native-floating-action';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FloatingActionButton from '../../Components/FloatingActionButton';
const FarmerViewPast = ({navigation}) => {
  //GQR-67
  const {
    CustomHeader,
    loginUser_data,
    LoadingScreen,
    DatePickerComp,
    t,
    getItem,
    setItem,
    effective_dates,
    Root,
    Popup,
    Toast,
    navigationBarHeight,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-67
  const route = useRoute();
  const [farmerData, setFarmerData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [filterOption, setFilterOption] = useState(false);
  const [filterItem, setFilterItem] = useState('');
  const [filterName, setFilterName] = useState('');
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [newToDate, setnewToDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [toDate, setToDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [result, setresult] = useState({
    qty: '',
    total: '',
  });
  const [outputListAll, setOutputListAll] = useState([]);
  const [outputSingle, setOutputSingle] = useState();
  const [pastEnquiryView, setPastEnquiryView] = useState([]);

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
  const handleDatePicker = item => {
    const effective_date = effective_dates(item);
    setfromDate(effective_date);
    setFromDateFilter(effective_date);
    setToDate('');
  };
  const handleDatePicker2 = async item => {
    const effective_date = effective_dates(item);
    setToDate(effective_date);
    if (fromDateFilter) {
      const outputList = await FarmeroutputListAPI(
        dbname,
        lan_id,
        token,
        user_id,
        fromDateFilter,
        effective_date,
      );
      if (outputList?.status == 200) {
        setOutputListAll(outputList?.data?.data?.rows);
        setItem('output_data', outputList?.data?.data?.rows);
      }
    } else {
      ///basudev
      // MessageDialog({ title: 'Require', message: 'Please Select First data.' })
      Toast.show({time: 3, text: 'Please Select First data.', ...AlertMesg[0]});
    }
  };
  const navigateToPages = async (fid, dbname, lan_id, token, user_id) => {
    // setIsLoading(true)
    const output_data = await getItem('output_data');
    const outputFound = output_data.find(user => user.fid === fid);
    await setItem('output_single_data', outputFound);
    setOutputSingle(outputFound);
    const response = await outputEnquiryViewAPI(
      dbname,
      lan_id,
      token,
      user_id,
      fid,
    );
    if (response?.status == 200) {
      setPastEnquiryView(response?.data?.data);
      var qty = 0;
      var total = 0;
      response?.data?.data.map((data, index) => {
        qty = qty + parseFloat(data.pro_qty);
        total = total + parseFloat(data.grand_total);
      });
      setresult({...result, qty: qty, total: total});
    }
    setModalVisible(true);
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
        height: 210,
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
  // const handleFilter = async search => {
  //   if (filterName === 'Farmer/Product Name') {
  //     setSearchFarmerPhone('');
  //     setSearchFarmerName(search);
  //     const result = farmerData.filter(item =>
  //       item.label.toLowerCase().includes(search.toLowerCase()),
  //     );
  //     if (search == '') {
  //       setSearchResultsList(false);
  //       setOutputListAll(outputListAllRaw);
  //     } else {
  //       let tempData = outputListAll.filter(item => {
  //         return (
  //           item.users.userName.toLowerCase().indexOf(search.toLowerCase()) > -1
  //         );
  //       });
  //       setOutputListAll(tempData);
  //       setSearchResultsList(true);
  //     }
  //     if (result) {
  //       setSearchResults(result);
  //     }
  //   } else if (filterName === 'PhoneNumber') {
  //     setSearchFarmerName('');
  //     setSearchFarmerPhone(search);
  //     const result = farmerData.filter(item =>
  //       item.phone.toLowerCase().includes(search.toLowerCase()),
  //     );
  //     if (search == '') {
  //       setSearchResultsList(false);
  //       setOutputListAll(outputListAllRaw);
  //     } else {
  //       let tempData = outputListAll.filter(item => {
  //         return (
  //           item.users.contactNumber
  //             .toLowerCase()
  //             .indexOf(search.toLowerCase()) > -1
  //         );
  //       });
  //       setOutputListAll(tempData);
  //       // setData(tempData);
  //       setSearchResultsList(true);
  //     }
  //     if (result) {
  //       setSearchResults(result);
  //     }
  //   }
  // };
  const onPageLoad = async (fromDate = '', toDate = '') => {
    const outputList = await FarmeroutputListAPI(
      dbname,
      lan_id,
      token,
      user_id,
      fromDate,
      toDate,
    );
    if (outputList?.status == 200) {
      setOutputListAll(outputList?.data?.data?.rows);
      setItem('output_data', outputList?.data?.data?.rows);
    }
    setIsLoading(false);
  };
  const filterDataRemove = async () => {
    setFilterItem('');
    setFilterOption(false);
    setToDate('');
    setfromDate('');
    const outputList = await FarmeroutputListAPI(
      dbname,
      lan_id,
      token,
      user_id,
      '',
      '',
    );
    if (outputList?.status == 200) {
      setOutputListAll(outputList?.data?.data?.rows);
      setItem('output_data', outputList?.data?.data?.rows);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    requestAnimationFrame(async () => {
      // await handleProblem(page);
      setRefreshing(false);
    });
  }, []);
  const renderCustomHeader = useMemo(
    () => <CustomHeader t={t} filterOptionShow={filterOptionShow} />,
    [filterOptionShow],
  );
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: Colors.background_light,
            // marginBottom: 10,
          }}>
          {renderCustomHeader}
          <View style={{flex: 1}}>
            {modalVisible && (
              <ViewModalPast
                setModalVisible={setModalVisible}
                modalVisible={modalVisible}
                outputSingle={outputSingle}
                pastEnquiryView={pastEnquiryView}
                qty={result}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                }}
              />
            )}
            <FlatList
              data={isLoading ? Array.from({length: 5}) : outputListAll}
              renderItem={({item, index}) =>
                isLoading ? (
                  <SkeletonProblemCard Colors={Colors} Fonts={Fonts} />
                ) : (
                  <AnimatedCard
                    item={item}
                    child={
                      <TouchableOpacity
                        style={styles.problemCard}
                        onPress={() =>
                          navigateToPages(
                            item.fid,
                            dbname,
                            lan_id,
                            token,
                            user_id,
                          )
                        }
                        key={index}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.problemTitle} numberOfLines={2}>
                            {t('crop_name')}:{' '}
                            {item.io_crop_name &&
                              item.io_crop_name.name.substring(0, 5)}
                            {item.io_crop_name &&
                            item.io_crop_name.name.length > 6
                              ? '...'
                              : null}
                          </Text>
                        </View>
                        <View style={styles.cardContent}>
                          <View style={styles.infoRow}>
                            {/* <Text style={styles.infoLabel}>{t('name')} : </Text> */}
                            <Text style={styles.infoValue} numberOfLines={1}>
                              {item.users.userName.substring(0, 10)}

                              {item.users.userName.length > 10 ? '...' : null}
                            </Text>
                          </View>

                          {item.io_crop_variety && (
                            <View style={styles.infoRow}>
                              {/* <Text style={styles.infoLabel}>
                                {t('ist_variety')}:{' '}
                              </Text> */}
                              <Text style={styles.infoValue} numberOfLines={1}>
                                {item.io_crop_variety &&
                                  item.io_crop_variety.name.substring(0, 14)}
                                {item.io_crop_variety &&
                                item.io_crop_variety.name.length > 14
                                  ? ''
                                  : null}
                              </Text>
                            </View>
                          )}

                          <View style={styles.infoRow}>
                            {/* <Text style={styles.infoLabel}>{t('date')} :</Text> */}
                            <Text style={styles.infoValue} numberOfLines={1}>
                              {formatDateToMMDDYYYY(item.date)}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    }
                    index={index}
                  />
                )
              }
              keyExtractor={(item, index) => item?.fid || index}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[Colors.green]}
                  tintColor={Colors.green}
                />
              }
              onEndReachedThreshold={0.5}
              contentContainerStyle={styles.listContainer}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              updateCellsBatchingPeriod={20}
              windowSize={5}
            />
          </View>
          {/* )} */}
          <FloatingActionButton
            position="right"
            actions={getActionsPostNewOutputFarmer(t, styles, Colors)}
            color={Colors.useGreen}
            onPressItem={name => {
              navigation.navigate('FarmerPostNew');
              // navigation.navigate('FarmerPostNew', 123);
            }}
            showBackground={true}
            overlayColor="rgba(22, 17, 17, 0.35)"
            distanceToEdge={{vertical: 80, horizontal: 25}}
          />
        </SafeAreaView>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};
export default FarmerViewPast;
const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  // },
  // item: {
  //   backgroundColor: '#f9c2ff',
  //   padding: 20,
  //   marginVertical: 8,
  //   marginHorizontal: 16,
  // },
  // title: {
  //   color: '#000',
  //   fontFamily: 'Poppins-Regular',
  //   fontSize: 14,
  // },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: '2%',
  },
  btn: {
    elevation: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
    width: '47%',
  },
  btnActive: {
    backgroundColor: '#a1dc17',
    elevation: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
    width: '47%',
  },
  btnActiveTitle: {
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
  },
  btnTitle: {
    textAlign: 'center',
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
  },
  prevNextPage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    position: 'relative',
    bottom: 0,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    // paddingBottom: 100, // Space for FAB
  },
  problemCard: {
    backgroundColor: '#ffffff',
    marginVertical: 8,
    borderRadius: 12,
    // elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  cardHeader: {
    // backgroundColor: '#fa9e003b',
    backgroundColor: Colors.useGreen,
    // backgroundColor:Colors.lightGreen,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
  },
  problemTitle: {
    // color: '#f59f0bff',
    color: Colors.background,
    fontSize: 16,
    fontFamily: Fonts.Medium,
  },
  cardContent: {
    padding: 16,
  },
infoRow: {
    // flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoLabel: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.Medium,
    flex: 1,
  },
  infoPageLabel: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.Medium,
  },
  infoValue: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.Medium,
    flex: 2,
    textAlign: 'right',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 16,
    fontFamily: Fonts.Medium,
    color: Colors.text,
    textAlign: 'center',
  },
});
