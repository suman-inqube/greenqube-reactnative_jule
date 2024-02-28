import { StyleSheet, Text, View, TextInput } from 'react-native'
import React from 'react'

const InputTextForm = ({ value, color, label, onChangeText, keyboardType, onBlur, refname, maxLength }) => {
  const labelString = label.charAt(0).toUpperCase() + label.slice(1);
  return (
    <>
      <Text style={{ marginHorizontal: 5, marginBottom: 5, color: color ?? 'black' }}>{labelString}</Text>
      <View style={styles.container}>
        <TextInput style={styles.simpleInputTextStyle}
          onChangeText={onChangeText}
          onBlur={onBlur}
          value={value}
          keyboardType={keyboardType ?? 'default'}
          ref={refname}
          maxLength={maxLength}
        />
      </View>
    </>
  )
}

export default InputTextForm

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 15,
  },
  simpleInputTextStyle: {
    borderRadius: 8,
    height: 40,
    borderColor: 'gray',
    borderWidth: 0.5,
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 10,
  },

})
