import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { getItem, setItem } from '../../config/getDataFromStorage';
import ButtonForm from '../Common/ButtonForm';
import DropdownForm from '../Common/DropdownForm';
import InputTextForm from '../Common/InputTextForm';
const courseDAta = [
    { label: 'dit', value: '1' },
    { label: 'dwd', value: '2' },
    { label: 'dca', value: '3' },
    { label: 'adca', value: '4' },
    { label: 'tally', value: '5' }
];
const MyScreen = ({ navigation }) => {
    const [studentInfo, setstudentInfo] = React.useState({
        name: "", age: "", course: ""
    });
    const [studentInfoData, setstudentInfoData] = React.useState([]);
    const saveInLocalHandle = async () => {
        const newItem = {
            name: studentInfo.name,
            age: studentInfo.age,
            course: studentInfo.course.value,
        }
        const newData = [...studentInfoData, newItem];
        setstudentInfoData(newData);

    }

    const saveInHandleDevice = async () => {

        console.log(studentInfo);
        try {
            await setItem('studentInfo_data_data', studentInfo);
            setstudentInfo({
                name: '',
                age: '',
                course: ''
            })
        } catch (error) {
            console.error('Error adding  data:', error);
        }
    }
    const onPageLoad = async () => {
        const studentInfo_data_data = await getItem('studentInfo_data_data');
        console.log(studentInfo_data_data);
    };
    useEffect(() => {
        onPageLoad
    }, []);
    return (
        <View>
            <InputTextForm label="name" onChangeText={name => setstudentInfo({ ...studentInfo, name: name })} value={studentInfo.name ?? ''} />
            <InputTextForm label="age" onChangeText={age => setstudentInfo({ ...studentInfo, age: age })} value={studentInfo.age ?? ''} />
            <DropdownForm label="course" data={courseDAta} onChange={course => setstudentInfo({ ...studentInfo, course: course })} value1={studentInfo.course ?? ''} />
            <ButtonForm label="local store" onPress={() => saveInLocalHandle()} />
            <ButtonForm label="device stoer" onPress={() => saveInHandleDevice()} />

        </View>
    );
};

MyScreen.options = {
    topBar: {
        title: {
            text: 'My Custom Header', // Header title
            color: 'white', // Text color
            fontWeight: 'bold',
            fontSize: 20,
        },
        background: {
            color: '#007AFF', // Header background color
        },
    },
};

export default MyScreen;
