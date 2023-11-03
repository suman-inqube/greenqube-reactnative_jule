import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native'
import React from 'react'


const SplashScreenModal = (props) => {
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
                                    <Text style={styles.itemText}>Name</Text>
                                    <Text style={styles.itemText}>: {props.outputSingle.others}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default SplashScreenModal

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