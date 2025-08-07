import {StyleSheet, Text, View, TextInput, useColorScheme} from 'react-native';
import React, {memo} from 'react';
const sanitizeInput = text => text.replace(/<\/?[^>]+(>|$)/g, '');
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors, Fonts} from '../utils/Constants';

const InputTextForm = ({
  value,
  color = '#4e4e4e',
  label,
  onChangeText,
  keyboardType,
  onBlur,
  refname,
  maxLength,
  editable,
  placeholder,
  required = false,
  iconName = null, // New prop for icon name
  iconSize = 20, // New prop for icon size
  iconColor = null,
}) => {
  const scheme = useColorScheme();
  const labelString = label.charAt(0).toUpperCase() + label.slice(1);
  // console.log("c11")
  return (
    <>
      <View>
        <View style={styles.labelContainer}>
          {iconName && (
            <MaterialIcons
              name={iconName}
              size={iconSize}
              color={iconColor || color} // Falls back to label color
              style={styles.labelIcon}
            />
          )}
          <Text style={[styles.title, {color: color ?? 'black'}]}>
            {labelString}
          </Text>
          {required && <Text style={styles.requiredStar}> *</Text>}
        </View>
        <View style={styles.container}>
          <TextInput
            style={[
              styles.inputField,
              !editable && styles.disabledInput, // conditional style
            ]}
            //  style={[styles.simpleInputTextStyle, { color: 'black' }]}
            onChangeText={text => onChangeText(sanitizeInput(text))}
            onBlur={onBlur}
            value={value}
            keyboardType={keyboardType ?? 'default'}
            ref={refname}
            maxLength={maxLength}
            editable={editable}
            placeholder={placeholder}
            placeholderTextColor="#808080"
          />
        </View>
      </View>
    </>
  );
};

export default memo(InputTextForm);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 15,
  },
  simpleInputTextStyle: {
    borderRadius: 8,
    height: 50,
    borderColor: Colors.secondary,
    borderWidth: 1.3,
    borderRadius: 8,
    backgroundColor: '#FFFF',
    width: '100%',
    elevation: 1,
    paddingHorizontal: 10,
    color: 'white',
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 5,
  },

  requiredStar: {
    color: 'red',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  labelIcon: {
    marginRight: 8, // Space between icon and label
  },
  inputField: {
    height: 50,
    borderColor: Colors.secondary, // Make sure this color is visible
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    width: '100%',
    elevation: 1,
    paddingHorizontal: 10,
    color: '#000000', // Changed from 'white' to 'black' for better visibility
  },
  disabledInput: {
    backgroundColor: 'white',
    borderColor: Colors.secondary,
  },
});
