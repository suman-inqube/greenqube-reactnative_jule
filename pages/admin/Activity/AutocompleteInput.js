
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity,KeyboardAvoidingView } from 'react-native'
import React, { useState, useRef } from 'react'


const AutocompleteInput = ({onPress}) => {
    const countries = [
        { data: 'Afghanistan', code: '93', iso: 'AF' },
        { data: 'Albania', code: '355', iso: 'AL' },
        { data: 'Algeria', code: '213', iso: 'DZ' },
        { data: 'American Samoa', code: '1-684', iso: 'AS' },
        { data: 'Andorra', code: '376', iso: 'AD' },
        { data: 'Democratic Republic of the Congo', code: '243', iso: 'CD' },
        { data: 'Denmark', code: '45', iso: 'DK' },
        { data: 'Djibouti', code: '253', iso: 'DJ' },
        { data: 'Dominica', code: '1-767', iso: 'DM' },
        { data: 'Dominican Republic', code: '1-809, 1-829, 1-849', iso: 'DO' },
        { data: 'East Timor', code: '670', iso: 'TL' },
        { data: 'Ecuador', code: '593', iso: 'EC' },
        { data: 'Egypt', code: '20', iso: 'EG' },
        { data: 'El Salvador', code: '503', iso: 'SV' },
        { data: 'New Caledonia', code: '687', iso: 'NC' },
        { data: 'New Zealand', code: '64', iso: 'NZ' },
        { data: 'Nicaragua', code: '505', iso: 'NI' },
    ];
    const sendDataToParent = (item) => {

        onPress(item);
    };
    return (
        <View>
                <FlatList
                    style={styles.container}
                    data={countries}
                    renderItem={({ item, index }) => {
                        return (
                            <TouchableOpacity onPress={()=>sendDataToParent(item)}
                                key={index}
                                style={styles.item}>
                                <Text style={styles.title}>{item.data}</Text>
                            </TouchableOpacity>
                        );
                    }}
                />
        </View>
    )
}

export default AutocompleteInput

const styles = StyleSheet.create({
    container:{
        marginVertical: 10,backgroundColor:'#FFF',
        position:'relative',
        top:-23,padding:1,
        elevation:10,
        borderRadius:10
    },
    item:{
        marginVertical:10,
        marginHorizontal:10
    },
    title:{
        fontSize:16,
        color:'#000'
    }
})
