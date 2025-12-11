import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,Dimensions
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useTheme } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CompanyDropdown = ({
  color,

  data = [],
  onChange,
  label,

  disabled = false,
  selectedValue = null,
  val = null,
  containerStyle = {},
  dropdownStyle = {},
  searchInputStyle = {},
  itemStyle = {},
  placeholderStyle,
  inputSearchStyle,
  itemTextStyle,
  iconStyle,
  dropdownListStyle,
  modalContainerStyle,
  selectedTextStyle,
  width = '100%',
  height = 50,
  searchPlaceholder = 'Search',
}) => {
  const { colors } = useTheme();

  const [searchText, setSearchText] = useState('');
  const labelString = label.charAt(0).toUpperCase() + label.slice(1);

  const [isFocus, setIsFocus] = useState(false);
  const dropdownRef = useRef(null);

  const closeDropdown = () => {
    if (dropdownRef.current) {
      dropdownRef.current.close();
    }
    setIsFocus(false);
    setSearchText('');
  };

  const renderSearchInput = props => {
    return (
      <View style={styles.searchContainer}>
        <TextInput
          {...props}
          style={[styles.inputSearchStyle, inputSearchStyle]}
          placeholder={searchPlaceholder}
          placeholderTextColor="#575200"
          value={searchText}
          onChangeText={setSearchText}
          autoFocus={true}
        />
        <TouchableOpacity onPress={closeDropdown} style={styles.closeButton}>
          <MaterialIcons name="close" size={20} color="#575200" />
        </TouchableOpacity>
      </View>
    );
  };

  const filteredData = useMemo(() => {
    // if (!searchText.trim()) return [];
    return data.filter(item =>
      item.label.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [data, searchText]);

  const displayValue = selectedValue !== null ? selectedValue : val;

  const selectedItem = useMemo(() => {
    return data.find(item => item.value === displayValue) || null;
  }, [displayValue, data]);

  // const handleChange = item => {
  //   onChange(item);
  //   setSearchText(''); // Clear search after selection
  // };

  return (
    <View>
      <Text
        style={{
          marginHorizontal: 5,
          marginBottom: 5,
          color: color ?? 'black',
          fontFamily: 'Poppins-Regular',
        }}>
        {label}
      </Text>
      <Dropdown
        ref={dropdownRef}
        data={filteredData}
        style={[styles.dropdown, dropdownStyle]}
        value={displayValue}
        selectedText={selectedItem?.label || ''}
        onChange={item => {
          onChange(item); //
        }}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        disable={disabled}
        mode="modal"
        placeholder={selectedItem?.label ?? ''}
        search
        searchPlaceholder="Search..."
        labelField="label"
        valueField="value"
        // maxHeight={300}
        showsVerticalScrollIndicator={false}
        keyboardAvoiding={true}
        dropdownStyle={[
          styles.dropdownStyle,
          dropdownListStyle,
          { width, height },
        ]}
        containerStyle={[
          styles.containerStyle,
          modalContainerStyle,
          {
            position: 'absolute',
            top: SCREEN_HEIGHT/6
            // left: '50%',
            // transform: [{ translateX: -0.5 * 300 }, { translateY: -0.5 * 400 }],
          },
        ]}

        placeholderStyle={[styles.placeholderStyle, placeholderStyle]}
        selectedTextStyle={[styles.selectedTextStyle, selectedTextStyle]}
        inputSearchStyle={[styles.inputSearchStyle, inputSearchStyle]}
        itemTextStyle={[styles.itemTextStyle, itemTextStyle]}
        iconStyle={[styles.iconStyle, iconStyle]}
        onChangeText={setSearchText}
        renderInputSearch={renderSearchInput}
        renderItem={(item, selected) => (
          <View
            style={[
              styles.itemContainer,

              selected && { backgroundColor: '#13743e' },
            ]}>
            <View style={styles.itemTextWrapper}>
              <Text style={[styles.itemText, selected && { color: 'white' }]}>
                {item.label}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 15,
    // backgroundColor: '#e7dbdb',
    borderRadius: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginHorizontal: 5,
    fontFamily: 'Poppins-Regular',
  },
  dropdown: {
    height: 48,
    borderWidth: 1,
    borderColor: '#828282',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eaeaea',
    elevation: 1,
  },
  dropdownContainer: {
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: '#13743e',
    marginTop: 4,
  },
  placeholder: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  selectedText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  searchInputContainer: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    margin: 8,
    fontFamily: 'Poppins-Regular',
  },
  searchInput: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'black',
  },
  itemContainer: {
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 8,
    borderRadius: 20,
    backgroundColor: '#abdbad',
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  itemTextWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    flex: 1,
  },
  itemText: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  placeholderStyle: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  selectedTextStyle: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  inputSearchStyle: {
    flex: 1,
    color: 'black',
    fontFamily: 'Poppins-Regular',
    borderRadius: 10,
    paddingRight: 10,
  },
  itemTextStyle: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  dropdownStyle: {
    backgroundColor: '#b0d5b8s', // Background color of the dropdown list
  },
  containerStyle: {
    backgroundColor: 'white', // Background color of the modal
    borderRadius: 20, // 👈 Modal border radius set to 10
    borderWidth: 0.8,
    borderColor: '#13743e',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#ebf6ed',
    width: '95%',
    marginLeft: 10,
    marginVertical: 15,
    borderRadius: 15,
  },
  closeButton: {
    padding: 8,
    marginLeft: 5,
  },
});

export default CompanyDropdown;