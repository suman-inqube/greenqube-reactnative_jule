// TrackingInformationTabs.js
import React from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import {Marquee} from '@animatereactnative/marquee';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors, Fonts} from '../utils/Constants';
import moment from 'moment';

const TrackingInformationTabs = ({
  navigation,
  latestActivities,
  usefulInfoList,
  t,
  navigateToPages,
  handleInfoPress,
}) => {
  const [activeTab, setActiveTab] = React.useState('tracking');

  return (
    <View
      style={{
        backgroundColor: '#d5e0ed',
        marginBottom: 30,
        marginHorizontal: 15,
        borderRadius: 15,
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: 10,
        }}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'tracking' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('tracking')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'tracking' && styles.activeTabText,
            ]}>
            {t('Tracking')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'information' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('information')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'information' && styles.activeTabText,
            ]}>
            {t('information')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tracking Tab Content */}
      <View style={[styles.tabContentContainer, {minHeight: 260}]}>
        {activeTab === 'tracking' && (
          <>
            <View style={styles.seeAllButton}>
              <TouchableOpacity
                onPress={() => navigateToPages('FarmerActivityList')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <View>
              {latestActivities.length > 0 && (
                <View>
                  <FlatList
                    data={latestActivities.slice(0, 3)}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        style={styles.dataItem}
                        onPress={() => {
                          navigation.navigate('FarmerActivityDetail', {
                            activity: item,
                          });
                        }}>
                        <View
                          style={{
                            width: '8%',
                            marginBottom: 5,
                          }}>
                          <MaterialIcons
                            name="south-east"
                            size={20}
                            color="#266c0d"
                          />
                        </View>
                        <View style={{}}>
                          <View style={styles.itemView}>
                            <Marquee speed={0.5} spacing={150} fade={true}>
                              <Text style={styles.titleResult}>
                                {item?.typeActivity
                                  ? item?.typeActivity?.categoryName
                                  : t('activity_name_nil')}
                              </Text>
                            </Marquee>
                          </View>
                          <View style={{flexDirection: 'row'}}>
                            <Text style={styles.dateTitle}>
                              {' '}
                              {t('perf_date')}
                              {':  '}{' '}
                            </Text>
                            <Text style={styles.dateResult}>
                              {item.act_perform_date}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>
          </>
        )}

        {/* Information Tab Content */}
        {activeTab === 'information' && (
          <>
            <View style={styles.seeAllButton}>
              <TouchableOpacity
                onPress={() => navigateToPages('FarmerUsefulInformationList')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <View>
              <FlatList
                data={usefulInfoList}
                keyExtractor={item => item.fid.toString()}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.dataItem}
                    onPress={() => handleInfoPress(item)}>
                    <View
                      style={{
                        width: '8%',
                        marginRight: 20,
                        marginBottom: 5,
                      }}>
                      <MaterialIcons name="article" size={20} color="#266c0d" />
                    </View>
                    <View style={styles.itemView}>
                      <Marquee speed={0.5} spacing={150} fade={true}>
                        <Text
                          style={styles.titleResult}
                          numberOfLines={1}
                          ellipsizeMode="tail">
                          {item.post_name}
                        </Text>
                      </Marquee>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={styles.dateTitle}>
                        {' '}
                        {t('Date')} {':  '}{' '}
                      </Text>
                      <Text style={styles.dateResult}>
                        {moment(item.updated_at).utc().format('YYYY-MM-DD')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    width: '50%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.2,
  },
  activeTab: {
    backgroundColor: '#52648d',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: 'black',
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(0, 0, 0, 0.59)',
  },
  activeTabText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.81)',
    fontFamily: 'Poppins-SemiBold',
  },
  tabContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  seeAllButton: {
    alignItems: 'flex-end',
  },
  seeAllText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#103175',
  },
  dataItem: {
    marginVertical: 5,
    borderBottomWidth: 1,
    borderColor: 'white',
  },
  itemView: {
    flexDirection: 'row',
  },
  title: {
    color: '#064a18',
    paddingBottom: 10,
    fontFamily: Fonts.Medium,
    fontSize: 13,
  },
  titleResult: {
    color: '#103175',
    paddingBottom: 10,
    fontFamily: Fonts.SemiBold,
    fontSize: 13,
  },
  dateTitle: {
    color: '#064a18',
    paddingBottom: 10,
    fontFamily: Fonts.Medium,
    fontSize: 13,
  },
  dateResult: {
    color: '#103175',
    paddingBottom: 10,
    fontFamily: Fonts.SemiBold,
    fontSize: 13,
  },
});

export default TrackingInformationTabs;
