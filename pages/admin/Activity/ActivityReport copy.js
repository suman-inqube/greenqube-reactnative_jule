import {
    StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, FlatList
} from 'react-native'
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
import { farmerByNameAPI, plotAgainstFarmerAPI, produceAgainstPlotAPI } from '../../../config/apiHere';
import AutocompleteInput from './AutocompleteInput';


const ActivityReport = () => {
    const [rectime, setrectime] = useState();
    const [farmerData, setfarmerData] = useState();
    const [searchFarmerName, setSearchFarmerName] = useState('');
    const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedName, setSelectedName] = useState('');
    const [farmerID, setfarmerID] = useState();
    const [plotAll, setplotAll] = useState([]);
    const [productionStageAll, setproductionStageAll] = useState([]);
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: '',
        languageID: '',
        token: '',
        userID: ''
    });
    const handleSearch = (text) => {
        setSearchFarmerName(text);
        setSearchFarmerPhone('');
        const result = farmerData.filter(item =>
            item.label.toLowerCase().includes(text.toLowerCase())
        );
        if (result) {
            setSearchResults(result);

        }

    };

    const handleResultSelect = async (name, farmerId, phone) => {
        console.warn(name, farmerId, phone);
        // console.warn(JSON.stringify(searchResults, null, 2));
        setSearchFarmerPhone(phone)
        setSelectedName(name);
        setSearchFarmerName(name);
        setSearchResults([]);
        setfarmerID(farmerId)
        fatchPlotAgainstFarmerAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, farmerID)
    }

    const fatchPlotAgainstFarmerAPI = async(dbName, languageID, token, farmerID)=> {
    const response = await plotAgainstFarmerAPI(dbName, languageID, token, farmerID)
    console.warn(JSON.stringify(response.data.data, null, 2));
    if (response) {

            const dataArray = [];
            response.data.data.forEach(element => {
                dataArray.push({
                    value: element.rel_id,
                    label: element.plot_no
                });
            });
            setplotAll(dataArray)

    }


};
const handlePlot = async (relId) => {
    console.log("relid:", relId.value, "farmarid:", farmerID);

    const response = await produceAgainstPlotAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageID, dbLanTokUsr.token, farmerID, relId.value)
    if (response) {
        console.warn(response.data.data);
    }
}
const [isActiveMenu, setisActiveMenu] = useState(false);
const [saveData, setsaveData] = useState({
    user_id: "",
    plot_id: "",
    crop_name: "",
    crop_variety: "",
    growth_stage: "",
    cycle_start_date: "",
    act_ref: "",
    act_start_date: "",
    act_to_date: "",
    act_perform_date: "",
    material_used: "",
    water_used: "",
    power_used: "",
    act_title: "",
    act_desc: "",
    type: "",
    act_pattern: "",
    act_ref_type: "",
    latitude: "",
    longitude: "",
    photo: "",
    audio: ""
});
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
const [activityPreDate, setActivityPreDate] = useState(false);
const [cycleDtartDate, setCycleStartDate] = useState("");
const [activityPreFormDate, setActivityPreFormDate] = useState("");
const [activityInfoReadio, setactivityInfoReadio] = useState({
    activityPreFormDate: 'Regular',
});
const audioRecorderPlayer = new AudioRecorderPlayer();

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
    // console.log(item);
}


const handleSave = () => {
    // console.warn(saveData);
}
const handleActivityPattern = (item) => {
    setactivityInfoReadio({ ...activityInfoReadio, activityPreFormDate: item })
    if (item === 'Schedule') {
        setisActiveMenu(true)
    }
    else {
        setisActiveMenu(false)

    }
}
const onSearch = (search) => {
    if (search !== '') {
        setFilterShow(true)

    } else {
        setFilterShow(false)
    }
};
const onPageLoad = async () => {
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
    <View style={styles.container}>
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
        <ScrollView>
            <View style={styles.fromContainer}>
                <InputTextForm label="Farmer/Producer Name" color="red" value={searchFarmerName}
                    onChangeText={(farmerName) => handleSearch(farmerName)} />
                <FlatList
                    style={styles.flatlistcontainercontainer}
                    data={searchResults}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleResultSelect(item.label, item.value, item.phone)} style={styles.flatlistitem}>
                            <Text style={styles.flatlisttitle}>{item.label}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index}
                />
                <InputTextForm label="Phone Number" color="red" value={searchFarmerPhone} />
                <DropdownForm label="Plot/Site" data={plotAll} onChange={relId => handlePlot(relId)} />

                <DropdownForm label="Production Stage" color="red" data={productionStageAll} />
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
                    <RadioForm label="Schedule" selected={activityInfoReadio.activityPreFormDate === 'Schedule'}
                        onSelect={() => handleActivityPattern('Schedule')} />
                    <RadioForm label="Regular" selected={activityInfoReadio.activityPreFormDate === 'Regular'}
                        onSelect={() => handleActivityPattern('Regular')} />
                </View>
                {
                    isActiveMenu ?
                        <>
                            <DropdownForm label="Activity Type" color="red" />
                            <DropdownForm label="Activity" color="red" />
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
                <InputTextForm label="Your Comment" />
                <InputTextForm label="Material Used" />
                <InputTextForm label="Water Used" />
                <InputTextForm label="Power Used" />
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
    flatlisttitle: {
        fontSize: 16,
        color: '#000'
    }
})
