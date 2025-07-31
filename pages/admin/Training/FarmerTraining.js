import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ImageBackground,
  Linking,
  BackHandler,
} from 'react-native';
import React, {useState, useEffect, useCallback, useContext} from 'react';
import {noticeDetailsAPI} from '../../../config/apiHere';

import {WebView} from 'react-native-webview';
import RenderHtml from 'react-native-render-html';
import {useWindowDimensions} from 'react-native';
import {getItem} from '../../../config/getDataFromStorage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import CustomHeader from '../CustomHeader';
import {ScrollView} from 'react-native-gesture-handler';
// import HTMLView from 'react-native-htmlview';
import {userCreateContext} from '../../Context/usersCreateContext';
const head = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
    iframe {
    width:100%;
    }
    </style>
    `;
const FarmerTraining = () => {
  //GQR-67
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
  const {dbname, lan_id, token, user_id, agri_user_addresses} = loginUser_data;
  //GQR-67
  const navigation = useNavigation();
  const [noticeDetails, setNoticeDetails] = useState([]);
  const [noticeFiles, setNoticeFiles] = useState([]);
  const {width, height} = useWindowDimensions();
  const detailItem = path => {
    Linking.openURL(path);
  };
  const DocumentDisplay = props => {
    return (
      <View>
        {props.file_ext == 'application/pdf' && (
          <Image
            style={{width: '100%', height: 100}}
            resizeMode="contain"
            source={require('../../Common/images/icons8-pdf-50.png')}
          />
        )}
        {props.file_ext == 'image/jpeg' && (
          <Image
            // resizeMode="contain"
            style={{width: '100%', height: 200}}
            source={{uri: props.item}}
          />
        )}
        {props.file_ext == 'video/mp4' && (
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
      let response = await noticeDetailsAPI(dbname, lan_id, token, noticeId);
      if (response?.status == 200) {
        setNoticeDetails(response?.data?.data[0]);
        setNoticeFiles(response?.data?.data[0]?.agri_files);
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
      <ScrollView>
        <View
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            margin: 'auto',
          }}>
          <ScrollView horizontal={true} style={{width: '100%'}}>
            {noticeFiles ? (
              <FlatList
                data={noticeFiles}
                keyExtractor={item => item.file_id}
                renderItem={({item, index}) => (
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
                      onPress={() => detailItem(item.file_path)}>
                      <DocumentDisplay
                        item={item.file_path}
                        file_ext={item.file_ext}
                        item2={item.file_name}
                        item3={item.term_type}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
            ) : (
              ''
            )}
          </ScrollView>
        </View>
        <View>
          <WebView
            style={{
              height: height / 0.05,
              // height: height / 1.5,
              width: width,
              marginBottom: 50,
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
  );
};
export default FarmerTraining;
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  box1: {
    // marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    backgroundColor: 'white',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: {width: 0, height: 2},
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
  boxMenu: {
    // marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: 'white',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },

  titleContainer: {
    alignItems: 'flex-end',
    paddingVertical: 10,
    marginRight: 10,
  },
  textOne: {
    alignItems: 'center',
    width: '100%',
    marginLeft: 25,
  },
});
