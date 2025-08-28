import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React, { useEffect, useState, useCallback, useContext, useMemo } from 'react';
import { useRoute, useIsFocused } from '@react-navigation/native';
import TakePhoto from '../Activity/TakePhoto';
import {
  problemAnswerListAPI,
  problemCommentListAPI,
  problemCommentSaveAPI,
  farmerProblemDetailApi,
} from '../../../config/apiHere';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import ImagePlaceHolderCircleWithoutAddButton from '../../Common/ImagePlaceHolderCircleWithoutAddButton';
import AudioPlayerView from '../../Common/AudioPlayerView';
import { userCreateContext } from '../../Context/usersCreateContext';
import { Colors, Fronts } from '../../utils/Constants';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const ViewProblem = ({ navigation }) => {
  // console.log('Question Title:', farmerProblem?.question_title);
  //GQR-67
  const {
    dbLanTokUsr,
    setdbLanTokUsr,
    loginUser_data,
    LoadingScreen,
    CustomHeader,
    t,
    AlertMesg,
    onBackPress,
    getItem,
    setItem,
    logoImage,
    topBanner,
    Root,
    Toast,
    SPSheet,
    DeviceInfo,
    FormsTitle,
    isOnline,
  } = useContext(userCreateContext);
  const { dbname, lan_id, token, user_id } = loginUser_data;
  //GQR-67
  const { netConnection } = DeviceInfo();
  const isFocused = useIsFocused();
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(false);
  const [btnColor, setBtnColor] = useState(1);
  const [farmerProblem, setFarmerProblem] = useState({});
  const [selectedImage, setSelectedImage] = useState({
    firstItem: '',
    secondItem: '',
    thirdItem: '',
  });
  const [comment1, setComment1] = useState('');
  const [commentAll, setcommentAll] = useState([]);
  const [answerAll, setAnswerAll] = useState([]);
  // const [dbLanTokUsr, setdbLanTokUsr] = useState({});
  const [selectedRecord, setSelectedRecord] = useState({
    firstItemRecord: '',
    secondItemRecord: '',
    thirdItemRecord: '',
  });
  const openImagePicker = item => { };
  const saveCommet = async () => {
    if (comment1) {
      const formData = new FormData();
      formData.append('comment_qid', dbLanTokUsr.question_id);
      formData.append('comment_content', comment1);
      formData.append('comment_type', '2');
      formData.append('comment_approved', '1');
      formData.append('comment_parent', '');
      formData.append('farming_type', 'crop');
      formData.append('farmer_fcm', dbLanTokUsr.question_user_fcm);
      // formData.append("agent_fcm", dbLanTokUsr.question_user_agent_fcm);
      formData.append('photo', '');
      const database_res = await problemCommentSaveAPI(
        dbname,
        lan_id,
        user_id,
        formData,
      );
      if (database_res) {
        Toast.show({ text: `${t('comment_is_added')}`, ...AlertMesg[0] });
        // MessageDialog({ title: 'Successful', message: "Successfull Add Comments" })
        setComment1('');
        const commnetList = await problemCommentListAPI(
          dbname,
          user_id,
          dbLanTokUsr.question_id,
        );
        if (commnetList.data) {
          setcommentAll(commnetList.data.data.rows);
          navigation.navigate('ProblemView');
        }
      }
    } else {
      return;
    }
  };
  const onPageLoad = async () => {
    setIsLoading(true);
    const [problemData, problemIdData] = await Promise.all([
      getItem('problem_Data'),
      getItem('problem_id_data'),
    ]);
    if (problemData) {
      if (isOnline) {
        if (route.params != undefined) {
          const { comment_qid, type } = route.params;
          if (type == 'comment') {
            setBtnColor(2);
          } else {
            setBtnColor(1);
          }
          var response = await farmerProblemDetailApi(
            dbname,
            lan_id,
            comment_qid,
          );
        } else {
          var response = await farmerProblemDetailApi(
            dbname,
            lan_id,
            problemIdData,
          );
        }

        if (response?.status == 200) {
          await setItem('farmerProblemDetail' + problemIdData, response);
        }
      } else {
        var response = await getItem('farmerProblemDetail' + problemIdData);
      }
      if (response?.status === 200) {
        const {
          agri_audio_files,
          agri_user,
          agent_details,
          question_id,
          agri_files,
        } = response?.data?.data[0];

        setFarmerProblem(response.data.data[0]);
        setdbLanTokUsr({
          ...dbLanTokUsr,
          supervisorId: user_id,
          question_id: question_id,
          question_user_fcm: agri_user?.FcmUserToken,
          question_user_agent_fcm: agent_details?.FcmUserToken,
        });
        const [commnetList, answerList] = await Promise.all([
          problemCommentListAPI(dbname, user_id, question_id),
          problemAnswerListAPI(dbname, lan_id, token, question_id),
        ]);
        if (commnetList?.status == 200) {
          setcommentAll(commnetList?.data?.data?.rows);
        }
        if (answerList?.status == 200) {
          setAnswerAll(answerList?.data?.data);
        }
        if (agri_files) {
          let Imag1 = '';
          let Imag2 = '';
          let Imag3 = '';
          let audio1 = '';
          let audio2 = '';
          let audio3 = '';
          const agri_files_image = agri_files.filter(function (v, i) {
            return v['file_ext'] == 'image/jpeg';
          });
          const agri_files_mp3 = agri_audio_files.filter(function (v, i) {
            return v;
          });
          for (let i = 0; i < 3; i++) {
            if (agri_files_image[0] != undefined) {
              Imag1 = agri_files_image[0].file_path;
            } else {
              Imag1 = '';
            }
            if (agri_files_image[1] != undefined) {
              Imag2 = agri_files_image[1].file_path;
            } else {
              Imag2 = '';
            }
            if (agri_files_image[2] != undefined) {
              Imag3 = agri_files_image[2].file_path;
            } else {
              Imag3 = '';
            }
            if (agri_files_mp3[0] != undefined) {
              audio1 = agri_files_mp3[0].file_path;
            } else {
              audio1 = '';
            }
            if (agri_files_mp3[1] != undefined) {
              audio2 = agri_files_mp3[1].file_path;
            } else {
              audio2 = '';
            }
            if (agri_files_mp3[2] != undefined) {
              audio3 = agri_files_mp3[2].file_path;
            } else {
              audio3 = '';
            }
          }
          setSelectedRecord({
            firstItemRecord: audio1,
            secondItemRecord: audio2,
            thirdItemRecord: audio3,
          });
          setSelectedImage({
            firstItem: Imag1,
            secondItem: Imag2,
            thirdItem: Imag3,
          });
          setIsLoading(false);
        }
      }
    }
  };

  useEffect(() => {
    if (isFocused) {
      onPageLoad();
    }
  }, [route.params, isFocused]);
  // useFocusEffect(
  //   useCallback(() => {
  //     onBackPress(handleBackPress);
  //   }, [route.params, isFocused]),
  // );
  const soundPlay = async path => {
    SPSheet.show({
      component: () => <AudioPlayerView path={path} />,
      dragFromTopOnly: true,
      onCloseComplete: () => { },
      onOpenComplete: () => { },
      height: 260,
    });
  };
  const renderCustomHeader = useMemo(() => <CustomHeader
    path="ProblemList"
    logoImage={logoImage}
    topBanner={topBanner}
  />, []);
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        {isLoading ? (
          <View style={styles.LoadingScreen}>
            <LoadingScreen />
          </View>
        ) : null}
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.background_light,
          }}>
          {renderCustomHeader}
          {/* <FormsTitle title={t('plot_and_crop_problem')} /> */}
          <ScrollView>
            <View style={{ backgroundColor: Colors.background_light }}>
              {/* {
                        farmerProblem && farmerProblem?.agri_user ? */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {t('personal_information')}
                </Text>
                <View style={styles.infoRow}>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoValue}>{t('farmer_name')} :</Text>
                    <Text style={styles.infoLabel}>
                      {farmerProblem?.agri_user?.userName}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoValue}>{t('farmer_number')} :</Text>
                    <Text style={styles.infoLabel}>
                      {farmerProblem?.agri_user?.contactNumber}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoValue}>{t('plot')} :</Text>
                    <Text style={styles.infoLabel}>
                      {farmerProblem?.agri_land_user_rel?.plot_no}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('Problem Details')}</Text>
                <View style={styles.infoRow}>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoValue}>
                      {t('enter_problem_title')}:
                    </Text>
                    <Text style={styles.infoLabel}>
                      {farmerProblem?.question_title}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoValue}>
                      {t('question_details')} :
                    </Text>
                    <Text style={styles.infoLabel}>
                      {farmerProblem?.question_desc}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoValue}>{t('problem_type')}:</Text>
                    <Text style={styles.infoLabel}>
                      {farmerProblem?.problem_type &&
                        farmerProblem?.problem_type?.name}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoValue}>{t('select_problem')}:</Text>
                    <Text style={styles.infoLabel}>
                      {farmerProblem?.problem_name &&
                        farmerProblem?.problem_name?.name}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoValue}>{t('crop_name')}:</Text>
                    <Text style={styles.infoLabel}>
                      {farmerProblem?.crop_name &&
                        farmerProblem?.crop_name?.name}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoValue}>{t('crop_veriety')}:</Text>
                    <Text style={styles.infoLabel}>
                      {farmerProblem?.crop_variety &&
                        farmerProblem?.crop_variety?.name}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoValue}>{t('growth_stage')} :</Text>
                    <Text style={styles.infoLabel}>
                      {farmerProblem?.growth_stage &&
                        farmerProblem?.growth_stage?.name}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoValue}>{t('affect_date')}:</Text>
                    <Text style={styles.infoLabel}>
                      {farmerProblem?.affected_date ?? ''}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardImg}>
                <View style={styles.itemPhoto}>
                  <Text style={styles.cardTitle}>{t('Documents')}</Text>
                  <TakePhoto
                    openImagePicker={openImagePicker}
                    selectedImage={selectedImage}
                    title={t('view_phote')}
                  />
                </View>
                <View style={{}}>
                  <Text style={styles.title}>{t('listen_to_the_problem')}</Text>
                  <View style={styles.photoContainer}>
                    {selectedRecord.firstItemRecord != '' ? (
                      <TouchableOpacity
                        onPress={() =>
                          soundPlay(selectedRecord.firstItemRecord)
                        }>
                        <Image
                          source={require('../../Common/images/play.png')}
                          style={{
                            width: 40,
                            height: 40,
                            tintColor: '#3a9015ff',
                          }}
                        />
                      </TouchableOpacity>
                    ) : (
                      <Image
                        source={require('../../Common/images/microphone.png')}
                        style={{
                          width: 40,
                          height: 40,
                          opacity: 0.7,
                          tintColor: '#6e6e6e99',
                        }}
                      />
                    )}
                    {selectedRecord.secondItemRecord != '' ? (
                      <TouchableOpacity
                        onPress={() =>
                          soundPlay(selectedRecord.secondItemRecord)
                        }>
                        <Image
                          source={require('../../Common/images/play.png')}
                          style={{
                            width: 50,
                            height: 50,
                            tintColor: '#3a9015ff',
                          }}
                        />
                      </TouchableOpacity>
                    ) : (
                      <Image
                        source={require('../../Common/images/microphone.png')}
                        style={{
                          width: 40,
                          height: 40,
                          opacity: 0.7,
                          tintColor: '#6e6e6e99',
                        }}
                      />
                    )}
                    {selectedRecord.thirdItemRecord != '' ? (
                      <TouchableOpacity
                        onPress={() =>
                          soundPlay(selectedRecord.thirdItemRecord)
                        }>
                        <Image
                          source={require('../../Common/images/play.png')}
                          style={{
                            width: 50,
                            height: 50,
                            tintColor: '#3a9015ff',
                          }}
                        />
                      </TouchableOpacity>
                    ) : (
                      <Image
                        source={require('../../Common/images/microphone.png')}
                        style={{
                          width: 40,
                          height: 40,
                          opacity: 0.7,
                          tintColor: '#6e6e6e99',
                        }}
                      />
                    )}
                  </View>
                </View>
              </View>

              {/* } */}
              {btnColor === 2 ? (
                <View style={styles.commentsContainer}>
                  <Text style={styles.cardTitle}>{t('add_comments')}</Text>
                  <View style={styles.infoRowCom}>
                    <TextInput
                      multiline={true}
                      numberOfLines={4}
                      style={[styles.textarea, { color: '#000' }]}
                      value={comment1}
                      onChangeText={item => setComment1(item)}
                    />

                    <TouchableOpacity
                      onPress={() => saveCommet()}
                      style={{ marginLeft: 20 }}>
                      <MaterialIcons
                        name="send"
                        size={30}
                        color={'#0aa214ff'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                ''
              )}
              <View style={styles.btnContainer}>
                <TouchableOpacity
                  style={btnColor === 1 ? styles.btnActive : styles.btn}
                  onPress={() => setBtnColor(1)}>
                  <Text
                    style={
                      btnColor === 1 ? styles.btnTitleActive : styles.btnTitle
                    }>
                    {t('answers')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={btnColor === 2 ? styles.btnActive : styles.btn}
                  onPress={() => setBtnColor(2)}>
                  <Text
                    style={
                      btnColor === 2 ? styles.btnTitleActive : styles.btnTitle
                    }>
                    {t('comments')}
                  </Text>
                </TouchableOpacity>
              </View>
              {btnColor === 1 ? (
                <View style={styles.AnsContainer}>
                  {answerAll.length > 0 ? (
                    <View style={styles.AnsItem}>
                      {answerAll.map((value, index) => (
                        <View style={styles.AnsTextContainer} key={index}>
                          <Text style={styles.AnsTitle}>
                            {t('role_col')} : Super Admin
                          </Text>
                          <Text style={styles.AnsTitle}>
                            {t('date')} :{' '}
                            {formatDateToMMDDYYYY(value.created_at)}
                          </Text>
                          <Text style={styles.AnsTitle}>
                            {t('comments')} :{value.optional_solution}{' '}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    ''
                  )}
                </View>
              ) : (
                <View style={styles.commentsContainer}>
                  {commentAll
                    ? commentAll.map((value, index) => {
                      return (
                        <View style={styles.AnsItem} key={index}>
                          <View style={{ width: '20%' }}>
                            {value.agri_user?.agri_files.length > 0 ? (
                              value.agri_user?.agri_files.map(
                                (value1, index1) =>
                                  value1.term_type === '1' && (
                                    <View key={index1}>
                                      {value1.file_path != '' ? (
                                        <ImagePlaceHolderCircleWithoutAddButton
                                          imageurl={{ uri: value1.file_path }}
                                        />
                                      ) : (
                                        <ImagePlaceHolderCircleWithoutAddButton
                                          imageurl={require('../../Common/images/avatar.png')}
                                        />
                                      )}
                                    </View>
                                  ),
                              )
                            ) : (
                              <View
                                style={{
                                  marginVertical: 10,
                                }}>
                                <ImagePlaceHolderCircleWithoutAddButton
                                  imageurl={require('../../Common/images/avatar.png')}
                                />
                              </View>
                            )}
                          </View>
                          <View style={styles.AnsTextContainer}>
                            {value.agri_user?.agri_files.forEach(element => {
                              <Text style={styles.infoValue}>{element}</Text>;
                            })}
                            <View style={{ paddingHorizontal: 15 }}>
                              <Text style={styles.infoValue}>
                                {value.agri_user?.userName}
                                {value.agri_user?.userType === 3 ? (
                                  <Text style={{ color: '#15820bff' }}>
                                    ({t('retailer')})
                                  </Text>
                                ) : (
                                  <Text>({t('login_farmer')})</Text>
                                )}
                              </Text>
                              <Text style={styles.infoValue}>
                                {value.comment_content}
                              </Text>
                              <Text style={styles.infoValue}>
                                {formatDateToMMDDYYYY(value.CreateDateTime)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })
                    : ''}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};
export default ViewProblem;
const styles = StyleSheet.create({
  container: {
    marginHorizontal: '4%',
    marginBottom: 50,
    backgroundColor: Colors.containerGreen,
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderGreen,
  },
  idcontainer: {
    marginVertical: 30,
    marginHorizontal: 20,
  },
  idcontainer2: {
    marginVertical: 10,
    marginHorizontal: 30,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,

    borderRadius: 20,
    padding: 10,
  },
  idItemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  idItem: {
    padding: 10,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idImage: {
    width: 60,
    height: 60,
  },
  imageTitle: {
    fontSize: 10,
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  title: {
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginLeft: 10,
  },
  titleImg: {
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginLeft: 10,
  },
  centeredView: {
    // backgroundColor: '#FFF',
    // width: '90%',
    // left: '5%',
    // // justifyContent: 'center',
    // alignItems: 'center',
    // position: "absolute",
    // top: '50%'
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 4,
    padding: '2.5%',
  },
  loadingScreen: {
    position: 'absolute',
    top: '60%',
    zIndex: 999,
    left: '45%',
  },
  commentContainer: {
    padding: 12,
    // borderWidth: 1,
    elevation: 1,
    marginBottom: 10,
    borderColor: '#CA8586',
    backgroundColor: '#ECC8C5',
    borderRadius: 10,
  },
  plotContainer: {
    backgroundColor: '#F7FCFF',
    borderRadius: 8,
    elevation: 5,
    marginTop: 5,
    // borderWidth: 1,
    // borderColor: Colors.borderGreen,
  },
  plotContainerItem: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
    margin: 15,
    borderRadius: 8,
    padding: 10,
  },
  plotText: {
    color: Colors.text,
    marginVertical: 2,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },

  ///////////////////

  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: '5%',
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardImg: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: '5%',
    marginTop: 20,
    // borderWidth: 1,
    // borderColor: Colors.borderGreen,
  },
  cardTitle: {
    fontSize: 16,

    color: Colors.borderGreen,
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  infoRowCom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  infoTextContainer: {
    marginLeft: 10,
    flex: 1,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    flexShrink: 1,
    // 👈 lets the text shrink and stay in one line
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
  },
  documentSection: {
    marginBottom: 16,
  },
  documentTitle: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  documentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  documentItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  documentName: {
    fontSize: 12,
    color: '#2c3e50',
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  photoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e3f4ffcf',
    // elevation: 3,
    padding: 10,
    margin: 2,
    // marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 15,
    marginHorizontal: 15,
  },
  commentsContainer: {
    // marginHorizontal: '6%',
    // marginTop: 10,
    // flexDirection: 'row',
    // alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: '5%',
    marginTop: 20,
  },
  textarea: {
    borderWidth: 2,
    width: '90%',
    borderRadius: 8,
    borderColor: Colors.border,
  },
  AnsContainer: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 10,
    elevation: 5,
    marginHorizontal: '2%',
  },
  AnsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  AnsTextContainer: {
    // marginHorizontal: '5%',
    borderBottomWidth: 0.5,
    // width: '75%',
    marginRight: 50,
    borderColor: 'green',
  },
  AnsTitle: {
    color: '#000',
    marginBottom: 7,
    fontFamily: 'Poppins-Regular',
  },
  LoadingScreen: {
    position: 'absolute',
    top: '52%',
    left: '45%',
    zIndex: 9999,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  btn: {
    // width: '40%',
    padding: 15,
    borderRadius: 10,
  },
  btnTitle: {
    textAlign: 'center',
    color: '#000000',
    fontFamily: 'Poppins-Regular',
  },
  btnTitleActive: {
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
  },
  btnActive: {
    backgroundColor: '#023a02',
    width: '40%',
    padding: 15,
    borderRadius: 10,
    fontFamily: 'Poppins-Regular',
  },

  ///////////////////////////////////////////
  // container: {
  //   marginHorizontal: '5%',
  //   marginBottom: 50,
  // },
  // idcontainer: {
  //   marginVertical: 10,
  // },
  // idItemContainer: {
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  // },
  // idItem: {
  //   padding: 10,
  //   width: '30%',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // idImage: {
  //   width: 60,
  //   height: 60,
  // },
  // imageTitle: {
  //   fontSize: 10,
  //   color: '#000',
  //   fontFamily: 'Poppins-Regular',
  // },
  // title: {
  //   color: '#000',
  //   fontFamily: 'Poppins-Regular',
  //   fontSize: 14,
  // },
  // centeredView: {
  //   // backgroundColor: '#FFF',
  //   // width: '90%',
  //   // left: '5%',
  //   // // justifyContent: 'center',
  //   // alignItems: 'center',
  //   // position: "absolute",
  //   // top: '50%'
  //   flex: 1,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   backgroundColor: 'rgba(0,0,0,0.5)',
  // },
  // modalView: {
  //   width: '90%',
  //   backgroundColor: '#FFF',
  //   borderRadius: 4,
  //   padding: '2.5%',
  // },
  // loadingScreen: {
  //   position: 'absolute',
  //   top: '60%',
  //   zIndex: 999,
  //   left: '45%',
  // },
  // commentContainer: {
  //   padding: 12,
  //   // borderWidth: 1,
  //   elevation: 1,
  //   marginBottom: 10,
  //   borderColor: '#CA8586',
  //   backgroundColor: '#ECC8C5',
  //   borderRadius: 10,
  // },
  // plotContainer: {
  //   backgroundColor: '#FFF',
  //   borderRadius: 10,
  //   elevation: 5,
  // },
  // plotContainerItem: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  //   alignItems: 'center',
  //   backgroundColor: '#FFF',
  //   borderWidth: 1,
  //   borderColor: '#000',
  //   margin: 15,
  //   borderRadius: 10,
  //   padding: 10,
  // },
  // plotText: {
  //   color: '#000',
  //   marginVertical: 2,
  //   fontFamily: 'Poppins-Regular',
  //   fontSize: 14,
  // },
});
