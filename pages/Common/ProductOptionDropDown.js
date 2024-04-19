import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Dropdown } from 'react-native-element-dropdown'
import { useFocusEffect } from '@react-navigation/native';
import { getItem } from '../../config/getDataFromStorage';
const ProductOptionDropDown = ({ rate, val, onChange, currency }) => {
    const [isFocus, setIsFocus] = useState(false);
    const [price, setPrice] = useState([]);
    const onPageLoad = async () => {
        const emptyArray = [];
        rate.forEach((element, index) => {
            // emptyArray.push({
            //     value: element.prod_price_id,
            //     label: element.discounted_price == "0" || element.discounted_price == null ? `${currency}` + element.sales_price + ' ' + element.agri_unit.unit_name.substring(0, 7) + '..' : `${currency}` + element.discounted_price + ' ' + element.agri_unit.unit_name.substring(0, 7) + '..',
            // });
            emptyArray.push({
              value: element.fid,
              label:
                `${currency}` +
                element.mrp +
                '/' +
                element.sku_size +
                element.sku_unit,
            });
        });
        setPrice(emptyArray);
    };
    useEffect(() => {
        onPageLoad();
    }, [])
    return (

        <>
            <View style={styles.container}>
                <Dropdown
                    mode='modal'
                    style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                    laceholderStyle={[styles.placeholderStyle, { color: 'black', fontFamily: 'Poppins-Regular' }]}
                    selectedTextStyle={[styles.selectedTextStyle, { color: 'black', fontFamily: 'Poppins-Regular' }]}
                    inputSearchStyle={[styles.inputSearchStyle, { color: 'black', fontFamily: 'Poppins-Regular' }]}
                    iconStyle={styles.iconStyle}
                    itemTextStyle={styles.itemTextStyle}
                    data={price}
                    value={price[0]}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    searchPlaceholder="Search..."
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={onChange}
                />
            </View>
        </>
    )
}

export default ProductOptionDropDown

const styles = StyleSheet.create({
    container: {
        // alignItems: 'center',
        // marginBottom: 15,
    },
    dropdown: {
        height: 40,
        // borderColor: 'gray',
        // borderWidth: 0.5,
        // borderRadius: 8,
        // paddingHorizontal: 8,
        // backgroundColor: 'white',
        width: '80%',
    },
    itemTextStyle: {
        color: '#000',
        fontFamily: 'Poppins-Regular'
    },
    // icon: {
    //     marginRight: 5,
    // },



    // iconStyle: {
    //     width: 20,
    //     height: 20,
    // },
    // inputSearchStyle: {
    //     height: 40,
    //     fontSize: 16,
    // },
});