import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { Root, SPSheet } from 'react-native-popup-confirm-toast';
const BottomSheetTakePhoto = ({
    openlaunchCamera,
    openlaunchImageLibrary,
    uploadTreeImage,
    TakePhoto,
    ChooseFromGallery,
    Cancel,
    title,
    height
}) => {
    return (
        <TouchableOpacity
            onPress={() => {
                const spSheet = SPSheet;
                spSheet.show({
                    component: () => {
                        return (
                            <View>
                                {TakePhoto &&
                                    <TouchableOpacity style={styles.btn} onPress={() => openlaunchCamera()}>
                                        <Text style={[styles.title, { fontWeight: '600' }]}>{TakePhoto}</Text>
                                    </TouchableOpacity>
                                }
                                {ChooseFromGallery &&
                                    <TouchableOpacity style={styles.btn} onPress={() => openlaunchImageLibrary()}>
                                        <Text style={[styles.title, { fontWeight: '600' }]}>{ChooseFromGallery}</Text>
                                    </TouchableOpacity>
                                }
                                <TouchableOpacity style={styles.btn} onPress={() => spSheet.hide()}>
                                    <Text style={[styles.title, { fontWeight: '600' }]}>{Cancel}</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    },
                    dragFromTopOnly: true,
                    onCloseComplete: () => {
                        // spSheet.hide();
                    },
                    onOpenComplete: () => {
                        // spSheet.hide();
                    },
                    height: height,
                    callback: () => spSheet.hide()
                });
            }}>
            {title && <Text style={styles.title} >{title}</Text>}
            {
                uploadTreeImage.uri == "" ?
                    <Image
                        source={require('./images/camera.jpeg')}
                        style={{ width: 60, height: 60, marginBottom: 10 }}
                        resizeMode="contain"
                    /> : <Image
                        source={{ uri: `${uploadTreeImage.uri}` }}
                        style={{ width: 60, height: 60, marginBottom: 10 }}
                        resizeMode="contain"
                    />
            }

        </TouchableOpacity>
    )
}

export default BottomSheetTakePhoto

const styles = StyleSheet.create({
    title: {
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    },
    btn: {
        padding: 10
    },
})