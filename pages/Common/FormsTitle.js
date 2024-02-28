import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const FormsTitle = ({
    title
}) => {
    return (
        <View style={styles.titleContainer}>
            <Text style={[styles.title]}>
                {title}
            </Text>
        </View>
    )
}

export default FormsTitle

const styles = StyleSheet.create({
    titleContainer: {
        width: "95%",
        alignItems: 'flex-end'
    },
    title: {
        color: '#000',
        fontFamily: 'Poppins-SemiBold',
        paddingBottom: 8,
        paddingTop: 4,
        fontSize: 18
    }
})