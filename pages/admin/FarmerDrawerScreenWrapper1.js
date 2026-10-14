import { StyleSheet } from 'react-native';
import React, { memo } from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useDrawerProgress } from '@react-navigation/drawer';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Root } from '@sekizlipenguen/react-native-popup-confirm-toast';
import MyErrorBoundary from '../Common/MyErrorBoundary';
const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);
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
  const safeAreaAnimatedStyle = useAnimatedStyle(() => ({ backgroundColor: progress.value > 0 ? '#1d3122' : '#1c571c' }));
  return (
    <SafeAreaProvider>
      <AnimatedSafeAreaView
        style={[
          styles.safeArea,
          safeAreaAnimatedStyle 
        ]}
        edges={['top', 'right', 'left','buttom']}>
        <Root>
          <MyErrorBoundary>
            <Animated.View style={[styles.container, animatedStyle]}>
              {children}
            </Animated.View>
          </MyErrorBoundary>
        </Root>
      </AnimatedSafeAreaView>
    </SafeAreaProvider>
  );
};

export default memo(FarmerDrawerScreenWrapper1);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1c571c',
  },
  container: {
    flex: 1,
  },
});
