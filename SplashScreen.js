import { StyleSheet, Text, View, Image, ActivityIndicator, ImageBackground } from 'react-native'
import React, { useEffect, useState } from 'react'
import ButtonForm from './pages/Common/ButtonForm';
import DropdownForm from './pages/Common/DropdownForm';
import MessageDialog from './pages/Common/MessageDialog';
import { databaseListAPI, firstLanguageListAPI } from './config/apiHere';
import { getItem, removeItem, setItem } from './config/getDataFromStorage';
import ViewModalPast from './pages/admin/Output/ViewModalPast';
import SplashScreenModal from './SplashScreenModal';
const SplashScreen = ({ navigation }) => {
    const [companyData, setCompanyData] = useState([]);
    const [isLoading, setisLoading] = useState(true);
    const [companyLanguage, setcompanyLanguage] = useState({
        company: "",
        language: ""
    });
    const [modalVisible, setModalVisible] = useState(true);
    const [languageData, setlanguageData] = useState([]);
    const validationData = () => {
        if (
            (companyLanguage.company) &&
            (companyLanguage.language)
        ) {
            return true;
        }
        else {
            MessageDialog({ title: 'Require', message: 'Please fill in all required fields with valid data.' })
            return;
        }

    }

    let databaseList = async () => {
        try {
            let companyArray = [];
            let company_res = await databaseListAPI();
            // console.log(company_res);
            if (company_res.data.data) {
                setisLoading(false)
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
            console.error('company APi error code with :', error.response);
        }
    }
    const companyHandle = async (company) => {
        setcompanyLanguage({ ...companyLanguage, company: company })
        languageDataList(company.dbname);
        setisLoading(true);
    }

    let languageDataList = async (dbName) => {
        try {
            let languageArray = [];
            let language_res = await firstLanguageListAPI(dbName);

            if (language_res.data.data) {
                setisLoading(false)
                language_res.data.data.forEach(element => {
                    languageArray.push({
                        value: element.id,
                        label: element.name,
                    });
                });
                setlanguageData(languageArray);
            }
        } catch (error) {
            console.log("Error in language API", error.response);
        }
    }
    const handleStart = async () => {
        const validatin_res = validationData();
        if (validatin_res) {
            await setItem('companyLanguage_data', companyLanguage);
            navigation.replace('Login');
        }
    }

    const onPageLoad = async () => {
        // await removeItem('companyLanguage_data')
        // await removeItem('loginUser_data')
        const companyLanguage_data = await getItem('companyLanguage_data');
        const loginUser_data = await getItem('loginUser_data');

        if (loginUser_data) {
            navigation.replace('AdminNavigation');
        } else {
            if (companyLanguage_data) {

                navigation.replace('Login');
            }

        }
    }

    useEffect(() => {
        onPageLoad()
        databaseList();
    }, []);
    return (
        <>
            {
                isLoading ? (
                    <View>
                        <ActivityIndicator size="large" color="#007ACC" />
                    </View>) : (

                    <View style={styles.container}>
                        <SplashScreenModal setModalVisible={setModalVisible} modalVisible={modalVisible} outputSingle=""
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                        />
                        
                        <ImageBackground
                            source={require('./pages/Common/images/crystal_splash_screen.jpg')} // Replace with the path to your image
                            style={styles.backgroundImage}
                        >
                            <View style={styles.content}>
                                <Image source={require('./pages/Common/images/greenqube_logo.png')} style={styles.logo} />
                            </View>
                        </ImageBackground>
                    </View>


                )


            }

        </>
    )
}

export default SplashScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
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

