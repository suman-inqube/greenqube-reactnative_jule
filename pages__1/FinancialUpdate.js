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
import { useTranslation } from 'react-i18next';
const FinancialUpdate = () => {
    const { t } = useTranslation();
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
        const storeSignup_data = await getItem('storeSignup_data');
        // return console.log(mydata);
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
                <Text style={{ textAlign: 'right', fontSize: 19, color: '#000', fontWeight: 'bold', paddingVertical: 10, marginRight: 15 }}>{t('financial_information')}</Text>
                <View style={{ backgroundColor: '#ffff' }}>
                    <View style={{ paddingHorizontal: 20 }}>
                        <View style={styles.container}>
                            <TouchableOpacity onPress={toggleIdentity}>
                                <View style={styles.headerStyle}>
                                    <Text style={styles.toggleText}>
                                        {isIdentity ? `${t('different_identity_number')}` : `${t('different_identity_number')}`}
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
                                        <InputTextForm label={t('adhar_no')} onChangeText={adharCard => setstoreFinancial({ ...storeFinancial, adharCard: adharCard })} keyboardType="numeric" value={storeFinancial.adharCard} />
                                    </View>

                                    <InputTextForm label={t('pan_no')} value={storeFinancial.panNo} onChangeText={panNo => setstoreFinancial({ ...storeFinancial, panNo: panNo })} />

                                    <InputTextForm label={t('voter_card_no')} value={storeFinancial.voterCard} onChangeText={voterCard => setstoreFinancial({ ...storeFinancial, voterCard: voterCard })} />

                                    <InputTextForm label={t('kcc_no')} onChangeText={farmarLoanNo => setstoreFinancial({ ...storeFinancial, farmarLoanNo: farmarLoanNo })} value={storeFinancial.farmarLoanNo} />
                                </>
                            )}
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 20 }}>
                        <View style={styles.container}>
                            <TouchableOpacity onPress={toggleBank}>
                                <View style={styles.headerStyle}>
                                    <Text style={styles.toggleText}>
                                        {isBank ? `${t('bank_account_details')}` : `${t('bank_account_details')}`}
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
                                        <InputTextForm label={t('account_holder_name')} onChangeText={accountHolderName => setstoreFinancial({ ...storeFinancial, accountHolderName: accountHolderName })} value={storeFinancial.accountHolderName} />
                                    </View>
                                    <InputTextForm label={t('bank_name')} onChangeText={bankName => setstoreFinancial({ ...storeFinancial, bankName: bankName })} value={storeFinancial.bankName} />

                                    <InputTextForm label={t('branch_name')} onChangeText={branchName => setstoreFinancial({ ...storeFinancial, branchName: branchName })} value={storeFinancial.branchName} />

                                    <InputTextForm label={t('bank_account')} onChangeText={bankAccountNo => setstoreFinancial({ ...storeFinancial, bankAccountNo: bankAccountNo })} value={storeFinancial.bankAccountNo} keyboardType="numeric" />

                                    <InputTextForm label={t('ifsc_no')} onChangeText={ifscCode => setstoreFinancial({ ...storeFinancial, ifscCode: ifscCode })} value={storeFinancial.ifscCode} />
                                </>
                            )}
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 20 }}>
                        <View style={styles.container}>
                            <TouchableOpacity onPress={togglePension}>
                                <View style={styles.headerStyle}>
                                    <Text style={styles.toggleText}>
                                        {isPension ? `${t('pension_details')}` : `${t('pension_details')}`}
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
                                        <InputTextForm label={t('pension_providing_authority')} onChangeText={pensionProvidingAuthority => setstoreFinancial({ ...storeFinancial, pensionProvidingAuthority: pensionProvidingAuthority })} value={storeFinancial.pensionProvidingAuthority} />
                                    </View>
                                    <InputTextForm label={t('pension_account_number')} onChangeText={pensionAccountNo => setstoreFinancial({ ...storeFinancial, pensionAccountNo: pensionAccountNo })} value={storeFinancial.pensionAccountNo} keyboardType="numeric" />
                                    <View>
                                        <Text style={{ marginBottom: 5, marginLeft: 5, color: '#000' }}>{t('effective_from')} From</Text>
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
                                    <InputTextForm label={t('pension_amount_currency')} onChangeText={pensionAmount => setstoreFinancial({ ...storeFinancial, pensionAmount: pensionAmount })} value={storeFinancial.pensionAmount} keyboardType="numeric" />
                                    <DropdownForm label={t('per_month_quarter_year')} data={config.pensionParMonthData} onChange={pensionPerMonth => setstoreFinancial({ ...storeFinancial, pensionPerMonth: pensionPerMonth })} val={storeFinancial.pensionPerMonth.label} />
                                </>
                            )}
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 20, marginBottom: 100 }}>
                        <View style={styles.container}>
                            <TouchableOpacity onPress={toggleLifeInsurance}>
                                <View style={styles.headerStyle}>
                                    <Text style={styles.toggleText}>
                                        {isLifeInsurance ? `${t('life_insurance_details')}` : `${t('life_insurance_details')}`}
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
                                        <InputTextForm label={t('lic_name_of_company')} onChangeText={nameOfCompany => setstoreFinancial({ ...storeFinancial, nameOfCompany: nameOfCompany })} value={storeFinancial.nameOfCompany} />
                                    </View>
                                    <InputTextForm label={t('policy_number')} onChangeText={policyNumber => setstoreFinancial({ ...storeFinancial, policyNumber: policyNumber })} value={storeFinancial.policyNumber} keyboardType="numeric" />
                                    <InputTextForm label={t('sum_insured_currency')} onChangeText={sumInsured => setstoreFinancial({ ...storeFinancial, sumInsured: sumInsured })} value={storeFinancial.sumInsured} keyboardType="numeric" />
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View style={{ marginTop: 10, backgroundColor: '#D5FFD0' }}>
                <ButtonForm label={t('skip_next')} onPress={() => handleSave('ProduceInfo')} />
            </View>
        </>
    )
}

export default FinancialUpdate

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
        color: '#000'
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
