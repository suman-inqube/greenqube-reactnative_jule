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
  useMemo,
  useCallback,
} from 'react';
import DatePickerComp from '../../Common/DatePickerComp';
import FarmerFilter from '../../Common/FarmerFilter';
import {
  FarmerActivityListInstrumentWise,
  farmerByNameAPI,
} from '../../../config/apiHere';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import CollapsibleCard from '../../Common/CollapsibleCard';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors} from '../../utils/Constants';
import PlotStatusSkeletonScreen from '../../Components/Skeleton/PlotStatusSkeleton';
const FarmerInstrumentWiseActivityView = ({navigation}) => {
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
  const {netConnection} = DeviceInfo();
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
  // const [fromDate, setfromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  // const [farmerData, setFarmerData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [carbonType, setCarbonType] = useState('');
  const [fromDate, setFromDate] = useState('');

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
    setactivityAll(activityAllRow);
    setfromDate('');
    setToDate('');
    setSearchFarmerName('');
    setSearchFarmerPhone('');
    setCarbonType('');
  };
  const handlePage = async value => {
    handlePageList(
      value,
      setIsLoading,
      token,
      pageNo,
      FarmerActivityListInstrumentWise,
      setactivityAll,
      dbname,
      lan_id,
      user_id,
      '',
      fromDate,
      toDate,
      carbonType,
    );
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
  const fatchActivityListAPI = async (
    dbName,
    languageId,
    token,
    user_id,
    pageNo,
    searchItem = '',
    from_date = '',
    to_date = '',
    carbonType = '',
  ) => {
    setIsLoading(true);
    if (isOnline) {
      var response = await FarmerActivityListInstrumentWise(
        dbName,
        languageId,
        token,
        user_id,
        pageNo,
        searchItem,
        from_date,
        to_date,
        carbonType,
      );
      if (response?.status == 200) {
        await setItem('activityList', response);
      }
    } else {
      var response = await getItem('activityList');
    }
    if (response?.status == 200) {
      if (response.data.data.count != 0) {
        const totalPage = Math.ceil(response.data.data.count / 10);
        setdbLanTokUsr({...dbLanTokUsr, totalPage: totalPage});
        setactivityAll(response?.data?.data?.rows);
        if (carbonType == '') {
          setactivityAllRow(response?.data?.data?.rows);
        }
        await setItem('activity_Data', response?.data?.data?.rows);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        Toast.show({time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0]});
      }
    }
  };
  const onPageLoad = async (fromDate = '', toDate = '') => {
    // setdbLanTokUsr({ ...dbLanTokUsr, pageNo: 1 });
    let pageNumber;
    if (params?.onPageName == 'CustomDrawer') {
      pageNumber = 1;
    } else {
      pageNumber = pageNo;
    }
    fatchActivityListAPI(dbname, lan_id, token, user_id, pageNumber);
  };
  const filterDataRemove = () => {
    setFilterItem('');
    setCarbonType('');
    setFilterOption(false);
    setactivityAll(activityAllRow);
    setSearchResultsList(false);
  };
  const HandlerGoBack = () => {
    setFilterItem('');
    setFilterOption(false);
    setSearchFarmerName('');
    setSearchFarmerPhone('');
    setSearchResultsList(false);
    setfromDate('');
    setToDate('');
    // setactivityAll([]);
    // setactivityAllRow([]);
    navigation.navigate('FarmerDashboard');
  };
  const handleBackPress = () => {
    setdbLanTokUsr({...dbLanTokUsr, pageNo: 1});
    setFilterItem('');
    setFilterOption(false);
    setSearchFarmerName('');
    setSearchFarmerPhone('');
    setSearchResultsList(false);
    setfromDate('');
    setToDate('');
    // setactivityAll([]);
    // setactivityAllRow([]);
    navigation.navigate('FarmerDashboard');
    return true;
  };
  useEffect(() => {
    if (isFocused) {
      if (
        fromDate == '' &&
        toDate == '' &&
        searchFarmerName == '' &&
        searchFarmerPhone == ''
      ) {
        onPageLoad();
      }
      onBackPress(handleBackPress);
    }
  }, [isFocused]);
  useEffect(() => {
    if (isFocused) {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => {
          setKeyboardVisible(true);
        },
      );
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setKeyboardVisible(false);
        },
      );
      return () => {
        keyboardDidHideListener.remove();
        keyboardDidShowListener.remove();
      };
    }
  }, [isFocused]);
  const onChangeCarbonType = _item => {
    const {label, value} = _item;
    setCarbonType(value);
    fatchActivityListAPI(dbname, lan_id, token, user_id, 1, '', '', '', value);
  };
  const renderCustomHeader = useMemo(
    () => <CustomHeader t={t} filterOptionShow={filterOptionShow} />,
    [filterOptionShow],
  );
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        {/* <CustomHeader
          path="FarmerDashboard"
          HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        /> */}
        <View style={{flex: 1, backgroundColor: Colors.background_light}}>
          {renderCustomHeader}
          {/* {openFromDate && (
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
          <View style={{marginVertical: 10}}>
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
              // title={t('activity_Pipe_List')}
              // filterItem={'Date'}
              onlyDate={true}
              filterDataRemove={filterDataRemove}
              carbonFlag={false}
              onChangeCarbonType={onChangeCarbonType}
              carbonTypeVal={carbonType}
              dataActivity={[
                {label: 'Carbon ', value: 'carbon_activity'},
                {label: 'Non-Carbon ', value: 'user_activity'},
              ]}
            />
          </View> */}
          <>
            {searchResultsList && searchResultsList ? (
              <View
                View
                style={
                  isKeyboardVisible
                    ? styles.flatContainerLengthUp
                    : styles.flatContainer
                }>
                <FlatList
                  style={searchResults.length > 8 ? styles.flatlistHeight : ''}
                  data={searchResults}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      onPress={() => handleResultSelectList(item)}
                      style={styles.flatlistitem}>
                      <Text style={[styles.flatlisttitle, {color: 'black'}]}>
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
          </>

          <FlatList
            data={isLoading ? Array.from({length: 5}) : activityAll}
            keyExtractor={(item, index) =>
              item?.id?.toString() || index.toString()
            }
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={{padding: 10}}
            renderItem={({item, index}) =>
              isLoading ? (
                <PlotStatusSkeletonScreen />
              ) : (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(
                      'FarmerInstrumentWiseActivityDetails',
                      item,
                    )
                  }>
                  <CollapsibleCard
                    width="100%"
                    header={
                      <View style={{height: 30}}>
                        <Text style={[styles.titleHeader, {fontSize: 15}]}>
                          {item?.pipe_name}
                        </Text>
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
                            <Text style={styles.title}>
                              {t('farmer_number')}
                            </Text>
                            <Text style={styles.title}>
                              {t('addcrop_plot')}
                            </Text>
                            {/* <Text style={styles.title}>{t('perf_date')}</Text>
                                                         <Text style={styles.title}>{t('Sowing')}</Text> */}
                            <Text style={styles.title}>{t('crop_name')}</Text>
                            <Text style={styles.title}>
                              {t('crop_veriety')}
                            </Text>
                            {/* <Text style={styles.title}>{t('deviation')}</Text>
                                                         <Text style={styles.title}>{t('Harvesting')}</Text>
                                                         <Text style={styles.title}>{t('cycle_start_date')}</Text> */}
                            <Text style={styles.title}>
                              {t('activity_type')}
                            </Text>
                            <Text style={styles.title}>{t('act_name')}</Text>
                            <Text style={styles.title}>
                              {t('instrument_name')}
                            </Text>
                          </View>
                          <View style={{marginLeft: 10}}>
                            <Text style={styles.titleVal}>
                              : {item?.pipeUser?.userName}
                            </Text>
                            <Text style={styles.title}>
                              : {item?.pipeUser?.contactNumber}
                            </Text>
                            <Text style={styles.title}>
                              : {item?.pipeLand?.plot_no}
                            </Text>
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
                            <Text style={styles.title}>
                              : {item?.pipe_name}
                            </Text>
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
                            <Text
                              style={{
                                color: '#155724',
                                fontSize: 14,
                              }}>
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
                            <Text
                              style={{
                                color: '#155724',
                                fontSize: 14,
                              }}>
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
                            <Text
                              style={{
                                color: '#721C24',
                                fontSize: 14,
                              }}>
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
                            <Text
                              style={{
                                color: '#155724',
                                fontSize: 14,
                              }}>
                              VERIFIED
                            </Text>
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
                            <Text
                              style={{
                                color: '#856404',
                                fontSize: 14,
                              }}>
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
                            <Text
                              style={{
                                color: '#721C24',
                                fontSize: 14,
                              }}>
                              {item.status_label}
                            </Text>
                          </View>
                        )}
                      </View>
                    }
                  />
                </TouchableOpacity>
              )
            }
          />
          <PaginationNav
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
            t={t}
          />
          {/* <View style={styles.prevNextPage}>
            <TouchableOpacity onPress={() => handlePage('previous')}>
              <Text style={styles.title}>{t('prev_page')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePage('next')}>
              <Text style={styles.title}>{t('next_page')}</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};
export default FarmerInstrumentWiseActivityView;
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
  titleVal: {
    color: '#000',
    lineHeight: 25,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  titleHeader: {
    color: '#256c07ff',
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 25,
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
});
