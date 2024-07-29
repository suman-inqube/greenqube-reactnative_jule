import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput } from 'react-native'
import React from 'react'

const PasswordComp = ({ setPasswordVisibility, passwordVisibility, label, onChangeText, value }) => {
    return (
        <>
            <Text style={styles.formMargin}>{label}</Text>
            <View style={styles.passwordMainContainer}>
                <View style={styles.passwordContainer}>
                    <TextInput secureTextEntry={passwordVisibility ? false : true} style={styles.inputTextStyle} onChangeText={onChangeText} value={value} />
                    <TouchableOpacity onPress={() => setPasswordVisibility(!passwordVisibility)} style={{ marginRight: 10 }} opacity={0.5}>
                        {
                            passwordVisibility ?
                                <Image source={require('../Common/images/show.png')} style={{ width: 22, height: 22 }} />
                                :
                                <Image source={require('../Common/images/hide.png')} style={{ width: 22, height: 20 }} />
                        }
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
}

export default PasswordComp

const styles = StyleSheet.create({
    formMargin: {
        marginHorizontal: 10,
        color: 'red',
        marginBottom: 5,
    },
    passwordMainContainer: {
        alignItems: 'center',
        elevation: 2,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        height: 50,
        borderWidth: 0.5,
        borderRadius: 8,
        borderColor: '#ffffff',
        paddingEnd: 8,
        marginBottom: 10
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',

        width: '100%',
        // paddingEnd: 8,
        backgroundColor: '#ffffff',
        // height: 50,
        // marginBottom: 15,

    },
    inputTextStyle: {
        flex: 1,
        height: 44,
        marginHorizontal: 10,
        borderColor: 'gray',
        color: "#000",
        fontFamily: 'Poppins-Regular',

    },
})