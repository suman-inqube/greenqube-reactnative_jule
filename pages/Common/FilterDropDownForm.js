import React, {useState, memo, useEffect} from 'react';
import {View, StyleSheet, Text, useColorScheme} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';

const FilterDropDownForm = ({
  color,
  label,
  data,
  onChange,
  val,
  diffLabel,
  disable,
  dropdownStyle,
}) => {
  const scheme = useColorScheme();
  const labelString = label.charAt(0).toUpperCase() + label.slice(1);
  const [isFocus, setIsFocus] = useState(false);
  const [filterData, setFilterData] = useState([]);
  useEffect(() => {
    console.log('data', data);
    const filtered = data.filter(item => item.value === val);
    setFilterData(filtered);
  }, []);
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
            searchField={false}
            placeholderStyle={[styles.placeholderStyle, {color: 'black'}]}
            selectedTextStyle={[styles.selectedTextStyle, {color: 'black'}]}
            inputSearchStyle={[styles.inputSearchStyle, {color: 'black'}]}
            itemTextStyle={styles.itemTextStyle}
            iconStyle={styles.iconStyle}
            data={filterData}
            search
            maxHeight={250}
            labelField="label"
            valueField="value"
            placeholder={diffLabel != '' ? diffLabel : ''}
            searchPlaceholder="Search..."
            onFocus={() => setIsFocus(true)}
            onChange={onChange}
            onChangeText={query => {
              if (query.length > 1) {
                const filtered = data.filter(item =>
                  item.label.toLowerCase().includes(query.toLowerCase()),
                );
                setFilterData(filtered);
              }
            }}
            value={val}
            disable={disable}
            keyboardAvoiding={true}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </>
  );
};

export default FilterDropDownForm;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#e7dbdb',
    borderRadius: 10,
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
  },
  itemTextStyle: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
});
