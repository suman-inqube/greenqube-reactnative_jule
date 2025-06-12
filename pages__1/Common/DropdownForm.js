import React, { useState, memo } from 'react';
import { View, StyleSheet, Text, useColorScheme } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown'

const DropdownForm = ({ color, label, data, onChange, val, disable }) => {
    const scheme = useColorScheme();
    const labelString = label.charAt(0).toUpperCase() + label.slice(1);
    const [isFocus, setIsFocus] = useState(false);
    return (
        <>
            <View>
                <Text style={{ marginHorizontal: 5, marginBottom: 5, color: color ?? 'black', fontFamily: 'Poppins-Regular' }}>{labelString}</Text>
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
                        placeholder={typeof (val) == "undefined" ? false : val}
                        searchPlaceholder="Search..."
                        onFocus={() => setIsFocus(true)}
                        onChange={onChange}
                        value={val}
                        disable={disable}
                        keyboardAvoiding={true}
                        showsVerticalScrollIndicator={false}
                    />

                </View>
            </View>
        </>
    );
};

export default memo(DropdownForm);

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
        elevation: 1
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
