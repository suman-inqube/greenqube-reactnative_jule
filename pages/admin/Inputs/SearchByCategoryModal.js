import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View, Image, FlatList } from 'react-native';
import React from 'react'
const DATA = [
    {
        id: '1',
        title: 'First Item',
        productImage: "https://i.pcmag.com/imagery/articles/00Cx7vFIetxCuKxQeqPf8mi-23.fit_lim.size_1600x900.v1643131202.jpg",
    },
    {
        id: '2',
        title: 'Second Item',
        productImage: "https://i.pcmag.com/imagery/articles/00Cx7vFIetxCuKxQeqPf8mi-23.fit_lim.size_1600x900.v1643131202.jpg",

    },
    {
        id: '3',
        title: 'Third Item',
        productImage: "https://i.pcmag.com/imagery/articles/00Cx7vFIetxCuKxQeqPf8mi-23.fit_lim.size_1600x900.v1643131202.jpg",

    },
    {
        id: '4',
        title: 'Third Item',
        productImage: "https://i.pcmag.com/imagery/articles/00Cx7vFIetxCuKxQeqPf8mi-23.fit_lim.size_1600x900.v1643131202.jpg",

    },
    {
        id: '5',
        title: 'Third Item',
        productImage: "https://i.pcmag.com/imagery/articles/00Cx7vFIetxCuKxQeqPf8mi-23.fit_lim.size_1600x900.v1643131202.jpg",

    },

];
const SearchByCategoryModal = (props) => {
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
                <TouchableOpacity style={[styles.container, props.style]} onPress={() => props.setModalVisible(!props.modalVisible)} activeOpacity={1} >
                    <View style={styles.modalView}>
                        {/* <View style={styles.modelTitleContainer}>
                            <Text style={{ color: '#000', fontSize: 18 }}>Product Detail</Text>
                            <TouchableOpacity onPress={() => props.setModalVisible(!props.modalVisible)}>
                                <Text style={{ fontSize: 35, fontWeight: 'bold', color: '#000' }}>x</Text>
                            </TouchableOpacity>
                        </View> */}
                        <FlatList
                            data={props.categoryData}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            // style={{marginBottom:30}}
                            renderItem={({ item }) => {
                                return (
                                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                                        <View style={styles.flatlistContainer}>
                                            <View style={styles.flatlistItem}>
                                                <View style={{ justifyContent: 'flex-end' }}>
                                                <Text style={{padding:10,color:'#FFF',backgroundColor:'green',marginVertical:10
                                                ,textAlign:'center',borderRadius:20}}>{item.label}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                            keyExtractor={(item,index) => index}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default SearchByCategoryModal

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
        elevation: 10,
        position: 'relative',
        paddingVertical:20
        // bottom: '50',
        // height:'100%'
       
    },
    button: {
        borderRadius: 20,
        padding: 10,

    },
    modelTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12
    },

})