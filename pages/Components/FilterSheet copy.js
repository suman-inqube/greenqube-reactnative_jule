import React, { useState, lazy } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SPSheet } from 'react-native-popup-confirm-toast';
import DropdownForm from '../Common/DropdownForm';
import { Colors, Fonts } from '../utils/Constants';
const RadioForm = lazy(() => import('../Common/RadioForm'));
const DatePickerComp = lazy(() => import('../Common/DatePickerComp'));

export const openFilterSheet = ({
    dropdownData = [],
    t,
    onchangeFilterItem,
    filterItem,
    setFilterName,
    fromDate,
    newToDate,
}) => {
    SPSheet.show({
        component: () => {
            const [selectedValue, setSelectedValue] = useState(filterItem);
            const [openFromDate, setOpenFromDate] = useState(false);
            const [openToDate, setOpenToDate] = useState(false);
            const [fromDate, setfromDate] = useState("");
            const [toDate, setToDate] = useState("");
            const handleSelect = (value) => {
                setFilterName(value);
                setSelectedValue(value);
                onchangeFilterItem?.(value);
            };
            const onFromDateChange = () => {

            }
            const onToDateChange = () => {

            }
            const renderDropdown = (data) => (
                <DropdownForm
                    data={data}
                    label={t('select_option')}
                    labelField="label"
                    valueField="value"
                    placeholder={t('select_option')}
                    onChange={(item) => console.log('Dropdown selected:', item)}
                    style={{
                        borderColor: 'transparent',
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        backgroundColor: '#FFFFFF',
                        width: '100%',
                        height: 45
                    }}
                    placeholderStyle={{ color: '#000', fontFamily: 'Poppins-Regular', fontSize: 14 }}
                    selectedTextStyle={{ color: '#000', fontFamily: 'Poppins-Regular', fontSize: 14 }}
                    inputSearchStyle={{ color: '#000', fontFamily: 'Poppins-Regular' }}
                    itemTextStyle={{ color: '#000', fontFamily: 'Poppins-Regular' }}
                />
            );

            return (
                <View>
                    <TouchableOpacity style={{position:'absolute',right:20,top:0,width:25,height:25,backgroundColor:Colors.backgroundSecondary,justifyContent:'center',alignItems:'center',borderRadius:5}}>
                        <Text style={{color:Colors.text,fontFamily:Fonts.Medium}}>X</Text>
                    </TouchableOpacity>
                    <Text style={{color:Colors.text,fontFamily:Fonts.Medium}}>{filterItem}66666</Text>
                    {openFromDate && (
                        <DatePickerComp
                            openDate={openFromDate}
                            newDate={new Date()}
                            setOpenDate={setOpenFromDate}
                            handleDatePicker={onFromDateChange}
                            title={t('from_date')}
                        />
                    )}
                    {openToDate && (
                        <DatePickerComp
                            openDate={openToDate}
                            newDate={new Date()}
                            setOpenDate={setOpenToDate}
                            handleDatePicker={onToDateChange}
                            title={t('to_date')}

                        />
                    )}
                    {selectedValue == undefined ?
                        <View style={{ padding: 10, height: 140, justifyContent: 'space-between' }}>
                            <RadioForm
                                label={t('farmer_name')}
                                onSelect={() => handleSelect('Farmer/Product Name')}
                                selected={selectedValue === 'Farmer/Product Name'}
                            />
                            <RadioForm
                                label={t('farmer_number')}
                                onSelect={() => handleSelect('PhoneNumber')}
                                selected={selectedValue === 'PhoneNumber'}
                            />
                            <RadioForm
                                label={t('category')}
                                onSelect={() => handleSelect('Category')}
                                selected={selectedValue === 'Category'}
                            />
                            <RadioForm
                                label={t('date')}
                                selected={selectedValue === 'Date'}
                                onSelect={() => handleSelect('Date')}

                            />
                        </View> : null}


                    {selectedValue && (
                        <View style={{ width: '90%', marginHorizontal: '5%', height: 150, justifyContent: 'space-evenly' }}>
                            {selectedValue === 'Farmer/Product Name' && renderDropdown(dropdownData?.[0])}
                            {selectedValue === 'PhoneNumber' && renderDropdown(dropdownData?.[1])}
                            {selectedValue === 'Date' && 
                            <View style={{
                                flexDirection: 'row',
                                borderWidth: 0.5,
                                borderColor: Colors.borderGreen,
                                borderRadius: 8,
                                elevation: 1,
                                backgroundColor: Colors.background,
                                height: 48,
                                alignItems: 'center',
                                paddingHorizontal: 10,
                                justifyContent: 'space-between'
                            }}>
                                <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => setOpenFromDate(true)}>
                                    <Text style={{ color: Colors.text, fontFamily: Fonts.Medium }}>{fromDate || t('from_date')}</Text>
                                    <Image source={require('../Common/images/calendar.png')} style={{ width: 20, height: 20, marginLeft: 5 }} />
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => setOpenToDate(true)}>
                                    <Text style={{ color: Colors.text, fontFamily: Fonts.Medium }}>{toDate || t('to_date')}</Text>
                                    <Image source={require('../Common/images/calendar.png')} style={{ width: 20, height: 20, marginLeft: 5 }} />
                                </TouchableOpacity>
                            </View>}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity
                                    style={{
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        borderColor: Colors.useGreen,
                                        width: '45%',
                                        padding: 10,
                                        alignItems: 'center',
                                    }}
                                    onPress={() => SPSheet.hide()}
                                >
                                    <Text style={{ color: Colors.text, fontFamily: Fonts.Medium }}>{t('cancel')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        borderColor: Colors.useGreen,
                                        width: '45%',
                                        padding: 10,
                                        alignItems: 'center',
                                        backgroundColor: Colors.useGreen,
                                    }}
                                    onPress={() => {
                                        console.log('Selected Filter:', selectedValue);
                                        SPSheet.hide();
                                    }}
                                >
                                    <Text style={{ color: Colors.background, fontFamily: Fonts.Medium }}>{t('view_result')}</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    )}
                </View>
            );
        },
        height: 230,
        sheetStyle: {
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
        },
        closeOnTouchBackdrop: true,
        draggable: true,
    });
};
