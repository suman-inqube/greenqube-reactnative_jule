import {
    Image, ScrollView, StyleSheet, Text, View, TouchableOpacity, FlatList, SafeAreaView,
    Dimensions, Keyboard, BackHandler
} from 'react-native'
import React, { useCallback, useState, useEffect } from 'react'
import InputTextForm from '../../Common/InputTextForm';
import DropdownForm from '../../Common/DropdownForm';
import ButtonForm from '../../Common/ButtonForm';
import CheckBoxComp from '../../Common/CheckBoxComp';
import DocumentPicker, { types } from 'react-native-document-picker';
import { getItem } from '../../../config/getDataFromStorage';
import { Root, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import { useTranslation } from 'react-i18next';
import {
    problemPlotAgainstFarmerAPI,
    loanPurposeAPI,
    loanRouteFarmerListAPI,
    problemProduceAgainstPlotAPI,
    Addloan
} from './FarmerLoanAPI';
import { useNavigation } from '@react-navigation/native';
import LoadingScreen from '../../Common/LoadingScreen';
const FarmerLoanRequest = ({ setActiveBtn }) => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [loanFarmerList, setloanFarmerList] = useState();
    const [currency, setcurrency] = useState("");
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: '',
        languageID: '',
        token: '',
        userID: '',
        userName: '',
        userNumber: ''
    });
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [selectedName, setSelectedName] = useState('');
    const [farmerID, setfarmerID] = useState();
    const [activityTypeAll, setactivityTypeAll] = useState([]);
    const [loanPurpose, setLoanPurpose] = useState([]);
    const [plotSite, setPlotSite] = useState([])
    const [pickPlot, setPickPlot] = useState([])
    const [isChecked, setIsChecked] = useState({});
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
        identityNo: ""

    });
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
            //   console.warn(err);
        }
    }, []);
    const handleSearch = (text) => {
        setSearchFarmerName(text);
        setSearchFarmerPhone('');
        if (loanFarmerList.length !== 0) {
            const result = loanFarmerList.filter(item =>
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
    const handleResultSelect = async (name, currentfarmerId, phone) => {
        setSearchFarmerPhone(phone)
        setSelectedName(name);
        setSearchFarmerName(name);
        setSearchResults([]);
        setfarmerID(currentfarmerId)
        setSearchResultsList(false);
        const plotSiteApi = await problemPlotAgainstFarmerAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, currentfarmerId);
        if (plotSiteApi) {
            const dataArray = [];
            plotSiteApi.data.data.forEach(element => {
                dataArray.push({
                    value: element.rel_id,
                    label: element.plot_no
                });
            });
            setPlotSite(dataArray)
        }
        const response = await loanPurposeAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, currentfarmerId)
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
    const handlePlot = async (value, label, index) => {
        if (isChecked[index] === value) {
            setIsChecked({ ...isChecked, [index]: "" });
            const values = [...nameVarityStartEnd];

            const plotValues = [...pickPlot];
            for (let i = 0; i < plotValues.length; i++) {
                if (plotValues[i].plot_id === value) {
                    plotValues.splice(i, 1);
                }
            }
            setPickPlot(plotValues)
            for (let i = 0; i < values.length; i++) {
                if (values[i].plot_id === value) {

                    values.splice(i, 1);
                }
            }
            setNameVarityStartEnd(values);
        } else {
            const plotArray = [];
            plotArray.push({
                value: value,
                label: label
            });
            setPickPlot(plotArray)
            setIsChecked({ ...isChecked, [index]: value });
            const response = await problemProduceAgainstPlotAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmerID, value);
            if (response) {
                setNameVarityStartEnd([...nameVarityStartEnd, {
                    plot_no: response.data.data.rows[0].land_info.plot_no,
                    plot_id: response.data.data.rows[0].land_rel_id,
                    name: response.data.data.rows[0].crop_name.name,
                    varity: response.data.data.rows[0].crop_variety.name,
                    cycleStarts: response.data.data.rows[0].sowing_date,
                    cycleEnd: response.data.data.rows[0].harvesting_date,
                    production_process: response.data.data.rows[0].farmer_production_system.name,

                }])
            }
        }
    }
    const onPageLoad = async () => {
        setIsLoading(true);
        const [loginUser_data, curr] = await Promise.all([
            getItem('loginUser_data'),
            getItem('currency')
        ]);
        setcurrency(curr)
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const userID = loginUser_data.user_id;
            const userName = loginUser_data.userName;
            const userContactNumber = loginUser_data.contactNumber;
            const aadharNumber = loginUser_data.aadhar_number;
            const kcc_number = loginUser_data.kcc_number;
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageID: languageID,
                token: token,
                userID: userID,
                userName: userName,
                userNumber: userContactNumber,
                aadharNumber: aadharNumber,
                kcc_number: kcc_number
            })
            setfarmerID(loginUser_data.user_id)
            setSearchResultsList(false);
            const plotSiteApi = await problemPlotAgainstFarmerAPI(dbName, languageID, token, userID);
            if (plotSiteApi) {
                const dataArray = [];
                plotSiteApi.data.data.forEach(element => {
                    dataArray.push({
                        value: element.rel_id,
                        label: element.plot_no
                    });
                });
                setPlotSite(dataArray)
            }
            const response = await loanPurposeAPI(dbName, languageID, token, userID)
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
        setIsLoading(false)
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    const handledataAdd = (name, text) => {
        setSaveData({ ...saveData, [name]: text })
    }
    const handleSave = async () => {
        setIsLoading(true);
        Keyboard.dismiss();
        const checkValue = [];
        Object.values(isChecked).map((data, index) => {
            if (data != "") { checkValue.push(data) }
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

        if (saveData.loan_amount == "") {
            Toast.show({ text: `${t('please_enter_loan_amt')}`, ...AlertMesg[0] });
        } else if (saveData.apx_annual_income == "") {
            Toast.show({ text: `${t('pls_enter_income')}`, ...AlertMesg[0] });
        } else if (saveData.existing_loan_amount == "") {
            Toast.show({ text: 'Please enter existing loan amount', ...AlertMesg[0] });
        } else if (saveData.loan_purpose == "") {
            Toast.show({ text: `${t('please_enter_pur')}`, ...AlertMesg[0] });
        } else if (pickPlot.length < 1) {
            Toast.show({ text: `${t('please_select_plot_first')}`, ...AlertMesg[0] });
        } else {
            formData.append("user_id", farmerID);
            formData.append("loan_amount", saveData.loan_amount);
            formData.append("loan_purpose", saveData.loan_purpose);
            formData.append("existing_loan_amount", saveData.existing_loan_amount);
            formData.append("apx_annual_income", saveData.apx_annual_income);
            formData.append("farming_type", saveData.farming_type);
            formData.append("plot_id", checkValue);
            const response = await Addloan(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, dbLanTokUsr.userID, formData)
            if (response.status === 200) {
                Toast.show({ text: 'Data submitted successfully', ...AlertMesg[0] });
                setTimeout(() => {
                    setActiveBtn(2);
                }, 2000);

            }
        }
        setIsLoading(false);
    }
    return (
        <>
            <Root>
                {isLoading ? <View style={styles.loadingScreen}><LoadingScreen /></View> : null}
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        <InputTextForm label={t('farmer_name')} value={dbLanTokUsr.userName} />
                        <InputTextForm label={t('farmer_number')} value={dbLanTokUsr.userNumber} keyboardType={'numeric'} />
                        <InputTextForm label={t('adhar_no')} value={dbLanTokUsr.aadharNumber} />
                        <InputTextForm label={t('kcc_no')} value={dbLanTokUsr.kcc_number} />
                        <InputTextForm label={t('existing_loan_amount') + "(" + currency + ")"} keyboardType={'numeric'} color={'#FF0000'}
                            onChangeText={(text) => handledataAdd('existing_loan_amount', text)} value={saveData.existing_loan_amount} />
                        <InputTextForm label={t('loan_required_in_rupees') + "(" + currency + ")"} keyboardType={'numeric'} color={'#FF0000'}
                            onChangeText={(text) => handledataAdd('loan_amount', text)} value={saveData.loan_amount} />
                        <InputTextForm label={t('annual_income') + "(" + currency + ")"} keyboardType={'numeric'} color={'#FF0000'}
                            onChangeText={(text) => handledataAdd('apx_annual_income', text)} value={saveData.apx_annual_income} />
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
                                                isChecked={isChecked[index]}
                                                title={label}
                                                onCheckBox={() => handlePlot(value, label, index)}
                                            />
                                        </View>
                                    )
                                })
                            }
                        </View>
                        <View style={styles.plotContainer}>
                            {
                                nameVarityStartEnd.map((data, index) => {
                                    return (
                                        <View key={index} style={styles.plotContainerItem}>
                                            <View>
                                                <Text style={styles.plotText}>{t('addcrop_cropname')}</Text>
                                                <Text style={styles.plotText}>{t('addcrop_cropvariety')}</Text>
                                                <Text style={styles.plotText}>{t('showing_date')}</Text>
                                                <Text style={styles.plotText}>{t('harvesting_date_auto_calculated')}</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.plotText}>: {data.name}</Text>
                                                <Text style={styles.plotText}>: {data.varity}</Text>
                                                <Text style={styles.plotText}>: {data.cycleStarts}</Text>
                                                <Text style={styles.plotText}>: {data.cycleEnd.slice(0, 10)}</Text>
                                            </View>
                                        </View>
                                    )
                                })
                            }
                        </View>
                        <View style={styles.idcontainer}>
                            <Text style={styles.text}>{t('identity_proof')}</Text>
                            <View style={styles.idItemContainer}>
                                {identityProof && identityProof.map((data, index) => {
                                    return (
                                        <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("IdentityProof", index)} key={index} >
                                            <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                            <Text style={styles.text}>{data.name == "" ? "" : data.name}{data.name}</Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </View>
                        <View style={styles.idcontainer}>
                            <Text style={styles.text}>{t('address_proof')}</Text>
                            <View style={styles.idItemContainer}>
                                {
                                    addressProof.map((data, index) => {
                                        return (
                                            <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("AddressProof", index)} key={index}>
                                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                                <Text style={styles.text}>{data.name == "" ? "" : data.name}</Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }

                            </View>
                        </View>
                        <View style={styles.idcontainer}>
                            <Text style={styles.text}>{t('land_records')}</Text>
                            <View style={styles.idItemContainer}>
                                {
                                    landProof && landProof.map((data, index) => {
                                        return (
                                            <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("LandProof", index)} key={index}>
                                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                                <Text style={styles.text}>{data.name == "" ? "" : data.name}</Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <ButtonForm label={t('submit')} onPress={handleSave} />
            </Root>
        </>
    )
}

export default FarmerLoanRequest;

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
        marginVertical: 4
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
        bottom: '100%',
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
        color: '#000',
        marginBottom: 10,
        color: '#FF0000'
    },
    text: {
        color: '#000',
        fontFamily: 'Poppins-Regular'
    },
    loadingScreen: {
        position: 'absolute',
        top: "60%",
        zIndex: 999,
        left: '45%'
    },

})