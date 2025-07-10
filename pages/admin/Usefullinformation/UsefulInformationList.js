import {
  Keyboard,TextInput,
  Image,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState, useEffect, useCallback, useContext} from 'react';
import {usefulInfoListAPI} from '../../../config/apiHere';
import ImageForm from '../../Common/ImageForm';
import moment from 'moment';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  useIsFocused,
  StackActions,
} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
const UsefulInformationList = () => {
  //GQR-67
  const {
    loginUser_data,
    CustomHeader,
    t,
    AlertMesg,
    onBackPress,
    setItem,
    logoImage,
    topBanner,
    Root,
    Toast,
    FormsTitle,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id, agri_user_addresses} = loginUser_data;
  //GQR-67
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [noticeList, setNoticeList] = useState([]);
  const [isGridView, setIsGridView] = useState(true);
  const numColumns = isGridView ? 1 : 2;
  const [titleSearch, setTitleSearch] = useState('');

  const toggleView = () => {
    setIsGridView(!isGridView);
  };
  const detailItem = async itemId => {
    await setItem('userNoticeId', itemId);
    navigation.navigate('UsefulInformation', {
      pagename: 'UsefulInformation',
      noticeId: itemId,
    });
  };
  function UserBoxDisplay({item, item2, item3, item4}) {
    return (
      <View style={styles.box1}>
        <View style={styles.box1_1}>
          <View style={{width: '70%'}}>
            <Text style={styles.textOne}>{item}</Text>
            <Text>{item2}</Text>
          </View>
          <View style={{width: '30%'}}>
            <Text style={styles.readMore}>{item4}</Text>
          </View>
        </View>
      </View>
    );
  }
  const usefulInfoList = async (
    dbName,
    languageID,
    userID,
    state_id,
    district_id,
    subdiv_id,
  ) => {
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
    if (response?.status == 200) {
      if (response.data.data.rows != 0) {
        console.log(JSON.stringify(response.data.data));
        setNoticeList(response.data.data);
        setItem('userNoticeList', response.data.data);
      } else {
        Toast.show({time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0]});
      }
  
  
  
  useEffect(() => {
    if (isFocused) {
      onPageLoad();
    }
  }, [isFocused]);
  useFocusEffect(
    useCallback(() => {
      onBackPress(handleBackPress);
    }, []),
  );
  const onPageLoad = async () => {
    const {agri_state, agri_district, agri_subdivision} =
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
    if (isFocused) {
      onPageLoad();
    }
  }, [isFocused]);
  const handleBackPress = () => {
    navigation.navigate('Dashboard');
    return true;
  };
  useFocusEffect(
    useCallback(() => {
      onBackPress(handleBackPress);
    }, []),
  );
  const searchByTitle = async () => {
    Keyboard.dismiss();
    usefulInfoList(
      dbname,
      lan_id,
      user_id,
      "",
      "",
      "",
    );
  };
  const HandlerGoBack = () => navigation.navigate('Dashboard');
  return (
    <Root>
      <View style={{flex: 1}}>
        <CustomHeader
          path="Dashboard"
          HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />
        {/* <FormsTitle title={t('dash_useful_information')} /> */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}>
          <View style={{flex: 1}}>
            <FormsTitle title={t('dash_useful_information')} />
          </View>
          <TouchableOpacity onPress={toggleView}>
            {isGridView ? (
              <Image
                source={require('../../Common/images/view_list.png')}
                style={{width: 30, height: 30}}
              />
            ) : (
              <Image
                source={require('../../Common/images/view_grid.png')}
                style={{width: 30, height: 30}}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              placeholderTextColor={'#000'}
              style={styles.textInput}
              value={titleSearch}
              onChangeText={text => setTitleSearch(text)}
            />
          </View>
          <TouchableOpacity onPress={searchByTitle} style={styles.searchIcon}>
            <ImageForm
              source={require('../../Common/images/search.png')}
              resizeMode="cover"
              height={40}
              width={40}
            />
          </TouchableOpacity>
        </View>
        {/* <View style={{flex: 1}}>
            {isGridView ? (
              noticeList ? (
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={noticeList.rows}
                  keyExtractor={item => item.fid}
                  renderItem={({item, index}) => (
                    <View style={{marginBottom: 10}}>
                      <TouchableOpacity onPress={() => detailItem(item.fid)}>
                        <UserBoxDisplay
                          item={item.post_name.substring(0, 50)}
                          item2={moment(item.updated_at)
                            .utc()
                            .format('YYYY-MM-DD')}
                          item4={t('read_more')}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                  numColumns={numColumns}
                />
              ) : (
                ''
              )
            ) : (
              // ✅ Grid View

              <FlatList
                showsVerticalScrollIndicator={false}
                data={noticeList.rows}
                renderItem={({item}) => (
                  <TouchableOpacity
                    onPress={() => detailItem(item.fid)}
                    style={styles.FlatListItem}>
                    {item.agri_files.length != 0 ? (
                      <Image
                        style={styles.FlatListItemImg}
                        source={
                          item.agri_files.term_type === 'image'
                            ? {uri: item.agri_files.file_path}
                            : null
                        }
                      />
                    ) : (
                      <Image
                        source={require('../../Common/images/apple.png')}
                        style={[
                          styles.FlatListItemImg,
                          {width: 100, height: 100},
                        ]}
                      />
                    )}
                    <Text
                      style={[
                        styles.title,
                        {
                          fontFamily: 'Poppins-Regular',
                          color: '#000',
                          position: 'absolute',
                          fontSize: 16,
                        },
                      ]}>
                      {item.post_name.substring(0, 20)}
                    </Text>
                  </TouchableOpacity>
                )}
                numColumns={numColumns}
                keyExtractor={(item, index) => index.toString()}
              />
            )}
          </View> */}
        <View style={{flex: 1}}>
          {noticeList && (
            <FlatList
              key={`${isGridView}-${numColumns}`} // 🔑 unique key forces re-render
              showsVerticalScrollIndicator={false}
              data={noticeList.rows}
              numColumns={numColumns}
              keyExtractor={item => item.fid.toString()}
              renderItem={({item}) =>
                !isGridView ? (
                  <TouchableOpacity
                    onPress={() => detailItem(item.fid)}
                    style={isGridView ? styles.gridItem : styles.listItem}>
                    {item.agri_files && item.agri_files.length !== 0 ? (
                      item.agri_files
                        .filter(file => file.term_type === 'gen_info_img')
                        .map(file => (
                          <Image
                            key={file.file_id}
                            source={{uri: file.file_path}}
                            style={{
                              width: 180,
                              height: 150,
                              resizeMode: 'cover',
                              shadowOpacity: 0.25,
                              shadowRadius: 3.84,
                              borderRadius: 25,
                            }}
                          />
                        ))
                    ) : (
                      <Image
                        source={require('../../Common/images/apple.png')}
                        style={styles.image}
                      />
                    )}
                    <Text style={styles.title}>
                      {item.post_name.substring(0, 30)}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{marginBottom: 10}}>
                    <TouchableOpacity onPress={() => detailItem(item.fid)}>
                      <UserBoxDisplay
                        item={item.post_name.substring(0, 50)}
                        item2={moment(item.updated_at)
                          .utc()
                          .format('YYYY-MM-DD')}
                        item4={t('read_more')}
                      />
                    </TouchableOpacity>
                  </View>
                )
              }
            />
          )}
        </View>
      </View>
    </Root>
  );
};
  }

