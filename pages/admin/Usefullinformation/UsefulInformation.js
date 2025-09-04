import {
  FlatList,
  TouchableOpacity,
  View,
  Linking,
  Image,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect, useCallback, useContext} from 'react';
import {WebView} from 'react-native-webview';
import {noticeDetailsAPI} from '../../../config/apiHere';
import {useRoute} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import {Colors} from '../../utils/Constants';
import FormsTitle from '../../Common/FormsTitle';

const head = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      iframe { width:100%; }
      body { margin: 0; padding: 10px; font-size: 16px; color: #000; }
    </style>
`;

const UsefulInformation = () => {
  const {loginUser_data, CustomHeader, getItem, logoImage, topBanner} =
    useContext(userCreateContext);
  const {dbname, lan_id, token} = loginUser_data;
  const route = useRoute();
  const [noticeDetails, setNoticeDetails] = useState([]);
  const [noticeFiles, setNoticeFiles] = useState([]);
  const detailItem = (path, file_ext) => {
    Linking.openURL(path);
  };

  const DocumentDisplay = ({item, file_ext}) => {
    if (file_ext === 'application/pdf') {
      return (
        <Image
          style={{width: '100%', height: 100}}
          resizeMode="contain"
          source={require('../../Common/images/icons8-pdf-50.png')}
        />
      );
    } else if (file_ext === 'image/jpeg' || file_ext == 'image/png') {
      return (
        <Image style={{width: '100%', height: 200}} source={{uri: item}} />
      );
    } else if (file_ext === 'video/mp4') {
      return (
        <Image
          resizeMode="contain"
          style={{width: '100%', height: 100}}
          source={require('../../Common/images/icons8-play-100.png')}
        />
      );
    }
    return null;
  };

  const onPageLoad = async () => {
    const noticeId = route.params;
    if (noticeId) {
      const response = await noticeDetailsAPI(dbname, lan_id, token, noticeId);
      if (response?.status === 200 && response.data.data.length > 0) {
        const notice = response.data.data[0];
        setNoticeDetails(notice);
        setNoticeFiles(notice.agri_files || []);
      }
    }
  };

  useEffect(() => {
    onPageLoad();
  }, []);
  return (
    <View style={{flex: 1, backgroundColor: Colors.background}}>
      <CustomHeader
        path={'UsefulInformationList'}
        logoImage={logoImage}
        topBanner={topBanner}
      />
      <FormsTitle title={noticeDetails && noticeDetails.post_name} />

      {/* Horizontal Scroll for Attachments */}
      <View style={{marginHorizontal: 7, marginBottom: 10}}>
        <FlatList
          horizontal
          data={noticeFiles}
          keyExtractor={item => item.file_id}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => (
            <TouchableOpacity
              style={{
                width: 200,
                margin: 10,
                backgroundColor: '#FFF',
                padding: 10,
                elevation: 5,
                borderRadius: 10,
                justifyContent: 'center',
              }}
              onPress={() => detailItem(item.file_path, item.file_ext)}>
              <TouchableOpacity
                onPress={() => detailItem(item.file_path, item.file_ext)}>
                <DocumentDisplay
                  item={item.file_path}
                  file_ext={item.file_ext}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* WebView Content */}
      <View style={{flex: 1}}>
        <WebView
          style={{flex: 1}}
          originWhitelist={['*']}
          source={{
            html: `
              <!DOCTYPE html>
              <html>
                <head>${head}</head>
                <body>
                  ${noticeDetails.post_desc || ''}
                </body>
              </html>
            `,
          }}
          automaticallyAdjustContentInsets={false}
          allowsFullscreenVideo={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
      </View>
    </View>
  );
};

export default UsefulInformation;
