import React from "react";
import { View, Text, StyleSheet } from "react-native";

const StatusBadge = ({type, status}) => {
  const badgeStyles = {
    APPROVED: {bg: '#D4EDDA', color: '#155724', text: 'APPROVED'},
    PENDING: {bg: '#FFF3CD', color: '#856404', text: 'PENDING'},
    REJECTED: {bg: '#F8D7DA', color: '#721C24', text: 'REJECTED'},
    CARBON_DOCUMENTS_SUBMITTED: {
      bg: '#D4EDDA',
      color: '#155724',
      text: 'SUBMITTED',
    },
    CARBON_DOCUMENTS_REJECTED: {
      bg: '#F8D7DA',
      color: '#721C24',
      text: 'CARBON REJECTED',
    },
    CARBON_DOCUMENTS_APPROVED: {
      bg: '#D4EDDA',
      color: '#155724',
      text: 'VERIFIED',
    },
  };

  const {bg, color, text} = badgeStyles[status] || {
    bg: '#E2E3E5',
    color: '#383D41',
    text: status || 'UNKNOWN',
  };

  return (
    <View style={[styles.badge, {backgroundColor: bg}]}>
      <Text style={[styles.badgeText, {color}]} numberOfLines={1}>
        {type}-{text}
      </Text>
    </View>
  );
};

export default StatusBadge;

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    minWidth: 80,
    alignItems: "center",
    margin:2
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
