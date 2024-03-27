import { StyleSheet, Text, View, Image, TouchableOpacity, Pressable } from 'react-native'
import React, { useEffect } from 'react';
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import DropdownForm from '../../Common/DropdownForm';
import InputTextForm from '../../Common/InputTextForm';
import { ScrollView } from 'react-native-gesture-handler';
import ButtonForm from '../../Common/ButtonForm';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import TreeController from '../../ViewController/TreeController';
import { Root, SPSheet } from 'react-native-popup-confirm-toast';
import DatePickerComp from '../../pages/Common/DatePickerComp';
import PlotModel from '../../Common/PlotModel';
import LoadingScreen from '../../Common/LoadingScreen';
import BottomSheetTakePhoto from '../../Common/BottomSheetTakePhoto';
import LiveHoodController from '../../ViewController/LiveHoodController';
import Video from 'react-native-video';
import CameraScreen from '../../Common/VideoCamera';
import {
    useCameraPermission,
    useMicrophonePermission,
    useCameraDevice,
    Camera,
    PhotoFile,
    TakePhotoOptions,
    VideoFile,
    useCodeScanner,
} from 'react-native-vision-camera';
const LiveHood = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const route = useRoute();
    const { farmeruserID, agri_land_user_rels } = route.params;
    const { isLoading,
        onChangePlotDetails,
        terrainTypeAll,
        soilTypeAll,
        landTypeAll,
        unitAll,
        khasraNo,
        treeainTypeData,
        landTypeAllData,
        soilTypeData,
        landUnitData,
        landSize,
        location,
        handleCurrentLatLong,
        addMoreLocation,
        openlaunchCamera,
        openlaunchImageLibrary,
        openlaunchCameraVider,
        onPressSubmit,
        plotVideo,
        plotRecord,
        onChangeKhatianNo,
        onChangeTreeType,
        onChangelandType,
        onChangeSoilType,
        onChangeyieldamount,
        onChangeProductionUnit,
        camera,
        isRecording,
        videoData,
        setVideo,
        setIsRecording,
        recordingStart,
        setRecordingStart,
        plotDetails,
        recordingDuration,
        setRecordingDuration,
        formatTime,
        onStartRecording,
        photographs,
        addMorePlot,
        plotType,
        onchangePlotName,
        addUserLand,
        storePlotArray,
        produceRemoveDetails } = LiveHoodController(farmeruserID, agri_land_user_rels,);

    const HandlerGoBack = () => {
        navigation.navigate('Dashboard');
    }
    const device = useCameraDevice('back', {
        physicalDevices: ['ultra-wide-angle-camera'],
    });
    return (
        <Root>
            {recordingStart ?
                !device ? <Text>Camera device not found</Text>
                    :
                    <View style={{ flex: 1 }}>
                        <Camera
                            ref={camera}
                            style={StyleSheet.absoluteFill}
                            device={device}
                            isActive={true}
                            // photo
                            video
                            audio
                        />
                        <>
                            {isRecording ? (
                                <View style={styles.recordingTimer}>
                                    <Text style={{ color: 'white' }}>{formatTime(recordingDuration)}</Text>
                                </View>
                            ) : null}
                            <Pressable
                                onPress={() => onStartRecording(plotVideo.id, 'userList')}
                                onLongPress={() => onStartRecording(plotVideo.id, 'userList')}
                                style={{
                                    position: 'absolute',
                                    alignSelf: 'center',
                                    bottom: 50,
                                    width: 75,
                                    height: 75,
                                    backgroundColor: isRecording ? 'red' : 'white',
                                    borderRadius: 75,
                                }}
                            />
                        </>
                    </View>
                : <>
                    <View style={{ flex: 1 }} >
                        <CustomHeader HandlerGoBack={HandlerGoBack} />
                        {isLoading ?
                            <View style={styles.loadingScreen}>
                                <LoadingScreen />
                            </View> : null}
                        <FormsTitle title={"Plot Information"} />
                        <View style={styles.container}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {
                                    plotType == "add" ?
                                        <InputTextForm label={t('addland_select_plot')} color="red"
                                            value={plotDetails.name} onChangeText={onchangePlotName}
                                        />
                                        : <DropdownForm label={t('select_plot')} color={"red"} data={agri_land_user_rels}
                                            onChange={onChangePlotDetails}
                                            val={plotDetails.name}
                                        />
                                }

                                <InputTextForm label={t('khatian_no')} value={khasraNo}
                                    onChangeText={onChangeKhatianNo} />
                                <DropdownForm label={t('select_terrain_type')} color={"red"}
                                    data={terrainTypeAll} val={treeainTypeData.name} onChange={onChangeTreeType} />
                                <DropdownForm label={t('select_land_type')} color={"red"}
                                    data={landTypeAll} val={landTypeAllData.name}
                                    onChange={onChangelandType}
                                />
                                <DropdownForm label={t('addland_soil_type')} color={"red"}
                                    data={soilTypeAll} val={soilTypeData.name}
                                    onChange={onChangeSoilType}
                                />
                                <View style={styles.expectedproducessUnitContainer}>
                                    <View style={styles.expectedproducess}>
                                        <InputTextForm label={t('addland_landsize')} color={"red"}
                                            onChangeText={onChangeyieldamount}
                                            value={landSize}
                                        />
                                    </View>
                                    <View style={styles.unit}>
                                        <DropdownForm label={t('select_unit')} color={"red"}
                                            data={unitAll}
                                            onChange={onChangeProductionUnit}
                                            val={landUnitData.name}
                                        />
                                    </View>
                                </View>
                                {
                                    location.map((data, index) => <TouchableOpacity key={index} onPress={() => handleCurrentLatLong(index)}>
                                        <View style={styles.latlongContainer}>
                                            <Text style={styles.title}>{data.latitude == "" ? "0.0" : data.latitude}</Text>
                                            <Text style={styles.title}>{data.longitude == "" ? "0.0" : data.longitude}</Text>
                                        </View>
                                        <View style={styles.latlongContainer}>
                                            <Text style={styles.title}>{t('tap_to_get_latitude_and_longitude')}</Text>
                                            {/* <TouchableOpacity onPress={() => handleCurrentLatLong(index)}> */}
                                            <Image
                                                source={require('../../Common/images/location.png')}
                                                style={{ width: 40, height: 40 }}
                                                resizeMode="contain"
                                            />
                                            {/* </TouchableOpacity> */}
                                        </View>
                                    </TouchableOpacity>)
                                }
                                <Text style={[styles.title, { marginVertical: 20 }]}>Photographs of Plot</Text>
                                <View style={styles.photographsContainer}>
                                    {photographs.map((data, index) => {
                                        if (index < 4) {
                                            return (
                                                <BottomSheetTakePhoto key={index}
                                                    openlaunchCamera={() => openlaunchCamera(data.id, index)}
                                                    openlaunchImageLibrary={() => openlaunchImageLibrary(data.id, index, "")}
                                                    uploadTreeImage={data}
                                                    TakePhoto={"Take Photo"}
                                                    ChooseFromGallery={"Choose From Gallery"}
                                                    Cancel={"Cancel"}
                                                    height={240}
                                                />
                                            )
                                        }
                                    })}
                                </View>
                                <Text style={[styles.title, { marginVertical: 20 }]}>UPload Land Record as proof of ownership</Text>
                                <TouchableOpacity onPress={() => openlaunchImageLibrary(plotRecord.id, 5, 'plotRecord')}>
                                    {plotRecord.name == "" ? <Image source={require('../../Common/images/adobereader.png')} style={{ width: 80, height: 80 }} />
                                        : <Image
                                            source={{ uri: plotRecord.uri }}
                                            style={{ width: 60, height: 60, marginBottom: 10 }}
                                            resizeMode="contain"
                                        />}
                                </TouchableOpacity>
                                <View style={{ marginVertical: 20 }}>
                                    <BottomSheetTakePhoto
                                        title={"Short Video Clip of Plantation"}
                                        openlaunchCamera={() => { setRecordingStart(true), SPSheet.hide() }}
                                        openlaunchImageLibrary={() => { setRecordingStart(true), SPSheet.hide() }}
                                        // uploadTreeImage={photographsFour}
                                        TakePhoto={"Take Video"}
                                        // ChooseFromGallery={"Choose From Gallery"}
                                        Cancel={"Cancel"}
                                        height={200}
                                        VideoProps={plotVideo.uri}
                                    />
                                </View>
                                {
                                    storePlotArray.map((data, index) => {
                                        const { plotName, treeainTypeDataName } = data;
                                        return (
                                            <View style={styles.moreContainer} key={index}>
                                                <View style={styles.moreTextContainer}>
                                                    <Text style={styles.title}>{plotName}</Text>
                                                    <Text style={styles.title}>{treeainTypeDataName}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => produceRemoveDetails(index)}>
                                                    <Image source={require('../../Common/images/x-mark.png')} style={styles.xMarkImage} />
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    })

                                }
                                <TouchableOpacity style={styles.btnAddPlot} onPress={addMorePlot}>
                                    <Text style={[styles.title, { color: "#FFF", textAlign: 'center' }]}>{t('click_to_add_more_plot')}</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.locationAddMoreContainer}
                        onPress={addMoreLocation}
                    >
                        <Text style={[styles.title, { color: '#FFF', marginRight: 20 }]}>Add Location</Text>
                    </TouchableOpacity>
                    <ButtonForm label={"Submit"}
                        onPress={plotType == "add" ? addUserLand : onPressSubmit}
                    />
                </>
            }
        </Root>
    )
}

