import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Colors } from '../../utils/Constants';
const SkeletonCardActivityList = () => {
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
      <View style={styles.header}>
        <View style={styles.circle} />
        <View style={styles.headerTextContainer}>
          <View style={styles.lineShort} />
          <View style={styles.lineTiny} />
        </View>
        <View style={styles.badge} />
      </View>

      <View style={styles.lineFull} />
      <View style={styles.lineFull} />
      <View style={styles.lineShort} />

      <View style={styles.footer}>
        <View style={styles.lineTiny} />
        <View style={styles.lineTiny} />
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: Colors.border,
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,
    borderLeftWidth: 4,
    borderLeftColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.border,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  badge: {
    width: 50,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.border,
  },
  lineFull: {
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 7,
    marginBottom: 10,
  },
  lineShort: {
    width: '70%',
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 7,
    marginBottom: 10,
  },
  lineTiny: {
    width: '40%',
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 7,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

export default SkeletonCardActivityList;
