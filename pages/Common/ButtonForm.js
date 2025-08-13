import React, { useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../utils/Constants';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

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
  const hasClickedRef = useRef(false);
  const handlePress = () => {
    if (!hasClickedRef.current && !loading) {
      hasClickedRef.current = true;
      onPress?.();
    }
  };
  return (
    <View>
      <TouchableOpacity
        style={{
          backgroundColor: bcolor ?? Colors.green,
          padding: 10,
          // borderRadius: 30,
          // marginBottom: 10,
          width: '100%',
          justifyContent: 'center',
          alignSelf: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          opacity: loading ? 0.8 : 1,
          height: 50
        }}
        onPress={handlePress}
        disabled={loading}>
        {loading ? (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}>
            <ActivityIndicator size="small" color={tcolor ?? 'white'} />
          </Animated.View>
        ) : (
          <Animated.View
            style={{ flexDirection: 'row', alignItems: 'center' }}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}>
            <Text
              style={{
                color: tcolor ?? 'white',
                fontSize: 20,
                fontFamily: 'Poppins-SemiBold',
                textAlign: 'center',
              }}>
              {label}
            </Text>
            {iconName && (
              <View style={{ marginLeft: 10 }}>
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

export default ButtonForm;
