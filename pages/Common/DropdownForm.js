import React, { memo } from 'react';
import { View, StyleSheet, Text, useColorScheme } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Colors } from '../utils/Constants';

const DropdownForm = ({
  color = '#4e4e4e',
  label,
  data = [],
  onChange,
  val,
  disable = false
}) => {
  const scheme = useColorScheme();
  const labelString = label ? label.charAt(0).toUpperCase() + label.slice(1) : '';

  return (
    <View>
      {/* Label */}
      {labelString ? (
        <Text style={[styles.label, { color }]}>
          {labelString}
        </Text>
      ) : null}

      {/* Dropdown */}
      <View style={styles.container}>
        <Dropdown
          mode="default"
          style={styles.dropdown}
          containerStyle={styles.dropdownContainerStyle}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          iconStyle={styles.iconStyle}
          data={data}
          search
          maxHeight={250}
          labelField="label"
          valueField="value"
          placeholder={val || 'Select'}
          searchPlaceholder="Search..."
          onChange={onChange}
          value={val}
          disable={disable}
          keyboardAvoiding
          showsVerticalScrollIndicator={false}
          iconColor={Colors.borderGreen}
          activeColor={Colors.containerGreen}
        />
      </View>
    </View>
  );
};

export default memo(DropdownForm);

const styles = StyleSheet.create({
  label: {
    marginHorizontal: 5,
    marginBottom: 5,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  container: {
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 10,
  },
  dropdown: {
    height: 48,
    borderColor: Colors.borderGreen,
    borderWidth: 0.5,
    borderRadius: 5,
    paddingHorizontal: 8,
    backgroundColor: '#ffffff',
    width: '100%',
  },
  placeholderStyle: {
    color: Colors.black,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  selectedTextStyle: {
    color: Colors.black,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    color: Colors.black,
    fontFamily: 'Poppins-Regular',
  },
  itemTextStyle: {
    color: Colors.black,
    fontFamily: 'Poppins-Regular',
  },
  dropdownContainerStyle: {
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
    borderRadius: 5,
    backgroundColor: '#fff',
    padding: 4,
  },
});
