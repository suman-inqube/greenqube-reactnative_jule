import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import CheckBoxComp from '../pages/Common/CheckBoxComp';
import {Colors} from '../pages/utils/Constants';

const CoFarmerList = ({data = [], onEdit, onDelete, handleCoFarmerCheck}) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        borderRadius: 16,
        backgroundColor: '#faf9f9ff',
        padding: 10,
      }}
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Co-Farmers</Text>
          <Text style={styles.headerCount}>Total: {data.length}</Text>
        </View>
      }
      renderItem={({item, index}) => {
        const isLast = index === data.length - 1;
        return (
          <View style={[styles.card, !isLast && styles.cardBorder]}>
            {/* Left Green Border */}
            <View style={styles.greenBorder} />

            {/* Card Content */}
            <View style={styles.content}>
              {/* Name and Actions Row */}
              <View style={styles.headerRow}>
                <View style={styles.nameContainer}>
                  <CheckBoxComp
                    arrayKey={index}
                    isChecked={item.CoFarmer}
                    title={''}
                    onCheckBox={() => handleCoFarmerCheck(item, '555', index)}
                  />

                  <Text style={styles.name}>{item.phone}</Text>

                  {item.CoFarmer ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>CO-Farmer</Text>
                    </View>
                  ) : null}
                </View>

                {/* Edit + Delete */}
                <View style={styles.actionButtons}>
                  {/* <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => onEdit(item, index)}
                    activeOpacity={0.7}
                  >
                    <Feather name="edit-2" size={15} color="#3b82f6" />
                  </TouchableOpacity> */}

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDelete(item, index)}
                    activeOpacity={0.7}>
                    <Feather name="trash-2" size={15} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Right Accent */}
            <View style={styles.rightAccent} />
          </View>
        );
      }}

      // ListEmptyComponent={
      //   <Text style={styles.emptyText}>No Co-Farmers Added</Text>
      // }
    />
  );
};

// Styles
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    // borderRadius: 16,
    // marginBottom: 16,
    overflow: 'hidden',
    // minHeight: 95,
    // borderWidth: 1,
    // borderColor: "#e5e7eb",
  },

  greenBorder: {
    // width: 5,
    // backgroundColor: "#10b981",
  },

  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },

  headerRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 10,
  },

  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    marginLeft: -15,
  },

  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginRight: 8,
  },

  badge: {
    // backgroundColor: "#d1fae5",
    // paddingHorizontal: 8,
    // paddingVertical: 3,
    // borderRadius: 12,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  editButton: {
    backgroundColor: '#dbeafe',
    padding: 8,
    borderRadius: 10,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  deleteButton: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 10,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  rightAccent: {
    // width: 3,
    // backgroundColor: "#d1fae5",
  },

  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  cardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContainer: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f7f7f7',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2ecc71',
  },
  headerCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginTop: 2,
  },
});

export default CoFarmerList;
