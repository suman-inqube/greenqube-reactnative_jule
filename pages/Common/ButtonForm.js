import {Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ButtonForm = ({
  label,
  onPress,
  tcolor,
  bcolor,
  iconName,
  iconSize,
  iconColor,
  iconPosition,
}) => {
  const color = 'red';
  return (
    <View>
      <TouchableOpacity
        style={{
          backgroundColor: bcolor ?? '#296f8c',
          padding: 10,
          borderRadius: 30,
          marginBottom: 10,
          // position: 'absolute',
          // bottom: -5,
          width: '80%',
          // marginHorizontal: 60,
          justifyContent: 'center',
          alignSelf: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}
        onPress={onPress}>
        <Text
          style={{
            color: tcolor ?? 'white',
            fontSize: 20,
            fontFamily: 'Poppins-SemiBold',
            textAlign: 'center',
          }}>
          {label}
        </Text>
        <View style={{marginLeft: 10}}>
          <MaterialIcons name={iconName} size={iconSize} color={iconColor} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ButtonForm;
