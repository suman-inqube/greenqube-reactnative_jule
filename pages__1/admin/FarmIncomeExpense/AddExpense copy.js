import { StyleSheet, Text, View, ScrollView, TextInput, FlatList, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import InputTextForm from '../../Common/InputTextForm';
import HeadDropDown from './HeadDropDown';
import DatePickerComp from '../../Common/DatePickerComp';
import ButtonFormBottom from '../../Common/ButtonFormBottom';
const AddExpense = () => {
    const [data, setData] = useState([{ textInput: "" }]);
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [openFromDate, setOpenFromDate] = useState(false);
    const [fromDate, setfromDate] = useState("");
    const addMoreExpense = () => {
        setData([...data, { textInput: "" }])
    }
    const handleChangeAddExpense = (index, text, name) => {
        const values = [...data];
        values[index][name] = text;
        setData(values);
    }
    const handleDatePicker = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setfromDate(effective_date)
        // console.log(effective_date);
    }
    return (
        <View style={{ flex: 1 }}>
            <DatePickerComp
                openDate={openFromDate}
                newDate={newFromDate}
                setOpenDate={setOpenFromDate}
                handleDatePicker={handleDatePicker}
            />
          
            <CustomHeader path='FarmIncomeExpenseList' />
            <FormsTitle title='Add Expense' />
            <View style={styles.formContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <InputTextForm label='Farmer/Producer Name' />
                    <InputTextForm label='Phone Number' />
                    <InputTextForm label='Plot/Site' />
                    <View style={styles.plotContainer}>
                        <View style={styles.plotItem}>
                            <Text style={styles.plotItemText}>Produce Name</Text>
                            <Text style={styles.plotItemText}>Produce Name</Text>
                        </View>
                        <View style={styles.plotItem} >
                            <Text style={styles.plotItemText}>Produce Name</Text>
                            <Text style={styles.plotItemText}>Produce Name</Text>
                        </View>
                    </View>
                    <View style={{ marginBottom: 350 }}>
                        {
                            data.map((data, index) => {
                                return (
                                    <View style={styles.AddExpenseContainer} key={index}>
                                        <View>
                                            <TextInput
                                                style={styles.AddExpenseInput}
                                                onChangeText={(text) => handleChangeAddExpense(index, text, 'textInput')}
                                                name='textInput'
                                                placeholder='Amount'
                                                value={data.textInput}
                                            />
                                        </View>
                                        <View style={styles.AddExpenseItemContainer}>
                                            <View style={styles.AddExpenseItem}>
                                                <HeadDropDown label='Add Expense Head' />
                                            </View>
                                            <TouchableOpacity onPress={() => setOpenFromDate(true)}
                                                style={styles.AddExpenseItemDate}>
                                                <Text>{fromDate == "" ? 'Date' : fromDate}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </View>

                </ScrollView>
                <TouchableOpacity onPress={addMoreExpense} style={styles.addMore}>
                    <Text style={styles.addMoreText} >Add More</Text>
                </TouchableOpacity>
            </View>
            <ButtonFormBottom label='Submit' />
        </View>
    )
}

export default AddExpense

const styles = StyleSheet.create({
    formContainer: {
        width: '90%',
        marginHorizontal: '5%',
    },
    AddExpenseContainer: {
        borderWidth: 1,
        marginVertical: 10,
        padding: 10,
        borderRadius: 10,
        borderColor: '#000',
        backgroundColor: '#FFF'
    },
    AddExpenseInput: {
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        marginVertical: 10,
        fontSize: 25,
        color: 'green'
    },
    AddExpenseItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    AddExpenseItem: {
        width: '60%',
        marginTop: 12
    },
    AddExpenseItemDate: {
        width: '30%',
        borderWidth: 1,
        padding: 8,
        borderRadius: 10
    },
    addMore: {
        position: 'absolute',
        right: '-6%',
        // bottom: 0,
        top: "30%",
        zIndex: 999,
        backgroundColor: 'green',
        width: 100,
        padding: 10,
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
    },
    addMoreText: {
        color: '#FFF',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    plotContainer:{
        flexDirection:'row',
        borderWidth:1,
        borderColor:'#000',
        padding:10,
        borderRadius:10,
        backgroundColor:'#FFF'
    },
    plotItem:{
        width:'50%'
    },
    plotItemText:{
        color:'#000',
        marginVertical:5
    }
})