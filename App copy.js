import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crashlytics from "@react-native-firebase/crashlytics";
const withAuth = (WrappedComponent, onPressCallback) => {
  return function AuthComponent(props) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          console.log('User is logged in');
        } else {
          console.log('User not logged in');
        }
        setLoading(false);
      };

      checkAuth();
    }, []);

    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      );
    }

    return <WrappedComponent {...props} onPress={onPressCallback} />;
  };
};

const Dashboard = ({ onPress }) => (
  <View style={styles.center}>
    <Text style={styles.text}>Secret Dashboard</Text>
    <Text onPress={onPress} style={{ color: 'blue', marginTop: 20 }}>
      Logout
    </Text>
  </View>
);

const handleLogout = async () => {
  await AsyncStorage.removeItem('token');
  
  crashlytics().log('User logged out');
  crashlytics().setAttributes({
    userId: '123',
    screen: 'Dashboard',
    errorType: 'api_error',
  });
  crashlytics().recordError(new Error('Failed to fetch data'));
  console.log('Logged out');
};


// ✅ HOC Usage
const ProtectedDashboard = withAuth(Dashboard, handleLogout);


// ✅ App Root
const App = () => {
  return (
    <View style={styles.container}>
      <ProtectedDashboard />
    </View>
  );
};

export default App;


// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
});
