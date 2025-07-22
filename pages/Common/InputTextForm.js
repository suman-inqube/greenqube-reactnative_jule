import { StyleSheet, Text, View, TextInput, useColorScheme } from 'react-native'
import React, { memo } from 'react'
const sanitizeInput = (text) => text.replace(/<\/?[^>]+(>|$)/g, '');
const InputTextForm = ({
  value,
  color,
  label,
  onChangeText,
  keyboardType,
  onBlur,
  refname,
  maxLength,
  editable,
  placeholder,
}) => {
  const scheme = useColorScheme();
  const labelString = label.charAt(0).toUpperCase() + label.slice(1);
  // console.log("c11")
  return (
    <>
      <Text style={[styles.title, { color: color ?? 'black' }]}>
        {labelString}
      </Text>
      <View style={styles.container}>
        <TextInput
          style={[
            styles.simpleInputTextStyle,
            {
              color: 'black',
              backgroundColor: editable == false ? '#FFF' : '#FFF',
              borderColor: editable == false ? '#ffffff' : '#FFFF',
            },
          ]}
          //  style={[styles.simpleInputTextStyle, { color: 'black' }]}
          onChangeText={(text) => onChangeText(sanitizeInput(text))}
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
    </>
  );
};

export default memo(InputTextForm)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 15,
  },
  simpleInputTextStyle: {
    borderRadius: 8,
    height: 45,
    borderColor: '#fcf7f7',
    borderWidth: 1.3,
    borderRadius: 8,
    backgroundColor: '#FFFF',
    width: '100%',
    elevation: 1,
    paddingHorizontal: 10,
    color: '#000',
  },
  title: {
    marginHorizontal: 5,
    marginBottom: 5,
    color: "#000",
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  }

})
