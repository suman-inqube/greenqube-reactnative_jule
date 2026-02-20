import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet, Dimensions, Pressable} from 'react-native';

const {height} = Dimensions.get('window');

const BottomSheetDialog = ({visible, onClose, children}) => {
  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : height,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <Animated.View style={[styles.sheet, {transform: [{translateY}]}]}>
        {children}
      </Animated.View>
    </View>
  );
};

export default BottomSheetDialog;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    height: height * 0.75,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
});
