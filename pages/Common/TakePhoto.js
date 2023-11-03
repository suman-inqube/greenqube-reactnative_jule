import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native'
import React from 'react'


const TakePhoto = ({openImagePicker,selectedImage,title}) => {
    return (
        <>
            <Text style={styles.title}>{ title ?title :'Default'}</Text>
            <View style={styles.container}>
                <TouchableOpacity style={styles.item} onPress={() => openImagePicker("firstItem")}>
                    {selectedImage.firstItem == "" ? <Image
                        source={require('../../Common/images/camera.jpeg')}
                        style={{width:100,height:100}}
                    /> :
                        <Image
                            source={{ uri: `${selectedImage.firstItem}` }}
                            // style={styles.image}
                            style={{ width: "100%", height: 100 }}
                            resizeMode="contain"
                        />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.item} onPress={() => openImagePicker("secondItem")}>
                    {selectedImage.secondItem == "" ? <Image
                        source={require('../../Common/images/camera.jpeg')}
                        style={{width:100,height:100}}
                    /> :
                        <Image
                            source={{ uri: `${selectedImage.secondItem}` }}
                            // style={styles.image}
                            style={{ width: "100%", height: 100 }}
                            resizeMode="contain"
                        />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.item} onPress={() => openImagePicker("thirdItem")}>
                    {selectedImage.thirdItem == "" ? <Image
                        source={require('../../Common/images/camera.jpeg')}
                        style={{width:100,height:100}}
                    />  :
                        <Image
                            source={{ uri: `${selectedImage.thirdItem}` }}
                            // style={styles.image}
                            style={{ width: "100%", height: 100 }}
                            resizeMode="contain"
                        />}
                </TouchableOpacity>
            </View>
        </>
    )
}

export default TakePhoto

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10
    },
    item: {
        // backgroundColor: '#e9e9e9',
        width: '30%',
        paddingVertical: 10,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        TouchableOpacityAlign: 'center'
    },
    title: {
        paddingBottom: 10,
        color: '#000'
    }

})
