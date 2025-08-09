import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import {noticeDetailsAPI} from '../../../config/apiHere';
import {WebView} from 'react-native-webview';
import {getItem} from '../../../config/getDataFromStorage';
import {useNavigation} from '@react-navigation/native';
import CustomHeader from '../CustomHeader';
import {ScrollView} from 'react-native-gesture-handler';
import {userCreateContext} from '../../Context/usersCreateContext';

const head = `
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    iframe { width: 100%; }
  </style>
`;

const FarmerTraining = () => {
  const {
    loginUser_data,
    t,
    FormsTitle,
    getItem,
    logoImage,
    topBanner,
    onBackPress,
    setItem,
    CustomHeader,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token} = loginUser_data;
  const navigation = useNavigation();

  const [noticeDetails, setNoticeDetails] = useState([]);
  const [noticeFiles, setNoticeFiles] = useState([]);

  const {width, height} = Dimensions.get('window');

  const detailItem = path => {
    Linking.openURL(path);
  };

  const DocumentDisplay = props => {
    return (
      <View>
        {props.file_ext === 'application/pdf' && (
          <Image
            style={{width: '100%', height: 100}}
            resizeMode="contain"
            source={require('../../Common/images/icons8-pdf-50.png')}
          />
        )}
        {props.file_ext === 'image/jpeg'|| props.file_ext == "image/png" ?(
          <Image
            style={{width: '100%', height: 200}}
            source={{uri: props.item}}
          />
        ):null}
        {props.file_ext === 'video/mp4' && (
          <Image
            resizeMode="contain"
            style={{width: '100%', height: 100}}
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
      if (response?.status === 200) {
        setNoticeDetails(response?.data?.data[0]);
        setNoticeFiles(response?.data?.data[0]?.agri_files || []);
      }
    }
  };

  const handleBackPress = () => {
    navigation.navigate('FarmerTrainingList');
    return true;
  };

  useEffect(() => {
    onPageLoad();
    onBackPress(handleBackPress);
  }, []);

  const HandlerGoBack = () => navigation.navigate('FarmerTrainingList');

  return (
    <View style={{flex: 1}}>
      <CustomHeader
        HandlerGoBack={HandlerGoBack}
        logoImage={logoImage}
        topBanner={topBanner}
      />
      <FormsTitle title={noticeDetails.post_name} />

      {/* Horizontal scroll file list */}
      <View style={{width: '100%', alignItems: 'center'}}>
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
                  width: 200,
                  margin: 10,
                  backgroundColor: '#FFF',
                  padding: 10,
                  elevation: 5,
                  borderRadius: 10,
                  justifyContent: 'center',
                }}
                onPress={() => detailItem(item.file_path)}>
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
              <body style="margin:0;padding:10px;">
                ${noticeDetails.post_desc}
              </body>
            </html>
          `,
        }}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        automaticallyAdjustContentInsets={false}
        startInLoadingState={true}
      />
    </View>
  );
};

export default FarmerTraining;
