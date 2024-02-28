import {
    Image, ScrollView, StyleSheet, Text, View, TouchableOpacity, FlatList, SafeAreaView,
    Dimensions, Keyboard, BackHandler
} from 'react-native'
import React, { useCallback, useState, useEffect } from 'react'
import InputTextForm from '../../Common/InputTextForm';
import DropdownForm from '../../Common/DropdownForm';
import ButtonFormBottom from '../../Common/ButtonFormBottom';
import CheckBoxComp from '../../Common/CheckBoxComp';
import DocumentPicker, { types } from 'react-native-document-picker';
import { getItem } from '../../../config/getDataFromStorage';
import { Root, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import {
    problemPlotAgainstFarmerAPI,
    loanPurposeAPI,
    loanRouteFarmerListAPI,
    problemProduceAgainstPlotAPI,
    Addloan
} from './LoanAPI';
import { useNavigation } from '@react-navigation/native';
import LoadingScreen from '../../Common/LoadingScreen';
const LoanRequest = ({ setActiveBtn }) => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [loanFarmerList, setloanFarmerList] = useState();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: '',
        languageID: '',
        token: '',
        userID: ''
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
            if (result) {
                setSearchResults(result);
            }
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
        // const plotSiteApi = await plotAgainstFarmerAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, currentfarmerId);
        const plotSiteApi = await problemPlotAgainstFarmerAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, currentfarmerId);
        // console.log(plotSiteApi.data.data)
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
        if (response) {
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
        if (isChecked[index] === label) {
            setIsChecked({ ...isChecked, [index]: "" });
            const values = [...nameVarityStartEnd];
            const plotValues = [...pickPlot];
            plotValues.splice(index, 1);
            values.splice(index, 1);
            setNameVarityStartEnd(values);
        } else {
            const plotArray = [];
            plotArray.push({
                value: value,
                label: label
            });
            setPickPlot(plotArray)
            setIsChecked({ ...isChecked, [index]: label });
            const response = await problemProduceAgainstPlotAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmerID, value);
            if (response) {
                setNameVarityStartEnd([...nameVarityStartEnd, {
                    plot_no: response.data.data.rows[0].crop_name.plot_no,
                    name: response.data.data.rows[0].crop_name.name,
                    varity: response.data.data.rows[0].crop_variety.name,
                    cycleStarts: response.data.data.rows[0].crop_cycl_start_date,
                    cycleEnd: response.data.data.rows[0].harvesting_date,
                    production_process: response.data.data.rows[0].farmer_production_system.name,
                }])
            }
        }
    }
    const onPageLoad = async () => {
        setIsLoading(true)
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const userID = loginUser_data.user_id;
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageID: languageID,
                token: token,
                userID: userID
            })
            const response = await loanRouteFarmerListAPI(dbName, languageID, token, userID)
            if (response) {
                setIsLoading(false);
                const dataArray = [];
                response.data.data.rows.forEach(element => {
                    dataArray.push({
                        value: element.user_id,
                        label: element.userName,
                        phone: element.contactNumber,
                    });
                });
                setloanFarmerList(dataArray)
            }
        }
    };
    // useEffect(() => {

    //     function handleBackButton() {
    //         navigation.navigate('Dashboard');
    //         return true;
    //     }
    //     const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    //     return () => backHandler.remove();
    // }, [navigation]);
    useEffect(() => {
        onPageLoad();
    }, []);
    const handledataAdd = (name, text) => {
        setSaveData({ ...saveData, [name]: text })
    }
    const handleSave = async () => {
        Keyboard.dismiss();
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
            Toast.show({ text: 'Please enter farmer name', ...AlertMesg[0] });
        } else if (saveData.loan_amount == "") {
            Toast.show({ text: 'Please enter loan amount', ...AlertMesg[0] });
        } else if (saveData.apx_annual_income == "") {
            Toast.show({ text: 'Please enter annual income', ...AlertMesg[0] });
        } else if (saveData.existing_loan_amount == "") {
            Toast.show({ text: 'Please enter existing loan amount', ...AlertMesg[0] });
        } else if (saveData.loan_purpose == "") {
            Toast.show({ text: 'Please select loan purpose', ...AlertMesg[0] });
        } else if (pickPlot.length < 1) {
            Toast.show({ text: 'Please select plot', ...AlertMesg[0] });
        } else {
            formData.append("user_id", farmerID);
            formData.append("loan_amount", saveData.loan_amount);
            formData.append("loan_purpose", saveData.loan_purpose);
            formData.append("existing_loan_amount", saveData.existing_loan_amount);
            formData.append("apx_annual_income", saveData.apx_annual_income);
            formData.append("farming_type", saveData.farming_type);
            formData.append("plot_id", pickPlot[0].value);
            const response = await Addloan(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, dbLanTokUsr.userID, formData)
            if (response.status === 200) {
                setActiveBtn(2);
            }
        }
    }
    return (
        <>
            <Root>
                <SafeAreaView>
                    {
                        searchResultsList && searchResultsList ?
                            <View style={styles.flatContainer}>
                                <FlatList
                                    style={searchResults.length > 8 ? styles.flatlistHeight : ""}
                                    data={searchResults}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity onPress={() => handleResultSelect(item.label, item.value, item.phone)} style={styles.flatlistitem}>
                                            <Text style={styles.flatlisttitle}>{item.label}</Text>
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(item, index) => index}
                                />
                            </View> : ""

                    }
                </SafeAreaView>
                <ScrollView >
                    <View style={styles.container}>
                        <InputTextForm label={'Farmer/Producer Name'}
                            value={searchFarmerName} onChangeText={(farmerName) => handleSearch(farmerName)} />
                        <InputTextForm label={'Phone Number'} value={searchFarmerPhone} keyboardType={'numeric'} />
                        <InputTextForm label={'National Identity No.(Aadhaar)'} keyboardType={'numeric'}
                            onChangeText={(text) => handledataAdd('identityNo', text)} value={saveData.identityNo} />
                        <InputTextForm label={'Farmer/Producer Loan No.(Existing)'}
                            onChangeText={(text) => handledataAdd('farmerProducer', text)} value={saveData.farmerProducer} />
                        <InputTextForm label={'Existing Loan Amount (Rs.)'} keyboardType={'numeric'}
                            onChangeText={(text) => handledataAdd('existing_loan_amount', text)} value={saveData.existing_loan_amount} />
                        <InputTextForm label={'New Loan Required (Rs.)'} keyboardType={'numeric'}
                            onChangeText={(text) => handledataAdd('loan_amount', text)} value={saveData.loan_amount} />
                        <InputTextForm label={'Expected Annual Income (Rs.)'} keyboardType={'numeric'}
                            onChangeText={(text) => handledataAdd('apx_annual_income', text)} value={saveData.apx_annual_income} />
                        <DropdownForm label="Loan Purpose" data={loanPurpose} onChange={(text) => handledataAdd('loan_purpose', text.value)} />
                        <Text style={styles.plotTitle}>Plot/Site</Text>
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
                                                <Text style={styles.plotText}>Producer Name</Text>
                                                <Text style={styles.plotText}>Producer variety</Text>
                                                <Text style={styles.plotText}>Cycle Starts</Text>
                                                <Text style={styles.plotText}>Cycle End</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.plotText}>:{data.name}</Text>
                                                <Text style={styles.plotText}>:{data.varity}</Text>
                                                <Text style={styles.plotText}>:{data.cycleStarts}</Text>
                                                <Text style={styles.plotText}>:{data.cycleEnd}</Text>
                                            </View>
                                        </View>
                                    )
                                })
                            }
                        </View>
                        <View style={styles.idcontainer}>
                            <Text>Attach Identity Proof</Text>
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
                            <Text>Attach Address Proof</Text>
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
                            <Text>Attach Land Proof</Text>
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
                <ButtonFormBottom label={'Submit'} onPress={handleSave} />
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
        marginBottom: 10
    }

})