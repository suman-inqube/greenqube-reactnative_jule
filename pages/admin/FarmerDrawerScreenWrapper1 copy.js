import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useDrawerProgress } from '@react-navigation/drawer';

const FarmerDrawerScreenWrapper1 = ({ children }) => {
  const progress = useDrawerProgress();
  const scale = useRef(new Animated.Value(1)).current;
  const borderRadius = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = progress.addListener(({ value }) => {
      Animated.spring(scale, {
        toValue: value ? 0.78 : 1,
        damping: 10,
        useNativeDriver: true,
      }).start();

      Animated.spring(borderRadius, {
        toValue: value ? 30 : 0,
        damping: 10,
        useNativeDriver: false, // borderRadius does not support native driver
      }).start();
    });

    return () => {
      progress.removeListener(unsubscribe);
    };
  }, [progress, scale, borderRadius]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale }],
          borderRadius,
          overflow: 'hidden',
        },
      ]}>
      {children}
    </Animated.View>
  );
};

export default memo(FarmerDrawerScreenWrapper1);

const styles = StyleSheet.create({
  container: { flex: 1 },
});
