import { Image, StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Button } from 'react-native'
import React, { useEffect, useState } from 'react'
import Logo from './Common/Logo'
import DropdownForm from './Common/DropdownForm'
import config from '../config'
import ButtonForm from './Common/ButtonForm'
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getItem, removeItem, setItem } from '../config/getDataFromStorage'
import { databaseListAPI } from '../config/apiHere'
import MessageDialog from './Common/MessageDialog'
import i18next from './services/i18next';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from './Common/ToastAlert'
// import { alertBoxMsg } from './Common/Common'

const Login = ({ route }) => {
    const navigation = useNavigation();
    const [companyData, setCompanyData] = useState([]);
    const [companyLanguage, setcompanyLanguage] = useState({
        company: "",
        language: "",
        company_id: ""
    });

    if (route.params === undefined) {
        // console.log(route);
        const { locale } = "en";

    }
    const { t, i18next } = useTranslation();
    const [storeLoginUser, setstoreLoginUser] = useState(
        {
            FcmUserToken: '654321',
            IMEINumber: "123456",
            company: "",
            contactNumber: "",
            password: "",
            role : ""
        }
    );


    const validateForm = () => {

        if (!storeLoginUser.phone) {
            Toast.show({
             time : 3 ,text: 'Please enter a phone number. ', ...AlertMesg[0]
            })
            return false;
        }
        if (storeLoginUser.phone.length < 9) {
            Toast.show({
                time: 3, text: 'Please enter a valid phone number. ', ...AlertMesg[0]
            })
            return false;
        }

        if (!storeLoginUser.password) {
            Toast.show({
                time: 3, text: 'Please enter a password. ', ...AlertMesg[0]
            })
            return false;
        }
        if (!storeLoginUser.role) {
            Toast.show({
                time: 3, text: 'Please select a role.', ...AlertMesg[0]
            })
            return false;
        }
        return true;
    };


    const saveHandle = async () => {


        if (validateForm()) {
            const inputdata = {
                "FcmUserToken": "654321",
                "IMEINumber": "123456",
                "company": storeLoginUser.company,
                "contactNumber": storeLoginUser.phone,
                "password": storeLoginUser.password,
                "type": storeLoginUser.role
            };
            try {
                console.log("rt");
                let userIno = await axios.post(config.loginAPI, inputdata);
                const loginUserdata = userIno.data.data[0];

                await setItem('loginUser_data', loginUserdata);
                setstoreLoginUser(
                    {
                        ...storeLoginUser,
                        phone: "",
                        password: "",
                        role: ""
                    })
                // fpoDetailsList(loginUserdata.dbname, loginUserdata.lan_id, loginUserdata.token, loginUserdata.user_id, loginUserdata.sa_company[0].company_code);
                // return console.log(JSON.stringify(fpoDetailsList,null,2));
                navigation.navigate('AdminNavigation');
                removeItem(storeLoginUser);

            } catch (error) {
                // MessageDialog({ title: 'Login', message: error.response.data.error.errorMessage })
            }
        }

        
    }

    let databaseList = async () => {
        try {
            let companyArray = [];
            let company_res = await databaseListAPI();
            if (company_res.data.data) {
                company_res.data.data.forEach(element => {
                    companyArray.push({
                        value: element.company_id,
                        label: element.agri_company.company_name,
                        dbname: element.db_name,
                    });
                });
                setCompanyData(companyArray);
            }
        } catch (error) {
            console.error('database APi error code with :', error.response);
        }
    }

    const onPageLoad = async () => {
        
        databaseList();
        await removeItem('storeSignup_data');
        await removeItem('storePersnolInfo_data');
        await removeItem('storeFinancial_data');
        await removeItem('storeProduceInfo_data');

        const companyLanguage_data = await getItem('companyLanguage_data');
        // return console.log(companyLanguage_data);
        // setstoreLoginUser({ ...storeLoginUser, company: companyLanguage_data.company_id })
        setcompanyLanguage(companyLanguage_data);
        setstoreLoginUser(
            {
                ...storeLoginUser,
                phone: "",
                password: "",
                role: "",
                company: companyLanguage_data.company_id
            })


    };

    useEffect(() => {
        onPageLoad();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            onPageLoad();
        }, [])
    );

    return (
        <>
            <ScrollView>
                <View>
                
                    <View style={{ paddingHorizontal: 20 }}>
                        <View>
                            <Image source={require('../pages/Common/images/logo.png')} style={styles.logo} />
                        </View>
                        <View>
                            <Text style={{ fontSize: 25 }}>{t('Sign_In')}</Text>
                            <Text>{t('Login_with_your_registered_phone_number_an_password')}</Text>

                            <TextInput style={styles.simpleInputTextStyle} placeholder="Enter your Register Phone no." keyboardType="numeric" onChangeText={phone => setstoreLoginUser({ ...storeLoginUser, phone: phone })} maxLength={10} value={storeLoginUser.phone} />

                            <TextInput style={styles.simpleInputTextStyle} placeholder="Enter Your Password" secureTextEntry={true} onChangeText={password => setstoreLoginUser({ ...storeLoginUser, password: password })} value={storeLoginUser.password} />

                            <View style={{ marginTop: 20, }}>
                                <DropdownForm data={config.roleData} label="Role" onChange={role => setstoreLoginUser({ ...storeLoginUser, role: role.value })} val={storeLoginUser.role} />
                            </View>

                            <View style={{ marginTop: 5, }}>
                                <DropdownForm data={companyData} label="Company" onChange={company => setstoreLoginUser({ ...storeLoginUser, company: company.value })} val={storeLoginUser.company} />
                            </View>

                            <View style={{ alignItems: 'center' }} onPress>
                                <Text>Forget Password?</Text>
                            </View>

                            <View style={{ alignItems: 'center', marginTop: 10, }}>
                                <TouchableOpacity>
                                    <Text onPress={() => navigation.navigate('Signup')}>New User ? Sign Up Now</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                </View>
            </ScrollView>
            <View style={{ marginTop: 10 }}>
                <ButtonForm label='Submit' onPress={saveHandle} />
            </View>
            <Root></Root>
        </>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        margin: 10
    },
    simpleInputTextStyle: {
        marginTop: 20,
        height: 40,
        borderBottomWidth: 1,
        width: '100%'
    },
    alert: {
        backgroundColor: "white",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
    },
    message: {
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
    },
    button: {
        borderRadius: 5,
    },
    logo: {
        width: 250,
        height: 100,
        resizeMode: 'contain',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
        marginLeft: 40,
    },
})
