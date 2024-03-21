import { StyleSheet, Text, View, Modal, Dimensions, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'

const PlotModel = ({
    plotDetails,
    modalVisible,
    setModalVisible,
    onChangeTreeId }) => {
    return (
        <TouchableOpacity style={styles.centeredView} onPress={() => { setModalVisible(!modalVisible) }}>
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
                        <View style={{ maxHeight: Dimensions.get('window').height - 50 }}>
                            <ScrollView contentContainerStyle={styles.modalOuterContainer} showsVerticalScrollIndicator={false}>
                                {
                                    plotDetails.map((data, index) =>
                                        data.type ? <TouchableOpacity key={index} style={styles.item} onPress={() => { onChangeTreeId(data.unique_id, data.unique_fid), setModalVisible(!modalVisible) }}>
                                            <Text style={styles.title}>Tree Id : {data.unique_id}</Text>
                                        </TouchableOpacity> :
                                            <TouchableOpacity key={index} style={styles.item} onPress={() => { setModalVisible(!modalVisible) }}>
                                                <Text style={styles.title}>Tree Id : {data.unique_id}</Text>
                                                <Text style={styles.title}>Tree : {data.crop_name}</Text>
                                                <Text style={styles.title}>Species : {data.crop_variety}</Text>
                                                <Text style={styles.title}>Planttaion Date : {data.sowing_date}</Text>
                                            </TouchableOpacity>
                                    )
                                }
                            </ScrollView>
                        </View>
                    </View>
                </View>
            </Modal>
        </TouchableOpacity>
    )
}

export default PlotModel
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
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        // paddingBottom: 25,
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
        // marginVertical: 5,
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        // height: 50,
        justifyContent: 'center'
    },
    title: {
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
        color: '#000',
        fontSize: 15
    }
});