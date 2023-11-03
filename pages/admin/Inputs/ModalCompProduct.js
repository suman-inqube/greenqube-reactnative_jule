import React, { useState, useEffect } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { getItem } from '../../../config/getDataFromStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
const ModalCompProduct = (props) => {
    // console.log(JSON.stringify(props.inputSigle.agri_files[0].file_path, null, 2))
    const navigation = useNavigation();

    return (
        <View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={props.modalVisible}
                onRequestClose={() => {
                    props.setModalVisible(!props.modalVisible);
                }}>
                <TouchableOpacity style={[styles.container, props.style]} activeOpacity={1} onPress={() => props.setModalVisible(!props.modalVisible)} >
                    <View style={styles.modalView}>
                        <View style={styles.modelTitleContainer}>
                            <Text style={{ color: '#000', fontSize: 18 }}>Product Detail</Text>
                            <TouchableOpacity onPress={() => props.setModalVisible(!props.modalVisible)}>
                                <Text style={{ fontSize: 35, fontWeight: 'bold', color: '#000' }}>x</Text>
                            </TouchableOpacity>
                        </View>
                        <View>

                            <View style={styles.productContainer}>
                                <View style={[styles.elevation, { width: '50%', height: 100 }]}>
                                    {
                                        props.inputSigle.agri_files && props.inputSigle.agri_files.length > 0 ? 
                                        <Image
                                            source={{ uri: props.inputSigle.agri_files[0].file_path }}
                                            style={{ width: 100, height: 100 }}
                                        />
                                        :
                                        <Image
                                        source={require('../../Common/images/logo.png')}
                                        style={{ width: 100, height: 100 }} />
                                        

                                    }


                                </View>
                                <View style={{ width: '50%', marginLeft: 10 }}>
                                    <Text style={styles.productTitle}>{props.inputSigle.product_name}</Text>
                                    <Text style={styles.productTitle}>
                                        {props.inputSigle.productCategories ? props.inputSigle.productCategories[0].productCategory.name : ''}
                                    </Text>

                                    <Text style={styles.productTitle}>{props.inputSigle.product_code}</Text>
                                    <Text style={styles.productTitle}>{props.inputSigle.product_name}</Text>
                                    <Text style={styles.productTitle}>Price</Text>
                                    <Text style={styles.productTitle}>
                                        {props.inputSigle.agri_product_prices && props.inputSigle.agri_product_prices[0].discounted_price}/{props.inputSigle.agri_product_prices && props.inputSigle.agri_product_prices[0].agri_unit.unit_name}
                                    </Text>

                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', paddingBottom: 20 }}>
                                <View style={{
                                    backgroundColor: '#FFF',
                                    borderRadius: 5, shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    margin: 5,
                                    elevation: 5,
                                }}>
                                    <Image
                                        source={require('../../Common/images/logo.png')}
                                        style={{ width: 50, height: 40, }}
                                    />
                                </View>
                                <View style={{
                                    backgroundColor: '#FFF',
                                    borderRadius: 5, shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    margin: 5,
                                    elevation: 5,
                                }}>
                                    <Image
                                        source={require('../../Common/images/logo.png')}
                                        style={{ width: 50, height: 40, }}
                                    /></View>
                                <View View style={{
                                    backgroundColor: '#FFF',
                                    borderRadius: 5, shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    margin: 5,
                                    elevation: 5,
                                }}>
                                    <Image
                                        source={require('../../Common/images/logo.png')}
                                        style={{ width: 50, height: 40, }}
                                    />
                                </View>
                            </View>
                            <View style={styles.buyBtn}>
                                <TouchableOpacity onPress={()=> navigation.navigate('WantToBuy')}><Text style={styles.btnTitle}>BUY / LEASE REQUEST</Text></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}
export default ModalCompProduct
const styles = StyleSheet.create({
    container: {
        // position: 'absolute',
        // bottom: '55%',
        // width: '100%',
        // position:'relative'
    },
    modalView: {
        width: '90%',
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 20,
        elevation: 10
    },
    button: {
        borderRadius: 20,
        padding: 10,

    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',

    },
    modalText: {
        marginBottom: 15,

    },
    elevation: {
        backgroundColor: '#FFF',
        borderRadius: 5, shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        margin: 5,
        elevation: 5,
        alignItems: 'center'
    },
    buyBtn: {
        backgroundColor: '#fab803f8',
        marginHorizontal: 40,
        padding: 15,
        borderRadius: 30,
        marginBottom: 30
    },
    btnTitle: {
        color: '#FFF',
        textAlign: 'center',
        fontWeight: '700',
    },
    modelTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12
    },
    productContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10
    },
    productTitle: {
        marginVertical: 3,
        color: '#000'
    }
})