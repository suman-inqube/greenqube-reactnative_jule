import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import ButtonForm from './Common/ButtonForm'
import { getItem, setItem, removeItem } from '../config/getDataFromStorage';
import { useNavigation } from '@react-navigation/native';
import ProduceInfo from './ProduceInfo';
import axios from 'axios';
import config from '../config';
import MessageDialog from './Common/MessageDialog';
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

        const farmer_details = {
            "userName": storePersnolInfo_data.name,
            "contactNumber": storeSignup_data.phone,
            "lan_id": storePersnolInfo_data.language.value,
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
            "pincode": storePersnolInfo_data.address,
        }

        const identity_details = {
            "aadhar_number": storeFinancial_data.adharCard,
            "kcc_number": "12345",
            "pan_number": storeFinancial_data.panNo,
            "voter_card_number": storeFinancial_data.voterCard
        }

        const bank_details = {
            "user_bank_account_holder": storeFinancial_data.accountHolderName,
            "user_bank_account_number": storeFinancial_data.bankAccountNo,
            "user_bank_account_name": storeFinancial_data.bankName,
            "user_bank_branch_name": storeFinancial_data.branchName,
            "user_bank_ifsc_code": storeFinancial_data.ifciCode,
        }
        const pension_details = {
            "pension_authority": storeFinancial_data.pensionProvidingAuthority,
            "pension_account_no": storeFinancial_data.pensionAccountNo,
            "effective_from": storeFinancial_data.pensionEffectiveFrom,
            "pension_amount": storeFinancial_data.pensionAmount,
            "frequency": storeFinancial_data.pensionPerMonth.value,
        }
        const lic_details = {
            "company_name": storeFinancial_data.nameOfCompany,
            "policy_no": storeFinancial_data.policyNumber,
            "sum_insured": storeFinancial_data.sumInsured,
        }
        const agri_land_user_rels = storeProduceInfo_data.map((item, index) => (
            {
                "plot_no": item.plotSiteName,
                "terrain_type_id": item.terrainType.value,
                "lan_type_id": item.landType.value,
                "soil_type_id": item.soilType.value,
                "land_unit_id": item.landUnit.value,
                "land_size": item.plotSize,
                "land_convert_size": "500",
                "latitude": item.lat,
                "longitude": item.long,
                "daag_no": item.daagNo,
                "khatian_no": item.khatianNo,
                "plant_number": item.noOfPlants,
            }
        ))
        const crop_details = storeProduceInfo_data.map((item, index) => (
            {
                "crop_season_id": item.prodctionSeasion.value,
                "crop_type_id": item.livelihoodType.value,
                "crop_name_id": item.produceName.value,
                "crop_variety_id": item.produceVariety.value,
                "is_primary": 1,
                "production_system": item.productionProcess.value,
                "total_production": "7",
                "have_fertilizer": "Yes",
                "buy_pesticide": "No",
                "sowing_date": item.cycleStarts,
                "harvesting_date": item.cycleEnds,
                "yield_amount": item.expectedProduction,
                "yield_unit": item.produceProductionUnit.value
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
        // const mydata = JSON.stringify(data);
        // console.log(mydata);

    }


    const handleSave = async () => {
        // console.log(saveData);
        const mydata = JSON.stringify(saveData);
        // console.log(mydata);
        const formData = new FormData();
        formData.append('data', mydata);
        formData.append('photo', "");
        try {
            const axiosHeaders = {
                headers: {
                    'information': `localhost,1`,
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
            };
            const database_res = await axios.post("http://142.93.208.31:4003/farmerRoute/selfFarmerLongRegistration", formData, axiosHeaders);
            // console.log(database_res.data.data);
            if(database_res)
            {
                MessageDialog({ title: 'Successful', message: "Successfull SignUp Data" })
                navigation.navigate('Login', { pagename: 'Login' });
            }
        } catch (error) {
            // console.log(error.response.data.error.errorMessage);
            MessageDialog({ title: 'Error', message: error.response.data.error.errorMessage })
            navigation.navigate('Login', { pagename: 'Login' });

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
        console.log(JSON.stringify(storeFinancial_data, null, 2));
    };
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
                                            {storeProduceInfo.map((item, index) => (
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
                                                        <View style={styles.mainContainer} >
                                                            <View style={styles.leftSection}>
                                                                <Text> Cycle Starts </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.cycleEnds}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Cycle Ends </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.cycleEnds}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Daag No </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.daagNo}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Expected Production </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.expectedProduction}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Khatian No </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.khatianNo}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Land Type </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.landType.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Land Unit </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.landUnit.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Lat Long </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.lat}</Text>
                                                                <Text>{item.long}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Live Lihood Type </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.livelihoodType.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> No Of Plants </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.noOfPlants}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Plot Site Name </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.plotSiteName}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Plot Size </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.plotSize}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Prodction Seasion </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.prodctionSeasion.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Produce Name </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.produceName.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Produce Production Unit </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.produceProductionUnit.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Produce Variety </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.produceVariety.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Production Process </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.productionProcess.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Soil Type </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.soilType.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> Terrain Type </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.terrainType.label}</Text>
                                                            </View>
                                                        </View>
                                                    </View>



                                                </View>
                                            ))}
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
