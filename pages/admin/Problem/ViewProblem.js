import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native'
import React, { useEffect, useState, useCallback, useContext } from 'react'
import { useFocusEffect, useRoute, useIsFocused } from '@react-navigation/native';
import TakePhoto from '../Activity/TakePhoto';
import {
  problemAnswerListAPI,
  problemCommentListAPI,
  problemCommentSaveAPI,
  farmerProblemDetailApi,
  getDycryptedImage,
} from '../../../config/apiHere';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import ImagePlaceHolderCircleWithoutAddButton from '../../Common/ImagePlaceHolderCircleWithoutAddButton';
import AudioPlayerView from '../../Common/AudioPlayerView';
import { userCreateContext } from '../../Context/usersCreateContext';
const ViewProblem = ({ navigation }) => {
    //GQR-67
    const { dbLanTokUsr, setdbLanTokUsr, loginUser_data, LoadingScreen, CustomHeader, t, AlertMesg, onBackPress, getItem,
        setItem, logoImage, topBanner, Root, Toast, SPSheet, DeviceInfo, FormsTitle, isOnline } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    //GQR-67
    const { netConnection } = DeviceInfo();
    const isFocused = useIsFocused();
    const route = useRoute();
    const [isLoading, setIsLoading] = useState(false);
    const [btnColor, setBtnColor] = useState(1);
    const [farmerProblem, setFarmerProblem] = useState({});
    const [selectedImage, setSelectedImage] = useState({
        firstItem: "",
        secondItem: "",
        thirdItem: "",
    });
    const [comment1, setComment1] = useState("");
    const [commentAll, setcommentAll] = useState([]);
    const [answerAll, setAnswerAll] = useState([]);
    const [commentImages, setCommentImages] = useState([]);
    // const [dbLanTokUsr, setdbLanTokUsr] = useState({});
    const [selectedRecord, setSelectedRecord] = useState({
        firstItemRecord: "",
        secondItemRecord: "",
        thirdItemRecord: "",
    });
    const openImagePicker = (item) => {
    };
    const saveCommet = async () => {
        if (comment1) {
            const formData = new FormData();
            formData.append("comment_qid", dbLanTokUsr.question_id);
            formData.append("comment_content", comment1);
            formData.append("comment_type", "2");
            formData.append("comment_approved", "1");
            formData.append("comment_parent", "");
            formData.append("farming_type", "crop");
            formData.append("farmer_fcm", dbLanTokUsr.question_user_fcm);
            // formData.append("agent_fcm", dbLanTokUsr.question_user_agent_fcm);
            formData.append("photo", "");
            const database_res = await problemCommentSaveAPI(dbname, lan_id, user_id, formData);
            if (database_res) {
                Toast.show({ text: `${t('comment_is_added')}`, ...AlertMesg[0] });
                // MessageDialog({ title: 'Successful', message: "Successfull Add Comments" })
                setComment1("")
                const commnetList = await problemCommentListAPI(dbname, user_id, dbLanTokUsr.question_id)
                if (commnetList.data) {
                    setcommentAll(commnetList.data.data.rows);
                    await decryptCommentImages(commnetList?.data?.data?.rows);
                    navigation.navigate('ProblemView');
                }
            }
        } else {
            return;
        }
    }

    const decryptCommentImages = async comments => {
      const decryptedComments =  Promise.all(
        comments.map( comment => {
          if (comment.agri_user?.agri_files?.length > 0) {
            const decryptedFiles =  Promise.all(
              comment.agri_user.agri_files.map( file => {
                if (
                  file.file_path &&
                  file.file_path.content &&
                  file.file_path.iv
                ) {
                  const decryptedUrl =  getDycryptedImage(
                    file.file_path.content,
                    file.file_path.iv,
                  );
                  return {...file, decrypted_path: decryptedUrl};
                } else {
                  return file;
                }
              }),
            );
            return {
              ...comment,
              agri_user: {...comment.agri_user, agri_files: decryptedFiles},
            };
          }
          return comment;
        }),
      );
      setCommentImages(decryptedComments);
    };
    const onPageLoad = async () => {
        setIsLoading(true);
        const [problemData, problemIdData] = await Promise.all([getItem('problem_Data'), getItem('problem_id_data')]);
        if (problemData) {
            if (isOnline) {
                if (route.params != undefined) {
                    const { comment_qid, type } = route.params;
                    if (type == "comment") {
                        setBtnColor(2)
                    } else {
                        setBtnColor(1)
                    }
                    var response = await farmerProblemDetailApi(dbname, lan_id, comment_qid);
                } else {
                    var response = await farmerProblemDetailApi(dbname, lan_id, problemIdData);
                }
                if (response?.status == 200) {
                    await setItem('farmerProblemDetail' + problemIdData, response);
                }
            } else {
                var response = await getItem('farmerProblemDetail' + problemIdData);
            }
            if (response?.status === 200) {
                const { agri_audio_files, agri_user, agent_details, question_id, agri_files } = response?.data?.data[0];
                setFarmerProblem(response.data.data[0]);
                setdbLanTokUsr({
                    ...dbLanTokUsr,
                    supervisorId: user_id,
                    question_id: question_id,
                    question_user_fcm: agri_user?.FcmUserToken,
                    question_user_agent_fcm: agent_details?.FcmUserToken
                });
                const [commnetList, answerList] = await Promise.all([
                    problemCommentListAPI(dbname, user_id, question_id),
                    problemAnswerListAPI(dbname, lan_id, token, question_id)
                ])
                if (commnetList?.status == 200) {
                    setcommentAll(commnetList?.data?.data?.rows);
                    await decryptCommentImages(commnetList?.data?.data?.rows);
                }
                if (answerList?.status == 200) {
                    setAnswerAll(answerList?.data?.data);
                }
                if (agri_files) {
                    let Imag1 = ''
                    let Imag2 = ''
                    let Imag3 = ''
                    let audio1 = '';
                    let audio2 = '';
                    let audio3 = '';
                    const agri_files_image = agri_files.filter(function (v, i) { return ((v["file_ext"] == "image/jpeg")) });
                    const agri_files_mp3 = agri_audio_files.filter(function (v, i) { return (v) });
                    for (let i = 0; i < 3; i++) {
                        if (agri_files_image[0] != undefined) {
                            // Imag1 = agri_files_image[0].file_path
                            Imag1 =  getDycryptedImage(
                              agri_files_image[0].file_path?.content,
                              agri_files_image[0].file_path?.iv,
                            );
                        } else {
                            Imag1 = "";
                        }
                        if (agri_files_image[1] != undefined) {
                            // Imag2 = agri_files_image[1].file_path
                            Imag2 =  getDycryptedImage(
                              agri_files_image[1].file_path?.content,
                              agri_files_image[1].file_path?.iv,
                            );
                        } else {
                            Imag2 = "";
                        }
                        if (agri_files_image[2] != undefined) {
                            // Imag3 = agri_files_image[2].file_path
                            Imag3 =  getDycryptedImage(
                              agri_files_image[2].file_path?.content,
                              agri_files_image[2].file_path?.iv,
                            );
                        } else {
                            Imag3 = "";
                        }
                        if (agri_files_mp3[0] != undefined) {
                            // audio1 = agri_files_mp3[0].file_path;
                            audio1 =  getDycryptedImage(
                              agri_files_mp3[0].file_path?.content,
                              agri_files_mp3[0].file_path?.iv,
                            );
                        } else {
                            audio1 = "";
                        }
                        if (agri_files_mp3[1] != undefined) {
                            // audio2 = agri_files_mp3[1].file_path;
                            audio2 =  getDycryptedImage(
                              agri_files_mp3[1].file_path?.content,
                              agri_files_mp3[1].file_path?.iv,
                            );
                        } else {
                            audio2 = "";
                        }
                        if (agri_files_mp3[2] != undefined) {
                            // audio3 = agri_files_mp3[2].file_path;
                            audio3 =  getDycryptedImage(
                              agri_files_mp3[2].file_path?.content,
                              agri_files_mp3[2].file_path?.iv,
                            );
                        } else {
                            audio3 = "";
                        }
                    }
                    setSelectedRecord({ firstItemRecord: audio1, secondItemRecord: audio2, thirdItemRecord: audio3 });
                    setSelectedImage({ firstItem: Imag1, secondItem: Imag2, thirdItem: Imag3 })
                    setIsLoading(false)
                }
            }
        }
    }
    const HandlerGoBack = () => {
        navigation.navigate('ProblemList');
    }
    useEffect(() => {
        if (isFocused) {
            onPageLoad();
        }
    }, [route.params, isFocused]);
    const handleBackPress = () => { navigation.navigate('ProblemList'); return true; }
    useFocusEffect(
        useCallback(() => {
            onBackPress(handleBackPress);
        }, [route.params, isFocused])
    );
    const soundPlay = async (path) => {
        SPSheet.show({
            component: () => <AudioPlayerView path={path} />,
            dragFromTopOnly: true,
            onCloseComplete: () => { },
            onOpenComplete: () => { },
            height: 260
        });
    }
    return (
      <Root>
        {isLoading ? (
          <View style={styles.LoadingScreen}>
            <LoadingScreen />
          </View>
        ) : null}
        <CustomHeader
          path="ProblemList"
          HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />
        <FormsTitle title={t('plot_and_crop_problem')} />
        <ScrollView>
          <View>
            {/* {
                        farmerProblem && farmerProblem?.agri_user ? */}
            <View style={styles.container}>
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{t('farmer_name')}</Text>
                <Text style={styles.itemTitle}>
                  : {farmerProblem?.agri_user?.userName}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{t('farmer_number')}</Text>
                <Text style={styles.itemTitle}>
                  : {farmerProblem?.agri_user?.contactNumber}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{t('enter_problem_title')}</Text>
                <Text style={styles.itemTitle}>
                  : {farmerProblem?.question_title}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{t('question_details')}</Text>
                <Text style={styles.itemTitle}>
                  : {farmerProblem?.question_desc}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{t('plot')}</Text>
                <Text style={styles.itemTitle}>
                  : {farmerProblem?.agri_user?.userName}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{t('addcrop_croptype')}</Text>
                <Text style={styles.itemTitle}>
                  :{' '}
                  {farmerProblem?.agri_land_user_rel &&
                    farmerProblem?.agri_land_user_rel?.plot_no}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{t('crop_name')}</Text>
                <Text style={styles.itemTitle}>
                  : {farmerProblem?.crop_name && farmerProblem?.crop_name?.name}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{t('crop_veriety')}</Text>
                <Text style={styles.itemTitle}>
                  :{' '}
                  {farmerProblem?.crop_variety &&
                    farmerProblem?.crop_variety?.name}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{t('growth_stage')}</Text>
                <Text style={styles.itemTitle}>
                  :{' '}
                  {farmerProblem?.growth_stage &&
                    farmerProblem?.growth_stage?.name}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{t('affect_date')}</Text>
                <Text style={styles.itemTitle}>
                  : {farmerProblem?.affected_date ?? ''}
                </Text>
              </View>
              <View style={styles.itemPhoto}>
                <TakePhoto
                  openImagePicker={openImagePicker}
                  selectedImage={selectedImage}
                  title={t('view_phote')}
                />
              </View>
              <View style={{marginHorizontal: 20}}>
                <Text style={styles.title}>{t('listen_to_the_problem')}</Text>
                <View style={styles.photoContainer}>
                  {selectedRecord.firstItemRecord != '' ? (
                    <TouchableOpacity
                      onPress={() => soundPlay(selectedRecord.firstItemRecord)}>
                      <Image
                        source={require('../../Common/images/play.png')}
                        style={{width: 70, height: 70}}
                      />
                    </TouchableOpacity>
                  ) : (
                    <Image
                      source={require('../../Common/images/microphone.png')}
                      style={{width: 70, height: 70, opacity: 0.7}}
                    />
                  )}
                  {selectedRecord.secondItemRecord != '' ? (
                    <TouchableOpacity
                      onPress={() =>
                        soundPlay(selectedRecord.secondItemRecord)
                      }>
                      <Image
                        source={require('../../Common/images/play.png')}
                        style={{width: 70, height: 70}}
                      />
                    </TouchableOpacity>
                  ) : (
                    <Image
                      source={require('../../Common/images/microphone.png')}
                      style={{width: 70, height: 70, opacity: 0.7}}
                    />
                  )}
                  {selectedRecord.thirdItemRecord != '' ? (
                    <TouchableOpacity
                      onPress={() => soundPlay(selectedRecord.thirdItemRecord)}>
                      <Image
                        source={require('../../Common/images/play.png')}
                        style={{width: 70, height: 70}}
                      />
                    </TouchableOpacity>
                  ) : (
                    <Image
                      source={require('../../Common/images/microphone.png')}
                      style={{width: 70, height: 70, opacity: 0.7}}
                    />
                  )}
                </View>
              </View>
            </View>

            {/* } */}
            {btnColor === 2 ? (
              <View style={styles.commentsContainer}>
                <TextInput
                  multiline={true}
                  numberOfLines={4}
                  style={[styles.textarea, {color: '#000'}]}
                  value={comment1}
                  onChangeText={item => setComment1(item)}
                />
                <TouchableOpacity onPress={() => saveCommet()}>
                  <Text
                    style={[
                      styles.btn,
                      {backgroundColor: '#023a02', color: '#FFF', fontSize: 10},
                    ]}>
                    {t('add_comments')}
                  </Text>
                </TouchableOpacity>
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
                          {t('date')} : {formatDateToMMDDYYYY(value.created_at)}
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
              <View style={styles.AnsContainer}>
                {commentImages
                  ? commentImages.map((value, index) => {
                      return (
                        <View style={styles.AnsItem} key={index}>
                          <View style={{width: '20%'}}>
                            {value.agri_user?.agri_files.length > 0 ? (
                              value.agri_user?.agri_files.map(
                                (value1, index1) =>
                                  value1.term_type === '1' && (
                                    <View key={index1}>
                                      {value1.file_path != '' ? (
                                        <ImagePlaceHolderCircleWithoutAddButton
                                          imageurl={{
                                            uri: value1.decrypted_path,
                                          }}
                                        />
                                      ) : (
                                        <Image
                                          source={{uri: value1.decrypted_path}}
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
                            {value.agri_user?.agri_files.forEach(element => {
                              <Text style={styles.AnsTitle}>{element}</Text>;
                            })}
                            <Text style={styles.AnsTitle}>
                              {value.agri_user?.userName}
                              {value.agri_user?.userType === 3 ? (
                                <Text>({t('retailer')})</Text>
                              ) : (
                                <Text>({t('login_farmer')})</Text>
                              )}
                            </Text>
                            <Text style={styles.AnsTitle}>
                              {value.comment_content}
                            </Text>
                            <Text style={styles.AnsTitle}>
                              {formatDateToMMDDYYYY(value.CreateDateTime)}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  : ''}
              </View>
            )}
          </View>
        </ScrollView>
      </Root>
    );
}
export default ViewProblem

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '2%',
        backgroundColor: '#FFF',
        borderRadius: 8
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginVertical: 10
    },
    itemPhoto: {

        marginLeft: 20,

    },
    itemTitle: {
        width: '50%',
        color: '#000',
        fontFamily: 'Poppins-Regular'
    },
    photoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10
    },
    title: {
        color: '#000',
        fontFamily: 'Poppins-Regular'
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10
    },
    btn: {
        // width: '40%',
        padding: 15,
        borderRadius: 10
    },
    btnTitle: {
        textAlign: 'center',
        color: '#000000',
        fontFamily: 'Poppins-Regular'
    },
    btnTitleActive: {
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Poppins-Regular'
    },
    btnActive: {
        backgroundColor: '#023a02',
        width: '40%',
        padding: 15,
        borderRadius: 10,
        fontFamily: 'Poppins-Regular'
    },
    commentsContainer: {
        marginHorizontal: '2%',
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    textarea: {
        borderWidth: 0.5,
        width: '70%',
        borderRadius: 10,
        backgroundColor: '#FFF'
    },
    AnsContainer: {
        backgroundColor: '#FFF',
        padding: 8, borderRadius: 10, elevation: 5,
        marginHorizontal: '2%',
    },
    AnsItem: {
        flexDirection: 'row', alignItems: 'center',
        marginBottom: 10
    },
    AnsTextContainer: {
        marginHorizontal: '5%',
        borderBottomWidth: 0.5,
        width: '75%',
        marginRight: 50,
        borderColor: 'green'
    },
    AnsTitle: {
        color: '#000',
        marginBottom: 7,
        fontFamily: 'Poppins-Regular'
    },
    LoadingScreen: {
        position: 'absolute',
        top: '52%',
        left: '45%',
        zIndex: 9999
    }
})