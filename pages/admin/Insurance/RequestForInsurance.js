import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Keyboard,
} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import {loanRouteFarmerListAPI} from '../Loan/LoanAPI_copy';
import {
  problemPlotAgainstFarmerAPI,
  problemProduceAgainstPlotAPI,
  InsuranceAddAPI,
} from '../../../config/apiHere';
import CheckBoxComp from '../../Common/CheckBoxComp';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

const RequestForInsurance = ({}) => {
  const navigation = useNavigation();

  //GQR-67
  const {
    t,
    loginUser_data,
    InputTextForm,
    ButtonForm,
    AlertMesg,
    Root,
    Toast,
    CustomHeader,
    logoImage,
    topBanner,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-67
  const [isLoading, setIsLoading] = useState(true);
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [farmerList, setFarmerList] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [farmerID, setfarmerID] = useState('');
  const [farmerData, setFarmerData] = useState({});
  const [plotSite, setPlotSite] = useState([]);
  const [isChecked, setIsChecked] = useState({});
  const [nameVarityStartEnd, setNameVarityStartEnd] = useState([]);
  // const [pickPlot, setPickPlot] = useState([])
  const onPageLoad = async () => {
    setIsLoading(true);
    const response = await loanRouteFarmerListAPI(
      dbname,
      lan_id,
      token,
      user_id,
    );
    if (response?.status == 200) {
      setIsLoading(false);
      setFarmerList(response.data.data.rows);
    }
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  const handleSearch = text => {
    setSearchFarmerName(text);
    setSearchFarmerPhone('');
    setNameVarityStartEnd([]);
    setIsChecked([]);
    setPlotSite([]);
    if (farmerList.length !== 0) {
      const result = farmerList.filter(item =>
        item.userName.toLowerCase().includes(text.toLowerCase()),
      );
      if (result) {
        setSearchResults(result);
      }
    }
    if (text == '') {
      setSearchResultsList(false);
    } else {
      setSearchResultsList(true);
    }
  };
  const handleResultSelect = async item => {
    setSearchFarmerPhone(item.contactNumber);
    setSelectedName(item.userName);
    setSearchFarmerName(item.userName);
    setSearchResults([]);
    setfarmerID(item.user_id);
    setSearchResultsList(false);
    setFarmerData(item);
    const plotSiteApi = await problemPlotAgainstFarmerAPI(
      dbname,
      lan_id,
      token,
      item.user_id,
    );
    if (plotSiteApi) {
      const dataArray = [];
      const VarityStartArr = [];
      const isCheck = [];
      plotSiteApi.data.data.map((element, index) => {
        dataArray.push({
          value: element.rel_id,
          label: element.plot_no,
        });
        VarityStartArr.push({
          plot_id: '',
          plot_no: '',
          name: '',
          varity: '',
          cycleStarts: '',
          cycleEnd: '',
          production_process: '',
          land_rel_id: '',
        });
        isCheck.push({isCheck: ''});
      });
      setIsChecked(isCheck);
      setNameVarityStartEnd(VarityStartArr);
      setPlotSite(dataArray);
    }
  };
  const handlePlotCheck = async (value, label, index) => {
    const response = await problemProduceAgainstPlotAPI(
      dbname,
      lan_id,
      farmerID,
      value,
    );
    const isCheckedValue = [...isChecked];
    if (isChecked[index].isCheck == '') {
      isCheckedValue[index] = {isCheck: value};
      setIsChecked(isCheckedValue);
      if (response.status === 200) {
        const {
          land_rel_id,
          crop_name,
          crop_variety,
          sowing_date,
          harvesting_date,
          farmer_production_system,
        } = response.data.data;
        const inputdata = [...nameVarityStartEnd];
        inputdata[index] = {
          plot_id: value,
          plot_no: crop_name.plot_no,
          name: crop_name.name,
          varity: crop_variety.name,
          cycleStarts: sowing_date,
          cycleEnd: harvesting_date,
          production_process: farmer_production_system.name,
          land_rel_id: land_rel_id,
        };
        setNameVarityStartEnd(inputdata);
      }
    } else {
      isCheckedValue[index] = {isCheck: ''};
      setIsChecked(isCheckedValue);
    }
  };

  const handleSave = async () => {
    console.log('log');
    Keyboard.dismiss();
    const checkValue = [];
    Object.values(isChecked).map((data, index) => {
      if (data.isCheck != '') {
        checkValue.push(data.isCheck);
      }
    });
    if (searchFarmerName == '') {
      Toast.show({text: `${t('please_enter_farmer_name')}`, ...AlertMesg[0]});
    } else if (checkValue.length < 1) {
      Toast.show({text: `${t('please_select_plot')}`, ...AlertMesg[0]});
    } else {
      const formData = new FormData();
      formData.append('user_id', farmerData.user_id);
      formData.append('plot_id', checkValue);
      const addInsurance = await InsuranceAddAPI(
        dbname,
        lan_id,
        token,
        user_id,
        formData,
      );
      console.log('addInsurance', addInsurance);
      if (addInsurance.status === 200) {
        Toast.show({text: t('Data_submitted_successfully'), ...AlertMesg[0]});
        setTimeout(() => {
          setActiveBtn(2);
        }, 2000);

        navigation.navigate('InsuranceViewPastRequested', {action: 'addData'});
      }
      setIsLoading(false);
    }
  };

  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <Root>
          <CustomHeader
            path="Dashboard"
            logoImage={logoImage}
            topBanner={topBanner}
          />
          <SafeAreaView showsVerticalScrollIndicator={false}>
            {/* {searchResultsList && searchResultsList ? (
              <View style={styles.flatContainer1}>
                <FlatList
                  style={searchResults.length > 8 ? styles.flatlistHeight : ''}
                  data={searchResults}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      onPress={() => handleResultSelect(item)}
                      style={styles.flatlistitem}>
                      <Text style={styles.flatlisttitle}>{item.userName}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index}
                />
              </View>
            ) : (
              ''
            )} */}
          </SafeAreaView>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{backgroundColor: Colors.background_light}}>
            <View style={styles.container}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('farmer_information')}</Text>
                <View style={styles.infoRow}>
                  <View style={styles.infoTextContainer}>
                    <InputTextForm
                      label={t('farmer_name')}
                      value={searchFarmerName}
                      onChangeText={farmerName => handleSearch(farmerName)}
                      // iconName:person
                      // iconSize={20}
                    />
                    {searchResultsList && searchResults.length > 0 && (
                      <View style={styles.searchResultsContainer}>
                        <FlatList
                          style={
                            searchResults.length > 8
                              ? styles.flatlistHeight
                              : {}
                          }
                          data={searchResults}
                          renderItem={({item}) => (
                            <TouchableOpacity
                              onPress={() => handleResultSelect(item)}
                              style={styles.flatlistitem}>
                              <Text style={styles.flatlisttitle}>
                                {item.userName}
                              </Text>
                            </TouchableOpacity>
                          )}
                          keyExtractor={(item, index) => index.toString()}
                        />
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="phone" size={20} color="#4a8c29" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>{t('farmer_number')}</Text>
                    <Text style={styles.infoValue}>
                      {farmerData.contactNumber}
                    </Text>
                  </View>
                  {/* <InputTextForm
                label={t('farmer_number')}
                value={farmerData.contactNumber}
                keyboardType={'numeric'}
                editable={false}
              /> */}
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="credit-card" size={20} color="#4a8c29" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>{t('adhar_no')}</Text>
                    {farmerData.aadhar_number ? (
                      <Text style={styles.infoValue}>
                        {farmerData.aadhar_number}
                      </Text>
                    ) : (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>N/A</Text>
                      </View>
                    )}
                    <Text style={styles.infoValue}>
                      {farmerData.aadhar_number}
                    </Text>
                  </View>
                </View>
                {/* <InputTextForm
                  label={t('adhar_no')}
                  value={farmerData.aadhar_number}
                  editable={false}
                /> */}
                <View style={styles.infoRow}>
                  <MaterialIcons
                    name="card-membership"
                    size={20}
                    color="#4a8c29"
                  />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>{t('kcc_no')}</Text>
                    {farmerData.kcc_number ? (
                      <Text style={styles.infoValue}>
                        {farmerData.kcc_number}
                      </Text>
                    ) : (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>N/A</Text>
                      </View>
                    )}
                    <Text style={styles.infoValue}>
                      {farmerData.kcc_number}
                    </Text>
                    {/* <InputTextForm
                label={t('kcc_no')}
                value={farmerData.kcc_number}
                editable={false}
              /> */}
                  </View>
                </View>
              </View>

              <View style={styles.PlotSiteList}>
                <Text style={styles.cardTitlePlot}>
                  {t('select_plot')}
                  <Text style={styles.requiredStar}> *</Text>
                </Text>
                <View style={styles.plotsContainer}>
                  {plotSite &&
                    plotSite.map((data, index) => {
                      const {label, value} = data;
                      return (
                        <View key={index} style={styles.plotItem}>
                          <CheckBoxComp
                            arrayKey={index}
                            isChecked={isChecked[index].isCheck}
                            title={label}
                            onCheckBox={() =>
                              handlePlotCheck(value, label, index)
                            }
                          />
                        </View>
                      );
                    })}
                </View>
              </View>
              <View style={styles.plotContainer}>
                {nameVarityStartEnd.map((data, index) => {
                  if (
                    isChecked[index].isCheck != '' &&
                    isChecked[index].isCheck == data.plot_id
                  ) {
                    return (
                      <View key={index} style={styles.plotContainerItem}>
                        <View>
                          <Text style={styles.infoValue}>
                            {t('addcrop_cropname')}
                          </Text>
                          <Text style={styles.infoValue}>
                            {t('addcrop_cropvariety')}
                          </Text>
                          <Text style={styles.infoValue}>
                            {t('showing_date')}
                          </Text>
                          <Text style={styles.infoValue}>
                            {t('harvesting_date_auto_calculated')}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.infoLabel}>
                            :{data.name.substring(-1, 15)}
                          </Text>
                          <Text style={styles.infoLabel}>
                            :{data.varity.substring(-1, 15)}
                          </Text>
                          <Text style={styles.infoLabel}>
                            :{data.cycleStarts}
                          </Text>
                          <Text style={styles.infoLabel}>
                            :{data.cycleEnd.substring(0, 10)}
                          </Text>
                        </View>
                      </View>
                    );
                  }
                })}
              </View>
            </View>
          </ScrollView>
          <ButtonForm
            label={t('submit')}
            onPress={handleSave}
            iconName="check-circle"
            iconColor="#fff"
            iconSize={30}
            loading={isLoading}
          />
        </Root>
      </>
    </FarmerDrawerScreenWrapper1>
  );
};

