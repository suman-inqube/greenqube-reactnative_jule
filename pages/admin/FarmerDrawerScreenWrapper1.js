import {View, Text, StyleSheet, StatusBar} from 'react-native';
import React, {memo} from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {useDrawerProgress} from '@react-navigation/drawer';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Root} from '@sekizlipenguen/react-native-popup-confirm-toast';
import MyErrorBoundary from '../Common/MyErrorBoundary';

const FarmerDrawerScreenWrapper1 = ({children}) => {
  const progress = useDrawerProgress();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [1, 0.78], 'clamp'),
      },
    ],
    borderRadius: withSpring(
      interpolate(progress.value, [0, 1], [0, 30], 'clamp'),
      {damping: 10},
    ),
    overflow: 'hidden',
  }));

  return (
    <Root>
      <MyErrorBoundary>
        <SafeAreaView
          style={{flex: 1, backgroundColor: '#1d3122'}}
          edges={['top', 'right', 'bottom', 'left']}>
          
          {/* 👇 Add your StatusBar here
          <StatusBar
            translucent={false}         // false = StatusBar takes up space
            backgroundColor="#1d3122"   // match your background
            barStyle="light-content"    // or "dark-content" depending on background
            animated={true}
          /> */}

          <Animated.View style={[styles.container, animatedStyle]}>
            {children}
          </Animated.View>
        </SafeAreaView>
      </MyErrorBoundary>
    </Root>
  );
};

export default memo(FarmerDrawerScreenWrapper1);

const styles = StyleSheet.create({
  container: {flex: 1},
});
