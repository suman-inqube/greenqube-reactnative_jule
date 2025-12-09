import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors, Fonts} from '../utils/Constants';
import LinearGradient from 'react-native-linear-gradient';

const ListCoFarmer_Reg = ({coFarmerList, onClose, onDeleteFarmer}) => {
  const handleDelete = (farmer, index) => {
    Alert.alert(
      'Delete Co-Farmer',
      `Do you want to delete "${farmer.name}" permanently?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDeleteFarmer) {
              onDeleteFarmer(index);
            }
          },
        },
      ],
      {cancelable: true},
    );
  };
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <MaterialIcons name="people" size={32} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Co-Farmers</Text>
            {/* <Text style={styles.headerSubtitle}>Select a co-farmer to switch ownership</Text> */}
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.listContainer}>
        {coFarmerList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Co-Farmers Added Yet</Text>
            <Text style={styles.emptySubtext}>
              Add Co-Farmers using the "Add CO-Farmer" button
            </Text>
          </View>
        ) : (
          coFarmerList.map((farmer, index) => (
            <View key={index} style={styles.farmerItem}>
              <View style={styles.farmerInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {farmer.name?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.farmerDetails}>
                  <Text style={styles.farmerName}>{farmer.name}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(farmer, index)}>
                <View style={styles.statusBadge}>
                  <MaterialIcons name="delete" size={22} color="#df1010ff" />
                </View>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#10b981',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    fontFamily: Fonts.Bold,
    marginBottom: 4,
  },
  closeButton: {
    padding: 5,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    fontFamily: Fonts.SemiBold,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontFamily: Fonts.Regular,
  },
  farmerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  farmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: Fonts.Bold,
  },
  farmerDetails: {
    flex: 1,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    fontFamily: Fonts.SemiBold,
  },
  farmerId: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Fonts.Regular,
  },
  statusBadge: {
    backgroundColor: '#f4e3e3ff',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 30,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    fontFamily: Fonts.Bold,
  },
});

export default ListCoFarmer_Reg;
