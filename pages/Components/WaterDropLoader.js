// components/WaterDropLoader.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

export default function WaterDropLoader() {
  const dropY = useRef(new Animated.Value(-80)).current;     // drop from above
  const ripple = useRef(new Animated.Value(0)).current;      // 0..1 for ripple
  const fade = useRef(new Animated.Value(0)).current;        // subtle text fade

  useEffect(() => {
    // loop the drop + ripple
    const loop = Animated.loop(
      Animated.sequence([
        // reset states
        Animated.timing(fade, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(dropY, { toValue: -80, duration: 0, useNativeDriver: true }),
        Animated.timing(ripple, { toValue: 0, duration: 0, useNativeDriver: true }),

        // drop falls
        Animated.timing(dropY, {
          toValue: -10,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),

        // impact: brief squash/expand simulated via ripple + text fade in
        Animated.parallel([
          Animated.timing(ripple, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(fade, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),

        // fade text back a bit while resetting
        Animated.timing(fade, {
          toValue: 0.4,
          duration: 400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [dropY, ripple, fade]);

  // ripple size & opacity from 0..1
  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1.6] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0] });

  return (
    <View style={styles.container}>
      {/* gentle gradient-ish background using layered views */}
      <View style={styles.bgTint} />
      <View style={styles.bgTint2} />

      {/* ripple at bottom center */}
      <Animated.View
        style={[
          styles.ripple,
          {
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          },
        ]}
      />

      {/* water drop */}
      <Animated.View
        style={[
          styles.drop,
          {
            transform: [{ translateY: dropY }],
          },
        ]}
      />

      <Animated.Text style={[styles.text, { opacity: fade }]}>
        loading…
      </Animated.Text>
    </View>
  );
}

const DROP_COLOR = '#5ad1ff';
const BG_TOP = '#001a2b';
const BG_BOTTOM = '#00263f';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_BOTTOM,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bgTint: {
    position: 'absolute',
    top: 0,
    width,
    height: height * 0.6,
    backgroundColor: BG_TOP,
  },
  bgTint2: {
    position: 'absolute',
    bottom: -height * 0.1,
    width: width * 1.2,
    height: height * 0.5,
    borderTopLeftRadius: width,
    borderTopRightRadius: width,
    backgroundColor: BG_BOTTOM,
    opacity: 0.9,
  },
  ripple: {
    position: 'absolute',
    bottom: 80,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#7fdcff',
  },
  drop: {
    position: 'absolute',
    bottom: 140,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: DROP_COLOR,
    // teardrop illusion: add a tiny tail using shadow/extra circle
    shadowColor: DROP_COLOR,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: {
    position: 'absolute',
    bottom: 24,
    color: '#bfefff',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
