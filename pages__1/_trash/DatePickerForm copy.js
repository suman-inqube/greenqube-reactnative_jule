import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import DatePicker from 'react-native-date-picker'
import InputTextForm from '../Common/InputTextForm'
import InputTextFormWithoutLabel from '../Common/InputTextFormWithoutLabel'

const DatePickerForm = () => {
    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false)
    const handleTextInputPress = () => {
        // setDate(date)

        console.log("date");
    }
    return (
        <>
            <View>
                {/* <Button title="Open" onPress={() => setOpen(true)} /> */}
                <Text>Click the TextInput:</Text>
                <TouchableOpacity onPress={handleTextInputPress}>
                    <TextInput
                        placeholder="Type here"
                        style={{
                            borderWidth: 1,
                            borderColor: '#000',
                            padding: 10,
                            marginTop: 10,
                        }}
                    />
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
    )
}

export default DatePickerForm


