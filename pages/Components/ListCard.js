import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../utils/Constants';

const FarmAccountCard = ({
  onPress,
  title,
  subtitle,
  items = [],
  showChevron = true,
  borderColor = Colors.borderGreen,
  cardStyle = {},
}) => {
  return (
    <TouchableOpacity
      style={[styles.wrapper, {borderLeftColor: borderColor}, cardStyle]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.marqueeContainer}>
          <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
          {subtitle && (
            <Text
              style={styles.cardSubtitle}
              numberOfLines={1}
              ellipsizeMode="tail">
              {subtitle}
            </Text>
          )}
        </View>
        {showChevron && (
          <View style={styles.cardFooter}>
            <MaterialIcons name="chevron-right" size={20} color="#2e7d32" />
          </View>
        )}
      </View>

      {items.map((item, index) => (
        <View key={index} style={styles.detailRow}>
          <Text style={styles.label}>{item.label}:</Text>
          <Text
            style={styles.value}
            numberOfLines={item.numberOfLines || 1}
            ellipsizeMode={item.ellipsizeMode || 'tail'}>
            {item.value}
          </Text>
        </View>
      ))}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'white',
    marginVertical: 8,
    borderRadius: 20,
    borderLeftWidth: 5,
    paddingHorizontal: 15,
    marginHorizontal: '4%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: Colors.border,
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
  },
  cardTitle: {
    fontSize: 14,
    color: Colors.useGreen,
    fontFamily: 'Poppins-SemiBold',
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  marqueeContainer: {
    flex: 1,
    marginRight: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginLeft: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
  },
  value: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    textAlign: 'right',
  },
});

export default FarmAccountCard;
