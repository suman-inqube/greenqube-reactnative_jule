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
    // backgroundColor: '#1c571cff',
    // borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
    height: 40,
    marginVertical: 10,

    justifyContent: 'center',
  },
  title: {
    color: '#1c571cff',
    fontFamily: 'Poppins-SemiBold',
    // paddingBottom: 8,
    // paddingTop: 4,
    fontSize: 21,
    // paddingTop: 20,
  },
});
