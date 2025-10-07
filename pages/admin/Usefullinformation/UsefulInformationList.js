import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  Animated,
  Keyboard,
  TextInput,
  Image,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Easing,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import {
  useFocusEffect,
  useNavigation,
  useIsFocused,
} from '@react-navigation/native';
import { usefulInfoListAPI } from '../../../config/apiHere';
import ImageForm from '../../Common/ImageForm';
import { userCreateContext } from '../../Context/usersCreateContext';
import ListItemComponent from '../../Common/ListItemComponent';
import GridItemComponent from '../../Common/GridItemComponent';
import { useCurrentAndPreviousRoute } from '../../Common/useCurrentAndPreviousRoute';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import { Colors } from '../../utils/Constants';
import HeaderWithSearchAndToggle from '../../Components/HeaderWithSearchAndToggle';
const UsefulInformationList = () => {
  const {
    loginUser_data,
    CustomHeader,
    t,
    AlertMesg,
    logoImage,
    topBanner,
    Root,
    Toast,
  } = useContext(userCreateContext);
  const { dbname, lan_id, user_id, agri_user_addresses } = loginUser_data;
  const { currentRoute, previousRoute } = useCurrentAndPreviousRoute();
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const [noticeList, setNoticeList] = useState([]);
  const [isGridView, setIsGridView] = useState(false);
  const [titleSearch, setTitleSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const animationValues = useRef({});

  const getAnimationValue = fid => {
    if (!animationValues.current[fid]) {
      animationValues.current[fid] = new Animated.Value(0);
    }
    return animationValues.current[fid];
  };

  const toggleView = () => {
    setIsGridView(prev => !prev);
  };
  const detailItem = async itemId => {
    navigation.navigate('UsefulInformation', itemId);
  };

  const usefulInfoList = async (
    dbName,
    languageID,
    userID,
    state_id,
    district_id,
    subdiv_id,
  ) => {
    setLoading(true);
    try {
      let response = await usefulInfoListAPI(
        dbName,
        languageID,
        userID,
        state_id,
        district_id,
        subdiv_id,
        'supervisor',
        'general_info',
        titleSearch,
      );
      if (response?.status === 200) {
        if (response.data.data.rows.length !== 0) {
          setNoticeList(response.data.data);
          // setItem('userNoticeList', response.data.data);
          // Reset animation values on new data loaded
        } else {
          setNoticeList([]);
          Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] });
        }
      }
    } catch (error) {
      console.error('API Error:', error);
      Toast.show({
        time: 3,
        text: t('error_fetching_data', 'Error fetching data'),
        type: 'error',
      });
    }
    setLoading(false);
  };

  const onPageLoad = async () => {
    const { agri_state, agri_district, agri_subdivision } =
      agri_user_addresses[0];
    usefulInfoList(
      dbname,
      lan_id,
      user_id,
      agri_state.fid,
      agri_district.fid,
      agri_subdivision.fid,
    );
  };

  useEffect(() => {
    onPageLoad();
  }, []);
  const searchByTitle = async () => {
    Keyboard.dismiss();
    const { agri_state, agri_district, agri_subdivision } =
      agri_user_addresses[0];
    usefulInfoList(
      dbname,
      lan_id,
      user_id,
      agri_state.fid,
      agri_district.fid,
      agri_subdivision.fid,
    );
  };

  const HandlerGoBack = () => {
    setNoticeList([]);
    setTitleSearch('');
    navigation.navigate('Dashboard');
  };

  const renderItem = useCallback(
    ({ item }) =>
      isGridView ? (
        <GridItemComponent
          item={item}
          onPress={detailItem}
          getAnimationValue={getAnimationValue}
          noticeList={noticeList}
        />
      ) : (
        <ListItemComponent
          item={item}
          onPress={detailItem}
          getAnimationValue={getAnimationValue}
          noticeList={noticeList}
        />
      ),
    [isGridView, noticeList, detailItem],
  );

  const keyExtractor = useCallback(item => item.fid.toString(), []);

  return (
    <Root>
      <FarmerDrawerScreenWrapper1>
        <View style={styles.container}>
          <CustomHeader
            path="Dashboard"
            HandlerGoBack={HandlerGoBack}
            logoImage={logoImage}
            topBanner={topBanner}
          />

          {/* Header with Title and Toggle Button */}
          <HeaderWithSearchAndToggle
            titleSearch={titleSearch}
            setTitleSearch={setTitleSearch}
            onSearch={searchByTitle}
            isGridView={isGridView}
            onToggleView={toggleView}
          />

          {/* Search Container */}


          {/* FlatList Container */}
          <View style={styles.flatListContainer}>
            {loading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#156106ff" />
              </View>
            ) : noticeList && noticeList.rows && noticeList.rows.length > 0 ? (
              <FlatList
                key={isGridView ? 'grid' : 'list'} // Force re-render on view change
                data={noticeList.rows}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                numColumns={isGridView ? 2 : 1}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                // columnWrapperStyle={isGridView ? { ...styles.gridRow, gap: 4 } : null}
                removeClippedSubviews={true} // performance optimization
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('no_data_found')}</Text>
              </View>
            )}
          </View>
        </View>
      </FarmerDrawerScreenWrapper1>
    </Root>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background_light,
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  toggleButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  toggleIcon: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: '3%',
    marginLeft: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    // marginTop: 15,
    // marginBottom: 7,
    // elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  textInputContainer: {
    flex: 1,
  },
  textInput: {
    height: 48,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  searchIcon: {
    padding: 8,
  },
  flatListContainer: {
    flex: 1,
  },
  flatListContent: {
    padding: '2.3%',
  },
  separator: {
    height: 12,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  // List Item Styles
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listImageContainer: {
    marginRight: 16,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-Regular',
    // marginBottom: 4,
  },
  listDate: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
  },
  readMoreText: {
    fontSize: 14,
    color: '#18a7d7',
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
  // Grid Item Styles
  gridItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 6,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  gridImageContainer: {
    width: '100%',
    height: 100,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  gridContent: {
    padding: 8,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-Regular',
    // marginBottom: 4,
    // minHeight: 40,
  },
  gridDate: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 40,
  },
});

export default UsefulInformationList;
