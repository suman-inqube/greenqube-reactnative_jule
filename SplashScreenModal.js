import { StyleSheet, Text, View, Modal, TouchableOpacity, FlatList } from 'react-native'
import React,{useState} from 'react'
import InputTextForm from './pages/Common/InputTextForm';


const SplashScreenModal = (props) => {
    const [data, setData] = useState(props.companyData);
    const handleDBName = (db_name, company_id) => {
        props.sendDataToParent(db_name, company_id);

    }
    const searchDBName = (text) => {
       props.searchTextData(text)
    }
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
                <TouchableOpacity style={[styles.container, props.style]} activeOpacity={1} >
                    
                    <View style={styles.modalView}>
                        <View style={{ marginHorizontal:20 }}>
                        < Text style={{ marginLeft: 20, fontWeight: 'bold', fontSize: 20, color: 'black' }}>Company</Text>
                            <InputTextForm label="" onChangeText={(item) => searchDBName(item)} />
                        </View>
                          
                        <View style={styles.modelTitleContainer}>
                            <FlatList
                                data={props.companyData}
                                renderItem={({ item }) => {
                                    return (
                                        <TouchableOpacity style={styles.wrapper} onPress={() => handleDBName(item.db_name, item.company_id)}>
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
        width: '85%',
        height: '80%'
    },
    modelTitleContainer: {
        width: '95%',
        height: '80%',
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