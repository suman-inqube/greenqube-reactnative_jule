import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native'
import React from 'react'
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';

const ViewModalPast = (props) => {
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
                            {
                                props.outputSingle ?
                                    <View style={styles.itemContainer}>
                                        {
                                            props.outputSingle.others ?

                                                <View style={styles.item}>
                                                    <Text style={styles.itemText}>Name</Text>
                                                    <Text style={styles.itemText}>: {props.outputSingle.others}</Text>
                                                </View>
                                                :
                                                <>
                                                    <View style={styles.item}>
                                                        <Text style={styles.itemText}>Plot/Site</Text>
                                                        <Text style={styles.itemText}>: {props.outputSingle.inout_plot_rel && props.outputSingle.inout_plot_rel.plot_no}</Text>
                                                    </View>
                                                    <View style={styles.item}>
                                                        <Text style={styles.itemText}>Produce Name</Text>
                                                        <Text style={styles.itemText}>: {props.outputSingle.io_crop_name && props.outputSingle.io_crop_name.name}</Text>
                                                    </View>
                                                    <View style={styles.item}>
                                                        <Text style={styles.itemText}>Produce Variety</Text>
                                                        <Text style={styles.itemText}>: {props.outputSingle.io_crop_variety && props.outputSingle.io_crop_variety.name}</Text>
                                                    </View>
                                                </>
                                        }
                                        <>
                                            <View style={styles.item}>
                                                <Text style={styles.itemText}>Qty & Unit</Text>
                                                <Text style={styles.itemText}>: {props.outputSingle.quantity && props.outputSingle.quantity}   {props.outputSingle.unit_id && props.outputSingle.unit_id}</Text>
                                            </View>

                                            <View style={styles.item}>
                                                <Text style={styles.itemText}>{'Farmer/ \nProducer Name'}</Text>
                                                <Text style={styles.itemText}>: {props.outputSingle.users && props.outputSingle.users.userName}</Text>
                                            </View>
                                            <View style={styles.item}>
                                                <Text style={styles.itemText}>Phone Number</Text>
                                                <Text style={styles.itemText}>: {props.outputSingle.users && props.outputSingle.users.contactNumber}</Text>
                                            </View>
                                            <View style={styles.item}>
                                                <Text style={styles.itemText}>Required Date</Text>
                                                <Text style={styles.itemText}>: {formatDateToMMDDYYYY(props.outputSingle.date)}</Text>
                                            </View>

                                        </>




                                    </View>
                                    : ''
                            }

                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default ViewModalPast

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