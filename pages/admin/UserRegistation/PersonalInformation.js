import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Alert,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
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
import { checkPhoneDigitAPI, phoneNoCheckAPI } from '../../../config/apiHere';
import { CrashlyticsRecordError } from '../../Crashlytics/CrashlyticsRecordError';
import { userCreateContext } from '../../Context/usersCreateContext';
import axios from 'axios';
import config from '../../../config';
import ProofAndIdentityPropfComp from '../../Common/ProofAndIdentityPropfComp';
import DocumentPicker, { types } from '@react-native-documents/picker';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import { Colors, Fronts } from '../../utils/Constants';
const qs = require('qs');
import useSingleBackToNavigate from '../../utils/useSingleBackToNavigate';
import { axiosGet, axiosPut, axiosPost } from '../../utils/api';
import { ROUTES } from '../../utils/Routes';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { removeItem } from '../../../config/getDataFromStorage';
const PersonalInformation = () => {
  useSingleBackToNavigate('Dashboard');
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
    isOnline,
  } = useContext(userCreateContext);
  //GQR-65
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const [selectedImage, setSelectedImage] = useState(null);
  const [remove, setRemove] = useState('');
  const [stateAll, setstateAll] = useState([]);
  const [districtAll, setdistrictAll] = useState([]);
  const [blockAll, setBlockAll] = useState([]);
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
    { uri: '', name: '', type: '', fileName: '', imageType: 'address' },
    { uri: '', name: '', type: '', fileName: '', imageType: 'identity' },
  ]);
  const [path, setPath] = useState('');
  const [regionaldatas, setregionaldatas] = useState({
    state: '',
    district: '',
    block: '',
  });
  const [contact_no_digits, setcontact_no_digits] = useState(11);
  const openImagePicker = useCallback(() => {
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
  }, [farmerData]);
  const getState = async (dbName, languageID) => {
    var dataArray = [];
    if (isOnline) {
      const response = await axiosGet(ROUTES.GET.STATE_API(), '', {
        information: `${dbName},${languageID}`,
      });

      // fetchStateAPI(dbName, languageID);

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
    setIsLoading(true);
    const saved = await getItem('storePersnolInfo_data');
    if (saved) {
      setFarmerData(prev => ({
        ...prev,
        ...saved,
      }));
      if (saved.identityProofIdentityPropf) {
        setIdentityProofIdentityPropf(saved.identityProofIdentityPropf);
      }

      if (saved.userImg) {
        setSelectedImage(saved.userImg.uri);
      }
    }

    // 2. LOAD DEFAULT STATE, DISTRICT, BLOCK DATA
    const [state, district, block] = await Promise.all([
      getItem('state'),
      getItem('district'),
      getItem('block'),
    ]);

    setregionaldatas({
      state,
      district,
      block,
    });

    // 3. LOAD STATE API + CONTACT DIGIT API
    const { dbName, languageId, country_id, languageConpany,ai_camera_id_proof } = dbLanTokUsr;

    const [checkPhoneNumberDigit] = await Promise.all([
      axiosGet(ROUTES.GET.CHECK_PHONE_DIGIT({ countryId: country_id }), '', {
        information: `${languageConpany},${languageId}`,
        Accept: 'application/json',
      }),
      getState(dbName, languageId),
    ]);

    if (checkPhoneNumberDigit?.status == 200) {
      setcontact_no_digits(
        checkPhoneNumberDigit?.data?.data?.contact_no_digits,
      );
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
          storePersnolInfo_data_delete();
        }
      } else {
        storePersnolInfo_data_delete();
        setPath('');
        setRemove('');
      }
      onPageLoad();
    }
  }, [isFocused, isOnline]);
  const storePersnolInfo_data_delete = async () => {
    await setItem('storePersnolInfo_data');
  };
  useEffect(() => {
    setItem('pagename', '');
  }, []);
  const handleBackPress = () => {
    console.log('path', path);
    navigation.navigate(path != '' ? path : 'Dashboard');
    return true; // disable normal behaviour
  };
  // useSingleBackToNavigate("Login")
  // useFocusEffect(
  //   useCallback(() => {
  //     onBackPress(handleBackPress);
  //   }, [isFocused, navigation]),
  // );
  // useFocusEffect(
  //   useCallback(() => {
  //     const onBackPress = () => {
  //       navigation.navigate(path != '' ? path : 'Dashboard');
  //       return true;
  //     };
  //     const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  //     return () => subscription.remove();
  //   }, [navigation, path])
  // );
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

  const handleStateInfo = useCallback(async item => {
    try {
      setIsLoading(true);
      setFarmerData(prev => ({
        ...prev,
        state: item.label,
        stateValue: item.value,
        ['district']: '',
        ['block']: '',
      }));
      var dataArray = [];
      const response = await axiosGet(
        ROUTES.GET.DISTRICT_API({
          stateID: item.value,
        }),
        '',
        { information: `${dbLanTokUsr.dbName},${dbLanTokUsr.languageId}` },
      );
      if (response?.status === 200) {
        dataArray = response?.data?.data?.rows.map(data => ({
          value: data.fid,
          label: data.district_name,
        }));
      }
      setBlockAll([]);
      setdistrictAll(dataArray);
      setIsLoading(false);
    } catch (error) {
      setdistrictAll([]);
      setBlockAll([]);
      setIsLoading(false);
    }
  }, []);
  const handleDistrictInfo = useCallback(
    async (item, name, value) => {
      try {
        setIsLoading(true);
        setFarmerData(prev => ({
          ...prev,
          district: item.label,
          districtValue: item.value,
          ['block']: '',
        }));
        var dataArray = [];
        const response = await axiosGet(
          ROUTES.GET.BLOCK_API({
            districtID: item.value,
          }),
          '',
          { information: `${dbLanTokUsr.dbName},${dbLanTokUsr.languageId}` },
        );
        dataArray = response?.data?.data?.rows.map(data => ({
          value: data.fid,
          label: data.subdiv_name,
        }));
        setBlockAll(dataArray);
        setIsLoading(false);
      } catch (error) {
        setBlockAll([]);
        setIsLoading(false);
      }
    },
    [farmerData.state],
  );
  const handleAddDataBlock = useCallback(item => {
    setFarmerData(prev => ({
      ...prev,
      block: item.label,
      bloctValue: item.value,
    }));
  }, []);
  const checkPhone = async () => {
    if (isOnline) {
      const check_phone_digit_res = await axiosGet(
        ROUTES.GET.CHECK_PHONE_DIGIT({ countryId: dbLanTokUsr.country_id }),
        '',
        {
          information: `${dbLanTokUsr.languageConpany},${dbLanTokUsr.languageId}`,
          Accept: 'application/json',
        },
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
                setFarmerData({ ...farmerData, phone: '' });
              }
            } catch (error) {
              console.log(error);
              Toast.show({
                text: `This ${farmerData.phone} Not Available`,
                ...AlertMesg[0],
              });
              // phoneInputRef.current.focus();
              setFarmerData({ ...farmerData, phone: '' });
            }
          } else {
            Toast.show({
              time: 3,
              text: `Please Enter ${require_digit} digit phone no`,
              ...AlertMesg[0],
            });
            Keyboard.dismiss();
            setFarmerData({ ...farmerData, phone: '' });
          }
        }
      }
    }
  };
  const handleNavigate = async () => {
    Keyboard.dismiss();
    if (farmerData.name == '') {
      Toast.show({ text: `${t('please_enter_valid_name')}`, ...AlertMesg[0] });
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
      Toast.show({ text: `${t('please_enter_birth_date')}`, ...AlertMesg[0] });
    } else if (farmerData.age < 18) {
      Toast.show({ text: `${t('please_eligible_birth_date')}`, ...AlertMesg[0] });
    } else if (farmerData.state == '') {
      Toast.show({ text: `${t('please_select_state_first')}`, ...AlertMesg[0] });
    } else if (farmerData.district == '') {
      Toast.show({ text: `${t('please_select_zila_first')}`, ...AlertMesg[0] });
    } else if (farmerData.block == '') {
      Toast.show({ text: `${t('select_block_first')}`, ...AlertMesg[0] });
    } else if (farmerData.password == '') {
      Toast.show({ text: `${t('enter_pass')}`, ...AlertMesg[0] });
    } else if (farmerData.cpassword == '') {
      Toast.show({ text: `${t('enter_conf_pass')}`, ...AlertMesg[0] });
    } else if (farmerData.password != farmerData.cpassword) {
      Toast.show({ text: `${t('same_pass')}`, ...AlertMesg[0] });
    } else {
      const newfarmerData = { ...farmerData, identityProofIdentityPropf };
      if (path != '') {
        await setItem('storePersnolInfo_data', newfarmerData);
        navigation.navigate(route.params.pagename, { data: remove });
      } else {
        await setItem('storePersnolInfo_data', newfarmerData);
        navigation.navigate('FinancialInformation', { data: remove });
      }
    }
  };
  const HandlerGoBack = useCallback(async () => {
    const pagename = await getItem('pagename');
    navigation.navigate(pagename != '' ? pagename : 'Dashboard');
    return true; // disable normal behaviour
  }, [isFocused, navigation, path, route]);
  const handleAddDataName = useCallback(text => {
    setFarmerData(prev => ({ ...prev, name: text }));
    const values = [...identityProofIdentityPropf];
    values[1] = {
      ...values[1],
      uri: "",
      name: "",
      fileName: "",
      type: "image/jpeg",
      imageType:'identity',
      value: '1',
      id: '',
    };

    setIdentityProofIdentityPropf(values);
  }, []);
  const handleAddDataPhone = useCallback(text => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setFarmerData(prev => ({ ...prev, phone: numericValue }));
  }, []);
  const handleAddDataGender = useCallback((name, value) => {
    setFarmerData(prev => ({ ...prev, [name]: value }));
  }, []);
  const handleAddDataUserType = useCallback((name, value) => {
    setFarmerData(prev => ({ ...prev, [name]: value }));
  }, []);
  const handleAddDataAge = useCallback(text => {
    setFarmerData(prev => ({ ...prev, age: text }));
  }, []);
  const handleAddDataAddress = useCallback(text => {
    setFarmerData(prev => ({ ...prev, address: text }));
  }, []);
  const handleAddDataPin = useCallback(text => {
    setFarmerData(prev => ({ ...prev, pin: text }));
  }, []);
  const handleAddDataPass = useCallback(text => {
    setFarmerData(prev => ({ ...prev, password: text }));
  }, []);
  const handleAddDataCPass = useCallback(text => {
    setFarmerData(prev => ({ ...prev, cpassword: text }));
  }, []);

  const renderCustomHeader = useMemo(
    () => (
      <CustomHeader
        path={path != '' ? path : 'Dashboard'}
        // HandlerGoBack={HandlerGoBack}
        logoImage={logoImage}
        topBanner={topBanner}
      />
    ),
    [],
  );
  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <Root>
          <View style={styles.mainContainer}>
            {renderCustomHeader}
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              // behavior='position' keyboardVerticalOffset={keyboardVerticalOffset}
              behavior={Platform.OS === 'ios' ? 'padding' : null}
              // behavior='position'
              keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
              <View style={styles.fromContainer}>
                <View
                  style={{
                    backgroundColor: Colors.useGreen,
                    alignSelf: 'flex-end',
                    marginTop: 20,
                    borderRadius: 10,
                    width: '10%',

                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 20,
                    marginBottom: 10,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                    }}>
                    1/3
                  </Text>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{ flex: 1 }}>
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
                          onChangeText={handleAddDataName}
                          value={farmerData.name}
                        />
                        <InputTextForm
                          label={t('new_reg_phone_number')}
                          required={true}
                          keyboardType="numeric"
                          onChangeText={handleAddDataPhone}
                          value={farmerData.phone}
                          onBlur={() => checkPhone(farmerData.phone)} // Pass the actual phone value
                          refname={phoneInputRef}
                          maxLength={contact_no_digits}
                        />

                        <View>
                          <Text style={styles.text}>{t('farmer_reg_gnd')}</Text>
                          <RadioForm
                            label={t('farmer_reg_male')}
                            onSelect={() => handleAddDataGender('gender', '1')}
                            selected={farmerData.gender === '1'}
                          />
                          <RadioForm
                            label={t('farmer_reg_female')}
                            onSelect={() => handleAddDataGender('gender', '2')}
                            selected={farmerData.gender === '2'}
                          />
                          <RadioForm
                            label={t('farmer_reg_other')}
                            onSelect={() => handleAddDataGender('gender', '3')}
                            selected={farmerData.gender === '3'}
                          />
                        </View>
                        <View style={{ marginBottom: 15 }}>
                          <Text style={styles.text}>
                            {t('far_reg_far_type')}
                          </Text>
                          <RadioForm
                            label={t('grower')}
                            onSelect={() =>
                              handleAddDataUserType('userType', '1')
                            }
                            selected={farmerData.userType === '1'}
                          />
                          <RadioForm
                            label={t('small_holder')}
                            onSelect={() =>
                              handleAddDataUserType('userType', '2')
                            }
                            selected={farmerData.userType === '2'}
                          />
                          <RadioForm
                            label={t('farm_worker')}
                            onSelect={() =>
                              handleAddDataUserType('userType', '3')
                            }
                            selected={farmerData.userType === '3'}
                          />
                        </View>
                        <InputTextForm
                          label={t('age')}
                          required={true}
                          keyboardType={'number-pad'}
                          maxLength={2}
                          onChangeText={handleAddDataAge}
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
                          onChange={handleStateInfo}
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
                          onChange={handleDistrictInfo}
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
                          onChange={handleAddDataBlock}
                          val={farmerData.block}
                        />
                        <InputTextForm
                          label={t('enter_address')}
                          onChangeText={handleAddDataAddress}
                          value={farmerData.address}
                        />
                        <InputTextForm
                          label={t('valid_pin_code')}
                          keyboardType={'number-pad'}
                          maxLength={6}
                          onChangeText={handleAddDataPin}
                          value={farmerData.pin}
                        />
                        <PasswordComp
                          setPasswordVisibility={setPasswordVisibility}
                          passwordVisibility={passwordVisibility}
                          label={t('new_reg_password')}
                          onChangeText={handleAddDataPass}
                          value={farmerData.password}
                          required={true}
                        />
                        <PasswordComp
                          setPasswordVisibility={setcPasswordVisibility}
                          passwordVisibility={cpasswordVisibility}
                          label={t('new_reg_confirm_password')}
                          onChangeText={handleAddDataCPass}
                          value={farmerData.cpassword}
                          required={true}
                        />
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
                          farmerName={farmerData.name}
                        // photoDeletedValue={photoDeletedValue}
                        // setPhotoDeletedValue={setPhotoDeletedValue}
                        // loginUser_data={loginUser_data}
                        ai_camera_id_proof={dbLanTokUsr?.ai_camera_id_proof}
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
  mainContainer: { flex: 1, backgroundColor: Colors.background_light },
  firatFormContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 10,
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
  inputContainer2: { paddingHorizontal: 16 },
  profileImg: {
    zIndex: 2,
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
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
