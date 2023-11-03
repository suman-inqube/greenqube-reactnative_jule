import { StyleSheet, Text, View, Modal, TouchableOpacity, FlatList } from 'react-native'
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
                            {
                                props.companyData
                                    ?

                                    <FlatList
                                        data={props.companyData}
                                        renderItem={({ element, index }) => {
                                            // console.log(JSON.stringify(props.companyData,null,2))
                                            return (
                                                <TouchableOpacity style={styles.wrapper} onPress={() => console.log("nice")}>
                                                    <View style={styles.item}>
                                                        <Text style={styles.itemText}>
                                                            {element}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        }}
                                        keyExtractor={(item, index) => index}
                                        showsVerticalScrollIndicator={false}
                                    />
                                    : ''
                            }

                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default SplashScreenModal

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: 5,
        paddingVertical: 5,
        backgroundColor: '#B0D9B1',
        borderRadius: 20
    },
    modalView: {
        backgroundColor: '#FFF',
        width: '95%'
    },
    modelTitleContainer: {

        width: '95%',
        margin: '2.5%',
        borderRadius: 10
    },
    item: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginVertical: 5,
        alignItems: 'center',
        marginBottom: 5
    },

    itemText: {
        width: '100%',
        textAlign: 'center',
    },

})