import React, { useState, lazy, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SPSheet } from '@sekizlipenguen/react-native-popup-confirm-toast';
import DropdownForm from '../Common/DropdownForm';
import { Colors, Fonts } from '../utils/Constants';
const RadioForm = lazy(() => import('../Common/RadioForm'));
const DatePickerComp = lazy(() => import('../Common/DatePickerComp'));
const FILTER_TYPES = {
  FARMER: 'Farmer/Product Name',
  PHONE: 'PhoneNumber',
  DATE: 'Date',
  CARBON: 'Carbon',
};
const DROPDOWN_NAMES = {
  FARMER: 'enter_farmer_s_name',
  PHONE: 'new_reg_phone_number',
  CARBON: 'Carbon/NonCarbon',
};
const FilterSheetContent = React.memo(({
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
  height,
  navigationBarHeight=0,
  setFilterItem
}) => {
  const [selectedValue, setSelectedValue] = useState(filterItem);
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [sheetFromDate, setSheetFromDate] = useState(fromDate);
  const [sheetToDate, setSheetToDate] = useState(toDate);
  const [sheetFarmerName, setSheetFarmerName] = useState(searchFarmerName);
  const [sheetFarmerPhone, setSheetFarmerPhone] = useState(searchFarmerPhone);
  const [sheetCarbonType, setSheetCarbonType] = useState(carbonType);
  const isMountedRef = useRef(true);
  const timeoutRef = useRef(null);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);
  const filterOptions = useMemo(
    () => [
      { key: 'farmer', type: FILTER_TYPES.FARMER, label: 'farmer_name' },
      { key: 'phone', type: FILTER_TYPES.PHONE, label: 'farmer_number' },
      { key: 'date', type: FILTER_TYPES.DATE, label: 'date' },
      {
        key: 'carbon',
        type: FILTER_TYPES.CARBON,
        label: 'Carbon/NonCarbon',
        condition: carbonFlag,
      },
    ],
    [carbonFlag]
  );
  const emptyObject = useMemo(() => ({ label: '', value: '' }), []);
  const handleSelect = useCallback(
    (value) => {
      if (!isMountedRef.current) return;

      setSelectedValue(value);
      setFilterItem(value)
      setSheetFarmerName(emptyObject);
      setSheetFarmerPhone(emptyObject);
      setSheetCarbonType(emptyObject);
      setSheetFromDate('');
      setSheetToDate('');

      if (value === '') {
        handleFilterRemove?.();
        return;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;

        openFilterSheet({
          options,
          dropdownData,
          t,
          filterItem: value,
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
          height,
          navigationBarHeight,
          setFilterItem
        });
      }, 300);
    },
    [
      emptyObject,
      handleFilterRemove,
      options,
      dropdownData,
      t,
      searchFarmerName,
      searchFarmerPhone,
      handleFilterResult,
      fromDate,
      toDate,
      effective_dates,
      carbonFlag,
      CARBON_TYPE,
      carbonType,
      height,
      navigationBarHeight,
      setFilterItem
    ]
  );

  const onDateChange = useCallback(
    (date, isFromDate) => {
      if (!isMountedRef.current) return;

      try {
        const formattedDate = effective_dates?.(date);
        if (formattedDate) {
          if (isFromDate) {
            setSheetFromDate(formattedDate);
          } else {
            setSheetToDate(formattedDate);
          }
        }
      } catch (error) {
        console.error('Date change error:', error);
      }
    },
    [effective_dates]
  );

  const handleDropdownChange = useCallback((item, fieldType) => {
    if (!isMountedRef.current) return;

    const { label = '', value = '' } = item || {};
    const newItem = { label, value };

    switch (fieldType) {
      case DROPDOWN_NAMES.FARMER:
        setSheetFarmerName(newItem);
        break;
      case DROPDOWN_NAMES.PHONE:
        setSheetFarmerPhone(newItem);
        break;
      case DROPDOWN_NAMES.CARBON:
        setSheetCarbonType(newItem);
        break;
      default:
        break;
    }
  }, []);

  const handleApplyFilter = useCallback(() => {
    if (!isMountedRef.current) return;

    try {
      handleFilterResult?.({
        filter: selectedValue,
        fromDate: sheetFromDate,
        toDate: sheetToDate,
        farmerName: sheetFarmerName,
        farmerPhone: sheetFarmerPhone,
        sheetCarbonType: sheetCarbonType,
      });
      SPSheet.hide();
    } catch (error) {
      console.error('Apply filter error:', error);
    }
  }, [
    selectedValue,
    sheetFromDate,
    sheetToDate,
    sheetFarmerName,
    sheetFarmerPhone,
    sheetCarbonType,
    handleFilterResult,
  ]);
  const calendarIcon = useMemo(
    () => (
      <Image
        source={require('../Common/images/calendar.png')}
        style={styles.calendarIcon}
      />
    ),
    []
  );
  const renderDropdown = useCallback(
    (data, fieldType, labelKey) => {
      if (!data || !Array.isArray(data)) return null;

      let selectedValue;
      switch (fieldType) {
        case DROPDOWN_NAMES.FARMER:
          selectedValue = sheetFarmerName?.value;
          break;
        case DROPDOWN_NAMES.PHONE:
          selectedValue = sheetFarmerPhone?.value;
          break;
        case DROPDOWN_NAMES.CARBON:
          selectedValue = sheetCarbonType?.value;
          break;
        default:
          selectedValue = '';
      }

      return (
        <DropdownForm
          data={data}
          label={t?.(labelKey) || labelKey}
          labelField="label"
          valueField="value"
          placeholder={t?.(labelKey) || labelKey}
          onChange={(item) => handleDropdownChange(item, fieldType)}
          style={styles.dropdown}
          placeholderStyle={styles.dropdownText}
          selectedTextStyle={styles.dropdownText}
          inputSearchStyle={styles.dropdownText}
          itemTextStyle={styles.dropdownText}
          val={selectedValue}
        />
      );
    },
    [t, handleDropdownChange, sheetFarmerName, sheetFarmerPhone, sheetCarbonType]
  );
  const DateButton = React.memo(({ onPress, text, placeholder }) => (
    <TouchableOpacity style={styles.dateButton} onPress={onPress}>
      <Text style={styles.dateText}>
        {text || (t?.(placeholder) || placeholder)}
      </Text>
      {calendarIcon}
    </TouchableOpacity>
  ));

  const renderRadioOptions = useMemo(() => {
    if (selectedValue !== '') return null;

    const validOptions = filterOptions.filter((option, index) => {
      const shouldShow = options?.[index] === option.key && option.condition !== false;
      return shouldShow;
    });

    if (validOptions.length === 0) return null;

    return (
      <View style={styles.radioContainer}>
        {validOptions.map((option) => (
          <RadioForm
            key={option.key}
            label={t?.(option.label) || option.label}
            onSelect={() => handleSelect(option.type)}
            selected={selectedValue === option.type}
          />
        ))}
      </View>
    );
  }, [selectedValue, filterOptions, options, t, handleSelect, handleSelect]);

  const renderSelectedFilter = useMemo(() => {
    if (!selectedValue) return null;

    return (
      <View style={styles.filterContainer}>
        {selectedValue === FILTER_TYPES.FARMER &&
          dropdownData?.[0] &&
          renderDropdown(
            dropdownData[0],
            DROPDOWN_NAMES.FARMER,
            DROPDOWN_NAMES.FARMER
          )}

        {selectedValue === FILTER_TYPES.PHONE &&
          dropdownData?.[1] &&
          renderDropdown(
            dropdownData[1],
            DROPDOWN_NAMES.PHONE,
            DROPDOWN_NAMES.PHONE
          )}

        {selectedValue === FILTER_TYPES.CARBON &&
          CARBON_TYPE &&
          renderDropdown(CARBON_TYPE, DROPDOWN_NAMES.CARBON, DROPDOWN_NAMES.CARBON)}

        {selectedValue === FILTER_TYPES.DATE && (
          <View style={styles.dateContainer}>
            <DateButton
              onPress={() => setOpenFromDate(true)}
              text={sheetFromDate}
              placeholder="from_date"
            />
            <DateButton
              onPress={() => setOpenToDate(true)}
              text={sheetToDate}
              placeholder="to_date"
            />
          </View>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleSelect('')}
          >
            <Text style={styles.cancelButtonText}>{t?.('cancel') || 'Cancel'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyFilter}
          >
            <Text style={styles.applyButtonText}>{t?.('view_result') || 'View Result'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [
    selectedValue,
    dropdownData,
    CARBON_TYPE,
    renderDropdown,
    sheetFromDate,
    sheetToDate,
    t,
    handleSelect,
    handleApplyFilter,
  ]);

  return (
    <View style={styles.container}>
      {openFromDate && (
        <DatePickerComp
          openDate={openFromDate}
          newDate={new Date()}
          setOpenDate={setOpenFromDate}
          handleDatePicker={(date) => onDateChange(date, true)}
          title={t?.('from_date') || 'From Date'}
        />
      )}

      {openToDate && (
        <DatePickerComp
          openDate={openToDate}
          newDate={new Date()}
          setOpenDate={setOpenToDate}
          handleDatePicker={(date) => onDateChange(date, false)}
          title={t?.('to_date') || 'To Date'}
          minimumDate={
            sheetFromDate == ''
              ? ''
              : new Date(
                `${new Date(sheetFromDate).getFullYear()}-${new Date(sheetFromDate).getMonth() + 1
                }-${new Date(sheetFromDate).getDate() + 1}`,
              )
          }
        />
      )}
      {renderRadioOptions}
      {renderSelectedFilter}
    </View>
  );
});
FilterSheetContent.displayName = 'FilterSheetContent';
export const openFilterSheet = (props) => {
  try {
    const { navigationBarHeight = 0, height = 0, filterItem = '' } = props || {};
    if (!props) {
      console.warn('openFilterSheet: No props provided');
      return;
    }
    const sheetHeight = filterItem === '' ? height  : 200 ;
    const finalHeight = Math.max(sheetHeight, height);
    SPSheet.show({
      component: () => <FilterSheetContent {...props} />,
      height: finalHeight,
      sheetStyle: styles.sheetStyle,
      closeOnTouchBackdrop: true,
      draggable: true,
    });
  } catch (error) {
    console.error('Error opening filter sheet:', error);
  }
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center' },
  radioContainer: { padding: 10, justifyContent: 'center' },
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
    fontSize: 14
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
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    // flex: 1,
    justifyContent: 'center',
  },
  dateText: {
    color: Colors.text,
    fontFamily: Fonts.Medium
  },
  calendarIcon: {
    width: 20,
    height: 20,
    marginLeft: 5
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
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