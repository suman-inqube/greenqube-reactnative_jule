import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  lazy,
  useRef,
  memo,
} from 'react';
import WidgetsSide from '../../Common/WidgetsSide';
import {farmerActivityListAPI} from '../../../config/apiHere';
import {useFocusEffect} from '@react-navigation/native';
import MessageDialog from '../../Common/MessageDialog';
import FarmerFilter from '../../Common/FarmerFilter';
import {userCreateContext} from '../../Context/usersCreateContext';
import {SPSheet} from 'react-native-popup-confirm-toast';
import CarbonActivityBottomSheet from '../../Common/CarbonActivityBottomSheet';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
import {getStatusColor, getProduceEmoji, formatDate} from '../../utils/helpers';
import SkeletonCardActivityList from '../../Components/Skeleton/SkeletonCardActivityList';
import PaginationNav from '../../Components/PaginationNav';
import {FloatingAction} from 'react-native-floating-action';
import MyErrorBoundary from '../../Common/MyErrorBoundary';
import {Colors, Fonts} from '../../utils/Constants';
import ActivityCard from '../../Components/ActivityCard';

import {
  OPTIONS_CARBON,
  getActionsActivity,
  CARBON_TYPE,
} from '../../utils/options';
const OPTIONS = [
  {id: 'AWD', title: 'Carbon', navigation: 'FarmerActivityReportAWD'},
  {
    id: 'Conventional',
    title: 'Non-Carbon',
    navigation: 'FarmerActivityReport',
  },
];
const FarmerActivityList = ({navigation}) => {
  //GQR-67
  const {
    handlePageList,
    dbLanTokUsr,
    setdbLanTokUsr,
    loginUser_data,
    effective_dates,
    LoadingScreen,
    CustomHeader,
    t,
    DatePickerComp,
    onBackPress,
    getItem,
    setItem,
    logoImage,
    topBanner,
    DeviceInfo,
    Root,
    Toast,
    AlertMesg,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id, carbonFlag} = loginUser_data;
  const {farmerId, pageNo} = dbLanTokUsr;
  //GQR-67
  const {netConnection} = DeviceInfo();
  const [isLoading, setIsLoading] = useState(true);
  const [activityAll, setactivityAll] = useState([]);
  const [filterOption, setFilterOption] = useState(false);
  const [filterItem, setFilterItem] = useState('');
  const [filterName, setFilterName] = useState('');
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [newToDate, setnewToDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [fromDate, setfromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [carbonType, setCarbonType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const filterOptionShow = () => {
    if (!filterOption) {
      setFilterOption(true);
    } else {
      setFilterOption(false);
    }
  };
  const onchangeFilterItem = value => {
    setFilterName(value);
    setFilterItem(value);
    setFilterOption(false);
    setCarbonType('');
  };
  const handlePage = async value => {
    handlePageList(
      value,
      setIsLoading,
      token,
      pageNo,
      farmerActivityListAPI,
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
  const handleFilter = async item => {
    if (filterName === 'date') {
      return;
    } else {
      const from_date = '';
      const to_date = '';
      const response = await farmerActivityListAPI(
        dbLanTokUsr.dbName,
        dbLanTokUsr.languageId,
        dbLanTokUsr.token,
        dbLanTokUsr.supervisorId,
        dbLanTokUsr.pageNo,
        item,
        from_date,
        to_date,
        carbonType,
      );
      if (response) {
        setactivityAll(response.data.data.rows);
        await setItem('activity_Data', response.data.data.rows);
      }
    }
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
      const item = '';
      const response = await farmerActivityListAPI(
        dbname,
        lan_id,
        token,
        user_id,
        pageNo,
        item,
        fromDateFilter,
        effective_date,
      );
      if (response) {
        setactivityAll(response.data.data.rows);
        setItem('activity_Data', response.data.data.rows);
      }
    } else {
      // MessageDialog({ title: 'Require', message: 'Please Select First data.' });
      Toast.show({
        time: 3,
        text: 'Please Select First data.',
        ...AlertMesg[0],
      });
    }
  };
  const fatchActivityListAPI = async (
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
    if (netConnection) {
      var response = await axiosGet(
        ROUTES.GET.USER_ACTIVITY({
          pageNO: pageNo,
          carbonType: carbonType,
          userID: supervisorId,
          searchItem: searchItem,
          from_date: from_date,
          to_date: to_date,
        }),
        token,
        {information: `${dbName},${languageId},${supervisorId}`},
      );
      await setItem('farmerActivityList' + supervisorId, response);
    } else {
      var response = await getItem('farmerActivityList' + supervisorId);
    }
    if (response?.data) {
      const totalPage = Math.ceil(response.data.data.count / 20);
      setdbLanTokUsr({...dbLanTokUsr, totalPage: totalPage});
      setactivityAll(response.data.data.rows);
      setItem('activity_Data', response.data.data.rows);
      setIsLoading(false);
    }
  };

  const onPageLoad = async () => {
    setfromDate('');
    setToDate('');
    setFilterItem('');
    setFilterOption(false);
    fatchActivityListAPI(dbname, lan_id, token, user_id, 1);
  };

  useEffect(() => {
    onPageLoad();
  }, []);

  const filterDataRemove = async () => {
    setFilterItem('');
    setFilterOption(false);
    setToDate('');
    setfromDate('');
    const response = await farmerActivityListAPI(
      dbname,
      lan_id,
      token,
      user_id,
      1,
    );
    if (response?.data) {
      setactivityAll(response.data.data.rows);
      setItem('activity_Data', response.data.data.rows);
      setIsLoading(false);
      setdbLanTokUsr({...dbLanTokUsr, pageNo: 1});
    }
  };

  const handleSPSheetShow = () => {
    if (carbonFlag == true) {
      SPSheet.show({
        component: () => (
          <CarbonActivityBottomSheet
            index={0}
            spSheet={SPSheet}
            navigation={navigation}
            options={OPTIONS}
          />
        ),
        height: 210,
        zIndex: 1000,
      });
    } else {
      navigation.navigate('FarmerActivityReport');
    }
  };
  const onChangeCarbonType = _item => {
    const {label, value} = _item;
    setCarbonType(value);
    fatchActivityListAPI(dbname, lan_id, token, user_id, 1, '', '', '', value);
  };

  return (
    <FarmerDrawerScreenWrapper1>
      <MyErrorBoundary>
        <Root>
          <SafeAreaView style={styles.container}>
            <CustomHeader
              path="FarmerDashboard"
              logoImage={logoImage}
              topBanner={topBanner}
            />
            <View style={{flex: 1}}>
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
              {/* <WidgetsSide
                location={'FarmerActivityReport'}
                title={t('add_recent_incident')}
                onPress={() => handleSPSheetShow()}
              /> */}
              <View style={{marginTop: 10}}>
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
                  // title={t('my_activities')}
                  // filterItem={'Date'}
                  onlyDate={true}
                  filterDataRemove={filterDataRemove}
                  carbonFlag={carbonFlag}
                  onChangeCarbonType={onChangeCarbonType}
                  carbonTypeVal={carbonType}
                  dataActivity={[
                    {label: 'Carbon ', value: 'carbon_activity'},
                    {label: 'Non-Carbon ', value: 'user_activity'},
                  ]}
                />
              </View>

              <>
                <FlatList
                  data={isLoading ? Array.from({length: 5}) : activityAll}
                  renderItem={({item, index}) =>
                    isLoading ? (
                      <SkeletonCardActivityList />
                    ) : (
                      <ActivityCard
                        activity={item}
                        index={index}
                        navigation={navigation}
                        t={t}
                        effective_dates={effective_dates}
                        path={'activityDetail'}
                      />
                    )
                  }
                  contentContainerStyle={{padding: 20, paddingBottom: 50}}
                  showsVerticalScrollIndicator={false}
                  initialNumToRender={5}
                  windowSize={5}
                  removeClippedSubviews={true}
                  keyExtractor={(item, index) => index?.toString()}
                />

                {/* <PaginationNav
                    isLoading={isLoading}
                    page={page}
                    totalPages={totalPages}
                    onPrev={() => setPage(p => Math.max(1, p - 1))}
                    onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                    t={t}
                  /> */}

                <View style={styles.prevNextPage}>
                  <TouchableOpacity onPress={() => handlePage('previous')}>
                    <Text style={styles.title}>{t('prev_page')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handlePage('next')}>
                    <Text style={styles.title}>{t('next_page')}</Text>
                  </TouchableOpacity>
                </View>
                <FloatingAction
                  position="right"
                  actions={getActionsActivity(t, styles, Colors)}
                  color={Colors.useGreen}
                  onPressItem={name => {
                    handleSPSheetShow();
                  }}
                  showBackground={true}
                  overlayColor="rgba(22, 17, 17, 0.35)"
                  distanceToEdge={{vertical: 80, horizontal: 25}}
                />
              </>
            </View>
          </SafeAreaView>
        </Root>
      </MyErrorBoundary>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerActivityList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
  },

  activityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
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
    borderLeftWidth: 4,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  produceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  produceIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 24,
  },
  produceInfo: {
    flex: 1,
  },
  produceName: {
    fontSize: 16,
    // color: '#1F2937',
    color: Colors.text,
    // marginBottom: 2,
    fontFamily: Fonts.Medium,
  },
  plotSite: {
    fontSize: 14,
    // color: '#6B7280',
    color: Colors.lightText,
    fontFamily: Fonts.Medium,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    // fontWeight: 'bold',
    fontFamily: Fonts.SemiBold,
  },
  farmerSection: {
    backgroundColor: '#F9FAFB',
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    padding: 16,
    paddingBottom: 8,
    // marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: Fonts.Medium,
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: Fonts.Medium,
    flex: 1,
    textAlign: 'right',
  },
  phoneNumber: {
    color: '#3B82F6',
  },
  datesSection: {
    backgroundColor: '#F0FDF4',
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
    padding: 16,
    paddingTop: 8,
    marginBottom: 10,
  },
  dateGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateItem: {
    alignItems: 'center',
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.text,
    fontFamily: Fonts.Medium,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: Fonts.Medium,
  },
  harvestSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  harvestValue: {
    fontSize: 14,
    // color: '#F59E0B',
    color: Colors.pending,
    fontFamily: Fonts.Medium,
  },
  additionalInfo: {
    // marginBottom: 10,
  },
  deviationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 8,
  },
  deviationValue: {
    fontSize: 14,
    // fontWeight: 'bold',
    fontFamily: Fonts.SemiBold,
  },
  activityTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: 'white',
    fontSize: 28,
    fontWeight: '300',
  },
  prevNextPage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    position: 'relative',
    bottom: 0,
  },
  title: {
    color: '#000',
    lineHeight: 25,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
});
