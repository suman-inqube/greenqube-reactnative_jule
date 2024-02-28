import { StyleSheet, Text, View, ScrollView, SafeAreaView, FlatList, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import InputTextForm from '../../Common/InputTextForm';
import DropdownForm from '../../Common/DropdownForm1';
import ButtonForm from '../../Common/ButtonForm';
import { loanRouteFarmerListAPI } from '../Loan/LoanAPI';
import { getItem } from '../../../config/getDataFromStorage';
import { Root, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import { problemPlotAgainstFarmerAPI, problemProduceAgainstPlotAPI, InsuranceAddAPI } from '../../../config/apiHere';
import CheckBoxComp from '../../Common/CheckBoxComp';
const RequestForInsurance = ({ setActiveBtn }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [farmerList, setFarmerList] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
    const [selectedName, setSelectedName] = useState('');
    const [farmerID, setfarmerID] = useState('');
    const [farmerData, setFarmerData] = useState({});
    const [plotSite, setPlotSite] = useState([]);
    const [isChecked, setIsChecked] = useState({});
    const [nameVarityStartEnd, setNameVarityStartEnd] = useState([]);
    const [pickPlot, setPickPlot] = useState([])
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: '',
        languageID: '',
        token: '',
        userID: ''
    });
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
                setFarmerList(response.data.data.rows)
            }
        }
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    const handleSearch = (text) => {
        setSearchFarmerName(text);
        setSearchFarmerPhone('');
        if (farmerList.length !== 0) {
            const result = farmerList.filter(item =>
                item.userName.toLowerCase().includes(text.toLowerCase())
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
    const handleResultSelect = async (item) => {
        setSearchFarmerPhone(item.contactNumber);
        setSelectedName(item.userName);
        setSearchFarmerName(item.userName);
        setSearchResults([]);
        setfarmerID(item.user_id)
        setSearchResultsList(false);
        setFarmerData(item);
        const plotSiteApi = await problemPlotAgainstFarmerAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, item.user_id);
        if (plotSiteApi) {
            setPlotSite(plotSiteApi.data.data)
        }
    }
    const handlePlot = async (value, label, index) => {
        if (isChecked[index] === value) {
            setIsChecked({ ...isChecked, [index]: "" });
            const values = [...nameVarityStartEnd];
            const plotValues = [...pickPlot];
            plotValues.splice(index, 1);
            setPickPlot(plotValues)
            values.splice(index, 1);
            setNameVarityStartEnd(values);
        } else {
            const plotArray = [];
            plotArray.push({
                value: value,
                label: label
            });
            setPickPlot(plotArray)
            setIsChecked({ ...isChecked, [index]: value });
            const response = await problemProduceAgainstPlotAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmerData.user_id, value);
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
    const handleSave = async () => {
        const checkValue = [];
        Object.values(isChecked).map((data, index) => {
            if (data != "") { checkValue.push(data) }
        })
        if (searchFarmerName == "") {
            Toast.show({ text: 'Please enter farmer name', ...AlertMesg[0] });
        } else if (checkValue.length == 0) {
            Toast.show({ text: 'Please select plot', ...AlertMesg[0] });
        } else {
            const formData = new FormData();
            formData.append("user_id", farmerData.user_id);
            formData.append("plot_id", checkValue[0]);
            const addInsurance = await InsuranceAddAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, dbLanTokUsr.userID, formData);
            if (addInsurance.status) {
                setActiveBtn(2)
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
                                        <TouchableOpacity onPress={() => handleResultSelect(item)} style={styles.flatlistitem}>
                                            <Text style={styles.flatlisttitle}>{item.userName}</Text>
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(item, index) => index}
                                />
                            </View> : ""

                    }
                </SafeAreaView>
                <ScrollView>
                    <View style={styles.container}>
                        <InputTextForm label={'Farmer/Producer Name'} value={searchFarmerName} onChangeText={(farmerName) => handleSearch(farmerName)} />
                        <InputTextForm label={'Phone Number'} value={farmerData.contactNumber} keyboardType={'numeric'} editable={false} />
                        <InputTextForm label={'National Identity No (Aadhaar)'} value={farmerData.aadhar_number} editable={false} />
                        <InputTextForm label={'Farmer/Producer No.(Existing)'} value={farmerData.kcc_number} editable={false} />
                        <Text style={styles.plotTitle}>Plot/Site</Text>
                        <View style={styles.PlotSiteList}>
                            {
                                plotSite && plotSite.map((data, index) => {
                                    return (
                                        <View key={index}>
                                            <CheckBoxComp
                                                arrayKey={index}
                                                isChecked={isChecked[index]}
                                                title={data.plot_no}
                                                onCheckBox={() => handlePlot(data.rel_id, data.plot_no, index)}
                                            />
                                        </View>
                                    )
                                })
                            }
                        </View>
                        <View style={styles.plotContainer}>
                            {
                                pickPlot.length != 0 ?
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
                                                    <Text style={styles.plotText}>:{data.cycleEnd.slice(0, 10)}</Text>
                                                </View>
                                            </View>
                                        )
                                    }) : ""
                            }
                        </View>
                    </View>
                </ScrollView>

                <ButtonForm label="Submit" onPress={handleSave} />
            </Root>
        </>
    )
}

export default RequestForInsurance

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '3%',
        marginTop: 20
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
    flatlistitem: {
    },
    flatlisttitle: {
        color: '#000',
        marginVertical: 8,
        fontSize: 16
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
    PlotSiteList: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 18,
        elevation: 1
    },
    plotTitle: {
        color: '#000',
        marginBottom: 10
    }
})