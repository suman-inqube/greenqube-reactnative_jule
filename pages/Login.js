import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Button } from 'react-native'
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
// import i18next from './services/i18next';
import { useTranslation } from 'react-i18next';
// import { alertBoxMsg } from './Common/Common'


export const alertBoxMsg = async ({title,msg}) => {
    console.log(title);
    Alert.alert(
        // 'Custom Alert Title',
        title.charAt(0).toUpperCase() + title.slice(1),
        msg.charAt(0).toUpperCase() + msg.slice(1),
        // 'Please enter a phone number.',
        [
            {
                text: 'OK',
                style: 'default', 
            },
        ],
        {
            cancelable: true,
            style: 'default', 
        }
    );
    return false;
}
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


    const { t } = useTranslation();
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


    const validateForm = () => {

        if (!storeLoginUser.phone) {
            Alert.alert("Please enter a phone number.");
            return false;
        }

     

        if (storeLoginUser.phone.length<9) {
          Alert.alert("Please enter a valid phone number.");
          return false;
        }

        if (!storeLoginUser.password) {
          Alert.alert("Please enter a password.");
          return false;
        }



        if (!storeLoginUser.role) {
          Alert.alert("Please select a role.");
          return false;
        }



        return true;
    };


    const saveHandle = async () => {
        // return console.warn(storeLoginUser);

        if (!validateForm()) {
            return;
        }

        const inputdata = {
            "FcmUserToken": "654321",
            "IMEINumber": "123456",
            "company": storeLoginUser.company,
            "contactNumber": storeLoginUser.phone,
            "password": storeLoginUser.password,
            "type": storeLoginUser.role
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
        setstoreLoginUser({ ...storeLoginUser, company: companyLanguage_data.company_id })
        setcompanyLanguage(companyLanguage_data);


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
                            <Text style={{ fontSize: 25 }}>{t('Sign_In')}</Text>
                            <Text>{t('Login_with_your_registered_phone_number_an_password')}</Text>

                            <TextInput style={styles.simpleInputTextStyle} placeholder="Enter your Register Phone no." keyboardType="numeric" onChangeText={phone => setstoreLoginUser({ ...storeLoginUser, phone: phone })} maxLength={10} />

                            <TextInput style={styles.simpleInputTextStyle} placeholder="Enter Your Password" secureTextEntry={true} onChangeText={password => setstoreLoginUser({ ...storeLoginUser, password: password })} />

                            <View style={{ marginTop: 20, }}>
                                <DropdownForm data={config.roleData} label="Role" onChange={role => setstoreLoginUser({ ...storeLoginUser, role: role.value })} />
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
})
