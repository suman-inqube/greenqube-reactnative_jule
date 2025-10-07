import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

// Replace with your actual API key
const GOOGLE_API_KEY = 'AIzaSyDZUR2UHEteHVQgwiGA7XJNOV5lHe0r8m4';

// Enhanced Colors and Fonts
const Colors = {
  primary: '#4285F4',
  secondary: '#34A853',
  accent: '#FBBC04',
  danger: '#EA4335',
  background: '#FFFFFF',
  background_light: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#202124',
  text_secondary: '#5F6368',
  border: '#DADCE0',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
  success: '#34A853',
  warning: '#FBBC04',
  error: '#EA4335',
};
import {Fonts} from '../utils/Constants';
const SuggestiveSearchInput = ({
  placeholder = 'Search places...',
  onSelect,
  style,
  inputStyle,
  suggestionsStyle,
  countryCode = 'IN',
  debounceTime = 500,
  minQueryLength = 2,
  maxSuggestions = 10,
  showLoader = true,
  enableCurrentLocation = true,
  setShowModal,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [hideList, setHideList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  const textInputRef = useRef(null);
  const debounceTimer = useRef(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🔹 Optimized debounced search function
  const debouncedSearch = useCallback(
    async searchQuery => {
      if (searchQuery.length < minQueryLength) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          'https://maps.googleapis.com/maps/api/place/autocomplete/json',
          {
            params: {
              input: searchQuery,
              key: GOOGLE_API_KEY,
              components: `country:${countryCode}`,
              types: 'establishment|geocode',
              sessiontoken: Date.now(), // For session-based billing
            },
            timeout: 10000, // 10 second timeout
          },
        );

        if (response.data.status === 'OK') {
          const limitedSuggestions = response.data.predictions.slice(
            0,
            maxSuggestions,
          );
          setSuggestions(limitedSuggestions);
        } else if (response.data.status === 'ZERO_RESULTS') {
          setSuggestions([]);
        } else {
          setError('No results found');
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setError('Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [countryCode, maxSuggestions, minQueryLength],
  );

  // 🔹 Effect for handling search with debounce
  useEffect(() => {
    if (hideList) return;

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      if (query.trim()) {
        debouncedSearch(query.trim());
      } else {
        setSuggestions([]);
        setLoading(false);
      }
    }, debounceTime);

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, hideList, debouncedSearch, debounceTime]);

  // 🔹 Animations for focus/blur
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: suggestions.length > 0 && !hideList ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isFocused, suggestions.length, hideList, animatedValue, fadeAnim]);

  // 🔹 Fetch detailed place information
  const fetchPlaceDetails = useCallback(async placeId => {
    try {
      setLoading(true);
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: placeId,
            key: GOOGLE_API_KEY,
            fields: 'geometry,name,formatted_address,place_id',
          },
          timeout: 10000,
        },
      );

      if (response.data.status === 'OK') {
        return {
          ...response.data.result.geometry.location,
          name: response.data.result.name,
          address: response.data.result.formatted_address,
          placeId: response.data.result.place_id,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching place details:', error);
      setError('Failed to get location details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Handle suggestion selection
  const handleSuggestionPress = useCallback(
    async item => {
      setQuery(item.description);
      setSuggestions([]);
      setHideList(true);
      setIsFocused(false);
      textInputRef.current?.blur();

      const location = await fetchPlaceDetails(item.place_id);
      if (location && onSelect) {
        onSelect({
          description: item.description,
          lat: location.lat,
          lng: location.lng,
          name: location.name,
          address: location.address,
          placeId: location.placeId,
        });
      }
    },
    [fetchPlaceDetails, onSelect],
  );

  // 🔹 Handle text input changes
  const handleTextChange = useCallback(text => {
    setQuery(text);
    setHideList(false);
    setError(null);
  }, []);

  // 🔹 Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setHideList(false);
  }, []);

  // 🔹 Handle blur
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsFocused(false);
    }, 150); // Delay to allow suggestion tap
  }, []);

  // 🔹 Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setHideList(false);
    setError(null);
    textInputRef.current?.focus();
  }, []);

  // 🔹 Render suggestion item
  const renderSuggestionItem = useCallback(
    ({item, index}) => (
      <TouchableOpacity
        style={[
          styles.suggestionItem,
          index === suggestions.length - 1 && styles.lastSuggestionItem,
        ]}
        onPress={() => handleSuggestionPress(item)}
        activeOpacity={0.7}>
        <View style={styles.suggestionContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.locationIcon}>📍</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.mainText} numberOfLines={1}>
              {item.structured_formatting?.main_text || item.description}
            </Text>
            <Text style={styles.secondaryText} numberOfLines={1}>
              {item.structured_formatting?.secondary_text || ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleSuggestionPress, suggestions.length],
  );

  // 🔹 Get key for FlatList items
  const keyExtractor = useCallback(item => item.place_id || item.id, []);

  // 🔹 Animated border color
  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.primary],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <Animated.View
          style={[
            styles.inputWrapper,
            // { borderColor }
            suggestions.length != 0 ||
            (!hideList &&
              query.length >= minQueryLength &&
              suggestions.length === 0 &&
              !loading &&
              !error)
              ? {
                  borderRadius: 0,
                  borderTopRightRadius: 20,
                  borderTopLeftRadius: 20,
                  borderBottomWidth: 1,
                  borderColor: Colors.border,
                }
              : {},
          ]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowModal(false)}>
            <MaterialIcons
              name="arrow-back"
              size={25}
              color="#424242ff"
              style={styles.icon}
            />
          </TouchableOpacity>
          <TextInput
            ref={textInputRef}
            placeholder={placeholder}
            value={query}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[styles.input, inputStyle]}
            placeholderTextColor={Colors.text_secondary}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="while-editing" // iOS only
          />

          {loading && showLoader && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          )}

          {query.length > 0 && !loading && Platform.OS === 'android' && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Suggestions List */}
        {!hideList && suggestions.length > 0 && (
          <Animated.View
            style={[
              styles.suggestionBox,
              suggestionsStyle,
              {opacity: fadeAnim},
            ]}>
            <FlatList
              data={suggestions}
              keyExtractor={keyExtractor}
              renderItem={renderSuggestionItem}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={10}
              removeClippedSubviews={true}
              // getItemLayout={(data, index) => ({
              //   length: 60,
              //   offset: 60 * index,
              //   index,
              // })}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListFooterComponent={
                suggestions.length >= maxSuggestions ? (
                  <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>
                      Showing {maxSuggestions} results
                    </Text>
                  </View>
                ) : null
              }
              style={styles.flatList}
            />
          </Animated.View>
        )}

        {/* No Results */}
        {!hideList &&
          query.length >= minQueryLength &&
          suggestions.length === 0 &&
          !loading &&
          !error && (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No places found</Text>
            </View>
          )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1000,
  },
  inputContainer: {
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.border,
    // elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 20,
    fontSize: 15,
    color: Colors.text,
    fontFamily: Fonts.Regular,
  },
  loaderContainer: {
    paddingHorizontal: 15,
  },
  clearButton: {
    paddingRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: Colors.text_secondary,
    fontFamily: Fonts.Medium,
  },
  errorContainer: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    fontFamily: Fonts.Regular,
  },
  suggestionBox: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    // borderRadius: 8,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    // elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 1001,
    overflow: 'hidden',
  },
  flatList: {
    flexGrow: 1,
  },
  suggestionItem: {
    backgroundColor: Colors.surface,
  },
  lastSuggestionItem: {
    borderBottomWidth: 0,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    minHeight: 60,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background_light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  locationIcon: {
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  mainText: {
    fontSize: 15,
    color: Colors.text,
    fontFamily: Fonts.Medium,
    marginBottom: 4,
  },
  secondaryText: {
    fontSize: 13,
    color: Colors.text_secondary,
    fontFamily: Fonts.Regular,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  footerContainer: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  footerText: {
    fontSize: 12,
    color: Colors.text_secondary,
    fontFamily: Fonts.Regular,
  },
  noResultsContainer: {
    position: 'absolute',
    top: 62,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    // elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: Colors.text_secondary,
    fontFamily: Fonts.Regular,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SuggestiveSearchInput;
