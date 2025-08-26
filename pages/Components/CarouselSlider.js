// components/CarouselSlider.js
import React, { useRef, useEffect, memo, useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  View,
  Text,
  Dimensions,
  Image,
  StyleSheet,
  Platform
} from 'react-native';
import { Colors, Fonts } from '../utils/Constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive breakpoints
const getResponsiveConfig = () => {
  const isTablet = SCREEN_WIDTH >= 768;
  const isLargePhone = SCREEN_WIDTH >= 414;
  
  return {
    itemWidth: isTablet ? 80 : isLargePhone ? 55 : 50,
    itemHeight: isTablet ? 80 : isLargePhone ? 55 : 50,
    spacing: isTablet ? 15 : 12,
    visibleItems: isTablet ? 5 : isLargePhone ? 4 : 3,
    fontSize: isTablet ? 15 : 13,
    imageSize: isTablet ? 40 : 30,
    containerHeight: isTablet ? 140 : 120,
    textContainerHeight: isTablet ? 32 : 27
  };
};

const CarouselSlider = ({
  items = [],
  itemWidth,
  itemHeight,
  spacing,
  visibleItems,
  scrollSpeed = 3000,
  autoScroll = true,
  showText = true,
  onItemPress,
  style,
  imageStyle,
  textStyle
}) => {
  const flatListRef = useRef(null);
  const autoScrollInterval = useRef(null);
  const scrollOffset = useRef(0);
  const isManualScrolling = useRef(false);
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
  
  // Get responsive configuration
  const config = useMemo(() => {
    const responsive = getResponsiveConfig();
    return {
      itemWidth: itemWidth || responsive.itemWidth,
      itemHeight: itemHeight || responsive.itemHeight,
      spacing: spacing || responsive.spacing,
      visibleItems: visibleItems || responsive.visibleItems,
      fontSize: responsive.fontSize,
      imageSize: responsive.imageSize,
      containerHeight: responsive.containerHeight,
      textContainerHeight: responsive.textContainerHeight
    };
  }, [itemWidth, itemHeight, spacing, visibleItems, dimensions]);

  // Memoized loop items to prevent recreation
  const loopItems = useMemo(() => {
    if (items.length === 0) return [];
    // Triple the items for seamless infinite scroll
    return [...items, ...items, ...items];
  }, [items]);

  const itemFullWidth = config.itemWidth + config.spacing;

  // Handle dimension changes (rotation, etc.)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // Optimized scroll functions
  const scrollToOffset = useCallback((offset) => {
    if (!flatListRef.current) return;
    
    try {
      flatListRef.current.scrollToOffset({ 
        offset, 
        animated: true 
      });
      scrollOffset.current = offset;
    } catch (error) {
      console.warn('Scroll error:', error);
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    if (!autoScroll || loopItems.length === 0) return;
    
    stopAutoScroll();
    autoScrollInterval.current = setInterval(() => {
      if (isManualScrolling.current) return;
      
      const maxOffset = itemFullWidth * loopItems.length;
      let nextOffset = scrollOffset.current + itemFullWidth;
      
      // Reset to beginning when reaching end
      if (nextOffset >= maxOffset - itemFullWidth * config.visibleItems) {
        nextOffset = itemFullWidth * items.length; // Reset to middle section
      }
      
      scrollToOffset(nextOffset);
    }, scrollSpeed);
  }, [autoScroll, loopItems.length, itemFullWidth, scrollSpeed, config.visibleItems, items.length, scrollToOffset]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  }, []);

  // Auto scroll management
  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [startAutoScroll, stopAutoScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  const handleScroll = useCallback((event) => {
    scrollOffset.current = event.nativeEvent.contentOffset.x;
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    isManualScrolling.current = true;
    stopAutoScroll();
  }, [stopAutoScroll]);

  const handleScrollEndDrag = useCallback(() => {
    isManualScrolling.current = false;
    // Delay restart to allow momentum scroll to complete
    setTimeout(() => {
      startAutoScroll();
    }, 500);
  }, [startAutoScroll]);

  const handleItemPress = useCallback((item, index) => {
    stopAutoScroll();
    
    // Call item's onpress or global onItemPress
    if (item?.onpress) {
      item.onpress(item, index);
    } else if (onItemPress) {
      onItemPress(item, index);
    }
    
    // Resume auto scroll after a delay
    setTimeout(() => {
      startAutoScroll();
    }, 1000);
  }, [stopAutoScroll, startAutoScroll, onItemPress]);

  const renderItem = useCallback(({ item, index }) => (
    <Pressable
      style={[
        styles.carouselItem,
        {
          marginRight: config.spacing,
          width: config.itemWidth,
          height: config.containerHeight
        }
      ]}
      onPress={() => handleItemPress(item, index)}
      android_ripple={{ color: Colors.primary, borderless: true }}
    >
      <View style={[
        styles.carouselItemImg,
        {
          height: config.itemHeight,
          width: config.itemHeight
        },
        imageStyle
      ]}>
        {item.imageurl && (
          <Image
            source={item.imageurl}
            resizeMode="cover"
            style={{
              height: config.imageSize,
              width: config.imageSize,
              // borderRadius: config.imageSize / 2
              borderRadius: 10
            }}
          />
        )}
      </View>
      
      {showText && item.text && (
        <View style={[
          styles.carouselTextContainer,
          {
            width: config.itemWidth,
            height: config.textContainerHeight
          }
        ]}>
          <Text
            style={[
              styles.carouselText,
              { fontSize: config.fontSize },
              textStyle
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.text}
          </Text>
        </View>
      )}
    </Pressable>
  ), [config, handleItemPress, showText, imageStyle, textStyle]);

  const getItemLayout = useCallback((data, index) => ({
    length: itemFullWidth,
    offset: itemFullWidth * index,
    index
  }), [itemFullWidth]);

  const keyExtractor = useCallback((item, index) => `${item.id || index}-${index}`, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <FlatList
      ref={flatListRef}
      horizontal
      data={loopItems}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      style={[{ marginHorizontal: '2%' }, style]}
      showsHorizontalScrollIndicator={false}
      snapToInterval={itemFullWidth}
      snapToAlignment="start"
      decelerationRate="fast"
      pagingEnabled={false}
      bounces={false}
      onScrollBeginDrag={handleScrollBeginDrag}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollEnd={handleScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{
        paddingHorizontal: Math.max(0, (dimensions.width - itemFullWidth * config.visibleItems) / 2)
      }}
      initialScrollIndex={items.length} // Start in middle section
      getItemLayout={getItemLayout}
      // Performance optimizations
      windowSize={Platform.OS === 'ios' ? 10 : 21}
      initialNumToRender={config.visibleItems + 2}
      maxToRenderPerBatch={5}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews={true}
      // Additional performance props
      disableIntervalMomentum={true}
      disableScrollViewPanResponder={false}
      scrollEnabled={true}
    />
  );
};

const styles = StyleSheet.create({
  carouselItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  carouselItemImg: {
    backgroundColor: Colors.background_light,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow || '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  carouselTextContainer: {
    backgroundColor: Colors.background_light,
    borderRadius: 48,
    marginTop: 8,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow || '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  carouselText: {
    fontFamily: Fonts.Medium,
    color: Colors.text,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

// Default props
CarouselSlider.defaultProps = {
  scrollSpeed: 3000,
  autoScroll: true,
  showText: true,
};

export default memo(CarouselSlider);