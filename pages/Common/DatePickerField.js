import React, {memo} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {Colors, Fonts} from '../utils/Constants';
const DatePickerField = ({
  label,
  value,
  onPress,
  color = '#4e4e4e',
  labelColor = 'red',
  icon = require('./images/calendar.png'),
  required = false,
  iconName = null,
  iconSize = 20,
  iconColor = null,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        {iconName && (
          <MaterialIcons
            name={iconName}
            size={iconSize}
            color={iconColor || color}
            style={styles.labelIcon}
          />
        )}
        <Text style={[styles.title, {color}]}>{label}</Text>
        {required && <Text style={styles.requiredStar}> *</Text>}
      </View>

      <TouchableOpacity style={styles.inputContainer} onPress={onPress}>
        <Text style={styles.valueText}>{value}</Text>
        <Image source={icon} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

export default memo(DatePickerField);

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  container: {
    marginBottom: 12,
  },
  label: {
    fontFamily: Fonts.Regular,
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
  },
  valueText: {
    color: Colors.text,
    fontSize: 15,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: Colors.borderGreen,
  },
  title: {
    color: Colors.black,
    fontFamily: Fonts.Regular,
    fontSize: 15,
  },
  requiredStar: {
    color: 'red',
    fontFamily: Fonts.Medium,
    fontSize: 16,
  },
});
