import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import InputTextForm from './Common/InputTextForm';
import DropdownForm from './Common/DropdownForm';
import ButtonForm from './Common/ButtonForm';
import Logo from './Common/Logo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import config from '../config';
import ImageForm from './Common/ImageForm';
import DatePicker from 'react-native-date-picker'
import { getItem, setItem } from '../config/getDataFromStorage';
const Financial = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pagename, arrayIndex } = route.params;
    const [dbName, setdbName] = useState();
    const [storeFinancial, setstoreFinancial] = useState({
        adharCard: '', panNo: '', voterCard: '', farmarLoanNo: '',
        accountHolderName: '', bankName: '', ifscCode: '', bankAccountNo: '', branchName: '', pensionAccountNo: '',
        pensionProvidingAuthority: '', pensionAmount: '', pensionEffectiveFrom: '', pensionPerMonth: '', nameOfCompany: '', policyNumber: '', sumInsured: ''
    });
    const [newdate, setnewDate] = useState(new Date())
    const [open, setOpen] = useState(false)
    const handleDatePicker = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        // console.log(x1[2] + '/' + x1[1] + '/' + x1[0]);
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setstoreFinancial({ ...storeFinancial, pensionEffectiveFrom: effective_date })
        // console.log(item);
    }
    const [isIdentity, setIdentity] = useState(false);
    const toggleIdentity = () => {
        setIdentity(!isIdentity);
    };
    const [isBank, setBank] = useState(false);
    const toggleBank = () => {
        setBank(!isBank);
    };
    const [isPension, setPension] = useState(false);
    const togglePension = () => {
        setPension(!isPension);
    };
    const [isLifeInsurance, setLifeInsurance] = useState(false);
    const toggleLifeInsurance = () => {
        setLifeInsurance(!isLifeInsurance);
    };

    const handleSave = async () => {
        await setItem("storeFinancial_data", storeFinancial);
        navigation.navigate(pagename, { pagename: 'SignUpViwer', arrayIndex: 0 });
    }

    const onPageLoad = async () => {
        //       let mydata= await getItem('storeFinancial_data')
        // return console.log(mydata);
        const storeSignup_data = await getItem('storeSignup_data');
        setdbName(storeSignup_data.company.dbname)
        const storeFinancial_data = await getItem('storeFinancial_data');
        if (storeFinancial_data) {
            setstoreFinancial(storeFinancial_data);
            if (storeFinancial_data.language) {
                stateInfoDataList(storeSignup_data.company.dbname, storeFinancial_data.language);
            }
        }
    };

    useEffect(() => {
        onPageLoad();
    }, []);
    return (
        <>
        <View style={{ height: 60, backgroundColor: '#003c04' }}></View>
            <ScrollView style={{ backgroundColor: '#ffff' }}>
                <Text style={{textAlign:'right',fontSize:19,color:'#000',fontWeight:'bold',paddingVertical:10,marginRight:15}}>Financial Information</Text>
                <View style={{ backgroundColor: '#ffff' }}>
                    <View style={{ paddingHorizontal: 20 }}>
                        <View style={styles.container}>
                            <TouchableOpacity onPress={toggleIdentity}>
                                <View style={styles.headerStyle}>
                                    <Text style={styles.toggleText}>
                                        {isIdentity ? 'Identity Numbers' : 'Identity Numbers'}
                                    </Text>
                                    <Text style={styles.toggleText}>
                                        {isIdentity ? <Image source={require('./Common/images/sub.png')} style={{ width: 20, height: 20 }} />
                                            :
                                            <Image source={require('./Common/images/add.png')} style={{ width: 20, height: 20 }} />
                                        }
                                    </Text>
                                </View>

                            </TouchableOpacity>
                            {isIdentity && (
                                <>
                                    <View style={{ marginTop: 10, }}>
                                        <InputTextForm label="National Identity No. (Aadhaar)" onChangeText={adharCard => setstoreFinancial({ ...storeFinancial, adharCard: adharCard })} keyboardType="numeric" value={storeFinancial.adharCard} />
                                    </View>

                                    <InputTextForm label="Income Tax No. (PAN)" value={storeFinancial.panNo} onChangeText={panNo => setstoreFinancial({ ...storeFinancial, panNo: panNo })} />

                                    <InputTextForm label="Voter Card No." value={storeFinancial.voterCard} onChangeText={voterCard => setstoreFinancial({ ...storeFinancial, voterCard: voterCard })} />

                                    <InputTextForm label="Farmer/Producer Loan No. (Existing)" onChangeText={farmarLoanNo => setstoreFinancial({ ...storeFinancial, farmarLoanNo: farmarLoanNo })} value={storeFinancial.farmarLoanNo} />
                                </>
                            )}
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 20 }}>
                        <View style={styles.container}>
                            <TouchableOpacity onPress={toggleBank}>
                                <View style={styles.headerStyle}>
                                    <Text style={styles.toggleText}>
                                        {isBank ? 'Bank Account Details' : 'Bank Account Details'}
                                    </Text>
                                    <Text style={styles.toggleText}>
                                        {isBank ? <Image source={require('./Common/images/sub.png')} style={{ width: 20, height: 20 }} />
                                            :
                                            <Image source={require('./Common/images/add.png')} style={{ width: 20, height: 20 }} />
                                        }
                                    </Text>
                                </View>

                            </TouchableOpacity>
                            {isBank && (
                                <>
                                    <View style={{ marginTop: 10, }}>
                                        <InputTextForm label="Account Holder Name" onChangeText={accountHolderName => setstoreFinancial({ ...storeFinancial, accountHolderName: accountHolderName })} value={storeFinancial.accountHolderName} />
                                    </View>
                                    <InputTextForm label="Bank Name" onChangeText={bankName => setstoreFinancial({ ...storeFinancial, bankName: bankName })} value={storeFinancial.bankName} />

                                    <InputTextForm label="Branch Name" onChangeText={branchName => setstoreFinancial({ ...storeFinancial, branchName: branchName })} value={storeFinancial.branchName} />

                                    <InputTextForm label="Bank Account No" onChangeText={bankAccountNo => setstoreFinancial({ ...storeFinancial, bankAccountNo: bankAccountNo })} value={storeFinancial.bankAccountNo} keyboardType="numeric" />

                                    <InputTextForm label="Bank Code (IFSC/SWIFT)" onChangeText={ifscCode => setstoreFinancial({ ...storeFinancial, ifscCode: ifscCode })} value={storeFinancial.ifscCode} />
                                </>
                            )}
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 20 }}>
                        <View style={styles.container}>
                            <TouchableOpacity onPress={togglePension}>
                                <View style={styles.headerStyle}>
                                    <Text style={styles.toggleText}>
                                        {isPension ? 'Pension Details' : 'Pension Details'}
                                    </Text>
                                    <Text style={styles.toggleText}>
                                        {isPension ? <Image source={require('./Common/images/sub.png')} style={{ width: 20, height: 20 }} />
                                            :
                                            <Image source={require('./Common/images/add.png')} style={{ width: 20, height: 20 }} />
                                        }
                                    </Text>
                                </View>

                            </TouchableOpacity>
                            {isPension && (
                                <>
                                    <View style={{ marginTop: 10, }}>
                                        <InputTextForm label="Pension Providing Authority" onChangeText={pensionProvidingAuthority => setstoreFinancial({ ...storeFinancial, pensionProvidingAuthority: pensionProvidingAuthority })} value={storeFinancial.pensionProvidingAuthority} />
                                    </View>
                                    <InputTextForm label="Pension Account Number" onChangeText={pensionAccountNo => setstoreFinancial({ ...storeFinancial, pensionAccountNo: pensionAccountNo })} value={storeFinancial.pensionAccountNo} keyboardType="numeric" />
                                    <View>
                                        <Text style={{ marginBottom: 5, marginLeft: 5, }}>Effective From</Text>
                                        <View style={styles.passwordMainContainer}>
                                            <View style={styles.passwordContainer}>
                                                <TextInput style={styles.inputTextStyle} value={storeFinancial.pensionEffectiveFrom} />
                                                <TouchableOpacity onPress={() => setOpen(true)}>
                                                    <ImageForm
                                                        source={require('./Common/images/date.png')}
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
                                                        handleDatePicker(item)
                                                        setOpen(false)
                                                    }}
                                                    onCancel={() => {
                                                        setOpen(false)
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                    <InputTextForm label="Pension Amount(Dollar_D)" onChangeText={pensionAmount => setstoreFinancial({ ...storeFinancial, pensionAmount: pensionAmount })} value={storeFinancial.pensionAmount} keyboardType="numeric" />
                                    <DropdownForm label="Per Month/ Quarter/Year" data={config.pensionParMonthData} onChange={pensionPerMonth => setstoreFinancial({ ...storeFinancial, pensionPerMonth: pensionPerMonth })} val={storeFinancial.pensionPerMonth} />
                                </>
                            )}
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 20 }}>
                        <View style={styles.container}>
                            <TouchableOpacity onPress={toggleLifeInsurance}>
                                <View style={styles.headerStyle}>
                                    <Text style={styles.toggleText}>
                                        {isLifeInsurance ? 'Life Insurance Details' : 'Life Insurance Details'}
                                    </Text>
                                    <Text style={styles.toggleText}>
                                        {isLifeInsurance ?
                                            <Image source={require('./Common/images/sub.png')} style={{ width: 20, height: 20 }} />
                                            :
                                            <Image source={require('./Common/images/add.png')} style={{ width: 20, height: 20 }} />
                                        }
                                    </Text>
                                </View>

                            </TouchableOpacity>
                            {isLifeInsurance && (
                                <>
                                    <View style={{ marginTop: 10, }}>
                                        <InputTextForm label="Name of Company" onChangeText={nameOfCompany => setstoreFinancial({ ...storeFinancial, nameOfCompany: nameOfCompany })} value={storeFinancial.nameOfCompany} />
                                    </View>
                                    <InputTextForm label="Policy Number" onChangeText={policyNumber => setstoreFinancial({ ...storeFinancial, policyNumber: policyNumber })} value={storeFinancial.policyNumber} keyboardType="numeric" />
                                    <InputTextForm label="Sum Insured ( Dollar_D )" onChangeText={sumInsured => setstoreFinancial({ ...storeFinancial, sumInsured: sumInsured })} value={storeFinancial.sumInsured} keyboardType="numeric" />
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View style={{ marginTop: 10, backgroundColor: '#D5FFD0' }}>
                <ButtonForm label='Skip/Next' onPress={() => handleSave('ProduceInfo')} />
            </View>
        </>
    )
}

export default Financial

const styles = StyleSheet.create({
    headerStyle: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    container: {
        marginTop: 10,
        padding: 17,
        borderWidth: 0,
        borderColor: '#ddd',
        backgroundColor: '#D5FFD0',
        borderRadius: 10,
    },
    toggleText: {
        fontSize: 18,
    },
    content: {
        marginTop: 10,
    },
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
