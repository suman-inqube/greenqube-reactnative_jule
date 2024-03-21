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
        photographsOne,
        photographsTwo,
        photographsThree,
        photographsFour,
        openlaunchCamera,
        openlaunchImageLibrary,
        openlaunchCameraVider,
        onPressSubmit } = LiveHoodController(farmeruserID);
    const HandlerGoBack = () => {
        navigation.navigate('Dashboard');
    }
    return (
        <Root>
            <View style={{ flex: 1 }} >
                <CustomHeader HandlerGoBack={HandlerGoBack} />
                {isLoading ? <View style={styles.loadingScreen}><LoadingScreen /></View> : null}
                <FormsTitle title={"Plot Information"} />
                {/* {plotDetails.length > 0 && <PlotModel plotDetails={plotDetails} modalVisible={modalVisible} setModalVisible={setModalVisible} onChangeTreeId={onChangeTreeId} />} */}
                <View style={styles.container}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <DropdownForm label={t('select_plot')} color={"red"} data={agri_land_user_rels}
                            onChange={onChangePlotDetails}
                        // val={plotData.plotName}
                        />
                        <InputTextForm label={t('khatian_no')} value={khasraNo} />
                        <DropdownForm label={t('select_plot')} color={"red"} data={terrainTypeAll} val={treeainTypeData.name} />
                        <DropdownForm label={t('select_plot')} color={"red"} data={landTypeAll} val={landTypeAllData.name} />
                        <DropdownForm label={t('select_plot')} color={"red"} data={soilTypeAll} val={soilTypeData.name} />
                        <View style={styles.expectedproducessUnitContainer}>
                            <View style={styles.expectedproducess}>
                                <InputTextForm label={t('expected_yield')} color={"red"}
                                    // onChangeText={onChangeyieldamount} value={yield_amount}
                                    value={landSize}
                                />
                            </View>
                            <View style={styles.unit}>
                                <DropdownForm label={t('select_unit')} color={"red"}
                                    data={unitAll}
                                    // onChange={onChangeProductionUnit}
                                    //  val={productionUnitData.productionUnitName}
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
                            {SPSheet && <BottomSheetTakePhoto
                                openlaunchCamera={() => openlaunchCamera("one")}
                                openlaunchImageLibrary={() => openlaunchImageLibrary("one")}
                                uploadTreeImage={photographsOne}
                                TakePhoto={"Take Photo"}
                                ChooseFromGallery={"Choose From Gallery"}
                                Cancel={"Cancel"}
                                height={240}
                            />}
                            {SPSheet && <BottomSheetTakePhoto
                                openlaunchCamera={() => openlaunchCamera("two")}
                                openlaunchImageLibrary={() => openlaunchImageLibrary("two")}
                                uploadTreeImage={photographsTwo}
                                TakePhoto={"Take Photo"}
                                ChooseFromGallery={"Choose From Gallery"}
                                Cancel={"Cancel"}
                                height={240}
                            />}
                            {SPSheet && <BottomSheetTakePhoto
                                openlaunchCamera={() => openlaunchCamera("three")}
                                openlaunchImageLibrary={() => openlaunchImageLibrary("three")}
                                uploadTreeImage={photographsThree}
                                TakePhoto={"Take Photo"}
                                ChooseFromGallery={"Choose From Gallery"}
                                Cancel={"Cancel"}
                                height={240}
                            />}
                            {SPSheet && <BottomSheetTakePhoto
                                openlaunchCamera={() => openlaunchCamera("foue")}
                                openlaunchImageLibrary={() => openlaunchImageLibrary("foue")}
                                uploadTreeImage={photographsFour}
                                TakePhoto={"Take Photo"}
                                ChooseFromGallery={"Choose From Gallery"}
                                Cancel={"Cancel"}
                                height={240}
                            />}
                        </View>
                        <Text style={[styles.title, { marginVertical: 20 }]}>UPload Land Record as proof of ownership</Text>
                        <Image source={require('../../Common/images/adobereader.png')} style={{ width: 80, height: 80 }} />
                        <View style={{ marginVertical: 20 }}>
                            <BottomSheetTakePhoto
                                title={"Short Video Clip of Plantation"}
                                openlaunchCamera={() => openlaunchCameraVider("foue")}
                                openlaunchImageLibrary={() => openlaunchImageLibrary("foue")}
                                uploadTreeImage={photographsFour}
                                TakePhoto={"Take Video"}
                                // ChooseFromGallery={"Choose From Gallery"}
                                Cancel={"Cancel"}
                                height={200}
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
            <TouchableOpacity style={styles.locationAddMoreContainer}
                onPress={addMoreLocation}
            >
                <Text style={[styles.title, { color: '#FFF', marginRight: 20 }]}>Add Location</Text>
            </TouchableOpacity>
            <ButtonForm label={"Submit"}
                onPress={onPressSubmit}
            />
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
    }
})