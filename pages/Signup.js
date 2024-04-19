import {
  Keyboard,
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Logo from './Common/Logo';
import DropdownForm from './Common/DropdownForm';
import ButtonForm from './Common/ButtonForm';
import InputTextForm from './Common/InputTextForm';
import {useNavigation} from '@react-navigation/native';
import MessageDialog from './Common/MessageDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  countryDataListAPI,
  companyDataListAPI,
  supervisoryDataListAPI,
  checkPhoneNoAPI,
  checkPhoneDigitAPI,
} from '../config/apiHere';
import axios from 'axios';
import config from '../config';
import {isNotEmpty} from './Common/ValidationFunctions';
import {Permission, PERMISSIONS_TYPE} from './Common/AppPermission';
import {request, PERMISSIONS} from 'react-native-permissions';
import {Root, Popup, Toast} from 'react-native-popup-confirm-toast';
import {AlertMesg} from './Common/ToastAlert';
import {getItem, setItem} from '../config/getDataFromStorage';
import {useTranslation} from 'react-i18next';
import PasswordComp from './Common/PasswordComp';
import ForegroundLocationService from './BackgroundService/ForegroundLocationService';
import {CrashlyticsRecordError} from './Crashlytics/CrashlyticsRecordError';
import DeviceInfo from './DeviceInfo';
const Signup = () => {
  const {netConnection} = DeviceInfo();
  const {t} = useTranslation();
  const navigation = useNavigation();
  const language_id = 1;
  const [storeSignup, setstoreSignup] = useState({
    country: '1',
    company: '9',
    supervisor: '9143f2e4-819a-463c-8f30-dbcff9b37323',
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
        const country_res = await countryDataListAPI();
        if (country_res.data.data) {
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
        let company_res = await companyDataListAPI(country_id, language_id);
        if (company_res.data.data) {
          company_res.data.data.agri_companies.forEach(element => {
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
            company_list_arr.push({[country_id]: JSON.stringify(companyArray)});
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
    setstoreSignup({...storeSignup, company: company, supervisor: ''});
    supervisorDataList(company.value);
  };
  let supervisorDataList = async company_id => {
    try {
      let supervisorArray = [];
      let supervisory_ofline_list_arr = [];
      let supervisory_ofline_list = await getItem('supervisoryDataListAPI');
      if (netConnection) {
        let supervisor_res = await supervisoryDataListAPI(company_id);
        // console.log(supervisor_res);
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
        text: `This Password Not Matched`,
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
        text: `Please enter phone no`,
        ...AlertMesg[0],
      });
      // MessageDialog({ title: 'Require', message: 'Please fill in all required fields with valid data.' })
      setstoreSignup({...storeSignup, phone: ''});
      phoneInputRef.current.focus();
    }
  };
  const checkPhoneDigit = async () => {
    try {
      // if (netConnection) {
      //   let check_phone_digit_res = await checkPhoneDigitAPI(
      //     storeSignup.country.value,
      //     // storeSignup.company.dbname,
      //     'nasc_greenqube',
      //     language_id,
      //   );
      //   if (check_phone_digit_res.data.data.contact_no_digits) {
      //     let require_digit = check_phone_digit_res.data.data.contact_no_digits;

          if (storeSignup.phone.length === 10) {
            // checkPhoneNo();
          } else {
            // MessageDialog({ title: 'Phone', message: `Please Enter Valid Phone digit` })
            Toast.show({
              time: 3,
              text: `Please Enter 10 digit phone no`,
              ...AlertMesg[0],
            });
            Keyboard.dismiss();
            // phoneInputRef.current.focus();
            setstoreSignup({...storeSignup, phone: ''});
          }
      //   }
      // }
    } catch (error) {
      console.error('checkPhoneNo APi error code with :', error.response);
    }
  };
  const checkPhoneNo = async () => {
    try {
      const axiosConfig1 = {
        headers: {
          information: `nasc_greenqube`,
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
      console.log(error.response);
      CrashlyticsRecordError(error.response);
      MessageDialog({
        title: 'Phone',
        message: `This ${storeSignup.phone} Not Available`,
      });
      setstoreSignup({...storeSignup, phone: ''});
      phoneInputRef.current.focus();
    }
  };
  const validateForm = () => {
    if (!storeSignup.country) {
      Toast.show({
        time: 3,
        text: `${t('select_country_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeSignup.company) {
      Toast.show({time: 3, text: `${t('pls_sel_com_first')}`, ...AlertMesg[0]});
      return false;
    }
    if (!storeSignup.supervisor) {
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
      Toast.show({time: 3, text: `${t('enter_pass')}`, ...AlertMesg[0]});
      return false;
    }
    if (!storeSignup.cpassword) {
      Toast.show({time: 3, text: `${t('enter_conf_pass')}`, ...AlertMesg[0]});
      return false;
    }
    const password = storeSignup.password;
    const cpassword = storeSignup.cpassword;
    if (password != cpassword) {
      Toast.show({time: 3, text: `${t('same_con_password')}`, ...AlertMesg[0]});
      return false;
    }
    return true;
  };
  const saveHandle = async () => {
    Keyboard.dismiss();
    if (validateForm()) {
      await setItem('storeSignup_data', storeSignup);
      navigation.navigate('Persnol', {pagename: 'ProduceInfo'});
    }
  };
  const getDataFromLocalStorage = async () => {
    const storeSignup_data1 = await getItem('storeSignup_data');
    const storeSignup_data = JSON.parse(storeSignup_data1);
    if (storeSignup_data) {
      setstoreSignup(storeSignup_data);
      if (storeSignup_data.country) {
        companyDataList(storeSignup_data.country.value, language_id);
      }
      if (storeSignup_data.company) {
        supervisorDataList(storeSignup_data.company.value);
      }
    }
  };
  const handleAddData = (name, value) => {
    setstoreSignup({...storeSignup, [name]: value});
  };
  useEffect(() => {
    getDataFromLocalStorage();
    countryDataList();
  }, [netConnection]);
  return (
    <>
      <Root>
        {/* <StatusBar barStyle="light-content" backgroundColor={"#003c04"} /> */}
        <View style={styles.container}>
          <View style={{height: 60, backgroundColor: '#003c04'}}></View>
          <View style={styles.headersContainer}>
            <Text style={styles.headersTitle}>{t('new_registration')}</Text>
            <Text style={styles.headersTitle}>{t('login_information')}</Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{alignItems: 'center'}}>
                <Image
                  source={require('../pages/Common/images/greenqube_logo.png')}
                  style={styles.logo}
                />
              </View>
              <View style={styles.formContainer}>
                {/* <DropdownForm
                  data={countryData}
                  label={t('country')}
                  color="red"
                  onChange={country => {
                    countryHandle(country);
                  }}
                  val={storeSignup.country.label}
                />
                <DropdownForm
                  data={companyData}
                  label={t('new_reg_select_company')}
                  color="red"
                  onChange={company => {
                    companyHandle(company);
                  }}
                  val={storeSignup.company.label}
                />
                <DropdownForm
                  data={supervisorData}
                  label={t('select_supervisor')}
                  color="red"
                  onChange={supervisor => {
                    setstoreSignup({...storeSignup, supervisor: supervisor});
                  }}
                  val={storeSignup.supervisor.label}
                /> */}
                <InputTextForm
                  label={t('farmer_reg_mb')}
                  color="red"
                  value={storeSignup.phone}
                  onChangeText={phone =>
                    setstoreSignup({...storeSignup, phone: phone})
                  }
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
                />
                <PasswordComp
                  setPasswordVisibility={setcPasswordVisibility}
                  passwordVisibility={cpasswordVisibility}
                  label={t('new_reg_confirm_password')}
                  onChangeText={value => handleAddData('cpassword', value)}
                  value={storeSignup.cpassword}
                />
              </View>
            </ScrollView>
          </View>
        </View>
        <ButtonForm label={t('next')} onPress={() => saveHandle()} />
      </Root>
    </>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginBottom: 50,
  },
  headersContainer: {
    marginHorizontal: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headersTitle: {
    paddingVertical: 5,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  formContainer: {
    marginTop:10,
    marginBottom: 60,
    marginHorizontal: '2.5%',
    paddingHorizontal: '5%',
    paddingTop: '10%',
    paddingBottom: '4%',
    backgroundColor: '#E9FCC5',
    borderRadius: 20,
    elevation: 2,
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
  inputTextStyle: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
    borderColor: 'gray',
    color: '#000',
  },
  simpleInputTextStyle: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    backgroundColor: 'white',
    paddingLeft: 10,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignItems: 'center',
  },
});
