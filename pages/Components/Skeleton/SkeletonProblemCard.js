import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';

const SkeletonProblemCard = () => {
  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{
        type: 'timing',
        duration: 800,
        loop: true,
        repeatReverse: true,
      }}
      style={styles.card}
    >
      {/* Header */}
      <View style={styles.header} />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={[styles.skeletonBox, { width: 60 }]} />
          <View style={[styles.skeletonBox, { width: '50%' }]} />
        </View>
        <View style={styles.row}>
          <View style={[styles.skeletonBox, { width: 80 }]} />
          <View style={[styles.skeletonBox, { width: '60%' }]} />
        </View>
      </View>
    </MotiView>
  );
};

export default memo(SkeletonProblemCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e7e7e7',
  },
  header: {
    height: 40,
    backgroundColor: '#d1e7d3',
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  skeletonBox: {
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
});
