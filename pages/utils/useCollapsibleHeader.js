
import { useRef, useMemo } from "react";
import { Animated, StatusBar, Platform } from "react-native";

const DEFAULT_HEADER_CONFIG = {
  HEADER_HEIGHT: 60,
  INITIAL_IMAGE_HEIGHT: 160,
  COLLAPSED_IMAGE_HEIGHT: 135,
  STICKY_TOP_OFFSET: 40,
  statusBarColor: "#003c04",
};

export default function useCollapsibleHeader(config = {}) {
  const {
    HEADER_HEIGHT,
    INITIAL_IMAGE_HEIGHT,
    COLLAPSED_IMAGE_HEIGHT,
    STICKY_TOP_OFFSET,
    statusBarColor,
  } = { ...DEFAULT_HEADER_CONFIG, ...config };

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT * 2],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: "clamp",
  });

  const filterTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT * 2],
    outputRange: [0, -HEADER_HEIGHT + STICKY_TOP_OFFSET - 40],
    extrapolate: "clamp",
  });

  const imageHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [INITIAL_IMAGE_HEIGHT, COLLAPSED_IMAGE_HEIGHT],
    extrapolate: "clamp",
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.7],
    extrapolate: "clamp",
  });

  const handleScroll = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
          useNativeDriver: false,
          listener: ({ nativeEvent }) => {
            const offsetY = nativeEvent.contentOffset.y;

            // Android only: iOS does not support setBackgroundColor
            if (Platform.OS === "android") {
              StatusBar.setBackgroundColor(statusBarColor, true);
            }

            StatusBar.setBarStyle("light-content", true);
          },
        }
      ),
    [scrollY, statusBarColor]
  );

  return {
    headerTranslateY,
    filterTranslateY,
    imageHeight,
    imageOpacity,
    handleScroll,
    HEADER_HEIGHT,
    INITIAL_IMAGE_HEIGHT,
  };
}
