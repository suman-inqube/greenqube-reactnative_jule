import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, BackHandler } from 'react-native'
import React, { useState, useEffect, useCallback, useContext } from 'react'
import { userDetailAPI } from '../../../config/apiHere';
import MessageDialog from '../../Common/MessageDialog';
import { updateUserInfoAPI, districtDataListAPI1, blockDataListAPI1, firstLanguageListAPI, stateListAPI } from '../../../config/apiHere';
import { useNavigation, useIsFocused, CommonActions } from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
const Profile = () => {
    //GQR-67
    const { loginUser_data, CustomHeader, t, AlertMesg, getItem, removeItem, logoImage, topBanner, Root, Toast, InputTextForm, DropdownForm, ButtonForm } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    //GQR-67
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [languageData, setlanguageData] = useState([]);
    const [stateInfoData, setstateInfoData] = useState([]);
    const [districtData, setDistrictData] = useState([]);
    const [blockData, setBlockData] = useState([]);
    const [storePersnolInfo, setstorePersnolInfo] = useState({
        block: "",
        blockName: "",
        contactNumber: "",
        date_of_birth: "",
        district: "",
        districtName: "",
        langId: "",
        langIdName: "",
        locale: "",
        state: "",
        stateName: "",
        userId: "",
        userName: ""
    });
    const [regionaldatas, setregionaldatas] = useState({
        state: "",
        district: "",
        block: "",
    })
    const handleSave = async () => {
        addressInfo = [{
            country: '1',
            state: storePersnolInfo.state,
            district: storePersnolInfo.district,
            subdivision: storePersnolInfo.block
        }];
        if (storePersnolInfo.stateName == "") {
            Toast.show({ text: `${t('please_select_state_first')}`, ...AlertMesg[0] });
        } else if (storePersnolInfo.districtName == "") {
            Toast.show({ text: `${t('please_select_zila_first')}`, ...AlertMesg[0] });
        } else if (storePersnolInfo.blockName == "") {
            Toast.show({ text: `${t('select_block_first')}`, ...AlertMesg[0] });
        } else {
            const formData = new FormData();
            formData.append("lan_id", storePersnolInfo.langId);
            formData.append("addressInfo", JSON.stringify(addressInfo));
            formData.append("status", "1");
            formData.append("userName", storePersnolInfo.userName);
            formData.append("date_of_birth", storePersnolInfo.date_of_birth);
            let submitRes = await updateUserInfoAPI(dbname, storePersnolInfo.language, storePersnolInfo.userId, token, formData);

            if (submitRes?.status === 200) {
                Toast.show({ text: `${t('Data_submitted_successfully')}`, ...AlertMesg[0] });
                handleLogout();
                setTimeout(() => {
                    navigation.navigate('Login', { pagename: 'Login', locale: storePersnolInfo.langIdName });
                }, 1500);
            } else {
                // MessageDialog({ title: 'Error', message: error.response.data.error.errorMessage })
                Toast.show({ text: error.response.data.error.errorMessage, ...AlertMesg[0] });
                handleLogout();
                navigation.navigate('Login', { pagename: 'Login' });
            }
        }
    }
    let languageDataList = async (dbname) => {
        try {
            let language_res = await firstLanguageListAPI(dbname);
            if (language_res?.status == 200) {
                let languageArray = language_res?.data?.data?.map(data => ({ value: data.id, label: data.name, sName: data.sname }))
                setlanguageData(languageArray);
            }
        } catch (error) {
            console.log("Error in language API", error.response);
        }
    }
    const handleLanguage = (language) => {
        // setstorePersnolInfo({
        //     storePersnolInfo,
        //     langId: language.value,
        //     locale: language.sName,
        //     langIdName: language.label,
        //     block: "",
        //     blockName: "",
        //     district: "",
        //     districtName: "",
        //     state: "",
        //     stateName: "",
        // })
        if (language.value !== storePersnolInfo.langId) {
            setstorePersnolInfo({ ...storePersnolInfo, state: "", langId: language.value, locale: language.sName,      block: "",
                blockName: "",
                district: "",
                districtName: "",
                state: "",
                stateName: "", })
        }
        stateInfoDataList(dbname, language.value, token)

    }
    let stateInfoDataList = async (dbname, language, token) => {
        try {
            let state_res = await stateListAPI(dbname, language, token);
            if (state_res?.status == 200) {
                let stateArray = state_res?.data?.data?.rows?.map(data => ({ value: data?.fid, label: data?.state_name }));
                setstateInfoData(stateArray);
            }
        } catch (error) {
            console.log("Error in state API", error.response);
        }
    }
    const handleStateInfo = (state) => {
        setstorePersnolInfo({
            ...storePersnolInfo,
            state: state.value,
            stateName: state.label,
            block: "",
            blockName: "",
            district: "",
            districtName: "",
        })
        districtDataList(dbname, storePersnolInfo.langId, state.value);
    }
    let districtDataList = async (dbname, language, state) => {
        try {
            let district_res = await districtDataListAPI1(dbname, language, state);
            if (district_res?.status == 200) {
                let districtArray = district_res?.data?.data?.rows?.map(data => ({ value: data?.fid, label: data?.district_name }))
                setDistrictData(districtArray);
            }
        } catch (error) {
            console.log("Error in district API", error.response);
        }
    }
    const handleDistrict = (district) => {
        setstorePersnolInfo({
            ...storePersnolInfo,
            district: district.value,
            districtName: district.label,
            block: "",
            blockName: "",
        })
        blockDataList(dbname, storePersnolInfo.langId, district.value);
    }
    let blockDataList = async (dbname, language, district) => {
        try {
            let block_res = await blockDataListAPI1(dbname, language, district);
            if (block_res?.status == 200) {
                let blocktArray = block_res?.data?.data?.rows?.map(data => ({ value: data?.fid, label: data?.subdiv_name }))
                setBlockData(blocktArray);
            }
        } catch (error) {
            console.log("Error in Block API", error).response;
        }
    }
    const userDetails = async (dbname, languageId, token, user_id) => {
        let response = await userDetailAPI(dbname, languageId, token, user_id);
        if (response?.status == 200) {
            setstorePersnolInfo({
                ...storePersnolInfo,
                userId: user_id,
                userName: response?.data?.data[0]?.userName,
                contactNumber: response?.data?.data[0]?.contactNumber,
                date_of_birth: response?.data?.data[0]?.date_of_birth,
                langId: response?.data?.data[0]?.agri_language.id,
                langIdName: response?.data?.data[0]?.agri_language.name,
                locale: response?.data?.data[0]?.agri_language.sname,
                state: response?.data?.data[0]?.agri_user_addresses[0]?.agri_state?.fid,
                stateName: response?.data?.data[0]?.agri_user_addresses[0]?.agri_state?.state_name,
                district: response?.data?.data[0]?.agri_user_addresses[0]?.agri_district?.fid,
                districtName: response?.data?.data[0]?.agri_user_addresses[0]?.agri_district?.district_name,
                block: response?.data?.data[0]?.agri_user_addresses[0]?.agri_subdivision?.fid,
                blockName: response?.data?.data[0]?.agri_user_addresses[0].agri_subdivision?.subdiv_name,
            })
            languageDataList(dbname)
            if (response?.data?.data[0]?.agri_language.id) {
                stateInfoDataList(dbname, response?.data?.data[0]?.agri_language.id, token)
            }
            if (response?.data?.data[0]?.agri_user_addresses[0]?.agri_state?.fid) {
                districtDataList(dbname, response?.data?.data[0]?.agri_language.id, response?.data?.data[0]?.agri_user_addresses[0]?.agri_state?.fid);
            }
            if (response?.data?.data[0]?.agri_user_addresses[0]?.agri_district?.fid) {
                blockDataList(dbname, response?.data?.data[0]?.agri_language.id, response?.data?.data[0]?.agri_user_addresses[0]?.agri_district?.fid);
            }
        }
    }
    const onPageLoad = async () => {
        const [loginUser_data, state,
            district, block] = await Promise.all([
                getItem('loginUser_data'),
                getItem("state"),
                getItem("district"),
                getItem("block")
            ])
        if (loginUser_data) {
            setregionaldatas({
                ...regionaldatas,
                state: state,
                district: district,
                block: block,
            })
            const { dbname, lan_id, token, user_id } = loginUser_data;
            userDetails(dbname, lan_id, token, user_id)
        }
    };
    const handleLogout = async () => {
        await Promise.all([
            removeItem("logoImageData"),
            removeItem('loginUser_data'),
            removeItem("profileImgData"),
            removeItem("userNameData"),
            removeItem("userType"),
            removeItem("bottomBannerData"),
            removeItem("topBannerData")
        ]);
        // const popAction = StackActions.pop(1);
        // navigation.dispatch(popAction);
        // navigation.navigate('Login', { pagename: 'Login', locale: storePersnolInfo.langIdName });
        navigation.dispatch(
            CommonActions.reset({
                index: 4,
                routes: [
                    { name: 'Login' },
                    {
                        name: 'Login',
                        params: { pagename: 'Login', locale: storePersnolInfo.langId },
                    },
                ],
            })
        );
    }
    useEffect(() => {
        if (isFocused) {
            onPageLoad();
        }
        const onBackPress = () => { navigation.navigate('Dashboard'); return true; };
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [isFocused]);
    // useFocusEffect(
    //     useCallback(() => {
    //         const onBackPress = () => {
    //             navigation.navigate('Dashboard');
    //             return true;
    //         };
    //         BackHandler.addEventListener(
    //             'hardwareBackPress', onBackPress
    //         );
    //         return () =>
    //             BackHandler.removeEventListener(
    //                 'hardwareBackPress', onBackPress
    //             );
    //     }, [])
    // );
    const HandlerGoBack = () => navigation.navigate('Dashboard');
    return (
        <>
            <Root>
                <View style={styles.container}>
                    <CustomHeader path='Dashboard' HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { paddingBottom: 8, paddingTop: 4, fontWeight: '700', fontSize: 18 }]}>
                            {t('profile')}
                        </Text>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.fromContainer}>
                            <InputTextForm label={t('name')} color="black" value={storePersnolInfo.userName} editable={false} />
                            <InputTextForm label={t('new_reg_phone_number')} color="black" value={storePersnolInfo.contactNumber} editable={false} />
                            <View>
                                <Text style={{ color: 'black', marginLeft: 5, fontFamily: 'Poppins-Regular' }}>{t('date_of_birth')}</Text>
                                <TouchableOpacity style={styles.DateofBirth}>
                                    <Text style={{ color: '#000', fontFamily: 'Poppins-Regular' }}>{storePersnolInfo.date_of_birth} </Text>
                                    <Image
                                        source={require('../../Common/images/calendar.png')}
                                        style={{ width: 20, height: 20 }}
                                    />
                                </TouchableOpacity>
                            </View>
                            <DropdownForm label={t('select_language')} color="black" data={languageData} onChange={item => { handleLanguage(item) }} val={storePersnolInfo.langIdName} />
                            <DropdownForm label={regionaldatas.state == "" ? t('state_col') : t(`${regionaldatas.state}`)} color="black" data={stateInfoData} onChange={item => { handleStateInfo(item) }} val={storePersnolInfo.stateName} />
                            <DropdownForm label={regionaldatas.district == "" ? t('select_zila') : t(`${regionaldatas.district}`)} color="black" data={districtData} onChange={item => { handleDistrict(item) }} val={storePersnolInfo.districtName} />
                            <DropdownForm label={regionaldatas.block == "" ? t('select_block_sub_county_upzila') : t(`${regionaldatas.block}`)} color="black" data={blockData} onChange={item => { setstorePersnolInfo({ ...storePersnolInfo, block: item.value, blockName: item.label }) }} val={storePersnolInfo.blockName} />
                        </View>
                    </ScrollView>
                </View>
                <ButtonForm label={t('submit')} onPress={() => handleSave()} />
            </Root>
        </>
    )
}
export default Profile
const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 50
    },
    titleContainer: {
        width: "95%",
        alignItems: 'flex-end',
        paddingVertical: 10,
    },
    title: {
        color: '#000',
    },
    fromContainer: {
        width: '90%',
        marginHorizontal: '5%'
    },
    DateofBirth: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        borderRadius: 8,
        height: 40,
        borderColor: 'gray',
        borderWidth: 0.5,
        backgroundColor: 'white',
        width: '100%',
        paddingHorizontal: 10,
    }
})


