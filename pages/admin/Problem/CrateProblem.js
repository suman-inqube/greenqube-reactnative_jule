import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, FlatList,SafeAreaView, Dimensions } from 'react-native'
import { PermissionsAndroid } from 'react-native'
import Geolocation from '@react-native-community/geolocation';
import React, { useState, useEffect } from 'react'
import FormsTitle from '../../Common/FormsTitle';
import RadioForm from '../../Common/RadioForm';
import DropdownForm from '../../Common/DropdownForm';
import DropdownForm1 from '../../Common/DropdownForm1';
import InputTextForm from '../../Common/InputTextForm';
import DatePickerComp from '../../Common/DatePickerComp';
import TakePhoto from '../Activity/TakePhoto';
import RecordComp from '../Activity/RecordComp';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ButtonForm from '../../Common/ButtonForm';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import { farmerByNameAPI, problemPlotAgainstFarmerAPI, problemProduceAgainstPlotAPI, problemProductionStageAPI, problemSaveAPI, problemSeverityAPI, problemTypeNameAPI } from '../../../config/apiHere';
import MessageDialog from '../../Common/MessageDialog';
import axios from 'axios';
import CustomHeader from '../CustomHeader';
const CreateProblem = ({ navigation }) => {

    const [farmerData, setFarmerData] = useState();
    const [searchFarmerName, setSearchFarmerName] = useState();
    const [searchFarmerPhone, setSearchFarmerPhone] = useState();
    const [searchResultsList, setSearchResultsList] = useState(false);
    const [CropType, setCropType] = useState();
    const [CropName, setCropName] = useState();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: '',
        languageID: '',
        token: '',
        userID: ''
    });

    const [searchResults, setSearchResults] = useState([]);
    const [selectedName, setSelectedName] = useState('');
    const [farmerID, setfarmerID] = useState();
    const [plotAll, setplotAll] = useState([]);
    const [productionStageAll, setproductionStageAll] = useState([]);
    const [problemAll, setProblemAll] = useState([]);
    const [problemTypeAll, setProblemTypeAll] = useState([]);
    const [problemNameAll, setProblemNameAll] = useState([]);
    const [severityAll, setSeverityAll] = useState([]);
    const [nameVarityStartEnd, setNameVarityStartEnd] = useState({
        name: "",
        varity: "",
        cycleStarts: "",
        cycleEnd: "",
        production_process: ""
    });
    const [affectedDate, setaffectedDate] = useState("");
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [addAffectedDate, setaddAffectedDate] = useState(false);
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
        agent_fcm: "",
        farmer_fcm: "eJ_QQHq1Qq-337QqKYbK4A:APA91bFCGrfq6XPr7dc7UyWMFoPdaY9fGryYS6JSByN5QPY7WlLOIXtmWU1-Z16RfuDhqf7InNwiHIhJh1_W6J-MYl97s7FA-xodzjza5J_DKKoVodUJfiqLyZIy56Tvicr0vsIbDGAj ",
        photo: [],
        audio: [],
        file_title: [],
        post_meta_info: [],
        latitude: "",
        longitude: "",
        question_type: "crop_problem",
        land_unit_id: '',
        affected_area: '',
        category_id: '',

    });
    const [myphotoAll, setmyPhotoAll] = useState([]);
    const [myphoto, setmyPhoto] = useState(null);
    const [myphotoTitle, setmyPhotoTitle] = useState([]);
    const [showingMenu, setShowingMenu] = useState(false);

    const handleResultSelect = async (name, currentfarmerId, phone) => {
        setSearchResultsList(false)
        // console.warn(name, currentfarmerId, phone);
        // console.warn(JSON.stringify(searchResults, null, 2));
        setSearchFarmerPhone(phone)
        setSelectedName(name);
        setSearchFarmerName(name);
        setSearchResults([]);
        setfarmerID(currentfarmerId)
        // console.warn(currentfarmerId);
        const response = await problemPlotAgainstFarmerAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, currentfarmerId)
        if (response) {
            // console.warn(JSON.stringify(response.data.data,null,2));
            // return;
            const dataArray = [];
            response.data.data.forEach(element => {
                dataArray.push({
                    value: element.rel_id,
                    label: element.plot_no
                });
            });
            setplotAll(dataArray)

        }
    }

    const handlePlot = async (relId) => {
        // console.log("relid:", relId.value, "farmarid:", farmerID);
        // console.warn(dbLanTokUsr);
        const response = await problemProduceAgainstPlotAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, farmerID, relId.value)

        if (response) {
            //   console.warn(JSON.stringify(response.data.data.rows,null,2));
            setNameVarityStartEnd({
                ...nameVarityStartEnd,
                name: response.data.data.rows[0].crop_name.name,
                varity: response.data.data.rows[0].crop_variety.name,
                cycleStarts: response.data.data.rows[0].crop_cycl_start_date,
                cycleEnd: response.data.data.rows[0].harvesting_date,
                production_process: response.data.data.rows[0].farmer_production_system.name,

            })
            const dateString = response.data.data.rows[0].harvesting_date;
            const harvesting_date = new Date(dateString);
            const currentDate = new Date();
            if (harvesting_date > currentDate) {
                setShowingMenu(true)
                setSaveData({
                    ...saveData,
                    // agent_id: dbLanTokUsr.userID,
                    crop_season_id: response.data.data.rows[0].crop_season_id,
                    crop_type_id: response.data.data.rows[0].crop_type_id,
                    crop_variety_id: response.data.data.rows[0].crop_variety_id,
                    crop_name_id: response.data.data.rows[0].crop_name_id,
                    plot_id: relId.value,
                    harvesting_date: response.data.data.rows[0].harvesting_date,
                    sowing_date: response.data.data.rows[0].sowing_date,
                    production_system: response.data.data.rows[0].farmer_production_system.fa_id,
                    agent_id: dbLanTokUsr.userID,
                })
                // setsinglePlot(response.data.data.rows)
                // console.warn(response.data.data.rows[0].sowing_date);
                setCropType(response.data.data.rows[0].crop_type.fid)
                setCropName(response.data.data.rows[0].crop_name.fid)

                const productionStage_res = await problemProductionStageAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, response.data.data.rows[0].crop_type_id, response.data.data.rows[0].crop_name_id)
                if (productionStage_res) {
                    // console.warn(JSON.stringify(productionStage_res.data.data.growth_stage,null,2));
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
                setSelectedImage({ ...selectedImage, [item]: imageUri });
                const newPhoto = { uri: imageUri, type: 'image/jpeg', name: imageUri }
                const newTitle = { imageUri }
                addPhoto(newPhoto);
                setmyPhoto(newPhoto)
                setmyPhotoTitle({ file_title: "hello.png" })
            }
        });
    };

    const addPhoto = (newPhoto) => {
        setmyPhotoAll([...myphotoAll, newPhoto]);
    };


    const handleDatePicker = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setaffectedDate(effective_date)
        setSaveData({ ...saveData, affected_date: effective_date })

        // console.log(saveData);
        // return;
    }

    const handleProblemType = (problem_type) => {
        //    console.warn(problemAll);
        setSaveData({ ...saveData, problem_type_id: problem_type.value })
        const problemNameFound = problemAll.find(user => user.fid === problem_type.value);
        //    console.log(problemNameFound);

        if (problemNameFound) {
            const dataArray = [];
            problemNameFound.problem_type.forEach(element => {
                dataArray.push({
                    value: element.problem_name.fid,
                    label: element.problem_name.name,
                });
            });
            setProblemNameAll(dataArray)
        }

    };

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

            const problemName_res = await problemTypeNameAPI(dbName, languageID, token)
            setProblemAll(problemName_res.data.data);
            if (problemName_res) {
                const dataArray = [];
                problemName_res.data.data.forEach(element => {
                    dataArray.push({
                        value: element.fid,
                        label: element.name,
                    });
                });
                setProblemTypeAll(dataArray)
            }

            const severity_res = await problemSeverityAPI(dbName, languageID)
            if (severity_res) {
                // console.log(severity_res.data.data);
                const dataArray = [];
                severity_res.data.data.rows.forEach(element => {
                    dataArray.push({
                        value: element.fid,
                        label: element.name,
                    });
                });
                setSeverityAll(dataArray)
            }

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
                setFarmerData(dataArray)
            }
        }
    };

    const validationData = () => {
        if (saveData.plot_id && saveData.growth_stage) {
            return true;
        }
        else {
            MessageDialog({ title: 'Require', message: 'Please fill in all required fields with valid data.' })
            return;
        }

    }

    const handleSave = async () => {
        //   const res = validationData()
        // await  setItem("problemSave_Check",saveData);
        // const problemSaveCheck=await getItem('problemSave_Check')
    //    return console.log(JSON.stringify(problemSaveCheck,null,2));

    const staticData={
            "question_title": "Rose,Disease,Bacillus larvae",
            "question_desc": "desct",
            "category_id": "",
            "plot_id": "a9445241-a55b-4ace-9984-ded1db455716",
            "land_unit_id": "",
            
            "crop_season_id": "c540375e-bf91-40a6-8823-a44b5e58f87a",
            "crop_type_id": "23faed48-942a-4d85-84cf-2c25cdf4640a",
            "crop_name_id": "4143d209-ccb7-4e48-91ca-51614645d774",
            "crop_variety_id": "a555a329-b535-490c-a096-fd1d17fed401",
            
            "growth_stage_id": "e97f9054-2ee2-4565-9113-7a5abbf23909",
            "problem_type_id": "57458fd8-7dfb-40ec-a842-5e0db9084314",
            "problem_name_id": "b5bfcb72-e279-46a5-b3d4-e9912ca6245a",

            "affected_area": "",
            "affected_date": "2023-11-03",
            "sowing_date": "2023-05-26",
            "harvesting_date": "2024-03-31",
            "post_meta_info": "",
            "file_title": "",
            "agent_id": "c8e666ba-5046-48ba-8561-27c3c22be0cc",
            "production_system": "825b6dd0-87f5-11ec-9d08-3d8c35c8c07b",
            "question_type": "crop_problem",
            "latitude": 28.6475764,
            "longitude": 77.0433618,
            "agent_fcm": "",
            "farmer_fcm": "eJ_QQHq1Qq-337QqKYbK4A:APA91bFCGrfq6XPr7dc7UyWMFoPdaY9fGryYS6JSByN5QPY7WlLOIXtmWU1-Z16RfuDhqf7InNwiHIhJh1_W6J-MYl97s7FA-xodzjza5J_DKKoVodUJfiqLyZIy56Tvicr0vsIbDGAj ",
            "photo": "",
            "audio": "",
          }
          
//    return console.log(JSON.stringify(staticData,null,2));
        // const formData = new FormData();
        // formData.append("agent_fcm", staticData.agent_fcm);
        // formData.append("farmer_fcm",staticData.farmer_fcm);
        // formData.append("photo", "");
        // formData.append("audio", "");
        // formData.append("post_meta_info","");
        // formData.append("file_title", "");
        // formData.append("latitude", staticData.latitude);
        // formData.append("longitude", staticData.longitude);
        // formData.append("question_type", staticData.agent_fcm);
        // formData.append("land_unit_id", staticData.agent_fcm);
        // formData.append("affected_area", staticData.agent_fcm);
        // formData.append("category_id", staticData.agent_fcm);
        // formData.append("agent_id", staticData.agent_id);
        // formData.append("crop_season_id", staticData.crop_season_id);
        // formData.append("crop_type_id", staticData.crop_type_id);
        // formData.append("crop_variety_id", staticData.crop_variety_id);
        // formData.append("crop_name_id", staticData.crop_name_id);
        // formData.append("plot_id", staticData.plot_id);
        // formData.append("harvesting_date", staticData.harvesting_date);
        // formData.append("sowing_date", staticData.sowing_date);
        // formData.append("production_system", staticData.production_system);
        // formData.append("growth_stage_id", staticData.growth_stage_id);
        // formData.append("problem_type_id", staticData.problem_type_id);
        // formData.append("affected_date", staticData.affected_date);
        // formData.append("question_title", staticData.question_title);
        // formData.append("question_desc", staticData.question_desc);
        // formData.append("problem_name_id", staticData.problem_name_id);


        const formData = new FormData();
        formData.append("question_title", "Rose,Disease,Bacillus larvae");
        formData.append("question_type","crop_problem");
        formData.append("post_meta_info", JSON.stringify([]));
        formData.append("file_title", JSON.stringify([]));


        const database_res = await problemSaveAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, farmerID, formData);
        //   return console.log(JSON.stringify(formData,null,2))
        if (database_res) {
            MessageDialog({ title: 'Successful', message: "Successfull Add Data" })
            navigation.navigate('ProblemList');
        }

    }

    useEffect(() => {
        onPageLoad();
    }, []);
    return (
        <View style={styles.container}>
            <CustomHeader path='ProblemList' />
            <DatePickerComp
                openDate={addAffectedDate}
                newDate={newFromDate}
                setOpenDate={setaddAffectedDate}
                handleDatePicker={handleDatePicker}
            />
            <FormsTitle title={'Add Problem'} />
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
                    <InputTextForm label="Farmer/Producer Name" value={searchFarmerName}
                        onChangeText={(farmerName) => handleSearch(farmerName)} />
                    <InputTextForm label="Phone Number" value={searchFarmerPhone} />

                    <DropdownForm label="Plot/Site" data={plotAll} color="red" onChange={relId => handlePlot(relId)} />

                    {
                        showingMenu
                            ?
                            <View style={styles.plotSiteContainer}>
                                <View style={styles.plotSiteContainerItem}>
                                    <Text style={styles.plotSiteItemText}>Produce Name</Text>
                                    <Text style={styles.plotSiteItemText}>Produce Variety</Text>
                                    <Text style={styles.plotSiteItemText}>Cycle Starts</Text>
                                    <Text style={styles.plotSiteItemText}>Cycle End</Text>
                                </View>
                                <View style={styles.plotSiteContainerItem}>
                                    <Text style={styles.plotSiteItemText}>
                                        {nameVarityStartEnd.name}
                                    </Text>
                                    <Text style={styles.plotSiteItemText}>  {nameVarityStartEnd.varity}</Text>
                                    <Text style={styles.plotSiteItemText}>  {nameVarityStartEnd.cycleStarts}</Text>
                                    <Text style={styles.plotSiteItemText}>  {nameVarityStartEnd.cycleEnd}</Text>
                                </View>
                            </View>
                            :
                            ''

                    }


                    <DropdownForm label="Production Stage" color="red" data={productionStageAll} onChange={production_stage => setSaveData({ ...saveData, growth_stage: production_stage.value })} />

                    <DropdownForm label="Problem Type" data={problemTypeAll} onChange={item => handleProblemType(item)} />

                    <DropdownForm label="Problem Name" data={problemNameAll} onChange={item => setSaveData({ ...saveData, problem_name_id: item.value })} />

                    <DropdownForm label="Severity" data={severityAll} onChange={item => console.log(item)} />

                    <InputTextForm label="Production Process" value={nameVarityStartEnd.production_process} />

                    <View>
                        <Text style={{ color: '#000' }}>Affected Date</Text>
                        <TouchableOpacity style={styles.activityPerFromDate} onPress={() => setaddAffectedDate(true)}>
                            <Text>{affectedDate}</Text>
                            <Image
                                source={require('../../Common/images/calendar.png')}
                                style={{ width: 20, height: 20 }}
                            />
                        </TouchableOpacity>
                    </View>

                    <InputTextForm label="Problem Title" onChangeText={(item) => setSaveData({ ...saveData, question_title: item })} />

                    <InputTextForm label="Problem Description" onChangeText={(item) => setSaveData({ ...saveData, question_desc: item })} />

                    <TakePhoto openImagePicker={openImagePicker} selectedImage={selectedImage} />

                    <RecordComp selectedRecord={selectedRecord} />
                </View>

            </ScrollView>
            <View style={{ marginTop: 10 }}>
                <ButtonForm label='Submit' onPress={() => handleSave()} />
            </View>
        </View>
    )
}

export default CreateProblem

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
    plotSiteContainer: {
        flexDirection: 'row',
        borderWidth: 0.5,
        borderColor: '#000',
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#FFF',
        marginBottom: 10
    },
    plotSiteContainerItem: {
        width: '50%'
    },
    plotSiteItemText: {
        color: '#000',
        marginVertical: 5
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