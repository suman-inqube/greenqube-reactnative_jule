import React, {useRef, useEffect, memo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {Colors, Fonts} from '../utils/Constants';
const {width} = Dimensions.get('window');
const TabBar = ({
  tabs = ['Tab 1', 'Tab 2', 'Tab 3'],
  activeTab = 0,
  onTabPress = () => {},
  tabWidth = width,
  indicatorColor = '#28a745',
  height = 50,
  backgroundColor = '#f9f9f9',
  divideBy= 1,
}) => {
  const calculatedTabWidth = width / divideBy;
  const indicatorPosition = useRef(
    new Animated.Value(activeTab * calculatedTabWidth),
  ).current;
  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: activeTab * calculatedTabWidth,
      useNativeDriver: true,
    }).start();
  }, [activeTab, calculatedTabWidth]);
  return (
    <View style={[styles.tabBar, {height, backgroundColor}]}>
      {tabs.map((label, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.tab, {width: calculatedTabWidth}]}
          onPress={() => onTabPress(idx)}>
          <Text
            style={[styles.tabText, activeTab === idx && styles.activeTabText]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}

      <Animated.View
        style={[
          styles.indicator,
          {
            width: calculatedTabWidth,
            backgroundColor: indicatorColor,
            transform: [{translateX: indicatorPosition}],
          },
        ]}
      />
    </View>
  );
};

export default memo(TabBar);

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    position: 'relative',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabText: {
    textAlign: 'center',
    color: '#606d5eff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14.5,
    // padding: 10,
  },
  activeTabText: {
    textAlign: 'center',
    color: '#0d4b01ff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
  },
  indicator: {
    height: 3,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});
