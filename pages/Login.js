import {
  Keyboard,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Button,
  StatusBar,
  Modal,
} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import Logo from './Common/Logo';
import DropdownForm from './Common/DropdownForm';
import FilterDropDownForm from './Common/FilterDropDownForm';
import config from '../config';
import ButtonForm from './Common/ButtonForm';
import axios from 'axios';
import {getItem, removeItem, setItem} from '../config/getDataFromStorage';
import {
  databaseListAPI,
  fpodetailsDataListAPI,
  reginalDataServiceAPI,
  checkPhoneDigitAPI,
  DetailsCompany,
  defaultCurrAPI,
} from '../config/apiHere';
import MessageDialog from './Common/MessageDialog';
import i18next from './services/i18next';
import {useTranslation} from 'react-i18next';
import LoadingScreen from './Common/LoadingScreen';
import {Root, Popup, Toast} from 'react-native-popup-confirm-toast';
import Checkbox from './Common/CheckboxCom';
import {AlertMesg} from './Common/ToastAlert';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {
  useNavigation,
  useIsFocused,
  StackActions,
} from '@react-navigation/native';
import {Permission, PERMISSIONS_TYPE} from './AppPermission/AppPermission';
import ForegroundLocationService from './BackgroundService/ForegroundLocationService';
import NotificationServices from './PushNotification/NotificationServices';
import DeviceInfo from './DeviceInfo';
import {userCreateContext} from './Context/usersCreateContext';
import DropdownForm11 from './Common/DropdownForm11';
import CompanyDropdown from './Common/CompanyDropdown11';
import {axiosPost, axiosGet} from './utils/api';
import {ROUTES} from './utils/Routes';

