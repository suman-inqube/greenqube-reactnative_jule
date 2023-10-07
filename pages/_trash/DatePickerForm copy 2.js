import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import ImageForm from '../Common/ImageForm';
import DatePicker from 'react-native-date-picker'
const DatePickerForm = () => {
  const [date, setDate] = useState(new Date())
  const [open, setOpen] = useState(false)

  const handleDatePicker = (date) => {
    // setDate(date)
    console.log(date);
  }
  return (
    <>
      <View>
        <TouchableOpacity onPress={() => setOpen(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={styles.simpleInputTextStyle}
            />
            <ImageForm
              source={require('../Common/images/date.png')}
              resizeMode="cover"
              height={30}
              width={30}
            />
          </View>
        </TouchableOpacity>
        <DatePicker
          modal
          mode="date"
          open={open}
          date={date}
          onConfirm={(date) => {
            handleDatePicker(date)
            setOpen(false)
          }}
          onCancel={() => {
            setOpen(false)
          }}
        />
      </View>
    </>
  );
};

export default DatePickerForm;

const styles = StyleSheet.create({

  simpleInputTextStyle: {
    flex: 1,
    borderRadius: 8,
    height: 40,
    borderColor: 'gray',
    borderWidth: 0.5,
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 10,
  },

})
