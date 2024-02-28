import { StyleSheet, Text, View, Modal, TouchableOpacity, FlatList, Dimensions, Keyboard } from 'react-native'
import React, { useState, useEffect } from 'react'
import InputTextForm from './pages/Common/InputTextForm';
const { width, height } = Dimensions.get('window');
const SplashScreenModal = (props) => {
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [data, setData] = useState([]);
    const [length, setLength] = useState("");
    const handleDBName = (db_name, company_id) => {
        props.sendDataToParent(db_name, company_id);
    }
    const searchDBName = (text) => {
        props.searchTextData(text)
        setData(text)
    }
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true); // or some other action
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false); // or some other action
            }
        );
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.modalVisible}
            // onRequestClose={() => {
            //     props.setModalVisible(!props.modalVisible);
            // }}
        >
            <TouchableOpacity style={[styles.container, props.style]} activeOpacity={1} >
                <View style={styles.modalView}>
                    <View style={{ marginHorizontal: 20, marginBottom: -20 }}>
                        < Text style={{ fontSize: 20, color: 'black', marginTop: 25, textAlign: 'center', fontFamily: "Poppins-SemiBold" }}>Company</Text>
                        <InputTextForm label="" onChangeText={(item) => searchDBName(item)} />
                    </View>
                    <View style={styles.modelTitleContainer}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={props.companyData}
                            style={isKeyboardVisible ? props.companyData.length > 4 ? styles.flatContainerLengthUp : "" : data.length == 0 ? styles.flatContainer : ""}
                            renderItem={({ item }) => {
                                return (
                                    <TouchableOpacity style={styles.wrapper} onPress={() => {props.setModalVisible(false);handleDBName(item.db_name, item.company_id)}}>
                                        <View style={styles.item}>
                                            <Text style={styles.itemText}>{item.agri_company && item.agri_company.company_name}</Text>
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
        borderRadius: 20,
        backgroundColor: '#faf6f6',
        width: '90%',
        // paddingVertical:15
        // height: height/3.5,
    },
    modelTitleContainer: {
        // width: '95%',
        // height: '80%',
        margin: '2.5%',
        borderRadius: 10
    },
    item: {
        // flexDirection: 'row',
        marginHorizontal: 10,
        marginVertical: 5,
        alignItems: 'center',
        marginBottom: 5
    },

    itemText: {
        width: '100%',
        textAlign: 'center',
        color: '#000',
        fontFamily: 'Poppins-Regular'
    },
    flatContainer: {
        height: height / 1.5
    },
    flatContainerLengthUp: {
        height: height / 3
    }

})