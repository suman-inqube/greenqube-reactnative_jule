import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput,ScrollView,FlatList } from 'react-native'
import React from 'react'
import RadioForm from './RadioForm'
const FilterSearch = ({
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

}) => {
  return (
    <>
      <View style={styles.filterContainer}>
        <View>
          <Text style={[styles.title, { paddingBottom: 8, paddingTop: 4, fontWeight: '700' }]}>{title}</Text>
        </View>
        <View style={styles.filterItem}>
          {filterItem === 'Farmer/Product Name' ?
            <>
              <TextInput
                style={styles.filterInput}
                placeholder='Farmer Name'
                placeholderTextColor="#000"
                onChangeText={onChangeText}
              />
            
            </>
            : ""}
          {filterItem === 'PhoneNumber' ?
            <TextInput
              style={styles.filterInput}
              placeholder='Phone Number'
              placeholderTextColor="#000"
              onChangeText={onChangeText}
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
          {filterItem === 'Date' ?
            <View style={styles.dataSearchContainer}>
              <TouchableOpacity onPress={() => setOpenFromDate(true)} style={styles.dateContainer}>
                <Text style={[styles.title, { marginLeft: 5 }]}>
                  {fromDate == "" ? "From date" : `${fromDate}`}
                </Text>
                <Image source={require('./images/date_sort.png')}
                  style={{ width: 30, height: 30 }}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOpenToDate(true)} style={styles.dateContainer}>
                <Text style={styles.title}>
                  {newToDate == "" ? "To date" : `${newToDate}`}</Text>
                <Image source={require('./images/date_sort.png')}
                  style={{ width: 30, height: 30 }}
                />
              </TouchableOpacity>
            </View>
            : ""}
          <TouchableOpacity onPress={filterOptionShow} >
            <Image
              source={require('../Common/images/filter.jpeg')}
              resizeMode="cover" style={styles.filterIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      {filterOption && filterOption == true ?
        <TouchableOpacity style={styles.OptionWrapper}>
          <RadioForm label="Farmer/Product Name"
            selected={filterItem === 'Farmer/Product Name'}
            onSelect={() => onchangeFilterItem('Farmer/Product Name')}
          />
          <RadioForm label={"Phone Number"}
            selected={filterItem === 'PhoneNumber'}
            onSelect={() => onchangeFilterItem('PhoneNumber')}
          />
          {category == true ?
            <RadioForm label={"Category"}
              selected={filterItem === 'Category'}
              onSelect={() => onchangeFilterItem('Category')}
            />
            : ""
          }
          <RadioForm label={"Date"}
            selected={filterItem === 'Date'}
            onSelect={() => onchangeFilterItem('Date')}
          />
        </TouchableOpacity> : ""
      }
    </>
  )
}

export default FilterSearch

const styles = StyleSheet.create({
  filterContainer: {
    alignItems: 'flex-end', width: "90%", padding: 10, marginHorizontal: "5%"
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
    height: 45
  },
  filterIcon: {
    width: 30,
    height: 30
  },
  dataSearchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    height: 45
  },
  dateContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  flatlistcontainer: {
    marginVertical: 10, backgroundColor: '#FFF',
    position: 'relative',
    top: -23, padding: 1,
    elevation: 10,
    borderRadius: 10
},
flatlistitem: {
    marginVertical: 10,
    marginHorizontal: 10
},
flatlisttitle: {
    fontSize: 16,
    color: '#000'
}

})
