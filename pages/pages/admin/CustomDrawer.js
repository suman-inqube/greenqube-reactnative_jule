import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { removeItem } from '../../config/getDataFromStorage';
const CustomDrawer = (props) => {
    const {navigate}=useNavigation();
    const handleLogout=async()=>
    {
        await removeItem('loginUser_data')
        navigate('Login')
    }
    return (
        <View>
                <TouchableOpacity style={[styles.container, props.style]} activeOpacity={1} onPress={() => props.setModalVisible(!props.modalVisible)}>
                    <View style={styles.modalView}>
                        <TouchableOpacity style={styles.memuContainer} onPress={()=>navigate('Profile')}>
                            <View style={[styles.menuItem, { marginTop: 8 }]}>
                                <Image source={require('../Common/images/user_menu.png')}
                                style={[{ height: 28, width: 28, tintColor: '#FFF' }]} />
                                <Text style={styles.menuText}>Profile</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.memuContainer} >
                            <View style={styles.menuItem}>
                                <Image source={require('../Common/images/inncome_expence_menu.png')}
                                style={[{ height: 30, width: 30, tintColor: '#FFF' }]} />
                                <Text style={styles.menuText}>Business</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.memuContainer}>
                            <View style={styles.menuItem}>
                                <Image source={require('../Common/images/dash_sale_your_product_off.png')}
                                style={[{ height: 30, width: 30, tintColor: '#FFF' }]} />
                                <Text style={styles.menuText}>Daily Sales Report</Text>
                            </View></TouchableOpacity>
                        <TouchableOpacity style={styles.memuContainer}>
                            <View style={styles.menuItem}>
                                <Image source={require('../Common/images/soil.png')} 
                                style={[{ height: 30, width: 30, tintColor: '#FFF' }]}/>
                                <Text style={styles.menuText}>Training</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.memuContainer}>
                            <View style={styles.menuItem}>
                                <Image source={require('../Common/images/insurance_menu.png')}
                                style={[{ height: 25, width: 25 }]} />
                                <Text style={styles.menuText}>Farm Accounts</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.memuContainer} onPress={()=>navigate('Loan')}>
                            <View style={styles.menuItem}>
                                <Image source={require('../Common/images/dash_apply_for_loan_off.png')}
                                style={[{ height: 30, width: 30, tintColor: '#FFF' }]} />
                                <Text style={styles.menuText}>Loan</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.memuContainer}>
                            <View style={styles.menuItem}>
                                <Image source={require('../Common/images/dash_apply_for_insurance_off.png')}
                                style={[{ height: 30, width: 30, tintColor: '#FFF' }]} />
                                <Text style={styles.menuText}>Insurance</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.memuContainer}>
                            <View style={styles.menuItem}>
                                <Image source={require('../Common/images/change_password_white.png')}
                                 style={[{ height: 30, width: 30 }]} />
                                <Text style={styles.menuText}>Change Password</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.memuContainer} onPress={()=>handleLogout()}>
                            <View style={styles.menuItem}>
                                <Image source={require('../Common/images/logout.png')} 
                                style={[{ height: 25, width: 25 }]}/>
                                <Text style={styles.menuText}>Logout</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
        </View>
    )
}
export default CustomDrawer
const styles = StyleSheet.create({
    container: {
        // position: 'absolute',
        // bottom: '55%',
        // width: '100%',
        // position:'relative'
        marginTop: 30
    },
    modalView: {
        // flex: 1, width: '70%', height: Dimensions.get('window').height,
        // backgroundColor: '#023913',
        // position: 'absolute',
        // top: 5,
        // right: 0,
    },
    memuContainer: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: '#023913'
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: '#ebffaa',
        paddingBottom: 5
    },
    menuText: {
        marginLeft: 10,
        fontSize: 18,
        color: '#FFF',

    }

})