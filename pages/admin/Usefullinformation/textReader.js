import {
  FlatList,
  TouchableOpacity,
  View,
  Linking,
  Image,
  Alert,
  Text,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import {WebView} from 'react-native-webview';
import {useRoute} from '@react-navigation/native';
import Sound from 'react-native-sound';

import {userCreateContext} from '../../Context/usersCreateContext';
import {Colors} from '../../utils/Constants';
import FormsTitle from '../../Common/FormsTitle';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';

const head = `
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
body { margin: 0; padding: 10px; font-size: 16px; color: #000; }
</style>
`;

const UsefulInformation = () => {
  const {loginUser_data, CustomHeader, logoImage, topBanner} =
    useContext(userCreateContext);

  const {dbname, lan_id, token} = loginUser_data;
  const route = useRoute();

  const [noticeDetails, setNoticeDetails] = useState({});
  const [noticeFiles, setNoticeFiles] = useState([]);

  // ✅ REMOVE HTML
  const stripHtml = html => {
    if (!html) return '';
    return html
      .replace(/<[^>]*>?/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // ✅ DETECT LANGUAGE
  const detectLanguage = text => {
    const bengaliRegex = /[\u0980-\u09FF]/;
    return bengaliRegex.test(text) ? 'bn' : 'en';
  };

  // ✅ CLOUD TTS (🔥 MAIN FUNCTION)
  const speakContent = async () => {
    if (!noticeDetails?.post_desc) {
      Alert.alert('No content');
      return;
    }

    const text = stripHtml(noticeDetails.post_desc);
    const lang = detectLanguage(text);

    try {
      // 🔥 FREE GOOGLE TTS (NO INSTALL NEEDED)
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        text,
      )}&tl=${lang}&client=tw-ob`;

      const sound = new Sound(url, null, error => {
        if (error) {
          console.log('Sound error:', error);
          Alert.alert('Audio failed');
          return;
        }

        sound.play(success => {
          if (!success) {
            console.log('Playback failed');
          }
        });
      });
    } catch (err) {
      console.log(err);
      Alert.alert('Error playing audio');
    }
  };

  const stopAudio = () => {
    Sound.stop();
  };

  // API CALL
  const onPageLoad = async () => {
    const noticeId = route.params;

    const response = await axiosGet(
      ROUTES.GET.NOTICE_DETAILS({noticeId}),
      token,
      {information: `${dbname},${lan_id}`},
    );

    if (response?.status === 200) {
      const notice = response.data.data[0];
      setNoticeDetails(notice);
      setNoticeFiles(notice.agri_files || []);
    }
  };

  useEffect(() => {
    onPageLoad();
  }, []);

  const detailItem = path => {
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

  return (
    <FarmerDrawerScreenWrapper1>
      <View style={{flex: 1, backgroundColor: Colors.background}}>
        <CustomHeader
          path={'UsefulInformationList'}
          logoImage={logoImage}
          topBanner={topBanner}
        />

        <FormsTitle title={noticeDetails?.post_name} />

        {/* FILES */}
        <View style={{marginHorizontal: 7, marginBottom: 10}}>
          <FlatList
            horizontal
            data={noticeFiles}
            keyExtractor={item => item.file_id}
            renderItem={({item}) => (
              <TouchableOpacity
                style={{
                  width: 200,
                  margin: 10,
                  backgroundColor: '#FFF',
                  padding: 10,
                  elevation: 5,
                  borderRadius: 10,
                }}
                onPress={() => detailItem(item.file_path)}>
                <DocumentDisplay
                  item={item.file_path}
                  file_ext={item.file_ext}
                />
              </TouchableOpacity>
            )}
          />
        </View>

        {/* WEBVIEW */}
        <View style={{flex: 1}}>
          <WebView
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
          />
        </View>

        {/* 🔊 AUDIO CONTROL */}
        <View
          style={{
            padding: 12,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderColor: '#ddd',
          }}>
          <TouchableOpacity
            onPress={speakContent}
            style={{
              backgroundColor: '#2E7D32',
              padding: 14,
              borderRadius: 10,
              alignItems: 'center',
            }}>
            <Text style={{color: '#fff', fontSize: 16}}>
              🔊 Listen (Auto Language)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={stopAudio}
            style={{
              marginTop: 8,
              backgroundColor: '#B71C1C',
              padding: 12,
              borderRadius: 10,
              alignItems: 'center',
            }}>
            <Text style={{color: '#fff'}}>⛔ Stop</Text>
          </TouchableOpacity>
        </View>
      </View>
    </FarmerDrawerScreenWrapper1>
  );
};

export default UsefulInformation;
