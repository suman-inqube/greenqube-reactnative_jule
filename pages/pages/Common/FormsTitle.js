import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const FormsTitle = ({
    title
}) => {
    return (
        <View style={styles.titleContainer}>
            <Text style={[styles.title, { paddingBottom: 8, paddingTop: 4, fontWeight: '700', fontSize: 18 }]}>
               {title}
            </Text>
        </View>
    )
}

export default FormsTitle

const styles = StyleSheet.create({
    titleContainer: {
        width: "95%",
        alignItems: 'flex-end',
        paddingVertical: 10,
        
    },
    title:{
        color:'#000'
    }
})