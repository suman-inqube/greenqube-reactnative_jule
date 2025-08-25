import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {MotiView} from 'moti';
import {Colors} from '../../utils/Constants';

const SkeletonLoanCard = () => {
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
        {/* <View style={styles.row}>
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
        </View> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    height: 180,
    marginVertical: 8,
    borderRadius: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#95b082ff',
    // flexDirection: 'row',
    // alignItems: 'center',
    // marginBottom: 8,
    paddingHorizontal: 15,
    marginHorizontal: '2.5%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 4,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: Colors.border,
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,
  },
  // header: {
  //   // height: 40,
  //   backgroundColor: '#ffffffff',
  // },
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

export default SkeletonLoanCard;
