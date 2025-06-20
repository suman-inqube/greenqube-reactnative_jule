import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput } from 'react-native'
import React, { memo } from 'react'
import RadioForm from './RadioForm';
import { useTranslation } from 'react-i18next';
import DropdownForm from './DropdownForm';
import { Dropdown } from 'react-native-element-dropdown'
const Filter = ({
  filterItem,
  filterOption,
  setOpenToDate,
  filterOptionShow,
  onchangeFilterItem,
  setOpenFromDate,
  fromDate,
  newToDate,
  onChangeText,
  title,
  category,
  FarmerProductNameValue,
  FarmerProductPhoneValue,
  filterDataRemove,
  statusFilter,
  statusNameValue,
  onChangeCarbonType,
  carbonFlag,
  dataActivity,
  carbonTypeVal
}) => {
  const { t } = useTranslation();
  return (
    <>
      <View style={styles.filterContainer}>
        <View>{title != undefined ? <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 18, color: '#000' }}>{title}</Text> : ""}
        </View>
        <View style={styles.filterItem}>
          {filterItem === 'Farmer/Product Name' ?
            <View style={styles.searchSection}>
              <TouchableOpacity onPress={filterDataRemove}>
                <Image source={require('./images/cross100.png')}
                  style={styles.searchIcon}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder={t('enter_farmer_s_name')}
                placeholderTextColor="#000"
                onChangeText={onChangeText}
                value={FarmerProductNameValue}
                underlineColorAndroid="transparent"
              />
            </View>
            : ""}
          {filterItem === 'PhoneNumber' ?
            <View style={styles.searchSection}>
              <TouchableOpacity onPress={filterDataRemove}>
                <Image source={require('./images/cross100.png')}
                  style={styles.searchIcon}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder={t('new_reg_phone_number')}
                placeholderTextColor="#000"
                onChangeText={onChangeText}
                value={FarmerProductPhoneValue}
                keyboardType="numeric"
              />
            </View>
            : ""}
          {filterItem === 'Category' ?
            <TextInput
              style={styles.filterInput}
              placeholder={t('category')}
              placeholderTextColor="#000"
              onChangeText={onChangeText}
            />
            : ""}
          {filterItem === 'statusFilter' ?
            <View style={styles.searchSection}>
              <TouchableOpacity onPress={filterDataRemove}>
                <Image source={require('./images/cross100.png')}
                  style={styles.searchIcon}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder={t('sta_')}
                placeholderTextColor="#000"
                onChangeText={onChangeText}
                value={statusNameValue}
                underlineColorAndroid="transparent"
              />
            </View>
            : ""}
          {filterItem === 'Date' ?
            <>
              <View style={styles.dataSearchContainer}>
                <TouchableOpacity onPress={setOpenFromDate} style={styles.dateContainer}>
                  <Text style={[styles.title, { marginLeft: 5 }]}>
                    {fromDate == "" ? t('from_date') : `${fromDate}`}
                  </Text>
                  <Image source={require('./images/calendar.png')}
                    style={{ width: 20, height: 20, marginLeft: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setOpenToDate(true)} style={styles.dateContainer}>
                  <Text style={styles.title}>
                    {newToDate == "" ? t('to_date') : `${newToDate}`}</Text>
                  <Image source={require('./images/calendar.png')}
                    style={{ width: 20, height: 20, marginLeft: 5 }}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.searchSection}>
                <TouchableOpacity onPress={filterDataRemove}>
                  <Image source={require('./images/cross100.png')}
                    style={styles.searchIcon}
                  />
                </TouchableOpacity>
                {/* <TextInput
                  style={styles.input}
                  placeholder='Phone Number'
                  placeholderTextColor="#000"
                  onChangeText={onChangeText}
                  value={FarmerProductPhoneValue}
                /> */}
                <TouchableOpacity onPress={() => setOpenFromDate(true)} style={styles.dateContainer}>
                  <Text style={[styles.title, { marginLeft: 5 }]}>
                    {fromDate == "" ?  t('from_date') : `${fromDate}`}
                  </Text>
                  <Image source={require('./images/calendar.png')}
                    style={{ width: 20, height: 20, marginLeft: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setOpenToDate(true)} style={styles.dateContainer}>
                  <Text style={styles.title}>
                    {newToDate == "" ?  t('to_date') : `${newToDate}`}</Text>
                  <Image source={require('./images/calendar.png')}
                    style={{ width: 20, height: 20, marginLeft: 5 }}
                  />
                </TouchableOpacity>
              </View>
            </>
            : ""}
          {filterItem === 'Carbon' ? <View style={[styles.searchSection, { alignItems: 'flex-start', overflow: 'hidden' }]}>
            <TouchableOpacity onPress={filterDataRemove}>
              <Image source={require('./images/cross100.png')}
                style={[styles.searchIcon, { marginTop: 6 }]}
              />
            </TouchableOpacity>
            <View style={{ width: '80%' }}>
              {/* <DropdownForm data={dataActivity}
                label={''}
                borderRadiusProps={50} placeholder={'Select Carbon'}
                onChange={onChangeCarbonType}
                dropdownStyle={{
                  borderColor: 'transparent',
                  borderWidth: 1.3,
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  backgroundColor: '#FFFFFF',
                  width: '100%',
                  elevation: 0,
                  height: 45
                }}
                val={carbonTypeVal}
              /> */}
              <Dropdown
                style={{
                  borderColor: 'transparent',
                  borderWidth: 1.3,
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  backgroundColor: '#FFFFFF',
                  width: '100%',
                  elevation: 0,
                  height: 45
                }}
                placeholderStyle={{
                  color: '#000',
                  fontFamily: 'Poppins-Regular',
                  fontSize: 14
                }}
                selectedTextStyle={{
                  color: '#000',
                  fontFamily: 'Poppins-Regular',
                  fontSize: 14
                }}
                inputSearchStyle={{
                  color: '#000',
                  fontFamily: 'Poppins-Regular'
                }}
                itemTextStyle={{
                  color: '#000',
                  fontFamily: 'Poppins-Regular'
                }}
                data={dataActivity}
                labelField="label"
                valueField="value"
                placeholder={'Select Carbon Type'}
                value={carbonTypeVal}
                onChange={onChangeCarbonType}
              />
            </View>
          </View> : ""}
          <TouchableOpacity onPress={filterOptionShow} >
            <Image
              source={require('../Common/images/filter100.png')}
              resizeMode="cover" style={styles.filterIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      {filterOption && filterOption == true ?
        <TouchableOpacity style={styles.OptionWrapper}>
          <RadioForm label={t('farmer_name')}
            selected={filterItem === 'Farmer/Product Name'}
            onSelect={() => onchangeFilterItem('Farmer/Product Name')}
          />
          <RadioForm label={t('farmer_number')}
            selected={filterItem === 'PhoneNumber'}
            onSelect={() => onchangeFilterItem('PhoneNumber')}
          />
          {category == true ?
            <RadioForm label={t('category')}
              selected={filterItem === 'Category'}
              onSelect={() => onchangeFilterItem('Category')}
            />
            : ""
          }
          {/* {statusFilter == true ?
            <RadioForm label={t('sta_')}
              selected={filterItem === 'statusFilter'}
              onSelect={() => onchangeFilterItem('statusFilter')}
            />
            : ""
          } */}
          <RadioForm label={t('date')}
            selected={filterItem === 'Date'}
            onSelect={() => onchangeFilterItem('Date')}
          />
          {
            carbonFlag == true && <RadioForm label={t('Carbon/NonCarbon')}
              selected={filterItem === 'Carbon'}
              onSelect={() => onchangeFilterItem('Carbon')}
            />
          }
        </TouchableOpacity> : ""
      }
    </>
  )
}

