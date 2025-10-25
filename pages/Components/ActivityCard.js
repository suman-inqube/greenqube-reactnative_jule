import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import {
  getStatusColor,
  getProduceEmoji,
  formatDate,
  effective_dates,
} from '../utils/helpers';
import { Colors, Fonts } from '../utils/Constants';

const ActivityCard = ({
  activity,
  index,
  t,
  effective_dates,
  navigation,
  path,
}) => {
  const status = activity?.deviation > 0 ? 'active' : 'pending';
  const statusColor = getStatusColor(status);
  const cardAnimation = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Animated.timing(cardAnimation, {
      toValue: 1,
      duration: 500,
      delay: index * 150,
      useNativeDriver: true,
    }).start();
  }, [cardAnimation, index]);

  const toggleExpand = useCallback(() => {
    if (expanded) {
      Animated.timing(expandAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start(() => setExpanded(false));
    } else {
      setExpanded(true);
      Animated.timing(expandAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [expanded, expandAnim]);

  const animatedHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 360],
  });

  const animatedOpacity = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.activityCard,
        {
          opacity: cardAnimation,
          transform: [
            {
              translateY: cardAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
          // borderLeftColor: statusColor,
        },
      ]}>
      {/* Header → Expand/Collapse only */}
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.8}
        onPress={toggleExpand}>
        <View style={styles.cardHeader}>
          <View style={styles.produceSection}>
            <View
              style={[
                styles.produceIcon,
                { backgroundColor: statusColor + '15' },
              ]}>
              <Text style={styles.emoji}>
                {getProduceEmoji(activity?.cropName?.name)}
              </Text>
            </View>
            <View style={styles.produceInfo}>
              <Text style={styles.produceName}>{activity?.cropName?.name}</Text>
              <Text style={styles.plotSite}>
                {/* {activity?.land_info?.plot_no} */}
                {activity?.agri_user?.userName}
              </Text>
            </View>
          </View>
          {/* <View
            style={[styles.statusBadge, {backgroundColor: statusColor + '15'}]}>
            <Text style={[styles.statusText, {color: statusColor}]}>
              {status?.toUpperCase()}
            </Text>
          </View> */}
        </View>
      </TouchableOpacity>

      {/* Expandable Content → Navigates on click */}
      {expanded && (
        <Animated.View
          style={{
            height: animatedHeight - 100,
            opacity: animatedOpacity,
            overflow: 'hidden',
            paddingHorizontal: 16,
          }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate(path, activity)}
            style={{ paddingVertical: 10 }}>
            <View style={styles.farmerSection}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>{t('select_pond')}:</Text>
                <Text style={styles.value}>
                  {activity?.land_info?.plot_no}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>{t('farmer_number')}:</Text>
                <Text style={styles.value}>
                  {activity?.agri_user?.contactNumber}
                </Text>
              </View>
            </View>

            <View style={styles.datesSection}>
              <View style={styles.dateGrid}>
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>{t('Sowing')}</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(activity?.actCurel?.sowing_date)}
                  </Text>
                </View>
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>{t('Harvesting')}</Text>
                  <Text style={styles.dateValue}>
                    {effective_dates(activity?.actCurel?.harvesting_date)}
                  </Text>
                </View>
              </View>


              <View style={styles.harvestSection}>
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>{t('cycle_start_date')}</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(activity?.cycle_start_date)}
                  </Text>
                </View>
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>{t('perf_date')}</Text>
                  <Text style={styles.dateValue}>
                    {effective_dates(activity?.act_perform_date)}
                  </Text>
                </View>
              </View>
              {/* <View style={styles.harvestSection}>
                <Text style={styles.label}>{t('perf_date')}:</Text>
                <Text style={styles.harvestValue}>
                    {formatDate(activity?.act_perform_date)}
                </Text>
              </View> */}
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
      <View style={[styles.deviationRow, { paddingHorizontal: 16, paddingBottom: 12 }]}>
        <Text style={styles.label}>{t('deviation')}:</Text>
        <Text
          style={[
            styles.deviationValue,
            { color: activity?.deviation > 0 ? '#EF4444' : '#10B981' },
          ]}>
          {activity?.deviation}
          {t('days')}
        </Text>
      </View>

      <View style={[styles.activityTypeRow, { paddingHorizontal: 16, paddingBottom: 16 }]}>
        <Text style={styles.label}>{t('activity_type')}:</Text>
        <Text style={styles.value}>
          {activity?.typeActivity?.categoryName || 'Not specified'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
  },

  activityCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 4,
    // borderRightWidth: 1,
    // borderTopWidth: 1,
    // borderBottomWidth: 1,
    // borderRightColor: Colors.border,
    // borderTopColor: Colors.border,
    // borderBottomColor: Colors.border,
    // borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 10,
  },
  produceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  produceIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 24,
  },
  produceInfo: {
    flex: 1,
  },
  produceName: {
    fontSize: 16,
    // color: '#1F2937',
    color: Colors.text,
    // marginBottom: 2,
    fontFamily: Fonts.Medium,
  },
  plotSite: {
    fontSize: 14,
    // color: '#6B7280',
    color: Colors.lightText,
    fontFamily: Fonts.Medium,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    // fontWeight: 'bold',
    fontFamily: Fonts.SemiBold,
  },
  farmerSection: {
    backgroundColor: '#F9FAFB',
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    padding: 16,
    paddingBottom: 8,
    // marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: Fonts.Medium,
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: Fonts.Medium,
    flex: 1,
    textAlign: 'right',
  },
  phoneNumber: {
    color: '#3B82F6',
  },
  datesSection: {
    backgroundColor: '#F0FDF4',
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
    padding: 16,
    paddingTop: 8,
    marginBottom: 10,
  },
  dateGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateItem: {
    alignItems: 'center',
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.text,
    fontFamily: Fonts.Medium,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: Fonts.Medium,
  },
  harvestSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  harvestValue: {
    fontSize: 14,
    // color: '#F59E0B',
    color: Colors.pending,
    fontFamily: Fonts.Medium,
  },
  additionalInfo: {
    // marginBottom: 10,
  },
  deviationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 8,
  },
  deviationValue: {
    fontSize: 14,
    // fontWeight: 'bold',
    fontFamily: Fonts.SemiBold,
  },
  activityTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: 'white',
    fontSize: 28,
    fontWeight: '300',
  },
});
export default memo(ActivityCard);
