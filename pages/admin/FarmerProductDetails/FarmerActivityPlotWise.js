import React, {useMemo, useContext} from 'react';
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

const SEASON_ACTIVITIES = [
  {
    season: 'Current Season Name(2026)',
    type: 'current',
    data: [
      {
        id: '1',
        title: 'Pipe Install',
        date: '10 Jan 2026',
        description: 'Seed sowing completed successfully',
      },
      {
        id: '2',
        title: 'Dry 1',
        date: '18 Jan 2026',
        description: 'Drip irrigation applied to field',
      },
    ],
  },
  {
    season: 'Previous Season Name(2025)',
    type: 'previous',
    data: [
      {
        id: '3',
        title: 'Dry 2',
        date: '20 Dec 2025',
        description: 'Urea fertilizer applied',
      },
    ],
  },
  {
    season: 'Previous Season Name(2024)',
    type: 'previous',
    data: [
      {
        id: '4',
        title: 'Dry 3',
        date: '15 Dec 2024',
        description: 'Pesticide spraying completed',
      },
    ],
  },
];

const FarmerActivityPlotWise = () => {
  const navigation = useNavigation();
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
    const isCurrent = section.type === 'current';
    const accentColor = isCurrent ? '#08855e' : '#C2410C';

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('activityDetail', {
            ...item,
          })
        }>
        <View style={styles.cardContainer}>
          {/* Left Accent Line */}
          <View style={[styles.accentLine, {backgroundColor: accentColor}]} />

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              {/* Activity title always black */}
              <Text style={styles.title}>{item.title}</Text>

              <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
            </View>

            <Text style={styles.date}>{item.date}</Text>
            {/* <Text style={styles.description}>{item.description}</Text> */}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({section}) => {
    const isCurrent = section.type === 'current';

    const seasonColor = isCurrent ? '#08855e' : '#C2410C';
    const backgroundColor = isCurrent ? '#d9f5d5' : '#FFF3E0';

    return (
      <View style={[styles.sectionWrapper, {backgroundColor}]}>
        <Text style={[styles.sectionTitle, {color: seasonColor}]}>
          {section.season}
        </Text>
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
                sections={SEASON_ACTIVITIES}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 30}}
              />
            </View>
          </View>
        </Root>
      </>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerActivityPlotWise;

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
    borderRadius: 5,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  /* Activity title always black */
  title: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: '#111827',
    flex: 1,
    paddingRight: 8,
  },

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
});
