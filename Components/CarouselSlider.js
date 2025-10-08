// components/CarouselSlider.js
import React, { useRef, useEffect } from 'react';
import {
    FlatList,
    TouchableOpacity,
    View,
    Text,
    Dimensions,
    Image,
    StyleSheet
} from 'react-native';
import { Colors, Fonts } from '../utils/Constants';

const CarouselSlider = ({
    items = [],
    itemWidth = 50,
    itemHeight = 50,
    spacing = 10,
    visibleItems = 3,
    scrollSpeed = 3000
}) => {
    const flatListRef = useRef(null);
    const autoScrollInterval = useRef(null);
    const scrollOffset = useRef(0);
    const isManualScrolling = useRef(false);

    const itemFullWidth = itemWidth + spacing;
    const screenWidth = Dimensions.get('window').width;
    const LOOP_ITEMS = [...items, ...items, ...items]; // for seamless scroll

    const scrollToOffset = (offset) => {
        if (!flatListRef.current) return;
        flatListRef.current.scrollToOffset({ offset, animated: true });
        scrollOffset.current = offset;
    };

    const startAutoScroll = () => {
        stopAutoScroll();
        autoScrollInterval.current = setInterval(() => {
            if (isManualScrolling.current) return;
            let nextOffset = scrollOffset.current + itemFullWidth;
            if (nextOffset >= itemFullWidth * LOOP_ITEMS.length) {
                nextOffset = 0;
            }
            scrollToOffset(nextOffset);
        }, scrollSpeed);
    };

    const stopAutoScroll = () => {
        if (autoScrollInterval.current) {
            clearInterval(autoScrollInterval.current);
        }
    };

    useEffect(() => {
        startAutoScroll();
        return stopAutoScroll;
    }, []);

    const handleScroll = (event) => {
        scrollOffset.current = event.nativeEvent.contentOffset.x;
    };

    return (
        <FlatList
            // scrollEnabled={false}
            ref={flatListRef}
            horizontal
            data={LOOP_ITEMS}
            keyExtractor={(_, index) => index.toString()}
            style={{ marginHorizontal: '2%' }}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={[styles.carouselItem, { marginRight: spacing, width: itemWidth }]}
                    onPress={item.onpress}
                >
                    <View style={[styles.carouselItemImg, { height: itemHeight, width: itemHeight }]}>
                        <Image source={item.imageurl} resizeMode="cover" style={{ height: 30, width: 30 }} />
                    </View>
                    <View style={[styles.carouselTextContainer, { width: itemWidth }]}>
                        <Text style={styles.carouselText} numberOfLines={1}>{item.text}</Text>
                    </View>
                </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            snapToInterval={itemFullWidth}
            decelerationRate="fast"
            pagingEnabled={false}
            onScrollBeginDrag={() => {
                isManualScrolling.current = true;
                stopAutoScroll();
            }}
            onScrollEndDrag={() => {
                isManualScrolling.current = false;
                startAutoScroll();
            }}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{
                paddingHorizontal: (screenWidth - itemFullWidth * visibleItems) / 2
            }}
            initialScrollIndex={items.length}
            getItemLayout={(_, index) => ({
                length: itemFullWidth,
                offset: itemFullWidth * index,
                index
            })}
            windowSize={10}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={true}
        />
    );
};

const styles = StyleSheet.create({
    carouselItem: {
        alignItems: 'center',
        height: 120,
        justifyContent: 'center',
        // justifyContent:'center'
    },
    carouselItemImg: {
        backgroundColor: Colors.background_light,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center'
    },
    carouselTextContainer: {
        backgroundColor: Colors.background_light,
        borderRadius: 48,
        // paddingHorizontal: 8,
        // paddingVertical: 4,
        marginTop: 10,
        shadowColor: Colors.background_light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 10,
        alignSelf: 'center',
        height: 27,
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        borderWidth: 1,
        borderColor: Colors.border,

    },
    carouselText: {
        fontFamily: Fonts.Medium,
        color: Colors.text,
        fontSize: 13,
        textAlign: 'center'
    },
});

export default CarouselSlider;
