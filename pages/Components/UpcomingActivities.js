import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, {useState, memo} from 'react';
import ImageForm from '../Common/ImageForm';
import ImagePlaceHolderCircleWithoutAddButton from '../Common/ImagePlaceHolderCircleWithoutAddButton';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

const UpcomingActivities = ({uiState, t, loginUserData, dashboardType}) => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Upcoming');

  const [upcomingActivities, setUpcomingActivities] = useState([
    {
      id: 1,
      title: 'Fertilizer Spray',
      date: '2025-11-22',

      status: 'Pending',
    },
    {
      id: 2,
      title: 'Pipe Installation',
      date: '2025-11-28',

      status: 'Upcoming',
    },
    {
      id: 3,
      title: 'Coming soon...',
      date: '2025-11-22',
      status: 'Upcoming',
    },
  ]);

  const [pendingActivities, setPendingActivities] = useState([
    {
      id: 1,
      title: 'Soil Testing',
      date: '2025-11-20',
      status: 'Pending',
    },
    {
      id: 2,
      title: 'Weed Control',
      date: '2025-11-25',
      status: 'Pending',
    },
    {
      id: 3,
      title: 'Equipment Maintenance',
      date: '2025-11-30',
      status: 'Pending',
    },
  ]);

  const getUserRoleText = () => {
    if (!loginUserData) return '';

    const userRole = loginUserData.user_role?.role_name;

    if (
      userRole &&
      (userRole.toLowerCase() === 'admin' ||
        userRole.toLowerCase() === 'supervisor' ||
        userRole.toLowerCase() === 'agent')
    ) {
      return 'Supervisor';
    } else {
      return 'Farmer';
    }
  };
  const handlePlusButtonPress = () => {
    if (activeTab === 'Upcoming') {
      if (dashboardType === 'Supervisor') {
        navigation.navigate('UpcomingActivity');
      } else {
        navigation.navigate('FarmerUpcomingActivity');
      }
    } else {
      if (dashboardType === 'Supervisor') {
        navigation.navigate('PendingActivity');
      } else {
        navigation.navigate('FarmerPendingActivity');
      }
    }
  };

  const renderActivityItem = ({item}) => (
    <View style={styles.activityItem}>
      <View style={styles.activityIndicator} />
      <View style={styles.activityDetails}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <View style={styles.activityMeta}>
          <Text style={styles.activityDate}>
            {moment(item.date).format('MMM D, YYYY')}
          </Text>
        </View>
      </View>
    </View>
  );
  const currentActivities =
    activeTab === 'Upcoming' ? upcomingActivities : pendingActivities;
  return (
    <ScrollView>
      <View style={styles.mainProfileContainer}>
        <ImageForm
          source={require('../Common/images/dashboard.jpeg')}
          resizeMode="stretch"
          height={200}
          width={'100%'}
          style={{borderRadius: 10}}
        />
        <View style={styles.greenOverlay} />
        <View style={styles.userTitleOverlay}>
          <View style={styles.profileDetails}>
            <View style={styles.profileBackView}>
              {uiState?.profileImg ? (
                <ImagePlaceHolderCircleWithoutAddButton
                  imageurl={{uri: uiState?.profileImg}}
                  style={{width: 110, height: 110, borderRadius: 75}}
                />
              ) : (
                <ImagePlaceHolderCircleWithoutAddButton
                  imageurl={require('../Common/images/avatar1.png')}
                  style={{width: 110, height: 110, borderRadius: 75}}
                />
              )}
            </View>
            <View style={styles.userDetails}>
              <Text
                style={styles.userTitle}
                numberOfLines={1}
                ellipsizeMode="tail">
                {uiState.userName}
              </Text>
              <Text style={styles.userRole}>{dashboardType}</Text>
              {/* {companyName && (
                      <Text style={styles.companyName}>{t(companyName)}</Text>
                    )} */}
            </View>
          </View>
          <View style={styles.upcomingActivitiesContainer}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'Upcoming' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('Upcoming')}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'Upcoming' && styles.activeTabText,
                  ]}>
                  Upcoming
                </Text>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'Upcoming' && styles.activeTabText,
                  ]}>
                  Activity
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'Pending' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('Pending')}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'Pending' && styles.activeTabText,
                  ]}>
                  Pending
                </Text>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'Pending' && styles.activeTabText,
                  ]}>
                  Activity
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.plusButton}
                onPress={handlePlusButtonPress}>
                <MaterialIcons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={currentActivities}
              keyExtractor={item => item.id.toString()}
              renderItem={renderActivityItem}
              // contentContainerStyle={styles.activitiesListContainer}
              maxToRenderPerBatch={8}
              windowSize={5}
              initialNumToRender={6}
              updateCellsBatchingPeriod={50}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainProfileContainer: {
    // flex: 1,
    // marginVertical: 10,
    marginHorizontal: 15,

    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    // flexDirection: 'row',
    // backgroundColor: 'red',
    // marginTop: 30,
  },
  profileDetails: {
    flex: 0.45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 47, 27, 0.5)',
    height: '100%',
  },
  profileBackView: {
    width: 100,
    height: 100,
    borderRadius: 90,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 1000,
    // marginRight: 30,
  },
  dp: {
    width: '100%',
    height: 100,
    borderRadius: 75,
  },
  userDetails: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  userTitleOverlay: {
    position: 'absolute',
    // top: 20,
    // left: 10,
    height: 200,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  upcomingActivitiesContainer: {
    flex: 0.55,
    backgroundColor: 'rgba(0, 0, 0, 0.37)',
    // padding: 10,
    // justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  upcomingActivitiesTitle: {
    fontSize: 14,
    color: 'white',
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
    // marginLeft: 18,
    // marginTop: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    alignSelf: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 62,
    alignSelf: 'center',
    justifyContent: 'center',
    // marginBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: 'white',
  },
  activityIndicator: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginLeft: 5,
  },
  activityDetails: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 12.5,
    color: '#e3fae7',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
    // marginLeft: 20,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityDate: {
    fontSize: 12,
    color: '#e3f3fa',
    fontFamily: 'Poppins-Regular',
    // marginLeft: 20,
  },
  userTitle: {
    fontSize: 13,
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'left',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: 'white',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Poppins-SemiBold',
  },
  activeTabText: {
    color: 'white',
  },
  plusButton: {
    paddingTop: 8,
    paddingRight: 5,
  },
  // activityItem: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   alignSelf: 'center',
  //   justifyContent: 'center',
  //   borderBottomWidth: 0.5,
  //   borderBottomColor: 'white',
  //   paddingVertical: 8,
  // },
  activityIndicator: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginLeft: 5,
  },
  activityDetails: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityDate: {
    fontSize: 11.5,
    color: '#e3f3fa',
    fontFamily: 'Poppins-Regular',
  },
  userRole: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: 2,
  },
  activityText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
});
export default memo(UpcomingActivities);
