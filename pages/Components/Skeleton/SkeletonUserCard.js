// SkeletonUserCard.js
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Colors } from '../../utils/Constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// pink you asked for (#f8b0b0ff). tweak if needed.
const SKELETON_BASE = '#ccbebea6';
const HILIGHT_OPACITY = 0.35;

const Shimmer = ({ style }) => (
  <MotiView
    style={[styles.shimmer, style]}
    from={{ translateX: -SCREEN_WIDTH }}
    animate={{ translateX: SCREEN_WIDTH }}
    transition={{
      loop: true,
      type: 'timing',
      duration: 1200,
    }}
  />
);

const SkeletonBlock = ({ style, radius = 8 }) => (
  <View style={[styles.block, { borderRadius: radius }, style]}>
    {/* moving light */}
    <Shimmer />
  </View>
);

const SkeletonUserCard = () => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* avatar */}
        <SkeletonBlock style={styles.avatar} radius={30} />

        {/* text area */}
        <View style={styles.textCol}>
          <SkeletonBlock style={{ width: '55%', height: 18, marginBottom: 10 }} />
          <SkeletonBlock style={{ width: '70%', height: 14, marginBottom: 8 }} />
          <SkeletonBlock style={{ width: '40%', height: 12 }} />
        </View>

        {/* right side: chip + chevron */}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderWidth:1,
    borderColor:Colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  textCol: { flex: 1 },
  rightCol: { alignItems: 'center', justifyContent: 'center' },
  chip: { width: 76, height: 28, marginBottom: 12 },
  chev: { width: 22, height: 12 },
  block: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: '45%',
    backgroundColor: 'rgba(255,255,255,' + HILIGHT_OPACITY + ')',
  },
});

export default SkeletonUserCard;
