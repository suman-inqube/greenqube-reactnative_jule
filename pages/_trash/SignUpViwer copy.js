import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import ButtonForm from './Common/ButtonForm'
import { getItem, setItem, removeItem } from '../config/getDataFromStorage';
import { useNavigation } from '@react-navigation/native';
import ProduceInfo from './ProduceInfo';
import axios from 'axios';
import config from '../config';
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
        const gender = storePersnolInfo.gender === 'male' ? "1" : "2";
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const yearsToSubtract = storePersnolInfo.age;
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1;
        const newYear = currentYear - yearsToSubtract;
        const dob = `${newYear}-${month}-${day}`;

        const userType = storePersnolInfo.userType === 'large Grower' ? "1" : storePersnolInfo.userType === 'mall holder' ? "2" : "3"

        const farmer_details = {
            "userName": storePersnolInfo.name,
            "contactNumber": storeSignup.phone,
            "lan_id": storePersnolInfo.language.value,
            "gender": gender,
            "farmer_type": userType,
            "date_of_birth": dob,
            "finance_agriculture_campagin": "No Loan",
            "IMEINumber": "123456",
            "FcmUserToken": "654321",
            "password": storeSignup.password,
            "createdBy": storeSignup.supervisor.value,
        }

        const agri_user_addresses = {
            "country": storeSignup.country.value,
            "company": storeSignup.company.value,
            "state": storePersnolInfo.stateInfo.value,
            "district": storePersnolInfo.district.value,
            "subdivision": storePersnolInfo.block.value,
            "address": storePersnolInfo.address,
            "pincode": storePersnolInfo.address,
        }

        const identity_details = {
            "aadhar_number": storeFinancial.adharCard,
            "kcc_number": "12345",
            "pan_number": storeFinancial.panNo,
            "voter_card_number": storeFinancial.voterCard
        }

        const bank_details = {
            "user_bank_account_holder": storeFinancial.accountHolderName,
            "user_bank_account_number": storeFinancial.bankAccountNo,
            "user_bank_account_name": storeFinancial.bankName,
            "user_bank_branch_name": storeFinancial.branchName,
            "user_bank_ifsc_code": storeFinancial.ifciCode,
        }
        const pension_details = {
            "pension_authority": storeFinancial.pensionProvidingAuthority,
            "pension_account_no": storeFinancial.pensionAccountNo,
            "effective_from": storeFinancial.pensionEffectiveFrom,
            "pension_amount": storeFinancial.pensionAmount,
            "frequency": storeFinancial.pensionPerMonth.value,
        }
        const lic_details = {
            "company_name": storeFinancial.nameOfCompany,
            "policy_no": storeFinancial.policyNumber,
            "sum_insured": storeFinancial.sumInsured,
        }
        const agri_land_user_rels = storeProduceInfo.map((item, index) => (
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
        const crop_details = storeProduceInfo.map((item, index) => (
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
        farmer_details['agri_user_addresses'] = agri_user_addresses;
        farmer_details['identity_details'] = identity_details;
        farmer_details['bank_details'] = bank_details;
        farmer_details['pension_details'] = pension_details;
        farmer_details['lic_details'] = lic_details;
        farmer_details['agri_land_user_rels'] = agri_land_user_rels;
        farmer_details['crop_details'] = crop_details;
        farmer_details['agri_ponds'] = agri_ponds;
        farmer_details['agri_ponds'] = agri_ponds;

        try {
            const axiosHeaders = {
                headers: {
                    'information': `localhost,1`,
                    'Accept': 'application/json'
                },
            };
            const database_res = await axios.post("http://142.93.208.31:4003/farmerRoute/selfFarmerLongRegistration", farmer_details, axiosHeaders);
            // console.log(database_res.data);
            // const loginUserdata = database_res.data;
        } catch (error) {
            console.log(error.response);
        }


    }

    const handlesave1 = () => {

        console.log(storeData);
    };
    const onPageLoad = async () => {
        const storeSignup_data = await getItem('storeSignup_data');
        const storePersnolInfo_data = await getItem('storePersnolInfo_data');
        const storeFinancial_data = await getItem('storeFinancial_data');
        const storeProduceInfo_data = await getItem('storeProduceInfo_data');
        setstoreSignup(storeSignup_data);
        setstorePersnolInfo(storePersnolInfo_data);
        setstoreFinancial(storeFinancial_data);
        setstoreProduceInfo(storeProduceInfo_data);
        // console.log(storeProduceInfo_data);
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
                                            {storeProduceInfo.map((item, index) => (
                                                <View style={styles.bodyContainer} key={index}>
                                                    <View style={{ alignItems: 'flex-end' }} >
                                                        <TouchableOpacity onPress={() => navigation.navigate('ProduceInfo', {
                                                            pagename: "SignUpViwer",
                                                            arrayIndex: index
                                                        })}>
                                                            <Image source={require('./Common/images/edit.png')} style={{ width: 30, height: 30 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View >
                                                        <View style={styles.mainContainer} >
                                                            <View style={styles.leftSection}>
                                                                <Text> cycleStarts </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.cycleEnds}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> cycleEnds </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.cycleEnds}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> daagNo </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.daagNo}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> expectedProduction </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.expectedProduction}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> khatianNo </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.khatianNo}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> landType </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.landType.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> landUnit </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.landUnit.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> lat long </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.lat}</Text>
                                                                <Text>{item.long}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> livelihoodType </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.livelihoodType.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> noOfPlants </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.noOfPlants}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> plotSiteName </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.plotSiteName}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> plotSize </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.plotSize}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> prodctionSeasion </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.prodctionSeasion.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> produceName </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.produceName.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> produceProductionUnit </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.produceProductionUnit.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> produceVariety </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.produceVariety.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> productionProcess </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.productionProcess.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> soilType </Text>
                                                            </View>
                                                            <View style={styles.rightSection}>
                                                                <Text>{item.soilType.label}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mainContainer}>
                                                            <View style={styles.leftSection}>
                                                                <Text> terrainType </Text>
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
