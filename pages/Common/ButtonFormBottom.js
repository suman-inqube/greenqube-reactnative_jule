import { Text, View, TouchableOpacity } from 'react-native'
import React from 'react'

const ButtonFormBottom = ({ label, onPress, tcolor, bcolor }) => {
  const color = 'red';
  return (
    <View style={{
      bottom:0,
      left: 0,
      width: '100%',
      position:'absolute'
    }}>
      <TouchableOpacity style={{
        backgroundColor: bcolor ?? '#003c04',
        padding: 9,
        borderRadius: 0,
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

export default ButtonFormBottom
