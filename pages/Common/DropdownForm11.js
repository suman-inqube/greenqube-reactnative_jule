import React, { useState, memo, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  useColorScheme,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const DropdownForm = ({
  color,
  label,
  data,
  onChange,
  val,
  disable,
  selectedValue,
  containerStyle,
  dropdownStyle,
  placeholderStyle,
  selectedTextStyle,
  inputSearchStyle,
  itemTextStyle,
  iconStyle,
  dropdownListStyle,
  modalContainerStyle,
  itemContainerStyle,
  activeItemStyle,
  labelStyle,
  width = '100%',
  height = 50,
  searchPlaceholder = 'Search',
  dropdownPlaceholder = '',
}) => {
  const scheme = useColorScheme();
  const labelString = label.charAt(0).toUpperCase() + label.slice(1);
  const [isFocus, setIsFocus] = useState(false);
  const [searchText, setSearchText] = useState('');

  const dropdownRef = useRef(null);

  const filteredData = useMemo(() => {
    if (!searchText) return [...data];
    return data.filter(item =>
      item.label.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [data, searchText]);

  const closeDropdown = () => {
    if (dropdownRef.current) {
      dropdownRef.current.close();
    }
    setIsFocus(false);
  };

  const renderSearchInput = props => {
    return (
      <View style={styles.searchContainer}>
        <TextInput
          {...props}
          style={[styles.inputSearchStyle, inputSearchStyle]}
          placeholder={searchPlaceholder}
          placeholderTextColor="#575200"
          onChangeText={text => setSearchText(text)}
          value={searchText}
        />
        {searchText ? (
          <TouchableOpacity
            onPress={() => {
              setSearchText('');
              props.onChangeText?.('');
              closeDropdown();
            }}
            style={styles.closeButton}>
            <MaterialIcons name="search" size={20} color="#575200" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => closeDropdown()}>
            <MaterialIcons name="close" size={20} color="#575200" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const sortedData = [...data].sort((a, b) => {
    if (a.value === val) return -1;
    if (b.value === val) return 1;
    return 0;
  });
  const selectedItem =
    data.find(item => item.value === selectedValue) ||
    data.find(item => item.value === val);
  const renderItem = (item, selected) => {
    return (
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
    );
  };
  return (
    <>
      <View>
        <Text
          style={{
            marginHorizontal: 5,
            marginBottom: 5,
            color: color ?? 'black',
            fontFamily: 'Poppins-Regular',
          }}>
          {labelString}
        </Text>
        <View style={styles.container}>
          <Dropdown
            mode="modal"
            style={[styles.dropdown, dropdownStyle]}
            placeholderStyle={[styles.placeholderStyle, placeholderStyle]}
            selectedTextStyle={[styles.selectedTextStyle, selectedTextStyle]}
            inputSearchStyle={[styles.inputSearchStyle, inputSearchStyle]}
            itemTextStyle={[styles.itemTextStyle, itemTextStyle]}
            iconStyle={[styles.iconStyle, iconStyle]}
            data={filteredData}
            search
            maxHeight={250}
            labelField="label"
            valueField="value"
            placeholder={!val ? dropdownPlaceholder : String(val)}
            searchPlaceholder={searchPlaceholder}
            onFocus={() => setIsFocus(true)}
            onChange={onChange}
            value={selectedItem}
            disable={disable}
            keyboardAvoiding={true}
            showsVerticalScrollIndicator={false}
            dropdownStyle={[
              styles.dropdownStyle,
              dropdownListStyle,
              { width, height },
            ]}
            containerStyle={[styles.containerStyle, modalContainerStyle]}
            // activeColor="#345f44"
            renderItem={renderItem}
            ref={dropdownRef}
            renderInputSearch={renderSearchInput}
            searchQuery={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>
    </>
  );
};

export default memo(DropdownForm);

const styles = StyleSheet.create({
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
  container: {
    alignItems: 'center',
    marginBottom: 15,
    // backgroundColor: '#e7dbdb',
    borderRadius: 10,
  },
  dropdown: {
    height: 48,
    // height: 40,
    borderColor: '#828282',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#eaeaea',
    width: '100%',
    elevation: 1,
    width: 330,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
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
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    borderRadius: 10,
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
    borderRadius: 20, //  Modal border radius set to 10
    borderWidth: 0.8,
    borderColor: '#13743e',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#ebf6ed',
    width: '95%',
    // marginLeft: 10,
    marginVertical: 15,
    borderRadius: 15,
    alignSelf: 'center',
  },
  closeButton: {
    padding: 8,
    marginLeft: 5,
  },
  inputSearchStyle: {
    flex: 1,
    color: 'black',
    fontFamily: 'Poppins-Regular',
    borderRadius: 10,
    paddingRight: 10,
  },
});
