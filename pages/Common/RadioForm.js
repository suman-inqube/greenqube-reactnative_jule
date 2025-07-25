import {StyleSheet, Text, View, TouchableOpacity, Animated} from 'react-native';
import React, {useEffect, useRef} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const RadioForm = ({label, selected, onSelect}) => {
  const labelString = label.charAt(0).toUpperCase() + label.slice(1);

  const animatedBg = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const iconScale = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(animatedBg, {
      toValue: selected ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.spring(iconScale, {
      toValue: selected ? 1 : 0,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [selected]);

  const backgroundColor = animatedBg.interpolate({
    inputRange: [0, 1],
    outputRange: ['white', '#478541'],
  });

  return (
    <TouchableOpacity style={styles.radioButton} onPress={onSelect}>
      <View style={styles.radioCircle}>
        <Animated.View
          style={[
            styles.innerCircle,
            {
              backgroundColor,
            },
          ]}>
          {/* {selected && ( */}
          <Animated.View
            style={[
              // styles.selectedRb,
              {
                transform: [{scale: iconScale}],
                opacity: iconScale,
              },
            ]}
          />
          <MaterialIcons name="check" size={16} color="white" />
          {/* )} */}
        </Animated.View>
      </View>
      <Text style={styles.radioText}>{labelString}</Text>
    </TouchableOpacity>
  );
};

export default RadioForm;

const styles = StyleSheet.create({
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    marginLeft: 25,
  },
  radioCircle: {
    height: 24, // Adjust based on outer size + 2 * margin (24 + 6)
    width: 24, // Adjust based on outer size + 2 * margin (24 + 6)
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#478541',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  innerCircle: {
    height: 18, // Adjust based on outer size - 2 * margin (24 - 6)
    width: 18,
    borderRadius: 9,
    margin: 2, // <- 3px gap between border and fill

    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0a3e08',
  },
  radioText: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
});
