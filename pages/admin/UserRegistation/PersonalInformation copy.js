import { StyleSheet, Text, View, ScrollView,Keyboard, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import ImagePlaceHolderCircle from '../../Common/ImagePlaceHolderCircle';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import InputTextForm from '../../Common/InputTextForm';
import RadioForm from '../../Common/RadioForm';
import DropdownForm from '../../Common/DropdownForm';
import { fetchDistrictAPI, fetchStateAPI, fetchBlockAPI } from '../userlist/UsersAPI';
import PasswordComp from '../../Common/PasswordComp';
import ButtonForm from '../../Common/ButtonForm';
import { Root, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { checkPhoneDigitAPI } from '../../../config/apiHere';
import axios from 'axios';
import config from '../../../config';
const PersonalInformation = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const isFocused = useIsFocused();
    const [path,setPath]=useState("Dashboard");
    const [selectedImage, setSelectedImage] = useState(null);
    const [remove, setRemove] = useState("");
    const [stateAll, setstateAll] = useState([]);
    const [districtAll, setdistrictAll] = useState([]);
    const [blockAll, setblockAll] = useState([]);
    const [cpasswordVisibility, setcPasswordVisibility] = useState('');
    const [passwordVisibility, setPasswordVisibility] = useState('');
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: '',
        languageID: '',
        token: '',
        userID: '',
        country: '',
        company: ''
    });
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
        const response = await fetchStateAPI(dbName, languageID)
        if (response.data) {
            const dataArray = [];
            response.data.data.rows.forEach(element => {
                dataArray.push({
                    value: element.fid,
                    label: element.state_name,
                });
            });
            setstateAll(dataArray);
        }
    }
    const getDistrict = async (dbName, languageID, stateID) => {
        const response = await fetchDistrictAPI(dbName, languageID, stateID)
        if (response.status === 200) {
            const dataArray = [];
            response.data.data.rows.forEach(element => {
                dataArray.push({
                    value: element.fid,
                    label: element.district_name,
                });
            });
            setdistrictAll(dataArray);
        }
    }
    const getBlock = async (dbName, languageID, districtID) => {
        const response = await fetchBlockAPI(dbName, languageID, districtID)
        const dataArray = [];
        response.data.data.rows.forEach(element => {
            dataArray.push({
                value: element.fid,
                label: element.subdiv_name,
            });
        });
        setblockAll(dataArray);
    }
    const onPageLoad = async () => {
        const [loginUser_data
        ] = await Promise.all([
            getItem('loginUser_data')
        ]);
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const userID = loginUser_data.user_id;
            getState(dbName, languageID);
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageID: languageID,
                token: token,
                userID: userID,
                country: loginUser_data.agri_user_addresses[0].country,
                company: loginUser_data.db_company_id
            })
        }
    }
    useEffect(() => {
        if (isFocused) {
            if (typeof route.params != "undefined") {
                if (route.params.data === "remove") {
                    if(remove=="remove"){
                        setPath("RegistationSignUpViwer")
                        setRemove("");
                        setSelectedImage(null);
                    }else{
                        setRemove("remove");
                        emptyData();
                        setPath("Dashboard")
                        setSelectedImage(null)
                    }
                }
            } else {
                setRemove("");
                // setPath("Dashboard");
            }
            onPageLoad();
        }
    }, [isFocused]);
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
        setFarmerData({ ...farmerData, [name]: item.label, [value]: item.value });
        const response = await fetchDistrictAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, item.value)
        if (response.status === 200) {
            const dataArray = [];
            response.data.data.rows.forEach(element => {
                dataArray.push({
                    value: element.fid,
                    label: element.district_name,
                });
            });
            setdistrictAll(dataArray);
        }
    }
    const handleDistrictInfo = async (item, name, value) => {
        setFarmerData({ ...farmerData, [name]: item.label, [value]: item.value });
        const response = await fetchBlockAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, item.value)
        const dataArray = [];
        response.data.data.rows.forEach(element => {
            dataArray.push({
                value: element.fid,
                label: element.subdiv_name,
            });
        });
        setblockAll(dataArray);
    }
    const handleAddDataBlock = (item, name, value) => {
        setFarmerData({ ...farmerData, [name]: item.label, [value]: item.value });
    }
    const handleAddData = (name, value) => {
        setFarmerData({ ...farmerData, [name]: value });
    }
    const checkPhone = async () => {
        const check_phone_digit_res=await checkPhoneDigitAPI(dbLanTokUsr.country, dbLanTokUsr.company, dbLanTokUsr.languageID)
        if (check_phone_digit_res.data.data.contact_no_digits) {
            let require_digit = check_phone_digit_res.data.data.contact_no_digits;
            if (farmerData.phone.length ===require_digit) {
                try {
                    const axiosConfig1 = {
                        headers: {
                            'information': `${dbLanTokUsr.dbName}`,
                            'Accept': 'application/json'
                        },
                    };
                    const inputBody = {
                        "contactNumber": farmerData.phone.toString(),
                        "userType": "2"
                    };
                    let check_phone_res = await axios.post(config.phoneNoCheckAPI, inputBody, axiosConfig1);
                } catch (error) {
                    Toast.show({text: `This ${farmerData.phone} Not Available`, ...AlertMesg[0]});
                        // phoneInputRef.current.focus();
                        setFarmerData({ ...farmerData, phone: "" })
                }
                
            }
            else {
                Toast.show({
                    time: 3, text: `Please Enter ${require_digit} digit phone no`, ...AlertMesg[0]
                })
                Keyboard.dismiss();
                setFarmerData({ ...farmerData, phone: "" }) 
            }
        }
    }
    const handleNavigate = async () => {
        if (farmerData.name == "") {
            Toast.show({ text: 'Please Enter Name', ...AlertMesg[0] });
        } else if (farmerData.phone == "") {
            Toast.show({ text: 'Please Enter Valid Phone Number', ...AlertMesg[0] });
        } else if (farmerData.phone.length != 10) {
            Toast.show({ text: 'Please Enter Valid Phone Number', ...AlertMesg[0] });
        } else if (farmerData.age == "") {
            Toast.show({ text: 'Please Enter Age', ...AlertMesg[0] });
        } else if (farmerData.age < 18) {
            Toast.show({ text: 'Please Enter Eligible Age', ...AlertMesg[0] });
        } else if (farmerData.state == "") {
            Toast.show({ text: 'Please Select State First', ...AlertMesg[0] });
        } else if (farmerData.district == "") {
            Toast.show({ text: 'Please Select District First', ...AlertMesg[0] });
        } else if (farmerData.block == "") {
            Toast.show({ text: 'Please Select Block First', ...AlertMesg[0] });
        } else if (farmerData.password == "") {
            Toast.show({ text: 'Please Enter Password', ...AlertMesg[0] });
        } else if (farmerData.cpassword == "") {
            Toast.show({ text: 'Please Enter Comfirm Password', ...AlertMesg[0] });
        } else if (farmerData.password != farmerData.cpassword) {
            Toast.show({ text: 'Please Enter Same Comfirm Password', ...AlertMesg[0] });
        } else {
        }
        if(remove=="remove"){
            await setItem("storePersnolInfo_data", farmerData);
            navigation.navigate('FinancialInformation', { data: remove });
        }else{
            await setItem("storePersnolInfo_data", farmerData);
            navigation.navigate(path, { data: remove });
        }

    }
    return (
        <Root>
            <View style={{ flex: 1 }}>
                <CustomHeader path={path} />
                <FormsTitle title={'Personal Information'} />
                <ScrollView>
                    <View style={styles.container}>
                        <ImagePlaceHolderCircle openImagePicker={openImagePicker} selectedImage={selectedImage} />
                        <InputTextForm label="Name" color="red" onChangeText={(value) => handleAddData('name', value)} value={farmerData.name} />
                        <InputTextForm label="Phone Number" color="red" keyboardType="numeric"
                            onChangeText={(value) => handleAddData('phone', value)} value={farmerData.phone}
                            onBlur={(phone) => checkPhone(phone)} refname={phoneInputRef} />
                        <View>
                            <Text style={{ fontSize: 16, color: '#000' }}>Gender</Text>
                            <RadioForm
                                label="male"
                                onSelect={() => handleAddData('gender', "1")}
                                selected={farmerData.gender === '1'}
                            />
                            <RadioForm
                                label="female"
                                onSelect={() => handleAddData('gender', "2")}
                                selected={farmerData.gender === '2'}
                            />
                        </View>
                        <View style={{ marginBottom: 15, }}>
                            <Text style={{ fontSize: 16, marginTop: 15, color: '#000' }}>User Type</Text>
                            <RadioForm
                                label="large Grower"
                                onSelect={() => handleAddData('userType', "1")}
                                selected={farmerData.userType === '1'}
                            />
                            <RadioForm
                                label="Small Holder"
                                onSelect={() => handleAddData('userType', "2")}
                                selected={farmerData.userType === '2'}
                            />
                            <RadioForm
                                label="na"
                                onSelect={() => handleAddData('userType', "3")}
                                selected={farmerData.userType === '3'}
                            />
                        </View>
                        <InputTextForm label="Age" color="red" onChangeText={(value) => handleAddData('age', value)} value={farmerData.age} />
                        <DropdownForm label="State" color="red" data={stateAll} onChange={item => { handleStateInfo(item, 'state', 'stateValue') }} val={farmerData.state} />
                        <DropdownForm label="District" color="red" data={districtAll} onChange={item => { handleDistrictInfo(item, 'district', 'districtValue') }} val={farmerData.district} />
                        <DropdownForm label="Block/Subdivision" color="red" data={blockAll} onChange={item => { handleAddDataBlock(item, 'block', 'bloctValue') }} val={farmerData.block} />
                        <InputTextForm label="Address" onChangeText={(value) => handleAddData('address', value)} value={farmerData.address} />
                        <InputTextForm label="ZIP/PIN Code" onChangeText={(value) => handleAddData('pin', value)} value={farmerData.pin} />
                        <PasswordComp setPasswordVisibility={setPasswordVisibility} passwordVisibility={passwordVisibility} label={'Password'} onChangeText={(value) => handleAddData('password', value)} value={farmerData.password} />
                        <PasswordComp setPasswordVisibility={setcPasswordVisibility} passwordVisibility={cpasswordVisibility} label={'Confirm Password'} onChangeText={(value) => handleAddData('cpassword', value)} value={farmerData.cpassword} />
                    </View>
                </ScrollView>
                <ButtonForm label='Next' onPress={handleNavigate} />
            </View>
        </Root>
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
        elevation: 5
    },

})