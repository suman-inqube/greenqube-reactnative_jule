import React, { useState, useRef, useEffect, memo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Animated, FlatList
} from 'react-native';
import { Colors, Fonts } from '../utils/Constants';
import moment from 'moment';
const TrackingInformation = ({ latestActivities, t, usefulInfoList }) => {
    const [activeTab, setActiveTab] = useState('tracking');
    const trackingScale = useRef(new Animated.Value(1)).current;
    const infoScale = useRef(new Animated.Value(1)).current;
    const handleToggle = (tab) => {
        if (tab === activeTab) return;
        const selectedAnim = tab === 'tracking' ? trackingScale : infoScale;
        const unselectedAnim = tab === 'tracking' ? infoScale : trackingScale;
        // Animate both: scale up selected, down unselected
        Animated.parallel([
            Animated.timing(unselectedAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.timing(selectedAnim, {
                    toValue: 1.1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(selectedAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        setActiveTab(tab);
    };

    return (
        <View style={styles.container}>
            <View style={{ padding: 16 }}>
                <View style={styles.toggleWrapper}>
                    {/* Tracking Button */}
                    <Animated.View style={{ transform: [{ scale: trackingScale }], flex: 1 }}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                {
                                    backgroundColor:
                                        activeTab === 'tracking' ? Colors.useGreen : 'transparent',
                                    borderTopLeftRadius: 20,
                                    borderBottomLeftRadius: 20,
                                },
                            ]}
                            onPress={() => handleToggle('tracking')}>
                            <Text
                                style={[
                                    styles.toggleText,
                                    {
                                        color: activeTab === 'tracking' ? Colors.background : Colors.text,
                                    },
                                ]}>
                                Tracking
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Information Button */}
                    <Animated.View style={{ transform: [{ scale: infoScale }], flex: 1 }}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                {
                                    backgroundColor:
                                        activeTab === 'information' ? Colors.useGreen : 'transparent',
                                    borderTopRightRadius: 20,
                                    borderBottomRightRadius: 20,
                                },
                            ]}
                            onPress={() => handleToggle('information')}>
                            <Text
                                style={[
                                    styles.toggleText,
                                    {
                                        color: activeTab === 'information' ? Colors.background : Colors.text,
                                    },
                                ]}>
                                Information
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>

            {/* Content area */}
            <View >
                {activeTab === 'tracking' ? (
                    <FlatList
                        scrollEnabled={false}
                        data={latestActivities.slice(0, 3)}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{ paddingBottom: 16, height: 218 }}
                        renderItem={({ item, index }) => {
                            const isLastItem = index === latestActivities.slice(0, 3).length - 1;
                            return (
                                <TouchableOpacity
                                    style={{
                                        paddingVertical: 10,
                                        paddingHorizontal: 16,
                                        borderBottomWidth: isLastItem ? 0 : 1, // 👈 hide border if last
                                        borderColor: Colors.border || '#ccc',
                                        backgroundColor: '#fff',
                                    }}>
                                    <Text style={[styles.text, { color: Colors.text,fontFamily:Fonts.Medium }]}>
                                        {item?.typeActivity?.categoryName || 'Activity Name: Nill'}
                                    </Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={[styles.text, { color: Colors.text }]}>{t('perf_date')}: </Text><Text>{moment(item.act_perform_date).utc().format('YYYY-MM-DD')}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                ) : (
                    <FlatList
                        scrollEnabled={false}
                        data={usefulInfoList.slice(0, 3)}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{ paddingBottom: 16, height: 218 }}
                        renderItem={({ item, index }) => {
                            const isLastItem = index === usefulInfoList.slice(0, 3).length - 1;
                            return (
                                <TouchableOpacity
                                    style={{
                                        paddingVertical: 10,
                                        paddingHorizontal: 16,
                                        borderBottomWidth: isLastItem ? 0 : 1, // 👈 hide border if last
                                        borderColor: Colors.border || '#ccc',
                                        backgroundColor: '#fff',
                                    }}>
                                    <Text style={[styles.text, { color: Colors.text ,fontFamily:Fonts.Medium}]}>
                                        {item?.post_name || 'Information Name: Nill'}
                                    </Text>
                                      <View style={{ flexDirection: 'row' }}>
                                        <Text style={[styles.text, { color: Colors.text }]}>{t('perf_date')}: </Text><Text>{moment(item.updated_at).utc().format('YYYY-MM-DD')}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                )}
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        marginHorizontal: '4%',
        borderWidth: 0.5,
        // padding: 16,
        borderColor: Colors.border,
        borderRadius: 12,
        // marginBottom: 12,
        backgroundColor: '#fff',
        // elevation: 1,
        overflow:'hidden'
    },
    toggleWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderWidth: 0.5,
        borderRadius: 20,
        borderColor: Colors.border,
        backgroundColor: Colors.background,
        overflow: 'hidden',
        width: 190,
        alignSelf: 'flex-end',
        // elevation: 1,
    },
    toggleButton: {
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleText: {
        fontFamily: Fonts.SemiBold,
        textAlign: 'center',
        color: Colors.text,
        fontSize: 14,
    },
    text: {
        color: Colors.lightText,
        fontFamily: Fonts.Regular
    }
});
export default memo(TrackingInformation);

