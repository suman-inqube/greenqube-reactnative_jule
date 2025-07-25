import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Keyboard,
} from 'react-native';
import React, {useEffect, useState, useCallback, useContext} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {UserPasswordUpdate} from '../userlist/UsersAPI';
const qs = require('qs');
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fronts} from '../../utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const FarmerChangePassword = ({navigation}) => {
  //GQR-67
  const {
    loginUser_data,
    ButtonForm,
    Root,
    Toast,
    AlertMesg,
    t,
    onBackPress,
    CustomHeader,
    logoImage,
    topBanner,
    FormsTitle,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, owner, user_id} = loginUser_data;
  //GQR-67
  const [nPasswordVisibility, setnPasswordVisibility] = useState('');
  const [oPasswordVisibility, setoPasswordVisibility] = useState('');
  const [Password, setPassword] = useState({opassword: '', cpassword: ''});
  useFocusEffect(
    useCallback(() => {
      onBackPress(() => {
        navigation.navigate('FarmerDashboard');
        return true;
      });
    }, []),
  );
  const validation = () => {
    Keyboard.dismiss();
    if (Password.opassword == '') {
      Toast.show({text: `${t('please_enter_old_password')}`, ...AlertMesg[0]});
      return false;
    } else if (Password.cpassword == '') {
      Toast.show({text: `${t('please_enter_new_password')}`, ...AlertMesg[0]});
      return false;
    }
    return true;
  };
  const handleSave = async () => {
    if (validation()) {
      let formData = qs.stringify({
        oldPassword: Password.opassword,
        newPassword: Password.cpassword,
        userType: '2',
      });
      const userDataUpdate = await UserPasswordUpdate(
        dbname,
        lan_id,
        user_id,
        token,
        formData,
      );
      if (userDataUpdate.status === 200) {
        setPassword({
          ...Password,
          opassword: '',
          cpassword: '',
        });
        Toast.show({text: t('Password_update_successfully'), ...AlertMesg[0]});
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1000);
      } else if (userDataUpdate.status === 400) {
        Toast.show({text: t('Old_Password_Is_Incorrect'), ...AlertMesg[0]});
      } else {
        Toast.show({
          text: t('Please_try_again_some_time_later'),
          ...AlertMesg[0],
        });
      }
    }
  };
  const HandlerGoBack = () => navigation.navigate('FarmerDashboard');
  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <Root>
          <View style={styles.container}>
            <CustomHeader
              path="FarmerDashboard"
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
                    secureTextEntry={oPasswordVisibility ? false : true}
                    style={styles.inputTextStyle}
                    onChangeText={pword =>
                      setPassword({...Password, opassword: pword})
                    }
                    value={Password.opassword}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setoPasswordVisibility(!oPasswordVisibility)
                    }>
                    {oPasswordVisibility ? (
                      <MaterialIcons
                        name="visibility"
                        size={25}
                        color="#1d3122"
                      />
                    ) : (
                      //   <Image
                      //     source={require('../../Common/images/show.png')}
                      //     style={{width: 30, height: 30}}
                      //   />

                      <MaterialIcons
                        name="visibility-off"
                        size={25}
                        color="#1d3122"
                      />

                      //   <Image
                      //     source={require('../../Common/images/hide.png')}
                      //     style={{width: 30, height: 30}}
                      //   />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.formMargin}>
                {t('please_enter_new_password')}
              </Text>
              <View>
                <View style={styles.passwordContainer2}>
                  <TextInput
                    secureTextEntry={nPasswordVisibility ? false : true}
                    style={styles.inputTextStyle}
                    onChangeText={cpassword =>
                      setPassword({...Password, cpassword: cpassword})
                    }
                    value={Password.cpassword}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setnPasswordVisibility(!nPasswordVisibility)
                    }>
                    {nPasswordVisibility ? (
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
                label={t('save')}
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

export default FarmerChangePassword;

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
