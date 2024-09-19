import { StyleSheet, Text, View, ScrollView, Keyboard, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { fetchDistrictAPI, fetchStateAPI, fetchBlockAPI } from '../userlist/UsersAPI';
import { useNavigation, useRoute, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { checkPhoneDigitAPI, phoneNoCheckAPI } from '../../../config/apiHere';
import { CrashlyticsRecordError } from '../../Crashlytics/CrashlyticsRecordError';
import { userCreateContext } from '../../Context/usersCreateContext';
const PersonalInformation = () => {
    //GQR-65
    const { dbLanTokUsr, InputTextForm, RadioForm, getItem, setItem, AlertMesg, t, PasswordComp, ButtonForm, onBackPress, axios, config, DeviceInfo,
        DropdownForm, Root, Toast, CustomHeader, FormsTitle, ImagePlaceHolderCircle, logoImage, topBanner } = useContext(userCreateContext);
    //GQR-65
    const { netConnection } = DeviceInfo();
    const navigation = useNavigation();
    const route = useRoute();
    const isFocused = useIsFocused();
    const [selectedImage, setSelectedImage] = useState(null);
    const [remove, setRemove] = useState("");
    const [stateAll, setstateAll] = useState([]);
    const [districtAll, setdistrictAll] = useState([]);
    const [blockAll, setblockAll] = useState([]);
    const [cpasswordVisibility, setcPasswordVisibility] = useState('');
    const [passwordVisibility, setPasswordVisibility] = useState('');
    const phoneInputRef = useRef(null);
    const [farmerData, setFarmerData] = useState({
        userImg: {},
        address: "",
        district: "",
        districtValue: "",
        stateValue: "",
        state: "",
        block: "",
        age: "",
        pin: "",
        name: "",
        phone: "",
        gender: "1",
        userType: "1",
        password: "",
        cpassword: "",
    });
    const [path, setPath] = useState("");
    const [regionaldatas, setregionaldatas] = useState({
        state: "",
        district: "",
        block: "",
    });
    const [contact_no_digits, setcontact_no_digits] = useState(11);
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
                let imageUri = response.uri || response.assets[0].base64;
                // setmyPhoto([...myphoto,]);
                setFarmerData({ ...farmerData, userImg: { uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName } });
                setSelectedImage(imageUri);
            }
        });
    };
    const getState = async (dbName, languageID) => {
        var dataArray = [];
        if (netConnection) {
            const response = await fetchStateAPI(dbName, languageID);
            if (response.status == 200) {
                dataArray = response?.data?.data?.rows?.map(data => ({ value: data.fid, label: data.state_name }))
                await setItem('fetchStateAPI', dataArray)
            }
        } else {
            var fetchState_local_data = await getItem('fetchStateAPI');
            if (fetchState_local_data) {
                dataArray = fetchState_local_data;
            }
        }
        setstateAll(dataArray);
    }
    const onPageLoad = async () => {
        const [state, district, block
        ] = await Promise.all([
            getItem("state"),
            getItem("district"),
            getItem("block")
        ]);
        setregionaldatas({ ...regionaldatas, state: state, district: district, block: block })
        //GQR-65
        const { dbName, languageId, token, supervisorId, company, country, languageConpany, country_id } = dbLanTokUsr;
        //GQR-65
        const [checkPhoneNumberDigit] = await Promise.all([
            checkPhoneDigitAPI(country_id, languageConpany, languageId),
            getState(dbName, languageId)
        ])
        if (checkPhoneNumberDigit?.status == 200) {
            const { contact_no_digits } = checkPhoneNumberDigit?.data?.data;
            setcontact_no_digits(contact_no_digits);
        }
    }
    useEffect(() => {
        if (isFocused) {

            if (typeof route.params != "undefined") {
                if (route.params.data === "remove") {
                    if (remove == "remove") {
                        setRemove(""); setSelectedImage(null);
                    } else {
                        setRemove("remove"); setSelectedImage(null);
                    }
                    emptyData();
                }
                if (typeof route.params.pagename != 'undefined') {
                    setPath(route.params.pagename);
                } else {
                    setPath("");
                }
            } else {
                setPath(""); setRemove("");
            }
            onPageLoad();
        }
    }, [isFocused, netConnection]);
    const handleBackPress = () => {
        navigation.navigate(path != "" ? path : 'Dashboard');
        return true // disable normal behaviour
    }
    useFocusEffect(
        useCallback(() => {
            onBackPress(handleBackPress);
        })
    );
    const emptyData = () => {
        setFarmerData({
            userImg: {},
            address: "",
            district: "",
            districtValue: "",
            stateValue: "",
            state: "",
            block: "",
            age: "",
            pin: "",
            name: "",
            phone: "",
            gender: "1",
            userType: "1",
            password: "",
            cpassword: "",
        });
    }

    const handleStateInfo = async (item, name, value) => {
        setFarmerData({ ...farmerData, [name]: item.label, [value]: item.value, ['district']: '', ['block']: '' });
        var dataArray = [];
        var distric_list_arr = [];
        let fetchDistrict_local_data = await getItem('fetchDistrictAPI');
        if (netConnection) {
            const response = await fetchDistrictAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, item.value)
            if (response?.status === 200) {
                dataArray = response?.data?.data?.rows.map(data => ({ value: data.fid, label: data.district_name }));
                if (fetchDistrict_local_data != null && fetchDistrict_local_data.length > 0) {
                    if (fetchDistrict_local_data[0][item.value] != undefined) {
                        JSON.parse(fetchDistrict_local_data[0][item.value]).push({ [item.value]: JSON.stringify(dataArray) });
                    } else {
                        fetchDistrict_local_data.push({ [item.value]: JSON.stringify(dataArray) });
                    }
                } else {
                    distric_list_arr.push({ [item.value]: JSON.stringify(dataArray) })
                    fetchDistrict_local_data = distric_list_arr;
                }
                await setItem('fetchDistrictAPI', fetchDistrict_local_data);
            }
        } else {
            var fetchDistrict_local_arr = [];
            if (fetchDistrict_local_data) {
                fetchDistrict_local_arr = fetchDistrict_local_data.filter(function (v, i) {
                    return fetchDistrict_local_data[i][item.value] != undefined;
                })
                if (fetchDistrict_local_arr.length != 0) {
                    dataArray = JSON.parse(fetchDistrict_local_arr[0][item.value])
                } else {
                    dataArray = [];
                }
            }
        }
        setblockAll([])
        setdistrictAll(dataArray);
    }
    const handleDistrictInfo = async (item, name, value) => {
        setFarmerData({ ...farmerData, [name]: item.label, [value]: item.value, ['block']: '' });
        var dataArray = [];
        var dlock_list_arr = [];
        let fetchBlockAPI_local_data = await getItem('fetchBlockAPI');
        if (netConnection) {
            const response = await fetchBlockAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, item.value)
            dataArray = response?.data?.data?.rows.map(data => ({ value: data.fid, label: data.subdiv_name }));
            if (fetchBlockAPI_local_data != null && fetchBlockAPI_local_data.length > 0) {
                if (fetchBlockAPI_local_data[0][item.value] != undefined) {
                    JSON.parse(fetchBlockAPI_local_data[0][item.value]).push({ [item.value]: JSON.stringify(dataArray) });
                } else {
                    fetchBlockAPI_local_data.push({ [item.value]: JSON.stringify(dataArray) });
                }
            } else {
                dlock_list_arr.push({ [item.value]: JSON.stringify(dataArray) })
                fetchBlockAPI_local_data = dlock_list_arr;
            }
            await setItem('fetchBlockAPI', fetchBlockAPI_local_data);
        } else {
            dataArray = await getItem('fetchBlockAPI');
            fetchDistrict_local_data = await getItem('fetchDistrictAPI');
            const fetchBlockAPI_local_arr = fetchBlockAPI_local_data.filter(function (v, i) {
                return fetchBlockAPI_local_data[i][item.value] != undefined;
            })
            if (fetchBlockAPI_local_arr.length != 0) {
                dataArray = JSON.parse(fetchBlockAPI_local_arr[0][item.value])
            } else {
                dataArray = [];
            }
        }
        setblockAll(dataArray);
    }
    const handleAddDataBlock = (item, name, value) => {
        setFarmerData({ ...farmerData, [name]: item.label, [value]: item.value });
    }
    const handleAddData = (name, value) => {
        setFarmerData({ ...farmerData, [name]: value });
    }
    const checkPhone = async () => {
        if (netConnection) {
            const check_phone_digit_res = await checkPhoneDigitAPI(dbLanTokUsr.country_id, dbLanTokUsr.languageConpany, dbLanTokUsr.languageId)
            if (check_phone_digit_res?.status == 200) {
                if (check_phone_digit_res.data.data.contact_no_digits) {
                    let require_digit = check_phone_digit_res.data.data.contact_no_digits;
                    if (farmerData.phone.length === require_digit) {
                        try {
                            const axiosConfig1 = { headers: { 'information': `${dbLanTokUsr.dbName}`, 'Accept': 'application/json' }, };
                            const phonenumber = await phoneNoCheckAPI(farmerData.phone, axiosConfig1);
                            if (phonenumber?.status != 200) {
                                Toast.show({ text: `This ${farmerData.phone} Not Available`, ...AlertMesg[0] });
                                setFarmerData({ ...farmerData, phone: "" })
                            }
                        } catch (error) {
                            Toast.show({ text: `This ${farmerData.phone} Not Available`, ...AlertMesg[0] });
                            // phoneInputRef.current.focus();
                            setFarmerData({ ...farmerData, phone: "" })
                        }
                    } else {
                        Toast.show({ time: 3, text: `Please Enter ${require_digit} digit phone no`, ...AlertMesg[0] })
                        Keyboard.dismiss();
                        setFarmerData({ ...farmerData, phone: "" })
                    }
                }
            }
        }
    }
    const handleNavigate = async () => {
        Keyboard.dismiss();
        if (farmerData.name == "") {
            Toast.show({ text: `${t('please_enter_valid_name')}`, ...AlertMesg[0] });
        } else if (farmerData.phone == "") {
            Toast.show({ text: `${t('please_enter_valid_mobile_no')}`, ...AlertMesg[0] });
        } else if (farmerData.phone.length != contact_no_digits) {
            Toast.show({ text: `${t('please_enter_valid_mobile_no')}`, ...AlertMesg[0] });
        } else if (farmerData.age == "") {
            Toast.show({ text: `${t('please_enter_birth_date')}`, ...AlertMesg[0] });
        } else if (farmerData.age < 18) {
            Toast.show({ text: `${t('please_eligible_birth_date')}`, ...AlertMesg[0] });
        } else if (farmerData.state == "") {
            Toast.show({ text: `${t('please_select_state_first')}`, ...AlertMesg[0] });
        } else if (farmerData.district == "") {
            Toast.show({ text: `${t('please_select_zila_first')}`, ...AlertMesg[0] });
        } else if (farmerData.block == "") {
            Toast.show({ text: `${t('select_block_first')}`, ...AlertMesg[0] });
        } else if (farmerData.password == "") {
            Toast.show({ text: `${t('enter_pass')}`, ...AlertMesg[0] });
        } else if (farmerData.cpassword == "") {
            Toast.show({ text: `${t('enter_conf_pass')}`, ...AlertMesg[0] });
        } else if (farmerData.password != farmerData.cpassword) {
            Toast.show({ text: `${t('same_pass')}`, ...AlertMesg[0] });
        } else {
            if (path != "") {
                await setItem("storePersnolInfo_data", farmerData);
                navigation.navigate(route.params.pagename, { data: remove });
            } else {
                await setItem("storePersnolInfo_data", farmerData);
                navigation.navigate('FinancialInformation', { data: remove });
            }
        }
    }
    const HandlerGoBack = () => {
        if (path != '') { navigation.navigate(path) } else { navigation.navigate('Dashboard') }
    }
    return (
        <>
            <Root>
                <View style={{ flex: 1 }}>
                    <CustomHeader path={path != '' ? path : 'Dashboard'} HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
                    <FormsTitle title={t('personal_information')} />
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        // behavior='position' keyboardVerticalOffset={keyboardVerticalOffset}
                        behavior={Platform.OS === "ios" ? "padding" : null}
                        // behavior='position'
                        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
                    >
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.container}>
                                <ImagePlaceHolderCircle openImagePicker={openImagePicker} selectedImage={selectedImage} />
                                <InputTextForm label={t('name')} color="red" onChangeText={(value) => handleAddData('name', value)} value={farmerData.name} />
                                <InputTextForm label={t('new_reg_phone_number')} color="red" keyboardType="numeric"
                                    onChangeText={(value) => handleAddData('phone', value)} value={farmerData.phone}
                                    onBlur={(phone) => checkPhone(phone)} refname={phoneInputRef} maxLength={contact_no_digits} />
                                <View>
                                    <Text style={styles.text}>{t('farmer_reg_gnd')}</Text>
                                    <RadioForm
                                        label={t('farmer_reg_male')}
                                        onSelect={() => handleAddData('gender', "1")}
                                        selected={farmerData.gender === '1'}
                                    />
                                    <RadioForm
                                        label={t('farmer_reg_female')}
                                        onSelect={() => handleAddData('gender', "2")}
                                        selected={farmerData.gender === '2'}
                                    />
                                    <RadioForm
                                        label={t('farmer_reg_other')}
                                        onSelect={() => handleAddData('gender', "3")}
                                        selected={farmerData.gender === '3'}
                                    />
                                </View>
                                <View style={{ marginBottom: 15, }}>
                                    <Text style={styles.text}>{t('far_reg_far_type')}</Text>
                                    <RadioForm
                                        label={t('grower')}
                                        onSelect={() => handleAddData('userType', "1")}
                                        selected={farmerData.userType === '1'}
                                    />
                                    <RadioForm
                                        label={t('small_holder')}
                                        onSelect={() => handleAddData('userType', "2")}
                                        selected={farmerData.userType === '2'}
                                    />
                                    <RadioForm
                                        label={t('farm_worker')}
                                        onSelect={() => handleAddData('userType', "3")}
                                        selected={farmerData.userType === '3'}
                                    />
                                </View>
                                <InputTextForm label={t('age')} color="red" keyboardType={'number-pad'} maxLength={2} onChangeText={(value) => handleAddData('age', value)} value={farmerData.age} />
                                <DropdownForm label={regionaldatas.state == "" ? t('state_col') : t(`${regionaldatas.state}`)} color="red" data={stateAll} onChange={item => { handleStateInfo(item, 'state', 'stateValue') }} val={farmerData.state} />
                                <DropdownForm label={regionaldatas.district == "" ? t('select_zila') : t(`${regionaldatas.district}`)} color="red" data={districtAll} onChange={item => { handleDistrictInfo(item, 'district', 'districtValue') }} val={farmerData.district} />
                                <DropdownForm label={regionaldatas.block == "" ? t('select_block_sub_county_upzila') : t(`${regionaldatas.block}`)} color="red" data={blockAll} onChange={item => { handleAddDataBlock(item, 'block', 'bloctValue') }} val={farmerData.block} />
                                <InputTextForm label={t('enter_address')} onChangeText={(value) => handleAddData('address', value)} value={farmerData.address} />
                                <InputTextForm label={t('valid_pin_code')} keyboardType={'number-pad'} maxLength={6} onChangeText={(value) => handleAddData('pin', value)} value={farmerData.pin} />
                                <PasswordComp setPasswordVisibility={setPasswordVisibility} passwordVisibility={passwordVisibility} label={t('new_reg_password')} onChangeText={(value) => handleAddData('password', value)} value={farmerData.password} />
                                <PasswordComp setPasswordVisibility={setcPasswordVisibility} passwordVisibility={cpasswordVisibility} label={t('new_reg_confirm_password')} onChangeText={(value) => handleAddData('cpassword', value)} value={farmerData.cpassword} />
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
                <ButtonForm label={t('next')} onPress={handleNavigate} />
            </Root>
        </>
    )
}
export default PersonalInformation
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#E9FCC5',
        paddingHorizontal: '3%',
        paddingVertical: '3%',
        borderRadius: 20,
        marginBottom: 50,
        marginHorizontal: 20,
        elevation: 5,
        marginBottom: 100
    },
    text: {
        fontSize: 16,
        marginTop: 15,
        color: '#000',
        fontFamily: 'Poppins-Regular'
    }

})