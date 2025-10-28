import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  PermissionsAndroid,
  Dimensions,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import {
  inputEnquiryViewAPI,
  FarmerinputPastEnquiryListAPI,
} from '../../../config/apiHere';
import FarmerPastEnquiriesModel from './FarmerPastEnquiriesModel';
import Filter from '../../Common/FarmerFilter';
import { userCreateContext } from '../../Context/usersCreateContext';
import { Colors, Fonts } from '../../utils/Constants';
import { axiosGet } from '../../utils/api';
import { ROUTES } from '../../utils/Routes';
import AnimatedCard from '../../Components/AnimatedCard';
import SkeletonProblemCard from '../../Components/Skeleton/SkeletonProblemCard';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';

const FarmerPastEnquiries = ({ navigation }) => {
  //GQR-67
  const {
    loginUser_data,
    LoadingScreen,
    DatePickerComp,
    CustomHeader,
    t,
    onBackPress,
    getItem,
    setItem,
    logoImage,
    topBanner,
    effective_dates,
    navigationBarHeight
  } = useContext(userCreateContext);
  const { dbname, lan_id, token, user_id } = loginUser_data;
  //GQR-67
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(true);
  const [inputPastEnquiryAll, setInputPastEnquiryAll] = useState([]);
  const [filterItem, setFilterItem] = useState('');
  const [filterOption, setFilterOption] = useState(false);
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [newToDate, setnewToDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pastEnquiries, setPastEnquiries] = useState(false);
  const [pastEnquirySingle, setPastEnquirySingle] = useState(false);
  const [pastEnquiryView, setPastEnquiryView] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [result, setresult] = useState({
    qty: '',
    total: '',
    grandTotal: '',
    disTotal: '',
  });

  const onchangeFilterItem = value => {
    setFilterItem(value);
    setFilterOption(false);
  };
  const navigateToPages = async (fid, dbname, lan_id, token, user_id) => {
    // setIsLoading(true)
    const input_past_enquiry_Data = await getItem('input_past_enquiry_Data');
    const EnquiryFound = input_past_enquiry_Data.find(user => user.fid === fid);
    setPastEnquirySingle(EnquiryFound);
    const response = await inputEnquiryViewAPI(
      dbname,
      lan_id,
      token,
      user_id,
      fid,
    );
    if (response?.status == 200) {
      setPastEnquiryView(response.data.data);
      var qty = 0;
      var grandTotal = 0;
      var disTotal = 0;
      var total = 0;
      response?.data?.data.map((data, index) => {
        qty = qty + parseFloat(data.sqty);
        grandTotal = grandTotal + parseFloat(data.sgrand_total);
        disTotal = disTotal + parseFloat(data.sdiscount);
        total = total + parseFloat(data.total_samount);
      });
      setresult({
        ...result,
        qty: qty,
        total: total,
        grandTotal: grandTotal,
        disTotal: disTotal,
      });
    }
    setPastEnquiries(true);
  };
  const onPageLoad = async (fromDate='',toDate='') => {
    const response = await axiosGet(ROUTES.GET.INPUT_OUTPUT_ROUTE({ userId: user_id,fromDate:fromDate,toDate:toDate }), token, {
      information: `${dbname},${lan_id}`
    })
    if (response?.status == 200) {
      setInputPastEnquiryAll(response?.data?.data?.rows);
      setItem('input_past_enquiry_Data', response?.data?.data?.rows);
      if (route?.params != undefined) {
        navigateToPages(route.params.io_oid, dbname, lan_id, token, user_id);
      }
      setIsLoading(false);
    }
  };
  const handleDatePicker = async item => {
    const effective_date = effective_dates(item);
    setFromDate(effective_date);
    if (toDate) {
      const inputList = await FarmerinputPastEnquiryListAPI(
        dbname,
        lan_id,
        token,
        user_id,
        fromDate,
        toDate,
      );
      if (inputList?.status == 200) {
        setInputPastEnquiryAll(inputList?.data?.data?.rows);
        setItem('input_past_enquiry_Data', inputList?.data?.data?.rows);
        setIsLoading(false);
      }
    }
  };
  const handleDatePicker2 = async item => {
    const effective_date = effective_dates(item);
    setToDate(effective_date);
    if (fromDate) {
      const inputList = await FarmerinputPastEnquiryListAPI(
        dbname,
        lan_id,
        token,
        user_id,
        fromDate,
        effective_date,
      );
      if (inputList?.status == 200) {
        setInputPastEnquiryAll(inputList?.data?.data?.rows);
        setItem('input_past_enquiry_Data', inputList?.data?.data?.rows);
        setIsLoading(false);
      }
    }
  };
  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Geolocation.getCurrentPosition(data => console.log(data.coords))
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  useEffect(() => {
    requestCameraPermission();
  }, []);
  const handleBackPress = () => {
    navigation.navigate('FarmerInputList');
    return true;
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  const filterDataRemove = async () => {
    setFilterItem('');
    setFilterOption(false);
    setToDate('');
    setFromDate('');
    const inputList = await FarmerinputPastEnquiryListAPI(
      dbname,
      lan_id,
      token,
      user_id,
      '',
      '',
    );
    if (inputList?.status == 200) {
      setInputPastEnquiryAll(inputList?.data?.data?.rows);
      setItem('input_past_enquiry_Data', inputList?.data?.data?.rows);
      setIsLoading(false);
    }
  };
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    requestAnimationFrame(async () => {
      await onPageLoad();
      setRefreshing(false);
    });
  }, []);

  const filterOptionShow = useCallback(async () => {
    try {
      const { openFilterSheet } = await import('../../Components/FilterSheet');
      openFilterSheet({
        options: ['', '', 'date'],
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
        navigationBarHeight: navigationBarHeight,
        height: 210,
      });
    } catch (error) {
      console.error(error)
    }
  }, [fromDate, toDate, filterItem]);

  const handleFilterResult = useCallback(
    async ({ filter, fromDate, toDate, farmerName, farmerPhone, sheetCarbonType }) => {
      try {
       onPageLoad(fromDate, toDate)
      } catch (error) { 
        console.error(error)
      }
    },
    [],
  );
  const handleFilterRemove = () => {
    try {
      setFilterItem('');
      setFromDate('');
      setToDate('');
      setCarbonType({ label: '', value: '' });
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
      <>
        <View style={{ flex: 1, backgroundColor: Colors.background_light }}>
          {renderCustomHeader}
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
                  `${new Date(fromDate).getFullYear()}-${new Date(fromDate).getMonth() + 1
                  }-${new Date(fromDate).getDate() + 1}`,
                )
            }
          />
          {/* { <Filter
              //   title={t('past_enq')}
              filterItem={filterItem}
              filterOption={filterOption}
              setOpenToDate={setOpenToDate}
              filterOptionShow={filterOptionShow}
              onchangeFilterItem={onchangeFilterItem}
              setOpenFromDate={setOpenFromDate}
              fromDate={fromDate}
              newToDate={toDate}
              filterDataRemove={filterDataRemove}
              onlyDate={true}
            />} */}
          <FarmerPastEnquiriesModel
            setModalVisible={setPastEnquiries}
            modalVisible={pastEnquiries}
            pastEnquirySingle={pastEnquirySingle}
            pastEnquiryView={pastEnquiryView}
            qty={result}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />

          <FlatList
            data={isLoading ? Array.from({ length: 5 }) : inputPastEnquiryAll}
            renderItem={({ item, index }) =>
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
                      }>
                      <View style={styles.cardHeader}>
                        <Text style={styles.problemTitle} numberOfLines={2}>
                          {t('product_name')} :
                          {item.ioProduPrice &&
                            item.ioProduPrice.mk_product.product_name}
                        </Text>
                      </View>
                      <View style={styles.cardContent}>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>{t('name')}:</Text>
                          <Text style={styles.infoValue} numberOfLines={1}>
                            {item.users && item.users.userName}
                          </Text>
                        </View>
                        <View style={styles.cardContent}>
                          <View style={styles.infoRow}>
                            {/* <Text style={styles.infoLabel}>{t('name')}:</Text> */}
                            <Text style={styles.infoValue} numberOfLines={1}>
                              {item.users && item.users.userName}
                            </Text>
                          </View>
                          <View style={styles.infoRow}>
                            {/* <Text style={styles.infoLabel}>
                              {t('far_list_number')} :
                            </Text> */}
                            <Text style={styles.infoValue}>
                              {item.users && item.users.contactNumber}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  }
                  index={index}
                />
              )
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.green]}
                tintColor={Colors.green}
              />
            }
            keyExtractor={(item, index) => index}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContainer}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={20}
            windowSize={5}
          />
        </View>
      </>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerPastEnquiries;
const styles = StyleSheet.create({
  flatListContainer: {
    marginHorizontal: '2.5%',
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 5,
  },
  flatListItem: {
    width: '50%',
  },
  flatlistitemSearch: {
    marginBottom: 10,
  },
  plusIcon: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: '50%',
    right: 20,
    zIndex: 999,
    elevation: 5,
  },
  flatContainer: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    top: '10%',
    left: 0,
    marginHorizontal: '5%',
    width: '90%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },
  flatlistHeight: {
    height: Dimensions.get('window').height / 2.5,
  },

  flatlisttitle: {
    color: '#000',
    marginVertical: 6,
  },
  flatlistitem: {},
  title: {
    color: '#000000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  loadingScreen: {
    position: 'relative',
    top: 100,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginHorizontal: 5,
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
  infoValue: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.Medium,
    flex: 2,
    textAlign: 'right',
  },
});
