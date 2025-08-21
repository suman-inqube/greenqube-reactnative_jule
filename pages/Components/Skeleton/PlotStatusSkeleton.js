// PlotStatusSkeletonScreen.js
import React from 'react';
import { View, SafeAreaView, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Colors } from '../../utils/Constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ShimmerBox = ({ width, height, radius = 6, style }) => {
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor:Colors.border,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {/* animated white overlay */}
      <MotiView
        from={{ translateX: -width }}
        animate={{ translateX: width }}
        transition={{
          loop: true,
          type: 'timing',
          duration: 1200,
        }}
        style={{
          width: '40%',
          height: '100%',
          backgroundColor: 'rgba(255,255,255,0.5)',
          opacity: 0.6,
        }}
      />
    </View>
  );
};

const PlotStatusSkeletonScreen = () => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 350 }}
      style={styles.card}
    >
      {/* Top row: "Plot1" + chevron */}
      <View style={[styles.row, { padding: 12 }]}>
        <ShimmerBox width={120} height={18} />
        <ShimmerBox width={26} height={26} radius={13} />
      </View>

      <View style={styles.separator} />

      {/* Bottom row: left icon, area text, right status badge */}
      <View style={[styles.row, { paddingHorizontal: 12, paddingVertical: 12 }]}>
        <View style={styles.leftGroup}>
          <ShimmerBox width={32} height={28} radius={8} />
          <ShimmerBox width={90} height={16} style={{ marginLeft: 10 }} />
        </View>
        <ShimmerBox width={110} height={34} radius={10} />
      </View>
    </MotiView>
  );
};

export default PlotStatusSkeletonScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topSpacer: { height: 8 },
  tabs: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    // elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: Colors.border,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    elevation: 5,
  },
});
