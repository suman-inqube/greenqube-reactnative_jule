import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Keyboard,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import ButtonForm from '../../Common/ButtonForm';
import {AlertMesg} from '../../Common/ToastAlert';
import {
  useRoute,
  useFocusEffect,
  useNavigation,
  StackActions,
} from '@react-navigation/native';
import {ChangePasswordApi} from '../../../config/apiHere';
import {getItem, removeItem} from '../../../config/getDataFromStorage';
const qs = require('qs');
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fronts} from '../../utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const ChangePassword = ({sendDataToParent}) => {
  //GQR-67
  const {
    loginUser_data,
    dbLanTokUsr,
    t,
    CustomHeader,
    FormsTitle,
    logoImage,
    topBanner,
    Root,
    Popup,
    Toast,
    onBackPress,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-67
  const navigation = useNavigation();
  const route = useRoute();
  const [cpasswordVisibility, setcPasswordVisibility] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState('');
  const [forgetPassword, setforgetPassword] = useState({
    password: '',
    cpassword: '',
  });
  const handleCheckPassowrdConfirm = () => {
    const password = forgetPassword.password;
    const cpassword = forgetPassword.cpassword;
    // if (password != cpassword) {
    //     Toast.show({ text: `${t('same_con_password')}`, ...AlertMesg[0] })
    //     setforgetPassword({ ...forgetPassword, cpassword: "" })
    // }
  };
  const handleSave = async () => {
    Keyboard.dismiss();
    if (forgetPassword.password == '') {
      Toast.show({text: `${t('please_enter_old_password')}`, ...AlertMesg[0]});
    } else if (forgetPassword.cpassword == '') {
      Toast.show({text: `${t('please_enter_new_password')}`, ...AlertMesg[0]});
    } else {
      let save_data = qs.stringify({
        oldPassword: forgetPassword.password,
        newPassword: forgetPassword.cpassword,
        userType: 3,
      });
      const changePassword = await ChangePasswordApi(
        dbname,
        lan_id,
        user_id,
        save_data,
      );
      console.log(changePassword.data);
      if (changePassword?.status == 200) {
        setforgetPassword({...forgetPassword, password: '', cpassword: ''});
        Toast.show({
          text: `${t('password_change_successfully')}`,
          ...AlertMesg[0],
        });
        await Promise.all([
          removeItem('logoImageData'),
          removeItem('loginUser_data'),
          removeItem('profileImgData'),
          removeItem('userNameData'),
          removeItem('userType'),
          removeItem('bottomBannerData'),
          removeItem('topBannerData'),
        ]);
        const popAction = StackActions.pop(1);
        navigation.dispatch(popAction);
        navigation.navigate('Login');
      }
    }
  };
  useEffect(() => {
    // onPageLoad();
    onBackPress(() => {
      navigation.navigate('Dashboard');
      return true;
    });
  }, []);
  const HandlerGoBack = () => navigation.navigate('Dashboard');
  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <Root>
          <View style={styles.container}>
            <CustomHeader
              path="Dashboard"
              HandlerGoBack={HandlerGoBack}
              logoImage={logoImage}
              topBanner={topBanner}
            />
            <FormsTitle title={t('change_password')} />
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Image
                source={require('../../Common/images/changepass.png')}
                style={{width: '80%', height: 180}}
              />
            </View>

            <View style={styles.forgotContainer}>
              <Text style={styles.formMargin}>
                {t('please_enter_old_password')}
              </Text>
              <View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    secureTextEntry={passwordVisibility ? false : true}
                    style={styles.inputTextStyle}
                    placeholderTextColor={'#000'}
                    onChangeText={passsword =>
                      setforgetPassword({
                        ...forgetPassword,
                        password: passsword,
                      })
                    }
                    value={forgetPassword.password}
                  />
                  <TouchableOpacity
                    onPress={() => setPasswordVisibility(!passwordVisibility)}>
                    {passwordVisibility ? (
                      <MaterialIcons
                        name="visibility"
                        size={25}
                        color="#1d3122"
                      />
                    ) : (
                      <MaterialIcons
                        name="visibility-off"
                        size={25}
                        color="#1d3122"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.formMargin}>
                {t('please_enter_new_password')}
              </Text>
              <View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    secureTextEntry={cpasswordVisibility ? false : true}
                    style={styles.inputTextStyle}
                    placeholderTextColor={'#000'}
                    onChangeText={cpassword =>
                      setforgetPassword({
                        ...forgetPassword,
                        cpassword: cpassword,
                      })
                    }
                    onBlur={handleCheckPassowrdConfirm}
                    value={forgetPassword.cpassword}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setcPasswordVisibility(!cpasswordVisibility)
                    }>
                    {cpasswordVisibility ? (
                      <MaterialIcons
                        name="visibility"
                        size={25}
                        color="#1d3122"
                      />
                    ) : (
                      <MaterialIcons
                        name="visibility-off"
                        size={25}
                        color="#1d3122"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.buttonForm}>
              <ButtonForm
                label={t('submit')}
                onPress={() => handleSave()}
                iconName="check-circle"
                iconColor="#fff"
                iconSize={30}
              />
            </View>
          </View>
        </Root>
      </>
    </FarmerDrawerScreenWrapper1>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.pageBackground,
    // height: '100%',
    flex: 1,
  },
  forgotContainer: {
    backgroundColor: Colors.containerGreen,
    // marginTop: 30,
    borderRadius: 25,
    elevation: 3,
    marginHorizontal: '4%',
    borderWidth: 1,
    borderColor: Colors.borderGreen,
    // paddingTop: 10,
    // marginBottom: 30,
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  passwordContainer: {
    marginHorizontal: 15,
    flexDirection: 'row',
    borderWidth: 1,
    alignItems: 'center',
    // marginVertical: 10,
    borderRadius: 8,
    marginBottom: 30,
    borderColor: Colors.secondary,

    backgroundColor: '#FFFFFF',
  },
  passwordContainer2: {
    marginHorizontal: 15,
    flexDirection: 'row',
    borderWidth: 1,
    alignItems: 'center',
    // marginVertical: 10,
    borderRadius: 8,
    // marginBottom: 10,
    borderColor: Colors.secondary,

    backgroundColor: '#FFFFFF',
  },
  inputTextStyle: {
    width: '90%', //efe9e9
    color: '#000',
  },
  buttonForm: {
    marginTop: 30,
  },
  titleForgot: {
    textAlign: 'center',
    paddingVertical: 10,
    paddingBottom: 20,
    fontSize: 20,
    color: '#037e03',
  },
  formMargin: {
    color: '#000',
    fontSize: 14,
  },
});
