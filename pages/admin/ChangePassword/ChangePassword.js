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
import React, { useState, useEffect } from 'react';
import ButtonForm from '../../Common/ButtonForm';
import MessageDialog from '../../Common/MessageDialog';
import CustomHeader from '../CustomHeader';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import { useRoute, useFocusEffect, useNavigation, StackActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ChangePasswordApi } from '../../../config/apiHere';
import { getItem, removeItem } from '../../../config/getDataFromStorage';
const qs = require('qs');
const ChangePassword = ({ sendDataToParent }) => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute();
    const [cpasswordVisibility, setcPasswordVisibility] = useState('');
    const [passwordVisibility, setPasswordVisibility] = useState('');
    const [forgetPassword, setforgetPassword] = useState({ password: '', cpassword: '' });
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: '',
        languageID: '',
        token: '',
        userID: '',
    });
    const handleCheckPassowrdConfirm = () => {
        const password = forgetPassword.password;
        const cpassword = forgetPassword.cpassword;
        if (password != cpassword) {
            Toast.show({ text: `${t('same_con_password')}`, ...AlertMesg[0] })
            setforgetPassword({ ...forgetPassword, cpassword: "" })
        }
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
            const changePassword = await ChangePasswordApi(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.userID, save_data);
            if (changePassword.status == 200) {
                setforgetPassword({ ...forgetPassword, password: '', cpassword: '' });
                Toast.show({ text: `${t('password_change_successfully')}`, ...AlertMesg[0] });
                // setTimeout(() => {
                //     navigation.navigate('Dashboard');
                // }, 2000);
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
    const onPageLoad = async () => {
        let farmeruserID = "";
        if (route.params != undefined) {
            farmeruserID = route.params.farmeruserID
        }
        const [loginUser_data] = await Promise.all([
            getItem('loginUser_data'),
        ]);
        if (loginUser_data) {
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: loginUser_data.dbname,
                languageID: loginUser_data.agri_language.id,
                userID: loginUser_data.user_id,
                farmeruserID: farmeruserID,
                token: loginUser_data.token
            });
        }
    }
    useEffect(() => {
        onPageLoad();
        const onBackPress = () => { navigation.navigate('Dashboard'); return true; };
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []);
    const HandlerGoBack = () => {
        navigation.navigate('Dashboard');
    }
    return (
        <>
            <Root>
                <CustomHeader path='Dashboard' HandlerGoBack={HandlerGoBack} />
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
