import { StyleSheet, Text, View, ScrollView, Image } from 'react-native'
import React, { useState, useEffect, useCallback, useContext } from 'react'
import InputTextForm from '../../Common/InputTextForm';
import TakePhoto from './TakePhoto';
import RecordComp from './RecordComp';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatDateToDateName } from '../../Common/DateChanger';
import FormsTitle from '../../Common/FormsTitle';
import AudioPlayerView from '../../Common/AudioPlayerView';
import { userCreateContext } from '../../Context/usersCreateContext';
const ActivityDetail = () => {
    const { LoadingScreen, CustomHeader, t, onBackPress, getItem, logoImage, topBanner, Root, SPSheet } = useContext(userCreateContext);
    const navigation = useNavigation();
    const route = useRoute();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState({
        firstItem: "",
        secondItem: "",
        thirdItem: "",
    });
    const [farmerActivity, setfarmerActivity] = useState({
        cropActivity: "",
        typeActivity: "",
        userName: "",
        contactNumber: "",
        activitycategoryName: "",
        cropActivitycategoryName: "",
        plot_no: "",
        cropName: "",
        growthStage: "",
        act_perform_date: "",
        act_desc: "",
        material_used: "",
        water_used: "",
        power_used: "",
    });
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
        if (activityData) {
            const farmerFound = activityData.find(user => user.uact_id === route.params);
            setIsLoading(false)
            if (farmerFound?.agri_files) {
                let Imag1 = '';
                let Imag2 = '';
                let Imag3 = '';
                let audio1 = '';
                let audio2 = '';
                let audio3 = '';
                const agri_files_image = farmerFound?.agri_files.filter(function (v, i) {
                    return ((v["file_ext"] == "image/jpeg"));
                })
                const agri_files_mp3 = farmerFound?.agri_files.filter(function (v, i) {
                    return ((v["file_ext"] == "audio/mp3"));
                })
                for (let i = 0; i < 3; i++) {
                    if (agri_files_image[0] != undefined) {
                        Imag1 = agri_files_image[0].file_path
                    } else {
                        Imag1 = "";
                    }
                    if (agri_files_image[1] != undefined) {
                        Imag2 = agri_files_image[1].file_path
                    } else {
                        Imag2 = "";
                    }
                    if (agri_files_image[2] != undefined) {
                        Imag3 = agri_files_image[2].file_path
                    } else {
                        Imag3 = "";
                    }
                    if (agri_files_mp3[0] != undefined) {
                        audio1 = agri_files_mp3[0].file_path;
                    } else {
                        audio1 = "";
                    }
                    if (agri_files_mp3[1] != undefined) {
                        audio2 = agri_files_mp3[1].file_path;
                    } else {
                        audio2 = "";
                    }
                    if (agri_files_mp3[2] != undefined) {
                        audio3 = agri_files_mp3[2].file_path;
                    } else {
                        audio3 = "";
                    }
                }
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
            setfarmerActivity({
                ...farmerActivity,
                userName: farmerFound?.agri_user.userName,
                contactNumber: farmerFound?.agri_user.contactNumber,
                activitycategoryName: farmerFound?.typeActivity,
                cropActivitycategoryName: farmerFound?.cropActivity,
                plot_no: farmerFound?.land_info.plot_no,
                cropName: farmerFound?.cropName?.name,
                growthStage: farmerFound?.growthStage?.name,
                act_perform_date: farmerFound?.updatedAt,
                act_desc: farmerFound?.act_desc,
                material_used: farmerFound?.material_used,
                water_used: farmerFound?.water_used,
                power_used: farmerFound?.power_used,
                act_start_date: farmerFound?.act_start_date,
                act_to_date: farmerFound?.act_to_date
            })
        }
    }
    const handleBackPress = () => { navigation.navigate('activityList'); return true; }
    useEffect(() => {
        onPageLoad();
        onBackPress(handleBackPress);
    }, []);
    const HandlerGoBack = () => navigation.navigate('activityList');
    const soundPlay = async (path) => {
        SPSheet.show({
            component: () => <AudioPlayerView path={path} />,
            dragFromTopOnly: true,
            onCloseComplete: () => {
                // alert('onCloseComplete');
            },
            onOpenComplete: () => {
                // console.log(SPSheet)
            },
            height: 260
        });
    }
    return (
        <Root>
            {
                isLoading ? (
                    <LoadingScreen />
                ) : (
                    <View style={styles.container}>
                        <CustomHeader path='activityList' HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
                        <FormsTitle title={t('act_detail_')} />
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {
                                farmerActivity
                                    ?
                                    <View style={styles.fromContainer}>
                                        <InputTextForm label={t('farmer_name')} value={farmerActivity.userName}
                                        />
                                        <InputTextForm label={t('farmer_number')} value={farmerActivity.contactNumber} />
                                        {
                                            farmerActivity.cropActivitycategoryName != "" && farmerActivity.cropActivitycategoryName != null ?
                                                <>
                                                    <InputTextForm label="Activity Type" value={farmerActivity.activitycategoryName.categoryName} />
                                                    {farmerActivity.cropActivitycategoryName != null ?
                                                        <InputTextForm label="Activity Name" value={`${farmerActivity.cropActivitycategoryName.activity.categoryName} ${formatDateToDateName(farmerActivity.act_start_date)} - ${formatDateToDateName(farmerActivity.act_to_date)}`} />
                                                        : null}
                                                    <View style={styles.activityContainer}>
                                                        <View style={{ width: '30%', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                            <Text style={styles.title}>{t('activity_description')}</Text>
                                                            <Text style={styles.title}>{t('activity_date')}</Text>
                                                        </View>
                                                        <View style={styles.activityWrapper}>
                                                            <Text style={[styles.title]} >
                                                                {farmerActivity.cropActivitycategoryName != null ? farmerActivity.cropActivitycategoryName.activity.categoryName : ""}
                                                            </Text>
                                                            <View style={[styles.title, { flexDirection: 'column' }]}>
                                                                <Text style={{ color: '#000' }}>
                                                                    {formatDateToDateName(farmerActivity.act_start_date)}
                                                                </Text>
                                                                <Text style={{ color: '#000' }}>
                                                                    -{formatDateToDateName(farmerActivity.act_to_date)}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View style={{ justifyContent: 'center', elevation: 5, backgroundColor: '#FFF', padding: 5, borderRadius: 10 }}>
                                                            <Image source={require('../../Common/images/logo.png')} style={{ width: 100, height: 60, resizeMode: "cover" }} />
                                                        </View>
                                                    </View>
                                                </>
                                                : ''
                                        }
                                        <InputTextForm label="Plot/Site Name" value={farmerActivity.plot_no} />
                                        <InputTextForm label={t('crop_name')} value={farmerActivity.cropName} />
                                        <InputTextForm label={t('growth_stage')} value={farmerActivity.growthStage} />
                                        <InputTextForm label={t('act_per_date')} value={formatDateToDateName(farmerActivity.act_perform_date)} />
                                        <InputTextForm label={t('your_comm_')} value={farmerActivity.act_desc} />
                                        <InputTextForm label={t('material_used')} value={farmerActivity.material_used} />
                                        <InputTextForm label={t('water_used')} value={farmerActivity.water_used} />
                                        <InputTextForm label={t('power_used')} value={farmerActivity.power_used} />
                                        <TakePhoto openImagePicker={openImagePicker} selectedImage={selectedImage} title={t('take_a_photo_optional')} />
                                        <RecordComp selectedRecord={selectedRecord} title={t('record_your_comment_optional')} soundPlay={soundPlay} />
                                    </View>
                                    :
                                    ''
                            }

                        </ScrollView>
                    </View>
                )
            }

        </Root>
    )
}

export default ActivityDetail

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    titleContainer: {
        marginHorizontal: '2.5',
        alignItems: 'flex-end',
        paddingVertical: 10,
    },
    title: {
        color: '#000',
        paddingVertical: 10
    },
    fromContainer: {
        marginHorizontal: '2.5%',
    },
    activityContainer: {
        flexDirection: 'row',
        width: '100%',
        borderWidth: 0.5,
        borderRadius: 5,
        padding: 8,
        backgroundColor: '#FFF',
        marginVertical: 12,
        paddingHorizontal: 5
    },
    activityWrapper: {
        alignItems: 'center',
        flexWrap: 'wrap',
        width: '38%',
        flexDirection: 'column',
        justifyContent: 'space-around',
    },

})
