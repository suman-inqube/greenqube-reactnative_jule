import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated'; // ✅ FIX

const Skeleton = ({ width = '100%', height = 20, borderRadius = 4}) => {
    return (
        <MotiView
            from={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{
                loop: true,
                type: 'timing',
                duration: 500,
                easing: Easing.inOut(Easing.ease),
            }}
            style={[styles.skeleton, { width, height, borderRadius }]}
        />
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#E1E9EE',
        marginVertical: 5,
    },
});

export default Skeleton;
