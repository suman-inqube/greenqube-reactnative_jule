import { Text, View, TouchableOpacity } from 'react-native'
import React from 'react'

const ButtonForm = ({ label, onPress, tcolor, bcolor, testID }) => {
  const color = 'red';
  return (
    <View>
      <TouchableOpacity testID={testID} accessibilityLabel={testID} style={{
        backgroundColor: bcolor ?? '#003c04',
        padding: 10,
        borderRadius: 0,
        marginBottom: 5,
      }} onPress={onPress}


      >

        <Text style={{
          color: tcolor ?? 'white',
          fontSize: 20,
          fontWeight: 'bold',
          textAlign: 'center',
        }}>{label}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default ButtonForm
