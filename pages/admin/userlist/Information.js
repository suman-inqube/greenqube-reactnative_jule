import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import ButtonForm from '../../Common/ButtonForm'
import InputTextForm from '../../Common/InputTextForm'
import DropdownForm from '../../Common/DropdownForm'
import RadioForm from '../../Common/RadioForm'
import ImageForm from '../../Common/ImageForm'
import ImagePlaceHolderCircle from '../../Common/ImagePlaceHolderCircle'
import { getItem } from '../../../config/getDataFromStorage'
import { fetchBlockAPI, fetchDistrictAPI, fetchStateAPI } from '../../../config/apiHere'
import { launchImageLibrary } from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker'
import config from '../../../config'

const Information = ({ sendDataToParent, farmerID }) => {
    const [newdate, setnewDate] = useState(new Date())
    const [open, setOpen] = useState(false)
    const [dbName, setdbName] = useState();
    const [languageID, setlanguageID] = useState();
    const [stateAll, setstateAll] = useState([]);
    const [districtAll, setdistrictAll] = useState([]);
    const [blockAll, setblockAll] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [farmerData, setfarmerData] = useState({});


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
    }

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
        if (response.data) {
            // console.warn(response.data.data);
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
        // console.warn(response.data.data);
        const dataArray = [];
        response.data.data.rows.forEach(element => {
            dataArray.push({
                value: element.fid,
                label: element.subdiv_name,
            });
        });
        setblockAll(dataArray);
    }

    const handleStateDistrictBlock = (moduleName, data) => {
        if (moduleName === 'state') {
            const stateID = data.value;
            getDistrict(dbName, languageID, stateID);
        }
        else if (moduleName === 'district') {
            const districtID = data.value;
            getBlock(dbName, languageID, districtID)
            // console.warn(data.value);
        }
    }

    const handleEffectFrom = async (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        // console.log(x1[2] + '/' + x1[1] + '/' + x1[0]);
        const cycleEnds = x1[0] + '-' + x1[1] + '-' + x1[2];
        setfarmerData({ ...farmerData, effective_from: effective_from })
    }
    const handleUserListUpdate = async () => {
      console.log(JSON.stringify(farmerData,null,2));
    }

    const onPageLoad = async () => {
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const userID = loginUser_data.user_id;
            const compCode = loginUser_data.sa_company[0].company_code;
            setdbName(dbName)
            setlanguageID(languageID)
            getState(dbName, languageID)

            const userListData = await getItem('userListData');
            if (userListData) {
                const farmerArray = userListData.rows
                const farmerFound = farmerArray.find(user => user.user_id === 'bac1b395-3468-4c94-97f6-6f4e14c3efdd');

                if (farmerFound) {
                    const dob = new Date(farmerFound.date_of_birth);
                    const currentDate = new Date();
                    const yearsDiff = currentDate.getFullYear() - dob.getFullYear();
                    if (farmerFound.agri_user_addresses[0].agri_district)
                    {
                        getDistrict(dbName, languageID, farmerFound.agri_user_addresses[0].agri_state.fid)
                    }

                    if (farmerFound.agri_user_addresses[0].agri_subdivision)
                    {
                        getBlock(dbName, languageID, farmerFound.agri_user_addresses[0].agri_district.fid)
                    }

                    setfarmerData({
                        userName: farmerFound.userName,
                        contactNumber: farmerFound.contactNumber,
                        gender: farmerFound.gender,
                        farmer_type: farmerFound.farmer_type,
                        age: yearsDiff.toString(),
                        state: farmerFound.agri_user_addresses[0].agri_state.fid,
                        district: farmerFound.agri_user_addresses[0].agri_district.fid,
                        block: farmerFound.agri_user_addresses[0].agri_subdivision.fid,
                        aadhar_number: farmerFound.aadhar_number,
                        pan_number: farmerFound.pan_number,
                        voter_card_number: farmerFound.voter_card_number,
                        kcc_number: farmerFound.kcc_number,
                        user_bank_account_holder: farmerFound.user_bank_account_holder,
                        user_bank_account_name: farmerFound.user_bank_account_name,
                        user_bank_branch_name: farmerFound.user_bank_branch_name,
                        user_bank_account_number: farmerFound.user_bank_account_number,
                        user_bank_ifsc_code: farmerFound.user_bank_ifsc_code,
                        pension_authority: farmerFound.pension_details.pension_authority,
                        pension_account_no: farmerFound.pension_details.pension_account_no,
                        effective_from: farmerFound.pension_details.effective_from,
                        pension_amount: farmerFound.pension_details.pension_amount,
                        frequency: farmerFound.pension_details.frequency,
                        company_name: farmerFound.lic_details.company_name,
                        policy_no: farmerFound.lic_details.policy_no,
                        sum_insured: farmerFound.lic_details.sum_insured
                    })
                }

            }
        }


    };
    const sendDataToParentOnClick = () => {
        sendDataToParent(null);
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    return (
        <>
            <View>
                <TouchableOpacity onPress={sendDataToParentOnClick}>
                    <Text style={{ padding: 5, backgroundColor: '#79AC78', width: 50, textAlign: 'center', color: 'white' }}>Back</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={{ backgroundColor: '' }}>
                <View style={{ marginBottom: 50 }}>
                    {
                        farmerData.userName ?
                            <>
                                <View style={{ backgroundColor: '#D5FFD0', marginTop: 20 }}>
                                    <View style={{ marginTop: 20, marginHorizontal: 15 }}>
                                        <View style={{ alignItems: 'center' }}>
                                            <ImagePlaceHolderCircle openImagePicker={openImagePicker} selectedImage={selectedImage} />
                                        </View>
                                        <InputTextForm label="Name" value={farmerData.userName ?? userName} onChangeText={userName => { setfarmerData({ ...farmerData, userName: userName }) }} />

                                        <InputTextForm label="contactNumber" color="red" value={farmerData.contactNumber ?? farmerData.contactNumber} onChangeText={contactNumber => { setfarmerData({ ...farmerData, contactNumber: contactNumber }) }} />

                                        <View>
                                            <Text style={{ fontSize: 16 }}>Gender</Text>
                                            <RadioForm
                                                label="Male"
                                                selected={farmerData.gender === "1"}
                                                onSelect={() => setfarmerData({ ...farmerData, gender: "1" })}
                                            />
                                            <RadioForm
                                                label="female"
                                                selected={farmerData.gender === '2'}
                                                onSelect={() => setfarmerData({ ...farmerData, gender: '2' })}
                                            />
                                        </View>

                                        <View style={{ marginBottom: 15, }}>
                                            <Text style={{ fontSize: 16, marginTop: 15, }}>User Type</Text>
                                            <RadioForm
                                                label="large Grower"
                                                selected={farmerData.farmer_type === '1'}
                                                onSelect={() => setfarmerData({ ...farmerData, farmerType: '1' })}

                                            />
                                            <RadioForm
                                                label="Small Holder"
                                                selected={farmerData.farmer_type === '2'}
                                                onSelect={() => setfarmerData({ ...farmerData, farmerType: '2' })}

                                            />
                                            <RadioForm
                                                label="na"
                                                selected={farmerData.farmer_type === '3'}
                                                onSelect={() => setfarmerData({ ...farmerData, farmerType: '3' })}

                                            />
                                        </View>

                                        <InputTextForm label="Age" value={farmerData.age ?? farmerData.age} keyboardType="numeric" />

                                        <DropdownForm label="State/Division/Zone" data={stateAll} onChange={data => { handleStateDistrictBlock("state", data) }} val={farmerData.state} />

                                        <DropdownForm label="District/Country" data={districtAll} onChange={data => { handleStateDistrictBlock("district", data) }} val={farmerData.district} />

                                        <DropdownForm label="Block/Sub Country/UpZila" data={blockAll} onChange={item => { setfarmerData({ ...farmerData, block: item }) }} val={farmerData.block} />

                                    </View>
                                </View>

                                <View style={{ backgroundColor: '#D5FFD0', marginTop: 20 }}>
                                    <View style={{ marginTop: 20, marginHorizontal: 15 }}>
                                        <>
                                            <View style={{ marginTop: 10, }}>
                                                <InputTextForm label="National Identity No. (Aadhaar)" onChangeText={aadhar_number => { setfarmerData({ ...farmerData, aadhar_number: aadhar_number }) }} keyboardType="numeric" value={farmerData.aadhar_number} />
                                            </View>

                                            <InputTextForm label="Income Tax No. (PAN)" value={farmerData.pan_number} onChangeText={pan_number => { setfarmerData({ ...farmerData, pan_number: pan_number }) }} />

                                            <InputTextForm label="Voter Card No." value={farmerData.voter_card_number} onChangeText={voter_card_number => { setfarmerData({ ...farmerData, voter_card_number: voter_card_number }) }} />

                                            <InputTextForm label="Farmer/Producer Loan No. (Existing)" onChangeText={kcc_number => { setfarmerData({ ...farmerData, kcc_number: kcc_number }) }} value={farmerData.kcc_number} />
                                        </>
                                    </View>
                                </View>

                                <View style={{ backgroundColor: '#D5FFD0', marginTop: 20 }}>
                                    <View style={{ marginTop: 20, marginHorizontal: 15 }}>
                                        <>
                                            <View style={{ marginTop: 10, }}>
                                                <InputTextForm label="Account Holder Name" onChangeText={user_bank_account_holder => setfarmerData({ ...farmerData, user_bank_account_holder: user_bank_account_holder })} value={farmerData.user_bank_account_holder} />
                                            </View>
                                            <InputTextForm label="Bank Name" onChangeText={user_bank_account_name => setfarmerData({ ...farmerData, user_bank_account_name: user_bank_account_name })} value={farmerData.user_bank_account_name} />

                                            <InputTextForm label="Branch Name" onChangeText={user_bank_branch_name => setfarmerData({ ...farmerData, user_bank_branch_name: user_bank_branch_name })} value={farmerData.user_bank_branch_name} />

                                            <InputTextForm label="Bank Account No" onChangeText={user_bank_account_number => setfarmerData({ ...farmerData, user_bank_account_number: user_bank_account_number })} value={farmerData.user_bank_account_number} keyboardType="numeric" />

                                            <InputTextForm label="Bank Code (IFSC/SWIFT)" onChangeText={user_bank_ifsc_code => setfarmerData({ ...farmerData, user_bank_ifsc_code: user_bank_ifsc_code })} value={farmerData.user_bank_ifsc_code} />
                                        </>
                                    </View>
                                </View>

                                <View style={{ backgroundColor: '#D5FFD0', marginTop: 20 }}>
                                    <View style={{ marginTop: 20, marginHorizontal: 15 }}>
                                        <>
                                            <View style={{ marginTop: 10, }}>
                                                <InputTextForm label="Pension Providing Authority" onChangeText={pension_authority => setfarmerData({ ...farmerData, pension_authority: pension_authority })} value={farmerData.pension_authority} />
                                            </View>

                                            <InputTextForm label="Pension Account Number" onChangeText={pension_account_no => setfarmerData({ ...farmerData, pension_account_no: pension_account_no })} value={farmerData.pension_account_no} keyboardType="numeric" />

                                            <View>
                                                <Text style={{ marginBottom: 5, marginLeft: 5, }}>Effective From</Text>
                                                <View style={styles.passwordMainContainer}>
                                                    <View style={styles.passwordContainer}>
                                                        <TextInput style={styles.inputTextStyle} value={farmerData.effective_from} />
                                                        <TouchableOpacity onPress={() => setOpen(true)}>
                                                            <ImageForm
                                                                source={require('../../Common/images/date.png')}
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
                                                    </View>
                                                </View>
                                            </View>

                                            <InputTextForm label="Pension Amount(Dollar_D)" onChangeText={pension_amount => setfarmerData({ ...farmerData, pension_amount: pension_amount })} value={farmerData.pension_amount} keyboardType="numeric" />

                                            <DropdownForm label="Per Month/ Quarter/Year" data={config.pensionParMonthData} onChange={frequency => setfarmerData({ ...farmerData, frequency: frequency })} val={farmerData.frequency} />
                                        </>
                                    </View>
                                </View>

                                <View style={{ backgroundColor: '#D5FFD0', marginTop: 20 }}>
                                    <View style={{ marginTop: 20, marginHorizontal: 15 }}>
                                        <>
                                            <View style={{ marginTop: 10, }}>
                                                <InputTextForm label="Name of Company" onChangeText={company_name => setfarmerData({ ...farmerData, company_name: company_name })} value={farmerData.company_name} />
                                            </View>
                                            <InputTextForm label="Policy Number" onChangeText={policy_no => setfarmerData({ ...farmerData, policy_no: policy_no })} value={farmerData.policy_no} keyboardType="numeric" />
                                            <InputTextForm label="Sum Insured ( Dollar_D )" onChangeText={sum_insured => setfarmerData({ ...farmerData, sum_insured: sum_insured })} value={farmerData.sum_insured} keyboardType="numeric" />
                                        </>
                                    </View>
                                </View>
                            </>


                            : ''
                    }
                    <View style={{ marginTop: 10, backgroundColor: '#D5FFD0' }}>
                        <ButtonForm label='Next' onPress={() => handleUserListUpdate()} />
                    </View>
                </View>
            </ScrollView>
        </>
    )
}

export default Information

const styles = StyleSheet.create({
    passwordMainContainer: {
        flex: 1,
        alignItems: 'center',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
        flex: 1,
        height: 40,
        marginHorizontal: 10,
        borderColor: 'gray',
    },
})
