import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Image,
  Dimensions,
} from 'react-native';
import React, {useState, useCallback, useContext, useEffect} from 'react';
import {WebView} from 'react-native-webview';
import {noticeDetailsAPI} from '../../../config/apiHere';
import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import {userCreateContext} from '../../Context/usersCreateContext';
import {ScrollView} from 'react-native-gesture-handler';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';

const head = `
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    iframe { width: 100%; }
    body { font-family: sans-serif; padding: 10px; margin: 0; }
  </style>
`;

const FarmerUsefulInformation = () => {
  const {loginUser_data, getItem, logoImage, topBanner, onBackPress} =
    useContext(userCreateContext);
  const route = useRoute();
  const {dbname, lan_id, token} = loginUser_data;
  const navigation = useNavigation();
  const [noticeDetails, setNoticeDetails] = useState([]);
  const [noticeFiles, setNoticeFiles] = useState([]);
  const {width, height} = Dimensions.get('window');

  const detailItem = (path, file_ext) => {
    Linking.openURL(path);
  };

  const DocumentDisplay = props => {
    return (
      <View style={{backgroundColor: 'white'}}>
        {props.file_ext === 'application/pdf' && (
          <Image
            style={{width: '100%', height: 100}}
            resizeMode="contain"
            source={require('../../Common/images/icons8-pdf-50.png')}
          />
        )}
        {props.file_ext === 'image/jpeg' || props.file_ext == 'image/png' ? (
          <Image
            style={{width: '100%', height: 200}}
            source={{uri: props.item}}
          />
        ) : null}
        {props.file_ext === 'video/mp4' && (
          <WebView
            source={{uri: props.item}}
            style={{height: 300}}
            javaScriptEnabled
            mediaPlaybackRequiresUserAction={false}
          />
        )}
      </View>
    );
  };

  const onPageLoad = async () => {
    const noticeId = route.params;
    if (noticeId) {
      const response = await noticeDetailsAPI(dbname, lan_id, token, noticeId);
      if (response?.status === 200) {
        setNoticeDetails(response?.data?.data[0]);
        setNoticeFiles(response?.data?.data[0]?.agri_files || []);
      }
    }
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  const HandlerGoBack = () => {
    navigation.navigate('FarmerUsefulInformationList');
  };

  return (
    <FarmerDrawerScreenWrapper1>
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <CustomHeader
          path="FarmerUsefulInformationList"
          HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />

        <FormsTitle title={noticeDetails.post_name} />

        {/* Attachments (Horizontal scroll) */}
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            marginTop: 10,
          }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{width: '100%'}}>
            <FlatList
              data={noticeFiles}
              keyExtractor={item => item.file_id}
              horizontal
              renderItem={({item}) => (
                <TouchableOpacity
                  style={{
                    width: 220,
                    marginHorizontal: 8,
                    marginBottom: 15,
                    backgroundColor: '#eaecedff',
                    padding: 10,
                    elevation: 3,
                    borderRadius: 10,
                    justifyContent: 'center',
                  }}
                  onPress={() => detailItem(item.file_path, item.file_ext)}>
                  <TouchableOpacity>
                    <DocumentDisplay
                      item={item.file_path}
                      file_ext={item.file_ext}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </ScrollView>
        </View>

        {/* WebView content */}
        <WebView
          style={{flex: 1, marginBottom: 10}}
          originWhitelist={['*']}
          source={{
            html: `
            <!DOCTYPE html>
            <html>
              <head>${head}</head> 
              <body>${noticeDetails.post_desc || ''}</body>
            </html>
          `,
          }}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
          startInLoadingState
          automaticallyAdjustContentInsets={false}
        />
      </View>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerUsefulInformation;
