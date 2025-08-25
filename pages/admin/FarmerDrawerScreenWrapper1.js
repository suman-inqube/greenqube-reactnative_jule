import { View, Text, StyleSheet } from 'react-native';
import React, { memo } from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useDrawerProgress } from '@react-navigation/drawer';

const FarmerDrawerScreenWrapper1 = ({ children }) => {
  const progress = useDrawerProgress();
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [1, 0.78], 'clamp'),
      },
    ],
    borderRadius: withSpring(
      interpolate(progress.value, [0, 1], [0, 30], 'clamp'),
      { damping: 10 },
    ),
    overflow: 'hidden',
  }));
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

export default memo(FarmerDrawerScreenWrapper1);

const styles = StyleSheet.create({
  container: { flex: 1 },
});
