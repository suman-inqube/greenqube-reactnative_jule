import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown'

const FarmerHeadDropDown = ({ color, label, data, onChange, val }) => {
    const labelString = label.charAt(0).toUpperCase() + label.slice(1);
    const [isFocus, setIsFocus] = useState(false);
    const [value, setValue] = useState(null);
    // const data = [
    //     { label: 'Item 1', value: '1' },
    //     { label: 'Item 2', value: '2' },
    //     { label: 'Item 3', value: '3' },
    //     { label: 'Item 4', value: '4' },
    //     { label: 'Item 5', value: '5' },
    //     { label: 'Item 6', value: '6' },
    //     { label: 'Item 7', value: '7' },
    //     { label: 'Item 8', value: '8' },
    // ];
    return (
        <>
            <View>
                <View style={styles.container}>
                    <Dropdown
                        mode='modal'
                        style={styles.dropdown}
                        placeholderStyle={[styles.placeholderStyle, { color: 'black' }]}
                        selectedTextStyle={[styles.selectedTextStyle, { color: 'black' }]}
                        inputSearchStyle={[styles.inputSearchStyle, { color: 'black' }]}
                        itemTextStyle={styles.itemTextStyle}
                        iconStyle={styles.iconStyle}
                        data={data}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!isFocus ? label : '...'}
                        searchPlaceholder="Search..."
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={onChange}
                        value={val}
                    />

                </View>
            </View>
        </>
    );
};

export default FarmerHeadDropDown;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#e7dbdb',
        borderRadius: 10,
    },
    dropdown: {
        height: 48,
        // height: 40,
        borderColor: '#fcf7f7',
        borderWidth: 1.3,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#ffffff',
        width: '100%',
        elevation: 1,
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
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    },
    placeholderStyle: {
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    },
    selectedTextStyle: {
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        color: '#000',
        fontFamily: 'Poppins-Regular'
    },
    itemTextStyle: {
        color: '#000',
        fontFamily: 'Poppins-Regular'
    },
});
