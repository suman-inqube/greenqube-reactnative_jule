import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import InputTextForm from '../Common/InputTextForm';
import ButtonForm from '../Common/ButtonForm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropdownForm from '../Common/DropdownForm1';


const courseDAta = [
    { label: 'dit', value: '1' },
    { label: 'dwd', value: '2' },
    { label: 'dca', value: '3' },
    { label: 'adca', value: '4' },
    { label: 'tally', value: '5' }
];
const SpreadOperator = () => {
    const [studentInfo, setstudentInfo] = React.useState({
        name: "", age: "", course: ""
    });
    const saveHandle = async () => {
        try {
            await AsyncStorage.setItem('studentInfo_data', JSON.stringify(studentInfo));
        } catch (error) {
            console.error('Error adding  data:', error);
        }
        console.log(studentInfo);
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
        if (studentInfo_data) {
            setstudentInfo(studentInfo_data);
        }
        console.log("local data:", studentInfo_data);
    }

    const countryAPI = async () => {
        const res = await countryDataListAPI();
        console.log(res);
    }

    useEffect(() => {
        countryAPI();
        // const axiosConfig = {
        //     headers: {
        //         'information': `localhost,1`,
        //         'Accept': 'application/json'
        //     },
        // };
        // async function fetchData() {
        //     try {
        //         const userData = await getUserById(url); // Replace with the user ID you want to fetch
        //         // setUser(userData);
        //         console.log(userData);
        //     } catch (error) {
        //         console.error('Error fetching user data:', error);
        //     }
        // }

        // fetchData();

        // getDataFromLocalStorage();

    }, []);
    return (
        <View>
            <InputTextForm label="name" onChangeText={name => setstudentInfo({ ...studentInfo, name: name })} value={studentInfo.name ?? ''} />
            <InputTextForm label="age" onChangeText={age => setstudentInfo({ ...studentInfo, age: age })} value={studentInfo.age ?? ''} />
            <DropdownForm label="course" data={courseDAta} onChange={course => setstudentInfo({ ...studentInfo, course: course })} value1={studentInfo.course ?? ''} />
            <ButtonForm label="Save DAta" onPress={() => saveHandle()} />
            <ButtonForm label="remove DAta" onPress={() => removeHandle()} />
        </View>
    )
}

export default SpreadOperator

const styles = StyleSheet.create({})
