import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Keyboard, Dimensions
} from 'react-native'
import React, { useEffect, useState, useContext, useCallback, lazy } from 'react';
import DatePickerComp from '../../Common/DatePickerComp';
import WidgetsSide from '../../Common/WidgetsSide';
import Filter from '../../Common/Filter';
import { activityListAPI, farmerByNameAPI } from '../../../config/apiHere';
import { useIsFocused } from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
import { SPSheet } from 'react-native-popup-confirm-toast';
import CarbonActivityBottomSheet from '../../Common/CarbonActivityBottomSheet';
const OPTIONS = [
  { id: 'AWD', title: 'Carbon', navigation: 'ActivityReportAWD' },
  { id: 'Conventional', title: 'Non-Carbon', navigation: 'activityReport' },
];
import MyErrorBoundary from '../../Common/MyErrorBoundary';
import { CrashlyticsRecordError } from '../../Crashlytics/CrashlyticsRecordError';
import { Colors, Fonts } from '../../utils/Constants';
import { FloatingAction } from 'react-native-floating-action';
import { axiosGet } from '../../utils/api';
import { ROUTES } from '../../utils/Routes';
function ActivityList({ navigation }) {

  //GQR-67
  const { dbLanTokUsr, setdbLanTokUsr, loginUser_data, LoadingScreen, CustomHeader, t, AlertMesg, onBackPress, getItem, setItem, logoImage, topBanner, Root, Toast, DeviceInfo, handlePageList, handleFilter, effective_dates, handleResultSelect, isOnline, farmerData } = useContext(userCreateContext);
  const { dbname, lan_id, token, user_id, carbonFlag } = loginUser_data;
  const { pageNo } = dbLanTokUsr;
  //GQR-67
  const actions = [
    {
      text: t('report_activity'),
      name: 'bt_add',
      position: 1,
      color: Colors.useGreen, // visible button color
      textStyle: styles.actionText,
      textBackground: '#ffffff',
      icon: { uri: 'https://example.com/icon.png' },
      onPress: () => handleSPSheetShow()
    }
  ];
  const [isLoading, setIsLoading] = useState(true);
  const [activityAll, setactivityAll] = useState([]);
  const [filterItem, setFilterItem] = useState("");
  const [filterName, setFilterName] = useState("");
  const [newFromDate, setnewFromDate] = useState("");
  const [newToDate, setnewToDate] = useState("");
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  // const [farmerData, setFarmerData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [carbonType, setCarbonType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const filterOptionShow = async () => {
    const { openFilterSheet } = await import('../../Components/FilterSheet');
    openFilterSheet({
      options: ['All', 'Active', 'Inactive', 'Pending'],
      // onchangeFilterItem: onchangeFilterItem,
      t: t,
      dropdownData: farmerData,
      filterItem: filterItem,
      setSearchFarmerName: setSearchFarmerName,
      setSearchFarmerPhone: setSearchFarmerPhone,
      searchFarmerName: searchFarmerName,
      searchFarmerPhone: searchFarmerPhone,
      title: 'Choose Status',
      setFilterItem: setFilterItem,
      // handleDatePicker: handleDatePicker,
      // handleDatePicker2: handleDatePicker2,
      handleFilterResult: handleFilterResult,
      handleFilterRemove: handleFilterRemove,
      setFromDate: setFromDate,
      setToDate: setToDate,
      fromDate: fromDate,
      toDate: toDate,
      effective_dates: effective_dates,
      onApply: (values) => {
        console.log('Applied Filter:', values);
        setSelected(values.filterType);
        // If you need to handle date range:
        // doSomething(values.fromDate, values.toDate);
      },
    });
  };
  const handleFilterResult = useCallback(({ item, fromDate, toDate }) => {
    setFromDate(fromDate);
    setToDate(toDate);
    fatchActivityListAPI(1, fromDate, toDate);
  }, []);
  const handleFilterRemove = () => {
    setFromDate("");
    setToDate("");
    fatchActivityListAPI(1, "", "");
  }
  const fatchActivityListAPI = async (pageNo, fromDateParams, toDateParams) => {
    try {
      setIsLoading(true);
      setPage(1);
      if (isOnline) {
        var response = await axiosGet(ROUTES.GET.LIST_USER_ACITYLIST_E({
          userId: pageNo,
          carbonType: carbonType,
          userID: user_id,
          searchPhone: "",
          farmer_id: "",
          from_date: fromDateParams == undefined ? fromDate : fromDateParams,
          to_date: toDateParams == undefined ? toDate : toDateParams,
        }), token, { information: `${dbname},${lan_id},${user_id}` })
        if (response?.status == 200) { await setItem('activityList', response); }
      } else {
        var response = await getItem('activityList');
      }
      if (response?.status == 200) {
        const totalPage = Math.ceil(response.data.count / 20);
        setTotalPages(Math.ceil(response.data.count / 20));
        setdbLanTokUsr({ ...dbLanTokUsr, totalPage: totalPage });
        setactivityAll(response?.data?.rows);
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      // CrashlyticsRecordError(error, "ActivityList", "fatchActivityListAPI");

    }
  };
  const onPageLoad = async (page) => {
    fatchActivityListAPI(page);
  };
  useEffect(() => {
    try {
      onPageLoad(page);
    } catch (error) {
      CrashlyticsRecordError(error, "ActivityList", "useEffect");
    }
  }, [page]);
  const navigateToPages = useCallback(async (pageName, uact_id) => {
    navigation.navigate(pageName, uact_id);
  }, []);
  const handleSPSheetShow = () => {
    try {
      if (carbonFlag == true) {
        SPSheet.show({
          component: () => (
            <CarbonActivityBottomSheet index={0} spSheet={SPSheet} navigation={navigation} options={OPTIONS} />
          ),
          height: 200,
          zIndex: 1000,
        });
      } else {
        navigation.navigate('activityReport');
      }
    } catch (error) {
      CrashlyticsRecordError(error, "ActivityList", "handleSPSheetShow");

    }

  };
  const onChangeCarbonType = (_item) => {
    const { label, value } = _item;
    setCarbonType(value);
    fatchActivityListAPI(dbname, lan_id, token, user_id, 1, '', '', '', value);
  };
  return (
    <MyErrorBoundary>
      <Root>
        <CustomHeader
          path="Dashboard"
          // HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
          filterOptionShow={filterOptionShow} />
        <View style={{ flex: 1, backgroundColor: Colors.background_light }}>
          {/* <WidgetsSide
              location={'ActivityReport'}
              title={t('report_activity')}
              onPress={() => handleSPSheetShow()}
            /> */}
          {/* {openFromDate && (
            <DatePickerComp
              openDate={openFromDate}
              newDate={newFromDate}
              setOpenDate={setOpenFromDate}
              handleDatePicker={handleDatePicker} />
          )}
          {openToDate && (
            <DatePickerComp
              openDate={openToDate}
              newDate={newToDate}
              setOpenDate={setOpenToDate}
              handleDatePicker={handleDatePicker2}
              minimumDate={fromDate == ''
                ? ''
                : new Date(
                  `${new Date(fromDate).getFullYear()}-${new Date(fromDate).getMonth() + 1}-${new Date(fromDate).getDate() + 1}`
                )} />
          )} */}
          {isLoading && (
            <View style={styles.loadingScreen}>
              <LoadingScreen />
            </View>
          )}
          <FlatList
            data={activityAll}
            initialNumToRender={1}
            windowSize={5}
            removeClippedSubviews={true}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.wrapper}
                onPress={() => navigateToPages('activityDetail', item)}
              >
                {/* Container for left and right columns */}
                <View style={styles.activityListContainer}>
                  {/* LEFT COLUMN */}
                  <View style={styles.activityListItem}>
                    {[
                      { label: t('farmer_name'), value: item?.agri_user?.userName },
                      { label: t('addcrop_plot'), value: item?.land_info?.plot_no },
                      { label: t('perf_date'), value: item?.act_perform_date },
                      { label: t('Sowing'), value: item?.actCurel?.sowing_date },
                    ].map((field, idx) => (
                      <View key={idx} style={styles.row}>
                        <Text style={[styles.title, styles.label]} numberOfLines={1} ellipsizeMode="tail">
                          {field.label}:
                        </Text>
                        <Text style={[styles.title, styles.value]} numberOfLines={1} ellipsizeMode="tail">
                          {field.value || '-'}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* RIGHT COLUMN */}
                  <View style={styles.activityListItem}>
                    {[
                      { label: t('farmer_number'), value: item?.agri_user?.contactNumber },
                      { label: t('crop_name'), value: item?.cropName?.name },
                      { label: t('deviation'), value: `${item?.deviation} ${t('days')}` },
                      { label: t('Harvesting'), value: `${effective_dates(item?.actCurel?.harvesting_date)} ${t('days')}` },
                    ].map((field, idx) => (
                      <View key={idx} style={styles.row}>
                        <Text style={[styles.title, styles.label]} numberOfLines={1} ellipsizeMode="tail">
                          {field.label}:
                        </Text>
                        <Text style={[styles.title, styles.value]} numberOfLines={1} ellipsizeMode="tail">
                          {field.value || '-'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Extra info below columns */}
                <Text style={styles.title}>
                  {t('cycle_start_date')} : {item?.cycle_start_date || '-'}
                </Text>
                <Text style={styles.title}>
                  {t('activity_type')} : {item?.typeActivity?.categoryName || ''}
                </Text>
              </TouchableOpacity>
            )} />


          <View style={styles.prevNextPage}>
            <TouchableOpacity disabled={page === 1} onPress={() => setPage((p) => Math.max(1, p - 1))}>
              <Text style={styles.title}>{t('prev_page')}</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              Page {page} / {totalPages}
            </Text>
            <TouchableOpacity disabled={page === totalPages} onPress={() => setPage((p) => Math.min(totalPages, p + 1))}>
              <Text style={styles.title}>{t('next_page')}</Text>
            </TouchableOpacity>
          </View>

        </View>
        <FloatingAction
          position="right"
          actions={actions}
          color={Colors.useGreen}
          onPressItem={(name) => {
            handleSPSheetShow();
          }}
          showBackground={true} // show the overlay
          overlayColor="rgba(22, 17, 17, 0.35)" // red overlay with transparency

          // style={{ bottom: 500, right: 1600 }}
          distanceToEdge={{ vertical: 80, horizontal: 25 }} />
      </Root>
    </MyErrorBoundary>
  );
}
export default ActivityList;
const styles = StyleSheet.create({
  fab: {
    backgroundColor: Colors.useGreen,
  },
  // wrapper: {
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.5,
  //   shadowRadius: 2,
  //   borderRadius: 8,
  //   // elevation: 3,
  //   backgroundColor: Colors.background,
  //   marginHorizontal: '3.5%',
  //   marginVertical:'2%',
  //   // paddingHorizontal: 8,
  //   // paddingVertical: 10,
  //   borderWidth: 1,
  //   borderColor: Colors.border,
  //   overflow: 'hidden',
  //   height: 200,
  //   flexDirection:'row',
  //   justifyContent:'space-between',
  //   padding:10,

  // },
  // activityListContainer: {
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   width: '45%',
  //   borderWidth:1
  // },
  // activityListItem: {
  //   paddingBottom: 1,
  //   //  width: '90%',
  // },
  // title: {
  //   color: '#000',
  //   lineHeight: 25,
  //   fontFamily: Fonts.Light,
  //   fontSize: 14
  // },
  wrapper: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  activityListContainer: {
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    flexShrink: 0,
    fontWeight: 'bold',
    marginRight: 6,
  },
  value: {
    flex: 1,
  },
  title: {
    lineHeight: 20,
    color: Colors.text,
    fontFamily: Fonts.Light,
    fontSize: 14
  },
  prevNextPage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    position: 'relative',
    bottom: 0,
    backgroundColor:Colors.useGreen
  },

  OptionWrapper: {
    borderColor: '#efe9e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    left: '45%'
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
    padding: 10
  },
  flatlistHeight: {
    height: Dimensions.get('window').height / 4
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
    padding: 10
  },
  flatlisttitle: {
    color: '#000',
    marginVertical: 6,
    fontFamily: 'Poppins-Regular'
  },

})
