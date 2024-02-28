import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import ButtonForm from './Common/ButtonForm'
import { getItem, setItem, removeItem } from '../config/getDataFromStorage';
import { useNavigation } from '@react-navigation/native';
import ProduceInfo from './ProduceInfo';
import axios from 'axios';
import config from '../config';
import MessageDialog from './Common/MessageDialog';
import { useFocusEffect } from '@react-navigation/native';
import { signupSaveAPI } from '../config/apiHere';
const SignUpViwer = () => {
    const navigation = useNavigation();
    const [isstoreSignup, setisstoreSignup] = useState(false);
    const [isstorePersnolInfo, setisstorePersnolInfo] = useState(false);
    const [isstoreFinancial, setisstoreFinancial] = useState(false);
    const [isstoreProduceInfo, setisstoreProduceInfo] = useState(false);
    const [storeData, setstoreData] = useState([]);

    const [storeSignup, setstoreSignup] = useState({});
    const [storePersnolInfo, setstorePersnolInfo] = useState({});
    const [storeFinancial, setstoreFinancial] = useState({});
    const [storeProduceInfo, setstoreProduceInfo] = useState([]);
    const [saveData, setsaveData] = useState([]);


    const togglestorePersnolInfo = () => {
        setisstorePersnolInfo(!isstorePersnolInfo);
    };

    const togglestoreFinancial = () => {
        setisstoreFinancial(!isstoreFinancial);
    };

    const togglestoreProduceInfo = () => {
        setisstoreProduceInfo(!isstoreProduceInfo);
    };

    const InputDataHere = async (storeSignup_data, storePersnolInfo_data, storeFinancial_data, storeProduceInfo_data) => {

        const gender = storePersnolInfo_data.gender === 'male' ? "1" : "2";
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const yearsToSubtract = storePersnolInfo_data.age;
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1;
        const newYear = currentYear - yearsToSubtract;
        const dob = `${newYear}-${month}-${day}`;

        const userType = storePersnolInfo_data.userType === 'large Grower' ? "1" : storePersnolInfo_data.userType === 'mall holder' ? "2" : "3"
        const lan_id = storePersnolInfo_data.language.value.toString();
        const phone = storeSignup_data.phone.toString();
        // console.log(lan_id);
        const farmer_details = {
            "userName": storePersnolInfo_data.name,
            "contactNumber": phone,
            "lan_id": lan_id,
            "gender": gender,
            "farmer_type": userType,
            "date_of_birth": dob,
            "finance_agriculture_campagin": "No Loan",
            "IMEINumber": "123456",
            "FcmUserToken": "654321",
            "password": storeSignup_data.password,
            "createdBy": storeSignup_data.supervisor.value,
        }

        const agri_user_addresses = {
            "country": storeSignup_data.country.value,
            "company": storeSignup_data.company.value,
            "state": storePersnolInfo_data.stateInfo.value,
            "district": storePersnolInfo_data.district.value,
            "subdivision": storePersnolInfo_data.block.value,
            "address": storePersnolInfo_data.address,
            "pincode": storePersnolInfo_data.zip,
        }

        const identity_details = {
            "kcc_number": "12345"
        }

        if (storeFinancial_data.adharCard) {
            identity_details["aadhar_number"] = storeFinancial_data.adharCard;
        }

        if (storeFinancial_data.panNo) {
            identity_details["pan_number"] = storeFinancial_data.panNo;
        }

        if (storeFinancial_data.adharCard) {
            identity_details["voter_card_number"] = storeFinancial_data.adharCard;
        }

        // const bank_details = {
        //     "user_bank_account_holder": storeFinancial_data.accountHolderName,
        //     "user_bank_account_number": storeFinancial_data.bankAccountNo,
        //     "user_bank_account_name": storeFinancial_data.bankName,
        //     "user_bank_branch_name": storeFinancial_data.branchName,
        //     "user_bank_ifsc_code": storeFinancial_data.ifscCode,
        // }

        // const pension_details = {
        //     "pension_authority": storeFinancial_data.pensionProvidingAuthority,
        //     "pension_account_no": storeFinancial_data.pensionAccountNo,
        //     "effective_from": storeFinancial_data.pensionEffectiveFrom,
        //     "pension_amount": storeFinancial_data.pensionAmount,
        //     "frequency": storeFinancial_data.pensionPerMonth && storeFinancial_data.pensionPerMonth.value,
        // }

        // const lic_details = {
        //     "company_name": storeFinancial_data.nameOfCompany,
        //     "policy_no": storeFinancial_data.policyNumber,
        //     "sum_insured": storeFinancial_data.sumInsured,
        // }
        const bank_details = {};
        const pension_details = {};
        const lic_details = {};

        // Check and conditionally add key-value pairs to bank_details
        if (storeFinancial_data.accountHolderName) {
            bank_details["user_bank_account_holder"] = storeFinancial_data.accountHolderName;
        }

        if (storeFinancial_data.bankAccountNo) {
            bank_details["user_bank_account_number"] = storeFinancial_data.bankAccountNo;
        }

        if (storeFinancial_data.bankName) {
            bank_details["user_bank_account_name"] = storeFinancial_data.bankName;
        }

        if (storeFinancial_data.branchName) {
            bank_details["user_bank_branch_name"] = storeFinancial_data.branchName;
        }

        if (storeFinancial_data.ifscCode) {
            bank_details["user_bank_ifsc_code"] = storeFinancial_data.ifscCode;
        }

        // Check and conditionally add key-value pairs to pension_details
        if (storeFinancial_data.pensionProvidingAuthority) {
            pension_details["pension_authority"] = storeFinancial_data.pensionProvidingAuthority;
        }

        if (storeFinancial_data.pensionAccountNo) {
            pension_details["pension_account_no"] = storeFinancial_data.pensionAccountNo;
        }

        if (storeFinancial_data.pensionEffectiveFrom) {
            pension_details["effective_from"] = storeFinancial_data.pensionEffectiveFrom;
        }

        if (storeFinancial_data.pensionAmount) {
            pension_details["pension_amount"] = storeFinancial_data.pensionAmount;
        }

        if (storeFinancial_data.pensionPerMonth && storeFinancial_data.pensionPerMonth.value) {
            pension_details["frequency"] = storeFinancial_data.pensionPerMonth.value;
        }

        // Check and conditionally add key-value pairs to lic_details
        if (storeFinancial_data.nameOfCompany) {
            lic_details["company_name"] = storeFinancial_data.nameOfCompany;
        }

        if (storeFinancial_data.policyNumber) {
            lic_details["policy_no"] = storeFinancial_data.policyNumber;
        }

        if (storeFinancial_data.sumInsured) {
            lic_details["sum_insured"] = storeFinancial_data.sumInsured;
        }

        const agri_land_user_rels = storeProduceInfo_data.map((item, index) => (
            {
                "plot_no": item.storeProduceInfo.plotSiteName,
                "terrain_type_id": item.storeProduceInfo.terrainType && item.storeProduceInfo.terrainType.value,
                "lan_type_id": item.storeProduceInfo.landType && item.storeProduceInfo.landType.value,
                "soil_type_id": item.storeProduceInfo.soilType && item.storeProduceInfo.soilType.value,
                "land_unit_id": item.storeProduceInfo.landUnit,
                "land_size": item.storeProduceInfo.plotSize,
                "land_convert_size": item.storeProduceInfo.landUnitSize,
                "latitude": item.storeProduceInfo.lat,
                "longitude": item.storeProduceInfo.long,
                "daag_no": item.storeProduceInfo.daagNo,
                "khatian_no": item.storeProduceInfo.khatianNo,
                "plant_number": item.storeProduceInfo.noOfPlants,
            }
        ))

        const crop_details = storeProduceInfo_data.map((item, index) => (
            {
                "crop_season_id": item.storeProduceInfo.prodctionSeasion && item.storeProduceInfo.prodctionSeasion.value,
                "crop_type_id": item.storeProduceInfo.livelihoodType && item.storeProduceInfo.livelihoodType.value,
                "crop_name_id": item.storeProduceInfo.produceName && item.storeProduceInfo.produceName.value,
                "crop_variety_id": item.storeProduceInfo.produceVariety && item.storeProduceInfo.produceVariety.value,
                "is_primary": 1,
                "production_system": item.storeProduceInfo.productionProcess && item.storeProduceInfo.productionProcess.value,
                "total_production": "7",
                "have_fertilizer": "Yes",
                "buy_pesticide": "No",
                "sowing_date": item.storeProduceInfo.cycleStarts,
                "harvesting_date": item.storeProduceInfo.cycleEnds,
                "yield_amount": item.storeProduceInfo.expectedProduction,
                "yield_unit": item.storeProduceInfo.produceProductionUnit && item.storeProduceInfo.produceProductionUnit.value
            }
        ))

        const agri_ponds = []
        const data_farmer_details = {}
        const data = [];
        farmer_details['agri_user_addresses'] = agri_user_addresses;
        farmer_details['identity_details'] = identity_details;
        farmer_details['bank_details'] = bank_details;
        farmer_details['pension_details'] = pension_details;
        farmer_details['lic_details'] = lic_details;
        farmer_details['agri_land_user_rels'] = agri_land_user_rels;
        farmer_details['crop_details'] = crop_details;
        farmer_details['agri_ponds'] = agri_ponds;
        farmer_details['agri_ponds'] = agri_ponds;
        data_farmer_details['farmer_details'] = farmer_details;
        data.push(data_farmer_details);

        setsaveData(data);
        // return console.log(JSON.stringify(data));
        // console.log(mydata);

    }


    const handleSave = async () => {

   
        // return console.log(JSON.stringify(saveData, null, 2));
        const formData = new FormData();
        formData.append('data', JSON.stringify(saveData));
        formData.append('photo', "");

        const database_res = await signupSaveAPI(formData);


        if (database_res) {
            MessageDialog({ title: 'Successful', message: "Successfull SignUp Data" })
            navigation.navigate('Login');
        }

    }


    const onPageLoad = async () => {
        const storeSignup_data = await getItem('storeSignup_data');
        const storePersnolInfo_data = await getItem('storePersnolInfo_data');
        const storeFinancial_data = await getItem('storeFinancial_data');
        const storeProduceInfo_data = await getItem('storeProduceInfo_data');

        setstoreSignup(storeSignup_data);
        setstorePersnolInfo(storePersnolInfo_data);
        setstoreFinancial(storeFinancial_data);
        setstoreProduceInfo(storeProduceInfo_data);
        InputDataHere(storeSignup_data, storePersnolInfo_data, storeFinancial_data, storeProduceInfo_data);
        // console.log(JSON.stringify(storeSignup_data, null, 2));
        // console.log(JSON.stringify(storePersnolInfo_data, null, 2));
        // console.log(JSON.stringify(storeFinancial_data, null, 2));
        // console.log(JSON.stringify(storeProduceInfo_data[0], null, 2));

        // return


    };

    useFocusEffect(
        React.useCallback(() => {
            onPageLoad();
        }, [])
    );

    useEffect(() => {
        onPageLoad();

    }, []);
    return (
        <>
            <ScrollView>
                <View style={{ padding: 10, }}>
                    <TouchableOpacity onPress={togglestorePersnolInfo}>
                        <View style={styles.headerStyle}>
                            <Text>
                                {isstorePersnolInfo ? 'Persnol Inormation' : 'Persnol Inormation'}
                            </Text>

                            {isstorePersnolInfo ? <Image source={require('./Common/images/sub.png')} style={{ width: 20, height: 20 }} />
                                :
                                <Image source={require('./Common/images/add.png')} style={{ width: 20, height: 20 }} />
                            }

                        </View>

                    </TouchableOpacity>
                    {isstorePersnolInfo && (
                        <>
                            {
                                storePersnolInfo ?
                                    storePersnolInfo.block ?
                                        <View style={{ margin: 10, }}>
                                            <View style={styles.bodyContainer}>
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    <TouchableOpacity onPress={() => navigation.navigate('PersnolUpdate', { pagename: 'SignUpViwer' })}>
                                                        <Image source={require('./Common/images/edit.png')} style={{ width: 30, height: 30 }} />
                                                    </TouchableOpacity>
                                                </View>

                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> Name </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storePersnolInfo.name}</Text>
                                                    </View>
                                                </View>

                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> Phone </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeSignup.phone}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> Age </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storePersnolInfo.age}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> Language </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storePersnolInfo.language.label}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> State </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storePersnolInfo.stateInfo.label}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> district </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storePersnolInfo.district.label}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> Block/Subdivision </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storePersnolInfo ? storePersnolInfo.block.label : ''}</Text>
                                                    </View>
                                                </View>

                                            </View>
                                        </View>
                                        : ""
                                    :
                                    ""
                            }

                        </>
                    )}
                </View>


                <View style={{ padding: 10, }}>
                    <TouchableOpacity onPress={togglestoreFinancial}>
                        <View style={styles.headerStyle}>
                            <Text>
                                {isstoreFinancial ? 'Financial Inormation' : 'Financial Inormation'}
                            </Text>

                            {isstoreFinancial ? <Image source={require('./Common/images/sub.png')} style={{ width: 20, height: 20 }} />
                                :
                                <Image source={require('./Common/images/add.png')} style={{ width: 20, height: 20 }} />
                            }

                        </View>

                    </TouchableOpacity>
                    {isstoreFinancial && (
                        <>
                            {

                                storeFinancial ?
                                    <View style={{ margin: 10, }}>
                                        <View style={styles.bodyContainer}>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <TouchableOpacity onPress={() => navigation.navigate('FinancialUpdate', {
                                                    pagename: "SignUpViwer"
                                                })}>
                                                    <Image source={require('./Common/images/edit.png')} style={{ width: 30, height: 30 }} />
                                                </TouchableOpacity>
                                            </View>

                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Account Holder Name </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.accountHolderName}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Adhar Card </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.adharCard}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Bank Account No </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.bankAccountNo}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Bank Name </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.bankName}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Farmar Loan No </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.farmarLoanNo}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Branch Name </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.branchName}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Ifsc Code </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.ifscCode}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Name Of Company </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.ifscCode}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Pan No </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.panNo}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Pension Account No </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.pensionAccountNo}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Pension Amount </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.pensionAmount}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Pension Effective From </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.pensionEffectiveFrom}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Pension Per Month </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.pensionPerMonth.label}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Pension Providing Authority </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.pensionProvidingAuthority}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Policy Number </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.policyNumber}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Sum Insured </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.sumInsured}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.mainContainer}>
                                                <View style={styles.leftSection}>
                                                    <Text> Voter Card </Text>
                                                </View>
                                                <View style={styles.rightSection}>
                                                    <Text>{storeFinancial.voterCard}</Text>
                                                </View>
                                            </View>



                                        </View>
                                    </View>
                                    : ""

                            }

                        </>
                    )}
                </View>


                <View style={{ padding: 10, }}>
                    <TouchableOpacity onPress={togglestoreProduceInfo}>
                        <View style={styles.headerStyle}>
                            <Text>
                                {isstoreProduceInfo ? 'Produce Inormation' : 'Produce Inormation'}
                            </Text>

                            {isstoreProduceInfo ? <Image source={require('./Common/images/sub.png')} style={{ width: 20, height: 20 }} />
                                :
                                <Image source={require('./Common/images/add.png')} style={{ width: 20, height: 20, resizeMode: 'cover' }} />
                            }

                        </View>

                    </TouchableOpacity>
                    {isstoreProduceInfo && (
                        <>
                            {

                                storeProduceInfo ?
                                    <View style={{ marginTop: 10, marginBottom: 10, }}>
                                        {storeProduceInfo.map((item, index) => (

                                            item.storeProduceInfo ?
                                                <View style={styles.bodyContainer} key={index}>
                                                    <View style={{ alignItems: 'flex-end' }} >
                                                        <TouchableOpacity onPress={() => navigation.navigate('ProduceInfoUpdate', {
                                                            pagename: "SignUpViwer",
                                                            arrayIndex: index
                                                        })}>
                                                            <Image source={require('./Common/images/edit.png')} style={{ width: 30, height: 30 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View >

                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Plot Site Name </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.plotSiteName}</Text>
                                                            </View>
                                                        </View>
                                                        
                                                        {/* <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Daag No </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.daagNo}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Expected Production </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.expectedProduction}</Text>
                                                            </View>
                                                        </View> */}
                                                        {/* <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Khatian No </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.khatianNo}</Text>
                                                            </View>
                                                        </View> */}
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Land Type </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.landType && item.storeProduceInfo && item.storeProduceInfo.landType.label}</Text>
                                                            </View>
                                                        </View>

                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Plot Size </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.plotSize}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Land Unit </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.landUnitName && item.storeProduceInfo && item.storeProduceInfo.landUnitName}</Text>
                                                            </View>
                                                        </View>
                                                        {/* <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Lat Long </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.lat}</Text>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.long}</Text>
                                                            </View>
                                                        </View> */}
                                                        {/* <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Live Lihood Type </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.livelihoodType && item.storeProduceInfo && item.storeProduceInfo.livelihoodType.label}</Text>
                                                            </View>
                                                        </View> */}
                                                        {/* <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> No Of Plants </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.noOfPlants}</Text>
                                                            </View>
                                                        </View> */}
                                                        
                                                        
                                                        {/* <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Prodction Seasion </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.prodctionSeasion && item.storeProduceInfo.prodctionSeasion.label}</Text>
                                                            </View>
                                                        </View> */}
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Produce Name </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.produceName && item.storeProduceInfo && item.storeProduceInfo.produceName.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Produce Variety </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.produceVariety && item.storeProduceInfo && item.storeProduceInfo.produceVariety.label}</Text>
                                                            </View>
                                                        </View>
                                                        {/* <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Produce Production Unit </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.produceProductionUnit && item.storeProduceInfo && item.storeProduceInfo.produceProductionUnit.label}</Text>
                                                            </View>
                                                        </View> */}
                                                        
                                                        {/* <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Production Process </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.productionProcess && item.storeProduceInfo && item.storeProduceInfo.productionProcess.label}</Text>
                                                            </View>
                                                        </View> */}
                                                        {/* <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Soil Type </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.soilType && item.storeProduceInfo && item.storeProduceInfo.soilType.label}</Text>
                                                            </View>
                                                        </View> */}
                                                        {/* <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Terrain Type </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.terrainType && item.storeProduceInfo && item.storeProduceInfo.terrainType.label}</Text>
                                                            </View>
                                                        </View> */}

                                                        <View style={styles.mainContainer} >
                                                            <View style={styles.leftSection}>
                                                                <Text> Cycle Starts </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.cycleStarts}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Cycle Ends </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.storeProduceInfo && item.storeProduceInfo.cycleEnds}</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                                : ''
                                        ))}
                                    </View>
                                    : ""

                            }

                        </>
                    )}
                </View>

            </ScrollView>
            <View style={{ marginTop: 10, backgroundColor: '#D5FFD0' }}>
                <ButtonForm label='Save' onPress={handleSave} />
            </View>

        </>
    )
}

export default SignUpViwer

const styles = StyleSheet.create({
    headerStyle: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        borderColor: 'gray',
        borderWidth: 0.5,
        padding: 5,
        backgroundColor: 'white',
    },
    bodyContainer: {
        backgroundColor: '#DAC0A3',
        padding: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'black',
    },

    viewText: {
        marginTop: 15,
    },
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
        marginBottom: 15,// Display children in a row horizontally
    },
    leftSection: {
        flex: 1, // Take 50% of the available horizontal space
    },
    rightSection: {
        flex: 1, // Take 50% of the available horizontal space
    },
})
