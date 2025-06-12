import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  LayoutChangeEvent,
  DimensionValue, Image
} from 'react-native';



const CollapsibleCard = ({
  header,
  content,
  footer,
  width = '100%',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const paddingAnim = useRef(new Animated.Value(16)).current; // Initial paddingBottom is 16
  const handleContentLayout = (event) => {
    setContentHeight(event.nativeEvent.layout.height);
  };

  const toggleCard = () => {
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: isExpanded ? 0 : contentHeight,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(paddingAnim, {
        toValue: isExpanded ? 16 : 0, // Animate paddingBottom
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => setIsExpanded(!isExpanded));
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.card, { width }]}>
      {/* Always visible header */}
      <TouchableOpacity onPress={toggleCard} style={styles.touchable}>
        <Animated.View style={[styles.header, { paddingBottom: paddingAnim+400 }]}>
          {header}
          <Animated.View style={[styles.arrow, { transform: [{ rotate }] }]}>
            {/* <Image r down-arrow */}
            <Image
              style={{ width: 20, height: 20 }}
              source={require('../Common/images/down-arrow.png')}
            />
            {/* <Icon name="chevron-down" size={25} iconFamily="MaterialCommunityIcons" color="#000" /> */}
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>

      {/* Collapsible content */}
      <Animated.View style={[styles.content, { height: animatedHeight }]}>
        <View style={styles.hiddenMeasureView} onLayout={handleContentLayout}>
          {content}
        </View>
        {content}
      </Animated.View>

      {/* Always visible footer */}
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 0.6,
    borderColor: '#d0d4dc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,  // Added border bottom for header
    borderBottomColor: '#eee',
  },
  content: {
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  hiddenMeasureView: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
    width: '100%',
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,  // Footer border remains the same
    borderTopColor: '#eee',
  },
  arrow: {
    marginLeft: 10,
  },
  touchable: {
    overflow: 'hidden',
  },
});


export default CollapsibleCard;
