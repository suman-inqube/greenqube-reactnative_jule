import {StyleSheet, Text, View} from 'react-native';
import React, {memo} from 'react';
import {Colors, Fronts} from '../utils/Constants';

const FormsTitle = ({title}) => {
  return (
    <View style={styles.titleContainer}>
      <Text style={[styles.title]}>{title}</Text>
    </View>
  );
};

export default memo(FormsTitle);

const styles = StyleSheet.create({
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.useGreen,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    height: '8%',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    // paddingBottom: 8,
    // paddingTop: 4,
    fontSize: 22,
    paddingTop: 20,
  },
});
