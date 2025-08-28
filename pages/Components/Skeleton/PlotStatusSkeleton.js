// PlotStatusSkeletonScreen.js
import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Colors } from '../../utils/Constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SHIMMER_WIDTH = SCREEN_WIDTH * 0.4;
const SHIMMER_COLOR = 'rgba(255,255,255,0.6)';

const ShimmerOverlay = () => (
  <MotiView
    from={{ translateX: -SHIMMER_WIDTH }}
    animate={{ translateX: SCREEN_WIDTH }}
    transition={{
      loop: true,
      type: 'timing',
      duration: 1200,
    }}
    style={[StyleSheet.absoluteFill, { width: SHIMMER_WIDTH, backgroundColor: SHIMMER_COLOR }]}
  />
);

const SkeletonBlock = ({ width, height, radius = 6, style }) => (
  <View
    style={[
      {
        width,
        height,
        borderRadius: radius,
        backgroundColor: Colors.border, // static bg
      },
      style,
    ]}
  />
);

const PlotStatusSkeletonScreen = () => {
  return (
    <View style={styles.card}>
      {/* Shared shimmer for this card */}
      <ShimmerOverlay />

      {/* Top row: "Plot1" + chevron */}
      <View style={[styles.row, { padding: 12 }]}>
        <SkeletonBlock width={120} height={18} />
        <SkeletonBlock width={26} height={26} radius={13} />
      </View>

      <View style={styles.separator} />

      {/* Bottom row */}
      <View style={[styles.row, { paddingHorizontal: 12, paddingVertical: 12 }]}>
        <View style={styles.leftGroup}>
          <SkeletonBlock width={32} height={28} radius={8} />
          <SkeletonBlock width={90} height={16} style={{ marginLeft: 10 }} />
        </View>
        <SkeletonBlock width={110} height={34} radius={10} />
      </View>
    </View>
  );
};

export default memo(PlotStatusSkeletonScreen);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden', // clips shimmer overlay
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftGroup: { flexDirection: 'row', alignItems: 'center' },
  separator: {
    height: 1,
    backgroundColor: '#f1f1f1',
    width: '100%',
  },
});
