// components/CarouselSlider.js
import React, {
  useRef,
  useEffect,
  memo,
  useCallback,
  useMemo,
} from 'react';
import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Colors, Fonts } from '../utils/Constants';
import ImageForm from '../Common/ImageForm';

// Responsive configuration helper
const getResponsiveConfig = screenWidth => {
  const isTablet = screenWidth >= 768;
  const isLargePhone = screenWidth >= 414;

  return {
    itemWidth: isTablet ? 80 : isLargePhone ? 55 : 50,
    itemHeight: isTablet ? 80 : isLargePhone ? 55 : 50,
    spacing: isTablet ? 15 : 12,
    visibleItems: isTablet ? 5 : isLargePhone ? 4 : 3,
    fontSize: isTablet ? 15 : 13,
    imageSize: isTablet ? 40 : 30,
    containerHeight: isTablet ? 140 : 120,
    textContainerHeight: isTablet ? 32 : 27,
  };
};

// Isolated, memoized item component to prevent unnecessary re-renders & allocations
const CarouselItem = memo(
  ({
    item,
    index,
    totalItems,
    config,
    imageStyle,
    textStyle,
    showText,
    onPress,
  }) => {
    const handlePress = useCallback(() => {
      const realIndex = totalItems > 0 ? index % totalItems : index;
      onPress?.(item, realIndex);
    }, [item, index, totalItems, onPress]);

    const itemContainerStyle = useMemo(
      () => [
        styles.carouselItem,
        {
          marginRight: config.spacing,
          width: config.itemWidth,
          height: config.containerHeight,
        },
      ],
      [config.spacing, config.itemWidth, config.containerHeight],
    );

    const imageWrapperStyle = useMemo(
      () => [
        styles.carouselItemImg,
        {
          height: config.itemHeight,
          width: config.itemHeight,
        },
        imageStyle,
      ],
      [config.itemHeight, imageStyle],
    );

    const imageInnerStyle = useMemo(
      () => ({
        height: config.imageSize,
        width: config.imageSize,
        tintColor: 'red',
      }),
      [config.imageSize],
    );

    const textContainerStyle = useMemo(
      () => [
        styles.carouselTextContainer,
        {
          width: config.itemWidth,
          height: config.textContainerHeight,
        },
      ],
      [config.itemWidth, config.textContainerHeight],
    );

    const textMergedStyle = useMemo(
      () => [
        styles.carouselText,
        { fontSize: config.fontSize },
        textStyle,
      ],
      [config.fontSize, textStyle],
    );

    return (
      <TouchableOpacity
        style={itemContainerStyle}
        onPress={handlePress}
        activeOpacity={0.65}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
        <View style={imageWrapperStyle}>
          {item?.imageurl ? (
            <ImageForm
              source={item.imageurl}
              resizeMode="cover"
              style={imageInnerStyle}
            />
          ) : null}
        </View>

        {showText && item?.text ? (
          <View style={textContainerStyle}>
            <Text
              style={textMergedStyle}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.text}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  },
);

CarouselItem.displayName = 'CarouselItem';

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
  onPress,
  style,
  imageStyle,
  textStyle,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const isFocused = useIsFocused();
  const flatListRef = useRef(null);
  const autoScrollInterval = useRef(null);
  const restartTimeout = useRef(null);
  const pressTimeout = useRef(null);
  const scrollOffset = useRef(0);
  const isManualScrolling = useRef(false);

  // Responsive layout configuration
  const config = useMemo(() => {
    const responsive = getResponsiveConfig(screenWidth);
    return {
      itemWidth: itemWidth || responsive.itemWidth,
      itemHeight: itemHeight || responsive.itemHeight,
      spacing: spacing || responsive.spacing,
      visibleItems: visibleItems || responsive.visibleItems,
      fontSize: responsive.fontSize,
      imageSize: responsive.imageSize,
      containerHeight: responsive.containerHeight,
      textContainerHeight: responsive.textContainerHeight,
    };
  }, [itemWidth, itemHeight, spacing, visibleItems, screenWidth]);

  const itemFullWidth = config.itemWidth + config.spacing;

  // Tripled items for infinite scrolling loop
  const loopItems = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return [];
    if (items.length === 1) return items;
    return [...items, ...items, ...items];
  }, [items]);

  // Clean all pending timers
  const clearTimers = useCallback(() => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
    if (restartTimeout.current) {
      clearTimeout(restartTimeout.current);
      restartTimeout.current = null;
    }
    if (pressTimeout.current) {
      clearTimeout(pressTimeout.current);
      pressTimeout.current = null;
    }
  }, []);

  // Optimized scroll action
  const scrollToOffset = useCallback(offset => {
    if (!flatListRef.current) return;
    try {
      flatListRef.current.scrollToOffset({
        offset,
        animated: true,
      });
      scrollOffset.current = offset;
    } catch (_) { }
  }, []);

  // Stop auto-scroll
  const stopAutoScroll = useCallback(() => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  }, []);

  // Auto-scroll cycle
  const startAutoScroll = useCallback(() => {
    if (!autoScroll || loopItems.length <= 1 || !isFocused) return;

    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
    }

    autoScrollInterval.current = setInterval(() => {
      if (isManualScrolling.current) return;

      const maxOffset = itemFullWidth * loopItems.length;
      let nextOffset = scrollOffset.current + itemFullWidth;

      // Wrap around when reaching the last partition
      if (nextOffset >= maxOffset - itemFullWidth * config.visibleItems) {
        nextOffset = itemFullWidth * items.length;
      }

      scrollToOffset(nextOffset);
    }, scrollSpeed);
  }, [
    autoScroll,
    loopItems.length,
    itemFullWidth,
    scrollSpeed,
    config.visibleItems,
    items.length,
    isFocused,
    scrollToOffset,
  ]);

  // Manage auto-scroll lifecycle with screen focus
  useEffect(() => {
    if (isFocused && autoScroll) {
      isManualScrolling.current = false;
      startAutoScroll();
    } else {
      stopAutoScroll();
      clearTimers();
    }
    return () => {
      clearTimers();
    };
  }, [isFocused, autoScroll, startAutoScroll, stopAutoScroll, clearTimers]);

  const handleScroll = useCallback(event => {
    scrollOffset.current = event.nativeEvent.contentOffset.x;
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    isManualScrolling.current = true;
    stopAutoScroll();
  }, [stopAutoScroll]);

  const handleScrollEndDrag = useCallback(() => {
    isManualScrolling.current = false;
    if (restartTimeout.current) clearTimeout(restartTimeout.current);
    restartTimeout.current = setTimeout(() => {
      if (isFocused) {
        startAutoScroll();
      }
    }, 1000);
  }, [startAutoScroll, isFocused]);

  const handleTouchStart = useCallback(() => {
    stopAutoScroll();
  }, [stopAutoScroll]);

  const handleTouchEnd = useCallback(() => {
    if (restartTimeout.current) clearTimeout(restartTimeout.current);
    restartTimeout.current = setTimeout(() => {
      if (isFocused) {
        startAutoScroll();
      }
    }, 1200);
  }, [startAutoScroll, isFocused]);

  const handleItemPress = useCallback(
    (item, index) => {
      stopAutoScroll();
      clearTimers();
      isManualScrolling.current = false;

      const pressHandler =
        onPress ||
        onItemPress ||
        item?.onPress ||
        item?.onpress ||
        item?.onClick ||
        item?.onclick;

      if (typeof pressHandler === 'function') {
        pressHandler(item, index);
      } else if (typeof item?.onpress === 'function') {
        item.onpress();
      } else if (typeof item?.onPress === 'function') {
        item.onPress();
      }

      if (pressTimeout.current) clearTimeout(pressTimeout.current);
      pressTimeout.current = setTimeout(() => {
        if (isFocused) {
          startAutoScroll();
        }
      }, 1500);
    },
    [stopAutoScroll, clearTimers, startAutoScroll, onPress, onItemPress, isFocused],
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <CarouselItem
        item={item}
        index={index}
        totalItems={items.length}
        config={config}
        imageStyle={imageStyle}
        textStyle={textStyle}
        showText={showText}
        onPress={handleItemPress}
      />
    ),
    [config, items.length, imageStyle, textStyle, showText, handleItemPress],
  );

  const getItemLayout = useCallback(
    (_, index) => ({
      length: itemFullWidth,
      offset: itemFullWidth * index,
      index,
    }),
    [itemFullWidth],
  );

  const keyExtractor = useCallback(
    (item, index) => `${item?.id || index}-${index}`,
    [],
  );

  const contentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: Math.max(
        0,
        (screenWidth - itemFullWidth * config.visibleItems) / 2,
      ),
    }),
    [screenWidth, itemFullWidth, config.visibleItems],
  );

  const listStyle = useMemo(
    () => [{ marginHorizontal: '2%' }, style],
    [style],
  );

  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <FlatList
      ref={flatListRef}
      horizontal
      data={loopItems}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      style={listStyle}
      showsHorizontalScrollIndicator={false}
      snapToInterval={itemFullWidth}
      snapToAlignment="start"
      decelerationRate="fast"
      pagingEnabled={false}
      bounces={false}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onScroll={handleScroll}
      onScrollBeginDrag={handleScrollBeginDrag}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollEnd={handleScroll}
      scrollEventThrottle={16}
      contentContainerStyle={contentContainerStyle}
      initialScrollIndex={items.length > 1 ? items.length : 0}
      getItemLayout={getItemLayout}
      keyboardShouldPersistTaps="handled"
      // Performance & Touch Stability
      windowSize={5}
      initialNumToRender={config.visibleItems + 2}
      maxToRenderPerBatch={4}
      updateCellsBatchingPeriod={80}
      removeClippedSubviews={false}
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

export default memo(CarouselSlider);


