import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import DropdownForm from '../Common/DropdownForm';
import InputTextForm from '../Common/InputTextForm';
import config from '../../config';
const FormikExample = () => {
    const [countryData, setCountryData] = useState([]);
    const [country, setCountry] = useState('');
    let countryDataList = async () => {
        try {
            let countryArray = [];
            const axiosConfig = {
                headers: {
                    'information': `localhost,1`,
                    'Accept': 'application/json'
                },
            };
            let country_res = await axios.get(config.countryAPI, axiosConfig);
            // console.log(country_res.data.data);
            if (country_res.data.data.count > 0) {
                country_res.data.data.rows.forEach(element => {
                    countryArray.push({
                        value: element.id,
                        label: element.country_name,
                    });
                });
                setCountryData(countryArray);
            }
            else {
                countryArray.push({
                    value: 0,
                    label: "Country Data Available",
                });
                setCountryData(countryArray);
            }


        } catch (error) {
            console.log("Error in Country API", error);
        }
    }
    const countryHandle = (item) => {
        setCountry(item);
    }
    useEffect(() => {
        countryDataList();
    }, []);
    return (
        <Formik
            initialValues={{
                name: '',
                email: '',
                gender: '',

            }}
            validationSchema={Yup.object().shape({
                name: Yup.string().required('Name is required'),
                email: Yup.string().email('Invalid email').required('Email is required'),
                gender: Yup.string().required('Gender is required'),

            })}
            onSubmit={(values) => {
                console.log('Form values:', values);
            }}
        >
            {(formikProps) => (
                <View>
                    {/* <DropdownForm
                        label="Gender"
                        onChangeText={formikProps.handleChange('gender')}
                        onBlur={formikProps.handleBlur('gender')}
                        value={formikProps.values.gender}
                    /> */}
                    <DropdownForm data={countryData}
                        label="Country"
                        onChange={item => {countryHandle(item.value) }}
                    />
                    {formikProps.touched.gender && formikProps.errors.gender ? (
                        <Text style={{ color: 'red' }}>{formikProps.errors.gender}</Text>
                    ) : null}


                    <InputTextForm
                        label="Name"
                        onChangeText={formikProps.handleChange('name')}
                        onBlur={formikProps.handleBlur('name')}
                        value={formikProps.values.name}
                    />
                    {formikProps.touched.name && formikProps.errors.name ? (
                        <Text style={{ color: 'red' }}>{formikProps.errors.name}</Text>
                    ) : null}
                    <InputTextForm
                        label="Email"
                        onChangeText={formikProps.handleChange('email')}
                        onBlur={formikProps.handleBlur('email')}
                        value={formikProps.values.email}
                    />
                    {formikProps.touched.email && formikProps.errors.email ? (
                        <Text style={{ color: 'red' }}>{formikProps.errors.email}</Text>
                    ) : null}
                    <InputTextForm
                        label="Email"
                        onChangeText={formikProps.handleChange('email')}
                        onBlur={formikProps.handleBlur('email')}
                        value={formikProps.values.email}
                    />
                    {formikProps.touched.email && formikProps.errors.email ? (
                        <Text style={{ color: 'red' }}>{formikProps.errors.email}</Text>
                    ) : null}


                    <Button title="Submit" onPress={formikProps.handleSubmit} />
                </View>
            )}
        </Formik>
    );
};



export default FormikExample;
