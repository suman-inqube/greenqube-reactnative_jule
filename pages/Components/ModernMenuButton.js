import React, { memo, useRef, useEffect, useCallback } from 'react';
import {
  Animated,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import ImageForm from '../Common/ImageForm';
import { Colors,Fonts } from '../utils/Constants';
const ModernMenuButton = memo(({ item, onPress, t, index, isExpanded }) => {
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isExpanded) {
      const delay = index * 50;
      Animated.spring(buttonAnim, {
        toValue: 1,
        delay,
        tension: 120,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      buttonAnim.setValue(0);
    }
  }, [isExpanded, index]);

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onPress(item.key);
    });
  }, [onPress, item.key]);

  if (!isExpanded) return null;

  return (
    <Animated.View
      style={[
        styles.modernMenuButton,
        {
          opacity: buttonAnim,
          transform: [
            { scale: buttonAnim },
            {
              translateY: buttonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [15, 0],
              }),
            },
          ],
        },
      ]}>
      <TouchableOpacity
        style={[styles.menuButtonTouchable, { backgroundColor: item.iconBg }]}
        onPress={handlePress}
        activeOpacity={0.8}>
        <View style={styles.modernIconContainer}>
          <ImageForm
            source={item.icon}
            width={24}
            height={24}
            resizeMode="cover"
            borderRadius={50}
          />
        </View>
        <Text style={styles.modernMenuText} numberOfLines={2}>
          {t(item.labelKey)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default ModernMenuButton;

const styles = StyleSheet.create({
  modernMenuButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  menuButtonTouchable: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 90,
    justifyContent: 'center',
  },
  modernIconContainer: {
    marginBottom: 8,
  },
  modernMenuText: {
    fontSize: 10,
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
    lineHeight: 12,
  },
  
});