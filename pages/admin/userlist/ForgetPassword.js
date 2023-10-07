import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    TextInput,
    Image
} from 'react-native'
import React, { useState } from 'react';
import ButtonForm from '../../Common/ButtonForm';
import MessageDialog from '../../Common/MessageDialog';

const ForgotPassword = ({ sendDataToParent }) => {
    const [cpasswordVisibility, setcPasswordVisibility] = useState('');
    const [passwordVisibility, setPasswordVisibility] = useState('');
    const [forgetPassword, setforgetPassword] = useState({
        password: '',
        cpassword: '',
    });


    const handleCheckPassowrdConfirm = () => {
        const password = forgetPassword.password;
        const cpassword = forgetPassword.cpassword;
        if (password != cpassword) {
            MessageDialog({ title: 'Password', message: `This Password Not Matched` })
            setforgetPassword({ ...forgetPassword, cpassword: "" })
        }
    };
    const validation = () => {
        // console.log(JSON.stringify(forgetPassword, null, 2));
        if (forgetPassword.cpassword && forgetPassword.password) {
            return true;
        }
        else {
            MessageDialog({ title: 'Required', message: `Required all Field` })
        }
    };
    const handleSave = () => {
        const res = validation()
        if (res) {
            console.log("welcome");
        }
    };
    const sendDataToParentOnClick = () => {
        sendDataToParent(null);
    };
    return (
        <>
            <View>
                <TouchableOpacity onPress={sendDataToParentOnClick}>
                    <Text>Back</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.container} >
                <View style={styles.forgotContainer} >
                    <Text style={styles.titleForgot}>Forgot Password</Text>
                    <View>
                        <Text style={styles.formMargin}>Please Enter Password</Text>
                        <View>
                            <View style={styles.passwordContainer}>
                                <TextInput secureTextEntry={passwordVisibility ? false : true} style={styles.inputTextStyle} onChangeText={(passsword) => setforgetPassword({ ...forgetPassword, password: passsword })} value={forgetPassword.password} />
                                <TouchableOpacity
                                    onPress={() => setPasswordVisibility(!passwordVisibility)}
                                >
                                    {
                                        passwordVisibility ?
                                            <Image source={require('../../Common/images/show.png')} style={{ width: 30, height: 30 }} />
                                            :

                                            <Image source={require('../../Common/images/hide.png')} style={{ width: 30, height: 30 }} />

                                    }
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.formMargin}>Please Enter Confirm Password</Text>
                        <View>
                            <View style={styles.passwordContainer}>
                                <TextInput secureTextEntry={cpasswordVisibility ? false : true} style={styles.inputTextStyle} onChangeText={(cpassword => setforgetPassword({ ...forgetPassword, cpassword: cpassword }))} onBlur={handleCheckPassowrdConfirm} value={forgetPassword.cpassword} />
                                <TouchableOpacity
                                    onPress={() => setcPasswordVisibility(!cpasswordVisibility)}
                                >
                                    {
                                        cpasswordVisibility ?
                                            <Image source={require('../../Common/images/show.png')} style={{ width: 30, height: 30 }} />

                                            :
                                            <Image source={require('../../Common/images/hide.png')} style={{ width: 30, height: 30 }} />

                                    }
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonForm}>
                                <ButtonForm label='Next' onPress={() => handleSave()} />
                            </View>

                        </View>
                    </View>
                </View>
            </View>
        </>
    )
}

export default ForgotPassword

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
        width: "90%"
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
        fontSize: 14,
    }
})
