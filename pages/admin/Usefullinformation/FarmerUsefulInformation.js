import { FlatList, StyleSheet, Text, TouchableOpacity, View, Linking, Image } from 'react-native'
import React, { useState, useCallback, useContext } from 'react'
import { WebView } from 'react-native-webview';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { noticeDetailsAPI } from '../../../config/apiHere';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CustomHeader from '../CustomHeader';
import { ScrollView } from 'react-native-gesture-handler';
import FormsTitle from '../../Common/FormsTitle';
import { userCreateContext } from '../../Context/usersCreateContext';
const head = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
    iframe {
    width:100%;
    }
    </style>
    `;
const FarmerUsefulInformation = () => {
    //GQR-67
    const { loginUser_data, t, getItem, logoImage, topBanner, onBackPress, effective_dates, Root, Toast, AlertMesg, DropdownForm, InputTextForm, ButtonForm } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    //GQR-67
    const [noticeDetails, setNoticeDetails] = useState([]);
    const [noticeFiles, setNoticeFiles] = useState([]);
    const { width, height } = useWindowDimensions();
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
        html: `<div style="color: black">${noticeDetails.post_desc}</div>`
    };
    const onPageLoad = async () => {
        const noticeId = await getItem('userNoticeId');
        if (noticeId) {
            let response = await noticeDetailsAPI(dbname, lan_id, token, noticeId);
            if (response?.status == 200) {
                setNoticeDetails(response?.data?.data[0])
                setNoticeFiles(response?.data?.data[0]?.agri_files)
            }
           
        }
    };
    const handleBackPress = () => { navigation.navigate('FarmerUsefulInformationList'); return true; }
    useFocusEffect(
        useCallback(() => {
            onPageLoad();
            onBackPress(handleBackPress);
        }, [])
    );
    const HandlerGoBack = () => {
        navigation.navigate('FarmerUsefulInformationList');
    }
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader path={'FarmerUsefulInformationList'} HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
            <FormsTitle title={noticeDetails.post_name} />
            <ScrollView nestedScrollEnabled={true} style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', margin: 'auto' }}>
                    <ScrollView horizontal={true} style={{ width: "100%" }}>
                        {
                            noticeFiles ?
                                <FlatList
                                    data={noticeFiles}
                                    keyExtractor={(item) => item.file_id}
                                    renderItem={({ item, index }) => (
                                        <View style={{ width: width, marginBottom: 15, backgroundColor: '#FFF', padding: 10, elevation: 5, borderRadius: 10 }}>
                                            <TouchableOpacity onPress={() => detailItem(item.file_path)}>
                                                <DocumentDisplay
                                                    item={item.file_path}
                                                    file_ext={item.file_ext}
                                                    item2={item.file_name}
                                                    item3={item.term_type}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )} />
                                :
                                ""
                        }
                    </ScrollView>
                </View>
                <View >
                    <WebView
                        style={{
                            height: height / 0.05,
                            // height: height / 1.5,
                            width: width,
                            marginBottom: 50
                        }}
                        source={{
                            html: `
                            <!DOCTYPE html>
                            <html>
                                <head>${head}</head> 
                                <body style="height: :'100%';overflow: "scroll";">
                                ${noticeDetails.post_desc} 
                                </body>
                            </html>`,
                        }}
                        allowsFullscreenVideo={true}
                        automaticallyAdjustContentInsets={false}
                    />
                </View>
            </ScrollView>

        </View>
    )

}

export default FarmerUsefulInformation




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

