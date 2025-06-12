import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
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
const Persnol = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pagename } = route.params;
    const [dbName, setdbName] = useState();
    const [languageData, setlanguageData] = useState([]);
    const [stateInfoData, setstateInfoData] = useState([]);
    const [districtData, setDistrictData] = useState([]);
    const [blockData, setBlockData] = useState([]);
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
                    // console.log(element.id);
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

    const validationData = () => {
        if (isNotEmpty(storePersnolInfo.name) &&
            isNotEmpty(storePersnolInfo.age) &&
            (storePersnolInfo.language.value) &&
            (storePersnolInfo.stateInfo.value) &&
            (storePersnolInfo.block.value) &&
            (storePersnolInfo.district.value)) {
            return true;
        }
        else {
            return false;
        }

    }
    const handleSave = async () => {
        const res = validationData();
        if (res) {
            await setItem("storePersnolInfo_data", storePersnolInfo);
            navigation.navigate(pagename, { pagename: 'ProduceInfo' });
        }
    }


    const onPageLoad = async () => {
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

    useEffect(() => {
        onPageLoad();
        // console.log("nice", pagename);
        // { userData.username }
    }, []);
    return (
        <>
            <ScrollView style={{ backgroundColor: '#D5FFD0' }}>
                <View style={{ backgroundColor: '#D5FFD0' }}>
                    <View style={{ paddingHorizontal: 20 }}>
                        <Logo iheight={100} iwidth={100} />
                        <ImagePlaceHolderCircle />
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

                        <InputTextForm label="ZIP/PIN Code" value={storePersnolInfo.zip ?? zip} onChangeText={zip => { setstorePersnolInfo({ ...storePersnolInfo, zip: zip }) }} />
                    </View>
                </View>
            </ScrollView>
            <View style={{ marginTop: 10, backgroundColor: '#D5FFD0' }}>
                <ButtonForm label='Next' onPress={() => handleSave('Financial')} />
            </View>

        </>
    )
}

export default Persnol

const styles = StyleSheet.create({
})
