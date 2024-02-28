
import React from 'react'
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const HarvestedModel = ({
    setModalVisible,
    modalVisible,
    handleHarvested
}) => {
    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalHedingText}>Your previous crop has been harvested</Text>
                        <TouchableOpacity style={styles.item} onPress={() => { handleHarvested("same produce"); setModalVisible(!modalVisible) }}>
                            <Text style={styles.title}>Do you want to continue with the same Produce</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.item} onPress={() => { handleHarvested("add new Produce"); setModalVisible(!modalVisible) }}>
                            <Text style={styles.title}>Do you want to add new Produce</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default HarvestedModel

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        // alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        paddingBottom: 25,
        // paddingHorizontal: 20
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        color: '#000'
    },
    modalHedingText: {
        color: '#000',
        fontWeight: '500',
        textAlign: 'center',
        fontSize: 16,
        marginVertical: 10,
        marginBottom: 20,
    },
    item: {
        alignItems: 'center',
        backgroundColor: '#d8f3e0',
        marginVertical: 5,
        borderRadius: 30,
        height: 50,
        justifyContent: 'center'
    },
    title: {
        textAlign: 'center',
        color: '#000',
        fontSize: 15
    }
});