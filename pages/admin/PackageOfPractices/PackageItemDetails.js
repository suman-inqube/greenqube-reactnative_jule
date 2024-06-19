import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native'
import React from 'react'
import { useRoute } from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import CustomHeader from '../CustomHeader';
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
const PackageItemDetails = () => {
    const { width, height } = useWindowDimensions();
    const { package_of_practice_list, menu_name } = useRoute().params;
    console.log(package_of_practice_list)
    const tagsStyles = {
        body: { whiteSpace: 'normal', color: '#000', backgroundColor: '#FFF' },
        a: { color: 'green' },
        p: { fontSize: 15 },
        strong: { fontSize: 20 },
        table: {
            border: "1px solid black"
        }, th: {
            border: "1px solid black"
        }, td: {
            border: "1px solid black"
        },
        table: {
            width: "100%",
        }
    };
    const { HandlerGoBack } = PackageOfPracticesController();
    // useEffect(() => {
    //     setPOPDetailsList(paramsData);
    // }, []);
    const defaultTextProps = {
        selectable: true
    };
    return (
        <View style={styles.container}>
            <CustomHeader HandlerGoBack={() => HandlerGoBack("PackageOfPracticesDetails")} />
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{menu_name}</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View >
                    <WebView
                        style={{
                            height: height / 0.05,
                            width: width,
                            marginBottom: 50
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
            </ScrollView>
        </View>
    )
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