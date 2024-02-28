import { Image, StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert,StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import DropdownForm from './Common/DropdownForm';
import axios from 'axios';
import config from '../config'

import Logo from './Common/Logo';
import ImagePlaceHolderCircle from './Common/ImagePlaceHolderCircle';
import InputTextForm from './Common/InputTextForm';
import RadioForm from './Common/RadioForm';
import ButtonForm from './Common/ButtonForm';
import { useNavigation, useRoute } from '@react-navigation/native';
import { blockDataListAPI, districtDataListAPI, languageDataListAPI, stateInfoDataListAPI } from '../config/apiHere';
import { getItem, setItem } from '../config/getDataFromStorage';
import { isNotEmpty } from './Common/ValidationFunctions';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from './Common/ToastAlert'

const PersnolUpdate = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pagename } = route.params;
    const [dbName, setdbName] = useState();
    const [languageData, setlanguageData] = useState([]);
    const [stateInfoData, setstateInfoData] = useState([]);
    const [districtData, setDistrictData] = useState([]);
    const [blockData, setBlockData] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [storePersnolInfo, setstorePersnolInfo] = useState({
        language: '',
        stateInfo: '',
        district: '',
        block: '',
        name: '',
        gender: 'male',
        userType: 'large Grower',
        age: '',
        address: '',
        zip: ''
    });
    let languageDataList = async (dbname) => {
        // console.log(dbname);
        try {
            let languageArray = [];
            let language_res = await languageDataListAPI(dbname);
            if (language_res.data.data) {
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

    const handleLanguage = (language) => {
        setstorePersnolInfo({ ...storePersnolInfo, language: language })
        stateInfoDataList(dbName, language)
    }

    let stateInfoDataList = async (dbName, language) => {
        try {
            let stateArray = [];
            let state_res = await stateInfoDataListAPI(dbName, language);
            if (state_res.data.data.count > 0) {
                state_res.data.data.rows.forEach(element => {
                    stateArray.push({
                        value: element.fid,
                        label: element.state_name,
                    });
                });
                setstateInfoData(stateArray);
            }
        } catch (error) {
            console.log("Error in state API", error.response);
        }
    }
    const handleStateInfo = (stateInfo) => {
        setstorePersnolInfo({ ...storePersnolInfo, stateInfo: stateInfo })
        districtDataList(dbName, storePersnolInfo.language, stateInfo);
    }

    let districtDataList = async (dbName, language, stateInfo) => {
        try {
            let districtArray = [];
            let district_res = await districtDataListAPI(dbName, language, stateInfo);
            if (district_res.data.data) {
                district_res.data.data.rows.forEach(element => {
                    districtArray.push({
                        value: element.fid,
                        label: element.district_name,
                    });
                });
                setDistrictData(districtArray);
            }
        } catch (error) {
            console.log("Error in district API", error.response);
        }
    }

    const handleDistrict = (district) => {
        setstorePersnolInfo({ ...storePersnolInfo, district: district })
        blockDataList(dbName, storePersnolInfo.language, district);
    }
    let blockDataList = async (dbName, language, district) => {
        try {
            let blocktArray = [];
            let block_res = await blockDataListAPI(dbName, language, district);
            if (block_res.data.data) {
                block_res.data.data.rows.forEach(element => {
                    blocktArray.push({
                        value: element.fid,
                        label: element.subdiv_name,
                    });
                });
                setBlockData(blocktArray);
            }
        } catch (error) {
            console.log("Error in Block API", error).response;
        }
    }

    const validateForm = () => {
        if (!storePersnolInfo.name) {
            Toast.show({
                time: 3, text: 'Please enter name', ...AlertMesg[0]
            })
            return false;
        }

        if (!storePersnolInfo.age) {
            Toast.show({
                time: 3, text: 'Please Enter Eligible Age', ...AlertMesg[0]
            })
            return false;
        }
        if (storePersnolInfo.age <= 17) {
            Toast.show({
                time: 3, text: 'Please Enter Eligible Age', ...AlertMesg[0]
            })
            return false;
        }
        if (!storePersnolInfo.language.value) {
            Toast.show({
                time: 3, text: 'Please select a language', ...AlertMesg[0]
            })
            return false;
        }
        if (!storePersnolInfo.stateInfo.value) {
            Toast.show({
                time: 3, text: 'Please select a state', ...AlertMesg[0]
            })
            return false;
        }
        if (!storePersnolInfo.block.value) {
            Toast.show({
                time: 3, text: 'Please select a block', ...AlertMesg[0]
            })
            return false;
        }
        if (!storePersnolInfo.district.value) {
            Toast.show({
                time: 3, text: 'Please select a district', ...AlertMesg[0]
            })
            return false;
        }
    
        return true;
    };

    // const validationData = () => {
    //     if (isNotEmpty(storePersnolInfo.name) &&
    //         isNotEmpty(storePersnolInfo.age) &&
    //         (storePersnolInfo.language.value) &&
    //         (storePersnolInfo.stateInfo.value) &&
    //         (storePersnolInfo.block.value) &&
    //         (storePersnolInfo.district.value)) {
    //         return true;
    //     } else if (storePersnolInfo.age <= 18) {
    //         Alert.alert("Age", "Please Enter Eligible Age");
    //         return false;
    //     }
    //     else {
    //         return false;
    //     }

    // }
    const handleSave = async () => {
        // sahitya
        // navigation.navigate(pagename, { pagename: 'ProduceInfo' });
        // const res = validationData();
        // console.log(res)
        if (validateForm()) {
            await setItem("storePersnolInfo_data", storePersnolInfo);
            navigation.navigate(pagename, { pagename: 'ProduceInfo' });
        }
    }


    const onPageLoad = async () => {
        //   let mydata= await getItem('storePersnolInfo_data')
        // return console.log(mydata);
        const storeSignup_data = await getItem('storeSignup_data');
        setdbName(storeSignup_data.company.dbname)
        languageDataList(storeSignup_data.company.dbname);
        const storePersnolInfo_data = await getItem('storePersnolInfo_data');
        if (storePersnolInfo_data) {
            setstorePersnolInfo(storePersnolInfo_data);
            if (storePersnolInfo_data.language) {
                stateInfoDataList(storeSignup_data.company.dbname, storePersnolInfo_data.language);
            }
            if (storePersnolInfo_data.stateInfo || storePersnolInfo_data.language) {
                districtDataList(storeSignup_data.company.dbname, storePersnolInfo_data.language, storePersnolInfo_data.stateInfo);

            }
            if (storePersnolInfo_data.district || storePersnolInfo_data.language) {
                blockDataList(storeSignup_data.company.dbname, storePersnolInfo_data.language, storePersnolInfo_data.district);
                // console.log(storePersnolInfo_data.district);
            }
        }
        // console.log(storePersnolInfo_data);

    };
    const openImagePicker = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
            maxHeight: 200,
            maxWidth: 200,
        };
        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('Image picker error: ', response.error);
            } else {
                // let imageUri = response.uri || response.assets?.[0]?.uri;
                let imageUri = response.uri || response.assets[0].base64;
                setSelectedImage(imageUri);
            }
        });
    };
    useEffect(() => {
        onPageLoad();
        console.log("nice", pagename);
        // { userData.username }
    }, []);

    return (
        <>
        <StatusBar barStyle="light-content" backgroundColor={"#003c04"} />
            <View style={styles.container}>
                <View style={{ height: 60, backgroundColor: '#003c04' }}></View>
                <View style={styles.headersContainer}>
                    <Text style={styles.headersTitle}>New Registration</Text>
                    <Text style={styles.headersTitle}>{'Personal \nInformation'}</Text>
                </View>
                <View style={{ marginHorizontal: '2.5%'}}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View>
                            <Image source={require('../pages/Common/images/logo.png')} style={styles.logo} />
                        </View>
                        <View style={{
                            backgroundColor: '#E9FCC5',
                            paddingHorizontal: '3%',
                            paddingVertical: '3%',
                            borderRadius: 20,
                            marginBottom: 200
                        }}>
                            <ImagePlaceHolderCircle openImagePicker={openImagePicker} selectedImage={selectedImage} />
                            <InputTextForm label="Name" color="red" value={storePersnolInfo.name ?? name} onChangeText={name => { setstorePersnolInfo({ ...storePersnolInfo, name: name }) }} />
                            <View>
                                <Text style={{ fontSize: 16 }}>Gender</Text>
                                <RadioForm
                                    label="Male"
                                    selected={storePersnolInfo.gender === 'male'}
                                    onSelect={() => setstorePersnolInfo({ ...storePersnolInfo, gender: 'male' })}
                                />
                                <RadioForm
                                    label="female"
                                    selected={storePersnolInfo.gender === 'female'}
                                    onSelect={() => setstorePersnolInfo({ ...storePersnolInfo, gender: 'female' })}
                                />
                            </View>

                            <View style={{ marginBottom: 15, }}>
                                <Text style={{ fontSize: 16, marginTop: 15, }}>User Type</Text>
                                <RadioForm
                                    label="large Grower"
                                    selected={storePersnolInfo.userType === 'large Grower'}
                                    onSelect={() => setstorePersnolInfo({ ...storePersnolInfo, userType: 'large Grower' })}

                                />
                                <RadioForm
                                    label="Small Holder"
                                    selected={storePersnolInfo.userType === 'small holder'}
                                    onSelect={() => setstorePersnolInfo({ ...storePersnolInfo, userType: 'small holder' })}

                                />
                                <RadioForm
                                    label="na"
                                    selected={storePersnolInfo.userType === 'na'}
                                    onSelect={() => setstorePersnolInfo({ ...storePersnolInfo, userType: 'na' })}

                                />
                            </View>

                            <InputTextForm label="Age" color="red" value={storePersnolInfo.age ?? age} onChangeText={age => { setstorePersnolInfo({ ...storePersnolInfo, age: age }) }} keyboardType="numeric" />

                            <DropdownForm label="Language" color="red" data={languageData} onChange={item => { handleLanguage(item) }} val={storePersnolInfo.language} />

                            <DropdownForm label="State/Division/Zone" color="red" data={stateInfoData} onChange={item => { handleStateInfo(item) }} val={storePersnolInfo.stateInfo} />

                            <DropdownForm label="District/Country" color="red" data={districtData} onChange={item => { handleDistrict(item) }} val={storePersnolInfo.district} />

                            <DropdownForm label="Block/Sub Country/UpZila" color="red" data={blockData} onChange={item => { setstorePersnolInfo({ ...storePersnolInfo, block: item }) }} val={storePersnolInfo.block} />

                            <InputTextForm label="Address" value={storePersnolInfo.address ?? address} onChangeText={address => { setstorePersnolInfo({ ...storePersnolInfo, address: address }) }} />

                            <InputTextForm label="ZIP/PIN Code" value={storePersnolInfo.zip ?? zip} onChangeText={zip => { setstorePersnolInfo({ ...storePersnolInfo, zip: zip }) }} maxLength={6} />
                        </View>
                    </ScrollView >
                </View>
            </View>
            <ButtonForm label='Next' onPress={() => handleSave('Financial')} />
            <Root></Root>
        </>
    )
}

export default PersnolUpdate

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff'
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
    logo: {
        width: 250,
        height: 100,
        resizeMode: 'contain',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
        marginLeft: 60,
    },
})
