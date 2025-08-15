import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {MotiView} from 'moti';

const SkeletonProblemCard = () => {
  return (
    <View style={styles.card}>
      <MotiView
        style={styles.header}
        from={{opacity: 0.3}}
        animate={{opacity: 1}}
        transition={{
          type: 'timing',
          duration: 800,
          loop: true,
          repeatReverse: true,
        }}
      />
      <View style={styles.content}>
        <View style={styles.row}>
          <MotiView
            style={[styles.skeletonBox, {width: 60}]}
            from={{opacity: 0.3}}
            animate={{opacity: 1}}
            transition={{loop: true, repeatReverse: true, duration: 800}}
          />
          <MotiView
            style={[styles.skeletonBox, {width: '50%'}]}
            from={{opacity: 0.3}}
            animate={{opacity: 1}}
            transition={{loop: true, repeatReverse: true, duration: 800}}
          />
        </View>
        <View style={styles.row}>
          <MotiView
            style={[styles.skeletonBox, {width: 80}]}
            from={{opacity: 0.3}}
            animate={{opacity: 1}}
            transition={{loop: true, repeatReverse: true, duration: 800}}
          />
          <MotiView
            style={[styles.skeletonBox, {width: '60%'}]}
            from={{opacity: 0.3}}
            animate={{opacity: 1}}
            transition={{loop: true, repeatReverse: true, duration: 800}}
          />
        </View>
      </View>
    </View>
  );
};

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

export default SkeletonProblemCard;
