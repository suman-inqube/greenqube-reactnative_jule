import { StyleSheet, Text, View, ScrollView, SafeAreaView, FlatList, TouchableOpacity, Dimensions, Keyboard } from 'react-native'
import React, { useEffect, useState, useContext } from 'react'
import { loanRouteFarmerListAPI } from '../Loan/LoanAPI_copy';
import { problemPlotAgainstFarmerAPI, problemProduceAgainstPlotAPI, InsuranceAddAPI } from '../../../config/apiHere';
import CheckBoxComp from '../../Common/CheckBoxComp';
import { userCreateContext } from '../../Context/usersCreateContext';
const RequestForInsurance = ({ setActiveBtn }) => {
    //GQR-67
    const { t, loginUser_data, InputTextForm, ButtonForm, AlertMesg, Root, Toast } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    //GQR-67
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
    // const [pickPlot, setPickPlot] = useState([])
    const onPageLoad = async () => {
        setIsLoading(true);
        const response = await loanRouteFarmerListAPI(dbname, lan_id, token, user_id)
        if (response?.status == 200) {
            setIsLoading(false);
            setFarmerList(response.data.data.rows)
        }
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    const handleSearch = (text) => {
        setSearchFarmerName(text);
        setSearchFarmerPhone('');
        setNameVarityStartEnd([]);
        setIsChecked([]);
        setPlotSite([]);
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
        const plotSiteApi = await problemPlotAgainstFarmerAPI(dbname, lan_id, token, item.user_id);
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
    }
    const handlePlotCheck = async (value, label, index) => {
        const response = await problemProduceAgainstPlotAPI(dbname, lan_id, farmerID, value);
        const isCheckedValue = [...isChecked];
        if (isChecked[index].isCheck == "") {
            isCheckedValue[index] = { isCheck: value }
            setIsChecked(isCheckedValue);
            if (response.status === 200) {
                const { land_rel_id, crop_name, crop_variety, sowing_date, harvesting_date, farmer_production_system } = response.data.data;
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
    const handleSave = async () => {
        Keyboard.dismiss();
        const checkValue = [];
        Object.values(isChecked).map((data, index) => {
            if (data.isCheck != "") { checkValue.push(data.isCheck) }
        })
        if (searchFarmerName == "") {
            Toast.show({ text: `${t('please_enter_farmer_name')}`, ...AlertMesg[0] });
        } else if (checkValue.length < 1) {
            Toast.show({ text: `${t('please_select_plot')}`, ...AlertMesg[0] });
        } else {
            const formData = new FormData();
            formData.append("user_id", farmerData.user_id);
            formData.append("plot_id", checkValue);
            const addInsurance = await InsuranceAddAPI(dbname, lan_id, token, user_id, formData);
            if (addInsurance.status === 200) {
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
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        <InputTextForm label={t('farmer_name')} value={searchFarmerName} onChangeText={(farmerName) => handleSearch(farmerName)} />
                        <InputTextForm label={t('farmer_number')} value={farmerData.contactNumber} keyboardType={'numeric'} editable={false} />
                        <InputTextForm label={t('adhar_no')} value={farmerData.aadhar_number} editable={false} />
                        <InputTextForm label={t('kcc_no')} value={farmerData.kcc_number} editable={false} />
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
                    </View>
                </ScrollView>
                <ButtonForm label={t('submit')} onPress={handleSave} />
            </Root>
        </>
    )
}

export default RequestForInsurance

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '3%',
        marginTop: 20,
        marginBottom: 50
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
        // bottom: '100%',
        top: 100,
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

    plotText: {
        color: '#000',
        fontFamily: "Poppins-Regular",
        fontSize: 14
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
    }
})