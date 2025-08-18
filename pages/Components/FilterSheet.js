import React, { useState, lazy, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SPSheet } from 'react-native-popup-confirm-toast';
import DropdownForm from '../Common/DropdownForm';
import { Colors, Fonts } from '../utils/Constants';

const RadioForm = lazy(() => import('../Common/RadioForm'));
const DatePickerComp = lazy(() => import('../Common/DatePickerComp'));

const FILTER_TYPES = {
  FARMER: 'Farmer/Product Name',
  PHONE: 'PhoneNumber',
  DATE: 'Date',
  CARBON: 'Carbon'
};

const DROPDOWN_NAMES = {
  FARMER: 'enter_farmer_s_name',
  PHONE: 'new_reg_phone_number',
  CARBON: 'Carbon/NonCarbon'
};
const FilterSheetContent = ({
  options,
  dropdownData,
  t,
  filterItem,
  searchFarmerName,
  searchFarmerPhone,
  handleFilterResult,
  fromDate,
  toDate,
  effective_dates,
  handleFilterRemove,
  carbonFlag,
  CARBON_TYPE,
  carbonType,
}) => {
  // State management
  const [selectedValue, setSelectedValue] = useState(filterItem);
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [sheetFromDate, setSheetFromDate] = useState(fromDate);
  const [sheetToDate, setSheetToDate] = useState(toDate);
  const [sheetFarmerName, setSheetFarmerName] = useState(searchFarmerName);
  const [sheetFarmerPhone, setSheetFarmerPhone] = useState(searchFarmerPhone);
  const [sheetCarbonType, setSheetCarbonType] = useState(carbonType);

  // Memoized values
  const filterOptions = useMemo(() => [
    { key: 'farmer', type: FILTER_TYPES.FARMER, label: 'farmer_name' },
    { key: 'phone', type: FILTER_TYPES.PHONE, label: 'farmer_number' },
    { key: 'date', type: FILTER_TYPES.DATE, label: 'date' },
    { key: 'carbon', type: FILTER_TYPES.CARBON, label: 'Carbon/NonCarbon', condition: carbonFlag }
  ], [carbonFlag]);

  // Event handlers
  const handleSelect = useCallback((value) => {
    setSelectedValue(value);
    // Reset all form states
    setSheetFarmerName({ label: "", value: "" });
    setSheetFarmerPhone({ label: "", value: "" });
    setSheetCarbonType({ label: "", value: "" });
    setSheetFromDate("");
    setSheetToDate("");
    
    if (value === "") {
      handleFilterRemove();
    }
  }, [handleFilterRemove]);

  const onDateChange = useCallback((date, isFromDate) => {
    try {
      const formattedDate = effective_dates(date);
      if (isFromDate) {
        setSheetFromDate(formattedDate);
      } else {
        setSheetToDate(formattedDate);
      }
    } catch (error) {
      console.error('Date change error:', error);
    }
  }, [effective_dates]);

  const handleDropdownChange = useCallback((item, fieldType) => {
    const { label = "", value = "" } = item || {};
    
    switch (fieldType) {
      case DROPDOWN_NAMES.FARMER:
        setSheetFarmerName({ label, value });
        break;
      case DROPDOWN_NAMES.PHONE:
        setSheetFarmerPhone({ label, value });
        break;
      case DROPDOWN_NAMES.CARBON:
        setSheetCarbonType({ label, value });
        break;
    }
  }, []);

  const handleApplyFilter = useCallback(() => {
    handleFilterResult({
      filter: selectedValue,
      fromDate: sheetFromDate,
      toDate: sheetToDate,
      farmerName: sheetFarmerName,
      farmerPhone: sheetFarmerPhone,
      sheetCarbonType: sheetCarbonType
    });
    SPSheet.hide();
  }, [selectedValue, sheetFromDate, sheetToDate, sheetFarmerName, sheetFarmerPhone, sheetCarbonType, handleFilterResult]);

  // Render functions
  const renderDropdown = useCallback((data, fieldType, labelKey) => (
    <DropdownForm
      data={data}
      label={t(labelKey)}
      labelField="label"
      valueField="value"
      placeholder={t(labelKey)}
      onChange={(item) => handleDropdownChange(item, fieldType)}
      style={styles.dropdown}
      placeholderStyle={styles.dropdownText}
      selectedTextStyle={styles.dropdownText}
      inputSearchStyle={styles.dropdownText}
      itemTextStyle={styles.dropdownText}
      val={
        fieldType === DROPDOWN_NAMES.FARMER ? sheetFarmerName?.value :
        fieldType === DROPDOWN_NAMES.PHONE ? sheetFarmerPhone?.value :
        sheetCarbonType?.value
      }
    />
  ), [t, handleDropdownChange, sheetFarmerName, sheetFarmerPhone, sheetCarbonType]);

  const renderRadioOptions = () => {
    if (selectedValue !== "") return null;

    return (
      <View style={styles.radioContainer}>
        {filterOptions.map((option, index) => {
          const shouldShow = options[index] === option.key && (option.condition !== false);
          if (!shouldShow) return null;

          return (
            <RadioForm
              key={option.key}
              label={t(option.label)}
              onSelect={() => handleSelect(option.type)}
              selected={selectedValue === option.type}
            />
          );
        })}
      </View>
    );
  };

  const renderSelectedFilter = () => {
    if (!selectedValue) return null;

    return (
      <View style={styles.filterContainer}>
        {selectedValue === FILTER_TYPES.FARMER && dropdownData?.[0] && 
          renderDropdown(dropdownData[0], DROPDOWN_NAMES.FARMER, DROPDOWN_NAMES.FARMER)}
        
        {selectedValue === FILTER_TYPES.PHONE && dropdownData?.[1] && 
          renderDropdown(dropdownData[1], DROPDOWN_NAMES.PHONE, DROPDOWN_NAMES.PHONE)}
        
        {selectedValue === FILTER_TYPES.CARBON && 
          renderDropdown(CARBON_TYPE, DROPDOWN_NAMES.CARBON, DROPDOWN_NAMES.CARBON)}
        
        {selectedValue === FILTER_TYPES.DATE && (
          <View style={styles.dateContainer}>
            <TouchableOpacity style={styles.dateButton} onPress={() => setOpenFromDate(true)}>
              <Text style={styles.dateText}>{sheetFromDate || t('from_date')}</Text>
              <Image source={require('../Common/images/calendar.png')} style={styles.calendarIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateButton} onPress={() => setOpenToDate(true)}>
              <Text style={styles.dateText}>{sheetToDate || t('to_date')}</Text>
              <Image source={require('../Common/images/calendar.png')} style={styles.calendarIcon} />
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => handleSelect("")}>
            <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
            <Text style={styles.applyButtonText}>{t('view_result')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {openFromDate && (
        <DatePickerComp
          openDate={openFromDate}
          newDate={new Date()}
          setOpenDate={setOpenFromDate}
          handleDatePicker={(date) => onDateChange(date, true)}
          title={t('from_date')}
        />
      )}
      
      {openToDate && (
        <DatePickerComp
          openDate={openToDate}
          newDate={new Date()}
          setOpenDate={setOpenToDate}
          handleDatePicker={(date) => onDateChange(date, false)}
          title={t('to_date')}
        />
      )}

      {renderRadioOptions()}
      {renderSelectedFilter()}
    </View>
  );
};
export const openFilterSheet = (props) => {
  const { navigationBarHeight = 0 } = props;
  SPSheet.show({
    component: () => <FilterSheetContent {...props} />,
    height: 230 + navigationBarHeight,
    sheetStyle: styles.sheetStyle,
    closeOnTouchBackdrop: true,
    draggable: true,
  });
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  radioContainer: {
    padding: 10,
    height: 140,
    justifyContent: 'center',
  },
  filterContainer: {
    width: '90%',
    marginHorizontal: '5%',
    height: 150,
    justifyContent: 'space-evenly',
  },
  dropdown: {
    borderColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 45,
  },
  dropdownText: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: Colors.background,
    height: 48,
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: Colors.text,
    fontFamily: Fonts.Medium,
  },
  calendarIcon: {
    width: 20,
    height: 20,
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    borderWidth: 0.5,
    borderRadius: 50,
    borderColor: Colors.useGreen,
    width: '45%',
    padding: 10,
    alignItems: 'center',
    elevation: 1,
    backgroundColor: Colors.background,
  },
  cancelButtonText: {
    color: Colors.text,
    fontFamily: Fonts.Medium,
    fontSize: 14,
  },
  applyButton: {
    borderWidth: 1,
    borderRadius: 50,
    borderColor: Colors.useGreen,
    width: '45%',
    padding: 10,
    alignItems: 'center',
    backgroundColor: Colors.useGreen,
    elevation: 1,
  },
  applyButtonText: {
    color: Colors.background,
    fontFamily: Fonts.Medium,
    fontSize: 14,
  },
  sheetStyle: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});