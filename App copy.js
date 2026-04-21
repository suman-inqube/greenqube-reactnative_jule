import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { downloadWithCache } from './pages/hooks/ModelDownload';

const App = () => {
  const runDownload = async () => {
  try {
    const res = await downloadWithCache({
      onProgress: (p) => console.log('Progress:', p),
      onStage: (s) => console.log('Stage:', s),
    });

    if (!res.updated) {
      console.log('🚀 Already up to date');
    } else {
      console.log('✅ Updated!');
    }

  } catch (e) {
    console.log('ERROR:', e.message);
  }
};
  useEffect(() => {
   runDownload();
  }, [])
  return (
    <View>
      <Text>App</Text>
    </View>
  )
}

export default App

const styles = StyleSheet.create({})