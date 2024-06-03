import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Keyboard, FlatList, Dimensions, BackHandler } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import InputTextForm from '../../Common/InputTextForm';
import DatePickerComp from '../../Common/DatePickerComp';
import RadioForm from '../../Common/RadioForm';
import TakePhoto from '../Activity/TakePhoto';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ButtonForm from '../../Common/ButtonForm';
import { getItem } from '../../../config/getDataFromStorage';
import { loanRouteFarmerListAPI, produceAgainstPlotAPI, FarmerDailysalesreportAdd } from '../../../config/apiHere';
import { Root, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import DropdownForm from '../../Common/DropdownForm';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
const FarmerReport = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [newDate, setnewDate] = useState(new Date());
    const [openNewDate, setopenNewDate] = useState(false);
    const [date, setDate] = useState("");
    const [selectedImage, setSelectedImage] = useState({
        firstItem: "",
        secondItem: "",
        thirdItem: "",
    });
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: '',
        languageID: '',
        token: '',
        userID: ''
    });
    const [loanFarmerList, setloanFarmerList] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [plotAll, setplotAll] = useState([]);
    const [myphoto, setmyPhoto] = useState([]);
    const [saveData, setSaveData] = useState({
        plot_id: '',
        type: "farmer_sales_report",
        status: 1,
        comment: "",
    });
    const [nameVarityStartEnd, setNameVarityStartEnd] = useState({
        name: "",
        varity: "",
        cycleStarts: "",
        cycleEnd: "",
    });
    const [farmerID, setfarmerID] = useState("");
    const handleDatePicker = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setDate(effective_date)
    }
    const openImagePicker = (item) => {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
            maxHeight: 200,
            maxWidth: 200,
        };
        launchCamera(options, response => {
            if (response.didCancel) {
                console.log('User cancelled camera');
            } else if (response.error) {
                console.log('Camera Error: ', response.error);
            } else {
                let imageUri = response.uri || response.assets?.[0]?.uri;
                setmyPhoto([...myphoto, { uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName }]);
                setSelectedImage({ ...selectedImage, [item]: imageUri });
            }
        });
    };
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
            if (response.status === 200) {
                setIsLoading(false);
                setloanFarmerList(response.data.data.rows)
            }
        }
    };
    useEffect(() => {
        onPageLoad();
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow', () => { setKeyboardVisible(true); }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide', () => { setKeyboardVisible(false); }
        );
        return () => { keyboardDidHideListener.remove(); keyboardDidShowListener.remove(); };
    }, []);
    const handleSearch = (text) => {
        setSearchFarmerName(text);
        if (loanFarmerList.length !== 0) {
            const result = loanFarmerList.filter(item =>
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
        const dataArray = [];
        item.agri_land_user_rels.forEach(element => {
            dataArray.push({
                value: element.rel_id,
                label: element.plot_no
            });
        });
        setplotAll(dataArray)
        setSearchFarmerName(item.userName);
        setSearchResults([]);
        setfarmerID(item.user_id)
        setSearchResultsList(false);
        setNameVarityStartEnd({
            ...nameVarityStartEnd,
            name: "",
            name_fid: "",
            varity: "",
            varity_fid: "",
        });
        setSaveData({
            ...saveData,
            plot_id: '',
            type: "farmer_sales_report",
            status: 1,
            comment: "",
        });
        setDate("")
    }
    const handlePlot = async (relId) => {
        setSaveData({ ...saveData, ['plot_id']: relId.value })
        const response = await produceAgainstPlotAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmerID, relId.value);
        if (response) {
            setNameVarityStartEnd({
                ...nameVarityStartEnd,
                name: response.data.data.rows[0].crop_name.name,
                name_fid: response.data.data.rows[0].crop_name.fid,
                varity: response.data.data.rows[0].crop_variety.name,
                varity_fid: response.data.data.rows[0].crop_variety.fid,
            })
        }
    }
    const validateForm = (item, msg) => {
        if (item == "") { Toast.show({ text: msg, ...AlertMesg[0] }); return false; } else { return true; }
    }
    const handleSave = async () => {
        if (farmerID == "") {
            validateForm(farmerID, 'Select Farmer First');
        } else if (date == "") {
            validateForm(date, `${t('please_date_first')}`);
        } else if (saveData.plot_id == "") {
            validateForm(saveData.plot_id, `${t('please_select_plot_first')}`);
        } else {
            const formData = new FormData();
            formData.append("user_fid", farmerID);
            formData.append("type", saveData.type);
            formData.append("status", saveData.status);
            formData.append("sr_date", date);
            formData.append("comment", saveData.comment);
            formData.append("products", JSON.stringify([{
                "prod_fid": nameVarityStartEnd.name_fid,
                "prod_vfid": nameVarityStartEnd.varity_fid
            }]));
            myphoto.forEach((photo) => {
                formData.append("photo", photo);
            });
            const response = await FarmerDailysalesreportAdd(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, dbLanTokUsr.userID, formData);
            if (response.status === 200) {
                validateForm("", `${t('your_request_submitted')}`);
                setTimeout(() => {
                    navigation.navigate('DailySalesReport');
                }, 1000)
            }
        }
    }
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate('DailySalesReport');
                return true;
            };
            BackHandler.addEventListener(
                'hardwareBackPress', onBackPress
            );
            return () =>
                BackHandler.removeEventListener(
                    'hardwareBackPress', onBackPress
                );
        }, [])
    );
    const HandlerGoBack = () => {
        navigation.navigate('DailySalesReport');
    }
    return (
        <>
            <Root>
                {openNewDate && <DatePickerComp
                    openDate={openNewDate}
                    newDate={newDate}
                    setOpenDate={setopenNewDate}
                    handleDatePicker={handleDatePicker} />
                }
                <CustomHeader path='DailySalesReport' HandlerGoBack={HandlerGoBack} />
                <FormsTitle title={t('farmer_report')} />
                {
                    searchResultsList && searchResultsList ?
                        <View style={isKeyboardVisible ? styles.flatContainerLengthUp : styles.flatContainer}>
                            <FlatList
                                style={searchResults.length > 8 ? styles.flatlistHeight : searchResults.length > 5 ? { height: Dimensions.get('window').height / 5, } : ""}
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
                <ScrollView>
                    <View style={styles.formComtainer} >
                        <InputTextForm label={t('choose_farmer')} value={searchFarmerName} onChangeText={(farmerName) => handleSearch(farmerName)} />
                        <TouchableOpacity onPress={() => setopenNewDate(true)} activeOpacity={9}>
                            <Text style={{ marginBottom: 5, color: '#000' }}>{t('date')}</Text>
                            <View style={styles.calenderContainer} >
                                <Text style={{ color: '#000' }}>{date}</Text>
                                <Image
                                    source={require('../../Common/images/calendar.png')}
                                    style={{ width: 20, height: 20 }}
                                />
                            </View>
                        </TouchableOpacity>
                        <DropdownForm label={t('please_select_plot')} data={plotAll}
                            onChange={relId => handlePlot(relId)} val={saveData.plot_id}
                        />
                        <InputTextForm label={t('produce_name')} value={nameVarityStartEnd.name} />
                        <InputTextForm label={t('prodece_vareity')} value={nameVarityStartEnd.varity} />
                        <InputTextForm label={t('comments')} onChangeText={(text) => setSaveData({ ...saveData, ['comment']: text })} />
                        <TakePhoto title={t('take_a_photo_optional')} openImagePicker={openImagePicker} selectedImage={selectedImage} />
                    </View>
                </ScrollView>
                <ButtonForm label={t('submit')} onPress={() => handleSave()} />
            </Root>
        </>
    )
}

export default FarmerReport;
const styles = StyleSheet.create({
    formComtainer: {
        marginHorizontal: '3%',
        marginBottom: 60
    },
    calenderContainer: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 2,
        height: 45,
        borderWidth: 1,
        borderColor: '#f4eded'
    },
    title: {
        color: '#000',
        marginVertical: 10,
        fontFamily: 'Poppins-Regular'

    },
    flatContainer: {
        backgroundColor: '#ffffff',
        position: 'absolute',
        zIndex: 999,
        left: 0,
        // top:30,
        marginTop: 60,
        bottom: '60%',
        marginHorizontal: '5%',
        width: '90%',
        elevation: 10,
        borderRadius: 10,
        padding: 10
    },
    flatContainerLengthUp: {
        backgroundColor: '#ffffff',
        position: 'absolute',
        zIndex: 999,
        left: 0,
        // top: 30,
        bottom: '40%',
        marginHorizontal: '5%',
        width: '90%',
        elevation: 10,
        borderRadius: 10,
        padding: 10
    },
    flatlisttitle: {
        color: '#000',
        marginVertical: 8,
        fontFamily: 'Poppins-Regular'
    },
    flatlistHeight: {
        height: Dimensions.get('window').height / 3,
    },
})