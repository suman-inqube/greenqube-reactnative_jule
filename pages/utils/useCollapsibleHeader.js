// hooks/useCollapsibleHeader.js
import { useRef, useCallback, useMemo } from "react";
import { Animated, StatusBar, Platform } from "react-native";
const DEFAULT_HEADER_CONFIG = {
    HEADER_HEIGHT: 60,
    INITIAL_IMAGE_HEIGHT: 160,
    COLLAPSED_IMAGE_HEIGHT: 135,
    STICKY_TOP_OFFSET: 40,
    statusBarColor: "#003c04",
};
export default function useCollapsibleHeader(
    refreshing,
    config = DEFAULT_HEADER_CONFIG
) {
    const {
        HEADER_HEIGHT,
        INITIAL_IMAGE_HEIGHT,
        COLLAPSED_IMAGE_HEIGHT,
        STICKY_TOP_OFFSET,
        statusBarColor,
    } = { ...DEFAULT_HEADER_CONFIG, ...config };
    const headerTranslateY = useRef(new Animated.Value(0)).current;
    const filterTranslateY = useRef(new Animated.Value(0)).current;
    const imageHeight = useRef(new Animated.Value(INITIAL_IMAGE_HEIGHT)).current;
    const imageOpacity = useRef(new Animated.Value(1)).current;

    const currentOffset = useRef(0);
    const isHeaderVisible = useRef(true);

    const animate = useCallback((animations, callback) => {
        Animated.parallel(animations).start(callback);
    }, []);

    const handleScroll = useCallback(
        ({ nativeEvent }) => {
            if (refreshing) return;

            const offsetY = nativeEvent.contentOffset.y;
            const diff = offsetY - currentOffset.current;
            if (Math.abs(diff) < 3) return;
            const velocity = Math.abs(diff);
            const animationDuration = Math.max(
                150,
                Math.min(400, 300 - velocity * 2)
            );

            if (offsetY <= 0) {
                animate(
                    [
                        Animated.timing(headerTranslateY, {
                            toValue: 0,
                            duration: animationDuration,
                            useNativeDriver: true,
                        }),
                        Animated.timing(filterTranslateY, {
                            toValue: 0,
                            duration: animationDuration,
                            useNativeDriver: true,
                        }),
                        Animated.timing(imageHeight, {
                            toValue: INITIAL_IMAGE_HEIGHT,
                            duration: animationDuration,
                            useNativeDriver: false,
                        }),
                        Animated.timing(imageOpacity, {
                            toValue: 1,
                            duration: animationDuration,
                            useNativeDriver: false,
                        }),
                    ],
                    () => {
                        isHeaderVisible.current = true;
                    }
                );
                StatusBar.setBackgroundColor(statusBarColor, true);
                currentOffset.current = offsetY;
                return;
            }
            const scrollProgress = Math.min(offsetY / 200, 1);
            const newHeight =
                INITIAL_IMAGE_HEIGHT -
                (INITIAL_IMAGE_HEIGHT - COLLAPSED_IMAGE_HEIGHT) * scrollProgress;
            const newOpacity = 1 - scrollProgress * 0.3;

            imageHeight.setValue(newHeight);
            imageOpacity.setValue(newOpacity);

            const isScrollingDown = diff > 8;
            const isScrollingUp = diff < -8;

            if (isScrollingDown && isHeaderVisible.current && offsetY > 50) {
                animate(
                    [
                        Animated.timing(headerTranslateY, {
                            toValue: -HEADER_HEIGHT,
                            duration: animationDuration,
                            useNativeDriver: true,
                        }),
                        Animated.timing(filterTranslateY, {
                            toValue: -HEADER_HEIGHT + STICKY_TOP_OFFSET - 40,
                            duration: animationDuration,
                            useNativeDriver: true,
                        }),
                    ],
                    () => {
                        isHeaderVisible.current = false;
                    }
                );
                StatusBar.setBackgroundColor(statusBarColor, true);
                StatusBar.setBarStyle("light-content", true);
            } else if (isScrollingUp && !isHeaderVisible.current) {
                animate(
                    [
                        Animated.timing(headerTranslateY, {
                            toValue: 0,
                            duration: animationDuration,
                            useNativeDriver: true,
                        }),
                        Animated.timing(filterTranslateY, {
                            toValue: 0,
                            duration: animationDuration,
                            useNativeDriver: true,
                        }),
                    ],
                    () => {
                        isHeaderVisible.current = true;
                    }
                );
                StatusBar.setBackgroundColor(statusBarColor, true);
            }

            currentOffset.current = offsetY;
        },
        [
            refreshing,
            animate,
            headerTranslateY,
            filterTranslateY,
            imageHeight,
            imageOpacity,
            HEADER_HEIGHT,
            INITIAL_IMAGE_HEIGHT,
            COLLAPSED_IMAGE_HEIGHT,
            STICKY_TOP_OFFSET,
            statusBarColor,
        ]
    );

    return useMemo(
        () => ({
            headerTranslateY,
            filterTranslateY,
            imageHeight,
            imageOpacity,
            handleScroll,
            INITIAL_IMAGE_HEIGHT,
            HEADER_HEIGHT
        }),
        [handleScroll]
    );
}
