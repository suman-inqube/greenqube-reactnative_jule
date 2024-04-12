import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import { useTranslation } from 'react-i18next';
import SoilHealthManagementController from '../../ViewController/SoilHealthManagementController';
const SoilHealthManagement = () => {
    const { t } = useTranslation()
    const { navigateToPages } = SoilHealthManagementController();
    return (
        <View style={styles.container}>
            <CustomHeader />
            <FormsTitle title={t("soil_health_management")} />
            <View style={styles.containerItem}>
                <TouchableOpacity style={styles.itemList} onPress={() => navigateToPages("PostRequest")}>
                    <Image
                        style={{ width: 100, height: 100, resizeMode: 'stretch' }}
                        source={{ uri: 'https://mygreenqube.com/agri_company_api/uploads/crops/1692013756764-313dtY-LOEL.jpg' }}
                    />
                    <Text style={styles.title}>{t('request_soil_testing')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.itemList} onPress={() => navigateToPages("PostRequest")}>
                    <Image
                        style={{ width: 100, height: 100, resizeMode: 'stretch' }}
                        source={{ uri: 'https://mygreenqube.com/agri_company_api/uploads/crops/1692013756764-313dtY-LOEL.jpg' }}
                    />
                    <Text style={styles.title}>{t('my_soil')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default SoilHealthManagement

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    containerItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'row'
    },
    itemList: {
        alignItems: 'center'
    },
    title: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'Poppins-Regular'
    }
})