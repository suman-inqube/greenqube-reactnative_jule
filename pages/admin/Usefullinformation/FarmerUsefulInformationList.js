import {
  Keyboard,
  TextInput,
  Image,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ActivityIndicator,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from 'react';
import {cropListApi} from '../../../config/apiHere';
import {farmerUsefulInfoListAPI} from '../../../config/apiHere';
import moment from 'moment';
// import { useNavigation } from '@react-navigation/native';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import ImageForm from '../../Common/ImageForm';
import ListItemComponent from '../../Common/ListItemComponent';
import GridItemComponent from '../../Common/GridItemComponent';
import {useCurrentAndPreviousRoute} from '../../Common/useCurrentAndPreviousRoute';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
const FarmerUsefulInformationList = () => {
  //GQR-67
  const {
    loginUser_data,
    t,
    FormsTitle,
    getItem,
    logoImage,
    Root,
    topBanner,
    onBackPress,
    setItem,
    CustomHeader,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id, agri_user_addresses} = loginUser_data;
  //GQR-67
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const {currentRoute, previousRoute} = useCurrentAndPreviousRoute();
  const [noticeList, setNoticeList] = useState([]);
  const [isGridView, setIsGridView] = useState(true);
  const [loading, setLoading] = useState(false);
  const numColumns = isGridView ? 1 : 2;
  const [titleSearch, setTitleSearch] = useState('');
  const animationValues = useRef({}).current;
  const getAnimationValue = id => {
    if (!animationValues[id]) {
      animationValues[id] = new Animated.Value(0);
    }
    return animationValues[id];
  };
  const toggleView = () => {
    setIsGridView(!isGridView);
  };
  const detailItem = async itemId => {
    navigation.navigate('FarmerUsefulInformation', itemId);
  };

  const renderItem = useCallback(
    ({item}) =>
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

  const usefulInfoList = async (
    dbName,
    languageID,
    userID,
    state_id,
    district_id,
    subdiv_id,
    newCropId,
  ) => {
    setLoading(true);
    let response = await farmerUsefulInfoListAPI(
      dbName,
      languageID,
      userID,
      state_id,
      district_id,
      subdiv_id,
      newCropId,
      'farmer',
      'general_info',
      titleSearch,
    );

    if (response?.status == 200) {
      setNoticeList(response?.data?.data);
      setItem('userNoticeList', response?.data?.data);
    }
    setLoading(false);
  };
  const onPageLoad = async () => {
    const response = await cropListApi(dbname, lan_id, user_id);
    if (response?.status == 200) {
      let cropId = '';
      const datam = response?.data?.data?.rows;
      datam.map(async item => {
        cropId = cropId + item.crop_name_id + ',';
      });
      const newCropId = cropId.substring(0, cropId.length - 1);
      usefulInfoList(
        dbname,
        lan_id,
        user_id,
        agri_user_addresses[0].agri_state.fid,
        agri_user_addresses[0].agri_district.fid,
        agri_user_addresses[0].agri_subdivision.fid,
        newCropId,
      );
    }
  };
  useEffect(() => {
    onPageLoad();
  }, []);

  const HandlerGoBack = () => {
    setNoticeList([]);
    setTitleSearch('');
    navigation.navigate('FarmerDashboard');
  };
  const searchByTitle = async () => {
    Keyboard.dismiss();
    usefulInfoList(
      dbname,
      lan_id,
      user_id,
      agri_user_addresses[0].agri_state.fid,
      agri_user_addresses[0].agri_district.fid,
      agri_user_addresses[0].agri_subdivision.fid,
      '',
    );
  };
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        <View style={styles.container}>
          <CustomHeader
            path="Dashboard"
            HandlerGoBack={HandlerGoBack}
            logoImage={logoImage}
            topBanner={topBanner}
          />

          {/* Header with Title and Toggle Button */}

          {/* <View style={styles.titleContainer}>
              <FormsTitle title={t('dash_useful_information')} />
            </View> */}
          {/* <TouchableOpacity onPress={toggleView} style={styles.toggleButton}>
              {isGridView ? (
                <Image
                  source={require('../../Common/images/view_list.png')}
                  style={styles.toggleIcon}
                />
              ) : (
                <Image
                  source={require('../../Common/images/view_grid.png')}
                  style={styles.toggleIcon}
                />
              )}
            </TouchableOpacity> */}

          {/* Search Container */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              alignSelf: 'center',
            }}>
            <View style={styles.searchContainer}>
              <View style={styles.textInputContainer}>
                <TextInput
                  placeholder={'Search...'}
                  placeholderTextColor={'#999'}
                  style={styles.textInput}
                  value={titleSearch}
                  onChangeText={setTitleSearch}
                  onSubmitEditing={searchByTitle}
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity
                onPress={searchByTitle}
                style={styles.searchIcon}>
                <ImageForm
                  source={require('../../Common/images/search.png')}
                  resizeMode="cover"
                  height={24}
                  width={24}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                onPress={toggleView}
                style={styles.toggleButton}>
                {isGridView ? (
                  <Image
                    source={require('../../Common/images/view_list.png')}
                    style={styles.toggleIcon}
                  />
                ) : (
                  <Image
                    source={require('../../Common/images/view_grid.png')}
                    style={styles.toggleIcon}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
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
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    // paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginRight: 10,
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginTop: 5,
  },
  toggleIcon: {
    width: 22,
    height: 22,
    tintColor: '#333',
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: '3%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 15,
    marginBottom: 7,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    // padding: 8,
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
    shadowOffset: {width: 0, height: 2},
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
    shadowOffset: {width: 0, height: 2},
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
export default FarmerUsefulInformationList;
