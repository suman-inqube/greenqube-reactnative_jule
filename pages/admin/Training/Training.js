import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image, ImageBackground, Linking, BackHandler } from 'react-native'
import React, { useState, useEffect } from 'react'
import { noticeDetailsAPI } from '../../../config/apiHere';

import { WebView } from 'react-native-webview';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { getItem } from '../../../config/getDataFromStorage';
import CustomHeader from '../CustomHeader';
import { useNavigation, useRoute, useIsFocused, StackActions } from '@react-navigation/native';
const Training = () => {
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [noticeDetails, setNoticeDetails] = useState([]);
    const [noticeFiles, setNoticeFiles] = useState([]);
    const { width } = useWindowDimensions();
    const detailItem = (path) => {
        Linking.openURL(path)
    }
    const DocumentDisplay = (props) => {
        return (
            <View >
                {props.file_ext == "application/pdf" &&
                    <Image
                        style={{ width: '100%', height: 100 }}
                        resizeMode="contain"
                        source={require("../../Common/images/icons8-pdf-50.png")}
                    />
                }
                {
                    props.file_ext == "image/jpeg" && <Image
                        // resizeMode="contain"
                        style={{ width: '100%', height: 200 }}
                        source={{ uri: props.item }}
                    />
                }
                {
                    props.file_ext == "video/mp4" && <Image
                        resizeMode="contain"
                        style={{ width: '100%', height: 100 }}
                        source={require("../../Common/images/icons8-play-100.png")}
                    />
                }
            </View>
        );
    }
    const source = {
        html: `<div style="color: black">${noticeDetails.post_desc}</div>`
    };
    const onPageLoad = async () => {
        const noticeId = await getItem('userNoticeId');
        const loginUser_data = await getItem('loginUser_data');
        if (noticeId) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            let response = await noticeDetailsAPI(dbName, languageID, token, noticeId);
            if (response) {
                setNoticeDetails(response.data.data[0])
                setNoticeFiles(response.data.data[0].agri_files)
            }
        }
    };
    useEffect(() => {
        if (isFocused) {
            onPageLoad();
            const onBackPress = () => { navigation.navigate('TraingList'); return true; };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
    }, [isFocused]);
    const HandlerGoBack = () => {
        navigation.navigate('TraingList')
    }
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader path='Dashboard' HandlerGoBack={HandlerGoBack} />
            <View style={{ marginHorizontal: 7, marginTop: 20, }}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, {
                        paddingBottom: 8, paddingTop: 4, fontWeight: '700', fontWeight: 'bold', color: "black",
                        fontFamily: "Arial", fontSize: 18
                    }]}>
                        {noticeDetails.post_name}
                    </Text>
                </View>
                <View style={{ marginHorizontal: '5%', }}>
                    <RenderHtml
                        contentWidth={width}
                        source={source}
                    />
                </View>
                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', margin: 'auto' }}>
                    {
                        noticeFiles ?
                            <FlatList
                                data={noticeFiles}
                                keyExtractor={(item) => item.file_id}
                                renderItem={({ item, index }) => {
                                    return (
                                        <View style={{ width: 200, marginBottom: 15, backgroundColor: '#FFF', padding: 10, elevation: 5, borderRadius: 10 }}>
                                            <TouchableOpacity onPress={() => detailItem(item.file_path)}>
                                                <DocumentDisplay
                                                    item={item.file_path}
                                                    file_ext={item.file_ext}
                                                    item2={item.file_name}
                                                    item3={item.term_type}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }} />
                            :
                            ""
                    }
                </View>
            </View>
        </View>
    )
}

export default Training

const styles = StyleSheet.create({
    header:
    {
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: 'center'
    },
    box1:
    {
        // marginBottom: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        height: 70,
        backgroundColor: 'white',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },

    box1_1: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
    },
    boxMenu:
    {
        // marginBottom: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        backgroundColor: 'white',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },

    titleContainer: {
        alignItems: 'flex-end',
        paddingVertical: 10,
    },
    textOne: {
        alignItems: 'center',
        width: '100%',
        marginLeft: 25,


    }
})
