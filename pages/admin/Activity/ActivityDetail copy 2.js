import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions
} from 'react-native';
import React, { useContext, useState, useEffect, lazy } from 'react';
import { userCreateContext } from '../../Context/usersCreateContext';
import { Colors } from '../../utils/Constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const InputTextForm = lazy(() => import('../../Common/InputTextForm'));
const TakePhoto = lazy(() => import('./TakePhoto'));
const RecordComp = lazy(() => import('./RecordComp'));
import { formatDateToDateName } from '../../Common/DateChanger';

const { width } = Dimensions.get('window');

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
    navigationBarHeight
  } = useContext(userCreateContext);

  const { dbname, lan_id, token, user_id } = loginUser_data || {};
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

        const agri_files_image = farmerFound?.agri_files.filter(function (v, i) {
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

        if (PipeListDetailsRes?.status == 200) {
          setCarbonActivity(PipeListDetailsRes?.data?.data?.rows);
        }
      } else {
        setCarbonActivity([]);
      }

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
  };

  const soundPlay = async path => {
    SPSheet.show({
      component: () => <AudioPlayerView path={path} />,
      dragFromTopOnly: true,
      onCloseComplete: () => { },
      onOpenComplete: () => { },
      height: 260,
    });
  };

  useEffect(() => {
    onPageLoad();
  }, []);

  const openImagePicker = item => { };

  const SectionHeader = ({ title, icon, color }) => (
    <View style={[styles.sectionHeader, { borderLeftColor: color }]}>
      <Icon name={icon} size={22} color={color} />
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
    </View>
  );

  const InfoCard = ({ children, style }) => (
    <View style={[styles.infoCard, style]}>
      {children}
    </View>
  );

  const renderCarbonActivity = ({ item }) => (
    <View style={styles.carbonActivityCard}>
      <View style={styles.carbonActivityHeader}>
        <Icon name="precision-manufacturing" size={20} color={Colors.primary} />
        <Text style={styles.carbonActivityTitle}>
          Instrument Name: {item?.pipe_name}
        </Text>
      </View>

      {item?.pipeFiles.length != 0 && (
        <View style={styles.pipeImagesContainer}>
          {item.pipeFiles?.[0]?.file_path && (
            <Image
              source={{ uri: item.pipeFiles[0].file_path }}
              style={styles.pipeImage}
              resizeMode="cover"
            />
          )}
          {item.pipeFiles?.[1]?.file_path && (
            <Image
              source={{ uri: item.pipeFiles[1].file_path }}
              style={styles.pipeImage}
              resizeMode="cover"
            />
          )}
        </View>
      )}
    </View>
  );

  return (
    <Root>
      <SafeAreaView style={styles.container}>
        {/* Enhanced Custom Header */}
        {/* <LinearGradient
          colors={[Colors.primary || '#4CAF50', Colors.primaryDark || '#388E3C']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('activity_details')}</Text>
            <View style={styles.headerIcon}>
              <Icon name="agriculture" size={24} color="#FFF" />
            </View>
          </View>
        </LinearGradient> */}
        <CustomHeader t={t} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Farmer Information Section */}
          <SectionHeader
            title={t('farmer_information')}
            icon="person"
            color={Colors.primary || '#4CAF50'}
          />

          <InfoCard>
            <InputTextForm
              label={t('farmer_name')}
              value={farmerActivity?.userName}
              editable={false}
              leftIcon="person"
            />
            <InputTextForm
              label={t('farmer_number')}
              value={farmerActivity?.contactNumber}
              editable={false}
              leftIcon="phone"
            />
          </InfoCard>

          {/* Activity Information Section */}
          {farmerActivity?.cropActivitycategoryName != '' &&
            farmerActivity?.cropActivitycategoryName != null && (
              <>
                <SectionHeader
                  title={t('activity_information')}
                  icon="assignment"
                  color={Colors.secondary || '#FF9800'}
                />

                <InfoCard>
                  <InputTextForm
                    label={t('activity_type')}
                    value={farmerActivity?.activitycategoryName?.categoryName}
                    editable={false}
                    leftIcon="category"
                  />

                  {farmerActivity?.cropActivitycategoryName != null && (
                    <InputTextForm
                      label={t('activity_name')}
                      value={`${farmerActivity?.cropActivitycategoryName?.activity?.categoryName} ${formatDateToDateName(farmerActivity?.act_start_date)} - ${formatDateToDateName(farmerActivity?.act_to_date)}`}
                      editable={false}
                      leftIcon="event"
                    />
                  )}
                </InfoCard>

                {/* Activity Summary Card */}
                <LinearGradient
                  colors={['#E3F2FD', '#BBDEFB']}
                  style={styles.activitySummaryCard}
                >
                  <View style={styles.activitySummaryContent}>
                    <View style={styles.activityDetails}>
                      <View style={styles.activityDetailSection}>
                        <Text style={styles.activityLabel}>{t('activity_description1')}</Text>
                        <Text style={styles.activityValue}>
                          {farmerActivity?.cropActivitycategoryName?.activity?.categoryName || ''}
                        </Text>
                      </View>

                      <View style={styles.activityDetailSection}>
                        <Text style={styles.activityLabel}>{t('activity_date')}</Text>
                        <View style={styles.dateContainer}>
                          <Text style={styles.activityValue}>
                            {formatDateToDateName(farmerActivity?.act_start_date)}
                          </Text>
                          <Text style={styles.dateSeparator}>to</Text>
                          <Text style={styles.activityValue}>
                            {formatDateToDateName(farmerActivity?.act_to_date)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.logoContainer}>
                      <LinearGradient
                        colors={[Colors.primary || '#4CAF50', Colors.primaryDark || '#388E3C']}
                        style={styles.logoGradient}
                      >
                        <Icon name="eco" size={30} color="#FFF" />
                      </LinearGradient>
                    </View>
                  </View>
                </LinearGradient>
              </>
            )}

          {/* Field & Crop Information */}
          <SectionHeader
            title={t('field_crop_information')}
            icon="grass"
            color={Colors.accent || '#8BC34A'}
          />

          <InfoCard>
            <InputTextForm
              label={t('reg_plot_name')}
              value={farmerActivity?.plot_no}
              editable={false}
              leftIcon="place"
            />
            <InputTextForm
              label={t('crop_name')}
              value={farmerActivity?.cropName}
              editable={false}
              leftIcon="eco"
            />
            <InputTextForm
              label={t('growth_stage')}
              value={farmerActivity?.growthStage}
              editable={false}
              leftIcon="trending-up"
            />
            <InputTextForm
              label={t('act_per_date')}
              value={formatDateToDateName(farmerActivity?.act_perform_date)}
              editable={false}
              leftIcon="schedule"
            />
          </InfoCard>

          {/* Carbon Activity List */}
          {carbonActivity.length != 0 && (
            <>
              <SectionHeader
                title={t('carbon_activities')}
                icon="precision-manufacturing"
                color={Colors.warning || '#FF5722'}
              />
              <FlatList
                scrollEnabled={false}
                data={carbonActivity}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderCarbonActivity}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}

          {/* Resource Usage */}
          <SectionHeader
            title={t('resource_usage')}
            icon="settings"
            color={Colors.info || '#2196F3'}
          />

          <InfoCard>
            <InputTextForm
              label={t('your_comm_')}
              value={farmerActivity.act_desc}
              editable={false}
              leftIcon="comment"
              multiline={true}
            />
            <InputTextForm
              label={t('material_used')}
              value={farmerActivity.material_used}
              editable={false}
              leftIcon="build"
            />
            <InputTextForm
              label={t('water_used')}
              value={farmerActivity.water_used}
              editable={false}
              leftIcon="water-drop"
            />
            <InputTextForm
              label={t('power_used')}
              value={farmerActivity.power_used}
              editable={false}
              leftIcon="power"
            />
          </InfoCard>

          {/* Media Section */}
          {carbonActivity.length == 0 && (
            <>
              <SectionHeader
                title={t('media_documentation')}
                icon="perm-media"
                color={Colors.error || '#F44336'}
              />

              <InfoCard>
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
              </InfoCard>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Root>
  );
};

export default ActivityDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // Header Styles
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },

  // Info Card
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },

  // Activity Summary Card
  activitySummaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  activitySummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityDetails: {
    flex: 1,
    marginRight: 16,
  },
  activityDetailSection: {
    marginBottom: 16,
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 4,
  },
  activityValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'column',
  },
  dateSeparator: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 2,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  // Carbon Activity Card
  carbonActivityCard: {
    backgroundColor: '#FFF',
    elevation: 3,
    padding: 16,
    margin: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  carbonActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  carbonActivityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  pipeImagesContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  pipeImage: {
    width: 80,
    height: 90,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
});

// Enhanced Colors object (add this to your Constants file)
const EnhancedColors = {
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  secondary: '#FF9800',
  accent: '#8BC34A',
  warning: '#FF5722',
  info: '#2196F3',
  error: '#F44336',
  background: '#FFFFFF',
  background_light: '#F5F7FA',
  border: '#E0E7FF',
  text_primary: '#333333',
  text_secondary: '#666666',
};