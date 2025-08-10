import React, { useState, memo } from 'react';
import { View, StyleSheet, Text, useColorScheme } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown'
import { Colors, Fonts } from '../utils/Constants';
const DropdownForm = ({ color, label, data, onChange, val, disable }) => {
    const scheme = useColorScheme();
    const labelString = label.charAt(0)?.toUpperCase() + label?.slice(1);
    const [isFocus, setIsFocus] = useState(false);
    const [value, setValue] = useState(null);
    return (
        <>
            <View>
                <Text style={{ marginHorizontal: 5, marginBottom: 5, color: color ?? 'black', fontFamily: 'Poppins-Regular' }}>{labelString}</Text>
                <View style={styles.container}>
                    <Dropdown
                        mode='default'
                        style={styles.dropdown}
                        searchField={false}
                        containerStyle={styles.dropdownContainerStyle}
                        placeholderStyle={[styles.placeholderStyle, { color: 'black' }]}
                        selectedTextStyle={[styles.selectedTextStyle, { color: 'black' }]}
                        inputSearchStyle={[styles.inputSearchStyle, { color: 'black' }]}
                        itemTextStyle={styles.itemTextStyle}
                        iconStyle={styles.iconStyle}
                        data={data}
                        search
                        maxHeight={250}
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
                        iconColor={Colors.useGreen}
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
        borderColor: Colors.borderGreen,
        borderWidth: 0.5,
        borderRadius: 5,
        paddingHorizontal: 8,
        backgroundColor: '#ffffff',
        width: '100%',
       shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.4,
        // shadowRadius: 3,
        // elevation:1
    },
    icon: {
        marginRight: 5,
        backgroundColor:Colors.useGreen,
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
    dropdownContainerStyle: {
        borderWidth: 0.5,
        borderColor: Colors.borderGreen, // or any color you want
        borderRadius: 5,
        backgroundColor: '#fff', // optional
        padding: 4,
        top:-3

    },
});
