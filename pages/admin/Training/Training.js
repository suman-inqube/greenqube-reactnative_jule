import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Linking,
  useWindowDimensions,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import {noticeDetailsAPI} from '../../../config/apiHere';
import {WebView} from 'react-native-webview';
import {useNavigation, useIsFocused, useRoute} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import FormsTitle from '../../Common/FormsTitle';
import {Colors} from '../../utils/Constants';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
import YoutubePlayer from 'react-native-youtube-iframe';

const head = `
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin:0; padding:0; }
    iframe {
      width: 100%;
      height: 220px;
      border: none;
    }
  </style>
`;

const Training = () => {
  const {
    loginUser_data,
    CustomHeader,
    onBackPress,
    getItem,
    logoImage,
    topBanner,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token} = loginUser_data;

  const isFocused = useIsFocused();
  const route = useRoute();
  const navigation = useNavigation();
  const [noticeDetails, setNoticeDetails] = useState([]);
  const [noticeFiles, setNoticeFiles] = useState([]);
  const {width, height} = useWindowDimensions();
  const formatYouTubeEmbed = html => {
    if (!html) return '';

    return html.replace(
      /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g,
      'https://www.youtube.com/embed/$1',
    );
  };
  const detailItem = path => {
    Linking.openURL(path);
  };

  const DocumentDisplay = ({file_ext, item}) => {
    return (
      <View>
        {file_ext === 'application/pdf' && (
          <Image
            style={{width: '100%', height: 100}}
            resizeMode="contain"
            source={require('../../Common/images/icons8-pdf-50.png')}
          />
        )}
        {file_ext === 'image/jpeg' || file_ext == 'image/png' ? (
          <Image style={{width: '100%', height: 200}} source={{uri: item}} />
        ) : null}
        {file_ext === 'video/mp4' && (
          <Image
            resizeMode="contain"
            style={{width: '100%', height: 100}}
            source={require('../../Common/images/icons8-play-100.png')}
          />
        )}
      </View>
    );
  };
  const getVideoId = html => {
    const match = html?.match(/embed\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };
  const onPageLoad = async () => {
    const noticeId = route.params;
    if (noticeId) {
      const response = await axiosGet(
        ROUTES.GET.NOTICE_DETAILS({
          noticeId: noticeId,
        }),
        token,
        {information: `${dbname},${lan_id}`},
      );
      // noticeDetailsAPI(dbname, lan_id, token, noticeId);
      console.log('response11', response);
      if (response) {
        setNoticeDetails(response.data.data[0]);
        setNoticeFiles(response.data.data[0].agri_files);
      }
    }
  };

  useEffect(() => {
    onPageLoad();
  }, []);

  const HandlerGoBack = () => navigation.navigate('TraingList');
  const videoId = getVideoId(noticeDetails?.post_desc);
  return (
    <FarmerDrawerScreenWrapper1>
      <View style={{flex: 1, backgroundColor: Colors.background}}>
        <CustomHeader
          path="Dashboard"
          // HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />
        <FormsTitle title={noticeDetails?.post_name} />
        {/* Horizontal File Viewer */}
        <View
          style={{width: '100%', alignItems: 'center', paddingHorizontal: 7}}>
          <FlatList
            data={noticeFiles}
            keyExtractor={item => item.file_id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingVertical: 10}}
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
                onPress={() => detailItem(item.file_path)}>
                <TouchableOpacity onPress={() => detailItem(item.file_path)}>
                  <DocumentDisplay
                    item={item.file_path}
                    file_ext={item.file_ext}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* WebView Section */}
        <View style={{flex: 1, paddingHorizontal: 7}}>
          {videoId && (
            <YoutubePlayer height={220} play={false} videoId={videoId} />
          )}
          {/* <WebView
            style={{flex: 1}}
            originWhitelist={['*']}
            source={{
              html: `
              <!DOCTYPE html>
              <html>
                <head>${head}</head>
               <body>
  ${formatYouTubeEmbed(noticeDetails?.post_desc)}
</body>
              </html>
            `,
            }}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
            automaticallyAdjustContentInsets={false}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            mixedContentMode="always"
          /> */}
        </View>
      </View>
    </FarmerDrawerScreenWrapper1>
  );
};

export default Training;
