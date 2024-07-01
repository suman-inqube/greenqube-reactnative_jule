import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Keyboard } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import ImageForm from '../../Common/ImageForm'
import { fetchBlockAPI, fetchDistrictAPI, fetchStateAPI, farmerProfileInformation, firstLanguageListAPI, UserProfileUpdate } from '../userlist/UsersAPI'
import { launchImageLibrary } from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker'
import config from '../../../config'
import { useNavigation, useIsFocused, CommonActions } from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
const FarmerProfile = ({ sendDataToParent, farmerID }) => {
    //GQR-67
    const { loginUser_data, ButtonForm, InputTextForm, DropdownForm, RadioForm, t, ImagePlaceHolderCircle, Root, Toast, AlertMesg, getItem, logoImage, topBanner, onBackPress, setItem, CustomHeader, effective_dates } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id, agri_user_addresses } = loginUser_data;
    //GQR-67
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    // const { farmeruserID, userName, contactNumber, profileImage, gender, farmer_type } = route.params;
    const [newdate, setnewDate] = useState(new Date())
    const [open, setOpen] = useState(false)
    const [dbName, setdbName] = useState();
    const [languageData, setlanguageData] = useState([]);
    const [languageID, setlanguageID] = useState();
    const [loginUserId, setLoginUserId] = useState("");
    const [loginUserToken, setLoginUserToken] = useState("");
    const [stateAll, setstateAll] = useState([]);
    const [districtAll, setdistrictAll] = useState([]);
    const [blockAll, setblockAll] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [myphoto, setmyPhoto] = useState({ uri: "", type: "", name: "" });
    const [farmerData, setfarmerData] = useState({
        userName: "",
        contactNumber: "",
        gender: "",
        farmer_type: "",
        age: "",
        state: "",
        district: "",
        block: "",
        aadhar_number: "",
        pan_number: "",
        voter_card_number: "",
        kcc_number: "",
        user_bank_account_holder: "",
        user_bank_account_name: "",
        user_bank_branch_name: "",
        user_bank_account_number: "",
        user_bank_ifsc_code: "",
        pension_authority: "",
        pension_account_no: "",
        effective_from: "",
        pension_amount: "",
        frequency: "",
        company_name: "",
        policy_no: "",
        sum_insured: ""
    });
    const [regionaldatas, setregionaldatas] = useState({ state: "", district: "", block: "" })
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
                setmyPhoto({ uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                setSelectedImage(imageUri);
            }
        });
    }
    let languageDataList = async (dbname) => {
        try {
            let language_res = await firstLanguageListAPI(dbname);
            if (language_res?.status == 200) {
                let languageArray = language_res?.data?.data.map(data => ({ value: data.id, label: data.name, sName: data.sname }));
                setlanguageData(languageArray);
            }
        } catch (error) {
            console.log("Error in language API", error.response);
        }
    }
    const handleLanguage = (data) => {
        setlanguageID(data.value);
        setfarmerData({ ...farmerData, lan_id: data.value, lanName: data.label, lanSname: data.sName })
        setfarmerData({ ...farmerData, state: "", stateName: "", district: "", districtName: "", block: "", blockName: "" })
        getState(dbName, data.value);

    }
    const getState = async (dbName, languageID) => {
        const response = await fetchStateAPI(dbName, languageID)
        if (response?.status == 200) {
            const dataArray = response?.data?.data?.rows.map(data => ({ value: data.fid, label: data.state_name }));
            setstateAll(dataArray);
        }
    }
    const getDistrict = async (dbName, languageID, stateID) => {
        const response = await fetchDistrictAPI(dbName, languageID, stateID)
        if (response?.status === 200) {
            const dataArray = response.data.data.rows.map(data => ({ value: data.fid, label: data.district_name }));
            setdistrictAll(dataArray);
        }
    }
    const getBlock = async (dbName, languageID, districtID) => {
        const response = await fetchBlockAPI(dbName, languageID, districtID);
        if (response?.status == 200) {
            const dataArray = response?.data?.data?.rows.map(data => ({ value: data.fid, label: data.subdiv_name }));
            setblockAll(dataArray);
        }
    }
    const handleStateDistrictBlock = (moduleName, data) => {
        setfarmerData({ ...farmerData, [moduleName]: data.value, [`${moduleName}Name`]: data.label })
        if (moduleName === 'state') {
            setfarmerData({ ...farmerData, state: data.value, stateName: data.label, district: "", districtName: "", block: "", blockName: "" })
            const stateID = data.value;
            getDistrict(dbName, languageID, stateID);
        } else if (moduleName === 'district') {
            const dataArray = [];
            setblockAll(dataArray);
            const districtID = data.value;
            getBlock(dbName, languageID, districtID)
        }
    }
    const handleEffectFrom = async (item) => {
        const cycleEnds = effective_dates(item);
        setfarmerData({ ...farmerData, effective_from: cycleEnds });
    }
    const onPageLoad = async () => {
        const [state, district, block] = await Promise.all([getItem("state"), getItem("district"), getItem("block")])
        setregionaldatas({ ...regionaldatas, state: state, district: district, block: block })
        const res = await farmerProfileInformation(dbname, lan_id, token, user_id)
        const farmerFound = res?.data?.data[0];
        if (farmerFound) {
            const dob = new Date(farmerFound?.date_of_birth);
            const currentDate = new Date();
            const yearsDiff = currentDate.getFullYear() - dob.getFullYear();
            if (farmerFound?.agri_user_addresses[0].agri_district) {
                await Promise.all([
                    getDistrict(dbname, lan_id, agri_user_addresses[0].agri_state.fid),
                    getBlock(dbname, lan_id, agri_user_addresses[0].agri_district.fid),
                    setLoginUserId(user_id),
                    setLoginUserToken(token),
                ]);
            }
            if (farmerFound?.agri_files[0] != undefined) {
                setSelectedImage(farmerFound?.agri_files[0].file_path);
            }
            console.log(farmerFound?.gender);
            console.log(farmerFound?.farmer_type)
            await Promise.all([
                languageDataList(dbname),
                getState(dbname, lan_id),
                setdbName(dbname),
                setlanguageID(lan_id),
                setfarmerData({
                    ...farmerData,
                    userName: farmerFound?.userName,
                    contactNumber: farmerFound?.contactNumber,
                    gender: farmerFound?.gender,
                    farmer_type: farmerFound?.farmer_type,
                    date_of_birth: farmerFound?.date_of_birth,
                    age: yearsDiff.toString(),
                    country: farmerFound?.agri_user_addresses[0].country,
                    lan_id: farmerFound?.agri_language.id,
                    lanName: farmerFound?.agri_language.name,
                    lanSname: farmerFound?.agri_language.sname,
                    state: farmerFound?.agri_user_addresses[0].agri_state.fid,
                    stateName: farmerFound?.agri_user_addresses[0].agri_state.state_name,
                    district: farmerFound?.agri_user_addresses[0].agri_district.fid,
                    districtName: farmerFound?.agri_user_addresses[0].agri_district.district_name,
                    block: farmerFound?.agri_user_addresses[0].agri_subdivision.fid,
                    blockName: farmerFound?.agri_user_addresses[0].agri_subdivision.subdiv_name,
                    aadhar_number: farmerFound?.aadhar_number,
                    pan_number: farmerFound?.pan_number,
                    voter_card_number: farmerFound?.voter_card_number,
                    kcc_number: farmerFound?.kcc_number,
                    user_bank_account_holder: farmerFound?.user_bank_account_holder,
                    user_bank_account_name: farmerFound?.user_bank_account_name,
                    user_bank_branch_name: farmerFound?.user_bank_branch_name,
                    user_bank_account_number: farmerFound?.user_bank_account_number,
                    user_bank_ifsc_code: farmerFound?.user_bank_ifsc_code,
                    pension_authority: farmerFound?.pension_details.pension_authority,
                    pension_account_no: farmerFound?.pension_details.pension_account_no,
                    effective_from: farmerFound?.pension_details.effective_from,
                    pension_amount: farmerFound?.pension_details.pension_amount,
                    frequency: farmerFound?.pension_details.frequency,
                    company_name: farmerFound?.lic_details.company_name,
                    policy_no: farmerFound?.lic_details.policy_no,
                    sum_insured: farmerFound?.lic_details.sum_insured
                })
            ]);
        }
    };
    const handleBackPress = () => { navigation.navigate('FarmerDashboard'); return true; }
    useEffect(() => {
        if (isFocused) {
            setmyPhoto({ uri: "", type: "", name: "" });
            setSelectedImage(null);
            onPageLoad();
            onBackPress(handleBackPress);
        }
    }, [isFocused]);
    const handleUserListUpdate = async () => {
        if (validateForm()) {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const yearsToSubtract = farmerData.age;
            const day = currentDate.getDate();
            const month = currentDate.getMonth() + 1;
            const newYear = currentYear - yearsToSubtract;
            const dob = `${newYear}-${month}-${day}`;
            Keyboard.dismiss();
            const formData = new FormData();
            formData.append("meta", []);
            formData.append("lan_id", languageID);
            formData.append("father_name", "");
            formData.append("gender", farmerData.gender);
            formData.append("cast", "");
            formData.append("bankInfo", []);
            formData.append("addressInfo", JSON.stringify([{ country: farmerData.country, state: farmerData.state, district: farmerData.district, subdivision: farmerData.block }]));
            formData.append("status", 1);
            formData.append("userName", farmerData.userName);
            formData.append("date_of_birth", dob);
            formData.append("unique_id", "");
            formData.append("has_farmer_smart_phone", "");
            formData.append("finance_agriculture_campagin", "");
            formData.append("financial_or_bank_name", "");
            formData.append("bank_account_number", "");
            formData.append("financial_entity_name", "");
            formData.append("farmer_belongs_name", "");
            formData.append("emailId", "");
            formData.append("type_percel_ownership_document", "");
            formData.append("farmer_belongs_option", "");
            formData.append("finance_agriculture_campagin_option", "");
            formData.append("faco_value", "");
            formData.append("agent_ally", "");
            formData.append("aadhar_number", farmerData.aadhar_number);
            formData.append("kcc_number", farmerData.kcc_number);
            formData.append("user_bank_account_holder", farmerData.user_bank_account_holder);
            formData.append("user_bank_account_name", farmerData.user_bank_account_name);
            formData.append("user_bank_account_number", farmerData.user_bank_account_number);
            formData.append("user_bank_branch_name", farmerData.user_bank_branch_name);
            formData.append("user_bank_ifsc_code", farmerData.user_bank_ifsc_code);
            formData.append("pension_details", JSON.stringify({ pension_authority: farmerData.pension_authority, pension_account_no: farmerData.pension_account_no, effective_from: farmerData.effective_from, pension_amount: farmerData.pension_amount, frequency: farmerData.frequency }));
            formData.append("lic_details", JSON.stringify({ company_name: farmerData.company_name, policy_no: farmerData.policy_no, sum_insured: farmerData.sum_insured }));
            formData.append("pan_number", farmerData.pan_number);
            formData.append("voter_card_number", farmerData.voter_card_number);
            formData.append("farmer_type", farmerData.farmer_type);
            if (myphoto.name != "") {
                formData.append("photo", myphoto);
            }
            const userDataUpdate = await UserProfileUpdate(dbName, languageID, loginUserId, loginUserToken, formData);
            if (userDataUpdate.status === 200) {
                Toast.show({ text: t('info_updated_successfully'), ...AlertMesg[0] });
                setTimeout(() => {
                    // RemoveFarmerData();
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 4,
                            routes: [
                                { name: 'Login' },
                                {
                                    name: 'Login',
                                    params: { pagename: 'Login', locale: languageID },
                                },
                            ],
                        })
                    );
                }, 2000);
            }
        }
    }
    const validateForm = () => {
        Keyboard.dismiss();
        if (farmerData.userName.length < 1) {
            Toast.show({ text: t('please_enter_valid_name'), ...AlertMesg[0] });
            return false;
        } else if (farmerData.age == "") {
            Toast.show({ text: t('please_enter_birth_date'), ...AlertMesg[0] });
            return false;
        } else if (farmerData.age < 18) {
            Toast.show({ text: t('please_eligible_birth_date'), ...AlertMesg[0] });
            return false;
        } else if (farmerData.state == "") {
            Toast.show({ text: t('select_state_first'), ...AlertMesg[0] });
            return false;
        } else if (farmerData.district == "") {
            Toast.show({ text: t('select_district_first'), ...AlertMesg[0] });
            return false;
        } else if (farmerData.block == "") {
            Toast.show({ text: t('select_block_first'), ...AlertMesg[0] });
            return false;
        }
        return true;

    }
    const HandlerGoBack = () => navigation.navigate('FarmerDashboard');
    return (
        <>
            <Root>
                <CustomHeader path='FarmerDashboard' HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
                <ScrollView >
                    <View style={{ marginHorizontal: 20, backgroundColor: '#FFFFF' }}>
                        <View style={{ backgroundColor: '#E9FCC5', marginTop: 30, borderRadius: 20, elevation: 3 }}>
                            <View style={{ marginTop: 20, marginHorizontal: 15 }}>
                                <View style={{ alignItems: 'Left' }}>
                                    <ImagePlaceHolderCircle openImagePicker={openImagePicker} selectedImage={selectedImage} />
                                </View>
                                <InputTextForm label={t('name')} color="red" value={farmerData.userName}
                                    onChangeText={userName => { setfarmerData({ ...farmerData, userName: userName }) }}

                                />
                                <InputTextForm label={t('new_reg_phone_number')} color="red" value={farmerData.contactNumber} editable={false} />
                                <View>
                                    <Text style={{ fontSize: 16, color: '#000' }}>{t('farmer_reg_gnd')}</Text>
                                    <RadioForm
                                        label={t('farmer_reg_male')}
                                        selected={farmerData.gender == "1"}
                                        onSelect={() => setfarmerData({ ...farmerData, gender: "1" })}
                                    />
                                    <RadioForm
                                        label={t('farmer_reg_female')}
                                        selected={farmerData.gender == "2"}
                                        onSelect={() => setfarmerData({ ...farmerData, gender: '2' })}
                                    />
                                </View>
                                <View style={{ marginBottom: 15 }}>
                                    <Text style={{ fontSize: 16, marginTop: 15, color: '#000' }}>{t('far_reg_far_type')}</Text>
                                    <RadioForm
                                        label={t('grower')}
                                        selected={farmerData.farmer_type == "1"}
                                        onSelect={() => setfarmerData({ ...farmerData, farmer_type: "1" })}
                                    />
                                    <RadioForm
                                        label={t('small_holder')}
                                        selected={farmerData.farmer_type == "2"}
                                        onSelect={() => setfarmerData({ ...farmerData, farmer_type: "2" })}
                                    />
                                    <RadioForm
                                        label={t('farm_worker')}
                                        selected={farmerData.farmer_type == "3"}
                                        onSelect={() => setfarmerData({ ...farmerData, farmer_type: "3" })}
                                    />
                                </View>
                                <InputTextForm label={t('age')} value={farmerData.age ?? farmerData.age} keyboardType="numeric"
                                    onChangeText={age => { setfarmerData({ ...farmerData, age: age }) }} />
                                <DropdownForm label={t('add_class_language')} color="black" data={languageData} onChange={item => { handleLanguage(item) }} val={farmerData.lanName} />
                                <DropdownForm label={regionaldatas.state == "" ? t('pre_state_division_zone') : t(`${regionaldatas.state}`)} data={stateAll} onChange={data => { handleStateDistrictBlock("state", data) }} val={farmerData.stateName} />
                                <DropdownForm label={regionaldatas.district == "" ? t('pre_district_county') : t(`${regionaldatas.district}`)} data={districtAll} onChange={data => { handleStateDistrictBlock("district", data) }} val={farmerData.districtName} />
                                <DropdownForm label={regionaldatas.block == "" ? t('select_block_sub_county_upzila') : t(`${regionaldatas.block}`)} data={blockAll} onChange={item => {
                                    setfarmerData({ ...farmerData, block: item.value })
                                }} val={farmerData.blockName} />
                            </View>
                        </View>
                        <View style={{ backgroundColor: '#E9FCC5', marginTop: 20, borderRadius: 20, elevation: 3 }}>
                            <View style={{ marginTop: 20, marginHorizontal: 15 }}>
                                <>
                                    <Text style={styles.title}>{t('different_identity_number')}</Text>
                                    <View style={{ marginTop: 10, }}>
                                        <InputTextForm label={t('adhar_no')} onChangeText={aadhar_number => { setfarmerData({ ...farmerData, aadhar_number: aadhar_number }) }} keyboardType="numeric" value={farmerData.aadhar_number} />
                                    </View>
                                    <InputTextForm label={t('pan_no')} value={farmerData.pan_number} onChangeText={pan_number => { setfarmerData({ ...farmerData, pan_number: pan_number }) }} />
                                    <InputTextForm label={t('voter_card_no')} value={farmerData.voter_card_number} onChangeText={voter_card_number => { setfarmerData({ ...farmerData, voter_card_number: voter_card_number }) }} />
                                    <InputTextForm label={t('kcc_no')} onChangeText={kcc_number => { setfarmerData({ ...farmerData, kcc_number: kcc_number }) }} value={farmerData.kcc_number} />
                                </>
                            </View>
                        </View>

                        <View style={{ backgroundColor: '#E9FCC5', marginTop: 20, borderRadius: 20, elevation: 3 }}>
                            <View style={{ marginTop: 20, marginHorizontal: 15 }}>
                                <>
                                    <Text style={styles.title}>{t('bank_account_details')}</Text>
                                    <View style={{ marginTop: 10, }}>
                                        <InputTextForm label={t('account_holder_name')} onChangeText={user_bank_account_holder => setfarmerData({ ...farmerData, user_bank_account_holder: user_bank_account_holder })} value={farmerData.user_bank_account_holder} />
                                    </View>
                                    <InputTextForm label={t('farmer_reg_bankifsc')} onChangeText={user_bank_account_name => setfarmerData({ ...farmerData, user_bank_account_name: user_bank_account_name })} value={farmerData.user_bank_account_name} />

                                    <InputTextForm label={t('branch_name')} onChangeText={user_bank_branch_name => setfarmerData({ ...farmerData, user_bank_branch_name: user_bank_branch_name })} value={farmerData.user_bank_branch_name} />

                                    <InputTextForm label={t('bank_account')} onChangeText={user_bank_account_number => setfarmerData({ ...farmerData, user_bank_account_number: user_bank_account_number })} value={farmerData.user_bank_account_number} keyboardType="numeric" />

                                    <InputTextForm label={t('ifsc_no')} onChangeText={user_bank_ifsc_code => setfarmerData({ ...farmerData, user_bank_ifsc_code: user_bank_ifsc_code })} value={farmerData.user_bank_ifsc_code} />
                                </>
                            </View>
                        </View>
                        <View style={{ backgroundColor: '#E9FCC5', marginTop: 20, borderRadius: 20, elevation: 3 }}>
                            <View style={{ marginTop: 20, marginHorizontal: 15 }}>
                                <>
                                    <Text style={styles.title}>{t('pension_details')}</Text>
                                    <View style={{ marginTop: 10, }}>
                                        <InputTextForm label={t('pension_providing_authority')} onChangeText={pension_authority => setfarmerData({ ...farmerData, pension_authority: pension_authority })} value={farmerData.pension_authority} />
                                    </View>

                                    <InputTextForm label={t('pension_account_number')} onChangeText={pension_account_no => setfarmerData({ ...farmerData, pension_account_no: pension_account_no })} value={farmerData.pension_account_no} keyboardType="numeric" />

                                    <View>
                                        <Text style={{ marginBottom: 5, marginLeft: 5, color: '#000' }}>{t('effective_from')}</Text>
                                        <View style={styles.passwordMainContainer}>
                                            <TouchableOpacity style={styles.passwordContainer} onPress={() => setOpen(true)} activeOpacity={.7}>
                                                <Text style={styles.inputTextStyle}>{farmerData.effective_from}</Text>
                                                <TouchableOpacity onPress={() => setOpen(true)}>
                                                    <ImageForm
                                                        source={require('../../Common/images/calendar.png')}
                                                        resizeMode="cover"
                                                        height={30}
                                                        width={30}
                                                    />
                                                </TouchableOpacity>
                                                <DatePicker
                                                    modal
                                                    mode="date"
                                                    open={open}
                                                    date={newdate}
                                                    onConfirm={(item) => {
                                                        handleEffectFrom(item)
                                                        setOpen(false)
                                                    }}
                                                    onCancel={() => {
                                                        setOpen(false)
                                                    }}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <InputTextForm label={t('pension_amount_currency')} onChangeText={pension_amount => setfarmerData({ ...farmerData, pension_amount: pension_amount })} value={farmerData.pension_amount} keyboardType="numeric" />
                                    <DropdownForm label={t('per_month_quarter_year')} data={config.pensionParMonthData} onChange={frequency => setfarmerData({ ...farmerData, frequency: frequency.value })} val={farmerData.frequency} />
                                </>
                            </View>
                        </View>
                        <View style={{ backgroundColor: '#E9FCC5', marginTop: 20, marginBottom: 80, borderRadius: 20, elevation: 3 }}>
                            <View style={{ marginTop: 20, marginHorizontal: 15 }}>
                                <>
                                    <Text style={styles.title}>{t('life_insurance_details')}</Text>
                                    <View style={{ marginTop: 10, }}>
                                        <InputTextForm label={t('lic_name_of_company')} onChangeText={company_name => setfarmerData({ ...farmerData, company_name: company_name })} value={farmerData.company_name} />
                                    </View>
                                    <InputTextForm label={t('policy_number')} onChangeText={policy_no => setfarmerData({ ...farmerData, policy_no: policy_no })} value={farmerData.policy_no} keyboardType="numeric" />
                                    <InputTextForm label={t('sum_insured_currency')} onChangeText={sum_insured => setfarmerData({ ...farmerData, sum_insured: sum_insured })} value={farmerData.sum_insured} keyboardType="numeric" />
                                </>
                            </View>
                        </View>
                        <View style={{ backgroundColor: '#E9FCC5' }}>
                        </View>
                    </View>
                </ScrollView>
                <ButtonForm label={t('submit')} onPress={() => handleUserListUpdate()} />
            </Root>
        </>
    )
}

export default FarmerProfile

const styles = StyleSheet.create({
    passwordMainContainer: {
        flex: 1,
        alignItems: 'center',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        width: '100%',
        paddingEnd: 8,
        backgroundColor: 'white',
        height: 40,
        marginBottom: 15,
    },
    inputTextStyle: {
        marginHorizontal: 10,
        borderColor: 'gray',
        color: "#000"
    },
    title: {
        color: '#454545',
        fontSize: 18,
    }
})
