import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, FlatList, SafeAreaView, Dimensions, Button } from 'react-native'
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
import { useFocusEffect } from '@react-navigation/native';
import LoadingScreen from '../../Common/LoadingScreen';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
const CreateProblem = ({ navigation }) => {
    const audioRecorderPlayer = new AudioRecorderPlayer();
    const [isLoading, setIsLoading] = useState(true);
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
    const [isToggleRecordingFirst, setToggleRecordingFirst] = useState(true);
    const [isToggleRecordingSecound, setToggleRecordingSecound] = useState(true);
    const [isToggleRecordingThird, setToggleRecordingThird] = useState(true);

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
        latitude: "",
        longitude: "",
        question_type: "crop_problem",
        land_unit_id: "",
        affected_area: "",
        category_id: "",
        affected_date: "",
        question_title: "",
        question_desc: "",
    });
    const [myphotoAll, setmyPhotoAll] = useState([]);
    const [myTitleAll, setMyTitleAll] = useState([]);
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
                const newTitle = {}
                addPhoto(newPhoto);
                addTitle(newTitle)

            }
        });
    };

    const addPhoto = (newPhoto) => {
        setmyPhotoAll([...myphotoAll, newPhoto]);
    };
    const addTitle = (newTitle) => {
        // console.log(newTitle)
        setMyTitleAll([...myTitleAll, newTitle]);
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


    const soundRecordingFirstItem = async () => {
        // setToggleRecordingFirst(false);
        const path = RNFS.DocumentDirectoryPath + '/recording.aac';
        try {
            // Check if the directory exists, if not, create it
            await RNFS.mkdir(RNFS.DocumentDirectoryPath);

            // Start recording
            await audioRecorderPlayer.startRecorder(path);
         
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    }

    const handleShowImg = async (item) => {
        setToggleRecordingFirst(item)
    }

    const startRecording1 = async () => {
        const path = RNFS.DocumentDirectoryPath + '/recording.aac';
        try {
            // Check if the directory exists, if not, create it
            await RNFS.mkdir(RNFS.DocumentDirectoryPath);
            
            // Start recording
            await audioRecorderPlayer.startRecorder(path);
                console.log("play");
        } catch (error) {
            console.error('Error starting recording:', error);
        }
         
      };
    
      const stopRecording1 = async () => {
        const result = await audioRecorderPlayer.stopRecorder();
        console.log(result);
        // setToggleRecordingFirst(true);
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

    function handleClear() {
        setSearchFarmerName('')
        setSearchFarmerPhone('')
        setSaveData({
            ...saveData,
            agent_fcm: "",
            farmer_fcm: "eJ_QQHq1Qq-337QqKYbK4A:APA91bFCGrfq6XPr7dc7UyWMFoPdaY9fGryYS6JSByN5QPY7WlLOIXtmWU1-Z16RfuDhqf7InNwiHIhJh1_W6J-MYl97s7FA-xodzjza5J_DKKoVodUJfiqLyZIy56Tvicr0vsIbDGAj ",
            latitude: "",
            longitude: "",
            question_type: "crop_problem",
            land_unit_id: "",
            affected_area: "",
            category_id: "",
            affected_date: "",
            question_title: "",
            question_desc: "",
        })
        setaffectedDate("")

        setShowingMenu(false)
        setplotAll([]);
        setproductionStageAll([]);
        setProblemAll([]);
        setProblemTypeAll([]);
        setProblemNameAll([]);
        setSeverityAll([]);

        setSelectedImage({
            firstItem: "",
            secondItem: "",
            thirdItem: "",
        });

    }

    const onPageLoad = async () => {
        handleClear();
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
                setIsLoading(false)
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



    const handleSave = async () => {
        handleClear()
        // navigation.navigate('ProblemList');
        let array = [];

        const formData = new FormData();

        myphotoAll.forEach((photo) => {

            formData.append("photo", photo);
        });
        formData.append("file_title", JSON.stringify(myTitleAll));
        formData.append("audio", JSON.stringify(array));
        formData.append("post_meta_info", JSON.stringify(array));
        formData.append("agent_fcm", saveData.agent_fcm);
        formData.append("farmer_fcm", saveData.farmer_fcm);
        formData.append("latitude", saveData.latitude);
        formData.append("longitude", saveData.longitude);
        formData.append("question_type", saveData.question_type);
        formData.append("land_unit_id", saveData.land_unit_id);
        formData.append("category_id", saveData.category_id);
        formData.append("affected_area", saveData.affected_area);
        formData.append("crop_season_id", saveData.crop_season_id);
        formData.append("crop_type_id", saveData.crop_type_id);
        formData.append("crop_variety_id", saveData.crop_variety_id);
        formData.append("crop_name_id", saveData.crop_name_id);
        formData.append("plot_id", saveData.plot_id);
        formData.append("harvesting_date", saveData.harvesting_date);
        formData.append("sowing_date", saveData.sowing_date);
        formData.append("production_system", saveData.production_system);
        formData.append("agent_id", saveData.agent_id);
        formData.append("growth_stage_id", saveData.growth_stage_id);
        formData.append("problem_type_id", saveData.problem_type_id);
        formData.append("problem_name_id", saveData.problem_name_id);
        formData.append("affected_date", saveData.affected_date);
        formData.append("question_title", saveData.question_title);
        formData.append("question_desc", saveData.question_desc);



        // return console.log(JSON.stringify(formData, null, 2))
        // const database_res = await problemSaveAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, farmerID, formData);
        // if (database_res) {
        //     MessageDialog({ title: 'Successful', message: "Successfull Add Data" })
        //     navigation.navigate('ProblemList');
        // }


    }

    useEffect(() => {
        onPageLoad();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            onPageLoad();
        }, [])
    );

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
                {
                    isLoading ?
                        <LoadingScreen />
                        :
                        <View style={styles.fromContainer}>


                         

                            <Text style={styles.title_recording}>Record Your comment (Optional)</Text>
                            <View style={styles.container_recording}>
                                {/* <TouchableOpacity style={styles.item_recording} onPress={() => soundRecordingFirstItem()}>
                                    <Image
                                        source={require('../../Common/images/microphone.jpeg')}
                                        style={{ width: 100, height: 100 }}
                                    />
                                </TouchableOpacity> */}


{/* 
                                <Button title="Start Recording 1" onPress={()=>startRecording1()} /> 
                                 <Button title="Stop Recording" onPress={()=>stopRecording1()} /> */}


                                 
                    

                                {/* {isToggleRecordingFirst ? 

                                <TouchableOpacity style={styles.item_recording} onPress={() => soundRecordingFirstItem()}>
                                    
                                    <Image
                                        source={require('../../Common/images/microphone.jpeg')}
                                        style={{ width: 100, height: 100 }}
                                    />
                                </TouchableOpacity> :

                                    <Button title="Stop Recording" onPress={()=>stopRecording1()} />
                                } */}


                                {/* {isToggleRecordingFirst ? 
                                <TouchableOpacity style={styles.item_recording} onPress={() => soundRecordingFirstItem()}>

                                    <Image
                                        source={require('../../Common/images/microphone.jpeg')}
                                        style={{ width: 100, height: 100 }}
                                    />
                                </TouchableOpacity> :

                                    <Button title="Stop Recording" onPress={stopRecording1} />
                                } */}










                                {/* <TouchableOpacity style={styles.item_recording} onPress={() => soundRecording("secoundItem")}>
                                 
                                    
                                    <Image
                                        source={require('../../Common/images/microphone.jpeg')}
                                        style={{ width: 100, height: 100 }}
                                    /> 
                                    
                                  
                                </TouchableOpacity> */}

                                {/* <TouchableOpacity style={styles.item_recording} onPress={() => soundRecording("thirdItem")}>
                                    {selectedRecord.thirdItemRecord == "" ? <Image
                                        source={require('../../Common/images/microphone.jpeg')}
                                        style={{ width: 100, height: 100 }}
                                    /> :
                                        <Image
                                            source={{ uri: `${selectedRecord.thirdItemRecord}` }}
                                            // style={styles.image}
                                            style={{ width: "100%", height: 100 }}
                                            resizeMode="contain"
                                        />}
                                </TouchableOpacity> */}

                            </View>



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

                            <InputTextForm label="Problem Title" onChangeText={(item) => setSaveData({ ...saveData, question_title: item })} value={saveData.question_title} />

                            <InputTextForm label="Problem Description" onChangeText={(item) => setSaveData({ ...saveData, question_desc: item })} value={saveData.question_desc} />

                            <TakePhoto openImagePicker={openImagePicker} selectedImage={selectedImage} />

                                {/* <RecordComp soundRecording={soundRecording} selectedRecord={selectedRecord} /> */}

                        </View>

                }

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
    }, container_recording: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10
    },
    item_recording: {
        // backgroundColor: '#e9e9e9',
        width: '30%',
        paddingVertical: 10,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        TouchableOpacityAlign: 'center'
    },
    title_recording: {
        paddingVertical: 10,
        color: '#000'
    }
})