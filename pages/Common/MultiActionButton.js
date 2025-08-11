import React, { useState, useCallback, useRef,memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";

const MultiActionButton = ({ actions, statuslevel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = useCallback(() => {
    Animated.timing(animation, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsOpen(prev => !prev);
  }, [isOpen]);

  const handleActionPress = useCallback((action) => {
    action.onPress();
    // toggleMenu(); // If you want to close after press
  }, []);

  const renderActions = () =>
    actions.map((action, index) => {
      const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -70 * (index + 1)],
      });

      return (
        <Animated.View
          key={index}
          style={[styles.actionButton, { transform: [{ translateY }] }]}
        >
          <TouchableOpacity
            style={[styles.action, action.style]}
            onPress={() => handleActionPress(action)}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    });

  return (
    <View style={styles.container}>
      {(!statuslevel || statuslevel === "PENDING" || statuslevel === "REJECTED") && (
        <>
          {renderActions()}
          <TouchableOpacity style={styles.mainButton} onPress={toggleMenu}>
            <Text style={styles.mainButtonText}>{isOpen ? "×" : "+"}</Text>
          </TouchableOpacity>
        </>
      )}
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
    zIndex: 999, // stays above other components
    elevation: 10, // Android stacking fix
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
