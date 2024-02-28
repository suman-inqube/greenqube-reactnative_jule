import React, { useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown'

const SearchSubBy = ({ color, label,onChange,data,val }) => {
    const [isFocus, setIsFocus] = useState(false);
    const [value, setValue] = useState(null);
    return (
        <>
            <View>
                <View style={styles.container}>
                    <Dropdown
                        mode='modal'
                        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                        placeholderStyle={[styles.placeholderStyle, { color: 'black' }]}
                        selectedTextStyle={[styles.selectedTextStyle, { color: 'black' }]}
                        inputSearchStyle={[styles.inputSearchStyle, { color:'black' }]}
                        iconStyle={styles.iconStyle}
                        itemTextStyle={styles.itemTextStyle}
                        data={data}
                        value={val}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!isFocus ? label.substring(0, 16)+'...' : '...'}
                        searchPlaceholder="Search..."
                        onChange={onChange}
                        renderRightIcon={() => (
                            <Image source={require('../../Common/images/filter100.png')} style={styles.filterIcon} />
                        )}
                    />
                </View>
            </View>
        </>
    );
};

export default SearchSubBy;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#FFF',
        borderRadius:8,
        elevation:10
    },
    dropdown: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 0,
        borderRadius: 8,
        paddingHorizontal: 8,
        // backgroundColor: 'white',
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
        fontFamily: 'Poppins-Regular'
    },
    placeholderStyle: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular'
    },
    selectedTextStyle: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular'
    },
    iconStyle: {
        width: 0,
        height: 0,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    filterIcon: {
        width: 20,
        height: 20
    },
    itemTextStyle: {
        color: '#000'
    },
});