export default LiveHood

const styles = StyleSheet.create({
    container: {
        marginHorizontal: "2.5%",
        marginBottom: 350
    },
    expectedproducessUnitContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    expectedproducess: {
        width: '45%'
    },
    unit: {
        width: '45%'
    },
    latlongContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        marginHorizontal: 5
    },
    title: {
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    },
    btn: {
        padding: 10
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#FFF', padding: 8, borderRadius: 5, elevation: 1
    },
    latLongContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center',
        padding: 8,
    },
    addDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: '7%'
    },
    loadingScreen: {
        position: 'absolute',
        top: "50%",
        zIndex: 999,
        left: '45%'
    },
    locationAddMoreContainer: {
        position: 'absolute',
        bottom: 100,
        right: 0,
        backgroundColor: '#025502',
        paddingVertical: 10,
        paddingLeft: 20,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    photographsContainer: {
        flexDirection: "row",
        justifyContent: "space-around"
    },
    recordingTimer: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 40,
        fontSize: 15,
        padding: 10,
        backgroundColor: 'red',
        elevation: 10,
        position: 'absolute',
        bottom: 150,
        borderRadius: 25,
    },
    btnAddPlot: {
        backgroundColor: '#025502',
        padding: 10,
        marginBottom: 30,
        textAlign: 'center',
        borderRadius: 50,
        marginHorizontal: '20%',
        width: '60%',
        alignItems: 'center'
    },
    moreContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: '10%',
        marginVertical: '3%'
    },
    xMarkImage: {
        width: 20,
        height: 20
    },
    moreTextContainer: {
        borderLeftWidth: 5,
        borderLeftColor: 'green',
        paddingLeft: 10
    }

})