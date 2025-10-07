import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'

const RadioForm = ({ label, selected, onSelect }) => {
    const labelString = label.charAt(0).toUpperCase() + label.slice(1);
    return (
        <TouchableOpacity style={styles.radioButton} onPress={onSelect}>
            <View
                style={[
                    styles.radioCircle,
                    {
                        backgroundColor: selected ? '#074609' : '#E5E5E5',
                    },
                ]}
            >
                {selected && <View style={styles.selectedRb} />}
            </View>
            <Text style={styles.radioText}>{labelString}</Text>
        </TouchableOpacity>
    );
}

export default RadioForm

const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        radioButton: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 5,
        },
        radioCircle: {
            height: 20,
            width: 20,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#0a3e08',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
        },
        selectedRb: {
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#0a3e08',
        },
        radioText: {
            color: '#000',
            fontFamily:'Poppins-Regular',
        },
})
