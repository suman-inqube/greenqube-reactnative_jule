import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import React, { useState, useEffect, useContext, useMemo } from 'react';
import InputTextForm from '../../Common/InputTextForm';
import TakePhoto from './TakePhoto';
import RecordComp from './RecordComp';
import { useRoute } from '@react-navigation/native';
import { formatDateToDateName } from '../../Common/DateChanger';
import AudioPlayerView from '../../Common/AudioPlayerView';
import { userCreateContext } from '../../Context/usersCreateContext';
import { PipeListDetails } from '../../../config/apiHere';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
const ActivityDetail = () => {
  const {
    LoadingScreen,
    CustomHeader,
    t,
    logoImage,
    topBanner,
    Root,
    SPSheet,
    loginUser_data,
  } = useContext(userCreateContext);
  const { dbname, lan_id, token, user_id } = loginUser_data || {};
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState({
    firstItem: '',
    secondItem: '',
    thirdItem: '',
  });
  const [farmerActivity, setfarmerActivity] = useState({
    cropActivity: '',
    typeActivity: '',
    userName: '',
    contactNumber: '',
    activitycategoryName: '',
    cropActivitycategoryName: '',
    plot_no: '',
    cropName: '',
    growthStage: '',
    act_perform_date: '',
    act_desc: '',
    material_used: '',
    water_used: '',
    power_used: '',
  });
  const [selectedRecord, setSelectedRecord] = useState({
    firstItemRecord: '',
    secondItemRecord: '',
    thirdItemRecord: '',
  });
  const [allFiles, setAllFiles] = useState([]);
  const [carbonActivity, setCarbonActivity] = useState([]);
  const openImagePicker = item => { };
  const getFilePaths = (files, ext, max = 3) => {
    if (!files) return Array(max).fill('');
    return files
      .filter(f => f.file_ext === ext)
      .slice(0, max)
      .map(f => f.file_path)
      .concat(Array(max).fill(''))
      .slice(0, max);
  };

  const onPageLoad = async () => {
    try {
      const farmerFound = route.params;
      setIsLoading(true);

      let agriFiles = []; // Initialize agriFiles here

      if (farmerFound?.type == 'user_activity') {
        const activity_files = await axiosGet(
          ROUTES.GET.USER_ACTIVITY_DETAILS({uact_id: farmerFound.uact_id}),
          token,
          {information: `${dbname},${lan_id}`},
        );

        console.log('farmerFound', activity_files?.data?.rows[0]?.agri_files);

        // Extract files from API response
        agriFiles = activity_files?.data?.rows[0]?.agri_files || [];
      }

      // Move these lines outside the if block
      setAllFiles(agriFiles);

      const imageFiles = getFilePaths(agriFiles, 'image/jpeg', 3);
      const audioFiles = getFilePaths(agriFiles, 'audio/mp3', 3);

      setSelectedImage({
        firstItem: imageFiles[0],
        secondItem: imageFiles[1],
        thirdItem: imageFiles[2],
      });

      setSelectedRecord({
        firstItemRecord: audioFiles[0],
        secondItemRecord: audioFiles[1],
        thirdItemRecord: audioFiles[2],
      });

      if (farmerFound?.type === 'carbon_activity') {
        const PipeListDetailsRes = await PipeListDetails(
          dbname,
          lan_id,
          token,
          user_id,
          farmerFound.plot_id,
          farmerFound?.act_master_id,
          farmerFound?.cu_rel_fid,
        );
        if (PipeListDetailsRes?.status === 200) {
          setCarbonActivity(PipeListDetailsRes?.data?.data?.rows ?? []);
        }
      } else {
        setCarbonActivity([]);
      }

      setfarmerActivity(prev => ({
        ...prev,
        userName: farmerFound?.agri_user?.userName ?? '',
        contactNumber: farmerFound?.agri_user?.contactNumber ?? '',
        activitycategoryName: farmerFound?.typeActivity ?? '',
        cropActivitycategoryName: farmerFound?.cropActivity ?? '',
        plot_no: farmerFound?.land_info?.plot_no ?? '',
        cropName: farmerFound?.cropName?.name ?? '',
        growthStage: farmerFound?.growthStage?.name ?? '',
        act_perform_date: farmerFound?.updatedAt ?? '',
        act_desc: farmerFound?.act_desc ?? '',
        material_used: farmerFound?.material_used ?? '',
        water_used: farmerFound?.water_used ?? '',
        power_used: farmerFound?.power_used ?? '',
        act_start_date: farmerFound?.act_start_date ?? '',
        act_to_date: farmerFound?.act_to_date ?? '',
      }));
    } catch (err) {
      console.error('onPageLoad error:', err);
    } finally {
      setIsLoading(false);
    }
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
  const renderCustomHeader = useMemo(
    () => <CustomHeader logoImage={logoImage} topBanner={topBanner} t={t} />,
    [],
  );
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        {isLoading && (
          <View style={styles.loadingScreen}>
            <LoadingScreen />
          </View>
        )}
        <View style={styles.container}>
          {renderCustomHeader}
          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}>
            {farmerActivity ? (
              <View style={styles.fromContainer}>
                <View style={styles.inputContainer}>
                  <InputTextForm
                    label={t('farmer_name')}
                    value={farmerActivity?.userName}
                    editable={false}
                  />
                  <InputTextForm
                    label={t('farmer_number')}
                    value={farmerActivity?.contactNumber}
                    editable={false}
                  />
                </View>
                {farmerActivity?.cropActivitycategoryName != '' &&
                  farmerActivity?.cropActivitycategoryName != null ? (
                  <>
                    <View style={styles.inputContainer}>
                      <InputTextForm
                        label={t('activity_type')}
                        value={
                          farmerActivity?.activitycategoryName?.categoryName
                        }
                        editable={false}
                      />
                      <Text>
                        {
                          farmerActivity?.cropActivitycategoryName?.activity
                            ?.categoryName
                        }
                      </Text>
                      {farmerActivity?.cropActivitycategoryName != null ? (
                        <InputTextForm
                          label={t('activity_name')}
                          value={`${farmerActivity?.cropActivitycategoryName?.activity
                            ?.categoryName
                            } ${formatDateToDateName(
                              farmerActivity?.act_start_date,
                            )} - ${formatDateToDateName(
                              farmerActivity?.act_to_date,
                            )}`}
                          editable={false}
                        />
                      ) : null}

                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: '#f2faffff',
                          marginVertical: 8,
                          borderRadius: 20,
                          borderLeftWidth: 5,
                          borderLeftColor: Colors.borderGreen,
                          marginHorizontal: '2.5%',
                          marginBottom: 10,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.1,
                          shadowRadius: 8,
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
                            {farmerActivity?.cropActivitycategoryName != null
                              ? farmerActivity?.cropActivitycategoryName
                                ?.activity?.categoryName
                              : ''}
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
                          }}></View>
                      </View>
                    </View>
                  </>
                ) : (
                  ''
                )}
                <View style={styles.inputContainer}>
                  <InputTextForm
                    label={t('reg_plot_name')}
                    value={farmerActivity?.plot_no}
                    editable={false}
                  />
                  <InputTextForm
                    label={t('crop_name')}
                    value={farmerActivity?.cropName}
                    editable={false}
                  />
                  <InputTextForm
                    label={t('growth_stage')}
                    value={farmerActivity?.growthStage}
                    editable={false}
                  />
                  <InputTextForm
                    label={t('act_per_date')}
                    value={formatDateToDateName(
                      farmerActivity?.act_perform_date,
                    )}
                    editable={false}
                  />
                </View>
                {carbonActivity.length != 0 && (
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
                            // marginVertical: 10,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: Colors.border,
                            marginBottom: 15,
                            marginHorizontal: '3%',
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              marginBottom: 7,
                            }}>
                            <Text style={[styles.label, { paddingVertical: 0 }]}>
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
                              {_item?.item?.pipe_name}
                            </Text>
                          </View>
                          <View>
                            {/* <Text style={[styles.title,{paddingVertical:0}]}>Pipe Image</Text> */}
                            {_item?.item?.pipeFiles.length != 0 && (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  gap: 20,
                                }}>
                                {_item.item.pipeFiles?.[0]?.file_path !=
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
                )}
                <View style={styles.inputContainer}>
                  <InputTextForm
                    label={t('your_comm_')}
                    value={farmerActivity.act_desc}
                    editable={false}
                  />
                  <InputTextForm
                    label={t('material_used')}
                    value={farmerActivity.material_used}
                    editable={false}
                  />
                  <InputTextForm
                    label={t('water_used')}
                    value={farmerActivity.water_used}
                    editable={false}
                  />
                  <InputTextForm
                    label={t('power_used')}
                    value={farmerActivity.power_used}
                    editable={false}
                  />
                </View>
                {carbonActivity.length == 0 && (
                  <>
                    <TakePhoto
                      openImagePicker={openImagePicker}
                      selectedImage={selectedImage}
                      title={t('take_a_photo_optional')}
                    />
                    <RecordComp
                      selectedRecord={selectedRecord}
                      title={t('record_your_comment_optional')}
                      soundPlay={soundPlay}
                    />
                  </>
                )}
              </View>
            ) : (
              ''
            )}
          </ScrollView>
        </View>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};
export default ActivityDetail;

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
    // paddingTop: 10,
    // marginBottom: 30,

    backgroundColor: 'white',
    padding: 16,

    // elevation:1,
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
  inputContainer: { marginTop: '5%', marginHorizontal: 15 },
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  loadingScreen: {
    position: 'absolute',
    top: '45%',
    zIndex: 999,
    left: '45%',
  },
});
