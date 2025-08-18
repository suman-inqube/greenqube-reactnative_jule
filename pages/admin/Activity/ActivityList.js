import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Keyboard, Dimensions, SafeAreaView, Animated
} from 'react-native'
import React, { useEffect, useState, useContext, useCallback, lazy, useRef, memo } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
import { SPSheet } from 'react-native-popup-confirm-toast';
import CarbonActivityBottomSheet from '../../Common/CarbonActivityBottomSheet';
import { OPTIONS_CARBON, getActionsActivity, CARBON_TYPE } from '../../utils/options';
import MyErrorBoundary from '../../Common/MyErrorBoundary';
import { CrashlyticsRecordError } from '../../Crashlytics/CrashlyticsRecordError';
import { Colors, Fonts } from '../../utils/Constants';
import { FloatingAction } from 'react-native-floating-action';
import { axiosGet } from '../../utils/api';
import { ROUTES } from '../../utils/Routes';
import { getStatusColor, getProduceEmoji, formatDate } from '../../utils/helpers';
import SkeletonCardActivityList from '../../Components/Skeleton/SkeletonCardActivityList';
import PaginationNav from '../../Components/PaginationNav';
function ActivityList({ navigation }) {
  //GQR-67
  const { dbLanTokUsr, setdbLanTokUsr, loginUser_data, CustomHeader, t, getItem, setItem, logoImage, topBanner, Root, effective_dates, isOnline, farmerData, navigationBarHeight } = useContext(userCreateContext);
  const { dbname, lan_id, token, user_id, carbonFlag } = loginUser_data;
  const { pageNo } = dbLanTokUsr;
  //GQR-67
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
  const [searchFarmerName, setSearchFarmerName] = useState({ label: "", value: "" });
  const [searchFarmerPhone, setSearchFarmerPhone] = useState({ label: "", value: "" });
  // const [farmerData, setFarmerData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [carbonType, setCarbonType] = useState({ label: "", value: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const filterOptionShow = async () => {
    const { openFilterSheet } = await import('../../Components/FilterSheet');
    openFilterSheet({
      options: ['farmer', 'phone', 'date', 'carbon'],
      // onchangeFilterItem: onchangeFilterItem,
      t: t,
      dropdownData: farmerData,
      filterItem: filterItem,
      setSearchFarmerName: setSearchFarmerName,
      setSearchFarmerPhone: setSearchFarmerPhone,
      searchFarmerName: searchFarmerName,
      searchFarmerPhone: searchFarmerPhone,
      title: 'Choose Status',
      // handleDatePicker: handleDatePicker,
      // handleDatePicker2: handleDatePicker2,
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
      onApply: (values) => {
        console.log('Applied Filter:', values);
        setSelected(values.filterType);
        // If you need to handle date range:
        // doSomething(values.fromDate, values.toDate);
      },
    });
  };
  const handleFilterResult = useCallback(({ filter, fromDate, toDate, farmerName, farmerPhone, sheetCarbonType }) => {
    try {
      let search_key_val = "";
      if (filter == "Farmer/Product Name") {
        search_key_val = farmerName?.label;
      } else if (filter == "PhoneNumber") {
        search_key_val = farmerPhone?.label;
      }
      setFilterItem(filter);
      setFromDate(fromDate);
      setToDate(toDate);
      setSearchFarmerName({ label: farmerName?.label, value: farmerName?.value });
      setSearchFarmerPhone({ label: farmerPhone?.label, value: farmerPhone?.value });
      setCarbonType({ label: sheetCarbonType?.label, value: sheetCarbonType?.value });
      setPage(1);
      fatchActivityListAPI(1, fromDate, toDate, search_key_val, sheetCarbonType?.value, filter);
    } catch (error) {
      console.log(error, "error")
    }
  }, []);
  const handleFilterRemove = () => {
    try {
      setFromDate("");
      setToDate("");
      setSearchFarmerName({ label: "", value: "" });
      setSearchFarmerPhone({ label: "", value: "" });
      setCarbonType({ label: "", value: "" });
      setFilterItem("");
      fatchActivityListAPI(1, "", "", "", "", "");
      setPage(1);
    } catch (error) {
      console.log(error)
    }
  }
  const fatchActivityListAPI = async (pageNo, fromDateParams, toDateParams, search_key_val, carbonTypeParams, search_key_type) => {
    try {
      setIsLoading(true);
      if (isOnline) {
        var response = await axiosGet(ROUTES.GET.LIST_USER_ACITYLIST_E({
          pageNO: pageNo,
          carbonType: carbonTypeParams == undefined ? carbonType.value : carbonTypeParams,
          userID: user_id,
          search_key: search_key_type && search_key_type !== "carbon" ? search_key_val : filterItem ? filterItem === "Farmer/Product Name" ? searchFarmerName?.label : filterItem === "PhoneNumber" ? searchFarmerPhone?.label : "" : "",
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
  const handleSPSheetShow = () => {
    try {
      if (carbonFlag == true) {
        SPSheet.show({
          component: () => (
            <CarbonActivityBottomSheet index={0} spSheet={SPSheet} navigation={navigation} options={OPTIONS_CARBON} />
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

  const ActivityCard = useCallback(memo(({ activity, index, navigation }) => {
    const status = activity?.deviation > 0 ? "active" : "pending";
    const statusColor = getStatusColor(status);
    const cardAnimation = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }).start();
    }, []);
    return (
      <Animated.View
        style={[
          styles.activityCard,
          {
            opacity: cardAnimation,
            transform: [{
              translateY: cardAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            }],
            borderLeftColor: statusColor,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("activityDetail", activity)}
        >
          {/* Header with Produce and Status */}
          <View style={styles.cardHeader}>
            <View style={styles.produceSection}>
              <View style={[styles.produceIcon, { backgroundColor: statusColor + '15' }]}>
                <Text style={styles.emoji}>{getProduceEmoji(activity?.cropName?.name)}</Text>
              </View>
              <View style={styles.produceInfo}>
                <Text style={styles.produceName}>{activity?.cropName?.name}</Text>
                <Text style={styles.plotSite}>{activity?.land_info?.plot_no}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {status?.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Farmer Information */}
          <View style={styles.farmerSection}>
            <View style={styles.infoRow}>
              <Text style={styles.label} numberOfLines={1}>{t('farmer_name')}:</Text>
              <Text style={styles.value}>{activity?.agri_user?.userName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('farmer_number')}:</Text>
              <Text style={[styles.value]}>{activity?.agri_user?.contactNumber}</Text>
            </View>
          </View>

          {/* Dates Section */}
          <View style={styles.datesSection}>
            <View style={styles.dateGrid}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>{t('Sowing')}</Text>
                <Text style={styles.dateValue}>{formatDate(activity?.actCurel?.sowing_date)}</Text>
              </View>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>{t('perf_date')}</Text>
                <Text style={styles.dateValue}>{formatDate(activity?.act_perform_date)}</Text>
              </View>
            </View>
            <View style={styles.harvestSection}>
              <Text style={styles.label}>{t('Harvesting')}:</Text>
              <Text style={styles.harvestValue}>{effective_dates(activity?.actCurel?.harvesting_date)}</Text>
            </View>
          </View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <View style={styles.deviationRow}>
              <Text style={styles.label}>{t('deviation')}:</Text>
              <Text style={[
                styles.deviationValue,
                { color: activity?.deviation > 0 ? '#EF4444' : '#10B981' }
              ]}>
                {activity?.deviation}{t('days')}
              </Text>
            </View>
          </View>

          {/* Activity Type */}
          <View style={styles.activityTypeRow}>
            <Text style={styles.label}>{t('activity_type')}:</Text>
            <Text style={styles.value}>{activity.activityType || 'Not specified'}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }), []);
  return (
    <MyErrorBoundary>
      <Root>
        <SafeAreaView style={styles.container}>
          <CustomHeader
            logoImage={logoImage}
            topBanner={topBanner}
            filterOptionShow={filterOptionShow} t={t} />
          <FlatList
            data={isLoading ? Array.from({ length: 5 }) : activityAll}
            keyExtractor={(item, index) => index?.toString()}
            renderItem={({ item, index }) =>
              isLoading ? (
                <SkeletonCardActivityList />
              ) : (
                <ActivityCard activity={item} index={index} navigation={navigation} />
              )
            }
            contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
            windowSize={5}
            removeClippedSubviews={true}
          />

          {/* Floating Action Button */}
          {/* <Animated.View
            style={[
              styles.fabContainer,
              {
                opacity: fadeAnim,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                }],
              }
            ]}
          >
            <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
              <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
          </Animated.View> */}

          {/* Bottom Navigation */}
          <PaginationNav
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            t={t}
          />
          <FloatingAction
            position="right"
            actions={getActionsActivity(t, styles, Colors)}
            color={Colors.useGreen}
            onPressItem={(name) => {
              handleSPSheetShow();
            }}
            showBackground={true}
            overlayColor="rgba(22, 17, 17, 0.35)"
            distanceToEdge={{ vertical: 80, horizontal: 25 }} />
        </SafeAreaView>
      </Root>
    </MyErrorBoundary>
  );
}
export default ActivityList;
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
    fontFamily: Fonts.SemiBold
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: 'white',
    fontSize: 28,
    fontWeight: '300',
  }
});
