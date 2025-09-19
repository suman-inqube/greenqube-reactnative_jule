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
const UpcomingActivities = ({uiState, t}) => {
  const [upcomingActivities, setUpcomingActivities] = useState([
    {
      id: 1,
      title: 'Coming soon...',
      date: '2025-11-15',

      status: 'Pending',
    },
    {
      id: 2,
      title: 'Coming soon...',
      date: '2025-11-18',

      status: 'Upcoming',
    },
    {
      id: 3,
      title: 'Coming soon...',
      date: '2025-11-22',
      status: 'Upcoming',
    },
  ]);
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
              {/* {companyName && (
                      <Text style={styles.companyName}>{t(companyName)}</Text>
                    )} */}
            </View>
          </View>
          <View style={styles.upcomingActivitiesContainer}>
            <Text style={styles.upcomingActivitiesTitle}>
              {t('upcomming_act')}
            </Text>
            <FlatList
              data={upcomingActivities}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => (
                <View style={styles.activityItem}>
                  <View style={styles.activityIndicator} />
                  <View style={styles.activityDetails}>
                    {/* <Marquee speed={0.3} spacing={100} fade={true}> */}
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    {/* </Marquee> */}
                    <View style={styles.activityMeta}>
                      <Text style={styles.activityDate}>
                        {moment(item.date).format('MMM D, YYYY')}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
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
    flex: 1,
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
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.37)',
    padding: 10,
    justifyContent: 'center',
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
    fontSize: 13,
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
    fontSize: 14,
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'left',
  },
});
export default memo(UpcomingActivities);
