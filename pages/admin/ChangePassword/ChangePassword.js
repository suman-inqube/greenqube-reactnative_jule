import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    BackHandler,
    Keyboard
} from 'react-native'
import React, { useState, useEffect, useContext } from 'react';
import ButtonForm from '../../Common/ButtonForm';
import { AlertMesg } from '../../Common/ToastAlert';
import { useRoute, useFocusEffect, useNavigation, StackActions } from '@react-navigation/native';
import { ChangePasswordApi } from '../../../config/apiHere';
import { getItem, removeItem } from '../../../config/getDataFromStorage';
const qs = require('qs');
import { userCreateContext } from '../../Context/usersCreateContext';
const ChangePassword = ({ sendDataToParent }) => {
    //GQR-67
    const { loginUser_data, dbLanTokUsr, t, CustomHeader, FormsTitle, logoImage, topBanner, Root, Popup, Toast } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    //GQR-67
    const navigation = useNavigation();
    const route = useRoute();
    const [cpasswordVisibility, setcPasswordVisibility] = useState('');
    const [passwordVisibility, setPasswordVisibility] = useState('');
    const [forgetPassword, setforgetPassword] = useState({ password: '', cpassword: '' });
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
        if (forgetPassword.password == "") {
            Toast.show({ text: `${t('please_enter_old_password')}`, ...AlertMesg[0] });
        } else if (forgetPassword.cpassword == "") {
            Toast.show({ text: `${t('please_enter_new_password')}`, ...AlertMesg[0] });
        } else {
            let save_data = qs.stringify({
                oldPassword: forgetPassword.password,
                newPassword: forgetPassword.cpassword,
                userType: 3
            });
            const changePassword = await ChangePasswordApi(dbname, lan_id, user_id, save_data);
            console.log(changePassword.data)
            if (changePassword?.status == 200) {
                setforgetPassword({ ...forgetPassword, password: '', cpassword: '' });
                Toast.show({ text: `${t('password_change_successfully')}`, ...AlertMesg[0] });
                await Promise.all([
                    removeItem("logoImageData"),
                    removeItem('loginUser_data'),
                    removeItem("profileImgData"),
                    removeItem("userNameData"),
                    removeItem("userType"),
                    removeItem("bottomBannerData"),
                    removeItem("topBannerData")
                ]);
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
                navigation.navigate('Login');
            }
        }
    };
    useEffect(() => {
        // onPageLoad();
        const onBackPress = () => { navigation.navigate('Dashboard'); return true; };
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []);
    const HandlerGoBack = () => navigation.navigate('Dashboard');
    return (
        <>
            <Root>
                <CustomHeader path='Dashboard' HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
                <ScrollView>
                    <View style={styles.container} >
                        <View style={styles.forgotContainer} >
                            <Text style={styles.titleForgot}>{t('change_password')}</Text>
                            <View>
                                <Text style={styles.formMargin}>{t('please_enter_old_password')}</Text>
                                <View>
                                    <View style={styles.passwordContainer}>
                                        <TextInput secureTextEntry={passwordVisibility ? false : true} style={styles.inputTextStyle} placeholderTextColor={'#000'} onChangeText={(passsword) => setforgetPassword({ ...forgetPassword, password: passsword })} value={forgetPassword.password} />
                                        <TouchableOpacity
                                            onPress={() => setPasswordVisibility(!passwordVisibility)}
                                        >
                                            {
                                                passwordVisibility ?
                                                    <Image source={require('../../Common/images/show.png')} style={{ width: 25, height: 25 }} />
                                                    :
                                                    <Image source={require('../../Common/images/hide.png')} style={{ width: 25, height: 25 }} />
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Text style={styles.formMargin}>{t('please_enter_new_password')}</Text>
                                <View style={{ marginBottom: 100 }}>
                                    <View style={styles.passwordContainer}>
                                        <TextInput secureTextEntry={cpasswordVisibility ? false : true} style={styles.inputTextStyle} placeholderTextColor={'#000'} onChangeText={(cpassword => setforgetPassword({ ...forgetPassword, cpassword: cpassword }))}
                                            onBlur={handleCheckPassowrdConfirm}
                                            value={forgetPassword.cpassword} />
                                        <TouchableOpacity
                                            onPress={() => setcPasswordVisibility(!cpasswordVisibility)}
                                        >
                                            {
                                                cpasswordVisibility ?
                                                    <Image source={require('../../Common/images/show.png')} style={{ width: 25, height: 25 }} />
                                                    :
                                                    <Image source={require('../../Common/images/hide.png')} style={{ width: 25, height: 25 }} />
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <ButtonForm label={t('submit')} onPress={() => handleSave()} />
            </Root>
        </>
    )
}

export default ChangePassword

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // alignItems: 'center',
    },
    forgotContainer: {
        paddingHorizontal: 20,
        paddingVertical: 30
    },
    passwordContainer: {
        flexDirection: 'row',
        borderWidth: 0.5,
        alignItems: 'center',
        marginVertical: 10,
        borderColor: '#efe9e9',
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        marginVertical: 5,
        borderRadius: 7,
        elevation: 3,
        backgroundColor: '#FFFFFF'
    },
    inputTextStyle: {
        width: "90%",
        color: '#000'
    },
    buttonForm: {
        marginTop: 10,
        width: "50%",
        marginHorizontal: '25%'
    },
    titleForgot: {
        textAlign: 'center',
        paddingVertical: 10,
        paddingBottom: 20,
        fontSize: 20,
        color: '#037e03',
        fontFamily: 'Poppins-SemiBold'
    },
    formMargin: {
        color: '#000',
        fontFamily: 'Poppins-Regular'
    }
})
