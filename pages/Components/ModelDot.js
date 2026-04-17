import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
const ModelDot = ({ loaded, label, loading }) => {
    return (
        <View style={styles.modelDot}>
            <View style={[styles.dot, { backgroundColor: loaded ? '#22C55E' : loading ? '#F59E0B' : '#6B7280' }]} />
            <Text style={styles.dotLabel}>{label}</Text>
        </View>
    )
}
export default ModelDot
const styles = StyleSheet.create({
    modelDot: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dotLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    }
})