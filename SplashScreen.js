import { StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import ButtonForm from './pages/Common/ButtonForm';
import DropdownForm from './pages/Common/DropdownForm';
import MessageDialog from './pages/Common/MessageDialog';
import { databaseListAPI, firstLanguageListAPI } from './config/apiHere';
import { getItem, removeItem, setItem } from './config/getDataFromStorage';
const SplashScreen = ({ navigation }) => {
    const [companyData, setCompanyData] = useState([]);
    const [isLoading, setisLoading] = useState(true);
    const [companyLanguage, setcompanyLanguage] = useState({
        company: "",
        language: ""
    });
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
        const storeSignup_data = await getItem('companyLanguage_data');
        // console.log(storeSignup_data);
        if (storeSignup_data) {
            navigation.replace('Login');
        }


    };

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
                        <View style={{ alignItems: 'center' }}>
                            <Image source={require('./pages/Common/images/logo.png')} style={styles.logo} />
                            <Text style={{ fontSize: 20 }}>Green Qube</Text>
                        </View>
                        <DropdownForm data={companyData} label="Company" color='red' onChange={company => { companyHandle(company) }} val={companyLanguage.company.value} />
                        <DropdownForm label="language" data={languageData} color='red' onChange={language => setcompanyLanguage({ ...companyLanguage, language: language })} val={companyLanguage.language.value} />
                        <ButtonForm label="Start App" onPress={handleStart} />
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
        justifyContent: 'center',
        marginHorizontal: 40,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
});

