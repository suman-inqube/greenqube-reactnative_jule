import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  FlatList,
} from 'react-native';
import React, {useState, useEffect, useCallback, useContext} from 'react';
import InputTextForm from '../../Common/InputTextForm';
import TakePhoto from './TakePhoto';
import RecordComp from './RecordComp';
import {useNavigation, useRoute} from '@react-navigation/native';
import AudioPlayerView from '../../Common/AudioPlayerView';
import {userCreateContext} from '../../Context/usersCreateContext';
import {PipeListDetails} from '../../../config/apiHere';
import {formatDateToDateName} from '../../Common/DateChanger';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';

const FarmerActivityDetail = () => {
  const route = useRoute();
  const {
    LoadingScreen,
    CustomHeader,
    t,
    onBackPress,
    getItem,
    logoImage,
    topBanner,
    Root,
    SPSheet,
    loginUser_data,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data || {};
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState({
    firstItem: '',
    secondItem: '',
    thirdItem: '',
  });
  const [farmerActivity, setfarmerActivity] = useState({});
  const [selectedRecord, setSelectedRecord] = useState({
    firstItemRecord: '',
    secondItemRecord: '',
    thirdItemRecord: '',
  });
  const openImagePicker = item => {};
  const [carbonActivity, setCarbonActivity] = useState([]);

  const onPageLoad = async () => {
    // const [activityData, uact_id_data] = await Promise.all([
    //   getItem('activity_Data'),
    //   getItem('uact_id_data'),
    // ]);

    const farmerFound = route.params;

    if (farmerFound?.type == 'carbon_activity') {
      const PipeListDetailsRes = await axiosGet(
        ROUTES.GET.PIPE_LIST_DETAILS({
          plot_id: farmerFound.plot_id,
          act_master_id: farmerFound?.act_master_id,
          cu_rel_id: farmerFound?.cu_rel_fid,
        }),
        token,
        {information: `${dbname},${lan_id},${user_id}`},
      );
      if (PipeListDetailsRes?.status == 200) {
        setCarbonActivity(PipeListDetailsRes?.data?.data?.rows);
      }
    }
    setIsLoading(false);
    if (farmerFound?.agri_files) {
      let Imag1 = '';
      let Imag2 = '';
      let Imag3 = '';
      let audio1 = '';
      let audio2 = '';
      let audio3 = '';
      let pic = 0;
      let aud = 0;
      for (let i = 0; i < farmerFound.agri_files.length; i++) {
        if (farmerFound.agri_files[i].term_type === 'ua_activity') {
          if (aud === 0) {
            audio1 = farmerFound.agri_files[i].file_path;
          } else if (aud === 1) {
            audio2 = farmerFound.agri_files[i].file_path;
          } else if (aud === 2) {
            audio3 = farmerFound.agri_files[i].file_path;
          }
          aud++;
        } else {
          if (pic === 0) {
            Imag1 = farmerFound.agri_files[i].file_path;
          } else if (pic === 1) {
            Imag2 = farmerFound.agri_files[i].file_path;
          } else if (pic === 2) {
            Imag3 = farmerFound.agri_files[i].file_path;
          }
          pic++;
        }
      }
      setSelectedImage({
        ...selectedImage,
        firstItem: Imag1,
        secondItem: Imag2,
        thirdItem: Imag3,
      });
      setSelectedRecord({
        firstItemRecord: audio1,
        secondItemRecord: audio2,
        thirdItemRecord: audio3,
      });
    }
    setfarmerActivity(farmerFound);
  };

  useEffect(() => {
    onPageLoad();
  }, []);

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
          <LoadingScreen />
        ) : (
          <View style={styles.container}>
            <CustomHeader
              path="FarmerActivityList"
              logoImage={logoImage}
              topBanner={topBanner}
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}>
              {farmerActivity ? (
                <View style={styles.fromContainer}>
                  {farmerActivity?.cropActivity != null ? (
                    <View style={styles.inputContainer}>
                      <InputTextForm
                        label={t('activity_type')}
                        value={farmerActivity?.typeActivity?.categoryName}
                        editable={false}
                      />
                      <InputTextForm
                        label={t('act_name')}
                        // value={
                        //   farmerActivity?.cropActivity &&
                        //   farmerActivity?.cropActivity?.activity?.categoryName
                        // }
                        value={`${
                          farmerActivity?.cropActivity?.activity?.categoryName
                        } ${formatDateToDateName(
                          farmerActivity?.act_start_date,
                        )} - ${formatDateToDateName(
                          farmerActivity?.act_to_date,
                        )}`}
                        editable={false}
                      />

                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: '#f2faffff',

                          marginVertical: 8,
                          borderRadius: 20,
                          borderLeftWidth: 5,
                          borderLeftColor: Colors.borderGreen,
                          // flexDirection: 'row',
                          // alignItems: 'center',
                          // marginBottom: 8,
                          // paddingHorizontal: 15,
                          marginHorizontal: '2.5%',
                          marginBottom: 10,
                          shadowColor: '#000',
                          shadowOffset: {width: 0, height: 4},
                          shadowOpacity: 0.1,
                          shadowRadius: 8,
                          // elevation: 4,
                          borderRightWidth: 1,
                          borderTopWidth: 1,
                          borderBottomWidth: 1,
                          borderRightColor: Colors.border,
                          borderTopColor: Colors.border,
                          borderBottomColor: Colors.border,
                        }}>
                        <Image
                          source={require('../../Common/images/logo.png')}
                          style={{
                            width: 100,
                            height: 80,
                            resizeMode: 'contain',
                          }}
                        />
                        <View style={styles.detailRow}>
                          <Text style={[styles.label]}>
                            {t('activity_description1')}
                          </Text>
                          <Text style={[styles.value]}>
                            {farmerActivity?.cropActivity &&
                              farmerActivity?.cropActivity?.activity?.description?.substring(
                                0,
                                100,
                              )}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={[styles.label]}>
                            {t('activity_date')}
                          </Text>
                          <Text style={[styles.value]}>
                            {formatDateToDateName(
                              farmerActivity?.act_start_date,
                            )}
                            {'    -    '}
                            <Text style={[styles.value]}>
                              {formatDateToDateName(
                                farmerActivity?.act_to_date,
                              )}
                            </Text>
                          </Text>
                        </View>
                        <View
                          style={{
                            // alignItems: 'center',
                            flexWrap: 'wrap',
                            width: '45%',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            marginLeft: 10,
                          }}>
                          {/* <Text style={[styles.title, {width: 150}]}>
                            {farmerActivity?.cropActivity &&
                              farmerActivity?.cropActivity?.activity?.description?.substring(
                                0,
                                100,
                              )}
                          </Text> */}
                          {/* <Text style={[styles.title]}>
                            {farmerActivity?.act_start_date}
                          </Text> */}
                          {/* <View
                            style={[
                              styles.title,
                              {flexDirection: 'column'},
                            ]}></View> */}
                        </View>
                      </View>
                    </View>
                  ) : (
                    ''
                  )}
                  <View style={styles.inputContainer}>
                    <InputTextForm
                      label={t('reg_plot_name')}
                      value={
                        farmerActivity?.land_info &&
                        farmerActivity?.land_info.plot_no
                      }
                      editable={false}
                    />

                    <InputTextForm
                      label={t('produce_name')}
                      value={
                        farmerActivity?.cropName &&
                        farmerActivity?.cropName?.name
                      }
                      editable={false}
                    />

                    <InputTextForm
                      label={t('growth_stage')}
                      value={
                        farmerActivity?.growthStage &&
                        farmerActivity?.growthStage?.name
                      }
                      editable={false}
                    />

                    <InputTextForm
                      label={t('act_per_date')}
                      value={farmerActivity?.act_perform_date}
                      editable={false}
                    />

                    <FlatList
                      scrollEnabled={false}
                      data={carbonActivity}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={_item => {
                        return (
                          <View
                            style={{
                              backgroundColor: '#e3f4ffcf',
                              // elevation: 3,
                              padding: 10,
                              margin: 2,
                              marginVertical: 10,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: Colors.border,
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                marginBottom: 7,
                              }}>
                              <Text
                                style={[styles.label, {paddingVertical: 0}]}>
                                Instrument Name :
                              </Text>
                              <Text
                                style={[
                                  styles.value,
                                  {
                                    marginLeft: 10,
                                    paddingVertical: 0,
                                  },
                                ]}>
                                {_item.item?.pipe_name}
                              </Text>
                            </View>
                            <View>
                              {/* <Text style={[styles.title,{paddingVertical:0}]}>Pipe Image</Text> */}
                              {_item.item?.pipeFiles.length != 0 && (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    gap: 20,
                                  }}>
                                  {_item.item?.pipeFiles?.[0]?.file_path !=
                                    undefined && (
                                    <View style={styles.imageContainer}>
                                      <Image
                                        source={{
                                          uri: `${_item.item?.pipeFiles?.[0]?.file_path}`,
                                        }}
                                        style={{
                                          width: 70,
                                          height: 80,
                                          borderRadius: 8,
                                        }}
                                        resizeMode="contain"
                                      />
                                    </View>
                                  )}
                                  {_item.item.pipeFiles?.[1]?.file_path !=
                                    undefined && (
                                    <View style={styles.imageContainer}>
                                      <Image
                                        source={{
                                          uri: `${_item.item.pipeFiles?.[1]?.file_path}`,
                                        }}
                                        style={{
                                          width: 70,
                                          height: 80,
                                          borderRadius: 8,
                                        }}
                                        resizeMode="contain"
                                      />
                                    </View>
                                  )}
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      }}
                    />

                    <InputTextForm
                      label={t('your_comm_')}
                      value={farmerActivity?.act_desc}
                      editable={false}
                    />
                    <InputTextForm
                      label={t('material_used')}
                      value={farmerActivity?.material_used}
                      editable={false}
                    />
                    <InputTextForm
                      label={t('water_used')}
                      value={farmerActivity?.water_used}
                      editable={false}
                    />
                    <InputTextForm
                      label={t('power_used')}
                      value={farmerActivity?.power_used}
                      editable={false}
                    />
                  </View>
                  {carbonActivity.length == 0 && (
                    <View style={{marginHorizontal: 20}}>
                      <TakePhoto
                        openImagePicker={openImagePicker}
                        selectedImage={selectedImage}
                        title={t('view_phote')}
                      />
                      <View style={{}}>
                        <Text style={styles.label}>
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
                          {selectedRecord.thirdItemRecord != '' ? (
                            <TouchableOpacity
                              onPress={() =>
                                soundPlay(selectedRecord.thirdItemRecord)
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
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                ''
              )}
            </ScrollView>
          </View>
        )}
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerActivityDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
  },
  titleContainer: {
    width: '95%',
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  title: {
    color: '#000',
    paddingVertical: 10,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  fromContainer: {
    marginTop: 50,

    marginHorizontal: '4%',
    borderWidth: 1,
    // paddingTop: 10,
    // marginBottom: 30,

    backgroundColor: 'white',
    // padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    // elevation:1,
    marginVertical: 10,
    marginHorizontal: '4%',
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
  },
  inputContainer: {marginTop: '5%', marginHorizontal: 15},
  detailRow: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    marginBottom: 5,
    // paddingHorizontal: 5,
    // paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'red',
    width: '100%',
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
    // flex: 1,
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    // flex: 1,
    // textAlign: 'right',
  },
  imageContainer: {
    backgroundColor: 'white',
    padding: 5, // Adjust padding as needed
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
});
