import { StyleSheet, View, ScrollView, Text, TouchableOpacity, TextInput, Image } from 'react-native'
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
import { isNotEmpty } from './Common/ValidationFunctions'
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
            console.error('supervisor APi error code with :', error.response);
        }
    }
    const handleCheckPassowrdConfirm = () => {
        const password = storeSignup.password;
        const cpassword = storeSignup.cpassword;
        if (password != cpassword) {
            MessageDialog({ title: 'Password', message: `This Password Not Matched` })
        }
    };

    const checkPhone = async () => {
        if ((storeSignup.country) && (storeSignup.company)) {
            checkPhoneDigit();
        }
        else {
            MessageDialog({ title: 'Require', message: 'Please fill in all required fields with valid data.' })
            setstoreSignup({ ...storeSignup, phone: "" })
            phoneInputRef.current.focus();
        }
    }
    const checkPhoneDigit = async () => {
        try {
            let check_phone_digit_res = await checkPhoneDigitAPI(storeSignup.country.value, storeSignup.company.dbname, language_id);
            // console.log(check_phone_digit_res.data.data.contact_no_digits);
            if (check_phone_digit_res.data.data.contact_no_digits) {
                let require_digit = check_phone_digit_res.data.data.contact_no_digits;
                if (storeSignup.phone.length === require_digit) {
                    checkPhoneNo();
                }
                else {
                    MessageDialog({ title: 'Phone', message: `Please Enter Valid Phone digit` })
                    phoneInputRef.current.focus();
                    setstoreSignup({ ...storeSignup, phone: "" })
                }
            }

        } catch (error) {
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
            console.log(error.errorMessage);
            MessageDialog({ title: 'Phone', message: `This ${storeSignup.phone} Not Available` })
            setstoreSignup({ ...storeSignup, phone: "" })
            phoneInputRef.current.focus();
        }

    }

    const saveHandle = async () => {
        if (isNotEmpty(storeSignup.phone) && (storeSignup.country.value) && (storeSignup.supervisor.value) && (storeSignup.company.value) && isNotEmpty(storeSignup.password) && isNotEmpty(storeSignup.cpassword)) {
            await AsyncStorage.setItem('storeSignup_data', JSON.stringify(storeSignup));
            navigation.navigate('Persnol', { pagename: 'Financial' });
        } else {
            MessageDialog({ title: 'Require', message: 'Please fill in all required fields with valid data.' })
        }
    }

    const getDataFromLocalStorage = async () => {
        // await AsyncStorage.removeItem('storeSignup_data');
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

        // console.log("local data:", storeSignup_data);
    }
    useEffect(() => {
        getDataFromLocalStorage();
        countryDataList();
    }, []);

    return (
        <>
            <ScrollView style={{ backgroundColor: '#D5FFD0' }}>
                <View style={{ backgroundColor: '#D5FFD0' }}>
                    <View style={{ paddingHorizontal: 20 }}>
                        <Logo iheight={100} iwidth={100} />

                        <DropdownForm data={countryData} label="Country" color='red' onChange={country => { countryHandle(country) }} val={storeSignup.country} />

                        <DropdownForm data={companyData} label="Company" color='red' onChange={company => { companyHandle(company) }} val={storeSignup.company} />

                        <DropdownForm data={supervisorData} label="Supervisor" color='red' onChange={supervisor => { setstoreSignup({ ...storeSignup, supervisor: supervisor }) }} val={storeSignup.supervisor} />

                        <InputTextForm label="Phone" color="red" value={storeSignup.phone} onChangeText={(phone) => setstoreSignup({ ...storeSignup, phone: phone })} keyboardType="numeric" onBlur={(phone) => checkPhone(phone)} refname={phoneInputRef} />

                        <Text style={styles.formMargin}>Password</Text>
                        <View style={styles.passwordMainContainer}>
                            <View style={styles.passwordContainer}>
                                <TextInput secureTextEntry={passwordVisibility ? false : true} style={styles.inputTextStyle} onChangeText={(passsword) => setstoreSignup({ ...storeSignup, password: passsword })} value={storeSignup.password} />
                                <TouchableOpacity
                                    onPress={() => setPasswordVisibility(!passwordVisibility)}
                                >
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
                                <TouchableOpacity
                                    onPress={() => setcPasswordVisibility(!cpasswordVisibility)}
                                >
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
                </View>
            </ScrollView>
            <View style={{ marginTop: 10, backgroundColor: '#D5FFD0' }}>
                <ButtonForm label='Next' onPress={() => saveHandle()} />
            </View>
        </>
    )
}

export default Signup

const styles = StyleSheet.create({
    formContainer: {
        margin: 10,
    },
    formMargin: {
        marginHorizontal: 10,
        color: 'red',
        marginBottom: 5,
    },
    passwordMainContainer: {
        flex: 1,
        alignItems: 'center',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        width: '100%',
        paddingEnd: 8,
        backgroundColor: 'white',
        height: 40,
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
})
