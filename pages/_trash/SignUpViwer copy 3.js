import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import ButtonForm from './Common/ButtonForm'
import { getItem, setItem, removeItem } from '../config/getDataFromStorage';
import { useNavigation } from '@react-navigation/native';
import ProduceInfo from './ProduceInfo';
const SignUpViwer = () => {
    const navigation = useNavigation();
    const [isstoreSignup, setisstoreSignup] = useState(false);
    const [isstorePersnolInfo, setisstorePersnolInfo] = useState(false);
    const [isstoreFinancial, setisstoreFinancial] = useState(false);
    const [isstoreProduceInfo, setisstoreProduceInfo] = useState(false);

    const [storeSignup, setstoreSignup] = useState({});
    const [storePersnolInfo, setstorePersnolInfo] = useState({});
    const [storeFinancial, setstoreFinancial] = useState({});
    const [storeProduceInfo, setstoreProduceInfo] = useState({});
    const togglestoreSignup = () => {
        setisstoreSignup(!isstoreSignup);
    };
    const togglestorePersnolInfo = () => {
        setisstorePersnolInfo(!isstorePersnolInfo);
    };
    const togglestoreFinancial = () => {
        setisstoreFinancial(!isstoreFinancial);
    };
    const togglestoreProduceInfo = () => {
        setisstoreProduceInfo(!isstoreProduceInfo);
    };

    const handleSave = async () => {
        // console.log(storeSignup.password);
        const gender = storePersnolInfo.gender === 'male' ? "1" : "2";
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const yearsToSubtract = storePersnolInfo.age;
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1;
        const newYear = currentYear - yearsToSubtract;
        const dob = `${newYear}-${month}-${day}`;
        // console.log(newYear);
        const data =
        {

            "farmer_details": {
                "userName": storePersnolInfo.name,
                "contactNumber": storeSignup.phone,
                "lan_id": storePersnolInfo.language.value,
                "gender": gender,
                "farmer_type": "3",
                "date_of_birth": dob,
                "finance_agriculture_campagin": "No Loan",
                "IMEINumber": "123456",
                "FcmUserToken": "654321",
                "password": storeSignup.password,
                "createdBy": "c8e666ba-5046-48ba-8561-27c3c22be0cc",
                "agri_user_addresses": {
                    "country": storeSignup.country.value,
                    "company": storeSignup.company.value,
                    "state": storePersnolInfo.stateInfo.value,
                    "district": storePersnolInfo.district.value,
                    "subdivision": storePersnolInfo.block.value,
                    "address": storePersnolInfo.address,
                    "pincode": storePersnolInfo.address,
                },
                "identity_details": {
                    "aadhar_number": storeFinancial.adharCard,
                    "kcc_number": "12345",
                    "pan_number": storeFinancial.panNo,
                    "voter_card_number": storeFinancial.voterCard
                },

                "bank_details": {
                    "user_bank_account_holder": storeFinancial.accountHolderName,
                    "user_bank_account_number": storeFinancial.bankAccountNo,
                    "user_bank_account_name": storeFinancial.bankName,
                    "user_bank_branch_name": storeFinancial.branchName,
                    "user_bank_ifsc_code": storeFinancial.ifciCode,
                },
                "pension_details": {
                    "pension_authority": storeFinancial.pensionProvidingAuthority,
                    "pension_account_no": storeFinancial.pensionAccountNo,
                    "effective_from": storeFinancial.pensionEffectiveFrom,
                    "pension_amount": storeFinancial.pensionAmount,
                    "frequency": storeFinancial.pensionPerMonth.value,
                },
                "lic_details": {
                    "company_name": storeFinancial.nameOfCompany,
                    "policy_no": storeFinancial.policyNumber,
                    "sum_insured": storeFinancial.sumInsured,
                },
                "agri_land_user_rels": [
                    {
                        "plot_no": storeProduceInfo.plotSize,
                        "terrain_type_id": storeProduceInfo.terrainType.value,
                        "lan_type_id": storeProduceInfo.landType.value,
                        "soil_type_id": storeProduceInfo.soilType.value,
                        "land_unit_id": storeProduceInfo.landUnit.value,
                        "land_size": storeProduceInfo.plotSize.value,
                        "land_convert_size": storeProduceInfo.expectedProduction,
                        "latitude": storeProduceInfo.lat,
                        "longitude": storeProduceInfo.long,
                        "daag_no": storeProduceInfo.daagNo,
                        "khatian_no": storeProduceInfo.khatianNo,
                        "plant_number": storeProduceInfo.noOfPlants,
                    },
                ],
                "crop_details": [
                    {
                        "crop_season_id": storeProduceInfo.plotSize.value,
                        "crop_type_id": storeProduceInfo.plotSize.value,
                        "crop_name_id": storeProduceInfo.plotSize.value,
                        "crop_variety_id": storeProduceInfo.plotSize.value,
                        "is_primary": 1,
                        "production_system": "884cbaf0-87f5-11ec-9d08-3d8c35c8c07b",
                        "total_production": "",
                        "have_fertilizer": "Yes",
                        "buy_pesticide": "No",
                        "sowing_date": "2023-08-30",
                        "harvesting_date": "2023-10-31",
                        "yield_amount": "55",
                        "yield_unit": "1e4b90c6-087d-4cd9-8453-738c088a2c5c"
                    },
                ],
                "agri_ponds": [

                ]

            }
        }


        console.log(data);

        // console.log(data1);
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
        // console.log(storeSignup_data);
        // console.log(storePersnolInfo_data);
        // console.log(storeFinancial_data);
        // console.log(storeProduceInfo_data);
    };
    const userData = {
        username: 'exampleUser',
        email: 'user@example.com',
    };
    useEffect(() => {
        onPageLoad();
        // const data =
        // {
        //     farmer_details: {
        //         userName: "name sam",
        //         contactNumber: "6011023232",
        //         bank_details: {
        //             country: "storeSignup.country.value",
        //             company: "storeSignup.company.value"
        //         },
        //     },
        //     agri_user_addresses: {
        //         country: "storeSignup.country.value",
        //         company: "storeSignup.company.value"
        //     },

        // }

        // console.log(data);
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
                            <Text style={{ marginTop: 5 }}>
                                {isstorePersnolInfo ? <Image source={require('./Common/images/sub.png')} style={{ width: 20, height: 20 }} />
                                    :
                                    <Image source={require('./Common/images/add.png')} style={{ width: 20, height: 20 }} />
                                }
                            </Text>
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
                                                    <TouchableOpacity onPress={() => navigation.navigate('Persnol', { pagename: 'SignUpViwer' })}>
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


                {/* <View style={{ padding: 10, }}>
                    <TouchableOpacity onPress={togglestorePersnolInfo}>
                        <View style={styles.headerStyle}>
                            <Text>
                                {isstorePersnolInfo ? 'Persnol Inormation' : 'Persnol Inormation'}
                            </Text>
                            <Text style={{ marginTop: 5 }}>
                                {isstorePersnolInfo ? <Image source={require('./Common/images/sub.png')} style={{ width: 20, height: 20 }} />
                                    :
                                    <Image source={require('./Common/images/add.png')} style={{ width: 20, height: 20 }} />
                                }
                            </Text>
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
                                                    <TouchableOpacity onPress={() => navigation.navigate('Persnol', {
                                                        pagename: "SignUpViwer"
                                                    })}>
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
                </View> */}


                <View style={{ padding: 10, }}>
                    <TouchableOpacity onPress={togglestoreFinancial}>
                        <View style={styles.headerStyle}>
                            <Text>
                                {isstoreFinancial ? 'Financial Inormation' : 'Financial Inormation'}
                            </Text>
                            <Text style={{ marginTop: 5 }}>
                                {isstoreFinancial ? <Image source={require('./Common/images/sub.png')} style={{ width: 20, height: 20 }} />
                                    :
                                    <Image source={require('./Common/images/add.png')} style={{ width: 20, height: 20 }} />
                                }
                            </Text>
                        </View>

                    </TouchableOpacity>
                    {isstoreFinancial && (
                        <>
                            {
                                storeFinancial ?
                                    storeFinancial ?
                                        <View style={{ margin: 10, }}>
                                            <View style={styles.bodyContainer}>
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    <TouchableOpacity onPress={() => navigation.navigate('Financial', {
                                                        pagename: "SignUpViwer"
                                                    })}>
                                                        <Image source={require('./Common/images/edit.png')} style={{ width: 30, height: 30 }} />
                                                    </TouchableOpacity>
                                                </View>

                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> accountHolderName </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.accountHolderName}</Text>
                                                    </View>
                                                </View>

                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> adharCard </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeSignup.adharCard}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> bankAccountNo </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.bankAccountNo}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> bankName </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.bankName}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> farmarLoanNo </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.farmarLoanNo}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> branchName </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.branchName}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> ifscCode </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.ifscCode}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> nameOfCompany </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.ifscCode}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> panNo </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.panNo}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> pensionAccountNo </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.pensionAccountNo}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> pensionAmount </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.pensionAmount}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> pensionEffectiveFrom </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.pensionEffectiveFrom}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> pensionPerMonth </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.pensionPerMonth.label}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> pensionProvidingAuthority </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.pensionProvidingAuthority}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> policyNumber </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.policyNumber}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> sumInsured </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.sumInsured}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> voterCard </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeFinancial.voterCard}</Text>
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
                    <TouchableOpacity onPress={togglestoreProduceInfo}>
                        <View style={styles.headerStyle}>
                            <Text>
                                {isstoreProduceInfo ? 'Produce Inormation' : 'Produce Inormation'}
                            </Text>
                            <Text style={{ marginTop: 5 }}>
                                {isstoreProduceInfo ? <Image source={require('./Common/images/sub.png')} style={{ width: 20, height: 20 }} />
                                    :
                                    <Image source={require('./Common/images/add.png')} style={{ width: 20, height: 20 }} />
                                }
                            </Text>
                        </View>

                    </TouchableOpacity>
                    {isstoreProduceInfo && (
                        <>
                            {
                                storeProduceInfo ?
                                    storeProduceInfo ?
                                        <View style={{ margin: 10, }}>
                                            <View style={styles.bodyContainer}>
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    <TouchableOpacity onPress={() => navigation.navigate('ProduceInfo', {
                                                        pagename: "SignUpViwer"
                                                    })}>
                                                        <Image source={require('./Common/images/edit.png')} style={{ width: 30, height: 30 }} />
                                                    </TouchableOpacity>
                                                </View>

                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> cycleStarts </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.cycleStarts}</Text>
                                                    </View>
                                                </View>

                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> cycleEnds </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.cycleEnds}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> daagNo </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.daagNo}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> expectedProduction </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.expectedProduction}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> khatianNo </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.khatianNo}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> landType </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.landType.label}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> landUnit </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.landUnit.label}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> lat long </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.lat}</Text>
                                                        <Text>{storeProduceInfo.long}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> livelihoodType </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.livelihoodType.label}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> noOfPlants </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.noOfPlants}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> plotSiteName </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.plotSiteName}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> plotSize </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.plotSize}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> prodctionSeasion </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.prodctionSeasion.label}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> produceName </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.produceName.label}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> produceProductionUnit </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.produceProductionUnit.label}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> produceVariety </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.produceVariety.label}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> productionProcess </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.productionProcess.label}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> soilType </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.soilType.label}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mainContainer}>
                                                    <View style={styles.leftSection}>
                                                        <Text> terrainType </Text>
                                                    </View>
                                                    <View style={styles.rightSection}>
                                                        <Text>{storeProduceInfo.terrainType.label}</Text>
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

            </ScrollView>
            <View style={{ marginTop: 10, backgroundColor: '#D5FFD0' }}>
                <ButtonForm label='Submit' onPress={handleSave} />
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
