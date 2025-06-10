import {
    Image, ScrollView, StyleSheet, Text, View, TouchableOpacity, FlatList, SafeAreaView,
    Dimensions, Keyboard,
} from 'react-native'
import React, { useCallback, useState, useEffect, useContext } from 'react'
import CheckBoxComp from '../../Common/CheckBoxComp';
import DocumentPicker, { types } from 'react-native-document-picker';
import {
    problemPlotAgainstFarmerAPI,
    loanPurposeAPI,
    problemProduceAgainstPlotAPI,
    Addloan
} from './LoanAPI_copy';
import { userCreateContext } from '../../Context/usersCreateContext';
const LoanRequest = ({ setActiveBtn }) => {
    //GQR-67
    const { loginUser_data, LoadingScreen, t, Toast,
        AlertMesg, getItem, InputTextForm, DropdownForm, ButtonFormBottom,
        Root,
        // handleResultSelect,
        farmerData } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    //GQR-67
    const [isLoading, setIsLoading] = useState(false);
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [selectedName, setSelectedName] = useState('');
    const [farmerID, setfarmerID] = useState();
    const [loanPurpose, setLoanPurpose] = useState([]);
    const [plotSite, setPlotSite] = useState([])
    const [isChecked, setIsChecked] = useState([]);
    const [nameVarityStartEnd, setNameVarityStartEnd] = useState([]);
    const [identityProof, setIdentityProof] = useState([
        { uri: "", name: "", type: "", fileName: "" }
    ]);
    const [addressProof, setAddressProof] = useState([
        { uri: "", name: "", type: "", fileName: "" },
        { uri: "", name: "", type: "", fileName: "" },
        { uri: "", name: "", type: "", fileName: "" },
        { uri: "", name: "", type: "", fileName: "" },
        { uri: "", name: "", type: "", fileName: "" }
    ]);
    const [landProof, setLandProof] = useState([
        { uri: "", name: "", type: "", fileName: "" },
        { uri: "", name: "", type: "", fileName: "" },
        { uri: "", name: "", type: "", fileName: "" },
        { uri: "", name: "", type: "", fileName: "" },
        { uri: "", name: "", type: "", fileName: "" },
    ]);
    const [saveData, setSaveData] = useState({
        user_id: farmerID,
        loan_amount: "",
        loan_purpose: "",
        existing_loan_amount: "",
        apx_annual_income: "",
        farming_type: "crop",
        plot_id: "",
        farmerProducer: "",
        identityNo: "",
        loan_amount: "",
    });
    const [currency, setCurrencyt] = useState("");
    const handleDocumentSelection = useCallback(async (data, index) => {
        try {
            const response = await DocumentPicker.pick({
                presentationStyle: 'fullScreen',
                type: [types.pdf, types.images]
            });
            if (data == "IdentityProof") {
                const values = [...identityProof];
                values[index]["uri"] = response[0].uri;
                values[index]["name"] = response[0].name;
                values[index]["type"] = response[0].type;
                values[index]["fileName"] = response[0].name;
                setIdentityProof(values)
            } else if (data == "AddressProof") {
                const values = [...addressProof];
                values[index]["uri"] = response[0].uri;
                values[index]["name"] = response[0].name;
                values[index]["type"] = response[0].type;
                values[index]["fileName"] = response[0].name;
                setAddressProof(values)
            } else {
                const values = [...landProof];
                values[index]["uri"] = response[0].uri;
                values[index]["name"] = response[0].name;
                values[index]["type"] = response[0].type;
                values[index]["fileName"] = response[0].name;
                setLandProof(values);
            }
        } catch (err) {
            console.error(err);
        }
    }, []);
    const handleSearch = (text) => {
        setSearchFarmerName(text);
        setSearchFarmerPhone('');
        if (farmerData.length !== 0) {
            const result = farmerData.filter(item =>
                item.label.toLowerCase().includes(text.toLowerCase())
            );
            if (result) { setSearchResults(result) }
        }
        if (text == "") {
            setSearchResultsList(false);
        } else {
            setSearchResultsList(true);
        }
    };
    const handleResultSelect = async (name, currentfarmerId, phone, item) => {
        setSearchFarmerPhone(phone)
        setSelectedName(name);
        setSearchFarmerName(name);
        setSearchResults([]);
        setIsChecked([]);
        setPlotSite([]);
        setNameVarityStartEnd([]);
        setfarmerID(currentfarmerId)
        setSearchResultsList(false);
        setSaveData({ ...saveData, identityNo: item.aadhar_number, farmerProducer: item.kcc_number })
        const plotSiteApi = await problemPlotAgainstFarmerAPI(dbname, lan_id, token, currentfarmerId);
        if (plotSiteApi) {
            const dataArray = [];
            const VarityStartArr = [];
            const isCheck = [];
            plotSiteApi.data.data.map((element, index) => {
                dataArray.push({
                    value: element.rel_id,
                    label: element.plot_no
                });
                VarityStartArr.push({
                    plot_id: "",
                    plot_no: "",
                    name: "",
                    varity: "",
                    cycleStarts: "",
                    cycleEnd: "",
                    production_process: "",
                    land_rel_id: ""
                });
                isCheck.push({ "isCheck": "" })
            })
            setIsChecked(isCheck);
            setNameVarityStartEnd(VarityStartArr);
            setPlotSite(dataArray);
        }
        const response = await loanPurposeAPI(dbname, lan_id, token, currentfarmerId)
        if (response.status === 200) {
            const dataArray = [];
            response.data.data.rows.forEach(element => {
                dataArray.push({
                    value: element.fid,
                    label: element.entity_name
                });
            });
            setLoanPurpose(dataArray)
        }
    }
    const handlePlotCheck = async (value, label, index) => {
        const response = await problemProduceAgainstPlotAPI(dbname, lan_id, farmerID, value);
        const isCheckedValue = [...isChecked];
        if (isChecked[index].isCheck == "") {
            isCheckedValue[index] = { isCheck: value }
            setIsChecked(isCheckedValue);
            if (response.status === 200) {
                const { land_rel_id, crop_name, crop_variety, sowing_date, harvesting_date, farmer_production_system } = response.data.data.rows[0];
                const inputdata = [...nameVarityStartEnd];
                inputdata[index] = {
                    plot_id: value,
                    plot_no: crop_name.plot_no,
                    name: crop_name.name,
                    varity: crop_variety.name,
                    cycleStarts: sowing_date,
                    cycleEnd: harvesting_date,
                    production_process: farmer_production_system.name,
                    land_rel_id: land_rel_id
                };
                setNameVarityStartEnd(inputdata)
            }
        } else {
            isCheckedValue[index] = { isCheck: "" }
            setIsChecked(isCheckedValue);
        }
    }

    const onPageLoad = async () => {
        setIsLoading(true);
        const currency_res = await getItem('currency');
        setCurrencyt(currency_res);
        setIsLoading(false);
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    const handledataAdd = (name, text) => {
        setSaveData({ ...saveData, [name]: text })
    }
    const handleSave = async () => {
        Keyboard.dismiss();
        const checkValue = [];
        Object.values(isChecked).map((data, index) => {
            if (data.isCheck != "") { checkValue.push(data.isCheck) }
        })
        const myheader = new Headers();
        const formData = new FormData();
        myheader.append('Content-Type', 'multipart/form-data');
        identityProof.map((data, index) => {
            if (data.name !== "") {
                formData.append("loan_identity", data);
            }
        })
        addressProof.map((data, index) => {
            if (data.name != "") {
                formData.append("loan_address", data);
            }
        })
        landProof.map((data, index) => {
            if (data.name != "") {
                formData.append("loan_land", data);
            }
        })
        if (searchFarmerName == "") {
            Toast.show({ text: `${t('please_enter_farmer_name')}`, ...AlertMesg[0] });
        } else if (saveData.existing_loan_amount == "") {
            Toast.show({ text: t('existing_loan_amount_enter'), ...AlertMesg[0] });
        } else if (saveData.loan_amount == "") {
            Toast.show({ text: `${t('please_enter_loan_amt')}`, ...AlertMesg[0] });
        } else if (saveData.apx_annual_income == "") {
            Toast.show({ text: `${t('pls_enter_income')}`, ...AlertMesg[0] });
        } else if (saveData.loan_purpose == "") {
            Toast.show({ text: `${t('please_enter_pur')}`, ...AlertMesg[0] });
        } else if (checkValue.length < 1) {
            Toast.show({ text: `${t('please_select_plot_first')}`, ...AlertMesg[0] });
        } else {
            setIsLoading(true);
            formData.append("user_id", farmerID);
            formData.append("loan_amount", saveData.loan_amount);
            formData.append("loan_purpose", saveData.loan_purpose);
            formData.append("existing_loan_amount", saveData.existing_loan_amount);
            formData.append("apx_annual_income", saveData.apx_annual_income);
            formData.append("farming_type", saveData.farming_type);
            formData.append("plot_id", checkValue);
            const response = await Addloan(dbname, lan_id, token, user_id, formData)
            if (response?.status === 200) {
                Toast.show({ text: t('Data_submitted_successfully'), ...AlertMesg[0] });
                setTimeout(() => {
                    setActiveBtn(2);
                }, 2000);

            }
            setIsLoading(false);
        }
    }
    return (
        <>
            <Root>
                {isLoading ? <View style={styles.loadingScreen}><LoadingScreen /></View> : null}
                <SafeAreaView>
                    {
                        searchResultsList && searchResultsList ?
                            <View style={styles.flatContainer}>
                                <FlatList
                                    style={searchResults.length > 8 ? styles.flatlistHeight : ""}
                                    data={searchResults}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity onPress={() => handleResultSelect(item.label, item.value, item.phone, item)} style={styles.flatlistitem}>
                                            <Text style={styles.flatlisttitle}>{item.label}</Text>
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(item, index) => index}
                                />
                            </View> : ""
                    }
                </SafeAreaView>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        <InputTextForm label={t('farmer_name')}
                            value={searchFarmerName} onChangeText={(farmerName) => handleSearch(farmerName)} />
                        <InputTextForm label={t('farmer_number')} value={searchFarmerPhone} keyboardType={'numeric'} editable={false} />
                        <InputTextForm label={t('adhar_no')} keyboardType={'numeric'}
                            onChangeText={(text) => handledataAdd('identityNo', text)} value={saveData.identityNo} editable={false} />
                        <InputTextForm label={t('kcc_no')}
                            onChangeText={(text) => handledataAdd('farmerProducer', text)} value={saveData.farmerProducer} editable={false} />
                        <InputTextForm label={t('existing_loan_amount') + `  (${currency})`} keyboardType={'numeric'} color={'#FF0000'}
                            onChangeText={(text) => handledataAdd('existing_loan_amount', text)} value={saveData.existing_loan_amount} />
                        <InputTextForm label={t('loan_required_in_rupees') + `  (${currency})`} keyboardType={'numeric'} color={'#FF0000'}
                            onChangeText={(text) => handledataAdd('loan_amount', text)} value={saveData.loan_amount} />
                        <InputTextForm label={t('annual_income') + `  (${currency})`} keyboardType={'numeric'}
                            onChangeText={(text) => handledataAdd('apx_annual_income', text)} value={saveData.apx_annual_income} color={'#FF0000'} />
                        <DropdownForm label={t('loan_purpose')} data={loanPurpose} onChange={(text) => handledataAdd('loan_purpose', text.value)} color={'#FF0000'} />
                        <Text style={styles.plotTitle}>{t('plot')}</Text>
                        <View style={styles.PlotSiteList}>
                            {
                                plotSite && plotSite.map((data, index) => {
                                    const { label, value } = data;
                                    return (
                                        <View key={index}>
                                            <CheckBoxComp
                                                arrayKey={index}
                                                isChecked={isChecked[index].isCheck}
                                                title={label}
                                                onCheckBox={() => handlePlotCheck(value, label, index)}
                                            />
                                        </View>
                                    )
                                })
                            }
                        </View>
                        <View style={styles.plotContainer}>
                            {
                                nameVarityStartEnd.map((data, index) => {
                                    if (isChecked[index].isCheck != "" && isChecked[index].isCheck == data.plot_id) {
                                        return (
                                            <View key={index} style={styles.plotContainerItem}>
                                                <View>
                                                    <Text style={styles.plotText}>{t('addcrop_cropname')}</Text>
                                                    <Text style={styles.plotText}>{t('addcrop_cropvariety')}</Text>
                                                    <Text style={styles.plotText}>{t('showing_date')}</Text>
                                                    <Text style={styles.plotText}>{t('harvesting_date_auto_calculated')}</Text>
                                                </View>
                                                <View>
                                                    <Text style={styles.plotText}>:{data.name.substring(-1, 15)}</Text>
                                                    <Text style={styles.plotText}>:{data.varity.substring(-1, 15)}</Text>
                                                    <Text style={styles.plotText}>:{data.cycleStarts}</Text>
                                                    <Text style={styles.plotText}>:{data.cycleEnd.substring(0, 10)}</Text>
                                                </View>
                                            </View>
                                        )
                                    }
                                })
                            }
                        </View>
                        <View style={styles.idcontainer}>
                            <Text style={styles.title}>{t('identity_proof')}</Text>
                            <View style={styles.idItemContainer}>
                                {identityProof && identityProof.map((data, index) => {
                                    return (
                                        <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("IdentityProof", index)} key={index} >
                                            <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                            <Text>{data.name == "" ? "" : data.name}{data.name}</Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </View>
                        <View style={styles.idcontainer}>
                            <Text style={styles.title}>{t('address_proof')}</Text>
                            <View style={styles.idItemContainer}>
                                {
                                    addressProof.map((data, index) => {
                                        return (
                                            <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("AddressProof", index)} key={index}>
                                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                                <Text>{data.name == "" ? "" : data.name}</Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </View>
                        </View>
                        <View style={styles.idcontainer}>
                            <Text style={styles.title}>{t('land_records')}</Text>
                            <View style={styles.idItemContainer}>
                                {
                                    landProof && landProof.map((data, index) => {
                                        return (
                                            <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("LandProof", index)} key={index}>
                                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                                <Text>{data.name == "" ? "" : data.name}</Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <ButtonFormBottom label={t('submit')} onPress={handleSave} />
            </Root>
        </>
    )
}

export default LoanRequest;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '3%',
        paddingVertical: 10,
        marginBottom: 50
    },
    idcontainer: {
        marginVertical: 10
    },
    idItemContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',

    },
    idItem: {
        padding: 10,
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    idImage: {
        width: 60,
        height: 60
    },
    flatContainer: {
        backgroundColor: '#FFF',
        width: '100%',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        elevation: 5,
        zIndex: -999
    },
    flatlisttitle: {
        color: '#000',
        marginVertical: 8,
        fontSize: 16
    },
    flatlistitem: {
    },
    plotContainer: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        elevation: 5
    },
    plotContainerItem: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#000',
        margin: 10,
        borderRadius: 10,
        padding: 10
    },
    plotText: {
        color: '#000',
        marginVertical: 2,
        fontFamily: "Poppins-Regular",
        fontSize: 14
    },
    PlotSiteList: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 18,
        elevation: 1
    },
    flatContainer: {
        backgroundColor: '#ffffff',
        position: 'absolute',
        zIndex: 999,
        // bottom: '100%',
        top: 90,
        left: 0,
        marginHorizontal: '5%',
        width: '90%',
        elevation: 10,
        borderRadius: 10,
        padding: 10
    },
    flatlistHeight: {
        height: Dimensions.get('window').height / 2.5
    },
    plotTitle: {
        color: '#FF0000',
        marginBottom: 10,
        fontFamily: "Poppins-Regular",
        fontSize: 14
    },
    title: {
        color: '#000',
        fontFamily: "Poppins-Regular",
        fontSize: 14
    },
    loadingScreen: {
        position: 'absolute',
        top: "60%",
        zIndex: 999,
        left: '45%'
    },
})