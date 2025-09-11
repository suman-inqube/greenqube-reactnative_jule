import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Keyboard,
  RefreshControl,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import ViewPast from './ViewPast';
import {InsuranceListAPI} from '../../../config/apiHere';
import {userCreateContext} from '../../Context/usersCreateContext';
import {Colors, Fonts} from '../../utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';

const InsuranceViewPastRequested = ({setActiveBtn}) => {
  //GQR-67
  const {
    loginUser_data,
    LoadingScreen,
    t,
    Toast,
    AlertMesg,
    Root,
    farmerData,
    effective_dates,
    CustomHeader,
    logoImage,
    topBanner,
    navigationBarHeight,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-67
  const [filterItem, setFilterItem] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insuranceList, setInsuranceList] = useState([]);
  const [searchFarmerName, setSearchFarmerName] = useState({
    label: '',
    value: '',
  });
  const [searchFarmerPhone, setSearchFarmerPhone] = useState({
    label: '',
    value: '',
  });
  const [modalVisibleData, setModalVisibleData] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const onPageLoad = async (
    farmer_id = '',
    farmer_mobile = '',
    from_date = '',
    to_date = '',
  ) => {
    setIsLoading(true);
    const response = await InsuranceListAPI(
      dbname,
      lan_id,
      token,
      user_id,
      farmer_id,
      farmer_mobile,
      from_date,
      to_date,
    );
    if (response?.status == 200) {
      if (response.data.data.rows.length == 0) {
        Toast.show({text: `${t('no_data_found')}`, ...AlertMesg[0]});
      }
      setIsLoading(false);
      setInsuranceList(response.data.data.rows);
    }
  };
  useEffect(() => {
    onPageLoad('', '', '', '');
  }, []);
  const handleSetModalVisible = useCallback(item => {
    setModalVisible(true);
    setModalVisibleData(item);
  }, []);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    requestAnimationFrame(async () => {
      // await onPageLoad("refreshing");
      await onPageLoad('', '', '', '');
      setRefreshing(false);
    });
  }, []);
  const filterOptionShow = useCallback(async () => {
    const {openFilterSheet} = await import('../../Components/FilterSheet');
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
      // carbonFlag: carbonFlag,
      // CARBON_TYPE: CARBON_TYPE,
      // carbonType: carbonType,
      navigationBarHeight: navigationBarHeight,
      height: 200,
    });
  }, [filterItem, searchFarmerName, searchFarmerPhone, fromDate, toDate]);
  const handleFilterResult = useCallback(
    async ({
      filter,
      fromDate,
      toDate,
      farmerName,
      farmerPhone,
      sheetCarbonType,
    }) => {
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
        onPageLoad(farmerName?.value, farmerPhone?.label, fromDate, toDate);
      } catch (error) {}
    },
    [filterItem, fromDate, toDate, searchFarmerName, searchFarmerPhone],
  );
  const handleFilterRemove = () => {
    try {
      setFromDate('');
      setToDate('');
      setSearchFarmerName({label: '', value: ''});
      setSearchFarmerPhone({label: '', value: ''});
      setFilterItem('');
      onPageLoad();
    } catch (error) {
      console.log(error);
    }
  };
  const renderCustomHeader = useMemo(
    () => (
      <CustomHeader
        path="Dashboard"
        logoImage={logoImage}
        topBanner={topBanner}
        filterOptionShow={filterOptionShow}
      />
    ),
    [filterOptionShow],
  );
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        {renderCustomHeader}
        <View style={{flex: 1, backgroundColor: Colors.background_light}}>
          {insuranceList.length != 0 ? (
            <ViewPast
              setModalVisible={setModalVisible}
              modalVisible={modalVisible}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}
              modalVisibleData={modalVisibleData}
            />
          ) : null}
          {isLoading ? (
            <View style={styles.loadingScreen}>
              <LoadingScreen />
            </View>
          ) : (
            ''
          )}
          <FlatList
            showsVerticalScrollIndicator={false}
            data={insuranceList}
            renderItem={({item}) => {
              var mydate = new Date(
                item.agri_user.CreateDateTime.split('T')[0],
              );
              return (
                <TouchableOpacity
                  style={styles.flatListContainer}
                  onPress={() => handleSetModalVisible(item)}>
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
                        {t('plot_to_be_insured')}:{' '}
                      </Text>
                      <Text style={styles.value}>{item.ins_plots.length}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.label}>{t('farmer_reg_nm')} :</Text>
                      <Text style={styles.value}>
                        {item.agri_user.userName}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.label}>{t('date')} : </Text>

                      <Text style={styles.value}>
                        {mydate.toString().substring(4, 15)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>{t('far_list_number')}: </Text>
                      <Text style={styles.value}>
                        {item.agri_user.contactNumber}
                      </Text>
                    </View>
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
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};

export default InsuranceViewPastRequested;

const styles = StyleSheet.create({
  main: {
    // flex: 1,
    backgroundColor: Colors.containerGreen,
    marginHorizontal: '3%',
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // marginBottom: 10,
  },
  container: {
    flex: 1,
  },
  flatListContainer: {
    marginHorizontal: '2.5%',
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
    // paddingHorizontal: 5,
    // paddingHorizontal: 10,
  },
  detailRow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    // paddingHorizontal: 5,
    // paddingHorizontal: 10,
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
});
