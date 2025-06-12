import React, { useState, useEffect } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { getItem } from '../../../config/getDataFromStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
const ModalCompProduct = (props) => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    return (
        <View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={props.modalVisible}
                onRequestClose={() => {
                    props.setModalVisible(!props.modalVisible);
                }}
                propagateSwipe={true}
                backdropOpacity={2}
                scrollHorizontal={true}
                backdropColor={"#f90000"}
            >
                <TouchableOpacity style={[styles.container, props.style]} activeOpacity={1}
                //  onPress={() => props.setModalVisible(!props.modalVisible)}
                >
                    <View style={styles.modalView}>
                        <View style={styles.modelTitleContainer}>
                            <Text style={{ color: '#000', fontSize: 18, width: '90%' }}>{t('product_detail')}</Text>
                            <TouchableOpacity onPress={() => props.setModalVisible(!props.modalVisible)}>
                                <Text style={{ fontSize: 25, color: '#000' }}>✖</Text>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <View style={styles.productContainer}>
                                <View style={[styles.elevation, { width: '40%', height: 100 }]}>
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
                                <TouchableOpacity activeOpacity={1} style={{ width: '60%', marginLeft: 10, height: 180, }}>
                                    <ScrollView style={{ height: "100%" }}  >
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'green' }}>{props.inputSigle.product_name}</Text>
                                        <Text style={styles.productTitle}>
                                            {props.inputSigle.productCategories ? props.inputSigle.productCategories[0].productCategory.name : ''}
                                        </Text>
                                        <Text style={styles.productTitle}>{props.inputSigle.product_code}</Text>
                                        <Text style={styles.productTitle}>{props.inputSigle.description}</Text>

                                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'red' }}>{t('price')}</Text>
                                        {
                                            props.inputSigle.agri_product_prices
                                                ?
                                                props.inputSigle.agri_product_prices.map((item, index) => (
                                                    <Text style={styles.productTitle} key={index}>
                                                        <Text style={styles.strikethroughText} >
                                                            {item.discounted_price}/{item.agri_unit.unit_name}
                                                        </Text>  {item.discounted_price}/{item.agri_unit.unit_name}
                                                    </Text>
                                                ))
                                                :
                                                ""
                                        }
                                    </ScrollView>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', paddingBottom: 20 }}>
                                {
                                    props.inputSigle.agri_files
                                        ?
                                        props.inputSigle.agri_files.slice(1).map((item, index) => (
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
                                            }} key={index}>
                                                <Image
                                                    source={{ uri: item.file_path }}
                                                    style={{ width: 50, height: 40, }} key={index}
                                                />
                                            </View>
                                        ))
                                        :
                                        ""
                                }
                            </View>
                            <View style={styles.buyBtn}>
                                <TouchableOpacity onPress={() => navigation.navigate('WantToBuy')}><Text style={styles.btnTitle}>{t('buy_lease_request')}</Text></TouchableOpacity>
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
        color: '#000',
        fontSize: 14,
    },
    strikethroughText: {
        textDecorationLine: 'line-through',
        color: 'red',
    },
})