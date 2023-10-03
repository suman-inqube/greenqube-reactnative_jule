import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fpodetailsDataListAPI } from '../../config/apiHere';

const CustomHeader = () => {
    const navigation = useNavigation();
    const [logoImage, setlogoImage] = useState();
    let fpoDetailsList = async (dbName, languageID, token, userID, compCode) => {
        let response = await fpodetailsDataListAPI(dbName, languageID, token, userID, compCode);

        if (response.data) {
            const agri_files = response.data.data[0].agri_files;
            const logoFind = 'fpo_logo';
            const foundlogoFindFind = agri_files.find((item) => item.term_type === logoFind);

            // console.log(foundtopBannerFind.file_path);
            setlogoImage(foundlogoFindFind);
        }

    }

    const openDrawer = () => {
        navigation.openDrawer();
    }
    const onPageLoad = async () => {
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const userID = loginUser_data.user_id;
            const compCode = loginUser_data.sa_company[0].company_code;
            setIsLoading(false);
            fpoDetailsList(dbName, languageID, token, userID, compCode);
        }
        else {
            setIsLoading(true);
        }
    };
    useEffect(() => {
        // onPageLoad();
    }, []);
    return (
        <View style={styles.mainContainer}>
            <View style={{ marginHorizontal: 20 }}>
                <View style={Platform.OS === 'android' ? styles.androidContainer : styles.iosContainer}>
                    <Text style={{ fontSize: 20, }}>Dashboard</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                            onPress={openDrawer}>
                            <Image source={require('../Common/images/3dot.png')} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={openDrawer}>
                            <Image source={require('../Common/images/3dot.png')} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default CustomHeader;
const styles = StyleSheet.create({
    mainContainer: {
        // backgroundColor: 'red',
        borderBottomWidth: 2,
    },
    androidContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    iosContainer: {
        marginTop: 30,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
})
