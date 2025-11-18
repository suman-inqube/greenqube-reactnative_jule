import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import CheckBoxComp from "../pages/Common/CheckBoxComp";
import { Colors } from "../pages/utils/Constants";
// FarmerCard Component
const CoFarmerCard = ({ data, index, onEdit, onDelete, handleCoFarmerCheck }) => {
    return (
        <View style={styles.card}>
            {/* Left Green Border */}
            <View style={styles.greenBorder} />

            {/* Card Content */}
            <View style={styles.content}>
                {/* Name and Actions Row */}
                <View style={styles.headerRow}>
                    <View style={styles.nameContainer}>
                        <CheckBoxComp
                            arrayKey={index}
                            isChecked={data.CoFarmer}
                            title={''}
                            onCheckBox={() => handleCoFarmerCheck(data, '555', index)}
                        />
                        <Text style={styles.name}>{data.phone}</Text>
                        {data.CoFarmer != "" ? <View style={styles.badge}>
                            <Text style={styles.badgeText}>CO-Farmer</Text>
                        </View> : null}
                    </View>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => onEdit(data, index)}
                            activeOpacity={0.7}
                        >
                            <Feather name="edit-2" size={15} color="#3b82f6" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => onDelete(data, index)}
                            activeOpacity={0.7}
                        >
                            <Feather name="trash-2" size={15} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Phone Number */}
                {/* <View style={styles.phoneRow}>
                    <Text style={styles.subText}>{data.phone}</Text>
                </View> */}
            </View>

            {/* Right Gradient Accent */}
            <View style={styles.rightAccent} />
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 16,
        // shadowColor: "#10b981",
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.15,
        // shadowRadius: 8,
        // elevation: 6,
        overflow: "hidden",
        minHeight: 95,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },

    greenBorder: {
        width: 5,
        backgroundColor: "#10b981",
    },

    content: {
        flex: 1,
        padding: 16,
        justifyContent: "center",
    },

    headerRow: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    nameContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'flex-start',
        flex: 1,
        marginLeft: -15
    },

    name: {
        fontSize: 14,
        fontWeight: "700",
        color: Colors.text,
        marginRight: 8,
    },

    badge: {
        backgroundColor: "#d1fae5",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },

    badgeText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#10b981",
    },

    actionButtons: {
        flexDirection: "row",
        gap: 8,
    },

    editButton: {
        backgroundColor: "#dbeafe",
        padding: 8,
        borderRadius: 10,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#3b82f6",
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 3,
        // elevation: 2,
    },

    deleteButton: {
        backgroundColor: "#fee2e2",
        padding: 8,
        borderRadius: 10,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#ef4444",
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 3,
        // elevation: 2,
    },

    phoneRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    subText: {
        fontSize: 15,
        color: "#6b7280",
        fontWeight: "500",
    },

    rightAccent: {
        width: 3,
        backgroundColor: "#d1fae5",
    },
});

export default CoFarmerCard;