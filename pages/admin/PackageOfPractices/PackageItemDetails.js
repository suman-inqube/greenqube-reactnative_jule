import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React, { useContext } from 'react'
import { useRoute } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import PackageOfPracticesController from '../../ViewController/PackageOfPracticesController';
import { WebView } from 'react-native-webview';
// .iframe>* {
const head = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
    iframe {
    width:100%;
    }
    </style>
    `;
// top: 0; left: 0; width: 70%; height: 100%; position: absolute; border: 0;
// }
import { userCreateContext } from '../../Context/usersCreateContext';
const PackageItemDetails = () => {
    const { CustomHeader, logoImage, topBanner, } = useContext(userCreateContext);
    const { width, height } = useWindowDimensions();
    const { package_of_practice_list, menu_name } = useRoute().params;
    const { HandlerGoBack } = PackageOfPracticesController();
    // useEffect(() => {
    //     setPOPDetailsList(paramsData);
    // }, []);
    const defaultTextProps = {
        selectable: true
    };
    return (
      <View style={styles.container}>
        <CustomHeader
          HandlerGoBack={() => HandlerGoBack('PackageOfPracticesDetails')}
          logoImage={logoImage}
          topBanner={topBanner}
        />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{menu_name}</Text>
        </View>
       
          <View style={{flex: 1}}>
            <WebView
              style={{
                flex: 1 ,
                height: height / 0.05,
                // height: height / 1.5,
                width: width,
                marginBottom: 50,
              }}
              source={{
                html: `
                            <!DOCTYPE html>
                            <html>
                                <head>${head}</head> 
                                <body style="height: :'100%';overflow: "scroll";">
                                ${package_of_practice_list} 
                                </body>
                            </html>`,
              }}
              automaticallyAdjustContentInsets={false}
            />
          </View>
       
      </View>
    );
}

export default PackageItemDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // height: 100,
        // backgroundColor: 'blue'
    },
    titleContainer: {
        backgroundColor: '#195D06',
        padding: 10
    },
    title: {
        color: '#FFF',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
    },
})