import { StyleSheet, Text, View, TextInput } from 'react-native'
import React from 'react'

const InputTextFormWithoutLabel = ({ value,  onChangeText, keyboardType, onBlur }) => {
  return (
    <>
        <View style={styles.container}>
        <TextInput style={styles.simpleInputTextStyle}
          onChangeText={onChangeText}
          onBlur={onBlur}
          value={value}
          keyboardType={keyboardType ?? 'default'}
        />
    </View>
    </>
  )
}

export default InputTextFormWithoutLabel

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
