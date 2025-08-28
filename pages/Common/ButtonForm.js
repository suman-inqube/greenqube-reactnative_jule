import { Text, View, TouchableOpacity } from 'react-native'
import React from 'react'

const ButtonForm = ({label, onPress, tcolor, bcolor, loading}) => {
  const color = 'red';
  return (
    <View>
      <TouchableOpacity
        style={{
          backgroundColor: bcolor ?? '#003c04',
          padding: 10,
          borderRadius: 0,
          marginBottom: 5,
          position: 'absolute',
          bottom: -5,
          width: '100%',
        }}
        onPress={onPress}
        disabled={loading}>
        <Text
          style={{
            color: tcolor ?? 'white',
            fontSize: 20,
            fontFamily: 'Poppins-SemiBold',
            textAlign: 'center',
          }}>
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ButtonForm
