import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#085610" />
      {/* <Text style={styles.title}>Loading...</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor:'#0303032d'
    backgroundColor: 'transparent',
    zIndex:999
  },
  title:{
    color:'#000'
  }
});

export default LoadingScreen;
