import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Colors } from '../../utils/Constants';

const SkeletonLoanCard = () => {
  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{
        type: 'timing',
        duration: 900,
        loop: true,
        repeatReverse: true,
      }}
      style={styles.card}
    >
      <View style={styles.content}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <View key={idx} style={styles.row}>
            <View style={[styles.skeletonBox, { width: 60 }]} />
            <View style={[styles.skeletonBox, { width: '50%' }]} />
          </View>
        ))}
      </View>
    </MotiView>
  );
};

export default memo(SkeletonLoanCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    height: 180,
    marginVertical: 8,
    borderRadius: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#95b082ff',
    paddingHorizontal: 15,
    marginHorizontal: '2.5%',
    marginBottom: 10,

    // ✅ lighter shadow (better FPS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,

    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: Colors.border,
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  skeletonBox: {
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
});
