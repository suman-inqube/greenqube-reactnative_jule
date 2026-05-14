import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect, useContext, useMemo} from 'react';
import {userCreateContext} from '../../Context/usersCreateContext';
import {Colors, Fonts} from '../../utils/Constants';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
import {useNavigation} from '@react-navigation/native';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import TabBar from '../../Components/TabBar';

const {width} = Dimensions.get('window');

const FarmerPendingActivity = () => {
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
  const [activeTab, setActiveTab] = useState('carbon');

  // Fetch activity schedule data

  const onPageLoad = async () => {
    if (!token || !user_id) return;

    setLoading(true);
    try {
      const response = await axiosGet(
        ROUTES.GET.ALL_ACTIVITY_SCHEDULE({
          type: activeTab === 'carbon' ? 'carbon_activity' : 'user_activity',
          farmer_id: user_id,
        }),
        token,
        {
          information: `${dbname},${lan_id},${user_id}`,
        },
      );

      if (response?.status === 200) {
        // Use the correct data structure from API response
        const data = response?.data?.data?.data || [];
        setActivityList(Array.isArray(data) ? data : []);

        // If your API supports pagination, set total pages
        // setTotalPages(Math.ceil(response?.data?.count / 20));
      } else {
        setActivityList([]);
      }
    } catch (error) {
      console.error('Error fetching activity schedule:', error);
      setActivityList([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    onPageLoad('', '', '', '');
  }, [activeTab]);
  //   fetchActivitySchedule();
  // }, [token, dbname, lan_id, user_id, page]);

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
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (activeTab === 'carbon') {
                navigation.navigate('FarmerActivityReportAWD', {
                  farmer: item?.farmer,
                  plot: item?.crop?.land_info,
                });
              } else {
                navigation.navigate('FarmerActivityReport', {
                  farmer: item?.farmer,
                  plot: item?.crop?.land_info,
                });
              }
            }}>
            <View style={styles.activityItem}>
              {/* Farmer Information */}
              <View style={styles.farmerInfo}>
                {/* <Text style={styles.mainText}>{farmerName}</Text> */}
                <Text style={styles.mainText}> {plotName}</Text>
                <Text style={styles.activityDate}>
                  {t('Sowing Date')}:{' '}
                  {overdueActivities[0]?.sowing_date || 'N/A'}
                </Text>
                <Text style={styles.activityDate}>
                  {t('Hervesting Date')}:{' '}
                  {overdueActivities[0]?.harvesting_date || 'N/A'}
                </Text>

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
                          {activity?.days_until_start * -1 || 0} days ago
                        </Text>
                      </View>
                      {/* <Text style={styles.activityType}>
                  Type: {activity?.activityType?.categoryName || 'N/A'}
                </Text> */}

                      <Text style={styles.activityDate}>
                        {t('Schedule date')}:{' '}
                        {new Date(
                          activity?.activity_start_date,
                        ).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        -{' '}
                        {new Date(
                          activity?.activity_end_date,
                        ).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noActivities}>No pending activities</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.noActivities}>No pending activities</Text>
          </>
        )}
      </>
    );
  };

  // Render empty state
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{'No pending activities found'}</Text>
    </View>
  );
  onBackPress(() => {
    navigation.navigate('FarmerDashboard');
    return true;
  });
  const HandlerGoBack = () => navigation.navigate('FarmerDashboard');

  const renderCustomHeader = useMemo(() => <CustomHeader t={t} />, []);
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        {renderCustomHeader}
        <View style={styles.container}>
          <TabBar
            tabs={[t('carbon'), t('non_carbon')]}
            activeTab={activeTab === 'carbon' ? 0 : 1}
            onTabPress={index => {
              setActiveTab(index === 0 ? 'carbon' : 'non-carbon');
            }}
            indicatorColor={Colors.useGreen}
            height={60}
            backgroundColor={Colors.background}
            colors={Colors.primary}
            divideBy={2}
          />
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

export default FarmerPendingActivity;

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
