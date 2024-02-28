import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import InputTextForm from '../Common/InputTextForm';
import ButtonForm from '../Common/ButtonForm';
import AsyncStorage from '@react-native-async-storage/async-storage';
const SpreadOperator = () => {
    const [myEdit, setmyEdit] = useState([]);
    const [studentInfo, setstudentInfo] = React.useState({
        name: "", age: 0, course: ""
    });

    const saveHandle = async () => {
        try {
            await AsyncStorage.setItem('studentInfo_data', JSON.stringify(studentInfo));
        } catch (error) {
            console.error('Error adding  data:', error);
        }

    }
    const removeHandle = async () => {
        try {
            await AsyncStorage.removeItem('studentInfo_data');
            console.log('Data removed successfully.');
        } catch (error) {
            console.error('Error removing data:', error);
        }
    }
    const getDataFromLocalStorage = async () => {
        const studentInfo_data1 = await AsyncStorage.getItem("studentInfo_data");
        const studentInfo_data = JSON.parse(studentInfo_data1);
        console.log("local data:", studentInfo_data);
    }
    useEffect(() => {
        getDataFromLocalStorage();
    }, []);
    return (
        <View>
            <InputTextForm label="name" onChangeText={name => setstudentInfo({ ...studentInfo, name: name })} value={studentInfo.name} />
            <InputTextForm label="age" onChangeText={age => setstudentInfo({ ...studentInfo, age: age })} />
            <InputTextForm label="course" onChangeText={course => setstudentInfo({ ...studentInfo, course: course })} value={studentInfo.course} />
            <ButtonForm label="Save DAta" onPress={() => saveHandle()} />
            <ButtonForm label="remove DAta" onPress={() => removeHandle()} />
        </View>
    )
}

export default SpreadOperator

const styles = StyleSheet.create({})
