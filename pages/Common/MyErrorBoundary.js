import React from 'react';
import { View, Text, Button, ImageBackground, StyleSheet } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import { CrashlyticsRecordError } from '../Crashlytics/CrashlyticsRecordError';

const ErrorFallback = ({ error, resetError }) => {
  const handleRetry = () => {
    CrashlyticsRecordError({ error });
    resetError();
  };

  return (
    <ImageBackground
      source={require('../Common/images/error.png')} // Your full-screen background image
      style={styles.background}
      resizeMode="cover" // You can use "contain" if you want to keep full image visible
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle}>The app was about to crash, but I got ya!</Text>
        <Text style={styles.errorText}>{error?.toString()}</Text>
        <Button title="Try again" onPress={handleRetry} />
      </View>
    </ImageBackground>
  );
};

const MyErrorBoundary = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    {children}
  </ErrorBoundary>
);

export default MyErrorBoundary;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)', // dark overlay for contrast
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#eee',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 20,
    textAlign: 'center',
  },
});