export default UsefulInformationList;

const styles = StyleSheet.create({
  gridItem: {
    flex: 1,
    margin: 10,
    backgroundColor: '#f2f2',
    padding: 10,
    alignItems: 'center',
    flexDirection: 'column',
    // margin: 1,
    // padding: 20,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 30,
    elevation: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    margin: 5,
    overflow: 'hidden',
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 5,
    marginHorizontal: 10, 
    elevation: 1,
  },
  image: {
    width: 100,
    height: 100,
    
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#FFF',
    marginTop: 15,
    marginLeft: 10,
    position: 'absolute',
    textAlign: 'right',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  readMore: {
    fontSize: 12,
    color: 'blue',
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    width: '95%',
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  toggleButtonContainer: {
    alignItems: 'flex-end',
    margin: 10,
  },
  gridItem: {
    flex: 1,
    margin: 5,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  box1: {
    marginHorizontal: '2.5%',
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
  readMore: {
    color: '#18a7d7',
    textAlign: 'right',
    fontStyle: 'italic',
    textDecorationLine: 'underline',
    marginTop: 20,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  textOne: {
    color: 'black',
    // color: "black",
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  searchContainer: {
    marginHorizontal: '3%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 7,
    elevation: 1,
    backgroundColor: '#FFF',
  },
  textInput: {
    height: 45,
    width: '100%',
    color: '#000',
    fontFamily: 'Poppins-Regular',
    lineHeight: 18,
  },
  searchIcon: {
    width: '10%',
  },
  textInputContainer: {
    width: '90%',
  },
});