const Login = ({route}) => {
  const {setlogoImage, settopBanner, AllFarmerList, t} =
    useContext(userCreateContext);
  const {netConnection} = DeviceInfo();
  const roleData = [
    {label: t('login_farmer'), value: '2'},
    {label: t('retailer'), value: '3'},
  ];
  const [checked, setChecked] = useState(false);
  const {requestUserPermission, notificationListener} = NotificationServices();
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [companyData, setCompanyData] = useState([]);
  const [navigationTo, setNavigationTo] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // let navigationTo = '';
  const [companyLanguage, setcompanyLanguage] = useState({
    company: '',
    language: '',
    company_id: '',
    company_name: '',
  });
  const [contact_no_digits, setcontact_no_digits] = useState(11);
  const [storeLoginUser, setstoreLoginUser] = useState({
    FcmUserToken: '',
    IMEINumber: '123456',
    company: '',
    contactNumber: '',
    password: '',
    role: '',
    company_lable: '',
  });
  const [remUser, setRemUser] = useState({
    company: '',
    contactNumber: '',
    password: '',
    role: '',
    company_lable: '',
  });
  const validateForm = () => {
    Keyboard.dismiss();
    if (!storeLoginUser.phone) {
      Toast.show({
        time: 3,
        text: `${t('forgotpassword_mb')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (storeLoginUser.phone.length < contact_no_digits) {
      Toast.show({
        time: 3,
        text: `${t('please_enter_valid_mobile_no')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeLoginUser.password) {
      Toast.show({
        time: 3,
        text: `${t('enter_pass')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeLoginUser.role) {
      Toast.show({
        time: 3,
        text: `${t('please_select_role_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeLoginUser.company) {
      Toast.show({
        time: 3,
        text: `${t('pls_sel_com_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    return true;
  };
  const saveHandle = async () => {
    const [fcmToken_res, remData] = await Promise.all([
      getItem('fcmToken'),
      getItem('rememberData'),
    ]);
    // console.log('validateForm', validateForm);
    if (validateForm()) {
      const inputdata = {
        FcmUserToken: fcmToken_res,
        IMEINumber: '123456',
        company: storeLoginUser.company,
        contactNumber: storeLoginUser.phone,
        password: storeLoginUser.password,
        type: storeLoginUser.role,
      };
      try {
        setIsLoading(true);
        let userIno = await axiosPost(ROUTES.POST.LOGIN, inputdata);

        if (userIno?.status === 200) {
          setRemUser({
            ...remUser,
            phone: storeLoginUser.phone,
            password: storeLoginUser.password,
            role: storeLoginUser.role,
            company: storeLoginUser.company,
            company_lable: storeLoginUser.company_lable,
          });
          const loginUserdata = userIno.data.data[0];
          const {
            dbname,
            lan_id,
            agri_user_addresses,
            microCompany,
            db_company_id,
          } = loginUserdata;
          const details_company_res = await axiosGet(
            ROUTES.GET.DETAILS_COMPANY(loginUserdata?.db_company_id),
            '',
            {
              information: `${loginUserdata?.dbname},${1}`,
            },
          );
          // DetailsCompany(
          //   loginUserdata?.dbname,
          //   1,
          //   loginUserdata?.db_company_id,
          // );
          if (details_company_res?.status == 200) {
            await setItem('side_menu_option', {
              soil_testing: details_company_res?.data?.data[0]?.soil_testing,
              agri_calculator:
                details_company_res?.data?.data[0]?.agri_calculator,
            });
          }
          // db_name:dbname, company_id:value, agri_company.country_id:country_id
          await Promise.all([
            setItem('userNameData', loginUserdata?.userName),
            setItem('userType', loginUserdata?.userType),
            setItem('companyLanguage_data', {
              language: lan_id,
              company: dbname,
              company_id: db_company_id,
              country_id: microCompany?.country_id,
            }),
          ]);
          if (loginUserdata?.agri_files.length > 0) {
            const profileImg = loginUserdata?.agri_files?.find(
              item => item.term_type === '1',
            );
            if (typeof profileImg != 'undefined') {
              await setItem('profileImgData', profileImg.file_path);
            }
          } else {
            await setItem('profileImgData', '');
          }
          await setItem('loginUser_data', loginUserdata);
          await setItem('companyFirstEntry', 0);
          setstoreLoginUser({
            ...storeLoginUser,
            phone: '',
            password: '',
            role: '',
            company_lable: '',
          });
          const [fpoDetailsList_res, reginalRes, defaultCurrRes] =
            await Promise.all([
              axiosGet(
                ROUTES.GET.FPO_DETAILS({
                  compCode: loginUserdata.sa_company[0].company_code,
                }),
                loginUserdata.token,
                {
                  information: `${loginUserdata.dbname},${loginUserdata.lan_id},${loginUserdata.user_id}`,
                },
              ),
              // fpodetailsDataListAPI(
              //   loginUserdata.dbname,
              //   loginUserdata.lan_id,
              //   loginUserdata.token,
              //   loginUserdata.user_id,
              //   loginUserdata.sa_company[0].company_code,
              // ),

              axiosGet(ROUTES.GET.REGINAL_DATA_SERVICE(), '', {
                information: `${loginUserdata.dbname},${loginUserdata.lan_id}`,
              }),
              // reginalDataServiceAPI(
              //   loginUserdata.dbname,
              //   loginUserdata.lan_id,
              //   'regionaldatas',
              // ),

              axiosGet(ROUTES.GET.DEFAULT_CURRENCY(), loginUserdata.token, {
                information: `${loginUserdata.dbname},${loginUserdata.lan_id}`,
              }),
              // defaultCurrAPI(
              //   loginUserdata.dbname,
              //   loginUserdata.lan_id,
              //   loginUserdata.token,
              // ),
            ]);

          if (defaultCurrRes?.status === 200) {
            if (defaultCurrRes.data.data.rows.length > 0) {
              await setItem(
                'currency',
                defaultCurrRes.data.data.rows[0].symbol,
              );
            } else {
              Toast.show({
                time: 1,
                text: `Please ask to set currency by admin`,
                ...AlertMesg[0],
              });
            }
          }

          if (fpoDetailsList_res?.status === 200) {
            //   i18next.changeLanguage(`${loginUserdata?.lan_id}`);
            const {company_website} = fpoDetailsList_res.data[0];
            var url_regex = /^(http|https)/;
            if (url_regex.test(String(company_website).toLowerCase()) == true) {
              await setItem('company_website', company_website);
            } else {
              await setItem('company_website', `https://${company_website}`);
            }
          }

          if (reginalRes?.status === 200) {
            const datam = reginalRes?.data?.data?.rows;
            datam.map(async item => {
              if (item.static_cid === 1) {
                await setItem('state', item.categoryName);
              } else if (item.static_cid === 2) {
                await setItem('district', item.categoryName);
              } else if (item.static_cid === 3) {
                await setItem('block', item.categoryName);
              }
              //   else if (item.static_cid === 4) {
              //     await setItem('currency', item.categoryName);
              //   }
            });
          }
          if (fpoDetailsList_res?.status === 200) {
            const agri_files = fpoDetailsList_res?.data[0]?.agri_files;
            const foundbotomBannerFind = agri_files?.find(
              item => item.term_type === 'fpo_promobanner',
            );
            if (typeof foundbotomBannerFind != 'undefined') {
              await setItem('bottomBannerData', foundbotomBannerFind.file_path);
            }
            const foundlogoFindFind = agri_files?.find(
              item => item.term_type === 'fpo_logo',
            );
            if (typeof foundlogoFindFind != 'undefined') {
              await setItem('logoImageData', foundlogoFindFind.file_path);
              setlogoImage(foundlogoFindFind.file_path);
            }
            const foundtopBannerFind = agri_files?.find(
              item => item.term_type === 'fpo_banner',
            );
            if (typeof foundtopBannerFind != 'undefined') {
              await setItem('topBannerData', foundtopBannerFind.file_path);
              settopBanner(foundtopBannerFind.file_path);
            }
            AllFarmerList();
            setIsLoading(false);
            if (checked) {
              await setItem('rememberData', {
                company: storeLoginUser.company,
                contactNumber: storeLoginUser.phone,
                password: storeLoginUser.password,
                type: storeLoginUser.role,
                companyName: storeLoginUser.company_lable,
              });

              // setRemUser({
              //   ...remUser,
              //   phone: storeLoginUser.phone,
              //   password: storeLoginUser.password,
              //   role: storeLoginUser.role,
              //   company: storeLoginUser.company,
              //   company_lable: storeLoginUser.company_lable,
              // });

              setcompanyLanguage({
                ...companyLanguage,
                company: remUser.company,
                language: '',
                company_id: remUser.company,
                company_name: remUser.company_lable,
              });
              if (loginUserdata?.userType === 3) {
                navigation.navigate('AdminNavigation');
              } else if (loginUserdata?.userType === 2) {
                navigation.navigate('FarmerNavigation');
              }
            } else {
              await setItem('rememberData', {
                company: '',
                contactNumber: '',
                password: '',
                type: '',
              });
              setcompanyLanguage({
                ...companyLanguage,
                company: '',
                language: '',
                company_id: '',
                company_name: '',
              });
              if (loginUserdata?.userType === 3) {
                navigation.navigate('AdminNavigation');
              } else if (loginUserdata?.userType === 2) {
                navigation.navigate('FarmerNavigation');
              }
            }
          }
        }
      } catch (error) {
        console.log('ERRor', error);
        Toast.show({
          text: `${error?.data?.error?.errorMessage}`,
          ...AlertMesg[0],
        });
        setIsLoading(false);
      }
    }
  };
  const onPageLoad = async () => {
    const [companyFirstEntry, rememberData, companyLanguage_data, company_res] =
      await Promise.all([
        getItem('companyFirstEntry'),
        getItem('rememberData'),
        getItem('companyLanguage_data'),

        axiosGet(ROUTES.GET.DATABASE_LIST(), ''),
        // databaseListAPI(),
        removeItem('storeSignup_data'),
        removeItem('storePersnolInfo_data'),
        removeItem('storeFinancial_data'),
        removeItem('storeProduceInfo_data'),
        requestUserPermission(),
        notificationListener(),
        Permission.requestMultiple([
          PERMISSIONS_TYPE.microphone,
          PERMISSIONS_TYPE.fineLocation,
          PERMISSIONS_TYPE.notifications,
        ]),
        removeItem('side_menu_option'),
      ]);

    // else {
    //   setcompanyLanguage({
    //     ...companyLanguage,
    //     company: '',
    //     language: '',
    //     company_id: '',
    //     company_name: '',
    //   });
    // }

    if (companyLanguage_data != '' && companyLanguage_data != null) {
      setcompanyLanguage(companyLanguage_data);
      const {country_id, company, language} = companyLanguage_data;
      checkPhoneNumber(country_id, company, language);

      if (companyFirstEntry == 1) {
        setstoreLoginUser({
          ...storeLoginUser,
          phone: '',
          password: '',
          role: '',
          company: companyLanguage_data.company_id,
          // FcmUserToken: fcmToken_res,
        });
      } else {
        if (rememberData?.contactNumber.length > 4) {
          setstoreLoginUser({
            ...storeLoginUser,
            phone: rememberData.contactNumber,
            password: rememberData.password,
            role: rememberData.type,
            company: rememberData.company,
            // FcmUserToken: fcmToken_res,
          });
          setcompanyLanguage({
            ...companyLanguage,
            company_name: rememberData.company_name,
          });
        } else {
          setstoreLoginUser({
            ...storeLoginUser,
            phone: '',
            password: '',
            role: '',
            company: '',
          });
          setcompanyLanguage({
            ...companyLanguage,
            company_name: '',
          });
        }
      }
    }

    if (company_res.status == 200) {
      let companyArray = [];
      company_res?.data?.data?.map((data, index) => {
        const {company_id, agri_company, db_name} = data;
        companyArray.push({
          value: company_id,
          label: agri_company.company_name,
          dbname: db_name,
          country_id: agri_company.country_id,
        });
      });
      setCompanyData(companyArray);
    }
  };
  useEffect(() => {
    try {
      onPageLoad();
      // PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      if (route.params === undefined) {
        i18next.changeLanguage('1');
      } else {
        i18next.changeLanguage(`${route.params.locale}`);
      }
    } catch (err) {
      console.error(err);
    }
  }, [netConnection]);
  useEffect(() => {}, []);
  const onChangeConpany = async item => {
    // db_name:dbname, company_id:value, agri_company.country_id:country_id
    const {country_id, dbname, value, label} = item;
    const {language} = companyLanguage;
    setstoreLoginUser(prev => ({
      ...prev,
      company: value,
      company_lable: label,
    }));
    checkPhoneNumber(country_id, dbname, language);
  };
  const checkPhoneNumber = async (country_id, company, language) => {
    const checkPhoneNumber = await axiosGet(
      ROUTES.GET.CHECK_PHONE_DIGIT({countryId: country_id}),
      '',
      {
        information: `${company},${language}`,
        Accept: 'application/json',
      },
    );
    // checkPhoneDigitAPI(
    //   country_id,
    //   company,
    //   language,
    // );

    if (checkPhoneNumber.status == 200) {
      const {contact_no_digits} = checkPhoneNumber.data?.data;
      setcontact_no_digits(contact_no_digits);
    }
  };
  return (
    <Root>
      <ForegroundLocationService />
      <StatusBar barStyle="light-content" backgroundColor="#023316" />
      <ScrollView>
        <View style={styles.mainContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../pages/Common/images/greenqube_logo.png')}
              style={styles.logo}
            />
          </View>
          <View style={styles.inputContainerView}>
            {isLoading && (
              <View style={styles.loadingScreen}>
                <LoadingScreen />
              </View>
            )}
            <View style={styles.signInView}>
              <Text style={styles.signInText}>{t('sign_in')}</Text>
              <Text style={styles.signInSubText}>
                {t('Hello there, sigh in to continue!')}
              </Text>
            </View>

            <View style={styles.phoneNoView}>
              <MaterialIcons
                name="phone"
                size={20}
                style={styles.icon}
                color="#767676"
              />
              <TextInput
                style={styles.simpleInputTextStyle}
                placeholderTextColor={'#8c8c8c'}
                placeholder={t('enter_your_registered_Phone_no')}
                keyboardType="numeric"
                value={storeLoginUser.phone}
                onChangeText={phone =>
                  setstoreLoginUser({...storeLoginUser, phone: phone})
                }
                maxLength={contact_no_digits}
              />
            </View>

            <View style={styles.passwordView}>
              <MaterialIcons
                name="lock"
                size={18}
                color="#767676"
                style={styles.icon}
              />
              <TextInput
                style={styles.simpleInputTextStyle}
                placeholderTextColor={'#8c8c8c'}
                placeholder={t('enter_your_Password')}
                secureTextEntry={!showPassword}
                onChangeText={password =>
                  setstoreLoginUser({...storeLoginUser, password: password})
                }
                value={storeLoginUser.password}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={22}
                  color="#8c8c8c"
                />
              </TouchableOpacity>
            </View>

            <View style={{marginTop: 20}}>
              <DropdownForm11
                data={roleData}
                label={t('select_role')}
                searchPlaceholder="Search by role"
                onChange={role =>
                  setstoreLoginUser({...storeLoginUser, role: role.value})
                }
                val={storeLoginUser.role}
                dropdownStyle={{
                  width: '100%',
                  borderWidth: 0.5,
                  backgroundColor: '#f4f4f4',
                }}
              />
            </View>

            <View style={{marginTop: 10}}>
              <CompanyDropdown
                data={companyData}
                label={t('select_company')}
                onChange={company => onChangeConpany(company)}
                val={companyLanguage.company_id}
                diffLabel={companyLanguage.company_name}
                selectedValue={storeLoginUser.company}
                dropdownStyle={{
                  width: '100%',
                  borderWidth: 0.5,
                  backgroundColor: '#f4f4f4',
                }}
              />
            </View>

            <View style={styles.checkBoxAndForgotPass}>
              <View style={styles.rememberMeContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, checked && styles.ifCheckedBox]}
                  onPress={() => setChecked(!checked)}>
                  {checked && (
                    <MaterialIcons
                      name="check"
                      size={16}
                      color="white"
                      style={{position: 'absolute'}}
                    />
                  )}
                </TouchableOpacity>
                <Text style={styles.rememberMe}>{t('Remember_me')}</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPassword}>
                  {t('forgot_Password')}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.signInButton,
                storeLoginUser.phone && storeLoginUser.password
                  ? styles.signInButtonActive
                  : styles.signInButtonInactive,
              ]}
              onPress={saveHandle}
              disabled={!storeLoginUser.phone || !storeLoginUser.password}>
              <Text style={styles.signInBtnText}>{t('sign_in')}</Text>
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.dontHaveAccount}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signUpText}>
                  {t('Create')} {t('account')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </Root>
  );
};

