import React, { memo } from 'react';
import { StyleSheet, Platform } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useDrawerProgress } from '@react-navigation/drawer';
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Root } from '@sekizlipenguen/react-native-popup-confirm-toast';
import MyErrorBoundary from '../Common/MyErrorBoundary';
const COLORS = {
  closed: '#1c571c',
  opened: '#1d3122',
  bottomClosed: '#FFFFFF',
};
const AnimatedSafeAreaView =Animated.createAnimatedComponent(SafeAreaView);
const FarmerDrawerScreenWrapperContent = ({ children }) => {
  const progress = useDrawerProgress();
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';
  const screenAnimatedStyle = useAnimatedStyle(() => {
  const drawerProgress = progress.value;
    return {
      transform: [
        {
          scale: interpolate(
            drawerProgress,
            [0, 1],
            [1, 0.78],
            'clamp',
          ),
        },
      ],
      borderRadius: withSpring(
        interpolate(drawerProgress, [0, 1], [0, 30], 'clamp'),
        { damping: 10 },
      ),
      overflow: 'hidden',
    };
  });
  const safeAreaAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor:
      progress.value > 0.01 ? COLORS.opened : COLORS.closed,
  }));

  const bottomInsetAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor:
      progress.value > 0.01
        ? COLORS.opened
        : COLORS.bottomClosed,
  }));
  const bottomInsetHeight =
    Platform.OS === 'android'
      ? insets.bottom
      : Math.max(insets.bottom - 10, 0);
  return (
    <>
      <AnimatedSafeAreaView
        edges={['top', 'right', 'left']}
        style={[
          styles.safeArea,
          safeAreaAnimatedStyle,
          isAndroid && insets.bottom < 24
            ? { paddingBottom: insets.bottom }
            : null,
        ]}
      >
        <Root>
          <MyErrorBoundary>
            <Animated.View
              style={[styles.container, screenAnimatedStyle]}
            >
              {children}
            </Animated.View>
          </MyErrorBoundary>
        </Root>
      </AnimatedSafeAreaView>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.bottomInset,
          { height: bottomInsetHeight },
          bottomInsetAnimatedStyle,
        ]}
      />
    </>
  );
};

const FarmerDrawerScreenWrapper = ({ children }) => (
  <SafeAreaProvider>
    <FarmerDrawerScreenWrapperContent>
      {children}
    </FarmerDrawerScreenWrapperContent>
  </SafeAreaProvider>
);

export default memo(FarmerDrawerScreenWrapper);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.closed,
  },
  container: {
    flex: 1,
  },
  bottomInset: {
    position: 'relative',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    // elevation: 10,
  },
});
