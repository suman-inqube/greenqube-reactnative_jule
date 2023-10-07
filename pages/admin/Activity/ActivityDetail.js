import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState,useEffect } from 'react'
import InputTextForm from '../../Common/InputTextForm';
import TakePhoto from './TakePhoto';
import RecordComp from './RecordComp';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { getItem } from '../../../config/getDataFromStorage';
import { useRoute } from '@react-navigation/native';

const ActivityDetail = ({farmerID}) => {
    const route = useRoute();
    const { uact_id } = route.params;


    const [selectedImage, setSelectedImage] = useState({
        firstItem: "",
        secondItem: "",
        thirdItem: "",
    });
    const [farmerActivity, setfarmerActivity] = useState({});
    const [selectedRecord, setSelectedRecord] = useState({
        firstItemRecord: "",
        secondItemRecord: "",
        thirdItemRecord: "",
    });
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
                setSelectedImage({...selectedImage,[item]:imageUri});
            }
        });
    };

    const onPageLoad = async () => {
        const activityData = await getItem('activity_Data');
        if (activityData) {
            const farmerArray = activityData.rows
            const farmerFound = farmerArray.find(user => user.uact_id === uact_id);
            setSelectedImage({ ...selectedImage, firstItem: farmerFound.agri_files[0].file_path })
            setfarmerActivity(farmerFound);


        }
    }
    useEffect(() => {
        onPageLoad();
    }, []);
    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={[styles.title, { paddingBottom: 8, paddingTop: 4, fontWeight: '700', fontSize: 18 }]}>
                    Report Detail
                </Text>
            </View>
            <ScrollView>
                {
                    farmerActivity.agri_user
                    ?
                        <View style={styles.fromContainer}>
                            <InputTextForm label="Farmer/Producer Name" value={farmerActivity.agri_user.userName} />
                            <InputTextForm label="Phone Number" value={farmerActivity.agri_user.contactNumber} />
                            <InputTextForm label="Activity Type" value={farmerActivity.cropActivity.activity.categoryName} />
                            <InputTextForm label="Activity Name" value={farmerActivity.cropActivity.activity.categoryName} />
                            <View style={{
                                flexDirection: 'row',
                                width: '100%',
                                borderWidth: 0.5,
                                borderRadius: 5,
                                padding: 10,
                                backgroundColor: '#FFF',
                                marginVertical: 12
                            }}>
                                <View style={{ width: '25%', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Text style={styles.title}>{'Activity \nDescription'}</Text>
                                    <Text style={styles.title}>{'Activity \nScheduled Date'}</Text>
                                </View>
                                <View style={{
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    width: '50%',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <Text style={[styles.title]} >
                                        {farmerActivity.cropActivity.activity.description}
                                    </Text>
                                    <Text style={[styles.title]}>
                                        <Text>
                                            {farmerActivity.act_start_date}
                                        </Text>
                                        <Text>
                                            {farmerActivity.act_start_date}

                                        </Text>

                                    </Text>
                                </View>

                            </View>
                            <InputTextForm label="Plot/Site Name" value={farmerActivity.land_info.plot_no} />
                            <InputTextForm label="Produce Name" value={farmerActivity.cropName.name}/>
                            <InputTextForm label="Production Stage" value={farmerActivity.growthStage.name}/>
                            <InputTextForm label="Activity Performed Date" value={farmerActivity.createdAt}/>
                            <InputTextForm label="Your Comment" value={farmerActivity.act_desc}/>
                            <InputTextForm label="Material Used" value={farmerActivity.act_desc} />
                            <InputTextForm label="Water Used" value={farmerActivity.act_desc} />
                            <InputTextForm label="Power Used" value={farmerActivity.act_desc} />
                            <TakePhoto openImagePicker={openImagePicker} selectedImage={selectedImage} />
                            <RecordComp selectedRecord={selectedRecord} />
                        </View>
                        :
                        ''
                }

            </ScrollView>
        </View>
    )
}

export default ActivityDetail

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'#FFF'
    },
    titleContainer: {
        width: "95%",
        alignItems: 'flex-end',
        paddingVertical: 10,
    },
    title: {
        color: '#000',
        paddingVertical: 10
    },
    fromContainer: {
        width: '90%',
        marginHorizontal: '5%',
    },
})
