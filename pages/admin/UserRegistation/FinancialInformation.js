import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, TextInput, BackHandler, Keyboard } from 'react-native'
import React, { useEffect, useState, useCallback, useContext } from 'react'
import ImageForm from '../../Common/ImageForm';
import DatePicker from 'react-native-date-picker';
import { useNavigation, useRoute, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
const FinancialInformation = () => {
    const { InputTextForm, getItem, setItem, t, ButtonForm, onBackPress, config,
        DropdownForm, CustomHeader, FormsTitle, logoImage, topBanner } = useContext(userCreateContext);
    const navigation = useNavigation();
    const route = useRoute();
    const isFocused = useIsFocused();
    const [remove, setRemove] = useState("");
    const [storeFinancial, setstoreFinancial] = useState({
        adharCard: '',
        panNo: '',
        voterCard: '',
        farmarLoanNo: '',
        accountHolderName: '',
        bankName: '',
        ifscCode: '',
        bankAccountNo: '',
        branchName: '',
        pensionAccountNo: '',
        pensionProvidingAuthority: '',
        pensionAmount: '',
        pensionEffectiveFrom: '',
        pensionPerMonth: '',
        nameOfCompany: '',
        policyNumber: '',
        sumInsured: ''
    });
    const [newdate, setnewDate] = useState(new Date())
    const [open, setOpen] = useState(false);
    const [isIdentity, setIdentity] = useState(false);
    const [path, setPath] = useState("");
    const toggleIdentity = () => {
        setIdentity(!isIdentity);
    };
    const [isBank, setBank] = useState(false);
    const [currency, setCurrencyt] = useState("");
    const handleDatePicker = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        // console.log(x1[2] + '/' + x1[1] + '/' + x1[0]);
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setstoreFinancial({ ...storeFinancial, pensionEffectiveFrom: effective_date })
        // console.log(item);
    }
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
    const onPageLoad = async () => {
        const [currency_res] = await Promise.all([
            getItem('currency')
        ]);
        setCurrencyt(currency_res);
    }
    useEffect(() => {
        if (isFocused) {
            onPageLoad();
            if (typeof route.params != "undefined") {
                if (route.params.data === "remove") {
                    if (remove == "remove") {
                        setRemove("");
                    } else {
                        setRemove("remove");
                    }
                    emptyData();
                }
                if (typeof route.params.pagename != 'undefined') {
                    setPath(route.params.pagename);
                } else {
                    setPath("");
                }
            } else {
                setPath("");
                setRemove("");
            }
        }
    }, [isFocused]);
    const handleBackPress = () => { navigation.navigate(path != "" ? path : 'PersonalInformation'); return true; }
    useFocusEffect(
        useCallback(() => {
            onBackPress(handleBackPress);
        })
    );
    const emptyData = () => {
        setstoreFinancial({
            adharCard: '',
            panNo: '',
            voterCard: '',
            farmarLoanNo: '',
            accountHolderName: '',
            bankName: '',
            ifscCode: '',
            bankAccountNo: '',
            branchName: '',
            pensionAccountNo: '',
            pensionProvidingAuthority: '',
            pensionAmount: '',
            pensionEffectiveFrom: '',
            pensionPerMonth: '',
            nameOfCompany: '',
            policyNumber: '',
            sumInsured: ''
        });
    }
    const handleNavigate = async () => {
        Keyboard.dismiss();
        if (path != "") {
            await setItem("storeFinancial_data", storeFinancial);
            navigation.navigate(route.params.pagename, { data: remove })
        } else {
            await setItem("storeFinancial_data", storeFinancial);
            navigation.navigate('PlotSiteProduceInformation', { data: remove })
        }
    }
    const HandlerGoBack = () => {
        if (path != '') {
            navigation.navigate(path)
        } else {
            navigation.navigate('PersonalInformation')
        }
    }
    return (
        <>
            <CustomHeader path={path != "" ? path : 'PersonalInformation'} HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
            <FormsTitle title={t('financial_information')} />
            <ScrollView>
                <View style={styles.mainConatiner}>
                    <View style={{ paddingHorizontal: 20 }}>
                        <View style={styles.container}>
                            <TouchableOpacity onPress={toggleIdentity}>
                                <View style={styles.headerStyle}>
                                    <Text style={styles.toggleText}>
                                        {isIdentity ? `${t('different_identity_number')}` : `${t('different_identity_number')}`}
                                    </Text>
                                    <Text style={styles.toggleText}>
                                        {isIdentity ? <Image source={require('../../Common/images/sub.png')} style={{ width: 20, height: 20 }} />
                                            :
                                            <Image source={require('../../Common/images/add.png')} style={{ width: 20, height: 20 }} />
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
                                        {isBank ? <Image source={require('../../Common/images/sub.png')} style={{ width: 20, height: 20 }} />
                                            :
                                            <Image source={require('../../Common/images/add.png')} style={{ width: 20, height: 20 }} />
                                        }
                                    </Text>
                                </View>

                            </TouchableOpacity>
                            {isBank && (
                                <>
                                    <View style={{ marginTop: 10, }}>
                                        <InputTextForm label={t('account_holder_name')} onChangeText={accountHolderName => setstoreFinancial({ ...storeFinancial, accountHolderName: accountHolderName })} value={storeFinancial.accountHolderName} />
                                    </View>
                                    <InputTextForm label={t('farmer_reg_bankifsc')} onChangeText={bankName => setstoreFinancial({ ...storeFinancial, bankName: bankName })} value={storeFinancial.bankName} />
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
                                        {isPension ? <Image source={require('../../Common/images/sub.png')} style={{ width: 20, height: 20 }} />
                                            :
                                            <Image source={require('../../Common/images/add.png')} style={{ width: 20, height: 20 }} />
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
                                        <Text style={{ marginBottom: 5, marginLeft: 5, color: '#000' }}>{t('effective_from')}</Text>
                                        <View style={styles.passwordMainContainer}>
                                            <View style={styles.passwordContainer}>
                                                <TouchableOpacity style={styles.inputTextStyle} onPress={() => setOpen(true)}>
                                                    <Text style={styles.title}>{storeFinancial.pensionEffectiveFrom}</Text></TouchableOpacity>
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
                                    <InputTextForm label={t('pension_amount_currency') + ` (${currency})`} onChangeText={pensionAmount => setstoreFinancial({ ...storeFinancial, pensionAmount: pensionAmount })} value={storeFinancial.pensionAmount} keyboardType="numeric" />
                                    <DropdownForm label={t('per_month_quarter_year')}
                                        data={config.pensionParMonthData}
                                        onChange={pensionPerMonth => setstoreFinancial({ ...storeFinancial, pensionPerMonth: pensionPerMonth })} val={storeFinancial.pensionPerMonth}
                                    />
                                </>
                            )}
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 20 }}>
                        <View style={styles.container}>
                            <TouchableOpacity onPress={toggleLifeInsurance}>
                                <View style={styles.headerStyle}>
                                    <Text style={styles.toggleText}>
                                        {isLifeInsurance ? `${t('life_insurance_details')}` : `${t('life_insurance_details')}`}
                                    </Text>
                                    <Text style={styles.toggleText}>
                                        {isLifeInsurance ?
                                            <Image source={require('../../Common/images/sub.png')} style={{ width: 20, height: 20 }} />
                                            :
                                            <Image source={require('../../Common/images/add.png')} style={{ width: 20, height: 20 }} />
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
                <ButtonForm label={t('skip_next')} onPress={handleNavigate} />
            </View>
        </>
    )
}

export default FinancialInformation;


const styles = StyleSheet.create({
    mainConatiner: {
        marginTop: 10,
        marginBottom: 50
    },
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
        borderRadius: 30,
        elevation: 2
    },
    toggleText: {
        fontSize: 18,
        color: '#000',
        fontFamily: 'Poppins-Regular',
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
        // width:'90%',
        height: 40,
        marginHorizontal: 10,
        borderColor: 'gray',
        paddingVertical: 10,
    },
    title: {
        color: '#000',
        fontFamily: 'Poppins-Regular',
    }
})