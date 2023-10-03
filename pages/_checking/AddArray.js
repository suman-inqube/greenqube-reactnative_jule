import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ButtonForm from '../Common/ButtonForm';

const AddArray = () => {
    const [storeData, setstoreData] = useState([]);
    const handleOver = () => {
        console.log(storeData)
    }
    useEffect(() => {

        // Define an array containing one object with a key and a specific key name
        const arrayToAdd = [{ keyName: 'value' }];

        // Define an existing array of objects
        const existingArray = [
            {
                id: 1,
                name: 'Alice',
            },
            {
                id: 2,
                name: 'Bob',
            },
        ];

        // Specify the key under which to add the array within the existing objects
        const keyToAddTo = 'customKey';

        // Iterate through the existing array and add the arrayToAdd under the specified key
        const combinedArray = existingArray.map((obj) => ({
            ...obj, // Copy the existing object properties
            [keyToAddTo]: arrayToAdd, // Add the array under the specified key
        }));

        console.log(combinedArray);



        // const inputData = {
        //     photo: "",
        // }

        // const main = {
        //     "name": "sahitya",
        //     "course": "MCA",
        // }
        // const sub = {
        //     jan: 5000,
        //     feb: 10000,
        // };
        // const child = [
        //     {
        //         jan: 900,
        //         feb: 800
        //     },
        //     {
        //         jan: 900,
        //         feb: 800
        //     }
        // ];

        // const data = {};
        // data["student"] = main;
        // const photo = {
        //     photo: ""
        // }
        // data['fee'] = fee1;
        // const label1 =
        // {
        //     student
        // }
        // const mergedData = {
        //     data: [...data],
        //     photo: "",
        // };
        // console.log(mergedData);
        // const data = [
        //     student = {
        //         "name": 'ValidationError',
        //         course: "MCA"
        //     },
        // ]
        // const data1 = {
        // }
        // data1['fee'] = fee1;
        // console.log(data1);
        // inputData['fee'] = data1;
        // inputData['data'] = data;
        // student1['fee'] = fee;
        // student1['exam'] = exam;
        // data.push(student);
        // console.log(data);
        // const data = [...inputData, data]
        // setstoreData(inputData)
        // console.log(inputData);

    }, []);
    return (
        <View>
            <Text>AddArray</Text>
            <ButtonForm label="checknow" onPress={handleOver} />
        </View>
    )
}

export default AddArray

const styles = StyleSheet.create({})
