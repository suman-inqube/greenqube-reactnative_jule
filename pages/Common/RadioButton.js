import { StyleSheet, Text, View, Animated, TouchableOpacity } from 'react-native'
import React, { useRef, useEffect } from 'react'
const CARD_HEIGHT = 60;
const PRIMARY_COLOR = '#2e7d32'; // Green
const LIGHT_GREEN = '#e8f5e9';   // Light green background
const RadioButton = ({ item, selected, onSelect }) => {
    const animatedValue = useRef(new Animated.Value(selected ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: selected ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
        }).start();
    }, [selected]);

    const borderColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#ccc', PRIMARY_COLOR],
    });

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#fff', LIGHT_GREEN],
    });

    return (
        <TouchableOpacity onPress={onSelect} style={styles.cardWrapper} activeOpacity={0.9}>
            <Animated.View style={[styles.card, { borderColor, backgroundColor }]}>
                <Text style={styles.title}>{item.title}</Text>
                <Animated.View style={[styles.radioCircle, { borderColor }]}>
                    {selected && <View style={[styles.radioDot, { backgroundColor: PRIMARY_COLOR }]} />}
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
    wrapper: {
        padding: 16,
    },
    heading: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardWrapper: {
        flex: 1,
        marginHorizontal: 4,
    },
    card: {
        height: CARD_HEIGHT,
        borderWidth: 2,
        borderRadius: 10,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioDot: {
        height: 10,
        width: 10,
        borderRadius: 5,
    },
});

export default RadioButton

