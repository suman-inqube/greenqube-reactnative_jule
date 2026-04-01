import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Image,
  Linking,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import {useRoute} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import FormsTitle from '../../Common/FormsTitle';
import YoutubePlayer from 'react-native-youtube-iframe';
import {noticeDetailsAPI} from '../../../config/apiHere';

const FarmerTraining = () => {
  const {loginUser_data, logoImage, topBanner, CustomHeader} =
    useContext(userCreateContext);

  const {dbname, lan_id, token} = loginUser_data;
  const route = useRoute();

  const [noticeDetails, setNoticeDetails] = useState({});
  const [noticeFiles, setNoticeFiles] = useState([]);

  // 🔍 Extract YouTube ID
  const getVideoId = html => {
    if (!html) return null;

    let match = html.match(/embed\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];

    match = html.match(/v=([a-zA-Z0-9_-]+)/);
    if (match) return match[1];

    return null;
  };

  // 📝 Strip HTML
  const stripHtml = html => html?.replace(/<[^>]*>?/gm, '') || '';

  const detailItem = path => {
    Linking.openURL(path);
  };

  const DocumentDisplay = ({item, file_ext}) => {
    if (file_ext === 'application/pdf') {
      return (
        <Image
          style={styles.icon}
          resizeMode="contain"
          source={require('../../Common/images/icons8-pdf-50.png')}
        />
      );
    }

    if (file_ext?.includes('image')) {
      return <Image style={styles.image} source={{uri: item}} />;
    }

    if (file_ext === 'video/mp4') {
      return (
        <Image
          resizeMode="contain"
          style={styles.icon}
          source={require('../../Common/images/icons8-play-100.png')}
        />
      );
    }

    return null;
  };

  const onPageLoad = async () => {
    try {
      const noticeId = route.params;

      if (noticeId) {
        const response = await noticeDetailsAPI(
          dbname,
          lan_id,
          token,
          noticeId,
        );

        if (response?.status === 200) {
          const data = response.data.data[0];
          setNoticeDetails(data);
          setNoticeFiles(data.agri_files || []);
        }
      }
    } catch (err) {
      console.log('API Error', err);
    }
  };

  useEffect(() => {
    onPageLoad();
  }, []);

  const videoId = getVideoId(noticeDetails?.post_desc);
  const textContent = stripHtml(noticeDetails?.post_desc);

  return (
    <FarmerDrawerScreenWrapper1>
      <View style={styles.container}>
        <CustomHeader logoImage={logoImage} topBanner={topBanner} />

        <FormsTitle title={noticeDetails?.post_name} />

        {/* 📂 Files */}
        <FlatList
          data={noticeFiles}
          keyExtractor={item => item.file_id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingVertical: 10}}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => detailItem(item.file_path)}>
              <DocumentDisplay item={item.file_path} file_ext={item.file_ext} />
            </TouchableOpacity>
          )}
        />

        {/* 🎥 Video or 📝 Text */}
        <View style={styles.content}>
          {videoId ? (
            <YoutubePlayer height={220} play={false} videoId={videoId} />
          ) : (
            <Text style={styles.text}>{textContent}</Text>
          )}
        </View>
      </View>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerTraining;

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  card: {
    width: 220,
    marginHorizontal: 8,
    marginBottom: 15,
    backgroundColor: '#eaecedff',
    padding: 10,
    elevation: 3,
    borderRadius: 10,
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  icon: {
    width: '100%',
    height: 100,
  },
  content: {
    padding: 10,
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
};
