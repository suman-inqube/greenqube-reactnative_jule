import { BackHandler, Button, FlatList, StyleSheet, Text, TouchableOpacity, View, ImageBackground, Linking, ScrollView, Image } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import ImageForm from '../../Common/ImageForm';
import InputTextFormWithoutLabel from '../../Common/InputTextFormWithoutLabel';

import { getItem, setItem } from '../../../config/getDataFromStorage';
import { WebView } from 'react-native-webview';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { noticeDetailsAPI } from '../../../config/apiHere';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
// import HTMLView from 'react-native-htmlview';
const UsefulInformation = () => {
    const [noticeDetails, setNoticeDetails] = useState([]);
    const [noticeFiles, setNoticeFiles] = useState([]);
    const { width } = useWindowDimensions();
    const navigation = useNavigation();
    const detailItem = (path, file_ext) => {
        if (file_ext != "video/mp4") {
            Linking.openURL(path);
        }
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
                    props.file_ext == "video/mp4" && <WebView
                        source={{ uri: props.item }}
                        style={{ height: 300 }}
                        javaScriptEnabled={true}
                        mediaPlaybackRequiresUserAction={false}
                    />
                }
            </View>
        );
    }

    const source = {
        html: noticeDetails && `${noticeDetails.post_desc}`
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
                if (response.data.data.length != 0) {
                    setNoticeDetails(response.data.data[0])
                    setNoticeFiles(response.data.data[0].agri_files)
                }
                //  console.log(JSON.stringify(response.data.data, null, 2));
            }
        }
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => { navigation.navigate('UsefulInformationList'); return true; };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );
    const HandlerGoBack = () => {
        navigation.navigate('UsefulInformationList');
    }
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader path={'UsefulInformationList'} HandlerGoBack={HandlerGoBack} />
            <FormsTitle title={noticeDetails && noticeDetails.post_name} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ marginHorizontal: 7 }}>
                    <View style={{ marginHorizontal: 7, alignItems: "center" }}>
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
                                            <View style={{ width: width, marginBottom: 15, backgroundColor: '#FFF', padding: 10, elevation: 5, borderRadius: 10 }}>
                                                <TouchableOpacity onPress={() => detailItem(item.file_path, item.file_ext)}>
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
            </ScrollView>
        </View>
    )

}

export default UsefulInformation

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
        marginHorizontal: '5%',
        fontFamily: 'Poppins-Regular',
    },
    title: {
        color: '#000',
        fontFamily: 'Poppins-Regular'
    },
    textOne: {
        alignItems: 'center',
        width: '100%',
        marginLeft: 25,
        color: '#000',

    },
})
