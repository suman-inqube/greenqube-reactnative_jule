import { Text, View, TouchableOpacity } from 'react-native'
import React from 'react'

const ButtonForm = ({ label, onPress, tcolor, bcolor,loading = false }) => {
  const color = 'red';
  return (
    <View>
      <TouchableOpacity style={{
       backgroundColor: bcolor ?? '#003c04',
       padding: 10,
       borderRadius: 0,
       marginBottom: 5,
       position:'absolute',
       bottom:-5,
       width:'100%'
      }} 
         onPress={!loading ? onPress : null} // 👈 disable when loading
        disabled={loading} // 👈 disable press
        activeOpacity={0.7}
      >
        <Text style={{
          color: tcolor ?? 'white',
          fontSize: 20,
          fontFamily:'Poppins-SemiBold',
          textAlign: 'center',
        }}>{label}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default ButtonForm
