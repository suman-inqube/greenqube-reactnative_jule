import { PermissionsAndroid, Keyboard, Image, StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Button, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react';
import Logo from './Common/Logo';
import DropdownForm from './Common/DropdownForm';
import config from '../config';
import ButtonForm from './Common/ButtonForm';
import axios from 'axios';
import { getItem, removeItem, setItem } from '../config/getDataFromStorage'
import { databaseListAPI, fpodetailsDataListAPI, reginalDataServiceAPI, checkPhoneDigitAPI, DetailsCompany } from '../config/apiHere'
import MessageDialog from './Common/MessageDialog'
import i18next from './services/i18next';
import { useTranslation } from 'react-i18next';
import LoadingScreen from './Common/LoadingScreen'
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from './Common/ToastAlert';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Permission, PERMISSIONS_TYPE } from './AppPermission/AppPermission';
import ForegroundLocationService from './BackgroundService/ForegroundLocationService';
import NotificationServices from './PushNotification/NotificationServices';
import DeviceInfo from './DeviceInfo';
const Login = ({ route }) => {
    const { netConnection } = DeviceInfo();
    // const { fusedLocationData } = ForegroundLocationService();
    const { requestUserPermission, notificationListener } = NotificationServices();
    const [isLoading, setIsLoading] = useState(false);
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [companyData, setCompanyData] = useState([]);
    const [companyLanguage, setcompanyLanguage] = useState({
        company: "",
        language: "",
        company_id: ""
    });
    const [contact_no_digits, setcontact_no_digits] = useState(11);
    const { t } = useTranslation();
    const [storeLoginUser, setstoreLoginUser] = useState({
        FcmUserToken: "",
        IMEINumber: "123456",
        company: "",
        contactNumber: "",
        password: "",
        role: "",
        company_lable: "",
    });
    const validateForm = () => {
        Keyboard.dismiss();
        if (!storeLoginUser.phone) {
            Toast.show({
                time: 3, text: `${t('forgotpassword_mb')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (storeLoginUser.phone.length < contact_no_digits) {
            Toast.show({ time: 3, text: `${t('please_enter_valid_mobile_no')}`, ...AlertMesg[0] })
            return false;
        }
        if (!storeLoginUser.password) {
            Toast.show({
                time: 3, text: `${t('enter_pass')}`, ...AlertMesg[0]
            })
            return false;
        }
        if (!storeLoginUser.role) {
            Toast.show({
                time: 3, text: `${t('please_select_role_first')}`, ...AlertMesg[0]
            })
            return false;
        }
        return true;
    };
    const saveHandle = async () => {
        const [fcmToken_res] = await Promise.all([
            getItem('fcmToken'),
        ])
        // if (validateForm()) {
        const inputdata = {
            "FcmUserToken": fcmToken_res,
            "IMEINumber": "123456",
            "company": storeLoginUser.company,
            "contactNumber": storeLoginUser.phone,
            "password": storeLoginUser.password,
            "type": storeLoginUser.role
        };
        try {
            console.log(config.loginAPI)
            console.log(inputdata)
            setIsLoading(true);
            let userIno = await axios.post(config.loginAPI, inputdata);
            if (userIno?.status === 200) {
                const loginUserdata = userIno.data.data[0];
                const details_company_res = await DetailsCompany(loginUserdata?.dbname, loginUserdata?.lan_id, loginUserdata?.db_company_id);
                if (details_company_res?.status == 200) {
                    await setItem("side_menu_option", {
                        soil_testing: details_company_res?.data?.data[0]?.soil_testing,
                        agri_calculator: details_company_res?.data?.data[0]?.agri_calculator
                    });
                }
                await Promise.all([
                    setItem("userNameData", loginUserdata.userName),
                    setItem("userType", loginUserdata.userType)
                ]);
                if (loginUserdata.agri_files.length > 0) {
                    const profileImg = loginUserdata.agri_files.find((item) => item.term_type === '1');
                    if (typeof profileImg != "undefined") {
                        await setItem("profileImgData", profileImg.file_path)
                    }
                } else {
                    await setItem("profileImgData", "");
                }
                await setItem('loginUser_data', loginUserdata);
                setstoreLoginUser({
                    ...storeLoginUser,
                    phone: "",
                    password: "",
                    role: ""
                })
                const [fpoDetailsList_res, reginalRes] = await Promise.all([
                    fpodetailsDataListAPI(loginUserdata.dbname, loginUserdata.lan_id, loginUserdata.token, loginUserdata.user_id, loginUserdata.sa_company[0].company_code),
                    reginalDataServiceAPI(loginUserdata.dbname, loginUserdata.lan_id, "regionaldatas")
                ]);
                if (fpoDetailsList_res.status === 200) {
                    const { company_website } = fpoDetailsList_res.data.data[0];
                    var url_regex = /^(http|https)/;
                    if (url_regex.test(String(company_website).toLowerCase()) == true) {
                        await setItem("company_website", company_website);
                    } else {
                        await setItem("company_website", `https://${company_website}`);
                    }
                }
                if (reginalRes.status === 200) {
                    const datam = reginalRes.data.data.rows;
                    datam.map(async (item) => {
                        if (item.static_cid === 1) {
                            await setItem("state", item.categoryName);
                        } else if (item.static_cid === 2) {
                            await setItem("district", item.categoryName);
                        } else if (item.static_cid === 3) {
                            await setItem("block", item.categoryName);
                        } else if (item.static_cid === 4) {
                            await setItem("currency", item.categoryName);
                        }
                    });
                }
                if (fpoDetailsList_res.status === 200) {
                    const agri_files = fpoDetailsList_res.data.data[0].agri_files;
                    const foundbotomBannerFind = agri_files.find((item) => item.term_type === 'fpo_promobanner');
                    if (typeof foundbotomBannerFind != "undefined") {
                        await setItem("bottomBannerData", foundbotomBannerFind.file_path);
                    }
                    const foundlogoFindFind = agri_files.find((item) => item.term_type === 'fpo_logo');
                    if (typeof foundlogoFindFind != "undefined") {
                        await setItem("logoImageData", foundlogoFindFind.file_path);
                    }
                    const foundtopBannerFind = agri_files.find((item) => item.term_type === 'fpo_banner');
                    if (typeof foundtopBannerFind != "undefined") {
                        await setItem("topBannerData", foundtopBannerFind.file_path);
                    }
                    const userType = await getItem("userType");
                    setIsLoading(false);
                    if (userType === 3) {
                        navigation.navigate('AdminNavigation');
                    } else if (userType === 2) {
                        navigation.navigate('FarmerNavigation');
                    }
                }
            }
        } catch (error) {
            Toast.show({ text: `${error.response.data.error.errorMessage}`, ...AlertMesg[0] })
            setIsLoading(false);
        }
        // }
    }
    const onPageLoad = async () => {
        const [companyLanguage_data, company_res] = await Promise.all([
            getItem('companyLanguage_data'),
            databaseListAPI(),
            removeItem('storeSignup_data'),
            removeItem('storePersnolInfo_data'),
            removeItem('storeFinancial_data'),
            removeItem('storeProduceInfo_data'),
            requestUserPermission(),
            notificationListener(),
            Permission.requestMultiple([PERMISSIONS_TYPE.microphone, PERMISSIONS_TYPE.fineLocation, PERMISSIONS_TYPE.notifications]),
            removeItem("side_menu_option"),
        ]);
        if (companyLanguage_data != "" && companyLanguage_data != null) {
            setcompanyLanguage(companyLanguage_data);
            const { country_id, company, language } = companyLanguage_data;
            checkPhoneNumber(country_id, company, language)
            setstoreLoginUser({
                ...storeLoginUser,
                phone: "",
                password: "",
                role: "",
                company: companyLanguage_data.company_id,
                // FcmUserToken: fcmToken_res,
            });
        }
        if (company_res.status == 200) {
            let companyArray = [];
            company_res?.data?.data?.map((data, index) => {
                const { company_id, agri_company, db_name } = data;
                companyArray.push({
                    value: company_id,
                    label: agri_company.company_name,
                    dbname: db_name,
                    country_id: agri_company.country_id,
                });
            })
            setCompanyData(companyArray);
        }
    };
    useEffect(() => {
        // console.log(fusedLocationData);
        try {
            if (isFocused) {
                onPageLoad();
                // PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            }
            if (route.params === undefined) {
                i18next.changeLanguage('1')
            } else {
                i18next.changeLanguage(`${route.params.locale}`);
            }
        }
        catch (err) {
            console.error(err)
        }
    }, [isFocused, netConnection]);
    const onChangeConpany = async (item) => {
        const { country_id, dbname, value } = item;
        const { language } = companyLanguage;
        setstoreLoginUser({ ...storeLoginUser, company: value });
        checkPhoneNumber(country_id, dbname, language);
    }
    const checkPhoneNumber = async (country_id, company, language) => {
        const checkPhoneNumber = await checkPhoneDigitAPI(country_id, company, language);
        if (checkPhoneNumber.status == 200) {
            const { contact_no_digits } = checkPhoneNumber.data?.data;
            setcontact_no_digits(contact_no_digits);
        }
    }
    const roleData = [
        { label: t('login_farmer'), value: '2' },
        { label: t('retailer'), value: '3' }
    ];
    return (
        <Root>
            {/* <ForegroundLocationService /> */}
            <StatusBar barStyle="light-content" backgroundColor="#023316" />
            <ScrollView>
                <View>
                    <View style={{ paddingHorizontal: 20 }}>
                        <View>
                            <Image source={require('../pages/Common/images/logo.png')} style={styles.logo} />
                        </View>
                        <View>
                            {isLoading ? <View style={styles.loadingScreen}><LoadingScreen /></View> : null}
                            <Text style={{ fontSize: 25, color: "#000", fontFamily: 'Poppins-Regular' }}>{t('sign_in')}</Text>
                            <Text style={{ color: "#000", fontFamily: 'Poppins-Regular' }}>{t('login_with_your_registerd_phone_number_and_password')}</Text>
                            <TextInput style={styles.simpleInputTextStyle} placeholderTextColor={'#000'} placeholder={t('enter_your_registered_Phone_no')} keyboardType="numeric" value={storeLoginUser.phone} onChangeText={phone => setstoreLoginUser({ ...storeLoginUser, phone: phone })} maxLength={contact_no_digits} />
                            <TextInput style={styles.simpleInputTextStyle} placeholderTextColor={'#000'} placeholder={t('enter_your_Password')} secureTextEntry={true} onChangeText={password => setstoreLoginUser({ ...storeLoginUser, password: password })} value={storeLoginUser.password} />
                            <View style={{ marginTop: 20, }}>
                                <DropdownForm data={roleData} label={t('select_role')} onChange={role => setstoreLoginUser({ ...storeLoginUser, role: role.value })} val={storeLoginUser.role} />
                            </View>
                            <View style={{ marginTop: 5, }}>
                                <DropdownForm data={companyData} label={t('select_company')}
                                    onChange={company => onChangeConpany(company)}
                                    val={companyLanguage.company_id} />
                            </View>
                            <View style={{ alignItems: 'center' }} >
                                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                                    <Text style={styles.title}>{t('forgot_Password')}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ alignItems: 'center', marginTop: 10, }}>
                                <TouchableOpacity>
                                    <Text style={styles.title} onPress={() => navigation.navigate('Signup')}>{t('new_to_farmer')} {t('signup_now')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View style={{ marginTop: 10 }}>
                <ButtonForm label={t('sign_in_submit')} onPress={() => saveHandle()} />
            </View>
        </Root>
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
        width: '100%',
        color: '#000'
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
        fontWeight: '300',
        color: "#000",
        fontFamily: 'Poppins-Regular'
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
    }, logo: {
        width: 250,
        height: 100,
        resizeMode: 'contain',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
        marginLeft: 40,
    },
    loadingScreen: {
        position: 'absolute',
        top: 200,
        zIndex: 999,
        left: '45%'
    },
})
