import { StyleSheet, Text, View } from 'react-native'
import React, { memo } from 'react'
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
            // fadeToColor='red'
            // androidVariant='iosClone'
            textColor='#000'
            theme='light'
            androidVariant='nativeAndroid'
        />
    )
}
export default memo(DatePickerComp)
const styles = StyleSheet.create({})
