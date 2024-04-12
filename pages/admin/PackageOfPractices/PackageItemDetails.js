import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'
import { useRoute } from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import CustomHeader from '../CustomHeader';
import PackageOfPracticesController from '../../ViewController/PackageOfPracticesController';
const PackageItemDetails = () => {
    const { width } = useWindowDimensions();
    const { content, title, paramsData } = useRoute().params;
    const tagsStyles = {
        body: { whiteSpace: 'normal', color: '#000', backgroundColor: '#FFF' },
        a: { color: 'green' },
        p: { fontSize: 15 },
        strong: { fontSize: 20 }
    };
    const { HandlerGoBack } = PackageOfPracticesController();
    // useEffect(() => {
    //     setPOPDetailsList(paramsData);
    // }, []);
    return (
        <View style={styles.container}>
            <CustomHeader HandlerGoBack={() => HandlerGoBack("PackageOfPracticesDetails", paramsData)} />
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ backgroundColor: '#FFF', paddingHorizontal: '3%' }}>
                    <RenderHtml
                        contentWidth={width}
                        source={{
                            html: content,
                        }}
                        tagsStyles={tagsStyles}
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