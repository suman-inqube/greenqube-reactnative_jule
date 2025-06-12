import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RadioButton from './RadioButton';


const RadioGroup = ({navigation,spSheet,options}) => {
  const [selectedId, setSelectedId] = useState(null);
  const handleChangeNavigate=(item)=>{
    if(item.id=="AWD"){
        setTimeout(() => {
            spSheet.hide();
            navigation.navigate(item.navigation);
        }, 500);
    }else{
        setTimeout(() => {
            spSheet.hide();
            navigation.navigate(item.navigation);
        }, 500);
    }

}
  return (
    <View style={styles.wrapper}>
      {/* <Text style={styles.heading}>Select an Option:</Text> */}
      <View style={styles.cardRow}>
        {options.map((item) => (
          <RadioButton
            key={item.id}
            item={item}
            selected={selectedId === item.id}
            onSelect={() => {setSelectedId(item.id),handleChangeNavigate(item)}}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectionText: {
    marginTop: 20,
    fontSize: 16,
    color: '#2e7d32',
  },
});

export default RadioGroup;
