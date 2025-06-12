import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput } from 'react-native';
import React from 'react';
import RadioForm from './RadioForm';
import { useTranslation } from 'react-i18next';
const FarmerFilter = ({
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
  onlyDate,
  filterDataRemove,
  statusFilter,
  statusNameValue
}) => {
  const { t } = useTranslation();
  return (
    <>
      <View style={styles.filterContainer}>
        <View>{title != undefined ? <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 18, color: '#000' }}>{title}</Text> : ""}</View>
        <View style={styles.filterItem}>
          {filterItem === 'Farmer/Product Name' ?
            <TextInput
              style={styles.filterInput}
              placeholder='Farmer Name'
              placeholderTextColor="#000"
              onChangeText={onChangeText}
              value={FarmerProductNameValue}
            />
            : ""}
          {filterItem === 'PhoneNumber' ?
            <TextInput
              style={styles.filterInput}
              placeholder='Phone Number'
              placeholderTextColor="#000"
              onChangeText={onChangeText}
              value={FarmerProductPhoneValue}
            />
            : ""}
          {filterItem === 'Category' ?
            <TextInput
              style={styles.filterInput}
              placeholder='Category'
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
                placeholder={'Status'}
                placeholderTextColor="#000"
                onChangeText={onChangeText}
                value={statusNameValue}
                underlineColorAndroid="transparent"
              />
            </View>
            : ""}
          {filterItem === 'Date' ?
            <View style={styles.dataSearchContainer}>
              <TouchableOpacity onPress={filterDataRemove}>
                <Image source={require('./images/cross100.png')}
                  style={styles.searchIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOpenFromDate(true)} style={styles.dateContainer}>
                <Text style={[styles.title, { marginRight: 7 }]}>
                  {fromDate == "" ? t('from_date') : `${fromDate}`}
                </Text>
                <Image source={require('./images/calendar.png')}
                  style={{ width: 27, height: 27 }}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOpenToDate(true)} style={styles.dateContainer}>
                <Text style={[styles.title, { marginRight: 7 }]}>
                  {newToDate == "" ? t('to_date') : `${newToDate}`}</Text>
                <Image source={require('./images/calendar.png')}
                  style={{ width: 27, height: 27 }}
                />
              </TouchableOpacity>
            </View>
            : ""}
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
          {onlyDate == false ?
            <RadioForm label="Farmer/Product Name"
              selected={filterItem === 'Farmer/Product Name'}
              onSelect={() => onchangeFilterItem('Farmer/Product Name')}
            /> : ""
          }
          {onlyDate == false ?
            <RadioForm label={"Phone Number"}
              selected={filterItem === 'PhoneNumber'}
              onSelect={() => onchangeFilterItem('PhoneNumber')}
            />
            : ""
          }
          {category == true ?
            <RadioForm label={"Category"}
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
        </TouchableOpacity> : ""
      }
    </>
  )
}

export default FarmerFilter

const styles = StyleSheet.create({
  filterContainer: {
    alignItems: 'flex-end', padding: 2, marginHorizontal: "2.5%"
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
    fontSize: 15
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
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterInput: {
    backgroundColor: '#FFF',
    width: '90%',
    marginHorizontal: '5%',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
    paddingHorizontal: 20,
    height: 45,
    color: "#000",
  },
  filterIcon: {
    width: 23,
    height: 23,
    marginVertical: 10
  },
  dataSearchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    width: '90%',
    marginHorizontal: '5%',
    marginVertical: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
    paddingHorizontal: 20,
    height: 45
  },
  searchIcon: {
    width: 25,
    height: 25,
  },
  dateContainer: {
    justifyContent: 'space-between',
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
