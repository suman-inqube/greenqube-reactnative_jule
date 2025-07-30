import { StyleSheet, Text, View, Image, ActivityIndicator, ImageBackground, Dimensions, BackHandler, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import ButtonForm from './pages/Common/ButtonForm';
import DropdownForm from './pages/Common/DropdownForm';
import MessageDialog from './pages/Common/MessageDialog';
import { databaseListAPI, firstLanguageListAPI } from './config/apiHere';
import { getItem, removeItem, setItem } from './config/getDataFromStorage';
import SplashScreenModal from './SplashScreenModal';
import SplashScreenModalLanguage from './SplashScreenModalLanguage';
import { HeaderBackButton } from 'react-navigation';
import i18next from 'i18next';
import { Root, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from './pages/Common/ToastAlert';
import CustomAlert from './pages/Common/CustomAlert';
import NotificationServices from './pages/PushNotification/NotificationServices';
import JailMonkey from 'jail-monkey';
import MyErrorBoundary from './pages/Common/MyErrorBoundary';
import { CrashlyticsRecordError } from './pages/Crashlytics/CrashlyticsRecordError';
import {NativeModules} from 'react-native';
const SplashScreen = ({ navigation }) => {
    const {ConfigModule} = NativeModules;
    // const { requestUserPermission, notificationListener } = NotificationServices();
    const { width, height } = Dimensions.get('window');
    const [companyData, setCompanyData] = useState([]);
    const [companyDataRaw, setCompanyDataRaw] = useState([]);
    const [isLoading, setisLoading] = useState(false);
    const [companyLanguage, setCompanyLanguage] = useState({
        company: "",
        company_id: "",
        language: "",
        country_id: "",
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibleLan, setModalVisibleLan] = useState(false);
    const [languageData, setlanguageData] = useState([]);
    const validationData = () => {
        if ((companyLanguage.company) && (companyLanguage.language)) {
            return true;
        } else {
            Toast.show({ time: 3, text: 'Please fill in all required fields with valid data.', ...AlertMesg[0] })
            return;
        }
    }
    let databaseList = async () => {
        try {
            let company_res = await databaseListAPI();
            if (company_res?.status == 200) {
                if (company_res?.data?.data) {
                    const delay = 1000;
                    const timeout = setTimeout(() => {

                        // setCompanyData(company_res.data.data);
                        setCompanyDataRaw(company_res.data.data);
                        setModalVisible(true);

                    }, delay);
                }
                // console.log('company APi called');
            }
        } catch (error) {
            CrashlyticsRecordError(error, 'SplashScreen', 'databaseListAPI');
            // CustomAlert('Error:', 'Respose is blank.' + error, true, 'OK');
            console.error('company APi error code with :', error);
        }
    }
    const companyHandle = async (dbName, company_id, company_name, country_id) => {
        setCompanyLanguage({
            ...companyLanguage,
            company: dbName,
            company_id: company_id,
            company_name: company_name,
            country_id: country_id
        });
        languageDataList(dbName);
        setModalVisible(false)
        setisLoading(true);
    }
    const languageHandle = async (item) => {
        await setItem('companyLanguage_data', {
            language: item,
            company: companyLanguage.company,
            company_id: companyLanguage.company_id,
            company_name: companyLanguage.company_name,
            country_id: companyLanguage.country_id,
        });
        await setItem('companyFirstEntry', 1);
        navigation.replace('Login');
    }
    let languageDataList = async (dbName) => {
        try {
            let language_res = await firstLanguageListAPI(dbName);
            if (language_res.data.data) {
                setisLoading(false)
                setModalVisibleLan(true)
                setlanguageData(language_res.data.data);
            }
        } catch (error) {
            console.log("Error in language API", error.response);
        }
    }
    const handleAppStateChange = async (nextAppState = 'active') => {
        const isRooted = JailMonkey.isJailBroken();
        const isDevMode = await JailMonkey.isDevelopmentSettingsMode();
        if (!__DEV__) {
            if (isRooted || isDevMode) {
                Alert.alert(
                    'Security Alert',
                    isRooted
                        ? 'This device is rooted. The app will now exit.'
                        : 'Developer mode is enabled. The app will now exit.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setTimeout(() => {
                                    BackHandler.exitApp();
                                }, 800);
                            },
                        },
                    ],
                    { cancelable: false },
                );
                return false; // Stop execution of further logic
            }

            return true;
        }
    };
    const onPageLoad = async () => {
        try {

            //  const baseUrl = await ConfigModule.getBaseURL();
            //  const encryptedKey = await ConfigModule.getEncryptedKey();
            //  console.log('Base URL:', baseUrl);
            //  console.log('Encrypted Key:', encryptedKey);
            const shouldContinue = await handleAppStateChange(); // ⬅ check immediately on load
            if (shouldContinue == false) return;
            const [companyLanguage_data, loginUser_data] = await Promise.all([
                getItem('companyLanguage_data'),
                getItem('loginUser_data'),
                // requestUserPermission(),
                // notificationListener(),
            ])
            if (loginUser_data) {
                i18next.changeLanguage(`${loginUser_data.lan_id}`);
                setTimeout(async () => {
                    const userType = await getItem("userType");
                    if (userType === 3) {
                        navigation.navigate('AdminNavigation');
                    } else if (userType === 2) {
                        navigation.navigate('FarmerNavigation');
                    }
                }, 2000);
            } else {
                if (companyLanguage_data) {
                    navigation.replace('Login');
                } else {
                    databaseList();
                }
            }
        } catch (error) {
            CrashlyticsRecordError(error, 'SplashScreen', 'onPageLoad')
        }

    }
    const searchDBName = (text) => {
        if (text.length > 0) {
            const result = companyDataRaw?.filter(item =>
                item?.agri_company?.company_display_name?.toLowerCase().includes(text.toLowerCase())
            );
            if (result) {
                setCompanyData(result)
            } else {
                console.log('Item not found');
            }
        } else {
            setCompanyData([]);
        }
    }
    useEffect(() => {
        onPageLoad();
        // setModalVisible(true);
    }, []);

    return (
        <MyErrorBoundary>
            <Root>
                <ImageBackground
                    source={require('./pages/Common/images/crystal_splash_screen.jpg')} // Replace with the path to your image
                    style={styles.backgroundImage}
                >
                    <View style={styles.container}>
                        <SplashScreenModal height={height} setModalVisible={setModalVisible} modalVisible={modalVisible} companyData={companyData} sendDataToParent={companyHandle} searchTextData={searchDBName}
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                        />
                        <SplashScreenModalLanguage setModalVisibleLan={setModalVisibleLan} modalVisibleLan={modalVisibleLan} companyData={languageData} sendDataToParentLan={languageHandle}
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                        />

                        <View style={styles.content}>
                            <Image source={require('./pages/Common/images/greenqube_logo.png')} style={styles.logo} />
                        </View>
                    </View>
                </ImageBackground>
            </Root>
        </MyErrorBoundary>
    )
}

export default SplashScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    content: {
        flex: 1,
        marginTop: 130,
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontSize: 20,
    },
    logo: {
        width: 250,
        height: 150,
        resizeMode: 'contain',
    },
});

