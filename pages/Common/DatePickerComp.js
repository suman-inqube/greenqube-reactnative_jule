import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import DatePicker from 'react-native-date-picker'
const DatePickerComp = ({
    openDate,
    newDate,
    setOpenDate,
    handleDatePicker,
    minimumDate
}) => {
    return (
        <DatePicker
            modal
            mode="date"
            open={openDate}
            date={newDate}
            minimumDate={minimumDate}
            onConfirm={(item) => {
                handleDatePicker(item)
                setOpenDate(false)
            }}
            onCancel={() => {
                setOpenDate(false)
            }}
        />
    )
}
export default DatePickerComp
const styles = StyleSheet.create({})
