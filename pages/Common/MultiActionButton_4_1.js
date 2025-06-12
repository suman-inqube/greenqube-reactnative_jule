import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
const MultiActionButton = ({ actions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [animation] = useState(new Animated.Value(0)); 
  

    const toggleMenu = () => {
      const toValue = isOpen ? 0 : 1; 
      Animated.timing(animation, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setIsOpen(!isOpen);
    };
  

    const handleActionPress = (action) => {
      // toggleMenu(); // Collapse the menu
      action.onPress(); 
    };
  

    const renderActions = () => {
      return actions.map((action, index) => {
        const inputRange = [0, 1];
        const outputRange = [0, -70 * (index + 1)]; 
  
        const translateY = animation.interpolate({
          inputRange,
          outputRange,
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
    };
  
    return (
      <View style={styles.container}>
        {renderActions()}
        <TouchableOpacity style={styles.mainButton} onPress={toggleMenu}>
          <Text style={styles.mainButtonText}>{isOpen ? "×" : "+"}</Text>
        </TouchableOpacity>
      </View>
    );
}

export default MultiActionButton

const styles = StyleSheet.create({
    appContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
    },
    container: {
      position: "absolute",
      bottom: 50,
      right: 30,
      alignItems: "center",
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