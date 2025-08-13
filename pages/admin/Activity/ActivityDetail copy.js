import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import React, {useState, useEffect, useCallback, useContext} from 'react';
import InputTextForm from '../../Common/InputTextForm';
import TakePhoto from './TakePhoto';
import RecordComp from './RecordComp';
import {useNavigation, useRoute} from '@react-navigation/native';
import {formatDateToDateName} from '../../Common/DateChanger';
import FormsTitle from '../../Common/FormsTitle';
import AudioPlayerView from '../../Common/AudioPlayerView';
import {userCreateContext} from '../../Context/usersCreateContext';
import {PipeListDetails} from '../../../config/apiHere';
const ActivityDetail = () => {
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
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(false);
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
  const [carbonActivity, setCarbonActivity] = useState([]);
  const openImagePicker = item => {};
  const onPageLoad = async () => {
    const activityData = await getItem('activity_Data');
    if (activityData) {
      const farmerFound = route.params;
      setIsLoading(false);
      if (farmerFound?.agri_files) {
        let Imag1 = '';
        let Imag2 = '';
        let Imag3 = '';
        let audio1 = '';
        let audio2 = '';
        let audio3 = '';
        const agri_files_image = farmerFound?.agri_files.filter(function (
          v,
          i,
        ) {
          return v['file_ext'] == 'image/jpeg';
        });
        const agri_files_mp3 = farmerFound?.agri_files.filter(function (v, i) {
          return v['file_ext'] == 'audio/mp3';
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
      setIsLoading(false);
      if (farmerFound?.type == 'carbon_activity') {
        const PipeListDetailsRes = await PipeListDetails(
          dbname,
          lan_id,
          token,
          user_id,
          farmerFound.plot_id,
          farmerFound?.act_master_id,
          farmerFound?.cu_rel_fid,
        );
        // console.log('PipeListDetailsRes==', PipeListDetailsRes);
        if (PipeListDetailsRes?.status == 200) {
          setCarbonActivity(PipeListDetailsRes?.data?.data?.rows);
        }
      } else {
        if (farmerFound?.agri_files) {
          let Imag1 = '';
          let Imag2 = '';
          let Imag3 = '';
          let audio1 = '';
          let audio2 = '';
          let audio3 = '';
          const agri_files_image = farmerFound?.agri_files.filter(function (
            v,
            i,
          ) {
            return v['file_ext'] == 'image/jpeg';
          });
          const agri_files_mp3 = farmerFound?.agri_files.filter(function (
            v,
            i,
          ) {
            return v['file_ext'] == 'audio/mp3';
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
        setCarbonActivity([]);
      }
      console.log('farmerFound=', JSON.stringify(farmerFound));

      setfarmerActivity({
        ...farmerActivity,
        userName: farmerFound?.agri_user?.userName,
        contactNumber: farmerFound?.agri_user?.contactNumber,
        activitycategoryName: farmerFound?.typeActivity,
        cropActivitycategoryName: farmerFound?.cropActivity,
        plot_no: farmerFound?.land_info?.plot_no,
        cropName: farmerFound?.cropName?.name,
        growthStage: farmerFound?.growthStage?.name,
        act_perform_date: farmerFound?.updatedAt,
        act_desc: farmerFound?.act_desc,
        material_used: farmerFound?.material_used,
        water_used: farmerFound?.water_used,
        power_used: farmerFound?.power_used,
        act_start_date: farmerFound?.act_start_date,
        act_to_date: farmerFound?.act_to_date,
      });
    }
    useEffect(() => {
      onPageLoad();
      onBackPress(() => {
        navigation.navigate('activityList');
        return true;
      });
    }, []);
    const HandlerGoBack = () => navigation.navigate('activityList');
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
      <Root>
        {isLoading ? (
          <LoadingScreen />
        ) : (
          <View style={styles.container}>
            <CustomHeader
              path="activityList"
              HandlerGoBack={HandlerGoBack}
              logoImage={logoImage}
              topBanner={topBanner}
            />
            <FormsTitle title={t('act_detail_')} />
            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}>
              {farmerActivity ? (
                <View style={styles.fromContainer}>
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
                  {farmerActivity?.cropActivitycategoryName != '' &&
                  farmerActivity?.cropActivitycategoryName != null ? (
                    <>
                      <InputTextForm
                        label={t('activity_type')}
                        value={
                          farmerActivity?.activitycategoryName?.categoryName
                        }
                        editable={false}
                      />
                      {farmerActivity?.cropActivitycategoryName != null ? (
                        <InputTextForm
                          label={t('activity_name')}
                          value={`${
                            farmerActivity?.cropActivitycategoryName?.activity
                              ?.categoryName
                          } ${formatDateToDateName(
                            farmerActivity?.act_start_date,
                          )} - ${formatDateToDateName(
                            farmerActivity?.act_to_date,
                          )}`}
                          editable={false}
                        />
                      ) : null}
                      <View style={styles.activityContainer}>
                        <View
                          style={{
                            width: '25%',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={[styles.title, {fontWeight: 'bold'}]}>
                            {t('activity_description1')}
                          </Text>
                          <Text style={[styles.title, {fontWeight: 'bold'}]}>
                            {t('activity_date')}
                          </Text>
                        </View>
                        <View style={[styles.activityWrapper, {width: '45%'}]}>
                          <Text style={[styles.title]}>
                            {farmerActivity?.cropActivitycategoryName != null
                              ? farmerActivity?.cropActivitycategoryName
                                  ?.activity?.categoryName
                              : ''}
                          </Text>
                          <View
                            style={[styles.title, {flexDirection: 'column'}]}>
                            <Text style={{color: '#000'}}>
                              {formatDateToDateName(
                                farmerActivity?.act_start_date,
                              )}
                            </Text>
                            <Text style={{color: '#000'}}>
                              -
                              {formatDateToDateName(
                                farmerActivity?.act_to_date,
                              )}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            justifyContent: 'center',
                            elevation: 5,
                            backgroundColor: '#FFF',
                            padding: 5,
                            borderRadius: 10,
                          }}>
                          <Image
                            source={require('../../Common/images/logo.png')}
                            style={{
                              width: 100,
                              height: 60,
                              resizeMode: 'cover',
                            }}
                          />
                        </View>
                      </View>
                    </>
                  ) : (
                    ''
                  )}
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
                  {carbonActivity.length != 0 && (
                    <FlatList
                      scrollEnabled={false}
                      data={carbonActivity}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={_item => {
                        return (
                          <View
                            style={{
                              backgroundColor: '#FFF',
                              elevation: 3,
                              padding: 10,
                              margin: 2,
                              marginVertical: 10,
                              borderRadius: 10,
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                marginBottom: 7,
                              }}>
                              <Text
                                style={[styles.title, {paddingVertical: 0}]}>
                                Instrument Name :
                              </Text>
                              <Text
                                style={[
                                  styles.title,
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
                                    <Image
                                      source={{
                                        uri: `${_item.item?.pipeFiles?.[0]?.file_path}`,
                                      }}
                                      style={{
                                        width: 70,
                                        height: 80,
                                        borderRadius: 5,
                                      }}
                                      resizeMode="contain"
                                    />
                                  )}
                                  {_item.item.pipeFiles?.[1]?.file_path !=
                                    undefined && (
                                    <Image
                                      source={{
                                        uri: `${_item.item.pipeFiles?.[1]?.file_path}`,
                                      }}
                                      style={{
                                        width: 70,
                                        height: 80,
                                        borderRadius: 5,
                                      }}
                                      resizeMode="contain"
                                    />
                                  )}
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      }}
                    />
                  )}
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
        )}
      </Root>
    );
  };
};
export default ActivityDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfcf6',
  },
  titleContainer: {
    marginHorizontal: '2.5',
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  title: {
    color: '#000',
    paddingVertical: 10,
  },
  fromContainer: {
    marginHorizontal: '2.5%',
  },
  activityContainer: {
    flexDirection: 'row',
    width: '100%',
    borderWidth: 0.5,
    borderRadius: 5,
    padding: 8,
    backgroundColor: '#FFF',
    marginVertical: 12,
    paddingHorizontal: 5,
  },
  activityWrapper: {
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '35%',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
});
