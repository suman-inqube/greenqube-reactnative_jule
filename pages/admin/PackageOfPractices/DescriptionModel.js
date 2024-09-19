import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native'
import React from 'react'

const DescriptionModel = (props) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.modalVisible}
            onRequestClose={() => {
                props.setModalVisible(!props.modalVisible);
            }}>
            <TouchableOpacity
                style={[styles.container, props.style]}
                activeOpacity={1}
                onPress={() => props.setModalVisible(!props.modalVisible)}
            >
                <View style={styles.modalView}>
                    <Text style={styles.title}>{props.description}</Text>
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

export default DescriptionModel

const styles = StyleSheet.create({
    modalView: {
        backgroundColor: '#faf6f6',
        width: '95%',
        marginHorizontal: '5.8%',
        borderRadius: 15,
        overflow: 'hidden',
        padding: '5%'
    },
    title: {
        width: '100%',
        textAlign: 'center',
        color: '#000',
        fontFamily: 'Poppins-Regular'
    },
})