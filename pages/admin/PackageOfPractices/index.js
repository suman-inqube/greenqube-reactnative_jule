import { Image, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import React from 'react';
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import { useTranslation } from 'react-i18next';
import LivelihoodFilterModal from './LivelihoodFilterModal';
import PackageOfPracticesController from '../../ViewController/PackageOfPracticesController';
import LoadingScreen from '../../Common/LoadingScreen';
const PackageOfPractices = () => {
    const { t } = useTranslation();
    const { isLoading,
        livelihoodType,
        modalVisible,
        setModalVisible,
        navigation,
        packageList,
        HandlerGoBack,
        productFilter,
        onChangeDetails,
        livehoodTypeFilterData
    } = PackageOfPracticesController();
    return (
        <View style={{ flex: 1 }}>
            <LivelihoodFilterModal style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
                width: '100%',
                paddingVertical: 10
            }}
                setModalVisible={setModalVisible}
                modalVisible={modalVisible}
                data={livelihoodType}
                productFilter={productFilter}
            />
            <CustomHeader HandlerGoBack={() => HandlerGoBack('FarmerDashboard', '')} />
            {isLoading ? <View style={styles.loadingScreen}><LoadingScreen /></View> : null}
            <TouchableOpacity style={styles.filterItem} onPress={() => setModalVisible(true)}>
                <Text style={styles.title}>{livehoodTypeFilterData.name == "" ? t('select_crop_type') : livehoodTypeFilterData.name}</Text>
                <Image source={require('../../Common/images/filter100.png')}
                    style={styles.filterImg} />
            </TouchableOpacity>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={packageList}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity onPress={() => onChangeDetails(item)}
                            style={styles.FlatListItem}>
                            {
                                item.agri_files.length != 0 ?
                                    <Image
                                        style={styles.FlatListItemImg}
                                        source={{ uri: item.agri_files[0].file_path }}
                                    /> :
                                    <Image source={require('../../Common/images/apple.png')}
                                        style={styles.FlatListItemImg} />
                            }
                            <Text style={[styles.title, { color: '#000' }]}>{item.label}</Text>
                        </TouchableOpacity>
                    )
                }}
                //Setting the number of column
                numColumns={3}
                keyExtractor={(item, index) => index.toString()}
            />
        </View>
    )
}

export default PackageOfPractices

const styles = StyleSheet.create({
    filterItem: {
        backgroundColor: 'green',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 7,

    },
    title: {
        color: '#FFF',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        textAlign: 'center'
    },
    FlatListItem: {
        flex: 1,
        flexDirection: 'column',
        // margin: 1,
        padding: 20,
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        borderRadius: 10,
        backgroundColor: '#FFF',
        elevation: 1,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 100,
        margin: 5
    },
    FlatListItemImg: {
        width: 60,
        height: 60,
        resizeMode: "contain",
    },
    loadingScreen: {
        position: 'absolute',
        top: '60%',
        zIndex: 999,
        left: '45%'
    },
    filterImg: {
        width: 20,
        height: 20,
        tintColor: '#FFF',
        resizeMode: "contain",
    }
})