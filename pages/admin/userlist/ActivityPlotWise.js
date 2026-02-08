import React from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors, Fonts} from '../../utils/Constants';

const DEMO_ACTIVITIES = [
  {
    id: '1',
    title: 'Sowing Activity',
    date: '10 Jan 2026',
    description: 'Seed sowing completed successfully',
    status: 'Approved',
  },
  {
    id: '2',
    title: 'Dry1 Activity',
    date: '18 Jan 2026',
    description: 'Drip irrigation applied to field',
    status: 'Approved',
  },
  {
    id: '3',
    title: 'Dry2',
    date: '20 Jan 2026',
    description: 'Urea fertilizer applied',
    status: 'Pending',
  },
  {
    id: '4',
    title: 'Pest Control',
    date: '25 Jan 2026',
    description: 'Pesticide spraying scheduled',
    status: 'Pending',
  },
];

const ActivityPlotWise = () => {
  const navigation = useNavigation();

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === 'Approved' ? styles.doneBadge : styles.pendingBadge,
          ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activities</Text>
      </View>

      {/* Activity List */}
      <FlatList
        data={DEMO_ACTIVITIES}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 20}}
      />
      {/* <Text>activity Plot Wise</Text> */}
    </View>
  );
};

export default ActivityPlotWise;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
    padding: 15,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.Medium,
    marginLeft: 12,
    color: '#111827',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 15,
    color: Colors.text,
    fontFamily: Fonts.SemiBold,
    flex: 1,
    paddingRight: 8,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  doneBadge: {
    backgroundColor: '#DCFCE7',
  },

  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },

  statusText: {
    fontSize: 11,
    fontFamily: Fonts.Medium,
    color: Colors.text,
  },

  date: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: Fonts.Regular,
    color: Colors.text,
  },

  description: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: Colors.text,
  },
});
