import { StyleSheet, View } from 'react-native';
import React from 'react';
import CheckBox from 'react-native-check-box';

const CheckBoxComp = ({ onCheckBox, arrayKey, isChecked, title }) => {
  let value = false;

  if (isChecked === undefined) {
    value = false;
  } else if (isChecked !== '') {
    value = true;
  } else if (isChecked === '') {
    value = false;
  }

  return (
    <View style={styles.container}>
      <CheckBox
        style={{ flex: 1, padding: 10 }}
        onClick={() => onCheckBox(title, arrayKey)}
        isChecked={value}
        rightText={title}
        rightTextStyle={{
          color: '#000',
          fontFamily: 'Poppins-Regular',
        }}
        checkedCheckBoxColor="green"
        uncheckedCheckBoxColor="#ccc"
      />
    </View>
  );
};

export default CheckBoxComp;

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
});
