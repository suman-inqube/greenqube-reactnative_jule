import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import React, {useState, useContext} from 'react';
import HeadDropDown from './HeadDropDown';
import {useFocusEffect} from '@react-navigation/native';
import {
  farmaccountsIncomeListAPI,
  problemPlotAgainstFarmerAPI,
  problemProduceAgainstPlotAPI,
  farmIncomeExpenceSaveAPI,
} from '../../../config/apiHere';
import HarvestedModel from '../../Common/HarvestedModel';
import {CrashlyticsRecordError} from '../../Crashlytics/CrashlyticsRecordError';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const AddIcome = ({navigation}) => {
  //GQR-67
  const {
    loginUser_data,
    DropdownForm,
    CustomHeader,
    t,
    AlertMesg,
    onBackPress,
    setItem,
    logoImage,
    topBanner,
    Root,
    Toast,
    FormsTitle,
    InputTextForm,
    DatePickerComp,
    getItem,
    ButtonFormBottom,
    effective_dates,
    farmerData,
    ButtonForm,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id, owner} = loginUser_data;
  //GQR-67
  const [currency, setcurrency] = useState('');
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [searchFarmerName, setSearchFarmerName] = useState();
  const [searchFarmerPhone, setSearchFarmerPhone] = useState();
  const [searchResults, setSearchResults] = useState([]);
  // const [farmerData, setFarmerData] = useState([]);
  const [plotAll, setplotAll] = useState([]);
  const [showingMenu, setShowingMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [nameVarityStartEnd, setNameVarityStartEnd] = useState({
    name: '',
    varity: '',
  });
  const [saveData, setSaveData] = useState({
    land_rel_id: '',
    crop_name_id: '',
    sowing_date: '',
    harvesting_date: '',
    createdBy: '',
    type: 'cost_production',
    plot_size: '',
    grand_total: '',
    expense_total: '',
    cost_head: '',
  });
  const [farmerID, setfarmerID] = useState();
  const [InComeAll, setInComeAll] = useState([]);
  const [isIndex, setIndex] = useState(0);
  const [data, setData] = useState([
    {type: 'cost_production', cat_id: '', amount: '', date: ''},
  ]);
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [fromDate, setfromDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const addMoreExpense = () => {
    setIndex(isIndex + 1);
    setData([
      ...data,
      {type: 'cost_production', cat_id: '', amount: '0', date: ''},
    ]);
  };
  const handleChangeAddExpense = (index, text, name) => {
    const values = [...data];
    values[index][name] = text;
    setData(values);
  };
  const handleChangeAddCatID = (index, text, name) => {
    const values = [...data];
    values[index][name] = text.value;
    setData(values);
  };
  const handleChangeAddDate = (index, text, name) => {
    const values = [...data];
    values[index][name] = text;
    setData(values);
  };
  const handleDatePicker = item => {
    const effective_date = effective_dates(item);
    setfromDate(effective_date);
    handleChangeAddDate(isIndex, effective_date, 'date');
  };
  function handleClear() {
    setSearchFarmerName('');
    setSearchFarmerPhone('');
    setData([{type: 'cost_production', cat_id: '', amount: '', date: ''}]);
    setplotAll([]);
    setShowingMenu(false);
    setInComeAll([]);
    setfromDate('');
  }

  const onPageLoad = async () => {
    const curr = await getItem('currency');
    setcurrency(curr);
    handleClear();
    setIsLoading(false);

    // if (loginUser_data) {
    //     const dbName = loginUser_data.dbname;
    //     const languageId = loginUser_data.lan_id;
    //     const token = loginUser_data.token;
    //     const supervisorId = loginUser_data.user_id;
    //     setdbLanTokUsr({
    //         ...dbLanTokUsr,
    //         dbName: dbName,
    //         languageId: languageId,
    //         token: token,
    //         supervisorId: supervisorId
    //     })

    //     const response = await farmerByNameAPI(dbName, languageId, token, supervisorId)
    //     if (response) {
    //         const dataArray = [];
    //         response.data.data.rows.forEach(element => {
    //             dataArray.push({
    //                 value: element.user_id,
    //                 label: element.userName,
    //                 phone: element.contactNumber,
    //             });
    //         });
    //         setFarmerData(dataArray)
    //     }
    // }
  };
  useFocusEffect(
    React.useCallback(() => {
      onPageLoad();
      onBackPress(() => {
        navigation.navigate('FarmIncomeExpenseList');
        return true;
      });
    }, []),
  );
  const handleResultSelect = async (name, currentfarmerId, phone) => {
    setSearchResultsList(false);
    setSearchFarmerPhone(phone);
    setSearchFarmerName(name);
    setfarmerID(currentfarmerId);
    const response = await problemPlotAgainstFarmerAPI(
      dbname,
      lan_id,
      token,
      currentfarmerId,
    );
    if (response?.status == 200) {
      const dataArray = response?.data?.data.map(data => ({
        value: data.rel_id,
        label: data.plot_no,
      }));
      setplotAll(dataArray);
    }
  };
  const handleSearch = text => {
    setSearchFarmerName(text);
    setSearchFarmerPhone('');
    if (farmerData[0].length > 0) {
      const result = farmerData[0].filter(item =>
        item.label.toLowerCase().includes(text.toLowerCase()),
      );
      if (result) {
        setSearchResultsList(true);
        setSearchResults(result);
      }
    }
  };
  const handlePlot = async relId => {
    const response = await problemProduceAgainstPlotAPI(
      dbname,
      lan_id,
      farmerID,
      relId.value,
    );
    if (response?.status == 200) {
      setNameVarityStartEnd({
        ...nameVarityStartEnd,
        name: response?.data?.data?.crop_name.name,
        varity: response?.data?.data?.crop_variety.name,
      });
      const dateString = response?.data?.data?.harvesting_date;
      const harvesting_date = new Date(dateString);
      const currentDate = new Date();
      if (harvesting_date > currentDate) {
        setShowingMenu(true);
        setSaveData({
          ...saveData,
          land_rel_id: relId.value,
          crop_name_id: response?.data?.data?.crop_name_id,
          harvesting_date: response?.data?.data?.harvesting_date,
          sowing_date: response?.data?.data?.sowing_date,
          plot_size:
            response?.data?.data?.land_info.land_size +
            ' ' +
            response?.data?.data?.land_info.land_unit.name,
          createdBy: user_id,
        });
        const response_farmIncome = await farmaccountsIncomeListAPI(
          dbname,
          lan_id,
          farmerID,
        );
        if (response_farmIncome?.status == 200) {
          const dataArray = response_farmIncome?.data?.data?.rows.map(data => ({
            value: data.fid,
            label: data.categoryName,
          }));
          setInComeAll(dataArray);
        }
      } else {
        // MessageDialog({ title: 'Importent', message: 'Your previous crop has been harvested Please Add a Crop' })
        setModalVisible(true);
        setSearchFarmerName('');
        setSearchFarmerPhone('');
        setplotAll([]);
        // navigation.navigate('Dashboard');
      }
    }
  };

  const handleSave = async () => {
    if (saveData.crop_name_id == '') {
      Toast.show({
        time: 2,
        text: `${t('please_enter_farmer_name')}`,
        ...AlertMesg[0],
      });
    } else if (saveData.land_rel_id == '') {
      Toast.show({
        time: 2,
        text: `${t('please_enter_plot_name_first')}`,
        ...AlertMesg[0],
      });
    } else {
      let grand_total = 0;
      data.forEach(element => {
        grand_total += parseInt(element.amount);
      });
      const allFieldsFilled = data.every(
        item =>
          item.type.trim() !== '' &&
          item.cat_id.trim() !== '' &&
          item.amount.trim() !== '' &&
          item.date.trim() !== '',
      );
      const qs = require('qs');
      let save_data = qs.stringify({
        land_rel_id: saveData.land_rel_id,
        crop_name_id: saveData.crop_name_id,
        harvesting_date: saveData.harvesting_date.substring(0, 10),
        sowing_date: saveData.sowing_date,
        createdBy: saveData.createdBy,
        type: 'cost_production',
        plot_size: saveData.plot_size,
        grand_total: grand_total,
        expense_total: '0',
        cost_head: JSON.stringify(data),
      });
      if (allFieldsFilled) {
        const response = await farmIncomeExpenceSaveAPI(
          dbname,
          lan_id,
          token,
          farmerID,
          save_data,
        );
        if (response?.status == 200) {
          navigation.navigate('FarmIncomeExpenseList');
        }
      } else {
        Toast.show({
          time: 2,
          text: `Please indent data properly`,
          ...AlertMesg[0],
        });
      }
    }
  };
  const HandlerGoBack = () => navigation.navigate('FarmIncomeExpenseList');
  const handleHarvested = async data => {
    if (data == 'Yes') {
      navigation.navigate('FarmIncomeExpenseList');
    } else {
      navigation.navigate('Dashboard');
    }
  };
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        <View style={{flex: 1, backgroundColor: Colors.pageBackground}}>
          <DatePickerComp
            openDate={openFromDate}
            newDate={newFromDate}
            setOpenDate={setOpenFromDate}
            handleDatePicker={handleDatePicker}
          />
          <CustomHeader
            path="FarmIncomeExpenseList"
            HandlerGoBack={HandlerGoBack}
            logoImage={logoImage}
            topBanner={topBanner}
          />
          {/* <FormsTitle title={t('add_income')} /> */}
          <SafeAreaView>
            {searchResultsList && searchResultsList ? (
              <View style={styles.flatContainer}>
                <FlatList
                  style={searchResults.length > 8 ? styles.flatlistHeight : ''}
                  data={searchResults}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      onPress={() =>
                        handleResultSelect(item.label, item.value, item.phone)
                      }
                      style={styles.flatlistitem}>
                      <Text style={styles.flatlisttitle}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index}
                />
              </View>
            ) : (
              ''
            )}
          </SafeAreaView>
          {modalVisible && (
            <HarvestedModel
              setModalVisible={setModalVisible}
              modalVisible={modalVisible}
              handleHarvested={handleHarvested}
            />
          )}
          <View style={styles.formContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              <View style={styles.iconView}>
                <MaterialIcons
                  name={'currency-rupee'}
                  color="green"
                  size={40}
                />
              </View>
              <View style={styles.mainView}>
                <View style={styles.card}>
                  <InputTextForm
                    label={t('farmer_name')}
                    value={searchFarmerName}
                    onChangeText={farmerName => handleSearch(farmerName)}
                  />

                  <InputTextForm
                    label={t('farmer_number')}
                    value={searchFarmerPhone}
                    editable={false}
                  />

                  <DropdownForm
                    label={t('plot')}
                    data={plotAll}
                    required={true}
                    onChange={relId => handlePlot(relId)}
                  />
                  {showingMenu ? (
                    <View style={styles.plotContainer}>
                      <View style={styles.plotItem}>
                        <Text style={styles.plotItemText}>
                          {t('produce_name')}
                        </Text>
                        <Text style={styles.plotItemText}>
                          {t('prodece_vareity')}
                        </Text>
                      </View>
                      <View style={styles.plotItem}>
                        <Text style={styles.plotItemText}>
                          {nameVarityStartEnd.name}
                        </Text>
                        <Text style={styles.plotItemText}>
                          {nameVarityStartEnd.varity}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    ''
                  )}

                  {data.map((data, index) => {
                    return (
                      <View style={styles.AddExpenseContainer} key={index}>
                        <View style={styles.inputContainer}>
                          <TextInput
                            style={styles.AddExpenseInput}
                            onChangeText={text =>
                              handleChangeAddExpense(index, text, 'amount')
                            }
                            name="amount"
                            placeholder={t('amount') + '(' + currency + ')'}
                            value={data.amount}
                            keyboardType="numeric"
                            placeholderTextColor={'#000'}
                          />
                          <View style={styles.iconContainer}>
                            <MaterialIcons
                              name="currency-rupee" // or any other icon
                              size={25}
                              color="#107808ff"
                            />
                          </View>
                        </View>
                        <View style={styles.AddExpenseItemContainer}>
                          <View style={styles.AddExpenseItem}>
                            <HeadDropDown
                              label={t('add_income_head')}
                              data={InComeAll}
                              name="cat_id"
                              onChange={text =>
                                handleChangeAddCatID(index, text, 'cat_id')
                              }
                            />
                          </View>
                          <TouchableOpacity
                            onPress={() => setOpenFromDate(true)}
                            style={styles.AddExpenseItemDate}>
                            <Text style={styles.title}>
                              {data.date == '' ? `${t('date')}` : data.date}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          onPress={addMoreExpense}
                          style={styles.addMore}>
                          <MaterialIcons
                            name={'add-circle'}
                            color="white"
                            size={25}
                          />
                          <Text style={styles.addMoreText}>
                            {t('add_more')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </View>
          <ButtonForm
            label={t('submit')}
            onPress={() => handleSave()}
            iconName="check-circle"
            iconColor="#fff"
            iconSize={30}
            loading={isLoading}
          />
        </View>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};

export default AddIcome;

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    marginTop: 20,
    backgroundColor: Colors.background_light,
  },
  iconView: {
    alignSelf: 'center',
    marginBottom: 15,
    //   backgroundColor: 'white',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 4,
    borderColor: Colors.secondary,
  },
  scrollContent: {
    paddingBottom: 30, // Extra padding at bottom
  },
  mainView: {
    flex: 1,
    backgroundColor: Colors.background,
    // padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    // elevation:1,
    // marginVertical: 10,
    marginHorizontal: '2.5%',
    marginBottom: 30,
  },
  AddExpenseContainer: {
    flex: 1,
    marginVertical: 30,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F7FCFF',
    elevation: 5,
    marginBottom: 10,
  },
  card: {
    width: '100%',
    // alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  inputContainer: {
    position: 'relative', // Needed for absolute positioning of icon
  },
  iconContainer: {
    position: 'absolute',
    left: 10,
    top: '42%',
    transform: [{translateY: -10}], // Vertically center the icon
  },
  AddExpenseInput: {
    paddingLeft: 40,
    borderWidth: 1,
    borderColor: Colors.borderGreen,
    borderRadius: 20,
    marginVertical: 10,
    fontSize: 18,
    color: Colors.borderGreen,
    fontFamily: 'Poppins-Regular',
    backgroundColor: 'white',
  },
  AddExpenseItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  AddExpenseItem: {
    width: '60%',
    marginTop: 40,
  },
  AddExpenseItemDate: {
    width: '35%',
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
    padding: 8,
    borderRadius: 8,
    marginTop: 30,
    height: 45,
    backgroundColor: 'white',
  },
  addMore: {
    // position: 'absolute',
    // right: '-4%',
    // // bottom: 0,
    // top: '75%',
    zIndex: 999,
    backgroundColor: Colors.secondary,
    width: '60%',
    alignSelf: 'center',
    padding: 8,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,

    // borderTopLeftRadius: 30,
    // borderBottomLeftRadius: 30,
  },
  addMoreText: {
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    paddingLeft: 10,
  },
  plotContainer: {
    flexDirection: 'row',
    borderColor: '#000',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F7FCFF',

    elevation: 5,
    marginBottom: 20,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plotItem: {
    width: '50%',
  },
  plotItemText: {
    color: Colors.text,
    marginVertical: 5,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  plotItemValText: {
    color: Colors.text,
    marginVertical: 5,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },

  flatlisttitle: {
    padding: 10,
    color: '#000',
  },

  flatlistHeight: {
    height: Dimensions.get('window').height / 2.5,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
  flatContainer: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    // bottom: '100%',
    top: 90,
    left: 0,
    marginHorizontal: '5%',
    width: '90%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },

  //   flatlisttitle: {
  //     padding: 10,
  //     color: '#000',
  //     fontFamily: 'Poppins-Regular',
  //     fontSize: 14,
  //   },

  flatlistHeight: {
    height: Dimensions.get('window').height / 3.2,
  },

  ////////////////////////////////////////////
  // formContainer: {
  //   width: '90%',
  //   marginHorizontal: '5%',
  // },
  // AddExpenseContainer: {
  //   borderWidth: 1,
  //   marginVertical: 10,
  //   padding: 10,
  //   borderRadius: 10,
  //   borderColor: '#000',
  //   backgroundColor: '#FFF',
  // },
  // AddExpenseInput: {
  //   borderWidth: 1,
  //   borderColor: '#000',
  //   borderRadius: 10,
  //   marginVertical: 10,
  //   fontSize: 18,
  //   color: 'green',
  //   fontFamily: 'Poppins-Regular',
  // },
  // AddExpenseItemContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   width: '100%',
  // },
  // AddExpenseItem: {
  //   width: '60%',
  //   marginTop: 12,
  // },
  // AddExpenseItemDate: {
  //   width: '30%',
  //   borderWidth: 1,
  //   padding: 8,
  //   borderRadius: 10,
  // },
  // addMore: {
  //   position: 'absolute',
  //   right: '-6%',
  //   // bottom: 0,
  //   top: '55%',
  //   zIndex: 999,
  //   backgroundColor: 'green',
  //   // width: 150,
  //   padding: 10,
  //   borderTopLeftRadius: 30,
  //   borderBottomLeftRadius: 30,
  // },
  // addMoreText: {
  //   color: '#FFF',
  //   fontWeight: 'bold',
  //   textAlign: 'center',
  // },
  // plotContainer: {
  //   flexDirection: 'row',
  //   borderWidth: 1,
  //   borderColor: '#000',
  //   padding: 10,
  //   borderRadius: 10,
  //   backgroundColor: '#FFF',
  // },
  // plotItem: {
  //   width: '50%',
  // },
  // plotItemText: {
  //   color: '#000',
  //   marginVertical: 5,
  // },
  // flatContainer: {
  //   backgroundColor: '#ffffff',
  //   position: 'absolute',
  //   zIndex: 999,
  //   // bottom: '100%',
  //   top: 90,
  //   left: 0,
  //   marginHorizontal: '5%',
  //   width: '90%',
  //   elevation: 10,
  //   borderRadius: 10,
  //   padding: 10,
  // },

  // flatlisttitle: {
  //   padding: 10,
  //   color: '#000',
  // },

  // flatlistHeight: {
  //   height: Dimensions.get('window').height / 3.2,
  // },
  // title: {
  //   color: '#000',
  //   fontFamily: 'Poppins-Regular',
  //   fontSize: 14,
  // },
});
