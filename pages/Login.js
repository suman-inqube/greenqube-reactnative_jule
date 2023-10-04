import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity } from 'react-native'
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

const Login = () => {
    const navigation = useNavigation();
    const [companyData, setCompanyData] = useState([]);
    const [companyLanguage, setcompanyLanguage] = useState({
        company: "",
        language: ""
    });
    const [storeLoginUser, setstoreLoginUser] = useState(
        {
            "FcmUserToken": "654321",
            "IMEINumber": "123456",
            "company": "",
            "contactNumber": "",
            "password": "",
            "type": ""
        }
    );


    const validationData = () => {
        if (
            (storeLoginUser.phone) &&
            (storeLoginUser.password) &&
            (storeLoginUser.company) &&
            (storeLoginUser.role)
        ) {
            return true;
        }
        else {
            MessageDialog({ title: 'Require', message: 'Please fill in all required fields with valid data.' })
            return;
        }

    }
    const saveHandle = async () => {
        const validatin_res = validationData();
        // console.log(validatin_res);
        if (validatin_res) {
            const inputdata = {
                "FcmUserToken": "654321",
                "IMEINumber": "123456",
                "company": storeLoginUser.company.value,
                "contactNumber": storeLoginUser.phone,
                "password": storeLoginUser.password,
                "type": storeLoginUser.role.value
            };
            try {
                let userIno = await axios.post(config.loginAPI, inputdata);
                const loginUserdata = userIno.data.data[0];
                await setItem('loginUser_data', loginUserdata);
                setstoreLoginUser({ ...storeLoginUser, phone: "" })
                setstoreLoginUser({ ...storeLoginUser, password: "" })
                navigation.navigate('AdminNavigation');
            } catch (error) {
                MessageDialog({ title: 'Login', message: error.response.data.error.errorMessage })
            }
        }

        // const inputdata = {
        //     "FcmUserToken": "654321",
        //     "IMEINumber": "123456",
        //     "company": 86,
        //     "contactNumber": "8961494771",
        //     "password": "12345678",
        //     "type": "3"
        // };

        // try {
        //     let userIno = await axios.post(config.loginAPI, inputdata);
        //     // console.log(userIno.data);
        //     const loginUserdata = userIno.data.data[0];
        //     // await setItem('loginUser_data', loginUserdata);
        //     navigation.navigate('Dashboard');
        // } catch (error) {
        //     // console.error('Error storing data:', error.response.data.error.errorMessage);
        //     MessageDialog({ title: 'Login', message: error.response.data.error.errorMessage })
        //     return;
        // }

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

        const companyLanguage = await getItem('companyLanguage_data');
        setcompanyLanguage(companyLanguage);

    };
    useEffect(() => {
        onPageLoad();
    }, []);

    return (
        <>
            <ScrollView>
                <View>
                    <View style={{ paddingHorizontal: 20 }}>
                        <Logo />
                        <View>
                            <Text style={{ fontSize: 25 }}>Sign In</Text>
                            <Text>Login with your registered phone number an password</Text>
                            <TextInput style={styles.simpleInputTextStyle} placeholder="Enter your Register Phone no." keyboardType="numeric" onChangeText={phone => setstoreLoginUser({ ...storeLoginUser, phone: phone })} />

                            <TextInput style={styles.simpleInputTextStyle} placeholder="Enter Your Password" secureTextEntry={true} onChangeText={password => setstoreLoginUser({ ...storeLoginUser, password: password })} />
                            <View style={{ marginTop: 20, }}>
                                <DropdownForm data={config.roleData} label="Role" onChange={role => setstoreLoginUser({ ...storeLoginUser, role: role })} />
                            </View>
                            <View style={{ marginTop: 5, }}>
                                <DropdownForm data={companyData} label="Company" onChange={company => setstoreLoginUser({ ...storeLoginUser, company: company })} />
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
})
