import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import InputTextForm from '../../Common/InputTextForm';
import TakePhoto from './TakePhoto';
import RecordComp from './RecordComp';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { getItem } from '../../../config/getDataFromStorage';
import { useRoute } from '@react-navigation/native';
import LoadingScreen from '../../Common/LoadingScreen';
import {  useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../CustomHeader';
const ActivityDetail = () => {
    const [isLoading, setIsLoading] = useState(false);

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
                setSelectedImage({ ...selectedImage, [item]: imageUri });
            }
        });
    };

    const onPageLoad = async () => {
        const activityData = await getItem('activity_Data');
        const uact_id_data = await getItem('uact_id_data');
        if (activityData) {
            const farmerFound = activityData.find(user => user.uact_id === uact_id_data);
            setIsLoading(false)

            if (farmerFound.agri_files) {
                let Imag1 = ''
                let Imag2 = ''
                let Imag3 =  ''

                if (farmerFound.agri_files[0]) {
                    Imag1 = farmerFound.agri_files[0].file_path 
                }else
                {
                    Imag1 = "" 
                }

                if (farmerFound.agri_files[1]) {
                    Imag2 = farmerFound.agri_files[1].file_path 
                }else
                {
                    Imag2 = ""
                }

                if (farmerFound.agri_files[2]) {
                    Imag3 = farmerFound.agri_files[2].file_path 
                }else
                {
                    Imag3=""
                }

                setSelectedImage({
                    ...selectedImage,
                    firstItem: Imag1,
                    secondItem: Imag2,
                    thirdItem: Imag3,
                })

            }
            setfarmerActivity(farmerFound)
        }
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
        <>
            {

                isLoading ? (
                    <LoadingScreen />
                ) : (
                    <View style={styles.container}>
                        <CustomHeader path='activityList' />
                        <View style={styles.titleContainer}>
                            <Text style={[styles.title, { paddingBottom: 8, paddingTop: 4, fontWeight: '700', fontSize: 18 }]}>
                                Report Detail
                            </Text>
                        </View>
                        <ScrollView>
                            {
                                farmerActivity
                                    ?
                                    <View style={styles.fromContainer}>

                                        <InputTextForm label="Farmer/Producer Name" value={farmerActivity.agri_user && farmerActivity.agri_user.userName}
                                        />

                                        <InputTextForm label="Phone Number" value={farmerActivity.agri_user && farmerActivity.agri_user.contactNumber} />

                                        {
                                            farmerActivity.cropActivity != null ?
                                                <>
                                                    <InputTextForm label="Activity Type" value={farmerActivity.cropActivity && farmerActivity.cropActivity.activity.categoryName} />

                                                    <InputTextForm label="Activity Name" value={farmerActivity.cropActivity && farmerActivity.cropActivity.activity.categoryName} />

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
                                                                {farmerActivity.cropActivity && farmerActivity.cropActivity.activity.description}
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
                                                        <Image source={require('../../Common/images/logo.png')} style={{ width: 60, height: 80 }} />
                                                    </View>

                                                </>

                                                : ''

                                        }

                                       <InputTextForm label="Plot/Site Name" value={farmerActivity.land_info && farmerActivity.land_info.plot_no} />

                                        <InputTextForm label="Produce Name" value={farmerActivity.cropName && farmerActivity.cropName.name} />

                                        <InputTextForm label="Production Stage" value={farmerActivity.growthStage && farmerActivity.growthStage.name} />

                                        <InputTextForm label="Activity Performed Date" value={farmerActivity.act_perform_date} />
                                        <InputTextForm label="Your Comment" value={farmerActivity.act_desc} />
                                        <InputTextForm label="Material Used" value={farmerActivity.material_used} />
                                        <InputTextForm label="Water Used" value={farmerActivity.water_used} />
                                        <InputTextForm label="Power Used" value={farmerActivity.power_used} />

                                        <TakePhoto openImagePicker={openImagePicker} selectedImage={selectedImage} title="Take Photo (Optional)" />

                                        <RecordComp selectedRecord={selectedRecord} />
                                    </View>
                                    :
                                    ''
                            }

                        </ScrollView>
                    </View>
                )
            }

        </>
    )
}

export default ActivityDetail

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF'
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
