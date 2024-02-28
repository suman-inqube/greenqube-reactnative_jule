import { StyleSheet, Text, View, Modal, TouchableOpacity, FlatList,Dimensions, Keyboard } from 'react-native'
import React from 'react'


const SplashScreenModalLanguage = (props) => {
    const handleDBName = (item) => {
       props.sendDataToParentLan(item);

    }
    return (
        <View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={props.modalVisibleLan}
                onRequestClose={() => {
                    props.setModalVisibleLan(!props.modalVisibleLan);
                }}
            >
                <TouchableOpacity style={[styles.container, props.style]} activeOpacity={1} >
                    <View style={styles.modalView}>
                        <View style={styles.modelTitleContainer}>
                            <FlatList
                            showsVerticalScrollIndicator={false}
                                data={props.companyData}
                                renderItem={({ item }) => {
                                    return (
                                        <TouchableOpacity style={styles.wrapper} onPress={() => handleDBName(item.id)}>
                                            <View style={styles.item}>
                                                <Text style={styles.itemText}>{item.name}</Text>

                                            </View>
                                        </TouchableOpacity>
                                    )
                                }}
                                keyExtractor={(item, index) => index}
                            />

                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default SplashScreenModalLanguage

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: 5,
        paddingVertical: 5,
        backgroundColor: '#B0D9B1',
        borderRadius: 20
    },
    modalView: {
        backgroundColor: '#FFF',
        width: '90%',
        // height:'80%',
        borderRadius:20,
        marginVertical:30
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
        color:'#000',
        fontFamily: 'Poppins-Regular'
    },

})