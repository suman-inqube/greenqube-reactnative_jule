import {
  Keyboard,
  TextInput,
  Image,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState, useEffect, useContext } from 'react'
import { cropListApi} from '../../../config/apiHere';
import { farmerUsefulInfoListAPI, } from '../../../config/apiHere';
import moment from "moment";
// import { useNavigation } from '@react-navigation/native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { userCreateContext } from '../../Context/usersCreateContext';
import ImageForm from '../../Common/ImageForm';
const FarmerUsefulInformationList = () => {
    //GQR-67
    const { loginUser_data, t, FormsTitle, getItem, logoImage, topBanner, onBackPress, setItem, CustomHeader } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id, agri_user_addresses } = loginUser_data;
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
    const detailItem = async (itemId) => {
        await setItem("userNoticeId", itemId);
        navigation.navigate('FarmerUsefulInformation', { pagename: 'FarmerUsefulInformation', noticeId: itemId });
    }
    const handleBackPress = () => { navigation.navigate("FarmerDashboard"); return true; }
    useEffect(() => {
        onBackPress(handleBackPress);
    }, [])
    function UserBoxDisplay({ item, item2, item3, item4 }) {
        return (
            <View style={styles.box1}>
                <View style={styles.box1_1}>
                    <View style={{ width: '70%' }}>
                        <Text style={[styles.textOne, { flexWrap: 'wrap' }]}>{item}</Text>
                        <Text>{item2}</Text>
                    </View>
                    <View style={{ width: '30%' }}>
                        <Text style={styles.readMore}>{item4}</Text>
                    </View>
                </View>
            </View>
        );
    }
    const usefulInfoList = async (dbName, languageID, userID, state_id, district_id, subdiv_id, newCropId) => {
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
            setNoticeList(response?.data?.data)
            setItem("userNoticeList", response?.data?.data)
           
        }
    }
    const onPageLoad = async () => {
        const response = await cropListApi(dbname, lan_id, user_id);
        if (response?.status == 200) {
           
            let cropId = "";
            const datam = response?.data?.data?.rows
            datam.map(async (item) => { cropId = cropId + item.crop_name_id + ","; });
            const newCropId = cropId.substring(0, cropId.length - 1);
            usefulInfoList(dbname, lan_id, user_id, agri_user_addresses[0].agri_state.fid, agri_user_addresses[0].agri_district.fid, agri_user_addresses[0].agri_subdivision.fid, newCropId)
            
        }
    };
    useEffect(() => {
        if (isFocused) {
            onPageLoad();
        }
    }, [isFocused]);
    // useFocusEffect(
    //     useCallback(() => {
    //         const onBackPress = () => { navigation.navigate('FarmerDashboard'); return true; };
    //         BackHandler.addEventListener('hardwareBackPress', onBackPress);
    //         return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    //     }, [])
    // );
    const HandlerGoBack = () => {
        navigation.navigate('FarmerDashboard');
    }
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
    return (
      <View style={{flex: 1}}>
        <CustomHeader
          path="FarmerDashboard"
          HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />
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
                style={{width: 25, height: 25}}
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
              height={30}
              width={30}
            />
          </TouchableOpacity>
        </View>

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
                              width: 160,
                              height: 130,
                              resizeMode: 'cover',
                              shadowOpacity: 0.25,
                              shadowRadius: 3.84,
                              borderRadius: 25,
                              marginLeft: 10,
                            }}
                          />
                        ))
                    ) : (
                      <Image
                        source={require('../../Common/images/greenqube_logo.png')}
                        style={styles.image}
                      />
                    )}
                    <Text style={styles.title}>
                      {item.post_name.substring(0, 15)}
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
        {/* <FormsTitle title={t('dash_useful_information')} /> */}
        {/* <View style={{ flex: 1 }}>
                {
                    noticeList ?
                        <FlatList
                            data={noticeList.rows}
                            keyExtractor={(item) => item.fid}
                            renderItem={({ item, index }) => (
                                <View style={{ marginBottom: 10 }}>
                                    <TouchableOpacity onPress={() => detailItem(item.fid)}>
                                        <UserBoxDisplay
                                            item={item.post_name}

                                            item2={moment(item.updated_at).utc().format('YYYY-MM-DD')}
                                            item4={t('read_more')}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )} />
                        :
                        ""
                }
            </View> */}
      </View>
    );
}

export default FarmerUsefulInformationList


// const styles = StyleSheet.create({
//     header:
//     {
//         flexDirection: 'row',
//         justifyContent: "space-between",
//         alignItems: 'center'
//     },
//     titleContainer: {
//         width: "95%",
//         alignItems: 'flex-end',
//         paddingVertical: 10,
//     },
//     box1:
//     {
//         // marginBottom: 10,
//         marginHorizontal: 10,
//         borderRadius: 10,
//         flexDirection: 'row',
//         alignItems: 'center',
//         height: 70,
//         backgroundColor: 'white',
//         shadowColor: 'rgba(0, 0, 0, 0.2)',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.8,
//         shadowRadius: 20,
//     },

//     box1_1: {
//         flex: 1,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginHorizontal: 20,
//     },
//     boxMenu:
//     {
//         borderRadius: 10,
//         flexDirection: 'row',
//         alignItems: 'center',
//         height: 50,
//         backgroundColor: 'white',
//         shadowColor: 'rgba(0, 0, 0, 0.2)',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.8,
//         shadowRadius: 20,
//     },
//     readMore:
//     {
//         color: "lightblue",
//         fontFamily: "Arial",
//         textAlign: 'right',
//         fontWeight: 'bold',
//         fontStyle: 'italic',
//         textDecorationLine: 'underline',
//         marginTop: 20,
//     },
//     textOne:
//     {
//         color: 'black',
//         // color: "black",
//         fontFamily: "Arial",
//         fontWeight: 'bold',
//     },
// })
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
    width: '85%',
    height: 120,
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    marginTop: 15,
    marginLeft: 20,
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
    height: 40,
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
