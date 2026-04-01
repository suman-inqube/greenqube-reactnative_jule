import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Linking,
  Text,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import FormsTitle from '../../Common/FormsTitle';
import {Colors} from '../../utils/Constants';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
import YoutubePlayer from 'react-native-youtube-iframe';

const Training = () => {
  const {loginUser_data, CustomHeader, logoImage, topBanner} =
    useContext(userCreateContext);

  const {dbname, lan_id, token} = loginUser_data;
  const route = useRoute();
  const navigation = useNavigation();

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

  // 📝 Remove HTML tags
  const stripHtml = html => {
    return html?.replace(/<[^>]*>?/gm, '') || '';
  };

    return html.replace(
      /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g,
      'https://www.youtube.com/embed/$1',
    );
  };
  const detailItem = path => {
    Linking.openURL(path);
  };

  const DocumentDisplay = ({file_ext, item}) => {
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
  const getVideoId = html => {
    const match = html?.match(/embed\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };
  const onPageLoad = async () => {
    const noticeId = route.params;

    const response = await axiosGet(
      ROUTES.GET.NOTICE_DETAILS({noticeId}),
      token,
      {information: `${dbname},${lan_id}`},
    );

    if (response) {
      const data = response.data.data[0];
      setNoticeDetails(data);
      setNoticeFiles(data.agri_files || []);
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
        <CustomHeader
          path="Dashboard"
          logoImage={logoImage}
          topBanner={topBanner}
        />

        <FormsTitle title={noticeDetails?.post_name} />

        <View style={styles.content}>
          {videoId ? (
            <YoutubePlayer height={250} play={false} videoId={videoId} />
          ) : (
            <Text style={styles.text}>{textContent}</Text>
          )}
        </View>

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
      </View>
    </FarmerDrawerScreenWrapper1>
  );
};

export default Training;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    width: 200,
    margin: 10,
    backgroundColor: '#FFF',
    padding: 10,
    elevation: 5,
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
});
