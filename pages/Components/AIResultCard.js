import { Animated, StyleSheet, Text, View } from 'react-native';
import React, { useRef, useEffect } from 'react';

const AIResultCard = ({
  label = "Analysis Result",
  value = "N/A",
  icon = "📊",
  confidence = 0.85,
  isPositive = true,
  unavailable = false,
  delay = 0,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  const accent = unavailable ? '#6B7280' : (isPositive ? '#22C55E' : '#EF4444');
  const bgAccent = unavailable ? '#1F2937' : (isPositive ? '#052E16' : '#2D0A0A');

  return (
    <Animated.View
      style={[
        styles.resultCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          borderLeftColor: accent,
          backgroundColor: bgAccent,
        },
      ]}
    >
      <Text style={styles.resultIcon}>{unavailable ? '❓' : icon}</Text>
      <View style={styles.resultContent}>
        <Text style={styles.resultLabel}>{label}</Text>
        <Text style={[styles.resultValue, { color: accent }]}>
          {unavailable ? 'Model Unavailable' : value}
        </Text>
      </View>
      {/* {!unavailable && (
        <View style={styles.confidenceBadge}>
          <Text style={[styles.confidenceText, { color: accent }]}>
            {(confidence * 100).toFixed(1)}%
          </Text>
        </View>
      )} */}
    </Animated.View>
  );
};

export default AIResultCard;

const styles = StyleSheet.create({
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  confidenceBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
  },
});