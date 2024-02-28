import { StyleSheet, Text, View } from 'react-native'
import React,{useState} from 'react'
import { Dropdown } from 'react-native-element-dropdown'

const ProductOptionDropDown = ({rate,val}) => {
    const [isFocus, setIsFocus] = useState(false);
    const [value, setValue] = useState(null);

    return (
        <>
            <View>
                <View style={styles.container}>
                <View style={styles.container}>
                    <Dropdown
                        mode='modal'
                        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={rate}
                        value={val}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        searchPlaceholder="Search..."
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={item => {
                            setValue(item.value);
                            setIsFocus(false);
                        }}
                    />

                </View>

                </View>
            </View>
        </>
    )
}

export default ProductOptionDropDown

const styles = StyleSheet.create({})