import {
  Keyboard,
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  StatusBar,
  Platform,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Logo from './Common/Logo';
import DropdownForm from './Common/DropdownForm';
import ButtonForm from './Common/ButtonForm';
import InputTextForm from './Common/InputTextForm';
import { useNavigation } from '@react-navigation/native';
import MessageDialog from './Common/MessageDialog';
import {
  countryDataListAPI,
  companyDataListAPI,
  supervisoryDataListAPI,
  checkPhoneNoAPI,
  checkPhoneDigitAPI,
} from '../config/apiHere';
import axios from 'axios';
import config from '../config';
import { isNotEmpty } from './Common/ValidationFunctions';
import { Permission, PERMISSIONS_TYPE } from './Common/AppPermission';
import { request, PERMISSIONS } from 'react-native-permissions';
import { Root, Popup, Toast } from '@sekizlipenguen/react-native-popup-confirm-toast';
import { AlertMesg } from './Common/ToastAlert';
import { getItem, setItem } from '../config/getDataFromStorage';
import { useTranslation } from 'react-i18next';
import PasswordComp from './Common/PasswordComp';
import ForegroundLocationService from './BackgroundService/ForegroundLocationService';
import { CrashlyticsRecordError } from './Crashlytics/CrashlyticsRecordError';
import DeviceInfo from './DeviceInfo';
import { Colors, Fonts } from './utils/Constants';
import { axiosPost, axiosGet } from './utils/api';
import { ROUTES } from './utils/Routes';
import MyErrorBoundary from './Common/MyErrorBoundary';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const Signup = () => {
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : -40;
  const { netConnection } = DeviceInfo();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const language_id = 1;
  const [isLoading, setIsLoading] = useState(false);

  const [storeSignup, setstoreSignup] = useState({
    country: '',
    company: '',
    supervisor: '',
    phone: '',
    password: '',
    cpassword: '',
  });

  const [cpasswordVisibility, setcPasswordVisibility] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState('');
  const [countryData, setCountryData] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [supervisorData, setSupervisorData] = useState([]);
  const phoneInputRef = useRef(null);
  let countryDataList = async () => {
    try {
      let countryArray = [];
      if (netConnection) {
        const country_res = await axiosGet(ROUTES.GET.COUNTRY_DATA_LIST(), '', {
          information: `localhost,1`,
        });
        // countryDataListAPI();

        if (country_res?.status == 200) {
          country_res.data.data.rows.forEach(element => {
            countryArray.push({
              value: element.id,
              label: element.country_name,
            });
          });
          await setItem('countryDataListAPI', countryArray);
        }
      } else {
        const countryDataListAPI = await getItem('countryDataListAPI');
        if (countryDataListAPI) {
          countryArray = countryDataListAPI;
        }
      }
      setCountryData(countryArray);
    } catch (error) {
      console.error(
        'Server responded with an error:',
        error.response.status,
        error.response.data,
      );
    }
  };
  const countryHandle = country => {
    setstoreSignup({
      ...storeSignup,
      country: country,
      supervisor: '',
      company: '',
    });
    companyDataList(country.value, language_id);
  };

  let companyDataList = async (country_id, language_id) => {
    try {
      let companyArray = [];
      let companyData_list_local_data = await getItem('companyDataListAPI');
      let company_list_arr = [];
      if (netConnection) {
        let company_res = await axiosGet(
          ROUTES.GET.COMPANY_DATA_LIST({
            country_id: country_id,
            language_id: language_id,
          }),
          '',
          {},
        );
        // companyDataListAPI(country_id, language_id);

        if (company_res?.data?.data) {
          company_res?.data?.data?.agri_companies.forEach(element => {
            companyArray.push({
              value: element.id,
              label: element.company_name,
              dbname: element.agri_host_db_rel.db_name,
            });
          });
          if (
            companyData_list_local_data != null &&
            companyData_list_local_data.length > 0
          ) {
            if (companyData_list_local_data[0][country_id] != undefined) {
              JSON.parse(companyData_list_local_data[0][country_id]).push({
                [country_id]: JSON.stringify(companyArray),
              });
            } else {
              companyData_list_local_data.push({
                [country_id]: JSON.stringify(companyArray),
              });
            }
          } else {
            company_list_arr.push({ [country_id]: JSON.stringify(companyArray) });
            companyData_list_local_data = company_list_arr;
          }
          await setItem('companyDataListAPI', companyData_list_local_data);
        }
      } else {
        var fetchDistrict_local_arr = [];
        if (companyData_list_local_data) {
          fetchDistrict_local_arr = companyData_list_local_data.filter(
            function (v, i) {
              return companyData_list_local_data[i][country_id] != undefined;
            },
          );
          if (fetchDistrict_local_arr.length != 0) {
            companyArray = JSON.parse(fetchDistrict_local_arr[0][country_id]);
          } else {
            companyArray = [];
          }
        }
      }
      setCompanyData(companyArray);
    } catch (error) {
      console.error(error.response);
    }
  };
  const companyHandle = async company => {
    setstoreSignup({ ...storeSignup, company: company, supervisor: '' });
    const resCarbonFlag = await axiosGet(ROUTES.GET.SHOW_CARBON_FLAG, '', {
      information: `${company.dbname},1`,
    });
    const { option_value, option_name } = resCarbonFlag?.data?.data || {};
    await setItem('carbon_status', option_value);
    await setItem('carbon_option', option_name == "Carbon mangrove" ? 'mangrove' : option_name);
    supervisorDataList(company.value);
  };
  let supervisorDataList = async company_id => {
    try {
      let supervisorArray = [];
      let supervisory_ofline_list_arr = [];
      let supervisory_ofline_list = await getItem('supervisoryDataListAPI');
      if (netConnection) {

        let supervisor_res = await axiosGet(
          ROUTES.GET.SUPERVISOR_DATA_LIST({
            company_id: company_id,
          }),
          '',
          { information: `localhost,1` },
        );
        // supervisoryDataListAPI(company_id);
        if (supervisor_res.data.data) {
          supervisor_res.data.data.rows.forEach(element => {
            supervisorArray.push({
              value: element.user_id,
              label: element.userName,
            });
          });
          if (
            supervisory_ofline_list != null &&
            supervisory_ofline_list.length > 0
          ) {
            if (supervisory_ofline_list[0][company_id] != undefined) {
              JSON.parse(supervisory_ofline_list[0][company_id]).push({
                [company_id]: JSON.stringify(supervisorArray),
              });
            } else {
              supervisory_ofline_list.push({
                [company_id]: JSON.stringify(supervisorArray),
              });
            }
          } else {
            supervisory_ofline_list_arr.push({
              [company_id]: JSON.stringify(supervisorArray),
            });
            supervisory_ofline_list = supervisory_ofline_list_arr;
          }
          await setItem('supervisoryDataListAPI', supervisory_ofline_list);
        }
      } else {
        if (supervisory_ofline_list) {
          supervisory_ofline_list_arr = supervisory_ofline_list.filter(
            function (v, i) {
              return supervisory_ofline_list[i][company_id] != undefined;
            },
          );
          if (supervisory_ofline_list_arr.length != 0) {
            supervisorArray = JSON.parse(
              supervisory_ofline_list_arr[0][company_id],
            );
          } else {
            supervisorArray = [];
          }
        }
      }
      setSupervisorData(supervisorArray);
    } catch (error) {
      console.error(error.response);
    }
  };
  const handleCheckPassowrdConfirm = () => {
    const password = storeSignup.password;
    const cpassword = storeSignup.cpassword;
    if (password != cpassword) {
      // MessageDialog({ title: 'Password', message: `This Password Not Matched` })
      Toast.show({
        time: 3,
        text: t('please_enter_valid_password'),
        ...AlertMesg[0],
      });
    }
  };
  const checkPhone = async () => {
    if (storeSignup.country && storeSignup.company) {
      checkPhoneDigit();
    } else {
      Toast.show({
        time: 3,
        text: t('please_enter_valid_mobile_no'),
        ...AlertMesg[0],
      });
      // MessageDialog({ title: 'Require', message: 'Please fill in all required fields with valid data.' })
      setstoreSignup({ ...storeSignup, phone: '' });
      phoneInputRef.current.focus();
    }
  };
  const checkPhoneDigit = async () => {
    Keyboard.dismiss();
    try {
      if (netConnection) {
        let check_phone_digit_res = await axiosGet(
          ROUTES.GET.CHECK_PHONE_DIGIT({ countryId: storeSignup.country.value }),
          '',
          {
            information: `${storeSignup.company.dbname},${language_id}`,
            Accept: 'application/json',
          },
        );
        // checkPhoneDigitAPI(
        //   storeSignup.country.value,
        //   storeSignup.company.dbname,
        //   language_id,
        // );

        if (check_phone_digit_res.data.data.contact_no_digits) {
          let require_digit = check_phone_digit_res.data.data.contact_no_digits;

          if (storeSignup.phone.length === require_digit) {
            checkPhoneNo();
          } else {
            // MessageDialog({ title: 'Phone', message: `Please Enter Valid Phone digit` })
            Toast.show({
              time: 3,
              text: `Please Enter ${require_digit} digit phone no`,
              ...AlertMesg[0],
            });
            Keyboard.dismiss();
            // phoneInputRef.current.focus();
            setstoreSignup({ ...storeSignup, phone: '' });
          }
        }
      }
    } catch (error) {
      console.error('checkPhoneNo APi error code with :', error.response);
    }
  };
  const checkPhoneNo = async () => {
    try {
      const axiosConfig1 = {
        headers: {
          information: `${storeSignup.company.dbname}`,
          Accept: 'application/json',
        },
      };
      const inputBody = {
        contactNumber: storeSignup.phone,
        userType: '2',
      };
      let check_phone_res = await axios.post(
        config.phoneNoCheckAPI,
        inputBody,
        axiosConfig1,
      );
    } catch (error) {
      // CrashlyticsRecordError(error.response);
      // MessageDialog({
      //   title: 'Phone',
      //   message: `This ${storeSignup.phone} Not Available`,
      // });
      Toast.show({
        time: 3,
        text: `This ${storeSignup.phone} Not Available`,
        ...AlertMesg[0],
      });
      setstoreSignup({ ...storeSignup, phone: '' });
      phoneInputRef.current.focus();
    }
  };
  const validateForm = () => {
    if (!storeSignup.country.value) {
      Toast.show({
        time: 3,
        text: `${t('select_country_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeSignup.company.value) {
      Toast.show({ time: 3, text: `${t('pls_sel_com_first')}`, ...AlertMesg[0] });
      return false;
    }
    if (!storeSignup.supervisor.value) {
      Toast.show({
        time: 3,
        text: `${t('select_agent_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeSignup.phone) {
      Toast.show({
        time: 3,
        text: `${t('please_enter_valid_mobile_no')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeSignup.password) {
      Toast.show({ time: 3, text: `${t('enter_pass')}`, ...AlertMesg[0] });
      return false;
    }
    if (!storeSignup.cpassword) {
      Toast.show({ time: 3, text: `${t('enter_conf_pass')}`, ...AlertMesg[0] });
      return false;
    }
    const password = storeSignup.password;
    const cpassword = storeSignup.cpassword;
    if (password != cpassword) {
      Toast.show({ time: 3, text: `${t('same_con_password')}`, ...AlertMesg[0] });
      return false;
    }
    return true;
  };
  const saveHandle = async () => {
    Keyboard.dismiss();
    if (validateForm()) {
      await setItem('storeSignup_data', storeSignup);
      navigation.navigate('Persnol', { pagename: 'Financial' });
    }
  };
  const getDataFromLocalStorage = async () => {
    const storeSignup_data1 = await getItem('storeSignup_data');
    const storeSignup_data = JSON.parse(storeSignup_data1);
    if (storeSignup_data) {
      setstoreSignup(storeSignup_data);
      if (storeSignup_data?.country) {
        companyDataList(storeSignup_data?.country?.value, language_id);
      }
      if (storeSignup_data.company) {
        supervisorDataList(storeSignup_data.company.value);
      }
    }
  };
  const handleAddData = (name, value) => {
    setstoreSignup({ ...storeSignup, [name]: value });
  };
  useEffect(() => {
    getDataFromLocalStorage();
    countryDataList();
  }, [netConnection]);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#1d3122' }}
        edges={['top', 'right', 'bottom', 'left']}>
        <Root>
          <>
            {/* <StatusBar barStyle="light-content" backgroundColor={"#003c04"} /> */}
            <StatusBar barStyle="light-content" backgroundColor={Colors.green} />
            <View style={styles.container}>
              <View
                style={{
                  // height: 100,
                  backgroundColor: Colors.green,
                  borderBottomLeftRadius: 30,
                  borderBottomRightRadius: 30,
                  justifyContent: 'flex-end',
                }}>
                <View style={styles.headersContainer}>
                  <Text style={styles.headersTitle}>{t('Sign Up')}</Text>
                </View>
                <View style={styles.headerSubContainer}>
                  <Text style={styles.headerSubTitle}>
                    {t('Hello there, sign up to continue!')}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                {/* <KeyboardAvoidingView
              // behavior='position' keyboardVerticalOffset={keyboardVerticalOffset}
              behavior={Platform.OS === 'ios' ? 'padding' : null}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 50}> */}
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View
                    style={{
                      backgroundColor: Colors.useGreen,
                      alignSelf: 'flex-end',
                      marginTop: 10,
                      borderRadius: 40,
                      width: '10%',
                      // height: 30,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 20,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                      }}>
                      1/4
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Image
                      source={require('../pages/Common/images/logo.png')}
                      style={styles.logo}
                    />
                  </View>
                  <View style={styles.formContainer}>
                    <DropdownForm
                      data={countryData}
                      label={t('country')}
                      iconName="flag"
                      required={true}
                      // color="red"
                      onChange={country => {
                        countryHandle(country);
                      }}
                      val={storeSignup?.country?.label}
                    />
                    <DropdownForm
                      data={companyData}
                      label={t('new_reg_select_company')}
                      iconName="apartment"
                      required={true}
                      onChange={company => {
                        companyHandle(company);
                      }}
                      val={storeSignup.company.label}
                    />
                    <DropdownForm
                      data={supervisorData}
                      label={t('select_supervisor')}
                      iconName="supervisor-account"
                      required={true}
                      onChange={supervisor => {
                        setstoreSignup({ ...storeSignup, supervisor: supervisor });
                      }}
                      val={storeSignup.supervisor.label}
                    />
                    <InputTextForm
                      label={t('farmer_reg_mb')}
                      // color="red"
                      required={true}
                      value={storeSignup.phone}
                      onChangeText={phone => {
                        const numericPhone = phone.replace(/[^0-9]/g, ''); // Allow only digits
                        setstoreSignup({ ...storeSignup, phone: numericPhone });
                      }}
                      keyboardType="numeric"
                      onBlur={phone => checkPhone(phone)}
                      refname={phoneInputRef}
                      maxLength={10}
                    />

                    <PasswordComp
                      setPasswordVisibility={setPasswordVisibility}
                      passwordVisibility={passwordVisibility}
                      label={t('new_reg_password')}
                      onChangeText={value => handleAddData('password', value)}
                      value={storeSignup.password}
                      required={true}
                    />
                    <PasswordComp
                      setPasswordVisibility={setcPasswordVisibility}
                      passwordVisibility={cpasswordVisibility}
                      label={t('new_reg_confirm_password')}
                      onChangeText={value => handleAddData('cpassword', value)}
                      value={storeSignup.cpassword}
                      required={true}
                    />
                    <View style={styles.backLogin}>
                      <Text style={styles.allReady}>Already have an account ?</Text>

                      <Text
                        style={styles.login}
                        onPress={() => navigation.navigate('Login')}>
                        {t('Sign In')}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
                <ButtonForm
                  label={t('next')}
                  onPress={() => saveHandle()}
                  iconName="arrow-forward"
                  iconColor="#fff"
                  iconSize={25}
                  loading={isLoading}
                />
                {/* </KeyboardAvoidingView>
             */}
              </View>
            </View>
          </>
        </Root>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Signup;

const styles = StyleSheet.create({
  headersContainer: {
    marginHorizontal: '5%',

    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubContainer: {
    marginHorizontal: '5%',

    justifyContent: 'center',
    alignItems: 'center',
  },
  headersTitle: {
    paddingVertical: 5,
    // fontWeight: 'bold',
    fontSize: 22,
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
  },
  headerSubTitle: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Poppins-Regular',
    marginBottom: 10,
  },

  ////////////////////////////////////////////////////
  container: {
    flex: 1,
    backgroundColor: 'white',
    // marginBottom: 50,
  },

  formContainer: {
    backgroundColor: 'white',
    padding: 16,
    // borderRadius: 8,
    // borderWidth: 1,
    // borderColor: Colors.border,
    // // elevation:1,
    // marginVertical: 10,
  },
  formMargin: {
    marginHorizontal: 10,
    color: 'red',
    // marginBottom: 5,
  },
  passwordMainContainer: {
    alignItems: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ffffff',
    borderWidth: 0.5,
    borderRadius: 8,
    width: '100%',
    paddingEnd: 8,
    backgroundColor: '#ffffff',
    height: 50,
    marginBottom: 15,
  },

  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    alignItems: 'center',
  },
  idcontainer: {
    marginVertical: 10,
  },
  backLogin: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  allReady: {
    color: '#4e4e4e',
    fontSize: 14,
    fontFamily: Fonts.Regular,
  },
  login: {
    color: '#1d3122',
    fontSize: 14,
    paddingLeft: 10,
    fontFamily: Fonts.Regular,
  },
});
