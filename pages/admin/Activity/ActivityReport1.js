import {
    StyleSheet, Text, View, ScrollView, Platform, TouchableOpacity,
    PermissionsAndroid, Image, Alert
} from 'react-native'
import React, { useEffect, useState } from 'react';
import InputTextForm from '../../Common/InputTextForm';
import DropdownForm from '../../Common/DropdownForm1';
import RadioForm from '../../Common/RadioForm';
import { request, PERMISSIONS } from 'react-native-permissions';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import TakePhoto from './TakePhoto';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RecordComp from './RecordComp';
import ButtonForm from '../../Common/ButtonForm';
import DatePickerComp from '../../Common/DatePickerComp';
import config from '../../../config';
import { getItem } from '../../../config/getDataFromStorage';
const ActivityReport = () => {
    const [farmerActivity, setfarmerActivity] = useState({});
    const [rectime, setrectime] = useState();
    const [searchItem, setsearchItem] = useState();
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
    const [cycleStartDate, srtCycleStartDate] = useState(false);
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [activityPreDate, setActivityPreDate] = useState(false)
    const askpermissions = (permissions) => {
        request(permissions).then((result) => {
            console.log(result)
        });
    }

    const audioRecorderPlayer = new AudioRecorderPlayer();

    const onStartRecord = async () => {

        await audioRecorderPlayer.startRecorder();
        audioRecorderPlayer.addRecordBackListener(e => {
            console.log('Recording . . . ', e.currentPosition);
            setrectime(e.currentPosition)
            return;
        });
    };

    const onStopRecord = async () => {
        const audio = await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
    };
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
            }
        });
    };

    const handleSearchItem = (query)=>
    {

        setsearchItem(query)
        const data = farmerActivity.rows
        const filteredItems = data.filter(item =>
            item.toLowerCase().includes(query.toLowerCase())
        );
        // setFilteredData(filteredItems);
        // console.warn(filteredItems);
    }

    const onPageLoad = async () => {
        const activityData = await getItem('activity_Data');
        if (activityData) {
            // console.warn(activityData);
            console.warn(JSON.stringify(activityData.rows,null,2));

            setfarmerActivity(activityData)
        }
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    return (
        <View style={styles.container}>
            <DatePickerComp
                openDate={cycleStartDate}
                newDate={newFromDate}
                setOpenDate={srtCycleStartDate}
            />
            <DatePickerComp
                openDate={activityPreDate}
                newDate={newFromDate}
                setOpenDate={setActivityPreDate}
            />

            <View style={styles.titleContainer}>
                {/* <Text onPress={() => {
                    if (Platform.OS == 'ios') {
                        askpermissions(PERMISSIONS.IOS.CAMERA)
                    } else {
                        // askpermissions(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
                        askpermissions(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
                        // askpermissions(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                        // askpermissions(PERMISSIONS.ANDROID.RECORD_AUDIO);
                    }
                }}>permision</Text> */}
                <Text style={[styles.title, { paddingBottom: 8, paddingTop: 4, fontWeight: '700', fontSize: 18 }]}>
                    Report Activity
                </Text>
            </View>
            <ScrollView>
                <View style={styles.fromContainer}>
                    <InputTextForm label="Farmer/Producer Name" color="red" value={searchItem}
                        onChangeText={handleSearchItem} />
                    <InputTextForm label="Phone Number" keyboardType="numeric" color="red" />
                    <DropdownForm label="Plot/Site" color="red"/>
                    <DropdownForm label="Production Stage" color="red" />
                    <View>
                        <Text style={styles.title}>Cycle Start Date</Text>
                        <View style={styles.cycleContainer}>
                            <TouchableOpacity style={styles.cycleContainerDate} onPress={() => srtCycleStartDate(true)}>

                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cycleContainerStartDate}>
                                <Text style={{ color: '#FFF' }}>Set Cycle start Date</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.activityPattern} >
                        <Text>Activity Pattern</Text>
                        <RadioForm label="Schedule" />
                        <RadioForm label="Regular" />
                    </View>
                    <DropdownForm label="Activity Type" color="red" />
                    <DropdownForm label="Activity" color="red" />
                    <View>
                        <Text style={{ color: 'red' }}>Activity PerForm Date</Text>
                        <TouchableOpacity style={styles.activityPerFromDate} onPress={() => setActivityPreDate(true)}>
                            <Text></Text>

                        </TouchableOpacity>
                    </View>
                    <InputTextForm label="Your Comment" />
                    <InputTextForm label="Material Used" />
                    <InputTextForm label="Water Used" />
                    <InputTextForm label="Power Used" />
                    <TakePhoto openImagePicker={openImagePicker} selectedImage={selectedImage} />
                    <RecordComp selectedRecord={selectedRecord} />
                </View>

            </ScrollView>
            <View style={{ marginTop: 10 }}>
                <ButtonForm label='Submit' />
            </View>
        </View>
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
        flexDirection: 'row-reverse',
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
    }
})
