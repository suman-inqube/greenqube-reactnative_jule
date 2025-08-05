import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
    Image,
    Linking,
    useWindowDimensions,
} from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { noticeDetailsAPI } from '../../../config/apiHere';
import { WebView } from 'react-native-webview';
import {
    useNavigation,
    useIsFocused,
} from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
import FormsTitle from '../../Common/FormsTitle';

const head = `
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    iframe { width: 100%; }
  </style>
`;

const Training = () => {
    const { loginUser_data, CustomHeader, onBackPress, getItem, logoImage, topBanner } = useContext(userCreateContext);
    const { dbname, lan_id, token } = loginUser_data;

    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [noticeDetails, setNoticeDetails] = useState([]);
    const [noticeFiles, setNoticeFiles] = useState([]);
    const { width, height } = useWindowDimensions();

    const detailItem = (path) => {
        Linking.openURL(path);
    };

    const DocumentDisplay = ({ file_ext, item }) => {
        return (
            <View>
                {file_ext === 'application/pdf' && (
                    <Image
                        style={{ width: '100%', height: 100 }}
                        resizeMode="contain"
                        source={require('../../Common/images/icons8-pdf-50.png')}
                    />
                )}
                {file_ext === 'image/jpeg' && (
                    <Image
                        style={{ width: '100%', height: 200 }}
                        source={{ uri: item }}
                    />
                )}
                {file_ext === 'video/mp4' && (
                    <Image
                        resizeMode="contain"
                        style={{ width: '100%', height: 100 }}
                        source={require('../../Common/images/icons8-play-100.png')}
                    />
                )}
            </View>
        );
    };

    const onPageLoad = async () => {
        const noticeId = await getItem('userNoticeId');
        if (noticeId) {
            const response = await noticeDetailsAPI(dbname, lan_id, token, noticeId);
            if (response) {
                setNoticeDetails(response.data.data[0]);
                setNoticeFiles(response.data.data[0].agri_files);
            }
        }
    };

    useEffect(() => {
        if (isFocused) {
            onPageLoad();
            onBackPress(() => {
                navigation.navigate('TraingList');
                return true;
            });
        }
    }, [isFocused]);

    const HandlerGoBack = () => navigation.navigate('TraingList');

    return (
        <View style={{ flex: 1 }}>
            <CustomHeader path="Dashboard" HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
            <FormsTitle title={noticeDetails?.post_name} />

            {/* Horizontal File Viewer */}
            <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: 7 }}>
                <FlatList
                    data={noticeFiles}
                    keyExtractor={(item) => item.file_id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 10 }}
                    renderItem={({ item }) => (
                        <View
                            style={{
                                width: 200,
                                margin: 10,
                                backgroundColor: '#FFF',
                                padding: 10,
                                elevation: 5,
                                borderRadius: 10,
                                justifyContent: 'center'
                            }}
                        >
                            <TouchableOpacity onPress={() => detailItem(item.file_path)}>
                                <DocumentDisplay item={item.file_path} file_ext={item.file_ext} />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>

            {/* WebView Section */}
            <View style={{ flex: 1, paddingHorizontal: 7 }}>
                <WebView
                    style={{ flex: 1 }}
                    originWhitelist={['*']}
                    source={{
                        html: `
              <!DOCTYPE html>
              <html>
                <head>${head}</head>
                <body style="margin:0;padding:10px;font-size:16px;">
                  ${noticeDetails?.post_desc}
                </body>
              </html>
            `,
                    }}
                    allowsFullscreenVideo
                    javaScriptEnabled
                    domStorageEnabled
                    automaticallyAdjustContentInsets={false}
                />
            </View>
        </View>
    );
};

export default Training;

