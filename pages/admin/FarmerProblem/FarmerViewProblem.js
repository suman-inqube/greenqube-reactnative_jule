import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React, {useEffect, useState, useCallback, useContext} from 'react';
import ImagePlaceHolderCircleWithoutAddButton from '../../Common/ImagePlaceHolderCircleWithoutAddButton';
import {useFocusEffect, useRoute, useIsFocused} from '@react-navigation/native';
import TakePhoto from '../Activity/TakePhoto';
import {
  problemAnswerListAPI,
  problemCommentListAPI,
  problemCommentSaveAPI,
  farmerProblemDetailApi,
} from '../../../config/apiHere';
import MessageDialog from '../../Common/MessageDialog';
import {formatDateToMMDDYYYY} from '../../Common/DateChanger';
import AudioPlayerView from '../../Common/AudioPlayerView';
import {userCreateContext} from '../../Context/usersCreateContext';
import {Colors, Fronts} from '../../utils/Constants';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {axiosGet, axiosPost} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
const FarmerViewProblem = ({navigation}) => {
  //GQR-67
  const {
    loginUser_data,
    Root,
    getItem,
    setItem,
    FormsTitle,
    Toast,
    isOnline,
    SPSheet,
    CustomHeader,
    t,
    logoImage,
    topBanner,
    onBackPress,
    AlertMesg,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, owner, user_id} = loginUser_data;
  //GQR-67
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
  const [dbLanTokUsr, setdbLanTokUsr] = useState({});
  const [selectedRecord, setSelectedRecord] = useState({
    firstItemRecord: '',
    secondItemRecord: '',
    thirdItemRecord: '',
  });
  const openImagePicker = item => {};
  const saveCommet = async () => {
    if (comment1) {
      const formData = new FormData();
      formData.append('comment_qid', dbLanTokUsr.question_id);
      formData.append('comment_content', comment1);
      formData.append('comment_type', '2');
      formData.append('comment_approved', '1');
      formData.append('comment_parent', '');
      formData.append('farming_type', 'crop');
      // formData.append("farmer_fcm", dbLanTokUsr.question_user_fcm);
      formData.append('agent_fcm', dbLanTokUsr.question_user_agent_fcm);
      formData.append('photo', '');
      const database_res = await axiosPost(
        ROUTES.POST.PROBLEM_COMMENT_SAVE,
        formData,
        '',
        false,
        {
          information: `${dbname},${lan_id},${dbLanTokUsr.farmerID}`,
        },
      );
      // problemCommentSaveAPI(
      //   dbname,
      //   lan_id,
      //   dbLanTokUsr.farmerID,
      //   formData,
      // );
      if (database_res) {
        // MessageDialog({ title: 'Successful', message: "Successfull Add Comments" })
        Toast.show({time: 3, text: `${t('add_comments')}`, ...AlertMesg[0]});
        setComment1('');
        const commnetList = await axiosGet(
          ROUTES.GET.PROBLEM_COMMENTS_LIST({
            questionId: dbLanTokUsr.question_id,
          }),
          '',
          {information: `${dbname},${dbLanTokUsr.farmerID}`},
        );
        // problemCommentListAPI(
        //   dbname,
        //   dbLanTokUsr.farmerID,
        //   dbLanTokUsr.question_id,
        // );
        if (commnetList.data) {
          setcommentAll(commnetList?.data?.data?.rows);
          navigation.navigate('FarmerViewProblem');
        }
      }
    } else {
      return;
    }
  };

  const onPageLoad = async () => {
    setSelectedImage({firstItem: '', secondItem: '', thirdItem: ''});
    const [problemData, problemIdData] = await Promise.all([
      getItem('problem_Data'),
      getItem('problem_id_data'),
    ]);
    if (isOnline) {
      if (route.params != undefined) {
        const {comment_qid, type} = route.params;
        if (type == 'comment') {
          setBtnColor(2);
        } else {
          setBtnColor(1);
        }
        var response = await axiosGet(
          ROUTES.GET.FARMER_PROBLEM_DETAILS({
            quesId: comment_qid,
          }),
          '',
          {information: `${dbname},${lan_id}`},
        );

        // farmerProblemDetailApi(
        //   dbname,
        //   lan_id,
        //   comment_qid,
        // );
      } else {
        var response = await axiosGet(
          ROUTES.GET.FARMER_PROBLEM_DETAILS({
            quesId: problemIdData,
          }),
          '',
          {information: `${dbname},${lan_id}`},
        );
        // farmerProblemDetailApi(
        //   dbname,
        //   lan_id,
        //   problemIdData,
        // );
      }
      if (response?.status == 200) {
        await setItem('farmerProblemDetail' + problemIdData, response);
      }
    } else {
      var response = await getItem('farmerProblemDetail' + problemIdData);
    }

    console.log('details', response);
    if (response?.status === 200) {
      const {agri_user, agent_details, question_id} = response?.data?.data[0];
      setFarmerProblem(response.data.data[0]);
      setdbLanTokUsr({
        ...dbLanTokUsr,
        farmerID: user_id,
        question_id: question_id,
        question_user_fcm: agri_user?.FcmUserToken,
        question_user_agent_fcm: agent_details?.FcmUserToken,
      });
      const [commnetList, answerList] = await Promise.all([
        axiosGet(
          ROUTES.GET.PROBLEM_COMMENTS_LIST({
            questionId: question_id,
          }),
          '',
          {information: `${dbname},${user_id}`},
        ),
        // problemCommentListAPI(dbname, user_id, question_id),

        axiosGet(
          ROUTES.GET.PROBLEM_ANS_LIST({
            problem_id: question_id,
          }),
          token,
          {information: `${dbname},${lan_id}`},
        ),
        // problemAnswerListAPI(dbname, lan_id, token, question_id),
      ]);
      if (commnetList.data) {
        setcommentAll(commnetList?.data?.data?.rows);
      }

      console.log('answerList', answerList);
      if (answerList?.status == 200) {
        setAnswerAll(answerList.data.data);
      }
      // if (response.data.agri_files) {
      let Imag1 = '';
      let Imag2 = '';
      let Imag3 = '';
      let audio1 = '';
      let audio2 = '';
      let audio3 = '';
      if (response?.data?.data[0]?.agri_files[0]) {
        Imag1 = response?.data?.data[0]?.agri_files[0].file_path;
      } else {
        Imag1 = '';
      }
      if (response?.data?.data[0]?.agri_files[1]) {
        Imag2 = response?.data?.data[0]?.agri_files[1].file_path;
      } else {
        Imag2 = '';
      }
      if (response?.data?.data[0]?.agri_files[2]) {
        Imag3 = response?.data?.data[0]?.agri_files[2].file_path;
      } else {
        Imag3 = '';
      }
      if (response?.data?.data[0]?.agri_audio_files[0]) {
        audio1 = response?.data?.data[0]?.agri_audio_files[0].file_path;
      } else {
        audio1 = '';
      }
      if (response?.data?.data[0]?.agri_audio_files[1]) {
        audio2 = response?.data?.data[0]?.agri_audio_files[1].file_path;
      } else {
        audio2 = '';
      }
      if (response?.data?.data[0]?.agri_audio_files[2]) {
        audio3 = response?.data?.data[0]?.agri_audio_files[2].file_path;
      } else {
        audio3 = '';
      }
      setSelectedRecord({
        firstItemRecord: audio1,
        secondItemRecord: audio2,
        thirdItemRecord: audio3,
      });
      setSelectedImage({firstItem: Imag1, secondItem: Imag2, thirdItem: Imag3});
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (isFocused) {
      onPageLoad();
    }
  }, [route.params, isFocused]);

  const soundPlay = async path => {
    SPSheet.show({
      component: () => <AudioPlayerView path={path} />,
      dragFromTopOnly: true,
      onCloseComplete: () => {
        // alert('onCloseComplete');
      },
      onOpenComplete: () => {
        // console.log(SPSheet)
      },
      height: 260,
    });
  };
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        {isLoading ? (
          <View style={styles.LoadingScreen}>
            <LoadingScreen />
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.background_light,
            }}>
            <CustomHeader
              path="FarmerListProblem"
              logoImage={logoImage}
              topBanner={topBanner}
            />
            {/* <FormsTitle title={t('plot_and_crop_problem')} /> */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{backgroundColor: Colors.background_light}}>
                {farmerProblem && farmerProblem.agri_user ? (
                  <>
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>
                        {t('personal_information')}
                      </Text>
                      <View style={styles.infoRow}>
                        <View style={styles.infoTextContainer}>
                          <Text style={styles.infoValue}>
                            {t('farmer_name')}
                          </Text>
                          <Text style={styles.infoLabel}>
                            : {farmerProblem.agri_user.userName}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <View style={styles.infoTextContainer}>
                          <Text style={styles.infoValue}>
                            {t('farmer_number')}
                          </Text>
                          <Text style={styles.infoLabel}>
                            : {farmerProblem.agri_user.contactNumber}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>
                        {t('Problem Details')}
                      </Text>
                      <View style={styles.infoRow}>
                        <View style={styles.infoTextContainer}>
                          <Text style={styles.infoValue}>
                            {t('enter_problem_title')}
                          </Text>
                          <Text style={styles.infoLabel}>
                            : {farmerProblem.question_title}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoRow}>
                        <View style={styles.infoTextContainer}>
                          <Text style={styles.infoValue}>
                            {t('question_details')}
                          </Text>
                          <Text style={styles.infoLabel}>
                            : {farmerProblem.question_desc}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <View style={styles.infoTextContainer}>
                          <Text style={styles.infoValue}>{t('plot')}</Text>
                          <Text style={styles.infoLabel}>
                            : {farmerProblem.agri_land_user_rel?.plot_no}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoRow}>
                        <View style={styles.infoTextContainer}>
                          <Text style={styles.infoValue}>
                            {t('problem_type')}
                          </Text>
                          <Text style={styles.infoLabel}>
                            :{' '}
                            {farmerProblem?.problem_type &&
                              farmerProblem?.problem_type?.name}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoRow}>
                        <View style={styles.infoTextContainer}>
                          <Text style={styles.infoValue}>
                            {t('select_problem')}
                          </Text>
                          <Text style={styles.infoLabel}>
                            :{' '}
                            {farmerProblem?.problem_name &&
                              farmerProblem?.problem_name?.name}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <View style={styles.infoTextContainer}>
                          <Text style={styles.infoValue}>
                            {t('addcrop_croptype')}
                          </Text>
                          <Text style={styles.infoLabel}>
                            :{' '}
                            {farmerProblem.crop_type &&
                              farmerProblem.crop_type.name}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <View style={styles.infoTextContainer}>
                          <Text style={styles.infoValue}>{t('crop_name')}</Text>
                          <Text style={styles.infoLabel}>
                            :{' '}
                            {farmerProblem.crop_name &&
                              farmerProblem.crop_name.name}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <View style={styles.infoTextContainer}>
                          <Text style={styles.infoValue}>
                            {t('crop_veriety')}
                          </Text>
                          <Text style={styles.infoLabel}>
                            :{' '}
                            {farmerProblem.crop_variety &&
                              farmerProblem.crop_variety.name}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoRow}>
                        <View style={styles.infoTextContainer}>
                          <Text style={styles.infoValue}>
                            {t('growth_stage')}
                          </Text>
                          <Text style={styles.infoLabel}>
                            :{' '}
                            {farmerProblem.growth_stage &&
                              farmerProblem.growth_stage.name}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoRow}>
                        <View style={styles.infoTextContainer}>
                          <Text style={styles.infoValue}>
                            {t('affect_date')}
                          </Text>
                          <Text style={styles.infoLabel}>
                            : {farmerProblem.affected_date ?? ''}
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
                        <Text style={styles.title}>
                          {t('listen_to_the_problem')}
                        </Text>
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
                              sty
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
                  </>
                ) : (
                  ''
                )}
                {btnColor === 2 ? (
                  <View style={styles.commentsContainer}>
                    <Text style={styles.cardTitle}>{t('add_comments')}</Text>
                    <View style={styles.infoRowCom}>
                      <TextInput
                        multiline={true}
                        numberOfLines={4}
                        style={[styles.textarea, {color: '#000'}]}
                        value={comment1}
                        onChangeText={item => setComment1(item)}
                      />
                      <TouchableOpacity onPress={() => saveCommet()}>
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
                          <View style={styles.answerCard} key={index}>
                            {/* Header */}
                            <View style={styles.answerHeader}>
                              <View style={styles.roleBadge}>
                                <Text style={styles.roleBadgeText}>
                                  {value?.agri_user?.user_role?.role_name ||
                                    'Super Admin'}
                                </Text>
                              </View>

                              <Text style={styles.answerDate}>
                                {formatDateToMMDDYYYY(value.created_at)}
                              </Text>
                            </View>

                            {/* Answer */}
                            <View style={styles.answerBody}>
                              <Text style={styles.answerLabel}>
                                {t('comments')}
                              </Text>

                              <Text style={styles.answerText}>
                                {value?.optional_solution ||
                                  value?.agri_solution?.agri_predefined_sol
                                    ?.description ||
                                  'No Answer Available'}
                              </Text>
                            </View>
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
                      ? commentAll.map((value, index) => (
                          <View style={styles.AnsItem} key={index}>
                            <View style={{width: '20%'}}>
                              {value.agri_user.agri_files.length > 0 ? (
                                value.agri_user.agri_files.map(
                                  (value1, index1) =>
                                    value1.term_type === '1' && (
                                      <View key={index1}>
                                        {value1.file_path != '' ? (
                                          <ImagePlaceHolderCircleWithoutAddButton
                                            imageurl={{uri: value1.file_path}}
                                          />
                                        ) : (
                                          <Image
                                            source={{uri: value1.file_path}}
                                            resizeMode="cover"
                                            style={{width: 50, height: 50}}
                                          />
                                        )}
                                      </View>
                                    ),
                                )
                              ) : (
                                <View style={{marginVertical: 10}}>
                                  <ImagePlaceHolderCircleWithoutAddButton
                                    imageurl={require('../../Common/images/avatar.png')}
                                  />
                                </View>
                              )}
                            </View>
                            <View style={styles.AnsTextContainer}>
                              {value.agri_user.agri_files.forEach(element => {
                                <Text style={styles.infoValueCom}>
                                  {element}
                                </Text>;
                              })}
                              <Text style={styles.infoValueCom}>
                                {t('name')} : {value.agri_user.userName}
                                {value.agri_user.userType === 3 ? (
                                  <Text style={{color: '#15820bff'}}>
                                    ({t('retailer')})
                                  </Text>
                                ) : (
                                  <Text> ({t('login_farmer')})</Text>
                                )}
                              </Text>
                              <Text style={styles.infoValueCom}>
                                {t('date')}:{' '}
                                {formatDateToMMDDYYYY(value.CreateDateTime)}
                              </Text>
                              <Text style={styles.infoValueCom}>
                                {t('comments')} :{value.comment_content}
                              </Text>
                            </View>
                          </View>
                        ))
                      : ''}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerViewProblem;

const styles = StyleSheet.create({
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: '5%',
    marginTop: 20,
    // borderWidth: 1,
    // borderColor: Colors.borderGreen,
  },
  cardImg: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
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
  infoValueCom: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
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
    shadowOffset: {width: 0, height: 2},
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
    // flexDirection: 'row',
    // alignItems: 'center',
    marginBottom: 10,
  },
  ComItem: {
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
  answerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#d8e8d8',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  roleBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  roleBadgeText: {
    color: '#1b5e20',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },

  answerDate: {
    color: '#777',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },

  answerBody: {
    backgroundColor: '#f8fbf8',
    borderRadius: 10,
    padding: 12,
  },

  answerLabel: {
    color: '#1b5e20',
    fontSize: 13,
    marginBottom: 6,
    fontFamily: 'Poppins-SemiBold',
  },

  answerText: {
    color: '#222',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
});
