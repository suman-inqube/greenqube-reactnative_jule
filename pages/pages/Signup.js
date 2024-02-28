import { Keyboard, StyleSheet, View, ScrollView, Text, TouchableOpacity, TextInput, Image, PermissionsAndroid, StatusBar } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Logo from './Common/Logo'
import DropdownForm from './Common/DropdownForm'
import ButtonForm from './Common/ButtonForm'
import InputTextForm from './Common/InputTextForm'
import { useNavigation } from '@react-navigation/native';
import MessageDialog from './Common/MessageDialog'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { countryDataListAPI, companyDataListAPI, supervisoryDataListAPI, checkPhoneNoAPI, checkPhoneDigitAPI } from '../config/apiHere';
import axios from 'axios';
import config from '../config'
import { isNotEmpty } from './Common/ValidationFunctions';
import { Permission, PERMISSIONS_TYPE } from './Common/AppPermission';
import { request, PERMISSIONS } from 'react-native-permissions';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from './Common/ToastAlert';
import { getItem, setItem } from '../config/getDataFromStorage';
import { CrashlyticsRecordError } from '../Crashlytics/CrashlyticsRecordError'
const Signup = () => {
    const navigation = useNavigation();
    const language_id = 1;
    const [storeSignup, setstoreSignup] = useState({
        country: '',
        company: '',
        supervisor: '',
        phone: '',
        password: '',
        cpassword: '',
    });
    const [cpasswordVisibility, setcPasswordVisibility] = useState('');
    const [passwordVisibility, setPasswordVisibility] = useState('');
    const [countryData, setCountryData] = useState([]);
    const [companyData, setCompanyData] = useState([]);
    const [supervisorData, setSupervisorData,] = useState([]);
    const phoneInputRef = useRef(null);
    let countryDataList = async () => {
        try {
            let countryArray = [];
            const country_res = await countryDataListAPI();
            if (country_res.data.data) {
                country_res.data.data.rows.forEach(element => {
                    countryArray.push({
                        value: element.id,
                        label: element.country_name,
                    });
                });
                setCountryData(countryArray);
            }
        } catch (error) {
            CrashlyticsRecordError(error.response)
            console.error('Server responded with an error:', error.response.status, error.response.data);
        }
    }
    const countryHandle = (country) => {
        setstoreSignup({ ...storeSignup, country: country })
        companyDataList(country.value, language_id);
        // console.log(storeSignup);
    }

    let companyDataList = async (country_id, language_id) => {
        try {
            let companyArray = [];
            let company_res = await companyDataListAPI(country_id, language_id);
            // console.log(company_res);
            if (company_res.data.data) {
                company_res.data.data.agri_companies.forEach(element => {
                    // console.log(element.agri_host_db_rel.db_name);
                    companyArray.push({
                        value: element.id,
                        label: element.company_name,
                        dbname: element.agri_host_db_rel.db_name,
                    });
                });
                setCompanyData(companyArray);
            }
        } catch (error) {
            CrashlyticsRecordError(error.responsive)
            console.error('company APi error code with :', error.response.status, error.response.data);
        }
    }
    const companyHandle = async (company) => {
        setstoreSignup({ ...storeSignup, company: company })
        supervisorDataList(company.value);
    }
    let supervisorDataList = async (company_id) => {
        try {
            let supervisorArray = [];
            let supervisor_res = await supervisoryDataListAPI(company_id);
            // console.log(supervisor_res);
            if (supervisor_res.data.data) {
                supervisor_res.data.data.rows.forEach(element => {
                    supervisorArray.push({
                        value: element.user_id,
                        label: element.userName,
                    });
                });
                setSupervisorData(supervisorArray);
            }
        } catch (error) {
            CrashlyticsRecordError(error.responsive)
            console.error('supervisor APi error code with :', error.response);
        }
    }
    const handleCheckPassowrdConfirm = () => {
        const password = storeSignup.password;
        const cpassword = storeSignup.cpassword;
        if (password != cpassword) {
            // MessageDialog({ title: 'Password', message: `This Password Not Matched` })
            Toast.show({
                time: 3, text: `This Password Not Matched`, ...AlertMesg[0]
            })
        }
    };
    const checkPhone = async () => {
        if ((storeSignup.country) && (storeSignup.company)) {
            checkPhoneDigit();
        }
        else {
            Toast.show({
                time: 3, text: `Please enter phone no`, ...AlertMesg[0]
            })
            // MessageDialog({ title: 'Require', message: 'Please fill in all required fields with valid data.' })
            setstoreSignup({ ...storeSignup, phone: "" })
            phoneInputRef.current.focus();
        }
    }
    const checkPhoneDigit = async () => {
        try {
            let check_phone_digit_res = await checkPhoneDigitAPI(storeSignup.country.value, storeSignup.company.dbname, language_id);
            if (check_phone_digit_res.data.data.contact_no_digits) {
                let require_digit = check_phone_digit_res.data.data.contact_no_digits;

                if (storeSignup.phone.length === require_digit) {
                    checkPhoneNo();
                }
                else {
                    // MessageDialog({ title: 'Phone', message: `Please Enter Valid Phone digit` })
                    Toast.show({
                        time: 3, text: `Please Enter ${require_digit} digit phone no`, ...AlertMesg[0]
                    })
                    Keyboard.dismiss();
                    // phoneInputRef.current.focus();
                    setstoreSignup({ ...storeSignup, phone: "" })
                }
            }

        } catch (error) {
            CrashlyticsRecordError(error.responsive)
            console.error('checkPhoneNo APi error code with :', error.response);
        }
    }
    const checkPhoneNo = async () => {
        try {
            const axiosConfig1 = {
                headers: {
                    'information': `${storeSignup.company.dbname}`,
                    'Accept': 'application/json'
                },
            };
            const inputBody = {
                "contactNumber": storeSignup.phone,
                "userType": "2"
            };
            let check_phone_res = await axios.post(config.phoneNoCheckAPI, inputBody, axiosConfig1);
        } catch (error) {
            CrashlyticsRecordError(error.responsive)
            console.log(error.errorMessage);
            MessageDialog({ title: 'Phone', message: `This ${storeSignup.phone} Not Available` })
            setstoreSignup({ ...storeSignup, phone: "" })
            phoneInputRef.current.focus();
        }

    }

    const validateForm = () => {
        if (!storeSignup.country.value) {
            Toast.show({
                time: 3, text: 'Please enter a country', ...AlertMesg[0]
            })
            return false;
        }

        if (!storeSignup.supervisor.value) {
            Toast.show({
                time: 3, text: 'Please enter a supervisor', ...AlertMesg[0]
            })
            return false;
        }
        if (!storeSignup.company.value) {
            Toast.show({
                time: 3, text: 'Please select a company', ...AlertMesg[0]
            })
            return false;
        }
        if (!storeSignup.phone) {
            Toast.show({
                time: 3, text: 'Please enter a phone number', ...AlertMesg[0]
            })
            return false;
        }
        if (!storeSignup.password) {
            Toast.show({
                time: 3, text: 'Please enter password', ...AlertMesg[0]
            })
            return false;
        }
        if (!storeSignup.cpassword) {
            Toast.show({
                time: 3, text: 'Please enter confirm password', ...AlertMesg[0]
            })
            return false;
        }
        const password = storeSignup.password;
        const cpassword = storeSignup.cpassword;
        if (password != cpassword) {
            // MessageDialog({ title: 'Password', message: `This Password Not Matched` })
            Toast.show({
                time: 3, text: `This Password Not Matched`, ...AlertMesg[0]
            })
            return false;
        }
        return true;
    };

    const saveHandle = async () => {
        // sahitya
        // navigation.navigate('Persnol', { pagename: 'Financial' });
        if (validateForm()) {


            await setItem('storeSignup_data', storeSignup)
            navigation.navigate('Persnol', { pagename: 'Financial' });
        }

    }

    const getDataFromLocalStorage = async () => {
        // let mydata= await getItem('storeSignup_data')
        // return console.log(mydata);
        const storeSignup_data1 = await AsyncStorage.getItem("storeSignup_data");
        const storeSignup_data = JSON.parse(storeSignup_data1);
        if (storeSignup_data) {
            setstoreSignup(storeSignup_data);
            if (storeSignup_data.country) {
                companyDataList(storeSignup_data.country.value, language_id);
            }
            if (storeSignup_data.company) {
                supervisorDataList(storeSignup_data.company.value);
            }

        }
    }
    useEffect(() => {

        Permission.checkPermission(PERMISSIONS_TYPE.fineLocation)
        getDataFromLocalStorage();
        countryDataList();
    }, []);
    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={"#003c04"} />
            <View style={styles.container}>
                <View style={{ height: 60, backgroundColor: '#003c04' }}></View>
                <View style={styles.headersContainer}>
                    <Text style={styles.headersTitle}>New Registration</Text>
                    <Text style={styles.headersTitle}>Login Information</Text>
                </View>
                <View style={{ flex: 1, justifyContent: "center" }} >
                    <ScrollView>
                        <View>
                            <Image source={require('../pages/Common/images/logo.png')} style={styles.logo} />
                        </View>
                        <View style={styles.formContainer} >
                            <DropdownForm data={countryData} label="Country" color='red' onChange={country => { countryHandle(country) }} val={storeSignup.country} />
                            <DropdownForm data={companyData} label="Company" color='red' onChange={company => { companyHandle(company) }} val={storeSignup.company} />
                            <DropdownForm data={supervisorData} label="Supervisor" color='red' onChange={supervisor => { setstoreSignup({ ...storeSignup, supervisor: supervisor }) }} val={storeSignup.supervisor} />
                            <InputTextForm label="Phone" color="red" value={storeSignup.phone} onChangeText={(phone) => setstoreSignup({ ...storeSignup, phone: phone })} keyboardType="numeric" onBlur={(phone) => checkPhone(phone)} refname={phoneInputRef} />
                            <Text style={styles.formMargin}>Password</Text>
                            <View style={styles.passwordMainContainer}>
                                <View style={styles.passwordContainer}>
                                    <TextInput secureTextEntry={passwordVisibility ? false : true} style={styles.inputTextStyle} onChangeText={(passsword) => setstoreSignup({ ...storeSignup, password: passsword })} value={storeSignup.password} />
                                    <TouchableOpacity onPress={() => setPasswordVisibility(!passwordVisibility)}>
                                        {
                                            passwordVisibility ?
                                                <Image source={require('./Common/images/show.png')} style={{ width: 30, height: 30 }} />
                                                :
                                                <Image source={require('./Common/images/hide.png')} style={{ width: 30, height: 30 }} />
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={styles.formMargin}>Confirm Password</Text>
                            <View style={styles.passwordMainContainer}>
                                <View style={styles.passwordContainer}>
                                    <TextInput secureTextEntry={cpasswordVisibility ? false : true} style={styles.inputTextStyle} onChangeText={(cpassword => setstoreSignup({ ...storeSignup, cpassword: cpassword }))} onBlur={handleCheckPassowrdConfirm} value={storeSignup.cpassword} />
                                    <TouchableOpacity onPress={() => setcPasswordVisibility(!cpasswordVisibility)} >
                                        {
                                            cpasswordVisibility ?
                                                <Image source={require('./Common/images/show.png')} style={{ width: 30, height: 30 }} />
                                                :
                                                <Image source={require('./Common/images/hide.png')} style={{ width: 30, height: 30 }} />

                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                    </ScrollView>
                </View>
            </View>
            <ButtonForm label='Next' onPress={() => saveHandle()} />
            <Root></Root>
        </>
    )
}

export default Signup

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    headersContainer: {
        marginHorizontal: '5%',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    headersTitle: {
        paddingVertical: 5,
        fontWeight: 'bold',
        fontSize: 18,
        color: '#000'
    },
    formContainer: {
        marginBottom: 60,
        marginHorizontal: '2.5%',
        paddingHorizontal: '5%',
        paddingTop: '6%',
        paddingBottom: '4%',
        backgroundColor: '#E9FCC5',
        borderRadius: 20,
        elevation: 2
    },
    formMargin: {
        marginHorizontal: 10,
        color: 'red',
        // marginBottom: 5,
    },
    passwordMainContainer: {
        alignItems: 'center',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ffffff',
        borderWidth: 0.5,
        borderRadius: 8,
        width: '100%',
        paddingEnd: 8,
        backgroundColor: '#ffffff',
        height: 50,
        marginBottom: 15,
    },
    inputTextStyle: {
        flex: 1,
        height: 40,
        marginHorizontal: 10,
        borderColor: 'gray',

    },
    simpleInputTextStyle: {
        flex: 1,
        height: 40,
        marginHorizontal: 10,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        backgroundColor: 'white',
        paddingLeft: 10,
    },
    logo: {
        width: 250,
        height: 100,
        resizeMode: 'contain',
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 20,
        marginLeft: 60,
    },
})
