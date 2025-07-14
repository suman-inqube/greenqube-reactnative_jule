import {
  Keyboard,
  TextInput,
  Image,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from 'react-native';
import React, { useState, useEffect, useContext } from 'react'
import moment from "moment";
import { useNavigation, useIsFocused } from '@react-navigation/native';
import {trainingListAPI, getDycryptedImage} from '../../../config/apiHere';
import { useTranslation } from 'react-i18next';
import FormsTitle from '../../Common/FormsTitle';
import { userCreateContext } from '../../Context/usersCreateContext';
import ImageForm from '../../Common/ImageForm';
const TrainingList = () => {
    //GQR-67
    const { loginUser_data, CustomHeader, t, AlertMesg, onBackPress, getItem, setItem, logoImage, topBanner, Root, Toast } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id, agri_user_addresses } = loginUser_data;
    //GQR-67
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [noticeList, setTrainingList] = useState([]);
    const [isGridView, setIsGridView] = useState(true);
      const numColumns = isGridView ? 1 : 2;
      const [titleSearch, setTitleSearch] = useState('');

      const decryptAllImages =  allNotice => {
          const updatedList = 
            allNotice.rows.map(item => {
              const updatedFiles = 
                item.agri_files.map(file => {
                  if (file.term_type !== 'gen') {
                    const decryptedPath =  getDycryptedImage(
                      file.file_path.content,
                      file.file_path.iv,
                    );
                    return {...file, decryptedPath};
                  }
                  return file;
                })
             
              return {...item, agri_files: updatedFiles};
            })
          
          console.log('updatedList==', JSON.stringify(updatedList));
          setTrainingList({...noticeList, rows: updatedList});
        };
    
      const toggleView = () => {
        setIsGridView(!isGridView);
      };

    const detailItem = async (itemId) => {
        await setItem("userNoticeId", itemId);
        navigation.navigate('Training', { pagename: 'Training', noticeId: itemId });
    }
    function UserBoxDisplay({ item, item2, item3, item4 }) {
        return (
            <View style={styles.box1}>
                <View style={styles.box1_1}>
                    <View style={{ width: '70%' }}>
                        <Text style={styles.textOne}>{item}</Text>
                        <Text>{item2}</Text>
                    </View>
                    <View style={{ width: '30%' }}>
                        <Text style={styles.readMore}>{item4}</Text>
                    </View>
                </View>
            </View>
        );
    }
    const trainingList = async (dbName, languageID, userID, state_id, district_id, subdiv_id) => {
        let response = await trainingListAPI(
          dbName,
          languageID,
          userID,
          state_id,
          district_id,
          subdiv_id,
          'supervisor',
          'training',
          titleSearch,
        );
        if (response) {
            if (response.data.data.rows != 0) {
                // setTrainingList(response.data.data)
                  decryptAllImages(response.data.data);
                setItem("userTrainingList", response.data.data)
            } else {
                Toast.show({ text: `${t('no_data_found')}`, ...AlertMesg[0] })
            }
        }
    }
    const onPageLoad = async () => {
        const { agri_state, agri_district, agri_subdivision } = agri_user_addresses[0];
        trainingList(dbname, lan_id, user_id, agri_state.fid, agri_district.fid, agri_subdivision.fid);
    };
    useEffect(() => {
        if (isFocused) {
            onPageLoad();
            onBackPress(() => { navigation.navigate('Dashboard'); return true; })
        }
    }, [isFocused]);
    const HandlerGoBack = () => {
        navigation.navigate('Dashboard')
    }
    const searchByTitle = async () => {
        Keyboard.dismiss();
        trainingList(dbname, lan_id, user_id, '', '', '');
      };
    return (
      <>
        <View style={{flex: 1}}>
          <CustomHeader
            path="Dashboard"
            HandlerGoBack={HandlerGoBack}
            logoImage={logoImage}
            topBanner={topBanner}
          />
          {/* <FormsTitle title={t('training_support')} /> */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}>
            <View style={{flex: 1}}>
              <FormsTitle title={t('training_support')} />
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
          {/* <View>
            {noticeList ? (
              <FlatList
                style={{marginHorizontal: '2.5%'}}
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
              />
            ) : (
              ''
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
                      {item.agri_files &&
                      item.agri_files.filter(
                        file => file.term_type === 'gen_info_img',
                      ).length > 0 ? (
                        item.agri_files
                          .filter(file => file.term_type === 'gen_info_img')
                          .map(file => (
                            <Image
                              key={file.file_id}
                              source={{uri: file.decryptedPath}}
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
                          source={require('../../Common/images/greenqube_logo.png')}
                          style={styles.image}
                        />
                      )}
                      <Text style={styles.title}>
                        {item.post_name.substring(0, 20)}
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
        <Root></Root>
      </>
    );
}
export default TrainingList
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
//         fontFamily: 'Poppins-Regular',
//         textAlign: 'right',
//         fontWeight: 'bold',
//         fontStyle: 'italic',
//         textDecorationLine: 'underline',
//         marginTop: 20,
//         fontSize: 14,
//     },
//     textOne:
//     {
//         color: 'black',
//         fontFamily: 'Poppins-Regular',
//         fontSize: 14
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
    width: '90%',
    height: 120,
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
