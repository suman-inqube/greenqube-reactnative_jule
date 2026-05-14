import React from 'react';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import {SPSheet} from '@sekizlipenguen/react-native-popup-confirm-toast';
import DropdownForm from '../Common/DropdownForm';
import {Colors, Fonts} from '../utils/Constants';
import RadioForm from '../Common/RadioForm';
export const openFilterSheet = ({
  options = [],
  onSelect = () => {},
  title = 'Select Filter',
  dropdownData = [],
  onchangeFilterItem,
}) => {
  SPSheet.show({
    component: () => (
      <View style={{padding: 15}}>
        {/* <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#000' }}>
                    {title}
                </Text> */}

        {/* Optional dropdown */}
        {dropdownData.length > 0 && (
          <DropdownForm
            data={dropdownData}
            label={title}
            labelField="label"
            valueField="value"
            placeholder="Select an option"
            onChange={item => {
              console.log('Dropdown selected:', item);
            }}
            style={{marginBottom: 20}}
          />
        )}
        <View
          style={{padding: 10, height: 140, justifyContent: 'space-between'}}>
          <RadioForm
            label={'farmer name'}
            onSelect={() => onchangeFilterItem('Farmer/Product Name')}
          />
          <RadioForm
            label={'farmer name'}
            onSelect={() => onchangeFilterItem('PhoneNumber')}
          />
          <RadioForm
            label={'farmer name'}
            onSelect={() => onchangeFilterItem('Category')}
          />
        </View>
        {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    <TouchableOpacity style={{ borderWidth: 1, borderRadius: 50, borderColor: Colors.useGreen, width: '45%', padding: 10, alignItems: 'center' }}>
                        <Text style={{ color: Colors.text, fontFamily: Fonts.Medium }}>cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ borderWidth: 1, borderRadius: 50, borderColor: Colors.useGreen, width: '45%', padding: 10, alignItems: 'center', backgroundColor: Colors.useGreen }}>
                        <Text style={{ color: Colors.background, fontFamily: Fonts.Medium }}>View Result</Text>
                    </TouchableOpacity>
                </View> */}
      </View>
    ),
    height: 220,
    sheetStyle: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    closeOnTouchBackdrop: true,
    draggable: true,
  });
};
