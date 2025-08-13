import React, { useState, lazy } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SPSheet } from 'react-native-popup-confirm-toast';
import DropdownForm from '../Common/DropdownForm';
import { Colors, Fonts } from '../utils/Constants';
const RadioForm = lazy(() => import('../Common/RadioForm'));
const DatePickerComp = lazy(() => import('../Common/DatePickerComp'));
import { getNavigationType } from '../utils/helpers';
export const openFilterSheet = ({
    dropdownData = [],
    t,
    // onchangeFilterItem,
    filterItem,
    setSearchFarmerName,
    setSearchFarmerPhone,
    searchFarmerName,
    searchFarmerPhone,
    handleFilterResult,
    setfromDate,
    setToDate,
    fromDate,
    toDate,
    effective_dates,
    handleFilterRemove,
    carbonFlag,
    CARBON_TYPE,
    carbonType,
    navigationBarHeight
}) => {
    SPSheet.show({
        component: () => {
         
            const [selectedValue, setSelectedValue] = useState(filterItem);
            const [openFromDate, setOpenFromDate] = useState(false);
            const [openToDate, setOpenToDate] = useState(false);
            const [sheetFromDate, setSheetFromDate] = useState(fromDate);
            const [sheetToDate, setSheetToDate] = useState(toDate);
            const [sheetFarmerName, setSheetFarmerName] = useState(searchFarmerName);
            const [sheetFarmerPhone, setSheetFarmerPhone] = useState(searchFarmerPhone);
            const [sheetCarbonType, setSheetCarbonType] = useState(carbonType);
            const handleSelect = (value) => {
                setSelectedValue(value);
                setSheetFarmerName({ label: "", value: "" });
                setSheetFarmerPhone({ label: "", value: "" });
                setSheetCarbonType({ label: "", value: "" })
                setSheetFromDate("");
                setSheetToDate("");
                if (value == "") {
                    handleFilterRemove()
                }
                // onchangeFilterItem?.(value);
            };
            const onFromDateChange = (date) => {
                setSheetFromDate(date); // local for sheet UI
                setfromDate(date);      // parent state
            };

            const onToDateChange = (date) => {
                setSheetToDate(date);
                setToDate(date);
            };
            // const filterCancel = () => {
            //     handleFilterRemove();
            // }
            const renderDropdown = (data, name) => (
                <DropdownForm
                    data={data}
                    label={t(name)}
                    labelField="label"
                    valueField="value"
                    placeholder={t(name)}
                    onChange={(item) => {
                        const { label, value, phone } = item || {}
                        if (name === "enter_farmer_s_name") {
                            setSheetFarmerName({ label: label, value: value });
                            setSearchFarmerName({ label: label, value: value }); // parent update
                        } else if (name === 'new_reg_phone_number') {
                            setSheetFarmerPhone({ label: label, value: value });
                            setSearchFarmerPhone({ label: label, value: value }); // parent update
                        } else {
                            setSheetCarbonType({ label: label, value: value })
                        }
                    }}
                    // onchange={(item)=>handleSelect(item)}
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
                    val={name == "enter_farmer_s_name" ? sheetFarmerName?.label : name == "new_reg_phone_number" ? sheetFarmerPhone?.label : sheetCarbonType?.label}
                />
            );

            return (
                <View>
                    {/* {selectedValue != "" ? <TouchableOpacity style={{ position: 'absolute', right: 20, top: -10, width: 30, height: 30, backgroundColor: Colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 0.5, borderColor: Colors.useGreen }}
                        onPress={() => handleSelect('')}>
                        <Text style={{ color: Colors.text, fontFamily: Fonts.Medium, fontSize: 18, textAlign: 'center' }}>X</Text>
                    </TouchableOpacity> : null} */}
                    {openFromDate && (
                        <DatePickerComp
                            openDate={openFromDate}
                            newDate={new Date()}
                            setOpenDate={setOpenFromDate}
                            handleDatePicker={(date) => onFromDateChange(effective_dates(date))}
                            title={t('from_date')}
                        />
                    )}
                    {openToDate && (
                        <DatePickerComp
                            openDate={openToDate}
                            newDate={new Date()}
                            setOpenDate={setOpenToDate}
                            handleDatePicker={(date) => onToDateChange(effective_dates(date))}
                            title={t('to_date')}

                        />
                    )}
                    {selectedValue == "" ?
                        <View style={{ padding: 10, height: 140, justifyContent: 'space-between' }}>
                            <RadioForm
                                label={t('farmer_name')}
                                onSelect={() => handleSelect('Farmer/Product Name')}
                            // selected={selectedValue === 'Farmer/Product Name'}
                            />
                            <RadioForm
                                label={t('farmer_number')}
                                onSelect={() => handleSelect('PhoneNumber')}
                            // selected={selectedValue === 'PhoneNumber'}
                            />
                            {/* <RadioForm
                                label={t('category')}
                                onSelect={() => handleSelect('Category')}
                                selected={selectedValue === 'Category'}
                            /> */}
                            <RadioForm
                                label={t('date')}
                                // selected={selectedValue === 'Date'}
                                onSelect={() => handleSelect('Date')}

                            />
                            {
                                carbonFlag == true && <RadioForm label={t('Carbon/NonCarbon')}
                                    selected={selectedValue === 'Carbon'}
                                    onSelect={() => handleSelect('Carbon')}
                                />
                            }
                        </View>
                        : null}


                    {selectedValue && (
                        <View style={{ width: '90%', marginHorizontal: '5%', height: 150, justifyContent: 'space-evenly' }}>
                            {selectedValue === 'Farmer/Product Name' && dropdownData?.[0] && renderDropdown(dropdownData?.[0], "enter_farmer_s_name")}
                            {selectedValue === 'PhoneNumber' && dropdownData?.[1] && renderDropdown(dropdownData?.[1], "new_reg_phone_number")}
                            {selectedValue === 'Carbon' && dropdownData?.[1] && renderDropdown(CARBON_TYPE, "Carbon/NonCarbon")}
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
                                        <Text style={{ color: Colors.text, fontFamily: Fonts.Medium }}>{sheetFromDate || t('from_date')}</Text>
                                        <Image source={require('../Common/images/calendar.png')} style={{ width: 20, height: 20, marginLeft: 5 }} />
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => setOpenToDate(true)}>
                                        <Text style={{ color: Colors.text, fontFamily: Fonts.Medium }}>{sheetToDate || t('to_date')}</Text>
                                        <Image source={require('../Common/images/calendar.png')} style={{ width: 20, height: 20, marginLeft: 5 }} />
                                    </TouchableOpacity>
                                </View>}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity
                                    style={{
                                        borderWidth: 0.5,
                                        borderRadius: 50,
                                        borderColor: Colors.useGreen,
                                        width: '45%',
                                        padding: 10,
                                        alignItems: 'center',
                                        elevation: 1,
                                        backgroundColor: Colors.background
                                    }}
                                    onPress={() => {
                                        handleSelect("");
                                        // SPSheet.hide()
                                    }}
                                >
                                    <Text style={{ color: Colors.text, fontFamily: Fonts.Medium, fontSize: 14 }}>{t('cancel')}</Text>
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
                                        elevation: 1,
                                    }}
                                    onPress={() => {
                                        handleFilterResult({
                                            filter: selectedValue,
                                            fromDate: sheetFromDate,
                                            toDate: sheetToDate,
                                            farmerName: sheetFarmerName,
                                            farmerPhone: sheetFarmerPhone,
                                            sheetCarbonType: sheetCarbonType
                                        });
                                        SPSheet.hide();
                                    }}
                                >
                                    <Text style={{ color: Colors.background, fontFamily: Fonts.Medium, fontSize: 14 }}>{t('view_result')}</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    )}
                </View>
            );
        },
        height: 230+navigationBarHeight,
        sheetStyle: {
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
        },
        closeOnTouchBackdrop: true,
        draggable: true,
    });
};
