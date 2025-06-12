import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CheckBox from 'react-native-check-box'
const CheckBoxComp = ({ onCheckBox, arrayKey, isChecked, title }) => {
  let value = false;
  if(isChecked== undefined){
    value = false;
  }else if (isChecked !== "") {
    value = true;
  }else if (isChecked == "") {
    value = false;
  }
  return (
    <View>
      <CheckBox
        style={{ flex: 1, padding: 10  }}
        checkBoxColor={'green'}
        onClick={() => onCheckBox(title, arrayKey)}
        isChecked={value}
        rightTextStyle={{color:'#000',fontFamily:"Poppins-Regular"}}
        rightText={title}
      />
    </View>
  )
}

export default CheckBoxComp

const styles = StyleSheet.create({})