export default RequestForInsurance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
  },
  idcontainer: {
    marginVertical: 10,
    backgroundColor: '#FFF',
    elevation: 2,
    borderRadius: 12,
    padding: 10,
    marginHorizontal: '3%',
  },
  idItemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  idItem: {
    padding: 10,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idImage: {
    width: 60,
    height: 60,
  },
  flatContainer1: {
    backgroundColor: '#FFF',
    width: '80%',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 5,
    zIndex: -999,
  },
  flatlisttitle: {
    color: '#000',
    marginVertical: 8,
    fontSize: 16,
  },
  flatlistitem: {padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee'},
  plotContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 5,
    marginHorizontal: '4%',
    marginBottom: 10,
  },
  plotContainerItem: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',

    borderRadius: 8,
    padding: 5,
  },
  plotText: {
    color: '#000',
    marginVertical: 4,
  },
  cardTitle: {
    fontSize: 18,
    // fontWeight: '600',
    color: Colors.borderGreen,
    // marginLeft: 5,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
  },
  PlotSiteList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: '5%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: '3%',
  },
  flatContainer: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    bottom: '100%',
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
  plotTitle: {
    color: '#000',
    marginBottom: 10,
    color: '#FF0000',
  },
  text: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  loadingScreen: {
    position: 'absolute',
    top: '60%',
    zIndex: 999,
    left: '45%',
  },
  xMarkImage: {
    width: 20,
    height: 20,
    margin: 5,
  },
  clickAddMorePlots: {
    backgroundColor: Colors.subBtn,
    marginHorizontal: 35,
    paddingVertical: 15,
    marginVertical: 20,
    borderRadius: 20,
  },
  clickAddMorePlotsTitle: {
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  /////////////

  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: '5%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: '3%',
  },
  cardTitlePlot: {
    fontSize: 16,
    // fontWeight: '600',
    color: Colors.borderGreen,
    // marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  plotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  plotItem: {
    width: '50%', // Approximately 3 items per row with some spacing
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 2,
  },
  emptyText: {
    color: '#ff0000',
    marginLeft: 6,
    fontSize: 13,
    fontFamily: Fonts.SemiBold,
  },
  requiredStar: {
    color: 'red',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  searchResultsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
    elevation: 3,
    zIndex: 1000, // Ensure it appears above other elements
  },
});
