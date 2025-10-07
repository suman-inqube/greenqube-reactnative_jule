import React, {useState, useMemo, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const FarmerHeadDropDown = ({color, label, data, onChange, val}) => {
  const labelString = label.charAt(0).toUpperCase() + label.slice(1);
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState(null);
  const [searchText, setSearchText] = useState('');
  const dropdownRef = useRef(null);
  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter(item =>
      item.label.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [data, searchText]);
  // const data = [
  //     { label: 'Item 1', value: '1' },
  //     { label: 'Item 2', value: '2' },
  //     { label: 'Item 3', value: '3' },
  //     { label: 'Item 4', value: '4' },
  //     { label: 'Item 5', value: '5' },
  //     { label: 'Item 6', value: '6' },
  //     { label: 'Item 7', value: '7' },
  //     { label: 'Item 8', value: '8' },
  // ];
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
          style={styles.inputSearchStyle}
          placeholder="Search..."
          placeholderTextColor="#575200"
          onChangeText={text => setSearchText(text)}
          value={searchText}
        />
        <View>
          {searchText ? (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                props.onChangeText?.('');
              }}
              style={styles.closeButton}>
              <MaterialIcons name="search" size={20} color="#575200" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={closeDropdown}>
              <MaterialIcons name="close" size={20} color="#575200" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderItem = (item, selected) => {
    return (
      <View
        style={[
          styles.itemContainer,
          selected && {backgroundColor: '#13743e'},
        ]}>
        <View style={styles.itemTextWrapper}>
          <Text style={[styles.itemText, selected && {color: 'white'}]}>
            {item.label}
          </Text>
        </View>
      </View>
    );
  };
  const selectedItem = data.find(item => item.value === val);
  const displayValue = selectedItem ? selectedItem.label : 'Select an option';
  return (
    <>
      <View>
        <Text style={[styles.labelText, {color: color ?? 'black'}]}>
          {labelString}
        </Text>
        <View style={styles.container}>
          <Dropdown
            mode="modal"
            style={styles.dropdown}
            placeholderStyle={[styles.placeholderStyle, {color: 'black'}]}
            selectedTextStyle={[styles.selectedTextStyle, {color: 'black'}]}
            inputSearchStyle={[styles.inputSearchStyle, {color: 'black'}]}
            itemTextStyle={styles.itemTextStyle}
            iconStyle={styles.iconStyle}
            data={filteredData}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={displayValue}
            // placeholder={!val ? label : '...'}
            searchPlaceholder="Search..."
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={onChange}
            value={val}
            dropdownStyle={styles.dropdownStyle}
            containerStyle={styles.containerStyle}
            renderItem={renderItem}
            renderInputSearch={renderSearchInput}
          />
        </View>
      </View>
    </>
  );
};

export default FarmerHeadDropDown;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 10,
  },
  dropdown: {
    height: 50,
    borderColor: '#13743e',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    width: '100%',
    elevation: 1,
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
    backgroundColor: '#b0d5b8',
  },
  containerStyle: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: '#13743e',
    paddingBottom: 10,
    width: '95%',
    alignSelf: 'center',
    maxHeight: 400,
    marginTop: 5,
  },
  itemContainer: {
    padding: 10,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 10,
    backgroundColor: '#ebf6ed',
    width: '90%',
    marginVertical: 15,
    borderRadius: 15,
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  closeButton: {
    padding: 8,
    marginLeft: 25,
  },
  labelText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    marginHorizontal: 5,
    marginBottom: 5,
  },

  //////////////////////////////////////////
  //   container: {
  //     alignItems: 'center',
  //     marginBottom: 15,
  //     backgroundColor: '#e7dbdb',
  //     borderRadius: 10,
  //   },
  //   dropdown: {
  //     height: 48,
  //     // height: 40,
  //     borderColor: '#fcf7f7',
  //     borderWidth: 1.3,
  //     borderRadius: 8,
  //     paddingHorizontal: 8,
  //     backgroundColor: '#ffffff',
  //     width: '100%',
  //     elevation: 1,
  //   },
  //   icon: {
  //     marginRight: 5,
  //   },
  //   label: {
  //     position: 'absolute',
  //     backgroundColor: 'white',
  //     left: 22,
  //     top: 8,
  //     zIndex: 999,
  //     paddingHorizontal: 8,
  //     color: '#000',
  //     fontFamily: 'Poppins-Regular',
  //     fontSize: 14,
  //   },
  //   placeholderStyle: {
  //     color: '#000',
  //     fontFamily: 'Poppins-Regular',
  //     fontSize: 14,
  //   },
  //   selectedTextStyle: {
  //     color: '#000',
  //     fontFamily: 'Poppins-Regular',
  //     fontSize: 14,
  //   },
  //   iconStyle: {
  //     width: 20,
  //     height: 20,
  //   },
  //   inputSearchStyle: {
  //     color: '#000',
  //     fontFamily: 'Poppins-Regular',
  //   },
  //   itemTextStyle: {
  //     color: '#000',
  //     fontFamily: 'Poppins-Regular',
  //   },
});
