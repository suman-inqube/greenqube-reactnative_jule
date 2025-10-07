// SkeletonUserCard.js
import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Colors } from '../../utils/Constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HILIGHT_OPACITY = 0.3;

const SkeletonBlock = ({ style, radius = 8 }) => (
  <View style={[styles.block, { borderRadius: radius }, style]} />
);

const ShimmerOverlay = () => (
  <MotiView
    style={styles.shimmer}
    from={{ translateX: -SCREEN_WIDTH }}
    animate={{ translateX: SCREEN_WIDTH }}
    transition={{
      loop: true,
      type: 'timing',
      duration: 1200,
    }}
  />
);

const SkeletonUserCard = () => {
  return (
    <View style={styles.card}>
      {/* Shimmer Overlay */}
      <ShimmerOverlay />

      <View style={styles.row}>
        {/* avatar */}
        <SkeletonBlock style={styles.avatar} radius={30} />

        {/* text area */}
        <View style={styles.textCol}>
          <SkeletonBlock style={{ width: '55%', height: 18, marginBottom: 10 }} />
          <SkeletonBlock style={{ width: '70%', height: 14, marginBottom: 8 }} />
          <SkeletonBlock style={{ width: '40%', height: 12 }} />
        </View>

        {/* right side */}
        <View style={styles.rightCol}>
          <SkeletonBlock style={styles.chip} radius={16} />
          <SkeletonBlock style={styles.chev} radius={8} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden', // allows shimmer overlay clipping
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, marginRight: 16 },
  textCol: { flex: 1 },
  rightCol: { alignItems: 'center', justifyContent: 'center' },
  chip: { width: 76, height: 28, marginBottom: 12 },
  chev: { width: 22, height: 12 },
  block: {
    backgroundColor: 'rgba(0,0,0,0.07)',
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: '40%',
    backgroundColor: 'rgba(255,255,255,' + HILIGHT_OPACITY + ')',
  },
});

export default memo(SkeletonUserCard);
