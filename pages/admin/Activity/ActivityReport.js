import {
    StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, FlatList, Dimensions,SafeAreaView
} from 'react-native'
import { PermissionsAndroid } from 'react-native'
import Geolocation from '@react-native-community/geolocation';
import React, { useEffect, useState } from 'react';
import InputTextForm from '../../Common/InputTextForm';
import DropdownForm from '../../Common/DropdownForm';
import RadioForm from '../../Common/RadioForm';
import { request, PERMISSIONS } from 'react-native-permissions';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import TakePhoto from './TakePhoto';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RecordComp from './RecordComp';
import ButtonForm from '../../Common/ButtonForm';
import DatePickerComp from '../../Common/DatePickerComp';
import { getItem } from '../../../config/getDataFromStorage';
import { activityInfoAPI, activitySaveAPI, activityTypeAPI, farmerByNameAPI, plotAgainstFarmerAPI, produceAgainstPlotAPI, productionStageAPI } from '../../../config/apiHere';
import axios from 'axios';
import MessageDialog from '../../Common/MessageDialog';
import CustomHeader from '../CustomHeader';

const ActivityReport = ({ navigation }) => {
    const [farmerData, setfarmerData] = useState();
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedName, setSelectedName] = useState('');
    const [farmerID, setfarmerID] = useState();
    const [plotAll, setplotAll] = useState([]);
    const [productionStageAll, setproductionStageAll] = useState([]);
    const [activityTypeAll, setactivityTypeAll] = useState([]);
    const [activityInfoAll, setActivityInfoAll] = useState([]);
    const [singlePlot, setsinglePlot] = useState({});
    const [CropType, setCropType] = useState();
    const [CropName, setCropName] = useState();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: '',
        languageID: '',
        token: '',
        userID: ''
    });
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [newToDate, setnewToDate] = useState(new Date());
    const [openFromDate, setOpenFromDate] = useState(false)
    const [openToDate, setOpenToDate] = useState(false)

    const [cycleStartDate, srtCycleStartDate] = useState(false);

    const [activityPreDate, setActivityPreDate] = useState(false);
    const [cycleDtartDate, setCycleStartDate] = useState("");
    const [activityInfoReadio, setactivityInfoReadio] = useState({
        activityPreFormDate: 'regular',
    });
    const [isActiveMenu, setisActiveMenu] = useState(false);
    const [activityPreFormDate, setActivityPreFormDate] = useState("");

    const [selectedImage, setSelectedImage] = useState({
        firstItem: "",
        secondItem: "",
        thirdItem: "",
    });



    const [selectedRecord, setSelectedRecord] = useState({
        firstItemRecord: "",
        secondItemRecord: "",
        thirdItemRecord: "",
    });

    const [saveData, setSaveData] = useState({
        act_title: "",
        type: "user_activity",
        act_desc: "",
        material_used: "",
        water_used: "",
        power_used: "",
        photo: [],
        audio: [],
        act_pattern: 'regular',
        user_id: '',
        plot_id: '',
        crop_name: '',
        crop_variety: '',
        cycle_start_date: '',
        growth_stage: '',
        act_perform_date: ''
    });


    const [myphoto, setmyPhoto] = useState(null);
    const [myphotoAll, setmyPhotoAll] = useState([]);

    const openImagePicker = (item) => {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
            maxHeight: 200,
            maxWidth: 200,
        };

        const addPhoto = (newPhoto) => {
            setmyPhotoAll([...myphotoAll, newPhoto]);
        };

        launchCamera(options, response => {
            if (response.didCancel) {
                console.log('User cancelled camera');
            } else if (response.error) {
                console.log('Camera Error: ', response.error);
            } else {
                let imageUri = response.uri || response.assets?.[0]?.uri;
                const newPhoto = { uri: imageUri, type: 'image/jpeg', name: imageUri }
                setmyPhoto({ uri: imageUri, type: 'image/jpeg', name: imageUri });
                setSelectedImage({ ...selectedImage, [item]: imageUri });

                addPhoto(newPhoto);


            }
        });



    };

    const audioRecorderPlayer = new AudioRecorderPlayer();

    const handleRecord = () => {
        console.warn("he");
    }

    const handleSearch = (text) => {
      
        setSearchFarmerName(text);
        setSearchFarmerPhone('');
        const result = farmerData.filter(item =>
            item.label.toLowerCase().includes(text.toLowerCase())
        );
        
        if (result) {
            setSearchResultsList(true)
            setSearchResults(result);
        }
    };

    const handleDatePicker = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        // console.log(x1[2] + '/' + x1[1] + '/' + x1[0]);
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setCycleStartDate(effective_date)
        // console.log(item);
    }

    const handleDatePicker2 = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        // console.log(x1[2] + '/' + x1[1] + '/' + x1[0]);
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setActivityPreFormDate(effective_date)
        setSaveData({ ...saveData, act_perform_date: effective_date })
        // console.log(item);
    }

    const handleResultSelect = async (name, currentfarmerId, phone) => {
        setSearchResultsList(false)
        // console.warn(name, currentfarmerId, phone);
        // console.warn(JSON.stringify(searchResults, null, 2));
        setSearchFarmerPhone(phone)
        setSelectedName(name);
        setSearchFarmerName(name);
        setSearchResults([]);
        setfarmerID(currentfarmerId)
        const response = await plotAgainstFarmerAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, currentfarmerId)
        if (response) {

            const dataArray = [];
            response.data.data.forEach(element => {
                dataArray.push({
                    value: element.rel_id,
                    label: element.plot_no
                });
            });
            setplotAll(dataArray)
            const activityType_res = await activityTypeAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, currentfarmerId)
            if (activityType_res) {

                // console.warn("activity:",activityType_res.data.data);
                const dataArray = [];
                activityType_res.data.data.rows.forEach(element => {
                    dataArray.push({
                        value: element.categoryId,
                        label: element.categoryName
                    });
                });
                setactivityTypeAll(dataArray)
            }

        }
    }


    const handlePlot = async (relId) => {
        // console.log("relid:", relId.value, "farmarid:", farmerID);
        // console.warn(dbLanTokUsr);
        const response = await produceAgainstPlotAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmerID, relId.value)
        if (response) {
            const dateString = response.data.data.rows[0].harvesting_date;
            const harvesting_date = new Date(dateString);
            const currentDate = new Date();
            if (harvesting_date > currentDate) {
                let cycle_start_date = response.data.data.rows[0].crop_cycl_start_date ? response.data.data.rows[0].crop_cycl_start_date : response.data.data.rows[0].sowing_date
                setCycleStartDate(cycle_start_date)
                setSaveData({
                    ...saveData,
                    user_id: farmerID,
                    plot_id: relId.value,
                    crop_name: response.data.data.rows[0].crop_name.fid,
                    crop_variety: response.data.data.rows[0].crop_variety.fid,
                    cycle_start_date: cycle_start_date
                })
                setsinglePlot(response.data.data.rows)
                // console.warn(response.data.data.rows[0].sowing_date);


                setCropType(response.data.data.rows[0].crop_type.fid)
                setCropName(response.data.data.rows[0].crop_name.fid)

                const productionStage_res = await productionStageAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, response.data.data.rows[0].crop_type_id, response.data.data.rows[0].crop_name_id)
                if (productionStage_res) {
                    // console.warn(JSON.stringify(productionStage_res.data.data.growth_stage,null,2));
                    // console.warn(JSON.stringify(response.data.data, null, 2));
                    const dataArray = [];
                    productionStage_res.data.data.growth_stage.forEach(element => {
                        dataArray.push({
                            value: element.growth_stage.fid,
                            label: element.growth_stage.name
                        });
                    });
                    setproductionStageAll(dataArray)
                }
            } else {
                MessageDialog({ title: 'Importent', message: 'Your previous crop has been harvested Please Add a Crop' })
                setSearchFarmerName('')
                setSearchFarmerPhone('')
                setplotAll([])
                navigation.navigate('Dashboard');
            }
        }
    }

    const validationData = () => {
        if (
            (saveData.plot_id)
        ) {
            return true;
        }
        else {
            MessageDialog({ title: 'Require', message: 'Please fill in all required fields with valid data.' })
            return;
        }

    }
    const handleSave = async () => {
        //    setSaveData({ ...saveData, photo: selectedImage })
        // return console.warn(JSON.stringify(myphotoAll, null, 2));



        //   return 
        // return;
        // const res = validationData()
        const formData = new FormData();

        formData.append("act_title", "");
        myphotoAll.forEach((photo) => {
            formData.append("photo", photo);
        });
        formData.append("type", "user_activity");
        formData.append("audio", saveData.audio);
        formData.append("latitude", saveData.latitude);
        formData.append("longitude", saveData.longitude);
        formData.append("user_id", saveData.user_id);
        formData.append("plot_id", saveData.plot_id);
        formData.append("crop_name", saveData.crop_name);
        formData.append("crop_variety", saveData.crop_variety);
        formData.append("cycle_start_date", saveData.cycle_start_date);
        formData.append("growth_stage", saveData.growth_stage);
        formData.append("act_perform_date", saveData.act_perform_date);
        formData.append("act_pattern", saveData.act_pattern);

        if (saveData.act_pattern === 'schedule') {
            formData.append("act_ref_type", saveData.act_ref_type);
            formData.append("act_to_date", saveData.act_to_date);
            formData.append("act_start_date", saveData.act_start_date);
            formData.append("act_ref", saveData.act_ref);
        }
        formData.append("act_desc", saveData.act_desc);
        formData.append("material_used", saveData.material_used);
        formData.append("water_used", saveData.water_used);
        formData.append("power_used", saveData.power_used);

        // return console.log(JSON.stringify(formData,null,2))
        try {
            const axiosHeaders = {
                headers: {
                    'information': `${dbLanTokUsr.dbName},${dbLanTokUsr.languageID},${saveData.user_id}`,
                    'Content-Type': 'multipart/form-data',
                    Authorization: `${dbLanTokUsr.token}`,
                },
            };
            // console.log(formData);
            // return;
            const database_res = await axios.post("http://142.93.208.31:4003/inputOutputRoute/addUserActivity", formData, axiosHeaders);
            // console.log(database_res);

            if (database_res) {
                MessageDialog({ title: 'Successful', message: "Successfull Data Submited" })
                // navigation.goBack();
                // window.location.href='activityList';
                navigation.navigate('activityList');
            }
        } catch (error) {
            console.log(JSON.stringify(error, null, 2));
            // MessageDialog({ title: 'Error', message: error.response})
            return;
        }



    }

    const handleActivityPattern = (item) => {
        setactivityInfoReadio({ ...activityInfoReadio, activityPreFormDate: item })
        setSaveData({ ...saveData, act_pattern: item })
        if (item === 'schedule') {
            setisActiveMenu(true)
        }
        else {
            setisActiveMenu(false)
        }
    }
    const handleActivityType = async (item) => {
        const response = await activityInfoAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, farmerID, CropType, CropName, item.value)
        setSaveData({ ...saveData, act_ref_type: item.value })
        if (response.data.data.count > 0) {
            // console.warn("start days :", cycleDtartDate);
            // console.warn(JSON.stringify(response.data.data, null, 2));
            const dataArray = [];
            response.data.data.rows.forEach(element => {
                const monthNames = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
                const sdate = new Date(cycleDtartDate);
                sdate.setDate(sdate.getDate() + element.days_from);
                const smonth = monthNames[sdate.getMonth()];
                const sday = sdate.getDate();
                const syear = sdate.getFullYear();
                const startDate = `${smonth} ${sday}, ${syear}`;


                const edate = new Date(cycleDtartDate);
                edate.setDate(edate.getDate() + element.days_to);
                const emonth = monthNames[edate.getMonth()];
                const eday = edate.getDate();
                const eyear = edate.getFullYear();
                const endDate = `${emonth} ${eday}, ${eyear}`;
                const startDateEndDate = `${startDate}-${endDate}`
                dataArray.push({
                    start_date: sdate,
                    end_date: edate,
                    value: element.act_type_id,
                    label: startDateEndDate,
                });
            });
            setActivityInfoAll(dataArray)
        }

    }
    const handleActivityInfo = async (item) => {
        // console.warn(item);
        const act_to_date1 = item.end_date;
        const date1 = new Date(act_to_date1);
        const year1 = date1.getFullYear();
        const month1 = (date1.getMonth() + 1).toString().padStart(2, '0');
        const day1 = date1.getDate().toString().padStart(2, '0');
        const act_to_date = `${year1}-${month1}-${day1}`;

        const act_start_date1 = item.start_date; ``
        const date2 = new Date(act_start_date1);
        const year2 = date2.getFullYear();
        const month2 = (date2.getMonth() + 1).toString().padStart(2, '0');
        const day2 = date2.getDate().toString().padStart(2, '0');
        const act_start_date = `${year2}-${month2}-${day2}`;
        setSaveData({
            ...saveData,
            // act_to_date: item.end_date,
            act_to_date: act_to_date,
            // act_start_date: item.start_date,
            act_start_date: act_start_date,
            act_ref: item.value,
        })
    }
    const requestLivePermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                Geolocation.getCurrentPosition(data =>
                    setSaveData({
                        ...saveData,
                        latitude: data.coords.latitude,
                        longitude: data.coords.longitude,
                    })
                )

            } else {
                console.log('Location permission denied');
            }
        } catch (err) {
            console.warn(err);
        }
    };

    const onPageLoad = async () => {
        requestLivePermission();
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

            const response = await farmerByNameAPI(dbName, languageID, token, userID)
            if (response) {
                const dataArray = [];
                response.data.data.rows.forEach(element => {
                    dataArray.push({
                        value: element.user_id,
                        label: element.userName,
                        phone: element.contactNumber,
                    });
                });
                setfarmerData(dataArray)
            }
        }
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    return (

<>



        <View style={styles.container}>
           

            <CustomHeader path='activityList' />
            <DatePickerComp
                openDate={cycleStartDate}
                newDate={newFromDate}
                setOpenDate={srtCycleStartDate}
                handleDatePicker={handleDatePicker}
            />
            <DatePickerComp
                openDate={activityPreDate}
                newDate={newFromDate}
                setOpenDate={setActivityPreDate}
                handleDatePicker={handleDatePicker2}

            />


            <View style={styles.titleContainer}>
                <Text style={[styles.title, { paddingBottom: 8, paddingTop: 4, fontWeight: '700', fontSize: 18 }]}>
                    Report Activity
                </Text>
            </View>
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
            <ScrollView>
                <View style={styles.fromContainer}>
                    <InputTextForm label="Farmer/Producer Name" color="red" value={searchFarmerName}
                        onChangeText={(farmerName) => handleSearch(farmerName)} />


                    {/* <FlatList
                        style={styles.flatlistcontainercontainer}
                        data={searchResults}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleResultSelect(item.label, item.value, item.phone)} style={styles.flatlistitem}>
                                <Text style={styles.flatlisttitle}>{item.label}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item, index) => index}
                    /> */}
                    <InputTextForm label="Phone Number" color="red" value={searchFarmerPhone} />

                    <DropdownForm label="Plot/Site" data={plotAll} color="red" onChange={relId => handlePlot(relId)} />

                    <DropdownForm label="Production Stage" color="red" data={productionStageAll} onChange={production_stage => setSaveData({ ...saveData, growth_stage: production_stage.value })} />

                    <View>
                        <Text style={styles.title}>Cycle Start Date</Text>
                        <View style={styles.cycleContainer}>
                            <TouchableOpacity style={styles.cycleContainerDate} onPress={() => srtCycleStartDate(true)}>
                                <View style={{ width: '80%' }}>
                                    <Text>{cycleDtartDate}</Text>
                                </View>
                                <Image
                                    source={require('../../Common/images/calendar.png')}
                                    style={{ width: 20, height: 20 }}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cycleContainerStartDate} onPress={() => srtCycleStartDate(true)}>
                                <Text style={{ color: '#FFF' }}>Set Cycle start Date</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.activityPattern} >
                        <Text>Activity Pattern</Text>
                        <RadioForm label="Schedule" selected={activityInfoReadio.activityPreFormDate === 'schedule'}
                            onSelect={() => handleActivityPattern('schedule')} />
                        <RadioForm label="Regular" selected={activityInfoReadio.activityPreFormDate === 'regular'}
                            onSelect={() => handleActivityPattern('regular')} />
                    </View>
                    {
                        isActiveMenu ?
                            <>
                                <DropdownForm label="Activity Type" color="red" data={activityTypeAll} onChange={item => handleActivityType(item)} />
                                <DropdownForm label="Activity" color="red" data={activityInfoAll} onChange={item => handleActivityInfo(item)} />
                            </>
                            :
                            ''
                    }

                    <View>
                        <Text style={{ color: 'red' }}>Activity PerForm Date</Text>
                        <TouchableOpacity style={styles.activityPerFromDate} onPress={() => setActivityPreDate(true)}>
                            <Text>{activityPreFormDate}</Text>
                            <Image
                                source={require('../../Common/images/calendar.png')}
                                style={{ width: 20, height: 20 }}
                            />
                        </TouchableOpacity>
                    </View>

                    <InputTextForm label="Your Comment" value={saveData.act_desc} onChangeText={(act_desc) => setSaveData({ ...saveData, act_desc: act_desc })} />
                    <InputTextForm label="Material Used" value={saveData.material_used} onChangeText={(material_used) => setSaveData({ ...saveData, material_used: material_used })} />
                    <InputTextForm label="Water Used" value={saveData.water_used} onChangeText={(water_used) => setSaveData({ ...saveData, water_used: water_used })} />
                    <InputTextForm label="Power Used" value={saveData.power_used} onChangeText={(power_used) => setSaveData({ ...saveData, power_used: power_used })} />


                    <TakePhoto openImagePicker={openImagePicker} selectedImage={selectedImage} />



                    <RecordComp selectedRecord={selectedRecord} onPress={handleRecord} />
                </View>
            </ScrollView>

            <View style={{ marginTop: 10 }}>
                <ButtonForm label='Submit' onPress={() => handleSave()} />
            </View>
        </View>
        </>
    )
}

export default ActivityReport

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    titleContainer: {
        width: "95%",
        alignItems: 'flex-end',
        paddingVertical: 10,
    },
    title: {
        color: '#000',
    },
    fromContainer: {
        width: '90%',
        marginHorizontal: '5%'
    },
    activityPattern: {
        marginVertical: 10
    },
    cycleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 7
    },
    cycleContainerStartDate: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 8
    },
    cycleContainerDate: {
        width: '55%',
        // flexDirection: 'row-reverse',
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 8,
        borderWidth: 0.5
    },
    activityPerFromDate: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        borderRadius: 8,
        height: 40,
        borderColor: 'gray',
        borderWidth: 0.5,
        backgroundColor: 'white',
        width: '100%',
        paddingHorizontal: 10,
    },
    flatlistcontainer: {
        marginVertical: 10, backgroundColor: '#FFF',
        position: 'relative',
        top: -23, padding: 1,
        elevation: 10,
        borderRadius: 10
    },
    flatlistitem: {
        marginVertical: 10,
        marginHorizontal: 10
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
    flatlisttitle: {
        padding: 10,
        color: '#000'
    },
    flatlistHeight: {
        height: Dimensions.get('window').height / 2.5
    }
})
