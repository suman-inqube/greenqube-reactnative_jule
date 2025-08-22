import React, { memo } from 'react';
import { View, StyleSheet, Text, useColorScheme } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors, Fonts } from '../utils/Constants';

const DropdownForm = ({
  color = '#4e4e4e',
  label,
  data = [],
  onChange,
  val,
  disable = false,
  labelStyle,
  required = false,
}) => {
  const scheme = useColorScheme();
  const labelString = label
    ? label.charAt(0).toUpperCase() + label.slice(1)
    : '';

  return (
    <View>
      <View style={styles.labelContainer}>
        {/* Label */}
        {labelString ? (
          <>
            <Text
              style={[styles.labelText, { color: color ?? 'black' }, labelStyle]}>
              {labelString}
            </Text>
            {required && <Text style={styles.requiredStar}> *</Text>}
          </>
        ) : null}
      </View>

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
    fontFamily: Fonts.Regular,
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
    backgroundColor:Colors.background,
    width: '100%',
  },
  placeholderStyle: {
    color: Colors.text,
    fontFamily: Fonts.Regular,
    fontSize: 14,
  },
  selectedTextStyle: {
    color: Colors.text,
    fontFamily: Fonts.Regular,
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    color: Colors.text,
    fontFamily: Fonts.Regular,
  },
  itemTextStyle: {
    color: Colors.text,
    fontFamily: Fonts.Regular,
  },
  dropdownContainerStyle: {
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
    borderRadius: 5,
    backgroundColor:Colors.background,
    padding: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 5,
  },
  labelText: {
    fontFamily: Fonts.Regular,
    fontSize: 15,
  },
  requiredStar: {
    color: 'red',
    fontFamily: Fonts.Medium,
    fontSize: 16,
  },
});
