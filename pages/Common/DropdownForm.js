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
      {/* Label */}
      <View style={styles.labelContainer}>
        {labelString ? (
          <>
            <Text
              style={[styles.labelText, { color: color ?? 'black' }, labelStyle]}
            >
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
          renderItem={(item) => (
            <View style={styles.item}>
              <Text
                style={styles.itemText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.label}
              </Text>
            </View>
          )}
          renderSelectedItem={(item) => (
            <Text style={styles.selectedText} numberOfLines={2}>
              {item.label}
            </Text>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 10,
  },
  dropdown: {
    minHeight: 48, // ✅ allow dynamic height
    borderColor: Colors.borderGreen,
    borderWidth: 0.5,
    borderRadius: 5,
    paddingHorizontal: 8,
    backgroundColor: Colors.background,
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
    flexWrap: 'wrap',
  },
  selectedText: {
    fontSize: 14,
    color: Colors.text,
    flexWrap: 'wrap', // ✅ wraps if long
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    color: Colors.text,
    fontFamily: Fonts.Regular,
  },
  item: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  itemTextStyle: {
    color: Colors.black,
    fontFamily: Fonts.Regular,
  },
  itemText: {
    fontSize: 14,
    flexWrap: 'wrap', // ✅ wrap item text
    color: Colors.black,
  },
  dropdownContainerStyle: {
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
    borderRadius: 5,
    backgroundColor: Colors.background,
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

export default memo(DropdownForm);
