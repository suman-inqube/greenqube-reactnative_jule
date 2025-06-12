import { StyleSheet, View, Text, TouchableOpacity, TextInput, Image, Keyboard } from 'react-native'
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { UserPasswordUpdate } from '../userlist/UsersAPI'
const qs = require('qs');
import { userCreateContext } from '../../Context/usersCreateContext';
const FarmerChangePassword = ({ navigation }) => {
    //GQR-67
    const { loginUser_data, ButtonForm, Root, Toast, AlertMesg, t, onBackPress, CustomHeader, logoImage, topBanner } = useContext(userCreateContext);
    const { dbname, lan_id, token, owner, user_id, } = loginUser_data;
    //GQR-67
    const [nPasswordVisibility, setnPasswordVisibility] = useState('');
    const [oPasswordVisibility, setoPasswordVisibility] = useState('');
    const [Password, setPassword] = useState({ opassword: '', cpassword: '' });
    useFocusEffect(
        useCallback(() => {
            onBackPress(() => { navigation.navigate('FarmerDashboard'); return true; })
        }, [])
    );
    const validation = () => {
        Keyboard.dismiss();
        if (Password.opassword == "") {
            Toast.show({ text: `${t('please_enter_old_password')}`, ...AlertMesg[0] });
            return false;
        } else if (Password.cpassword == "") {
            Toast.show({ text: `${t('please_enter_new_password')}`, ...AlertMesg[0] });
            return false;
        }
        return true;
    };
    const handleSave = async () => {
        if (validation()) {
            let formData = qs.stringify({
                oldPassword: Password.opassword,
                newPassword: Password.cpassword,
                userType: "2"
            });
            const userDataUpdate = await UserPasswordUpdate(dbname, lan_id, user_id, token, formData);
            if (userDataUpdate.status === 200) {
                setPassword({
                    ...Password,
                    opassword: "",
                    cpassword: "",
                })
                Toast.show({ text: t('Password_update_successfully'), ...AlertMesg[0] });
                setTimeout(() => {
                    navigation.navigate('Login')
                }, 1000);
            } else if (userDataUpdate.status === 400) {
                Toast.show({ text: t('Old_Password_Is_Incorrect'), ...AlertMesg[0] });
            } else {
                Toast.show({ text: t('Please_try_again_some_time_later'), ...AlertMesg[0] });
            }
        }
    };
    const HandlerGoBack = () => navigation.navigate('FarmerDashboard');
    return (
        <>
            <Root>
                <CustomHeader path='FarmerDashboard' HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
                <View style={styles.container} >
                    <View style={styles.forgotContainer} >
                        <Text style={styles.titleForgot}>{t('change_password')}</Text>
                        <View>
                            <Text style={styles.formMargin}>{t('please_enter_old_password')}</Text>
                            <View>
                                <View style={styles.passwordContainer}>
                                    <TextInput secureTextEntry={oPasswordVisibility ? false : true} style={styles.inputTextStyle} onChangeText={(pword) => setPassword({ ...Password, opassword: pword })} value={Password.opassword} />
                                    <TouchableOpacity
                                        onPress={() => setoPasswordVisibility(!oPasswordVisibility)}
                                    >
                                        {
                                            oPasswordVisibility ?
                                                <Image source={require('../../Common/images/show.png')} style={{ width: 30, height: 30 }} />
                                                :

                                                <Image source={require('../../Common/images/hide.png')} style={{ width: 30, height: 30 }} />

                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.formMargin}>{t('please_enter_new_password')}</Text>
                            <View>
                                <View style={styles.passwordContainer}>
                                    <TextInput secureTextEntry={nPasswordVisibility ? false : true} style={styles.inputTextStyle} onChangeText={(cpassword => setPassword({ ...Password, cpassword: cpassword }))} value={Password.cpassword} />
                                    <TouchableOpacity
                                        onPress={() => setnPasswordVisibility(!nPasswordVisibility)}
                                    >
                                        {
                                            nPasswordVisibility ?
                                                <Image source={require('../../Common/images/show.png')} style={{ width: 30, height: 30 }} />

                                                :
                                                <Image source={require('../../Common/images/hide.png')} style={{ width: 30, height: 30 }} />

                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.buttonForm}>
                        <ButtonForm label={t('save')} onPress={() => handleSave()} />
                    </View>
                </View>
            </Root>
        </>
    )
}

export default FarmerChangePassword

const styles = StyleSheet.create({
    container: {
        // backgroundColor: "#FFFFFF",
        height: "100%",
        // flex: 1,
        alignItems: 'center',
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
        marginTop: 30,
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
        fontSize: 14,
    }
})
