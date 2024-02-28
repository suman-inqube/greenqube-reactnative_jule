import { BackHandler, StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Linking } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import InputTextForm from '../../Common/InputTextForm';
import TakePhoto from './TakePhoto';
import RecordComp from './RecordComp';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { getItem } from '../../../config/getDataFromStorage';
// import { useRoute } from '@react-navigation/native';
import LoadingScreen from '../../Common/LoadingScreen';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import CustomHeader from '../CustomHeader';
import { useTranslation } from 'react-i18next';
const FarmerActivityDetail = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
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
        // console.log(item);
        // const options = {
        //     mediaType: 'photo',
        //     includeBase64: true,
        //     maxHeight: 200,
        //     maxWidth: 200,
        // };
        // launchCamera(options, response => {
        //     if (response.didCancel) {
        //         console.log('User cancelled camera');
        //     } else if (response.error) {
        //         console.log('Camera Error: ', response.error);
        //     } else {
        //         let imageUri = response.uri || response.assets?.[0]?.uri;
        //         setSelectedImage({ ...selectedImage, [item]: imageUri });
        //     }
        // });
    };

    const onPageLoad = async () => {
        const activityData = await getItem('activity_Data');
        const uact_id_data = await getItem('uact_id_data');
        if (activityData) {
            const farmerFound = activityData.find(user => user.uact_id === uact_id_data);
            setIsLoading(false)
            console.log(JSON.stringify(farmerFound, null, 2));

            if (farmerFound.agri_files) {
                let Imag1 = ''
                let Imag2 = ''
                let Imag3 = ''
                let audio1 = '';
                let audio2 = '';
                let audio3 = '';
                let pic = 0;
                let aud = 0;
                console.log(JSON.stringify(farmerFound.agri_files.length, null, 2));
                for (let i = 0; i < farmerFound.agri_files.length; i++) {
                    if (farmerFound.agri_files[i].term_type === "ua_activity") {
                        if (aud === 0) {
                            audio1 = farmerFound.agri_files[i].file_path
                        } else if (aud === 1) {
                            audio2 = farmerFound.agri_files[i].file_path
                        } else if (aud === 2) {
                            audio3 = farmerFound.agri_files[i].file_path
                        }
                        aud++;
                    } else {
                        if (pic === 0) {
                            Imag1 = farmerFound.agri_files[i].file_path
                        } else if (pic === 1) {
                            Imag2 = farmerFound.agri_files[i].file_path
                        } else if (pic === 2) {
                            Imag3 = farmerFound.agri_files[i].file_path
                        }
                        pic++;
                    }

                }
                // if (farmerFound.agri_files[0]) {
                //     Imag1 = farmerFound.agri_files[0].file_path 
                // }else
                // {
                //     Imag1 = "" 
                // }

                // if (farmerFound.agri_files[1]) {
                //     Imag2 = farmerFound.agri_files[1].file_path 
                // }else
                // {
                //     Imag2 = ""
                // }

                // if (farmerFound.agri_files[2]) {
                //     Imag3 = farmerFound.agri_files[2].file_path 
                // }else
                // {
                //     Imag3=""
                // }

                setSelectedImage({
                    ...selectedImage,
                    firstItem: Imag1,
                    secondItem: Imag2,
                    thirdItem: Imag3,
                })
                setSelectedRecord({
                    firstItemRecord: audio1,
                    secondItemRecord: audio2,
                    thirdItemRecord: audio3,
                });

            }
            setfarmerActivity(farmerFound)
        }
    }
    useEffect(() => {
        onPageLoad();
    }, []);

    useFocusEffect(
        useCallback(() => {
            onPageLoad();
            const onBackPress = () => { navigation.navigate('FarmerActivityList'); return true; };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );
    const HandlerGoBack = () => {
        navigation.navigate('FarmerActivityList');
    }
    return (
        <>
            {

                isLoading ? (
                    <LoadingScreen />
                ) : (
                    <View style={styles.container}>
                        <CustomHeader path='FarmerActivityList' HandlerGoBack={HandlerGoBack} />
                        <View style={styles.titleContainer}>
                            <Text style={[styles.title, { paddingBottom: 8, paddingTop: 4, fontWeight: '700', fontSize: 18 }]}>
                                {t('act_detail_')}
                            </Text>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {
                                farmerActivity
                                    ?
                                    <View style={styles.fromContainer}>
                                        {
                                            farmerActivity.cropActivity != null ?
                                                <>
                                                    <InputTextForm label={t('activity_type')} value={farmerActivity.cropActivity && farmerActivity.cropActivity.activity.categoryName} />
                                                    <InputTextForm label={t('act_name')} value={farmerActivity.cropActivity && farmerActivity.cropActivity.activity.categoryName} />

                                                    <View style={{
                                                        flexDirection: 'row',
                                                        width: '100%',
                                                        borderWidth: 0.5,
                                                        borderRadius: 5,
                                                        padding: 10,
                                                        backgroundColor: '#FFF',
                                                        // marginVertical: 12,
                                                        // alignItems: 'center',
                                                        // justifyContent: 'center'

                                                    }}>
                                                        <View style={{ width: '25%', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                            <Text style={styles.title}>{t('activity_description')}</Text>
                                                            <Text style={[styles.title]}>{t('activity_date')}</Text>

                                                        </View>
                                                        <View style={{
                                                            // alignItems: 'center',
                                                            flexWrap: 'wrap',
                                                            width: '45%',
                                                            flexDirection: 'column',
                                                            justifyContent: 'space-between',
                                                        }}>
                                                            <Text style={[styles.title, { width: 150, }]} >
                                                                {farmerActivity.cropActivity && farmerActivity.cropActivity.activity.description.substring(0, 100)}
                                                            </Text>
                                                            <Text style={[styles.title]}>{farmerActivity.act_start_date}</Text>
                                                        </View>
                                                        <Image source={require('../../Common/images/logo.png')} style={{ width: 100, height: 80, resizeMode: 'contain' }} />
                                                    </View>
                                                </>

                                                : ''

                                        }

                                        <InputTextForm label={t('reg_plot_name')} value={farmerActivity.land_info && farmerActivity.land_info.plot_no} />

                                        <InputTextForm label={t('produce_name')} value={farmerActivity.cropName && farmerActivity.cropName.name} />

                                        <InputTextForm label={t('growth_stage')} value={farmerActivity.growthStage && farmerActivity.growthStage.name} />

                                        <InputTextForm label={t('act_per_date')} value={farmerActivity.act_perform_date} />
                                        <InputTextForm label={t('your_comm_')} value={farmerActivity.act_desc} />
                                        <InputTextForm label={t('material_used')} value={farmerActivity.material_used} />
                                        <InputTextForm label={t('water_used')} value={farmerActivity.water_used} />
                                        <InputTextForm label={t('power_used')} value={farmerActivity.power_used} />

                                        <TakePhoto openImagePicker={openImagePicker} selectedImage={selectedImage} title={t('view_phote')} />

                                        <View style={{ marginHorizontal: 20 }}>
                                            <Text style={styles.title}>{t('listen_to_the_problem')}</Text>
                                            <View style={styles.photoContainer}>
                                                {
                                                    selectedRecord.firstItemRecord != "" ?
                                                        <TouchableOpacity onPress={() => Linking.openURL(selectedRecord.firstItemRecord)}>
                                                            <Image
                                                                source={require('../../Common/images/play.png')}
                                                                style={{ width: 70, height: 70 }}

                                                            />
                                                        </TouchableOpacity> :
                                                        <Image
                                                            source={require('../../Common/images/microphone.png')}
                                                            style={{ width: 70, height: 70, opacity: 0.7 }}
                                                        />
                                                }
                                                {
                                                    selectedRecord.secondItemRecord != "" ?
                                                        <TouchableOpacity onPress={() => Linking.openURL(selectedRecord.secondItemRecord)}>
                                                            <Image
                                                                source={require('../../Common/images/play.png')}
                                                                style={{ width: 70, height: 70 }}
                                                            />
                                                        </TouchableOpacity> :
                                                        <Image
                                                            source={require('../../Common/images/microphone.png')}
                                                            style={{ width: 70, height: 70, opacity: 0.7 }}
                                                        />
                                                }
                                                {
                                                    selectedRecord.thirdItemRecord != "" ?
                                                        <TouchableOpacity onPress={() => Linking.openURL(selectedRecord.thirdItemRecord)}>
                                                            <Image
                                                                source={require('../../Common/images/play.png')}
                                                                style={{ width: 70, height: 70 }}

                                                            />
                                                        </TouchableOpacity> :
                                                        <Image
                                                            source={require('../../Common/images/microphone.png')}
                                                            style={{ width: 70, height: 70, opacity: 0.7 }}
                                                        />
                                                }
                                            </View>
                                        </View>
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

export default FarmerActivityDetail

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
    photoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10
    },
})
