import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown'

const DropdownForm = ({ color, label, data, onChange, val }) => {
    const labelString = label.charAt(0).toUpperCase() + label.slice(1);
    const [isFocus, setIsFocus] = useState(false);
    return (
        <>
            <View>
                <Text style={{ marginHorizontal: 5, marginBottom: 5, color: color ?? 'black' }}>{labelString}</Text>
                <View style={styles.container}>
                    <Dropdown
                        mode='modal'
                        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={data}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!isFocus ? "Select " + label : "Select " + label}
                        searchPlaceholder="Search..."
                        onFocus={() => setIsFocus(true)}
                        onChange={onChange}
                        value={val}
                    />

                </View>
            </View>
        </>
    );
};

export default DropdownForm;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 15,
    },
    dropdown: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: 'white',
        width: '100%',
    },
    icon: {
        marginRight: 5,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
});
