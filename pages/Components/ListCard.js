import React, {useState, useEffect, useRef, memo, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../utils/Constants';

const ListCard = ({
  onPress,
  title,
  subtitle,
  items = [],
  showIcon = true,
  iconName = 'chevron-right',
  iconSize = 20,
  iconColor = '#2e7d32',
  showChevron = true,
  borderColor = Colors.borderGreen,
  cardStyle = {},
  index = 0,
  status,
  customIcon,
  cardSubtitleStyle,
  titleStyle,
  animationDelay = 100,
  showRejectedStatus = false,
  rejectionReason = '',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current; // Start from left (-50)
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * animationDelay; // 100ms delay between each card

    Animated.parallel([
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800, // Longer duration for smoother effect
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Slide in from left animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        delay,
        easing: Easing.out(Easing.back(1.2)), // Bouncy effect
        useNativeDriver: true,
      }),
      // Scale animation
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        delay,
        easing: Easing.out(Easing.elastic(1)), // Elastic effect
        useNativeDriver: true,
      }),
      // Subtle rotation animation
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.out(Easing.sin),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim, rotateAnim, index, animationDelay]);

  // Interpolate rotation for subtle tilt effect
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-2deg', '0deg'], // Slight tilt from left
  });

  // Press animation - enhanced
  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0.98,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };
  const getStatusColor = statusValue => {
    switch (statusValue) {
      case 2:
        return styles.approved; // Green for approved
      case 1:
        return styles.pending; // Orange for pending
      case 3:
        return styles.rejected; // Red for rejected
      default:
        return {};
    }
  };
  const renderIcon = () => {
    if (customIcon) {
      // Return custom icon component if provided
      return customIcon;
    }

    if (showIcon) {
      // Return MaterialIcon with customizable properties
      return (
        <MaterialIcons name={iconName} size={iconSize} color={iconColor} />
      );
    }

    return null;
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          borderLeftColor: borderColor,
          opacity: fadeAnim,
          transform: [
            {translateX: slideAnim}, // Slide from left
            {scale: scaleAnim},
            {rotate: rotateInterpolate}, // Subtle rotation
          ],
        },
        cardStyle,
      ]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}>
        <View style={styles.cardHeader}>
          <View style={styles.marqueeContainer}>
            <Text
              style={[styles.cardTitle, titleStyle]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[styles.cardSubtitle, cardSubtitleStyle]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {subtitle}
              </Text>
            )}
          </View>
          {showRejectedStatus && (
            <View style={styles.rejectedContainer}>
              <Text style={styles.rejectedText}>Rejected</Text>
            </View>
          )}
          {renderIcon() && (
            <View style={styles.cardFooter}>{renderIcon()}</View>
          )}
        </View>

        {items.map((item, itemIndex) => (
          <Animated.View
            key={itemIndex}
            style={[
              styles.detailRow,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [-50, 0],
                      outputRange: [-20, 0], // Staggered item animation
                    }),
                  },
                ],
              },
            ]}>
            <Text style={styles.label}>{item.label}:</Text>
            <Text
              style={[
                styles.value,
                item.valueStyle,
                status && getStatusColor(status),
              ]}
              numberOfLines={item.numberOfLines || 1}
              ellipsizeMode={item.ellipsizeMode || 'tail'}>
              {item.value}
            </Text>
          </Animated.View>
        ))}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'white',
    marginVertical: 8,
    borderRadius: 20,
    borderLeftWidth: 5,
    paddingHorizontal: 15,
    marginHorizontal: '4%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: Colors.border,
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
  },
  cardTitle: {
    fontSize: 14,
    color: Colors.useGreen,
    fontFamily: 'Poppins-SemiBold',
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  marqueeContainer: {
    flex: 1,
    marginRight: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginLeft: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
  },
  value: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    textAlign: 'right',
  },
  // Status-based styles
  approved: {
    color: '#236432', // Green for approved
    fontFamily: 'Poppins-SemiBold',
  },
  pending: {
    color: '#a66607', // Orange for pending
    fontFamily: 'Poppins-SemiBold',
  },
  rejected: {
    color: '#b83535', // Red for rejected
    fontFamily: 'Poppins-SemiBold',
  },
  rejectedContainer: {
    backgroundColor: '#b83535',
    paddingHorizontal: 5,
    // paddingVertical: 4,
    borderRadius: 5,
    marginRight: 10,
  },
  rejectedText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
});
export default memo(ListCard);
