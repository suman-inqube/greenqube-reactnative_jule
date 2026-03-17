import React, {useMemo, useContext, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Fonts, Colors} from '../../utils/Constants';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {useRoute} from '@react-navigation/native';

const ActivityPlotWise = () => {
  const formatDate = date => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  const navigation = useNavigation();
  const route = useRoute();

  const activities = route?.params?.activities?.data?.rows || [];
  const plot = route?.params?.plot || {};
  // const sections = [
  //   {
  //     season: 'Activities',
  //     type: 'current',
  //     data: activities,
  //   },
  // ];

  const sections = useMemo(() => {
    const today = new Date();
    const grouped = {};

    console.log('activities-----', JSON.stringify(activities));
    activities.forEach(activity => {
      const seasonName =
        activity?.activitySeasonTime?.season_info?.name || 'Season';

      const year = activity?.activitySeasonTime?.year;

      const season = year ? `${seasonName} (${year})` : seasonName;

      const harvestEnd =
        activity?.activitySeasonTime?.harvest_edate ||
        activity?.actCurel?.harvesting_date;

      const harvestDate = harvestEnd ? new Date(harvestEnd) : null;

      const type = harvestDate && harvestDate < today ? 'previous' : 'current';
      const seasonStartDate = activity?.activitySeasonTime?.start_date;
      const seasonHarvestDate = activity?.activitySeasonTime?.harvest_edate;
      if (!grouped[season]) {
        grouped[season] = {
          season,
          type,
          seasonStartDate,
          seasonHarvestDate,
          data: [],
        };
      }

      grouped[season].data.push(activity);
    });

    return Object.values(grouped);
  }, [activities]);
  const {CustomHeader, logoImage, topBanner, Root} =
    useContext(userCreateContext);
  const renderCustomHeader = useMemo(
    () => (
      <CustomHeader
        path="Dashboard"
        logoImage={logoImage}
        topBanner={topBanner}
      />
    ),
    [CustomHeader, logoImage, topBanner],
  );

  const renderItem = ({item, section}) => {
    const title = item?.cropActivity?.activity?.categoryName;
    const startDate = item?.act_start_date;
    const endDate = item?.act_to_date;
    const performDate = item?.act_perform_date;
    const isPrevious = section.type === 'previous';
    const indicatorColor = isPrevious ? '#C2410C' : '#08855e';
    const cropStartDate = item?.actCurel?.sowing_date;
    const harvestDate = item?.actCurel?.harvesting_date;
    const pipeName = item?.uActivityPipe?.pipe_name;

    const formatDate = date => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('activityDetail', {
            ...item,
          })
        }>
        <View style={styles.cardContainer}>
          <View
            style={[styles.accentLine, {backgroundColor: indicatorColor}]}
          />

          <View style={styles.card}>
            <View style={styles.headerTop}>
              {pipeName && (
                <View style={styles.pipeBadge}>
                  <Text style={styles.pipeBadgeText}>{pipeName}</Text>
                </View>
              )}
            </View>

            <View style={styles.activityRow}>
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {title}
              </Text>

              <Text style={styles.activityDate}>
                ({formatDate(startDate)} → {formatDate(endDate)})
              </Text>
            </View>

            {/* <Text style={styles.title}>{title}</Text> */}

            <View style={styles.dateContainer}>
              <View style={styles.dateRow}>
                <View style={styles.labelContainer}>
                  <Text style={styles.dateLabel}>Crop Start</Text>
                </View>
                <View style={styles.valueContainer}>
                  <Text style={styles.dateValue}>
                    {formatDate(cropStartDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.dateRow}>
                <View style={styles.labelContainer}>
                  <Text style={styles.dateLabel}>Crop End</Text>
                </View>
                <View style={styles.valueContainer}>
                  <Text style={styles.dateValue}>
                    {formatDate(harvestDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.dateRow}>
                <View style={styles.labelContainer}>
                  <Text style={styles.dateLabel}>Performed</Text>
                </View>
                <View style={styles.valueContainer}>
                  <Text style={styles.dateValue}>
                    {formatDate(performDate)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const renderSectionHeader = ({section}) => {
    const isPrevious = section.type === 'previous';

    const backgroundColor = isPrevious ? '#fdf0dd' : '#d9ffdf';
    const seasonColor = isPrevious ? '#C2410C' : '#127707';

    return (
      <View style={[styles.sectionWrapper, {backgroundColor}]}>
        <Text style={[styles.sectionTitle, {color: seasonColor}]}>
          {section.season}
        </Text>

        <View style={styles.sectionDateContainer}>
          <Text style={styles.sectionDate}>
            {formatDate(section.seasonStartDate)}
          </Text>

          <Text style={styles.sectionDateDivider}>•</Text>

          <Text style={styles.sectionDate}>
            {formatDate(section.seasonHarvestDate)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <Root>
          <View style={styles.container}>
            {/* Header */}
            {renderCustomHeader}
            <View style={{padding: 15}}>
              <SectionList
                sections={sections}
                keyExtractor={item => item.uact_id}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 120}}
              />
            </View>
          </View>
        </Root>
      </>
    </FarmerDrawerScreenWrapper1>
  );
};

// export default ActivityPlotWise;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.SemiBold,
    marginLeft: 14,
    color: '#111827',
  },

  /* Section Header */
  sectionWrapper: {
    marginTop: 22,
    marginBottom: 12,
    borderRadius: 8,
    paddingVertical: 6,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },

  /* Card */
  cardContainer: {
    flexDirection: 'row',
    marginBottom: 14,
  },

  accentLine: {
    width: 4,
    borderRadius: 4,
    marginRight: 8,
  },

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    // elevation: 3,
    borderStyle: 'dotted',
    borderWidth: 0.5,
    borderColor: '#aba9a9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* Activity title always black */

  date: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: Fonts.Regular,
    color: '#6B7280',
  },

  description: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: '#374151',
    lineHeight: 20,
  },

  dateLabel: {
    fontSize: 12,
    color: '#343d53',
    fontFamily: Fonts.Medium,
    marginBottom: 2,
  },

  dateValue: {
    color: '#6e778d',
    fontFamily: Fonts.Medium,
    fontSize: 12,
  },
  dateValueRange: {
    color: '#5d626f',
    fontFamily: Fonts.SemiBold,
    fontSize: 12,
  },
  sectionDateContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  sectionDate: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Fonts.SemiBold,
  },

  sectionDateDivider: {
    marginHorizontal: 6,
    color: '#9ca3af',
    fontSize: 12,
  },
  pipeName: {
    fontSize: 15,
    fontFamily: Fonts.SemiBold,
    color: Colors.useGreen,
    marginBottom: 2,
  },
  titleWrapper: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  pipeBadge: {
    backgroundColor: '#E6F8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  pipeBadgeText: {
    color: '#08855e',
    fontFamily: Fonts.SemiBold,
    fontSize: 14,
  },

  title: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: '#1F2937',
    flex: 1, // ← important
    // marginRight: 6,
  },

  dateContainer: {
    borderTopWidth: 1,
    borderColor: '#f1f1f1',
    paddingTop: 8,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // 🔥 push to edges
    marginBottom: 5,
  },

  labelContainer: {
    width: 120, // 🔥 fixed label column
  },

  valueContainer: {
    flex: 1,
    alignItems: 'flex-end', // 🔥 right align all values
  },

  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Fonts.Medium,
  },

  dateValue: {
    fontSize: 12,
    color: '#111827',
    fontFamily: Fonts.SemiBold,
  },

  dateValueRange: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Fonts.Medium,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  activityDate: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Fonts.Medium,
    // marginLeft: 6,
  },
});
export default memo(ActivityPlotWise);
