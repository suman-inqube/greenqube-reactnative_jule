import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import Filter from '../../Common/FarmerFilter';
import ViewPast from './FarmerViewPast';
import {FarmerInsuranceListAPI} from '../../../config/apiHere';
import {userCreateContext} from '../../Context/usersCreateContext';
import {Colors, Fonts} from '../../utils/Constants';
import {Marquee} from '@animatereactnative/marquee';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import ListCard from '../../Components/ListCard';

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

const FarmerInsuViewPastRequested = () => {
  //GQR-67
  const {
    loginUser_data,
    FormsTitle,
    effective_dates,
    LoadingScreen,
    onBackPress,
    CustomHeader,
    DatePickerComp,
    t,
    getItem,
    Root,
    logoImage,
    topBanner,
    navigationBarHeight,
    Toast,
    AlertMesg,
  } = useContext(userCreateContext);
  const navigation = useNavigation();

  const {dbname, lan_id, token, owner, user_id} = loginUser_data;
  //GQR-67
  const [filterOption, setFilterOption] = useState(false);
  const [filterItem, setFilterItem] = useState('');
  const [filterName, setFilterName] = useState('');
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [newToDate, setnewToDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  // const [fromDate, setfromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insuranceList, setInsuranceList] = useState([]);
  const [insuranceListRow, setInsuranceListRow] = useState([]);
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [modalVisibleData, setModalVisibleData] = useState({});
  const [farmerData, setfarmerData] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const route = useRoute();

  // const filterOptionShow = () => {
  //   if (!filterOption) {
  //     setFilterOption(true);
  //   } else {
  //     setFilterOption(false);
  //   }
  // };
  const onchangeFilterItem = value => {
    setSearchFarmerPhone('');
    setSearchFarmerName('');
    setFilterName(value);
    setFilterItem(value);
    setFilterOption(false);
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

  const onPageLoad = async (fromDate = '', toDate = '') => {
    setIsLoading(true);
    const response = await FarmerInsuranceListAPI(
      dbname,
      lan_id,
      token,
      user_id,
      '',
      '',
    );

    if (response?.status == 200) {
      setIsLoading(false);
      setInsuranceList(response?.data?.data?.rows);
      setInsuranceListRow(response?.data?.data?.rows);
    }
  };
  const filterDataRemove = async () => {
    setFilterItem('');
    setFilterOption(false);
    setToDate('');
    setfromDate('');
    const response = await FarmerInsuranceListAPI(
      dbname,
      lan_id,
      token,
      user_id,
      '',
      '',
    );
    if (response?.status == 200) {
      setIsLoading(false);
      setInsuranceList(response?.data?.data?.rows);
      setInsuranceListRow(response?.data?.data?.rows);
    }
  };
  const filterfromAndToDate = () => {
    if (fromDate != '' && toDate != '') {
      let tempData = insuranceList.filter(item => {
        return (
          item.agri_user.CreateDateTime.slice(0, 10) >= fromDate &&
          item.agri_user.CreateDateTime.slice(0, 10) <= toDate
        );
      });
      setInsuranceList(tempData);
    }
  };
  useEffect(() => {
    if (route?.params?.action === 'addData') {
      Toast.show({text: t('Data_submitted_successfully'), ...AlertMesg[0]});

      onPageLoad('', '');
    }
  }, [route?.params]);
  useEffect(() => {
    filterfromAndToDate();
  }, [fromDate, toDate]);
  useEffect(() => {
    setInsuranceList(insuranceListRow);
  }, [filterName]);
  useEffect(() => {
    onPageLoad();
  }, []);
  const handleSetModalVisible = item => {
    setModalVisible(true);
    setModalVisibleData(item);
  };
  const HandlerGoBack = () => navigation.navigate('FarmerDashboard');
  const renderCustomHeader = useMemo(
    () => <CustomHeader t={t} filterOptionShow={filterOptionShow} />,
    [filterOptionShow],
  );
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        <View style={styles.mainContainer}>
          {renderCustomHeader}
          {/* <View style={{}}>
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
          </View> */}
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
          {/* <View style={{marginVertical: 10}}>
            <Filter
              filterItem={filterItem}
              filterOption={filterOption}
              setOpenToDate={setOpenToDate}
              fromDate={fromDate}
              newToDate={toDate}
              setOpenFromDate={setOpenFromDate}
              filterOptionShow={filterOptionShow}
              onchangeFilterItem={onchangeFilterItem}
              onChangeText={item => handleFilter(item)}
              FarmerProductNameValue={searchFarmerName}
              FarmerProductPhoneValue={searchFarmerPhone}
              filterDataRemove={filterDataRemove}
              onlyDate={true}
            />
          </View> */}
          {isLoading ? (
            <View style={styles.loadingScreen}>
              <LoadingScreen />
            </View>
          ) : (
            ''
          )}
          <FlatList
            data={insuranceList}
            renderItem={({item, index}) => {
              var mydate = new Date(
                item.agri_user.CreateDateTime.split('T')[0],
              );

              const cardItems = [
                {
                  label: t('farmer_reg_nm'),
                  value: item.agri_user.userName,
                },
                {
                  label: t('date'),
                  value: mydate.toString().substring(4, 15),
                },

                {
                  label: t('far_list_number'),
                  value: item.agri_user.contactNumber,
                },
              ];

              return (
                <ListCard
                  onPress={() => handleSetModalVisible(item)}
                  title={`${t('plot_to_be_insured')}: ${item.ins_plots.length}`}
                  items={cardItems}
                  index={index}
                  borderColor={Colors.borderGreen}
                  animationDelay={150}
                />
              );
            }}
            keyExtractor={(item, index) => index}
          />
        </View>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerInsuViewPastRequested;

const styles = StyleSheet.create({
  mainContainer: {backgroundColor: Colors.pageBackground, flex: 1},

  main: {
    flex: 1,
    backgroundColor: Colors.containerGreen,
    marginHorizontal: '3%',
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
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
    color: Colors.useGreen,
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
  titleRe: {
    fontSize: 13,
    color: Colors.text,
    marginLeft: 5,
    fontFamily: 'Poppins-Regular',
    paddingBottom: 5,
  },
  titlePen: {
    fontSize: 13,
    color: '#a66607ff',
    marginLeft: 5,
    fontFamily: 'Poppins-SemiBold',
    paddingBottom: 5,
  },
  titleApp: {
    fontSize: 13,
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
  //////////////////////////////////////////////////
  //   container: {
  //     marginBottom: 450,
  //   },
  //   flatListContainer: {
  //     marginHorizontal: '3%',
  //     flexDirection: 'row',
  //     backgroundColor: '#FFF',
  //     padding: 10,
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
  //     top: 200,
  //     right: 20,
  //     zIndex: 999,
  //   },
  //   flatContainer: {
  //     backgroundColor: '#ffffff',
  //     position: 'absolute',
  //     zIndex: 999,
  //     bottom: '100%',
  //     left: 0,
  //     marginHorizontal: '5%',
  //     width: '90%',
  //     elevation: 10,
  //     borderRadius: 10,
  //     padding: 10,
  //   },
  //   flatlisttitle: {
  //     padding: 10,
  //     color: '#000',
  //   },
  //   flatlistHeight: {
  //     height: Dimensions.get('window').height / 2.5,
  //   },
  //   text: {
  //     color: '#000',
  //     fontSize: 14,
  //     marginVertical: 3,
  //   },
  //   loadingScreen: {
  //     position: 'relative',
  //     top: 100,
  //   },
});
