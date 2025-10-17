import {StyleSheet, Text, View} from 'react-native';
import React, {memo} from 'react';
import DatePicker from 'react-native-date-picker';

const DatePickerComp = ({
  openDate,
  newDate,
  setOpenDate,
  handleDatePicker,
  minimumDate,
  maximumDate,
  title,
}) => {
  return (
    <DatePicker
      modal
      mode="date"
      open={openDate}
      date={newDate || new Date()} // Default to today if no date passed
      minimumDate={minimumDate || null} // If no minimumDate, allow all
      maximumDate={maximumDate || null}
      onConfirm={item => {
        handleDatePicker(item);
        setOpenDate(false);
      }}
      onCancel={() => {
        setOpenDate(false);
      }}
      textColor="green"
      buttonColor="green"
      dividerColor="green"
      title={title || 'Select Date'}
      theme="light"
      androidVariant="nativeAndroid"
    />
  );
};

export default memo(DatePickerComp);
