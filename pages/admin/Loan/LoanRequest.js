import {
    Image, ScrollView, StyleSheet, Text, View,
    TouchableOpacity, FlatList, Keyboard, SafeAreaView, Dimensions
} from 'react-native'
import React, { useCallback, useState, useEffect } from 'react'
import InputTextForm from '../../Common/InputTextForm';
import DropdownForm from '../../Common/DropdownForm';
import ButtonFormBottom from '../../Common/ButtonFormBottom';
import CheckBoxComp from '../../Common/CheckBoxComp';
import DocumentPicker, { types } from 'react-native-document-picker';
import { getItem } from '../../../config/getDataFromStorage';
import {
    activityInfoAPI,
    activitySaveAPI,
    activityTypeAPI,
    farmerByNameAPI,
    problemPlotAgainstFarmerAPI,
    produceAgainstPlotAPI,
    productionStageAPI,
    loanPurposeAPI,
    plotAgainstFarmerAPI,
    loanRouteFarmerListAPI,
    problemProduceAgainstPlotAPI
} from '../../../config/apiHere';
const LoanRequest = () => {
    const [activeBtn, setActiveBtn] = useState(1);
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
    const [isChecked, setIsChecked] = useState({});
    const [nameVarityStartEnd, setNameVarityStartEnd] = useState([]);
    const [identityProof, setIdentityProof] = useState({
        file_path: "",
        file_name: "",
        term_type: "loan_identity"
    });
    const [addressProof, setAddressProof] = useState([{
        file_path: "",
        file_name: "",
        term_type: "loan_address"
    }]);
    const handleDocumentSelection = useCallback(async (data) => {
        try {
            const response = await DocumentPicker.pick({
                presentationStyle: 'fullScreen',
                type: [types.pdf, types.images]
            });
            if (data == "IdentityProof") {
                // setIdentityProof({ identityProof: "", identityProofName: response[0].name });
                // setIdentityProof({ identityProof: "", identityProofName: response[0].name });
            } else if (data == "AddressProof") {

            } else {

            }
            // uri
            console.log(response[0].name)
        } catch (err) {
            //   console.warn(err);
        }
    }, []);

    const handleSearch = (text) => {
        setSearchFarmerName(text);
        setSearchFarmerPhone('');
        const result = loanFarmerList.filter(item =>
            item.label.toLowerCase().includes(text.toLowerCase())
        );
        if (text == "") {
            setSearchResultsList(false);
        } else {
            setSearchResultsList(true);
        }
        if (result) {
            setSearchResults(result);
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
            values.splice(index, 1);
            setNameVarityStartEnd(values);
        } else {
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
        // requestLivePermission();
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
    useEffect(() => {
        onPageLoad();
    }, []);

    return (
        <>
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
                    <InputTextForm label={'Phone Number'} value={searchFarmerPhone} />
                    <InputTextForm label={'National Identity No.(Aadhaar)'} />
                    <InputTextForm label={'Farmer/Producer Loan No.(Existing)'} />
                    <InputTextForm label={'Existing Loan Amount (Rs.)'} />
                    <InputTextForm label={'New Loan Required (Rs.)'} />
                    <InputTextForm label={'Expected Annual Income (Rs.)'} />
                    <DropdownForm label="Loan Purpose" data={loanPurpose} />
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
                            <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("IdentityProof")} >
                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                <Text>Name</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.idcontainer}>
                        <Text>Attach Address Proof</Text>
                        <View style={styles.idItemContainer}>
                            <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("AddressProof")}>
                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                <Text>Name</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("AddressProof")}>
                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                <Text>Name</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("AddressProof")}>
                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                <Text>Name</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("AddressProof")}>
                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                <Text>Name</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("AddressProof")}>
                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                <Text>Name</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.idcontainer}>
                        <Text>Attach Land Proof</Text>
                        <View style={styles.idItemContainer}>
                            <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("LandProof")}>
                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                <Text>Name</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("LandProof")}>
                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                <Text>Name</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("LandProof")}>
                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                <Text>Name</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("LandProof")}>
                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                <Text>Name</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.idItem} onPress={() => handleDocumentSelection("LandProof")}>
                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                <Text>Name</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <ButtonFormBottom label={'Submit'} />
        </>
    )
}

export default LoanRequest

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '5%',
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
        zIndex: 999
    },
    flatlisttitle: {
        color: '#000',
        marginVertical: 6
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
        elevation: 5
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
    }

})