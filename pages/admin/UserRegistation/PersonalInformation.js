import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  fetchDistrictAPI,
  fetchStateAPI,
  fetchBlockAPI,
} from '../userlist/UsersAPI';
import {
  useNavigation,
  useRoute,
  useIsFocused,
  useFocusEffect,
} from '@react-navigation/native';
import {checkPhoneDigitAPI, phoneNoCheckAPI} from '../../../config/apiHere';
import {CrashlyticsRecordError} from '../../Crashlytics/CrashlyticsRecordError';
import {userCreateContext} from '../../Context/usersCreateContext';
import axios from 'axios';
import config from '../../../config';
import ProofAndIdentityPropfComp from '../../Common/ProofAndIdentityPropfComp';
import DocumentPicker, {types} from 'react-native-document-picker';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fronts} from '../../utils/Constants';
const qs = require('qs');
const PersonalInformation = () => {
  //GQR-65
  const {
    dbLanTokUsr,
    InputTextForm,
    RadioForm,
    getItem,
    setItem,
    AlertMesg,
    t,
    PasswordComp,
    ButtonForm,
    onBackPress,
    DeviceInfo,
    DropdownForm,
    Root,
    Toast,
    CustomHeader,
    FormsTitle,
    ImagePlaceHolderCircle,
    logoImage,
    topBanner,
  } = useContext(userCreateContext);
  //GQR-65
  const {netConnection} = DeviceInfo();
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const [selectedImage, setSelectedImage] = useState(null);
  const [remove, setRemove] = useState('');
  const [stateAll, setstateAll] = useState([]);
  const [districtAll, setdistrictAll] = useState([]);
  const [blockAll, setblockAll] = useState([]);
  const [cpasswordVisibility, setcPasswordVisibility] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const phoneInputRef = useRef(null);
  const [farmerData, setFarmerData] = useState({
    userImg: {},
    address: '',
    district: '',
    districtValue: '',
    stateValue: '',
    state: '',
    block: '',
    age: '',
    pin: '',
    name: '',
    phone: '',
    gender: '1',
    userType: '1',
    password: '',
    cpassword: '',
  });
  const [identityProofIdentityPropf, setIdentityProofIdentityPropf] = useState([
    {uri: '', name: '', type: '', fileName: '', imageType: 'address'},
    {uri: '', name: '', type: '', fileName: '', imageType: 'identity'},
  ]);
  const [path, setPath] = useState('');
  const [regionaldatas, setregionaldatas] = useState({
    state: '',
    district: '',
    block: '',
  });
  const [contact_no_digits, setcontact_no_digits] = useState(11);
  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 200,
      maxWidth: 200,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets[0].base64;
        // setmyPhoto([...myphoto,]);
        setFarmerData({
          ...farmerData,
          userImg: {
            uri: response.assets[0].uri,
            type: response.assets[0].type,
            name: response.assets[0].fileName,
          },
        });
        setSelectedImage(imageUri);
      }
    });
  };
  const getState = async (dbName, languageID) => {
    var dataArray = [];
    if (netConnection) {
      const response = await fetchStateAPI(dbName, languageID);
      if (response.status == 200) {
        dataArray = response?.data?.data?.rows?.map(data => ({
          value: data.fid,
          label: data.state_name,
        }));
        await setItem('fetchStateAPI', dataArray);
      }
    } else {
      var fetchState_local_data = await getItem('fetchStateAPI');
      if (fetchState_local_data) {
        dataArray = fetchState_local_data;
      }
    }
    setstateAll(dataArray);
  };
  const onPageLoad = async () => {
    const [state, district, block] = await Promise.all([
      getItem('state'),
      getItem('district'),
      getItem('block'),
    ]);
    setregionaldatas({
      ...regionaldatas,
      state: state,
      district: district,
      block: block,
    });
    //GQR-65
    const {
      dbName,
      languageId,
      token,
      supervisorId,
      company,
      country,
      languageConpany,
      country_id,
    } = dbLanTokUsr;
    //GQR-65
    const [checkPhoneNumberDigit] = await Promise.all([
      checkPhoneDigitAPI(country_id, languageConpany, languageId),
      getState(dbName, languageId),
    ]);
    if (checkPhoneNumberDigit?.status == 200) {
      const {contact_no_digits} = checkPhoneNumberDigit?.data?.data;
      setcontact_no_digits(contact_no_digits);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    if (isFocused) {
      if (typeof route.params != 'undefined') {
        if (route.params.data === 'remove') {
          if (remove == 'remove') {
            setRemove('');
            setSelectedImage(null);
          } else {
            setRemove('remove');
            setSelectedImage(null);
          }
          emptyData();
        }
        if (typeof route.params.pagename != 'undefined') {
          setPath(route.params.pagename);
        } else {
          setPath('');
        }
      } else {
        setPath('');
        setRemove('');
      }
      onPageLoad();
    }
  }, [isFocused, netConnection]);
  const handleBackPress = () => {
    navigation.navigate(path != '' ? path : 'Dashboard');
    return true; // disable normal behaviour
  };
  useFocusEffect(
    useCallback(() => {
      onBackPress(handleBackPress);
    }),
  );
  const emptyData = () => {
    setFarmerData({
      userImg: {},
      address: '',
      district: '',
      districtValue: '',
      stateValue: '',
      state: '',
      block: '',
      age: '',
      pin: '',
      name: '',
      phone: '',
      gender: '1',
      userType: '1',
      password: '',
      cpassword: '',
    });
  };

  const handleStateInfo = async (item, name, value) => {
    setFarmerData({
      ...farmerData,
      [name]: item.label,
      [value]: item.value,
      ['district']: '',
      ['block']: '',
    });
    var dataArray = [];
    var distric_list_arr = [];
    let fetchDistrict_local_data = await getItem('fetchDistrictAPI');
    if (netConnection) {
      const response = await fetchDistrictAPI(
        dbLanTokUsr.dbName,
        dbLanTokUsr.languageId,
        item.value,
      );
      if (response?.status === 200) {
        dataArray = response?.data?.data?.rows.map(data => ({
          value: data.fid,
          label: data.district_name,
        }));
        if (
          fetchDistrict_local_data != null &&
          fetchDistrict_local_data.length > 0
        ) {
          if (fetchDistrict_local_data[0][item.value] != undefined) {
            JSON.parse(fetchDistrict_local_data[0][item.value]).push({
              [item.value]: JSON.stringify(dataArray),
            });
          } else {
            fetchDistrict_local_data.push({
              [item.value]: JSON.stringify(dataArray),
            });
          }
        } else {
          distric_list_arr.push({[item.value]: JSON.stringify(dataArray)});
          fetchDistrict_local_data = distric_list_arr;
        }
        await setItem('fetchDistrictAPI', fetchDistrict_local_data);
      }
    } else {
      var fetchDistrict_local_arr = [];
      if (fetchDistrict_local_data) {
        fetchDistrict_local_arr = fetchDistrict_local_data.filter(function (
          v,
          i,
        ) {
          return fetchDistrict_local_data[i][item.value] != undefined;
        });
        if (fetchDistrict_local_arr.length != 0) {
          dataArray = JSON.parse(fetchDistrict_local_arr[0][item.value]);
        } else {
          dataArray = [];
        }
      }
    }
    setblockAll([]);
    setdistrictAll(dataArray);
  };
  const handleDistrictInfo = async (item, name, value) => {
    setFarmerData({
      ...farmerData,
      [name]: item.label,
      [value]: item.value,
      ['block']: '',
    });
    var dataArray = [];
    var dlock_list_arr = [];
    let fetchBlockAPI_local_data = await getItem('fetchBlockAPI');
    if (netConnection) {
      const response = await fetchBlockAPI(
        dbLanTokUsr.dbName,
        dbLanTokUsr.languageId,
        item.value,
      );
      dataArray = response?.data?.data?.rows.map(data => ({
        value: data.fid,
        label: data.subdiv_name,
      }));
      if (
        fetchBlockAPI_local_data != null &&
        fetchBlockAPI_local_data.length > 0
      ) {
        if (fetchBlockAPI_local_data[0][item.value] != undefined) {
          JSON.parse(fetchBlockAPI_local_data[0][item.value]).push({
            [item.value]: JSON.stringify(dataArray),
          });
        } else {
          fetchBlockAPI_local_data.push({
            [item.value]: JSON.stringify(dataArray),
          });
        }
      } else {
        dlock_list_arr.push({[item.value]: JSON.stringify(dataArray)});
        fetchBlockAPI_local_data = dlock_list_arr;
      }
      await setItem('fetchBlockAPI', fetchBlockAPI_local_data);
    } else {
      dataArray = await getItem('fetchBlockAPI');
      fetchDistrict_local_data = await getItem('fetchDistrictAPI');
      const fetchBlockAPI_local_arr = fetchBlockAPI_local_data.filter(function (
        v,
        i,
      ) {
        return fetchBlockAPI_local_data[i][item.value] != undefined;
      });
      if (fetchBlockAPI_local_arr.length != 0) {
        dataArray = JSON.parse(fetchBlockAPI_local_arr[0][item.value]);
      } else {
        dataArray = [];
      }
    }
    setblockAll(dataArray);
  };
  const handleAddDataBlock = (item, name, value) => {
    setFarmerData({...farmerData, [name]: item.label, [value]: item.value});
  };
  const handleAddData = (name, value) => {
    setFarmerData({...farmerData, [name]: value});
  };
  const checkPhone = async () => {
    if (netConnection) {
      const check_phone_digit_res = await checkPhoneDigitAPI(
        dbLanTokUsr.country_id,
        dbLanTokUsr.languageConpany,
        dbLanTokUsr.languageId,
      );
      if (check_phone_digit_res?.status == 200) {
        if (check_phone_digit_res.data.data.contact_no_digits) {
          let require_digit = check_phone_digit_res.data.data.contact_no_digits;
          if (farmerData.phone.length === require_digit) {
            try {
              try {
                const axiosConfig1 = {
                  headers: {
                    information: `${dbLanTokUsr.dbName}`,
                    Accept: 'application/json',
                  },
                };
                const inputBody = {
                  contactNumber: farmerData.phone.toString(),
                  userType: '2',
                };
                let check_phone_res = await axios.post(
                  config.phoneNoCheckAPI,
                  inputBody,
                  axiosConfig1,
                );
              } catch (error) {
                CrashlyticsRecordError(error);
                Toast.show({
                  text: `This ${farmerData.phone} Not Available`,
                  ...AlertMesg[0],
                });
                // phoneInputRef.current.focus();
                setFarmerData({...farmerData, phone: ''});
              }
            } catch (error) {
              console.log(error);
              Toast.show({
                text: `This ${farmerData.phone} Not Available`,
                ...AlertMesg[0],
              });
              // phoneInputRef.current.focus();
              setFarmerData({...farmerData, phone: ''});
            }
          } else {
            Toast.show({
              time: 3,
              text: `Please Enter ${require_digit} digit phone no`,
              ...AlertMesg[0],
            });
            Keyboard.dismiss();
            setFarmerData({...farmerData, phone: ''});
          }
        }
      }
    }
  };
  const handleNavigate = async () => {
    Keyboard.dismiss();
    if (farmerData.name == '') {
      Toast.show({text: `${t('please_enter_valid_name')}`, ...AlertMesg[0]});
    } else if (farmerData.phone == '') {
      Toast.show({
        text: `${t('please_enter_valid_mobile_no')}`,
        ...AlertMesg[0],
      });
    } else if (farmerData.phone.length != contact_no_digits) {
      Toast.show({
        text: `${t('please_enter_valid_mobile_no')}`,
        ...AlertMesg[0],
      });
    } else if (farmerData.age == '') {
      Toast.show({text: `${t('please_enter_birth_date')}`, ...AlertMesg[0]});
    } else if (farmerData.age < 18) {
      Toast.show({text: `${t('please_eligible_birth_date')}`, ...AlertMesg[0]});
    } else if (farmerData.state == '') {
      Toast.show({text: `${t('please_select_state_first')}`, ...AlertMesg[0]});
    } else if (farmerData.district == '') {
      Toast.show({text: `${t('please_select_zila_first')}`, ...AlertMesg[0]});
    } else if (farmerData.block == '') {
      Toast.show({text: `${t('select_block_first')}`, ...AlertMesg[0]});
    } else if (farmerData.password == '') {
      Toast.show({text: `${t('enter_pass')}`, ...AlertMesg[0]});
    } else if (farmerData.cpassword == '') {
      Toast.show({text: `${t('enter_conf_pass')}`, ...AlertMesg[0]});
    } else if (farmerData.password != farmerData.cpassword) {
      Toast.show({text: `${t('same_pass')}`, ...AlertMesg[0]});
    } else {
      const newfarmerData = {...farmerData, identityProofIdentityPropf};
      if (path != '') {
        await setItem('storePersnolInfo_data', newfarmerData);
        navigation.navigate(route.params.pagename, {data: remove});
      } else {
        await setItem('storePersnolInfo_data', newfarmerData);
        navigation.navigate('FinancialInformation', {data: remove});
      }
    }
  };
  const HandlerGoBack = () => {
    if (path != '') {
      navigation.navigate(path);
    } else {
      navigation.navigate('Dashboard');
    }
  };
  const handleDocumentSelection = async (data, index) => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        type: [types.pdf, types.images],
      });
      const values = [...identityProofIdentityPropf];
      values[index]['uri'] = response[0].uri;
      values[index]['name'] = response[0].name;
      values[index]['type'] = response[0].type;
      values[index]['fileName'] = response[0].name;
      values[index]['imageType'] = data;
      setIdentityProofIdentityPropf(values);
    } catch (err) {
      console.error(err);
    }
  };
  const handleDocumentSelectionRemove = index => {
    const values = [...identityProofIdentityPropf];
    values[index]['uri'] = '';
    values[index]['name'] = '';
    values[index]['type'] = '';
    values[index]['fileName'] = '';
    setIdentityProofIdentityPropf(values);
  };
  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <Root>
          <View style={styles.mainContainer}>
            <CustomHeader
              path={path != '' ? path : 'Dashboard'}
              HandlerGoBack={HandlerGoBack}
              logoImage={logoImage}
              topBanner={topBanner}
            />
            {/* <FormsTitle title={t('personal_information')} /> */}
            <KeyboardAvoidingView
              style={{flex: 1}}
              // behavior='position' keyboardVerticalOffset={keyboardVerticalOffset}
              behavior={Platform.OS === 'ios' ? 'padding' : null}
              // behavior='position'
              keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
              <View style={styles.fromContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{flex: 1}}>
                    <View style={styles.firatFormContainer}>
                      <View style={styles.profileImg}>
                        <ImagePlaceHolderCircle
                          openImagePicker={openImagePicker}
                          selectedImage={selectedImage}
                        />
                      </View>
                      <View style={styles.inputContainer}>
                        <InputTextForm
                          label={t('name')}
                          required={true}
                          onChangeText={value => handleAddData('name', value)}
                          value={farmerData.name}
                        />
                        <InputTextForm
                          label={t('new_reg_phone_number')}
                          required={true}
                          keyboardType="numeric"
                          onChangeText={value => {
                            const numericValue = value.replace(/[^0-9]/g, ''); // Remove non-digit characters
                            handleAddData('phone', numericValue);
                          }}
                          value={farmerData.phone}
                          onBlur={() => checkPhone(farmerData.phone)} // Pass the actual phone value
                          refname={phoneInputRef}
                          maxLength={contact_no_digits}
                        />

                        <View>
                          <Text style={styles.text}>{t('farmer_reg_gnd')}</Text>
                          <RadioForm
                            label={t('farmer_reg_male')}
                            onSelect={() => handleAddData('gender', '1')}
                            selected={farmerData.gender === '1'}
                          />
                          <RadioForm
                            label={t('farmer_reg_female')}
                            onSelect={() => handleAddData('gender', '2')}
                            selected={farmerData.gender === '2'}
                          />
                          <RadioForm
                            label={t('farmer_reg_other')}
                            onSelect={() => handleAddData('gender', '3')}
                            selected={farmerData.gender === '3'}
                          />
                        </View>
                        <View style={{marginBottom: 15}}>
                          <Text style={styles.text}>
                            {t('far_reg_far_type')}
                          </Text>
                          <RadioForm
                            label={t('grower')}
                            onSelect={() => handleAddData('userType', '1')}
                            selected={farmerData.userType === '1'}
                          />
                          <RadioForm
                            label={t('small_holder')}
                            onSelect={() => handleAddData('userType', '2')}
                            selected={farmerData.userType === '2'}
                          />
                          <RadioForm
                            label={t('farm_worker')}
                            onSelect={() => handleAddData('userType', '3')}
                            selected={farmerData.userType === '3'}
                          />
                        </View>
                        <InputTextForm
                          label={t('age')}
                          required={true}
                          keyboardType={'number-pad'}
                          maxLength={2}
                          onChangeText={value => handleAddData('age', value)}
                          value={farmerData.age}
                        />
                        <DropdownForm
                          label={
                            regionaldatas.state == ''
                              ? t('state_col')
                              : t(`${regionaldatas.state}`)
                          }
                          required={true}
                          data={stateAll}
                          onChange={item => {
                            handleStateInfo(item, 'state', 'stateValue');
                          }}
                          val={farmerData.state}
                        />
                        <DropdownForm
                          label={
                            regionaldatas.district == ''
                              ? t('select_zila')
                              : t(`${regionaldatas.district}`)
                          }
                          required={true}
                          data={districtAll}
                          onChange={item => {
                            handleDistrictInfo(
                              item,
                              'district',
                              'districtValue',
                            );
                          }}
                          val={farmerData.district}
                        />
                        <DropdownForm
                          label={
                            regionaldatas.block == ''
                              ? t('select_block_sub_county_upzila')
                              : t(`${regionaldatas.block}`)
                          }
                          required={true}
                          data={blockAll}
                          onChange={item => {
                            handleAddDataBlock(item, 'block', 'bloctValue');
                          }}
                          val={farmerData.block}
                        />
                        <InputTextForm
                          label={t('enter_address')}
                          onChangeText={value =>
                            handleAddData('address', value)
                          }
                          value={farmerData.address}
                        />
                        <InputTextForm
                          label={t('valid_pin_code')}
                          keyboardType={'number-pad'}
                          maxLength={6}
                          onChangeText={value => handleAddData('pin', value)}
                          value={farmerData.pin}
                        />
                        <PasswordComp
                          setPasswordVisibility={setPasswordVisibility}
                          passwordVisibility={passwordVisibility}
                          label={t('new_reg_password')}
                          onChangeText={value =>
                            handleAddData('password', value)
                          }
                          value={farmerData.password}
                        />
                        <PasswordComp
                          setPasswordVisibility={setcPasswordVisibility}
                          passwordVisibility={cpasswordVisibility}
                          label={t('new_reg_confirm_password')}
                          onChangeText={value =>
                            handleAddData('cpassword', value)
                          }
                          value={farmerData.cpassword}
                        />
                        {/* <ProofAndIdentityPropfComp
                                              identityProofIdentityPropf={identityProofIdentityPropf}
                                              t={t}
                                              title={t('address_proofAndIdentityPropf')}
                                              handleDocumentSelection={handleDocumentSelection}
                                              handleDocumentSelectionRemove={handleDocumentSelectionRemove}
                                            /> */}
                        <ProofAndIdentityPropfComp
                          identityProofIdentityPropf={
                            identityProofIdentityPropf
                          }
                          t={t}
                          title={t('address_proofAndIdentityPropf')}
                          setStateValue={setIdentityProofIdentityPropf}
                          stateValue={identityProofIdentityPropf}
                          disable={true}
                          InputTextFormEdit={true}
                          // photoDeletedValue={photoDeletedValue}
                          // setPhotoDeletedValue={setPhotoDeletedValue}
                          // loginUser_data={loginUser_data}
                        />
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
          <ButtonForm
            label={t('next')}
            onPress={handleNavigate}
            loading={isLoading}
          />
        </Root>
      </>
    </FarmerDrawerScreenWrapper1>
  );
};
export default PersonalInformation;
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E9FCC5',
    paddingHorizontal: '3%',
    paddingVertical: '3%',
    borderRadius: 20,
    marginBottom: 50,
    marginHorizontal: 20,
    elevation: 5,
    marginBottom: 100,
  },
  text: {
    fontSize: 16,
    marginTop: 15,
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  mainContainer: {flex: 1, backgroundColor: Colors.background_light},
  firatFormContainer: {
    // marginTop: 50,

    // marginHorizontal: '4%',
    // borderWidth: 1,
    // paddingTop: 10,
    // marginBottom: 30,

    backgroundColor: 'white',
    padding: 10,
    // borderRadius: 8,
    // borderWidth: 1,
    // borderColor: Colors.border,
    // // elevation:1,
    marginVertical: 10,
    // marginHorizontal: '4%',
  },
  formContainer: {
    backgroundColor: Colors.background, // marginTop: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: '4%',

    // paddingTop: 10,
    marginBottom: 30,
  },
  inputContainer: {},
  inputContainer2: {paddingHorizontal: 16},
  profileImg: {
    // position: 'absolute',
    // top: -50, // Half outside (adjust based on your image size)
    // alignSelf: 'center', // Center horizontally
    zIndex: 2,
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordMainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.drawer,
    paddingTop: 5,
  },
  radioTitle: {
    fontSize: 15,
    color: '#4e4e4e',
    fontFamily: 'Poppins-Regular',
    paddingLeft: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    height: 50,
    borderColor: Colors.secondary, // Make sure this color is visible
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    width: '100%',
    elevation: 1,
    paddingHorizontal: 10,
    color: '#000000',
  },
  inputTextStyle: {
    marginHorizontal: 10,
    borderColor: 'gray',
    color: '#000',
  },
  formHeader: {
    backgroundColor: Colors.useGreen,
    height: 60,
    width: '100%',
    justifyContent: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
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
  LoadingScreen: {
    position: 'absolute',
    top: '52%',
    left: '45%',
    zIndex: 9999,
  },
  dateText: {
    marginBottom: 5,
    marginLeft: 5,
    color: '#4e4e4e',
  },
  fromContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
});
