import { StyleSheet, Text, View, ScrollView, SafeAreaView, FlatList, TouchableOpacity, Dimensions, Keyboard } from 'react-native'
import React, { useEffect, useState, useContext } from 'react'
import { problemPlotAgainstFarmerAPI, problemProduceAgainstPlotAPI, InsuranceAddAPI } from '../../../config/apiHere';
import CheckBoxComp from '../../Common/CheckBoxComp';
import { userCreateContext } from '../../Context/usersCreateContext';
const RequestForInsurance = ({ setActiveBtn }) => {
    //GQR-67
    const { loginUser_data, ButtonForm, InputTextForm, Root, Toast, AlertMesg, t } = useContext(userCreateContext);
    const { dbname, lan_id, token, owner, user_id, userName, contactNumber, aadhar_number, kcc_number } = loginUser_data;
    //GQR-67
    const [farmerID, setfarmerID] = useState('');
    const [plotSite, setPlotSite] = useState([]);
    const [isChecked, setIsChecked] = useState({});
    const [nameVarityStartEnd, setNameVarityStartEnd] = useState([]);
    const [pickPlot, setPickPlot] = useState([])
    const onPageLoad = async () => {
        setfarmerID(user_id);
        const plotSiteApi = await problemPlotAgainstFarmerAPI(dbname, lan_id, token, user_id);
        if (plotSiteApi?.status == 200) {
            setPlotSite(plotSiteApi?.data?.data);
        }
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    const handlePlot = async (value, label, index) => {
        if (isChecked[index] === value) {
            setIsChecked({ ...isChecked, [index]: "" });
            const values = [...nameVarityStartEnd];
            const plotValues = [...pickPlot];
            for (let i = 0; i < plotValues.length; i++) {
                if (plotValues[i].plot_id === value) {
                    console.log(i);
                    plotValues.splice(i, 1);
                }
            }
            setPickPlot(plotValues)
            for (let i = 0; i < values.length; i++) {
                if (values[i].plot_id === value) {
                    console.log(i);
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
            const response = await problemProduceAgainstPlotAPI(dbname, lan_id, farmerID, value);
            if (response) {
                setNameVarityStartEnd([...nameVarityStartEnd, {
                    plot_no: response.data.data.rows[0].land_info.plot_no,
                    plot_id: response.data.data.rows[0].land_rel_id,
                    name: response.data.data.rows[0].crop_name.name,
                    varity: response.data.data.rows[0].crop_variety.name,
                    cycleStarts: response.data.data.rows[0].sowing_date,
                    cycleEnd: response.data.data.rows[0].harvesting_date,
                    production_process: response.data.data.rows[0].farmer_production_system.name
                }])
            }
        }
    }
    const handleSave = async () => {
        Keyboard.dismiss();
        const checkValue = [];
        Object.values(isChecked).map((data, index) => {
            if (data != "") {
                checkValue.push(data)
            }
        })
        if (checkValue.length == 0) {
            Toast.show({ text: 'Please select plot', ...AlertMesg[0] });
        } else {
            const formData = new FormData();
            formData.append("user_id", user_id);
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
                <ScrollView>
                    <View style={styles.container}>
                        <InputTextForm label={t('farmer_name')} value={userName} />
                        <InputTextForm label={t('farmer_number')} value={contactNumber} />
                        <InputTextForm label={t('adhar_no')} value={aadhar_number} />
                        <InputTextForm label={t('kcc_no')} value={kcc_number} />
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
                                                    <Text style={styles.plotText}>{t('addcrop_cropname')}</Text>
                                                    <Text style={styles.plotText}>{t('addcrop_cropvariety')}</Text>
                                                    <Text style={styles.plotText}>{t('showing_date')}</Text>
                                                    <Text style={styles.plotText}>{t('harvesting_date_auto_calculated')}</Text>
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
        color: '#FF0000',
        marginBottom: 10
    }
})