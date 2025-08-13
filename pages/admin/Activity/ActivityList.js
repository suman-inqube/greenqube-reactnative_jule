import {
    StyleSheet, Text, View, FlatList, TouchableOpacity, Keyboard, Dimensions
} from 'react-native'
import React, { useEffect, useState, useContext, useCallback } from 'react';
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
const ActivityList = ({ navigation }) => {
    //GQR-67
    const { dbLanTokUsr, setdbLanTokUsr, loginUser_data, LoadingScreen, CustomHeader, t, AlertMesg, onBackPress, getItem,
        setItem, logoImage, topBanner, Root, Toast, DeviceInfo, handlePageList, handleFilter, effective_dates, handleResultSelect, isOnline, farmerData } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id, carbonFlag } = loginUser_data;
    const { pageNo } = dbLanTokUsr;
    //GQR-67
    const { netConnection } = DeviceInfo();
    const isFocused = useIsFocused();
    const [isLoading, setIsLoading] = useState(true);
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [activityAll, setactivityAll] = useState([]);
    const [activityAllRow, setactivityAllRow] = useState([]);
    const [filterOption, setFilterOption] = useState(false);
    const [filterItem, setFilterItem] = useState("");
    const [filterName, setFilterName] = useState("");
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [newToDate, setnewToDate] = useState(new Date());
    const [openFromDate, setOpenFromDate] = useState(false)
    const [openToDate, setOpenToDate] = useState(false);
    const [fromDate, setfromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
    // const [farmerData, setFarmerData] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [fromDateFilter, setFromDateFilter] = useState('');
    const [carbonType, setCarbonType] = useState('')
    const filterOptionShow = () => {
        if (!filterOption) {
            setFilterOption(true);
        } else {
            setFilterOption(false);
        }
    }
    const onchangeFilterItem = (value) => {
        setFilterName(value);
        setFilterItem(value);
        setFilterOption(false);
        setactivityAll(activityAllRow);
        setfromDate("");
        setToDate("");
        setSearchFarmerName("");
        setSearchFarmerPhone("");
        setCarbonType("");
    }
    const handlePage = async (value) => {
        handlePageList(value, setIsLoading, token, pageNo, activityListAPI, setactivityAll, dbname, lan_id, user_id, '', fromDate, toDate, carbonType);
    }

    const handleFilterList = async (item) => {
        /*
        *(1) It is use to search by farmer's name and phone number
        *(2) It is use for filter type ('Farmer/Product Name','PhoneNumber')
        *(3) it is use for all farmer list
        *(4) it is use for all item list
        *(5) item List can't modify data
        *(6,7) it is use use selected value set 
        *(8) farmer list show and hide poup
        *(9) filter data clear all the value set  list data
        *(10) it is use set the filters search value set
        */
        handleFilter(item, filterName, farmerData, activityAllRow, setSearchFarmerPhone, setSearchFarmerName, setSearchResultsList, setactivityAll, setSearchResults);
    }

    const handleResultSelectList = async (item) => {
        const { label, value, phone } = item
        // handleResultSelect(label, value, phone, activityAll, activityListAPI, setIsLoading, setSearchResultsList, setSearchFarmerPhone, setSearchFarmerName, setSearchResults, setactivityAll)
        setSearchFarmerName(label);
        setSearchFarmerPhone(phone);
        let tempData = activityAllRow.filter(item => { return item.agri_user.contactNumber.toLowerCase().indexOf(phone.toLowerCase()) > -1 });
        setactivityAll(tempData)
        setSearchResultsList(false);
        if (tempData.length == 0) {
            Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] })
        }
    }
    const handleDatePicker = (item) => {
        const effective_date = effective_dates(item);
        setfromDate(effective_date);
        setFromDateFilter(effective_date);
    }
    const handleDatePicker2 = async (item) => {
        try {

            const effective_date = effective_dates(item);
            setToDate(effective_date)
            if (fromDateFilter) {
                const item = '';
                const response = await activityListAPI(dbname, lan_id, token, user_id, pageNo, item, fromDateFilter, effective_date)
                if (response?.status == 200) {
                    setactivityAll(response?.data?.data?.rows);
                    setItem("activity_Data", response?.data?.data?.rows);
                }
            } else {
                // MessageDialog({ title: 'Require', message: 'Please Select First data.' })
                Toast.show({ time: 3, text: t('please_date_first'), ...AlertMesg[0] })
            }

        } catch (error) {
            CrashlyticsRecordError(error, "ActivityList", "handleDatePicker2");

        }
    }
    const navigateToPages = useCallback(async (pageName, uact_id) => {
        navigation.navigate(pageName, uact_id);
    }, []);
    const fatchActivityListAPI = async (dbName, languageId, token, supervisorId, pageNo, searchItem = '', from_date = '', to_date = '', carbonType = '') => {
        try {
            setIsLoading(true);
            if (isOnline) {
                var response = await activityListAPI(dbName, languageId, token, supervisorId, pageNo, searchItem, from_date, to_date, carbonType);
                if (response?.status == 200) { await setItem('activityList', response); }
            } else {
                var response = await getItem('activityList');
            }
            console.log('act=', response?.data?.data?.rows);
            if (response?.status == 200) {
                if (response.data.data.count != 0) {
                    const totalPage = Math.ceil(response.data.data.count / 20)
                    setdbLanTokUsr({ ...dbLanTokUsr, totalPage: totalPage });
                    setactivityAll(response?.data?.data?.rows);
                    if (carbonType == "") {
                        setactivityAllRow(response?.data?.data?.rows);
                    }
                    await setItem("activity_Data", response?.data?.data?.rows);
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                    Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] })
                }
            }

        } catch (error) {
            CrashlyticsRecordError(error, "ActivityList", "fatchActivityListAPI");

        }
    }
    const onPageLoad = async () => {
        setdbLanTokUsr({ ...dbLanTokUsr, pageNo: 1 });
        fatchActivityListAPI(dbname, lan_id, token, user_id, 1);
    };
    const filterDataRemove = () => {
        setFilterItem("");
        setCarbonType("")
        setFilterOption(false);
        setactivityAll(activityAllRow);
        setSearchResultsList(false);
    }
    const HandlerGoBack = () => {
        setFilterItem("");
        setFilterOption(false);
        setSearchFarmerName("");
        setSearchFarmerPhone("");
        setSearchResultsList(false);
        setfromDate("");
        setToDate("");
        // setactivityAll([]);
        // setactivityAllRow([]);
        navigation.navigate('Dashboard');
    }
    const handleBackPress = () => {
        setFilterItem("");
        setFilterOption(false);
        setSearchFarmerName("");
        setSearchFarmerPhone("");
        setSearchResultsList(false);
        setfromDate("");
        setToDate("");
        // setactivityAll([]);
        // setactivityAllRow([]);
        navigation.navigate('Dashboard');
        return true;
    }
    useEffect(() => {
        try {
            if (isFocused) {
                if (fromDate == "" && toDate == "" && searchFarmerName == "" && searchFarmerPhone == "" && pageNo == 1) {
                    onPageLoad();
                }
                onBackPress(handleBackPress);

            }
        } catch (error) {
            CrashlyticsRecordError(error, "ActivityList", "useEffect");
        }
    }, [isFocused]);
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
                navigation.navigate('activityReport')
            }
        } catch (error) {
            CrashlyticsRecordError(error, "ActivityList", "handleSPSheetShow");

        }

    }
    useEffect(() => {
        if (isFocused) {
            const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => { setKeyboardVisible(true); });
            const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => { setKeyboardVisible(false); });
            return () => { keyboardDidHideListener.remove(); keyboardDidShowListener.remove() };
        }
    }, [isFocused]);
    const onChangeCarbonType = (_item) => {
        const { label, value } = _item
        setCarbonType(value)
        fatchActivityListAPI(dbname, lan_id, token, user_id, 1, '', '', '', value);
    }
    return (
      <MyErrorBoundary>
        <Root>
          <CustomHeader
            path="Dashboard"
            HandlerGoBack={HandlerGoBack}
            logoImage={logoImage}
            topBanner={topBanner}
          />
          <View style={{flex: 1}}>
            <WidgetsSide
              location={'ActivityReport'}
              title={t('report_activity')}
              onPress={() => handleSPSheetShow()}
            />
            {openFromDate && (
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
            <Filter
              filterItem={filterItem}
              filterOption={filterOption}
              setOpenToDate={setOpenToDate}
              fromDate={fromDate}
              newToDate={toDate}
              setOpenFromDate={setOpenFromDate}
              filterOptionShow={filterOptionShow}
              onchangeFilterItem={onchangeFilterItem}
              onChangeText={item => handleFilterList(item)}
              title={t('my_activities')}
              filterDataRemove={filterDataRemove}
              FarmerProductNameValue={searchFarmerName}
              FarmerProductPhoneValue={searchFarmerPhone}
              carbonFlag={carbonFlag}
              onChangeCarbonType={onChangeCarbonType}
              carbonTypeVal={carbonType}
              dataActivity={[
                {label: 'Carbon ', value: 'carbon_activity'},
                {label: 'Non-Carbon ', value: 'user_activity'},
              ]}
            />
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
                    style={
                      searchResults.length > 8 ? styles.flatlistHeight : ''
                    }
                    data={searchResults}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        onPress={() => handleResultSelectList(item)}
                        style={styles.flatlistitem}>
                        <Text style={[styles.flatlisttitle, {color: 'black'}]}>
                          {filterName == 'PhoneNumber'
                            ? item.phone
                            : item.label}
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
              renderItem={({item, index}) => (
                <TouchableOpacity
                  style={styles.wrapper}
                  onPress={() => navigateToPages('activityDetail', item)}>
                  <View style={styles.activityListContainer}>
                    <View style={styles.activityListItem}>
                      <Text style={styles.title}>
                        {t('farmer_name').substring(0, 10)} :{' '}
                        {item?.agri_user?.userName.substring(0, 4) + '...'}
                      </Text>
                      <Text style={styles.title}>
                        {t('addcrop_plot')} :{' '}
                        {item?.land_info?.plot_no.substring(0, 5) + '...'}
                      </Text>
                      <Text style={styles.title}>
                        {t('perf_date')} :{' '}
                        {item?.act_perform_date?.substring(0, 4) + '...'}
                      </Text>
                      <Text style={styles.title}>
                        {t('Sowing')} :{' '}
                        {item?.actCurel?.sowing_date?.substring(0, 10)}
                      </Text>
                    </View>
                    <View style={styles.activityListItem}>
                      <Text style={styles.title}>
                        {t('farmer_number')} :{' '}
                        {item?.agri_user?.contactNumber.substring(0, 7) + '...'}
                      </Text>
                      <Text style={styles.title}>
                        {t('crop_name')} :{' '}
                        {item?.cropName?.name.substring(0, 7) + '..'}
                      </Text>
                      <Text style={styles.title}>
                        {t('deviation')} : {item?.deviation}
                        {t('days')}
                      </Text>
                      <Text style={styles.title}>
                        {t('Harvesting')} :{' '}
                        {item?.actCurel?.harvesting_date?.substring(0, 10)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.title}>
                    {t('cycle_start_date')} : {item?.cycle_start_date}
                  </Text>
                  <Text style={styles.title}>
                    {item?.typeActivity
                      ? `${t('activity_type')} : ${
                          item.typeActivity.categoryName
                        }`
                      : ''}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.prevNextPage}>
              <TouchableOpacity onPress={() => handlePage('previous')}>
                <Text style={styles.title}>{t('prev_page')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handlePage('next')}>
                <Text style={styles.title}>{t('next_page')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Root>
      </MyErrorBoundary>
    );
}
export default ActivityList;
const styles = StyleSheet.create({
    wrapper: {
        borderColor: '#efe9e9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
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
        fontSize: 14
    },
    prevNextPage: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        position: 'relative',
        bottom: 0
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
