import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    BackHandler
} from 'react-native'
import React, { useState, useEffect } from 'react';
import ButtonForm from '../../Common/ButtonForm';
import MessageDialog from '../../Common/MessageDialog';
import CustomHeader from '../CustomHeader';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import { useRoute, useFocusEffect, useNavigation, useIsFocused,CommonActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NewForgotPassword } from '../../../config/apiHere';
import { getItem } from '../../../config/getDataFromStorage';
const qs = require('qs');
const ForgotPassword = ({ sendDataToParent }) => {
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
    const handleSave = async() => {
        if (forgetPassword.password == "") {
            Toast.show({ text: `${t('enter_new_password')}`, ...AlertMesg[0] })
        } else if (forgetPassword.cpassword == "") {
            Toast.show({ text: `${t('enter_conf_pass')}`, ...AlertMesg[0] })
        } else if (forgetPassword.cpassword != forgetPassword.password) {
            Toast.show({ text: `${t('same_con_password')}`, ...AlertMesg[0] })
        } else {
            let save_data = qs.stringify({
                newPassword:forgetPassword.password,
                userType:2
            });
            const newForgotPassword = await NewForgotPassword(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.farmeruserID, save_data);
            if(newForgotPassword.status==200){
                setforgetPassword({ ...forgetPassword, password: '', cpassword: '' });
                Toast.show({ text: `${t('password_change_successfully')}`, ...AlertMesg[0] });
                navigation.navigate('userList');
            }
        }
    };
    const onPageLoad = async () => {
        let farmeruserID="";
        if(route.params !=undefined){
            farmeruserID=route.params.farmeruserID
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
                farmeruserID:farmeruserID,
                token: loginUser_data.token
            });
        }
    }
    useEffect(() => {
            onPageLoad();
            const onBackPress = () => { navigation.navigate('userList'); return true; };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []);
    const HandlerGoBack=()=>{
        navigation.navigate('userList');
    }
    return (
        <>
            <Root>
                <CustomHeader path='userList' HandlerGoBack={HandlerGoBack}/>
                <ScrollView>
                <View style={styles.container} >
                    <View style={styles.forgotContainer} >
                        <Text style={styles.titleForgot}>{t('forgot_password')}</Text>
                        <View>
                            <Text style={styles.formMargin}>{t('enter_pass')}</Text>
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
                            <Text style={styles.formMargin}>{t('enter_conf_pass')}</Text>
                            <View>
                                <View style={styles.passwordContainer}>
                                    <TextInput secureTextEntry={cpasswordVisibility ? false : true} style={styles.inputTextStyle} placeholderTextColor={'#000'} onChangeText={(cpassword => setforgetPassword({ ...forgetPassword, cpassword: cpassword }))}
                                        // onBlur={handleCheckPassowrdConfirm}
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

export default ForgotPassword

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
        color: '#000',
        fontFamily:'Poppins-Regular',
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
    },
    formMargin: {
        color: '#000',
        fontFamily:'Poppins-Regular',
    }
})
