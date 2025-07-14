import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image, Linking, ScrollView, useWindowDimensions } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import {noticeDetailsAPI, getDycryptedImage} from '../../../config/apiHere';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, useIsFocused, StackActions } from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
import FormsTitle from '../../Common/FormsTitle';
const head = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
    iframe {
    width:100%;
    }
    </style>
    `;
const Training = () => {
    //GQR-67
    const { loginUser_data, CustomHeader, onBackPress, getItem, logoImage, topBanner } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    //GQR-67
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [noticeDetails, setNoticeDetails] = useState([]);
    const [noticeFiles, setNoticeFiles] = useState([]);
    const { width, height } = useWindowDimensions();
    const detailItem = (path) => {
        Linking.openURL(path)
    }
    const DocumentDisplay = (props) => {
        return (
            <View >
                {props.file_ext == "application/pdf" &&
                    <Image
                        style={{ width: '100%', height: 100 }}
                        resizeMode="contain" source={require("../../Common/images/icons8-pdf-50.png")}
                    />
                }
                {
                    props.file_ext == "image/jpeg" && <Image
                        // resizeMode="contain"
                        style={{ width: '100%', height: 200 }} source={{ uri: props.item }}
                    />
                }
                {
                    props.file_ext == "video/mp4" && <Image
                        resizeMode="contain"
                        style={{ width: '100%', height: 100 }} source={require("../../Common/images/icons8-play-100.png")}
                    />
                }
            </View>
        );
    }
    const onPageLoad = async () => {
        const noticeId = await getItem('userNoticeId');
        if (noticeId) {
            let response = await noticeDetailsAPI(dbname, lan_id, token, noticeId);
            if (response) {
                setNoticeDetails(response.data.data[0])
                // setNoticeFiles(response.data.data[0].agri_files)
                if (response.data.data[0].agri_files != undefined && response.data.data[0].agri_files!=null) {
                
                
                              const decryptedFiles = Promise.all(
                               response.data.data[0].agri_files.map(file => ({
                                  ...file,
                                  decrypted_path: getDycryptedImage(
                                    file?.file_path?.content,
                                    file?.file_path?.iv,
                                  ),
                                })),
                              );
                              return {
                                ... response.data.data[0],
                                agri_files: decryptedFiles,
                              };
                         
                        }
                         setNoticeFiles(response.data.data[0].agri_files);
            }
        }
    };
    useEffect(() => {
        if (isFocused) {
            onPageLoad();
            onBackPress(() => { navigation.navigate('TraingList'); return true; });
        }
    }, [isFocused]);
    const HandlerGoBack = () => navigation.navigate('TraingList');
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader path='Dashboard' HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
            <FormsTitle title={noticeDetails && noticeDetails.post_name} />
            <ScrollView nestedScrollEnabled={true} style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', margin: 'auto' }}>
                    <ScrollView horizontal={true} style={{ width: "100%" }}>
                        {
                            noticeFiles ?
                                <FlatList
                                    data={noticeFiles}
                                    keyExtractor={(item) => item.file_id}
                                    renderItem={({ item, index }) => {
                                        return (
                                          <View
                                            style={{
                                              width: 200,
                                              marginBottom: 15,
                                              backgroundColor: '#FFF',
                                              padding: 10,
                                              elevation: 5,
                                              borderRadius: 10,
                                            }}>
                                            <TouchableOpacity
                                              onPress={() =>
                                                detailItem(item.decryptedFiles)
                                              }>
                                              <DocumentDisplay
                                                item={item.decryptedFiles}
                                                file_ext={item.file_ext}
                                                item2={item.file_name}
                                                item3={item.term_type}
                                              />
                                            </TouchableOpacity>
                                          </View>
                                        );
                                    }} />
                                :
                                ""
                        }
                    </ScrollView>
                </View>
                <View style={{ marginHorizontal: 7 }}>
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
                                ${noticeDetails?.post_desc}
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
