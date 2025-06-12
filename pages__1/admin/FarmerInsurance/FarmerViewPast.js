import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import { userCreateContext } from '../../Context/usersCreateContext';
const FarmerViewPast = (props) => {
    const { ins_plots, agri_user } = props.modalVisibleData;
    const { t } = useContext(userCreateContext);
    if (agri_user != undefined) {
        let mydate = new Date(agri_user.CreateDateTime.split("T")[0]);
        return (
            <View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={props.modalVisible}
                    onRequestClose={() => {
                        props.setModalVisible(!props.modalVisible);
                    }}
                >
                    <TouchableOpacity style={[styles.container, props.style]} activeOpacity={1} onPress={() => props.setModalVisible(!props.modalVisible)}  >
                        <View style={styles.modalView}>
                            <View style={styles.modelTitleContainer}>
                                <View style={styles.itemContainer}>
                                    <View style={styles.item}>
                                        <Text style={styles.itemText}>{t('far_list_plot')}</Text>
                                        <Text style={styles.itemText}>:{
                                            ins_plots && ins_plots.map((data, index) => {
                                                return (
                                                    <Text key={index}> {data.agri_land_user_rel.plot_no}{ins_plots.length > 1 && ins_plots.length - 1 > index ? ",  " : ""}</Text>
                                                )
                                            })
                                        } </Text>
                                    </View>
                                    <View style={styles.item}>
                                        <Text style={styles.itemText}>{t('addcrop_cropname')}</Text>
                                        <Text style={styles.itemText}>:
                                            {
                                                ins_plots && ins_plots.map((data, index) => (
                                                    data.agri_land_user_rel.plot_crops.map((cropsData, cropsIndex) => {
                                                        return (
                                                            <Text key={cropsIndex}> {cropsData.crop_name.name}{ins_plots.length > 1 && ins_plots.length - 1 > index ? ",  " : ""}</Text>
                                                        )
                                                    })
                                                ))
                                            }</Text>
                                    </View>
                                    <View style={styles.item}>
                                        <Text style={styles.itemText}>{t('crop_name')}</Text>
                                        <Text style={styles.itemText}>: {agri_user.userName}</Text>
                                    </View>
                                    <View style={styles.item}>
                                        <Text style={styles.itemText}>{t('farmer_number')}</Text>
                                        <Text style={styles.itemText}>:  {agri_user.contactNumber}</Text>
                                    </View>
                                    <View style={styles.item}>
                                        <Text style={styles.itemText}>{t('required_date')}</Text>
                                        <Text style={styles.itemText}>: {mydate.toString().substring(4, 15)}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        )
    }
}

export default FarmerViewPast

const styles = StyleSheet.create({
    container: {

    },
    modalView: {
        backgroundColor: '#FFF',
        width: '90%',
        borderRadius: 10
    },
    modelTitleContainer: {
        backgroundColor: '#165A2B',
        width: '95%',
        margin: '2.5%',
        borderRadius: 10
    },
    itemContainer: {
        paddingVertical: 8
    },
    item: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginVertical: 5,
        alignItems: 'center'
    },
    itemText: {
        width: '50%',
        color: '#FFF'
    },
    line: {
        backgroundColor: '#FFF',
        height: 3,
        marginHorizontal: 3,
        borderRadius: 10
    }
})