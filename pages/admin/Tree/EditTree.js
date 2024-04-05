import { StyleSheet, Text, View, Image, TouchableOpacity, Pressable } from 'react-native'
import React, { useEffect } from 'react';
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import DropdownForm from '../../Common/DropdownForm';
import InputTextForm from '../../Common/InputTextForm';
import { ScrollView } from 'react-native-gesture-handler';
import ButtonForm from '../../Common/ButtonForm';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import TreeController from '../../ViewController/TreeController';
import { Root, SPSheet } from 'react-native-popup-confirm-toast';
import DatePickerComp from '../../Common/DatePickerComp';
import PlotModel from '../../Common/PlotModel';
import LoadingScreen from '../../Common/LoadingScreen';
import BottomSheetTakePhoto from '../../Common/BottomSheetTakePhoto';
const EditTree = () => {
    const navigation = useNavigation();
    const { farmerDataList,
        onChangeGrowerName,
        onChangePlot,
        farmerPhoneNumber,
        farmerName,
        plotAll,
        productionSeason,
        onChangeProductionSeason,
        plantingSeason,
        productionProcess,
        treeType,
        onChangeTreeType,
        treeName,
        onChangeTreeName,
        treeNameData,
        productionUnit,
        species,
        onChangeSpecies,
        onChangeProductionProcess,
        onChangeProductionUnit,
        openlaunchCamera,
        openlaunchImageLibrary,
        uploadTreeImage,
        openFromDate,
        newFromDate,
        fromDate,
        setOpenFromDate,
        handleDatePicker,
        location,
        onChangeCurrentLatLong,
        onChangeyieldamount,
        onChangeTreeId,
        onChangeSaved,
        plotData,
        treeData,
        speciesData,
        productionProcessData,
        yield_amount,
        productionUnitData,
        addTreeArray,
        produceRemoveDetails,
        treeId,
        plotDetails,
        modalVisible,
        setModalVisible,
        treeIdRef,
        greenZownuserCropEdit,
        onTouchStart,
        isLoading
    } = TreeController("editTree");
    const { t } = useTranslation();
    const HandlerGoBack = () => {
        navigation.navigate('Dashboard');
    }
    return (
        <Root>
            <View style={{ flex: 1 }} >
                <CustomHeader HandlerGoBack={HandlerGoBack} />
                {isLoading ? <View style={styles.loadingScreen}><LoadingScreen /></View> : null}
                <FormsTitle title={"Edit Tree"} />
                <DatePickerComp
                    openDate={openFromDate}
                    newDate={newFromDate}
                    setOpenDate={setOpenFromDate}
                    handleDatePicker={handleDatePicker}
                />
                {plotDetails.length > 0 && <PlotModel plotDetails={plotDetails} modalVisible={modalVisible} setModalVisible={setModalVisible} onChangeTreeId={onChangeTreeId} />}
                <View style={styles.container}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <DropdownForm data={farmerDataList} label={t('farmer_name')} color={"red"} onChange={onChangeGrowerName} val={farmerName} />
                        <InputTextForm label={t('farmer_number')} color={"red"} value={farmerPhoneNumber} />
                        <DropdownForm label={t('select_plot')} color={"red"} data={plotAll} onChange={onChangePlot} val={plotData.plotName} />
                        <InputTextForm label={t('tree_id')} color={"red"} onTouchStart={onTouchStart} value={treeId.treeName} refname={treeIdRef} />
                        <DropdownForm label={t('addcrop_select_cultivating_season')} color={"red"} data={productionSeason} onChange={onChangeProductionSeason} val={plantingSeason.plantingSeasonName} />
                        <DropdownForm label={t('select_crop_type')} color={"red"} data={treeType} onChange={onChangeTreeType} val={treeData.treeName} />
                        <DropdownForm label={t('select_crop_name')} color={"red"} data={treeName} onChange={onChangeTreeName} val={treeNameData.treeName} />
                        <DropdownForm label={t('select_crop_variety')} color={"red"} data={species} onChange={onChangeSpecies} val={speciesData.speciesName} />
                        <DropdownForm label={t('production_system')} color={"red"} data={productionProcess} onChange={onChangeProductionProcess} val={productionProcessData.productionProcessName} />
                        <View style={styles.expectedproducessUnitContainer}>
                            <View style={styles.expectedproducess}>
                                <InputTextForm label={t('expected_yield')} color={"red"} onChangeText={onChangeyieldamount} value={yield_amount} />
                            </View>
                            <View style={styles.unit}>
                                <DropdownForm label={t('select_unit')} color={"red"} data={productionUnit} onChange={onChangeProductionUnit} val={productionUnitData.productionUnitName} />
                            </View>
                        </View>
                        <BottomSheetTakePhoto
                            title={"Upload Tree Image"}
                            openlaunchCamera={openlaunchCamera}
                            openlaunchImageLibrary={openlaunchImageLibrary}
                            uploadTreeImage={uploadTreeImage}
                            TakePhoto={"Take Photo"}
                            ChooseFromGallery={"Choose From Gallery"}
                            Cancel={"Cancel"}
                            height={240}
                        />
                        <View>
                            <Text style={[styles.title, { color: 'red' }]}>{t('showing_date')}</Text>
                            <TouchableOpacity onPress={() => setOpenFromDate(true)} style={styles.dateContainer}>
                                <Text style={styles.title}>{fromDate}</Text>
                                <Image
                                    source={require('../../Common/images/calendar.png')}
                                    style={{ width: 30, height: 30 }}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={onChangeCurrentLatLong}>
                            <View style={styles.latlongContainer}>
                                <Text style={[styles.title, { color: 'red' }]}>{t('tap_to_get_latitude_and_longitude')}</Text>
                                <Image
                                    source={require('../../Common/images/location.png')}
                                    style={{ width: 40, height: 40 }}
                                    resizeMode="contain"
                                />
                            </View>
                            <View style={styles.latLongContainer}>
                                <Text style={styles.title}>{location.latitude}</Text>
                                <Text style={styles.title}>{location.longitude}</Text>
                            </View>
                        </TouchableOpacity>
                        {
                            addTreeArray.map((data, index) => {
                                return (
                                    <View key={index} style={styles.addDetails}>
                                        <View style={{ borderLeftColor: "#000", borderLeftWidth: 5, marginVertical: 10 }}>
                                            <Text style={[styles.title, { paddingHorizontal: 10 }]}>{data.plotName}</Text>
                                            <Text style={[styles.title, { paddingHorizontal: 10 }]}>{data.treeNameDataName}</Text>
                                            <Text style={[styles.title, { paddingHorizontal: 10 }]}>{data.speciesDataName}</Text>
                                        </View>
                                        <View>
                                            <TouchableOpacity onPress={() => produceRemoveDetails(index)}>
                                                <Image
                                                    source={require('../../Common/images/cross.png')}
                                                    style={{ width: 20, height: 20, marginBottom: 10 }}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </ScrollView>
                </View>
            </View>
            <ButtonForm label={"Submit"} onPress={greenZownuserCropEdit} />
        </Root>
    )
}

export default EditTree

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

})