import {View, Text, StyleSheet, FlatList, Dimensions} from 'react-native';
import React, {useState, useEffect, useContext, useMemo} from 'react';
import {userCreateContext} from '../../Context/usersCreateContext';
import {Colors, Fonts} from '../../utils/Constants';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
import {useNavigation} from '@react-navigation/native';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';

const {width} = Dimensions.get('window');

const PendingActivity = () => {
  const navigation = useNavigation();
  const {
    CustomHeader,
    t,
    loginUser_data,
    onBackPress,
    Root,
    // LoadingScreen: LoadingComponent,
  } = useContext(userCreateContext);

  const {dbname, lan_id, token, user_id} = loginUser_data || {};

  const [activityList, setActivityList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch activity schedule data
  useEffect(() => {
    const fetchActivitySchedule = async () => {
      if (!token || !user_id) return;

      setLoading(true);
      try {
        const response = await axiosGet(
          ROUTES.GET.ALL_ACTIVITY_SCHEDULE({
            type: 'carbon_activity',
            supervisor_id: user_id,
          }),
          token,
          {
            information: `${dbname},${lan_id},${user_id}`,
          },
        );

        console.log('Activity Schedule Response:', response);

        if (response?.status === 200) {
          // Use the correct data structure from API response
          const data = response?.data?.data?.data || [];
          setActivityList(Array.isArray(data) ? data : []);

          // If your API supports pagination, set total pages
          // setTotalPages(Math.ceil(response?.data?.count / 20));
        }
      } catch (error) {
        console.error('Error fetching activity schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivitySchedule();
  }, [token, dbname, lan_id, user_id, page]);

  // Render each activity item
  const renderActivityItem = ({item, index}) => {
    // Extract data from the API response structure
    const farmerName = item?.farmer?.userName || 'Unknown Farmer';
    const plotName = item?.crop?.land_info?.plot_no || 'Unknown Plot';
    const contactNumber = item?.farmer?.contactNumber || 'N/A';

    // Get upcoming activities
    const overdueActivities = item?.overdueActivities || [];

    return (
      <>
        {overdueActivities.length != 0 ? (
          <View View style={styles.activityItem}>
            {/* Farmer Information */}

            <View style={styles.farmerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.mainText}>{farmerName}</Text>
                <Text style={styles.mainText}> {plotName}</Text>
              </View>
              {/* <Text style={styles.subText}> {contactNumber}</Text> */}
            </View>

            {/* Plot Information */}
            {/* <View style={styles.plotInfo}>
          <Text style={styles.plotStatus}>
            Status: {item?.crop?.land_info?.plot_status || 'N/A'}
          </Text>
        </View> */}

            {/* Upcoming Activities */}
            <View style={styles.activitiesSection}>
              {/* <Text style={styles.activitiesTitle}>Upcoming Activities:</Text> */}
              {overdueActivities.length > 0 ? (
                overdueActivities.map((activity, activityIndex) => (
                  <View key={activityIndex} style={styles.activityDetail}>
                    <View style={styles.nameRow}>
                      <Text style={styles.activityName}>
                        •{' '}
                        {activity?.activityName?.categoryName ||
                          'Unknown Activity'}
                      </Text>
                      <Text style={styles.daysUntil}>
                        {/* because api is sending nagetive value of days_until_start, we are multiplying by -1 */}
                        {activity?.days_until_start * -1 || 0} days ago
                      </Text>
                    </View>
                    {/* <Text style={styles.activityType}>
                  Type: {activity?.activityType?.categoryName || 'N/A'}
                </Text> */}

                    <Text style={styles.activityDate}>
                      Start:{' '}
                      {new Date(
                        activity?.activity_start_date,
                      ).toLocaleDateString()}
                    </Text>
                    <Text style={styles.activityDate}>
                      End:{' '}
                      {new Date(
                        activity?.activity_end_date,
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noActivities}>No upcoming activities</Text>
              )}
            </View>
          </View>
        ) : (
          <></>
        )}
      </>
    );
  };

  // Render empty state
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {t('no_upcoming_activities') || 'No upcoming activities found'}
      </Text>
    </View>
  );
  onBackPress(() => {
    navigation.navigate('Dashboard');
    return true;
  });
  const HandlerGoBack = () => navigation.navigate('Dashboard');

  const renderCustomHeader = useMemo(
    () => <CustomHeader t={t} HandlerGoBack={HandlerGoBack} />,
    [],
  );
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        {renderCustomHeader}
        <View style={styles.container}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={activityList}
              keyExtractor={(item, index) =>
                item?.farmer?.user_id?.toString() ||
                item?.crop?.cu_rel_id?.toString() ||
                index.toString()
              }
              renderItem={renderActivityItem}
              ListEmptyComponent={!loading && renderEmptyComponent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}

          {/* If you need pagination later, you can add it like this: */}
          {/* {totalPages > 1 && (
        <PaginationNav
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage(p => Math.max(1, p - 1))}
          onNext={() => setPage(p => Math.min(totalPages, p + 1))}
          t={t}
        />
      )} */}
        </View>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};

export default PendingActivity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fb',
    // padding: 10,
    // marginBottom: 30,
  },
  header: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    marginBottom: 15,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  activityItem: {
    backgroundColor: '#FFF',
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#206708ff',
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: '#d0d4dc',
    borderTopColor: '#d0d4dc',
    borderBottomColor: '#d0d4dc',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  farmerInfo: {
    // marginBottom: 5,
    // borderBottomWidth: 1,
    // borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  mainText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#363636ff',
    marginBottom: 4,
  },
  subText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  plotInfo: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  plotName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  plotStatus: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  activitiesSection: {
    // marginBottom: 10,
  },
  activitiesTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    marginBottom: 8,
  },
  activityDetail: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  activityName: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  activityType: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 2,
  },
  daysUntil: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#ff0d0dff',
    marginBottom: 2,
  },
  noActivities: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  cropInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
  },
  cropText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
  },
  nameRow: {
    flexDirection: 'row', // places items in a row
    justifyContent: 'space-between', // pushes name to left, plot to right
    // alignItems: 'center',
  },
});
