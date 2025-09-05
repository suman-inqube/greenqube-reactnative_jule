import { StyleSheet, Text, View, TextInput, useColorScheme } from 'react-native';
import React, { memo } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors, Fonts } from '../utils/Constants';
const sanitizeInput = text => text.replace(/<\/?[^>]+(>|$)/g, '');
const InputTextForm = ({
  value,
  color = '#4e4e4e',
  label,
  onChangeText,
  keyboardType = 'default',
  onBlur,
  refname,
  maxLength,
  editable = true,
  placeholder,
  required = false,
  iconName = null,
  iconSize = 20,
  iconColor = null,
}) => {
  // console.log('InputTextForm rendered',label);
  const scheme = useColorScheme();
  const labelString = label
    ? label.charAt(0).toUpperCase() + label.slice(1)
    : '';

  return (
    <View style={{ marginBottom: 15 }}>
      {/* Label Row */}
      <View style={styles.labelContainer}>
        {iconName && (
          <MaterialIcons
            name={iconName}
            size={iconSize}
            color={iconColor || color}
            style={styles.labelIcon}
          />
        )}
        <Text style={[styles.title, { color }]}>{labelString}</Text>
        {required && <Text style={styles.requiredStar}> *</Text>}
      </View>

      {/* Input Field */}
      <TextInput
        style={[
          styles.inputField,
          !editable && styles.disabledInput,
          { borderColor: Colors.borderGreen, minHeight: 48, textAlignVertical: 'top' },
        ]}
        onChangeText={onChangeText}
        onBlur={() => {
          if (onBlur) onBlur();
          onChangeText(sanitizeInput(value));
        }}
        value={value}
        keyboardType={keyboardType}
        ref={refname}
        maxLength={maxLength}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={scheme === 'dark' ? '#9ca3af' : '#808080'}
        multiline={true}
        scrollEnabled={true}
        numberOfLines={2}
        onContentSizeChange={e =>
          e.nativeEvent.contentSize.height > 48 &&
          (e.target.setNativeProps({
            style: { height: e.nativeEvent.contentSize.height },
          }))
        }
      />


    </View>
  );
};

export default memo(InputTextForm);

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  labelIcon: {
    marginRight: 6,
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
  inputField: {
    height: 48,
    borderWidth: 0.5,
    borderRadius: 6,
    // backgroundColor: Colors.background,
    paddingHorizontal: 10,
    color: Colors.text,
    //  borderColor: '#d1d5db',
    borderColor: Colors.borderGreen
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
    borderColor: Colors.secondary,
  },
});