export default Login;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  logo: {
    width: 250,
    height: 100,
    resizeMode: 'contain',
  },
  inputContainerView: {
    flex: 1,
  },
  signInView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  signInText: {
    fontSize: 18,
    color: 'black',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  signInSubText: {
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
    color: 'black',
  },
  phoneNoView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#8c8c8c',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 15,
  },
  passwordView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#8c8c8c',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 15,
    marginTop: 20,
  },
  simpleInputTextStyle: {
    flex: 1,
    color: 'black',
    fontSize: 14,
  },
  checkBoxAndForgotPass: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 17,
    height: 17,
    borderWidth: 1,
    borderColor: '#8c8c8c',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  ifCheckedBox: {
    backgroundColor: '#59b300',
    borderColor: '#59b300',
  },
  rememberMe: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Poppins-Regular',
  },
  forgotPassword: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Poppins-Regular',
  },
  signInButton: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 20,
  },
  signInButtonActive: {
    backgroundColor: '#339933',
  },
  signInButtonInactive: {
    backgroundColor: '#acacac',
  },
  signInBtnText: {
    color: 'white',
    fontSize: 18,
    // fontWeight: '500',
    fontFamily: 'Poppins-Regular',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dontHaveAccount: {
    fontSize: 14,
    color: '#939393',
    fontFamily: 'Poppins-Regular',
  },
  signUpText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
  },
  icon: {
    marginRight: 10,
  },
  loadingScreen: {
    position: 'absolute',
    top: 200,
    zIndex: 999,
    left: '45%',
  },
});
