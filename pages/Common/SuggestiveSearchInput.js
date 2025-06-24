import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const SuggestiveSearchInput = ({placeholder,onSelect, fetchSuggestions}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length >= 3) {
        fetchSuggestions(query)
          .then(setSuggestions)
          .catch(() => setSuggestions([]));
      } else {
        setSuggestions([]);
      }
    }, 1000); // debounce API call
    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder || 'Search...'}
        value={query?.properties?.full_address}
        onChangeText={setQuery}
        style={styles.input}
      />

      {suggestions.length > 0 && (
        <View style={styles.suggestionBox}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item);
                  setQuery(item); // Optional: set selected item to input
                  setSuggestions([]);
                }}>
                <Text style={styles.suggestionItem}>
                  {item?.properties?.full_address}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {width: '100%'},
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor:'#ccc'
  },
  suggestionBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 5,
    maxHeight: 150,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    color:'#000'
  },
});

export default SuggestiveSearchInput;
