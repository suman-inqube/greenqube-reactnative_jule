import React, { useState, useRef, useEffect, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  FlatList,
} from 'react-native';
import { Colors, Fonts } from '../utils/Constants';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const TrackingInformation = ({
  plotStatus,
  latestActivities,
  t,
  usefulInfoList,
  navigation,
  activity_path,
  information_path,
  // Add new props for navigation paths
  trackingNavigationPath,
  informationNavigationPath,
  // Optional: Add props for navigation parameters
  trackingNavigationParams,
  informationNavigationParams,
  leftButtonText,
  dashboardType = 'admin',
  carbonType
}) => {
  const [activeTab, setActiveTab] = useState(
    carbonType === 'mangrove' ? 'information' : 'tracking',
  );
  const trackingScale = useRef(new Animated.Value(1)).current;
  const infoScale = useRef(new Animated.Value(1)).current;
  const handleToggle = tab => {
    if (tab === activeTab) return;
    const selectedAnim = tab === 'tracking' ? trackingScale : infoScale;
    const unselectedAnim = tab === 'tracking' ? infoScale : trackingScale;
    // Animate both: scale up selected, down unselected
    Animated.parallel([
      Animated.timing(unselectedAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(selectedAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(selectedAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setActiveTab(tab);
  };

  /**
   *
   */
  const handleIconPress = () => {
    if (activeTab === 'tracking') {
      // Navigate to tracking screen with optional parameters
      navigation.navigate(
        trackingNavigationPath || 'activityList',
        trackingNavigationParams || {},
      );
    } else {
      // Navigate to information screen with optional parameters
      navigation.navigate(
        informationNavigationPath || 'UsefulInformationList',
        informationNavigationParams || {},
      );
    }
  };
  // const handleIconPress = () => {
  //   if (activeTab === 'tracking') {
  //     navigation.navigate('activityList');
  //   } else {
  //     navigation.navigate('UsefulInformationList');
  //   }
  // };
  const renderAdminTrackingContent = () => (
    <FlatList
      scrollEnabled={false}
      data={plotStatus.slice(0, 3)}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{ paddingBottom: 16, height: 218 }}
      renderItem={({ item, index }) => {
        const isLastItem = index === plotStatus.slice(0, 3).length - 1;
        const { farmer_data, plot_no } = item || {};
        return (
          <TouchableOpacity
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderBottomWidth: isLastItem ? 0 : 1,
              borderColor: Colors.border || '#ccc',
              backgroundColor: '#f6faff',
            }}
            onPress={() =>
              navigation.navigate(activity_path || 'PlotStatusUpdate', item)
            }>
            <Text
              style={[
                styles.text,
                { color: Colors.text, fontFamily: Fonts.Medium },
              ]}>
              {item?.farmer_data?.userName || t('activity_name_nil')}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.text, { color: '#ff0101ff' }]}>
                {t('Rejected_Plot')}:{' '}
              </Text>
              <Text style={[styles.text, { color: Colors.text }]}>{plot_no}</Text>
            </View>
          </TouchableOpacity>
        );
      }}
      maxToRenderPerBatch={8}
      windowSize={5}
      initialNumToRender={6}
      updateCellsBatchingPeriod={50}
    />
  );

  // Render farmer dashboard tracking content
  const renderFarmerTrackingContent = () => (
    <FlatList
      scrollEnabled={false}
      data={latestActivities.slice(0, 3)}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{ paddingBottom: 16, height: 218 }}
      renderItem={({ item, index }) => {
        const isLastItem = index === latestActivities.slice(0, 3).length - 1;
        return (
          <TouchableOpacity
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderBottomWidth: isLastItem ? 0 : 1,
              borderColor: Colors.border || '#ccc',
              backgroundColor: '#fff',
            }}
            onPress={() =>
              navigation.navigate(activity_path || 'FarmerActivityDetail', item)
            }>
            <Text
              style={[
                styles.text,
                { color: Colors.text, fontFamily: Fonts.Medium },
              ]}>
              {item?.typeActivity?.categoryName || t('activity_name_nil')}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.text, { color: Colors.text }]}>
                {t('perf_date')}:{' '}
              </Text>
              <Text style={[styles.text, { color: Colors.text }]}>
                {moment(item.act_perform_date).utc().format('YYYY-MM-DD')}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.toggleWrapper}>
          {/* Tracking Button */}
          {carbonType !== 'mangrove' && (
            <Animated.View style={{ transform: [{ scale: trackingScale }], flex: 1 }}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  {
                    backgroundColor:
                      activeTab === 'tracking' ? Colors.useGreen : 'transparent',
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                  },
                ]}
                onPress={() => handleToggle('tracking')}>
                <Text
                  style={[
                    styles.toggleText,
                    {
                      color:
                        activeTab === 'tracking'
                          ? Colors.background
                          : Colors.text,
                    },
                  ]}>
                  {leftButtonText}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Information Button */}
          <Animated.View style={{ transform: [{ scale: infoScale }], flex: 1 }}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor:
                    activeTab === 'information'
                      ? Colors.useGreen
                      : 'transparent',
                  borderTopRightRadius: 20,
                  borderBottomRightRadius: 20,
                },
              ]}
              onPress={() => handleToggle('information')}>
              <Text
                style={[
                  styles.toggleText,
                  {
                    color:
                      activeTab === 'information'
                        ? Colors.background
                        : Colors.text,
                  },
                ]}>
                {t('information')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={handleIconPress}>
            <MaterialIcons
              name="arrow-forward"
              size={22}
              color={Colors.useGreen}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content area */}
      <View>
        {activeTab === 'tracking' ? (
          dashboardType === 'admin' ? (
            renderAdminTrackingContent()
          ) : (
            renderFarmerTrackingContent()
          )
        ) : (
          <FlatList
            scrollEnabled={false}
            data={usefulInfoList.slice(0, 3)}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 16, height: 218 }}
            renderItem={({ item, index }) => {
              const isLastItem =
                index === usefulInfoList.slice(0, 3).length - 1;

              return (
                <TouchableOpacity
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderBottomWidth: isLastItem ? 0 : 1, // 👈 hide border if last
                    borderColor: Colors.border || '#ccc',
                    backgroundColor: '#f6faff',
                  }}
                  onPress={() =>
                    navigation.navigate(
                      information_path || 'UsefulInformation',
                      item.fid,
                    )
                  }>
                  <Text
                    style={[
                      styles.text,
                      { color: Colors.text, fontFamily: Fonts.Medium },
                    ]}>
                    {item?.post_name || 'Information Name: Nill'}
                  </Text>

                  <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.text, { color: Colors.text }]}>
                      {t('perf_date')}:{' '}
                    </Text>
                    <Text style={[styles.text, { color: Colors.text }]}>
                      {moment(item.updated_at).utc().format('YYYY-MM-DD')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: '4%',
    borderWidth: 0.5,
    // padding: 16,
    borderColor: Colors.border,
    borderRadius: 12,
    // marginBottom: 12,
    backgroundColor: '#fff',
    // elevation: 1,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    alignSelf: 'flex-end',
    paddingTop: 15,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  toggleWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderWidth: 0.5,
    borderRadius: 20,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    overflow: 'hidden',
    width: 190,
    alignSelf: 'flex-end',
    // elevation: 1,
  },
  toggleButton: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontFamily: Fonts.SemiBold,
    textAlign: 'center',
    color: Colors.text,
    fontSize: 14,
  },
  text: {
    color: Colors.lightText,
    fontFamily: Fonts.SemiBold,
  },
});
export default memo(TrackingInformation);
