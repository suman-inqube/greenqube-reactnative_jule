import { StyleSheet, Text, View, Image, ActivityIndicator, ImageBackground } from 'react-native'
import React, { useEffect, useState } from 'react'
import ButtonForm from './pages/Common/ButtonForm';
import DropdownForm from './pages/Common/DropdownForm';
import MessageDialog from './pages/Common/MessageDialog';
import { databaseListAPI, firstLanguageListAPI } from './config/apiHere';
import { getItem, removeItem, setItem } from './config/getDataFromStorage';
import SplashScreenModal from './SplashScreenModal';
import SplashScreenModalLanguage from './SplashScreenModalLanguage';
const SplashScreen = ({ navigation }) => {
    const [companyData, setCompanyData] = useState([]);
    const [companyDataRaw, setCompanyDataRaw] = useState([]);
    const [isLoading, setisLoading] = useState(false);
    const [companyLanguage, setCompanyLanguage] = useState({
        company: "",
        company_id: "",
        language: "",
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibleLan, setModalVisibleLan] = useState(false);
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
            let company_res = await databaseListAPI();
            // console.log(company_res);
            if (company_res.data.data) {
                const delay = 1000; 

                const timeout = setTimeout(() => {
                    setModalVisible(true)
                    setCompanyData(company_res.data.data);
                    setCompanyDataRaw(company_res.data.data);

                }, delay);        
              

            }
        } catch (error) {
            console.error('company APi error code with :', error.response);
        }
    }
    const companyHandle = async (dbName,company_id) => {
        // return console.log(company_id);
        setCompanyLanguage({ ...companyLanguage, 
            company: dbName,
            company_id:company_id}
            )
        languageDataList(dbName);
        setModalVisible(false)
        setisLoading(true);
    }
    const languageHandle = async (item) => {
        // return console.log(companyLanguage);
        await setItem('companyLanguage_data', 
        {
            language:item,
            company:companyLanguage.company,
            company_id:companyLanguage.company_id
        }
        );
        navigation.replace('Login');

    }

    let languageDataList = async (dbName) => {
        try {
          
            let language_res = await firstLanguageListAPI(dbName);
            //  return console.log(language_res.data.data);
            if (language_res.data.data) {
                setisLoading(false)
                setModalVisibleLan(true)
                setlanguageData(language_res.data.data);
            }
        } catch (error) {
            console.log("Error in language API", error.response);
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
            else
            {
                databaseList();
               
                
            }


        }
    }

    const searchDBName = (text) => {
     
         const result = companyDataRaw.filter(item =>
             item.db_name.toLowerCase().includes(text.toLowerCase())
         );
         if (result) {
             setCompanyData(result)
         } else {
             console.log('Item not found');
         }
     }

    useEffect(() => {
        onPageLoad()
       
    }, []);
    return (
        <>
           

                    <View style={styles.container}>

                        <SplashScreenModal setModalVisible={setModalVisible} modalVisible={modalVisible} companyData={companyData} sendDataToParent={companyHandle} searchTextData={searchDBName}
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }} 
                        />
                        
                        <SplashScreenModalLanguage setModalVisibleLan={setModalVisibleLan} modalVisibleLan={modalVisibleLan} companyData={languageData} sendDataToParentLan={languageHandle}
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

