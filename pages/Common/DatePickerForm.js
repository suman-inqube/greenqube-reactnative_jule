import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import ImageForm from '../Common/ImageForm';
import DatePicker from 'react-native-date-picker'
const DatePickerForm = () => {
  const [newdate, setnewDate] = useState(new Date())
  const [open, setOpen] = useState(false)
  const [cdate, setCdate] = useState("welcome")

  const handleDatePicker = (item) => {
    const dt = new Date(item);
    const x = dt.toISOString().split('T');
    const x1 = x[0].split('-');
    console.log(x1[2] + '/' + x1[1] + '/' + x1[0]);
    setCdate(x1[2] + '/' + x1[1] + '/' + x1[0]);
    console.log(item);
  }
  return (
    <>
      <Text>new work {cdate}</Text>
      <View style={styles.passwordMainContainer}>
        <View style={styles.passwordContainer}>
          <TextInput style={styles.inputTextStyle} value={cdate} />
          <TouchableOpacity onPress={() => setOpen(true)}>
            <ImageForm
              source={require('../Common/images/date.png')}
              resizeMode="cover"
              height={30}
              width={30}
            />
          </TouchableOpacity>
          <DatePicker
            modal
            mode="date"
            open={open}
            date={newdate}
            onConfirm={(item) => {
              handleDatePicker(item)
              setOpen(false)
            }}
            onCancel={() => {
              setOpen(false)
            }}
          />
        </View>
      </View>
    </>
  );
};

export default DatePickerForm;

const styles = StyleSheet.create({

  passwordMainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    width: '100%',
    paddingEnd: 8,
    backgroundColor: 'white',
    height: 40,
    marginBottom: 15,
  },
  inputTextStyle: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
    borderColor: 'gray',
  },
})
