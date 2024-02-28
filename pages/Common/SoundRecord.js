import React, { useState } from 'react';
import { Alert, Modal, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SoundRecord = ({
    modalVisibleRecord,
    setModalVisibleRecord,
    onStopRecordFirstItem,
    onStartRecordFirstItem,
    soundRecord,
}) => {
    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisibleRecord}
                onRequestClose={() => {
                    onStopRecordFirstItem();
                    setModalVisibleRecord(!modalVisibleRecord);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalHedingText}>Audio Record</Text>
                        {soundRecord.isLoggingIn ?
                            <Image
                                source={require('../Common/images/audio-wave.gif')}
                                style={{ width: 100, height: 80 }}
                            /> :
                            <View></View>
                        }
                        <Text>{soundRecord.recordTime}</Text>
                        {soundRecord.isLoggingIn ?
                            <TouchableOpacity onPress={()=>{onStopRecordFirstItem();setModalVisibleRecord(!modalVisibleRecord)}}>
                                <Image
                                    source={require('../Common/images/stop.png')}
                                    style={{ width: 40, height: 40, }}
                                />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={onStartRecordFirstItem}>
                                <Image
                                    source={require('../Common/images/start.png')}
                                    style={{ width: 40, height: 40, }}
                                />
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default SoundRecord

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
        alignItems: 'center'
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
        // marginVertical: 10,
        // marginBottom: 20,
    },

    title: {
        textAlign: 'center',
        color: '#000',
        fontSize: 15
    }
});