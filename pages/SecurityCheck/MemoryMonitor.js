import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const MemoryMonitor = () => {
  const [memory, setMemory] = useState({
    total: '0',
    used: '0',
    free: '0',
  });

  const checkMemoryUsage = async () => {
    try {
      const totalMemory = await DeviceInfo.getTotalMemory();
      const usedMemory = await DeviceInfo.getUsedMemory();
      const freeMemory = totalMemory - usedMemory;

      const totalMB = (totalMemory / 1024 / 1024).toFixed(0);
      const usedMB = (usedMemory / 1024 / 1024).toFixed(0);
      const freeMB = (freeMemory / 1024 / 1024).toFixed(0);

      setMemory({
        total: totalMB,
        used: usedMB,
        free: freeMB,
      });

    } catch (error) {
      console.log('Memory check error:', error);
    }
  };

  useEffect(() => {
    checkMemoryUsage();
    const interval = setInterval(checkMemoryUsage, 1000); // every 5 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>RAM Used: {memory.used} MB</Text>
      <Text style={styles.text}>Free: {memory.free} MB</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
    zIndex: 9999,
  },
  text: {
    color: '#fff',
    fontSize: 12,
  },
});

export default MemoryMonitor;
