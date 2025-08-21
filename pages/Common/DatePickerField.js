import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Colors,Fonts } from '../utils/Constants';
const DatePickerField = ({
  label,
  value,
  onPress,
  labelColor = 'red',
  icon = require('./images/calendar.png'),
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>

      <TouchableOpacity style={styles.inputContainer} onPress={onPress}>
        <Text style={styles.valueText}>{value}</Text>
        <Image source={icon} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

export default DatePickerField;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
    fontFamily: Fonts.Regular,
    fontSize: 14,
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
    backgroundColor: '#fff',
  },
  valueText: {
    color: '#000',
    fontSize: 15,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: Colors.borderGreen,
  },
});
