import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Dimensions,
  Image,
} from 'react-native';
import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import DatePickerComp from '../../Common/DatePickerComp';
import Filter from '../../Common/Filter';
import {
  activityListInstrumentWise,
  farmerByNameAPI,
} from '../../../config/apiHere';
import {useIsFocused, useRoute, useNavigation} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import CollapsibleCard from '../../Common/CollapsibleCard';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors} from '../../utils/Constants';
import PlotStatusSkeletonScreen from '../../Components/Skeleton/PlotStatusSkeleton';
import PaginationNav from '../../Components/PaginationNav';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';

const InstrumentWiseActivityView = () => {
  const navigation = useNavigation();
  //GQR-67
  const {
    dbLanTokUsr,
    setdbLanTokUsr,
    loginUser_data,
    LoadingScreen,
    CustomHeader,
    t,
    AlertMesg,
    onBackPress,
    getItem,
    setItem,
    logoImage,
    topBanner,
    Root,
    Toast,
    DeviceInfo,
    handlePageList,
    handleFilter,
    effective_dates,
    handleResultSelect,
    isOnline,
    farmerData,
    navigationBarHeight,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id, carbonFlag} = loginUser_data;
  const {pageNo} = dbLanTokUsr;
  const route = useRoute();
  const {params} = route;
  //GQR-67
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [activityAll, setactivityAll] = useState([]);
  const [activityAllRow, setactivityAllRow] = useState([]);
  const [filterOption, setFilterOption] = useState(false);
  const [filterItem, setFilterItem] = useState('');
  const [filterName, setFilterName] = useState('');
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [newToDate, setnewToDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  // const [farmerData, setFarmerData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [carbonType, setCarbonType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fatchActivityListAPI = useCallback(
    async (
      dbName,
      languageId,
      token,
      supervisorId,
      pageNo,
      searchItem = '',
      from_date = '',
      to_date = '',
      carbonType = '',
    ) => {
      try {
        setIsLoading(true);
        if (isOnline) {
          var response = await axiosGet(
            ROUTES.GET.ACTIVITY_LIST_INSTRUMENTWISE({
              pageNO: pageNo,
              userID: supervisorId,
              searchItem: searchItem,
              from_date: from_date,
              to_date: to_date,
              // carbonType: carbonType,
            }),
            token,
            {information: `${dbName},${languageId},${supervisorId}`},
          );
          console.log('Pipe', response);
          if (response?.status == 200) {
            await setItem('activityList', response);
          }
        } else {
          var response = await getItem('activityList');
        }
        if (response?.status == 200) {
          if (response.data.data.count != 0) {
            setTotalPages(Math.ceil(response?.data?.data.count / 20));
            setactivityAll(response?.data?.data?.rows);
            await setItem('activity_Data', response?.data?.data?.rows);
            setIsLoading(false);
          } else {
            setIsLoading(false);
            Toast.show({
              time: 3,
              text: `${t('no_data_found')}`,
              ...AlertMesg[0],
            });
          }
        }
      } catch (error) {
        setIsLoading(false);

        console.log(error);
        // CrashlyticsRecordError(error, 'ActivityList', 'fetchActivityListAPI');
      }
    },
    [page],
  );
  useEffect(() => {
    fatchActivityListAPI(dbname, lan_id, token, user_id, page, '', '', '', '');
  }, [page]);

  const renderItem = useCallback(({item}) => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('InstrumentWiseActivityDetails', item)
        }>
        <CollapsibleCard
          width="100%"
          header={
            <View
              style={{
                height: 30,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View
                  style={{
                    backgroundColor: '#e8f5e8',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 4,
                    marginRight: 10,
                  }}>
                  <Text
                    style={[
                      styles.titleHeader,
                      {fontSize: 14, color: '#155724'},
                    ]}>
                    {item?.pipe_name}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: '#ffe3cdff',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    marginRight: 10,
                  }}>
                  <Text
                    style={[
                      styles.titleHeader,
                      {fontSize: 14, color: '#853804ff'},
                    ]}>
                    {item?.pipeUser?.userName}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: '#d1ecf1',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}>
                <Text
                  style={[
                    styles.titleHeader,
                    {fontSize: 14, color: '#0c5460'},
                  ]}>
                  {item?.pipeLand?.plot_no}
                </Text>
              </View>
            </View>
          }
          content={
            <>
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 8,
                  marginVertical: 10,
                  shadowColor: '#000',
                  flexDirection: 'row',
                }}>
                <View>
                  <Text style={styles.title}>
                    {t('farmer_name').substring(0, 10)}
                  </Text>
                  <Text style={styles.title}>{t('farmer_number')}</Text>
                  <Text style={styles.title}>{t('addcrop_plot')}</Text>
                  {/* <Text style={styles.title}>{t('perf_date')}</Text>
                      <Text style={styles.title}>{t('Sowing')}</Text> */}
                  <Text style={styles.title}>{t('crop_name')}</Text>
                  <Text style={styles.title}>{t('crop_veriety')}</Text>
                  {/* <Text style={styles.title}>{t('deviation')}</Text>
                      <Text style={styles.title}>{t('Harvesting')}</Text>
                      <Text style={styles.title}>{t('cycle_start_date')}</Text> */}
                  <Text style={styles.title}>{t('activity_type')}</Text>
                  <Text style={styles.title}>{t('act_name')}</Text>
                  <Text style={styles.title}>{t('instrument_name')}</Text>
                </View>
                <View style={{marginLeft: 10}}>
                  <Text style={styles.title}>: {item?.pipeUser?.userName}</Text>
                  <Text style={styles.title}>
                    : {item?.pipeUser?.contactNumber}
                  </Text>
                  <Text style={styles.title}>: {item?.pipeLand?.plot_no}</Text>
                  {/* <Text style={styles.title}>
                        : {item?.pipeActivity?.act_perform_date}
                      </Text>
                      <Text style={styles.title}>
                        : {item?.pipeActivity?.actCurel?.sowing_date}
                      </Text> */}

                  <Text style={styles.title}>
                    : {item?.pipeActivity?.cropName?.name}
                  </Text>
                  <Text style={styles.title}>
                    : {item?.pipeActivity?.cropVariety?.name}
                  </Text>
                  {/* <Text style={styles.title}>
                        : {item?.pipeActivity?.deviation}
                      </Text>
                      <Text style={styles.title}>
                        :{' '}
                        {item?.pipeActivity?.actCurel?.harvesting_date?.substring(
                          0,
                          10,
                        )}
                      </Text>
                      <Text style={styles.title}>
                        : {item?.pipeActivity?.cycle_start_date}
                      </Text> */}
                  <Text style={styles.title}>
                    : {item?.pipeActivity?.activityType?.categoryName}
                  </Text>
                  <Text style={styles.title}>
                    : {item?.pipeActivity?.activityName?.categoryName}
                  </Text>
                  <Text style={styles.title}>: {item?.pipe_name}</Text>
                </View>
              </View>

              {/* {item?.status_label === 'REJECTED' && (
                                                <View
                                                    style={{
                                                        backgroundColor: '#F8D7DA',
                                                        borderRadius: 5,
                                                        borderColor: '#F8D7DA',
                                                        elevation: 1,
                                                        marginVertical: 10,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            paddingHorizontal: 10,
                                                            color: '#721C24',
                                                            fontFamily: 'Poppins-Regular',
                                                            fontSize: 14,
                                                        }}
                                                    >
                                                        {item?.comment}
                                                    </Text>
                                                </View>
                                            )} */}
            </>
          }
          footer={
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignSelf: 'flex-end',
              }}>
              {/* <Image
                    source={require('../../Common/images/area-with-pins.png')}
                    style={{
                      width: 25,
                      height: 25,
                      tintColor: '#0d8320',
                    }}
                  /> */}
              {item.status_label == 'APPROVED' && (
                <View
                  style={{
                    backgroundColor: '#D4EDDA',
                    padding: 8,
                    borderRadius: 5,
                    // marginRight: 15,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    width: 100,
                    // borderWidth: 1,
                    // borderColor: "#b8f8a9",
                    height: 38,
                  }}>
                  {/* <Icon
                                                name="check"
                                                size={20}
                                                color="green"
                                                iconFamily="Feather"
                                              /> */}
                  <Text style={{color: '#155724', fontSize: 14}}>
                    {item.status_label}
                  </Text>
                </View>
              )}
              {item.status_label == 'CARBON_DOCUMENTS_SUBMITTED' && (
                <View
                  style={{
                    backgroundColor: '#D4EDDA',
                    padding: 8,
                    borderRadius: 5,
                    // marginRight: 15,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    width: 120,
                    // borderWidth: 1,
                    // borderColor: "#b8f8a9",
                    height: 38,
                  }}>
                  {/* <Icon
                                                name="check"
                                                size={20}
                                                color="green"
                                                iconFamily="Feather"
                                              /> */}
                  <Text style={{color: '#155724', fontSize: 14}}>
                    SUBMITTED
                  </Text>
                </View>
              )}
              {item.status_label == 'CARBON_DOCUMENTS_REJECTED' && (
                <View
                  style={{
                    backgroundColor: '#F8D7DA',
                    padding: 8,
                    borderRadius: 5,
                    // marginRight: 15,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    width: 180,
                    borderWidth: 1,
                    borderColor: '#F8D7DA',
                    height: 38,
                  }}>
                  {/* <Icon
                                            name="close"
                                            size={16}
                                            color="#FF5252"
                                            iconFamily="AntDesign"
                                          /> */}
                  <Text style={{color: '#721C24', fontSize: 14}}>
                    CARBON REJECTED
                  </Text>
                </View>
              )}

              {item.status_label == 'CARBON_DOCUMENTS_APPROVED' && (
                <View
                  style={{
                    backgroundColor: '#D4EDDA',
                    padding: 8,
                    borderRadius: 5,
                    // marginRight: 15,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    width: 100,
                    // borderWidth: 1,
                    // borderColor: "#b8f8a9",
                    height: 38,
                  }}>
                  <Text style={{color: '#155724', fontSize: 14}}>VERIFIED</Text>
                </View>
              )}
              {item.status_label == 'PENDING' && (
                <View
                  style={{
                    // backgroundColor:'#ffe69b',
                    backgroundColor: '#FFF3CD',
                    padding: 8,
                    borderRadius: 5,
                    // marginRight: 15,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    width: 100,
                    // borderWidth: 1,
                    // borderColor: "#ffc107",
                    height: 38,
                  }}>
                  {/* <Icon
                                            name="av-timer"
                                            size={20}
                                            color="#ffc107"
                                            iconFamily="MaterialCommunityIcons"
                                          /> */}
                  <Text style={{color: '#856404', fontSize: 14}}>
                    {item.status_label}
                  </Text>
                </View>
              )}
              {item.status_label == 'REJECTED' && (
                <View
                  style={{
                    backgroundColor: '#F8D7DA',
                    padding: 8,
                    borderRadius: 5,
                    // marginRight: 15,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    width: 100,
                    borderWidth: 1,
                    borderColor: '#F8D7DA',
                    height: 38,
                  }}>
                  {/* <Icon
                                            name="close"
                                            size={16}
                                            color="#FF5252"
                                            iconFamily="AntDesign"
                                          /> */}
                  <Text style={{color: '#721C24', fontSize: 14}}>
                    {item.status_label}
                  </Text>
                </View>
              )}
            </View>
          }
        />
      </TouchableOpacity>
    );
  }, []);
  const filterOptionShow = useCallback(async () => {
    const {openFilterSheet} = await import('../../Components/FilterSheet');
    openFilterSheet({
      options: ['farmer', 'phone', 'date'],
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
        let search_key_val = '';
        if (filter == 'Farmer/Product Name') {
          search_key_val = farmerName?.label;
        } else if (filter == 'PhoneNumber') {
          search_key_val = farmerPhone?.label;
        }
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
        setCarbonType({
          label: sheetCarbonType?.label,
          value: sheetCarbonType?.value,
        });
        setPage(1);
        //         dbName,
        // languageId,
        // token,
        // supervisorId,
        // pageNo,
        // searchItem = '',
        // from_date = '',
        // to_date = '',
        // carbonType = '',
        fatchActivityListAPI(
          dbname,
          lan_id,
          token,
          user_id,
          1,
          search_key_val,
          fromDate,
          toDate,
          '',
        );
      } catch (error) {}
    },
    [
      filterItem,
      fromDate,
      toDate,
      searchFarmerName,
      searchFarmerPhone,
      carbonType,
    ],
  );
  const handleFilterRemove = () => {
    try {
      setFromDate('');
      setToDate('');
      setSearchFarmerName({label: '', value: ''});
      setSearchFarmerPhone({label: '', value: ''});
      setCarbonType({label: '', value: ''});
      setFilterItem('');
      fetchActivityListAPI(1, '', '', '', '', '');
      setPage(1);
    } catch (error) {
      console.log(error);
    }
  };
  const renderCustomHeader = useMemo(
    () => (
      <CustomHeader
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
        {renderCustomHeader}
        <View style={{flex: 1, backgroundColor: Colors.background_light}}>
          {isLoading && (
            <View style={styles.loadingScreen}>
              <LoadingScreen />
            </View>
          )}
          <FlatList
            data={activityAll}
            keyExtractor={(item, index) =>
              item?.id?.toString() || index.toString()
            }
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={{padding: 10}}
            renderItem={renderItem}
            windowSize={5}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
          />
          <PaginationNav
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
            t={t}
          />
        </View>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};
export default InstrumentWiseActivityView;
const styles = StyleSheet.create({
  wrapper: {
    borderColor: '#efe9e9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    borderRadius: 7,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    marginHorizontal: '2.5%',
    paddingHorizontal: 8,
    marginVertical: 7,
    paddingVertical: 10,
    // height: 100,
  },
  activityListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityListItem: {
    paddingBottom: 1,
  },
  title: {
    color: '#000',
    lineHeight: 25,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  prevNextPage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    position: 'relative',
    bottom: 0,
  },

  OptionWrapper: {
    borderColor: '#efe9e9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    borderRadius: 7,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginVertical: 7,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  loadingScreen: {
    position: 'absolute',
    top: 200,
    zIndex: 999,
    left: '45%',
  },
  flatContainerLengthUp: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    left: 0,
    // top: 100,
    top: '20%',
    marginHorizontal: '5%',
    width: '90%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },
  flatlistHeight: {
    height: Dimensions.get('window').height / 4,
  },
  flatContainer: {
    // backgroundColor: '#ffffff',
    // position: 'absolute',
    // zIndex: 999,
    // bottom: '100%',
    // left: 0,
    // marginHorizontal: '5%',
    // width: '90%',
    // elevation: 10,
    // borderRadius: 10,
    // padding: 10,
    // bottom:100
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    left: 0,
    // top:30,
    // marginTop: 60,
    top: '13%',
    marginHorizontal: '5%',
    width: '90%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },
  flatlisttitle: {
    color: '#000',
    marginVertical: 6,
    fontFamily: 'Poppins-Regular',
  },
  titleHeader: {
    color: '#256c07',
    fontFamily: 'Poppins-Regular',
    // fontFamily: 'Poppins-SemiBold',
    lineHeight: 16,
    fontSize: 12,
  },
  titleHeader1: {
    color: '#34900d',
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 16,
    fontSize: 12,
  },

  // Add new styles for the header
  headerContainer: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#256c07',
  },
  infoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 10,
  },
  pipeBadge: {
    backgroundColor: '#e8f5e8',
  },
  userBadge: {
    backgroundColor: '#fff3cd',
  },
  plotBadge: {
    backgroundColor: '#d1ecf1',
  },
  badgeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    lineHeight: 16,
  },
  pipeText: {
    color: '#155724',
  },
  userText: {
    color: '#856404',
  },
  plotText: {
    color: '#0c5460',
  },
});
