import {
  StyleSheet,
  View,
  FlatList,
  SafeAreaView,
  InteractionManager,
  RefreshControl,
} from 'react-native';
import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  lazy,
  useRef,
  memo,
  useMemo,
} from 'react';
import {userCreateContext} from '../../Context/usersCreateContext';
import {SPSheet} from 'react-native-popup-confirm-toast';
import CarbonActivityBottomSheet from '../../Common/CarbonActivityBottomSheet';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
import SkeletonCardActivityList from '../../Components/Skeleton/SkeletonCardActivityList';
import PaginationNav from '../../Components/PaginationNav';
import MyErrorBoundary from '../../Common/MyErrorBoundary';
import {Colors, Fonts} from '../../utils/Constants';
import ActivityCard from '../../Components/ActivityCard';
import {
  getActionsActivity,
  CARBON_TYPE,
  OPTIONS_CARBON_FARMER,
} from '../../utils/options';
import FloatingActionButton from '../../Components/FloatingActionButton';
import {useIsFocused, useRoute} from '@react-navigation/native';
const FarmerActivityList = ({navigation}) => {
  //GQR-67
  const {
    loginUser_data,
    effective_dates,
    CustomHeader,
    t,
    getItem,
    setItem,
    logoImage,
    topBanner,
    Root,
    navigationBarHeight,
    isOnline,
    Toast,
    AlertMesg,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id, carbonFlag} = loginUser_data;
  const isFocused = useIsFocused();
  const route = useRoute();
  const flatListRef = useRef(null);
  //GQR-67
  const [isLoading, setIsLoading] = useState(true);
  const [activityAll, setActivityAll] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [carbonType, setCarbonType] = useState({label: '', value: ''});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [filterItem, setFilterItem] = useState('');
  const filterOptionShow = useCallback(async () => {
    const {openFilterSheet} = await import('../../Components/FilterSheet');
    openFilterSheet({
      options: ['', '', 'date', 'carbon'],
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
      carbonFlag: carbonFlag,
      CARBON_TYPE: CARBON_TYPE,
      carbonType: carbonType,
      navigationBarHeight: navigationBarHeight,
      height: 150,
    });
  }, [fromDate, toDate, filterItem]);
  const handleFilterResult = useCallback(
    ({filter, fromDate, toDate, farmerName, farmerPhone, sheetCarbonType}) => {
      try {
        setFilterItem(filter);
        setFromDate(fromDate);
        setToDate(toDate);
        setCarbonType({
          label: sheetCarbonType?.label,
          value: sheetCarbonType?.value,
        });
        setPage(1);
        fetchActivityListAPI(
          1,
          '',
          fromDate,
          toDate,
          sheetCarbonType?.value,
          filter,
        );
      } catch (error) {}
    },
    [],
  );
  const handleFilterRemove = () => {
    try {
      setFilterItem('');
      setFromDate('');
      setToDate('');
      setCarbonType({label: '', value: ''});
      fetchActivityListAPI(1, '', '', '', '', '');
      setPage(1);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchActivityListAPI = async (
    pageNo,
    search_key_type = '',
    fromDateParams = '',
    toDateParams = '',
    carbonTypeParams,
  ) => {
    setIsLoading(true);
    if (isOnline) {
      var response = await axiosGet(
        ROUTES.GET.LIST_USER_ACITYLIST_E({
          pageNO: pageNo,
          carbonType:
            carbonTypeParams == undefined ? carbonType.value : carbonTypeParams,
          userID: user_id,
          search_key:
            search_key_type && search_key_type !== 'carbon'
              ? search_key_val
              : filterItem
              ? filterItem === 'Farmer/Product Name'
                ? searchFarmerName?.label
                : filterItem === 'PhoneNumber'
                ? searchFarmerPhone?.label
                : ''
              : '',
          from_date: fromDateParams == undefined ? fromDate : fromDateParams,
          to_date: toDateParams == undefined ? toDate : toDateParams,
        }),
        token,
        {information: `${dbname},${lan_id},${user_id}`},
      );
      await setItem('farmerActivityList' + user_id, response);
    } else {
      var response = await getItem('farmerActivityList' + user_id);
    }
    // console.log('farmerActivityList', response.data.data);
    if (response?.status == 200) {
      setTotalPages(Math.ceil(response?.data?.data.count / 20));
      setActivityAll(response?.data?.data.rows);
      setItem('activity_Data', response?.data?.data.rows);
      setIsLoading(false);
    }
    setIsLoading(false);
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({offset: 0, animated: true});
    }
  };
  useEffect(() => {
    if (route?.params?.action === 'addData') {
      Toast.show({text: t('Data_submitted_successfully'), ...AlertMesg[0]});
      setTotalPages(1);
      fetchActivityListAPI(1, '');
      setPage(1);
    }
  }, [route?.params]);
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      fetchActivityListAPI(page);
    });
  }, [page]);
  useEffect(() => {
    if (!isFocused) {
      SPSheet.hide();
    }
  }, [isFocused]);
  const handleRefresh = useCallback(async () => {
    await fetchActivityListAPI(1);
    setPage(1);
  }, []);
  const handleSPSheetShow = () => {
    if (carbonFlag == true) {
      SPSheet.show({
        component: () => (
          <CarbonActivityBottomSheet
            index={0}
            spSheet={SPSheet}
            navigation={navigation}
            options={OPTIONS_CARBON_FARMER}
          />
        ),
        height: 170 + navigationBarHeight,
        zIndex: 1000,
      });
    } else {
      navigation.navigate('FarmerActivityReport');
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
      <MyErrorBoundary>
        <Root>
          <SafeAreaView style={styles.container}>
            {renderCustomHeader}
            <View style={{flex: 1}}>
              <>
                <FlatList
                  ref={flatListRef}
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
                        path={'FarmerActivityDetail'}
                      />
                    )
                  }
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={handleRefresh}
                      colors={['#4CAF50']}
                      tintColor="#4CAF50"
                    />
                  }
                  contentContainerStyle={{padding: 20, paddingBottom: 50}}
                  showsVerticalScrollIndicator={false}
                  initialNumToRender={5}
                  windowSize={5}
                  removeClippedSubviews={true}
                  keyExtractor={(item, index) => index?.toString()}
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