export default memo(Filter)

const styles = StyleSheet.create({
  filterContainer: {
    alignItems: 'flex-end',
    padding: 10,
    // marginHorizontal: "%"
  },
  prevNextPage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    position: 'relative',
    bottom: 0
  },
  title: {
    color: '#000',
    fontSize: 15,
    fontFamily: 'Poppins-Regular'
  },
  OptionWrapper: {
    borderColor: '#efe9e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    borderRadius: 7,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginVertical: 7,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterItem: {
    color: "#000",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  filterInput: {
    backgroundColor: '#FFF',
    // width: '90%',
    marginHorizontal: '2.5%',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
    paddingHorizontal: 20,
    height: 45,
    color: "#000",
    fontFamily: 'Poppins-Regular'
  },
  filterIcon: {
    width: 23,
    height: 23
  },
  dataSearchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    width: '100%',
    marginHorizontal: '1%',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
    paddingHorizontal: 20,
    height: 45,
  },
  dateContainer: {
    flex: 1,
    // justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchSection: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 50,
    height: 45,
    marginRight: 10,
    width: '90%',
    marginHorizontal: '5%'
  },
  searchIcon: {
    // marginHorizontal:10
    width: 30,
    height: 30,
    margin: 10,
    // borderWidth:1,
    // borderColor:'#020202',
    // borderRadius:50,
  },
  input: {
    flex: 1,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    backgroundColor: '#fff',
    color: '#424242',
    borderRadius: 30,
    paddingHorizontal: 20,
    fontFamily: 'Poppins-Regular'
  },
})
