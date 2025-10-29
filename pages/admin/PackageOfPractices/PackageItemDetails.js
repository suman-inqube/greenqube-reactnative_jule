import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, useWindowDimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { userCreateContext } from '../../Context/usersCreateContext';
import PackageOfPracticesController from '../../ViewController/PackageOfPracticesController';
const PackageItemDetails = () => {
  const { CustomHeader, logoImage, topBanner } = useContext(userCreateContext);
  const { width } = useWindowDimensions();
  const { package_of_practice_list, menu_name } = useRoute().params;
  const { HandlerGoBack } = PackageOfPracticesController();
  return (
    <View style={styles.container}>
      <CustomHeader
        // HandlerGoBack={() => HandlerGoBack('PackageOfPracticesDetails')}
        logoImage={logoImage}
        topBanner={topBanner}
      />

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{menu_name}</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <WebView
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          source={{
            html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <style>
                body { margin: 0; padding: 10px; font-size: 16px; }
                iframe, img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
             ${package_of_practice_list} 
            </body>
          </html>
        `,
          }}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};

export default PackageItemDetails;

const styles = StyleSheet.create({
  container: { flex: 1 },
  titleContainer: {
    backgroundColor: '#1c571cff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
});
