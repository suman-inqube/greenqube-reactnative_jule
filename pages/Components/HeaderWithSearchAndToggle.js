// src/components/Common/HeaderWithSearchAndToggle.js
import React ,{memo}from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import ImageForm from '../Common/ImageForm';
import { Colors } from '../utils/Constants';

const HeaderWithSearchAndToggle = ({
  titleSearch,
  setTitleSearch,
  onSearch,
  isGridView,
  onToggleView,
  placeholder = 'Search...',
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.textInputContainer}>
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={'#999'}
            style={styles.textInput}
            value={titleSearch}
            onChangeText={setTitleSearch}
            onSubmitEditing={onSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity onPress={onSearch} style={styles.searchIcon}>
          <ImageForm
            source={require('../Common/images/search.png')}
            resizeMode="cover"
            height={24}
            width={24}
          />
        </TouchableOpacity>
      </View>

      {/* Toggle Button */}
      <TouchableOpacity onPress={onToggleView} style={styles.toggleButton}>
        {isGridView ? (
          <Image
            source={require('../Common/images/view_list.png')}
            style={styles.toggleIcon}
          />
        ) : (
          <Image
            source={require('../Common/images/view_grid.png')}
            style={styles.toggleIcon}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 7,
    backgroundColor: Colors.background_light,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: '3%',
    marginLeft: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  textInputContainer: {
    flex: 1,
  },
  textInput: {
    height: 48,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  searchIcon: {
    padding: 8,
  },
  toggleButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  toggleIcon: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
});

export default memo(HeaderWithSearchAndToggle) ;
