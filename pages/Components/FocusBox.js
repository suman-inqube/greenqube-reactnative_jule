import React from 'react';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';

export default function FocusBox({x, y, visible}) {
  const style = useAnimatedStyle(() => ({
    opacity: visible ? withTiming(1) : withTiming(0),
    transform: [{scale: withTiming(visible ? 1 : 1.2)}],
    left: x - 40,
    top: y - 40,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 80,
          height: 80,
          borderWidth: 2,
          borderColor: '#10b981',
          borderRadius: 6,
        },
        style,
      ]}
    />
  );
}
