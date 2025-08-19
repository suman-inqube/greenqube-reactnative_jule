import React from 'react';
import {Text, View, TouchableOpacity, ActivityIndicator} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../utils/Constants';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

const ButtonForm = ({
  label,
  onPress,
  tcolor,
  bcolor,
  iconName,
  iconSize = 20,
  iconColor = 'white',
  loading = false,
}) => {
  return (
    <View>
      <TouchableOpacity
        style={{
          backgroundColor: bcolor ?? Colors.green,
          padding: 10,
          width: '100%',
          justifyContent: 'center',
          alignSelf: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          opacity: loading ? 0.7 : 1,
          height: 50,
          borderRadius: 8,
        }}
        onPress={onPress}
        disabled={loading} // disable when loading
      >
        {loading ? (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}>
            <ActivityIndicator size="small" color={tcolor ?? 'white'} />
          </Animated.View>
        ) : (
          <Animated.View
            style={{flexDirection: 'row', alignItems: 'center'}}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}>
            <Text
              style={{
                color: tcolor ?? 'white',
                fontSize: 18,
                fontFamily: 'Poppins-SemiBold',
                textAlign: 'center',
              }}>
              {label}
            </Text>
            {iconName && (
              <View style={{marginLeft: 10}}>
                <MaterialIcons
                  name={iconName}
                  size={iconSize}
                  color={iconColor}
                />
              </View>
            )}
          </Animated.View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(ButtonForm);
