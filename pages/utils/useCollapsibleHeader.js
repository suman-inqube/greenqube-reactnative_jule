// hooks/useCollapsibleHeader.js
import { useRef, useMemo } from "react";
import { Animated, StatusBar, Platform } from "react-native";
const DEFAULT_HEADER_CONFIG = {
  HEADER_HEIGHT: 60,
  INITIAL_IMAGE_HEIGHT: 160,
  COLLAPSED_IMAGE_HEIGHT: 135,
  STICKY_TOP_OFFSET: 40,
  statusBarColor: "#003c04",
};
export default function useCollapsibleHeader(config = DEFAULT_HEADER_CONFIG) {
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
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false, // opacity & height need false, transforms can be true
      listener: ({ nativeEvent }) => {
        const offsetY = nativeEvent.contentOffset.y;
        if (offsetY > 50) {
          StatusBar.setBackgroundColor(statusBarColor, true);
          StatusBar.setBarStyle("light-content", true);
        } else {
          StatusBar.setBackgroundColor(statusBarColor, true);
          StatusBar.setBarStyle("light-content", true);
        }
      },
    }
  );

  return useMemo(
    () => ({
      headerTranslateY,
      filterTranslateY,
      imageHeight,
      imageOpacity,
      handleScroll,
      HEADER_HEIGHT,
      INITIAL_IMAGE_HEIGHT,
    }),
    [
      headerTranslateY,
      filterTranslateY,
      imageHeight,
      imageOpacity,
      handleScroll,
      HEADER_HEIGHT,
      INITIAL_IMAGE_HEIGHT,
    ]
  );
}
