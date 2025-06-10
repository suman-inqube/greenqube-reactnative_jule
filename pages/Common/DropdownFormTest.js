import React from 'react';
import { View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const DropdownFormTest = ({ selectedValue, onValueChange }) => {
    const data = [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ];
    
  return (
    <View>
    <Text>Role</Text>
    <Dropdown
        data={data}
        labelField="label"
        valueField="value"
        placeholder="Select Role"
        value={selectedValue}
        onChange={onValueChange} // Pass onValueChange correctly
        testID="dropdown" // Ensure testID is correctly set
      />
  </View>
  )
}

export default DropdownFormTest