import React, { useState, useCallback, useRef, memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";

const MultiActionButton = ({ actions = [], statuslevel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  /** Toggle menu open/close */
  const toggleMenu = useCallback(() => {
    Animated.spring(animation, {
      toValue: isOpen ? 0 : 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
    setIsOpen(prev => !prev);
  }, [isOpen, animation]);

  /** Handle action press */
  const handleActionPress = useCallback((action) => {
    action?.onPress?.();
    // toggleMenu(); // uncomment if you want to auto-close
  }, []);

  /** Pre-calc animated actions */
  const renderedActions = useMemo(() => 
    actions.map((action, index) => {
      const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -70 * (index + 1)],
      });

      return (
        <Animated.View
          key={action.label || index}
          style={[styles.actionButton, { transform: [{ translateY }] }]}
        >
          <TouchableOpacity
            style={[styles.action, action.style]}
            onPress={() => handleActionPress(action)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    })
  , [actions, animation, handleActionPress]);

  /** Early exit if not allowed */
  if (statuslevel && !["PENDING", "REJECTED"].includes(statuslevel)) return null;

  return (
    <View style={styles.container}>
      {renderedActions}
      <TouchableOpacity style={styles.mainButton} onPress={toggleMenu} activeOpacity={0.8}>
        <Text style={styles.mainButtonText}>{isOpen ? "×" : "+"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default memo(MultiActionButton);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50,
    right: 30,
    alignItems: "center",
    zIndex: 999,
    elevation: 10,
  },
  mainButton: {
    width: 60,
    height: 60,
    backgroundColor: "#003c04",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
  },
  mainButtonText: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
  },
  actionButton: {
    position: "absolute",
  },
  action: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    color: "white",
    fontSize: 12,
  },
});
