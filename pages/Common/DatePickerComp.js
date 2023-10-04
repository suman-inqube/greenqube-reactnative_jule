import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import DatePicker from 'react-native-date-picker'
const DatePickerComp = ({
    openDate,
    newDate,
    setOpenDate
}) => {
    return (
        <DatePicker
            modal
            mode="date"
            open={openDate}
            date={newDate}
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