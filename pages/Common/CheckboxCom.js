import {StyleSheet, Text, View, TouchableOpacity, Animated} from 'react-native';
import React, {useEffect, useRef} from 'react';

const CheckboxCom = ({label, checked, onPress}) => {
  const labelString = label.charAt(0).toUpperCase() + label.slice(1);

  const animatedBg = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const tickOpacity = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedBg, {
      toValue: checked ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.timing(tickOpacity, {
      toValue: checked ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

  }, [checked]);

  const backgroundColor = animatedBg.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E5E5', '#BAFF66'],
  });

  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <Animated.View style={[styles.checkboxBox, {backgroundColor}]}>
        <Animated.Text style={[styles.checkText, {opacity: tickOpacity}]}>
          ✔
        </Animated.Text>
      </Animated.View>
      <Text style={styles.checkboxLabel}>{labelString}</Text>
    </TouchableOpacity>
  );
};

export default CheckboxCom;

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  checkboxBox: {
    height: 24,
    width: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0a3e08',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkMark: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#074609',
  },
  checkboxLabel: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
});
