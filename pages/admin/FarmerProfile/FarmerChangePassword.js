import {
    BackHandler,
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    Keyboard
} from 'react-native'

import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getItem } from '../../../config/getDataFromStorage'
import ButtonForm from '../../Common/ButtonForm';
import MessageDialog from '../../Common/MessageDialog';
import CustomHeader from '../CustomHeader';
import { UserPasswordUpdate } from '../userlist/UsersAPI'
import { Root, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert'
const qs = require('qs');
const FarmerChangePassword = ({ navigation }) => {
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: '',
        languageID: '',
        token: '',
        userID: ''
    });
    const [nPasswordVisibility, setnPasswordVisibility] = useState('');
    const [oPasswordVisibility, setoPasswordVisibility] = useState('');
    const [Password, setPassword] = useState({
        opassword: '',
        cpassword: '',
    });


    const onPageLoad = async () => {

        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const userID = loginUser_data.user_id;
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageID: languageID,
                token: token,
                userID: userID
            })


        }
    };

    useFocusEffect(
        useCallback(() => {
            onPageLoad();
            const onBackPress = () => { navigation.navigate('FarmerDashboard'); return true; };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );

    useEffect(() => {
        onPageLoad();
    }, []);

    const validation = () => {
        Keyboard.dismiss();
        if (Password.opassword == "") {
            Toast.show({ text: 'Please enter old password first', ...AlertMesg[0] });
            return false;
        } else if (Password.cpassword == "") {
            Toast.show({ text: 'Please enter new password first', ...AlertMesg[0] });
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

            const userDataUpdate = await UserPasswordUpdate(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.userID, dbLanTokUsr.token, formData);
            if (userDataUpdate.status === 200) {
                setPassword({
                    ...Password,
                    opassword: "",
                    cpassword: "",
                })
                Toast.show({ text: 'Password update successfully', ...AlertMesg[0] });
                setTimeout(() => {
                    navigation.navigate('Login')
                }, 1000);
            } else if (userDataUpdate.status === 400) {
                Toast.show({ text: 'Old Password Is Incorrect', ...AlertMesg[0] });
            } else {
                Toast.show({ text: 'Please try again some time later', ...AlertMesg[0] });
            }
        }
    };
    const HandlerGoBack = () => navigation.navigate('FarmerDashboard');
    return (
        <>
            <Root>
                <CustomHeader path='FarmerDashboard' HandlerGoBack={HandlerGoBack} />
                <View style={styles.container} >
                    <View style={styles.forgotContainer} >
                        <Text style={styles.titleForgot}>Change Password</Text>
                        <View>
                            <Text style={styles.formMargin}>Please Enter Old Password</Text>
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

                            <Text style={styles.formMargin}>Please Enter New Password</Text>
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
                        <ButtonForm label='Save' onPress={() => handleSave()} />
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
