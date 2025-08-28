import {StyleSheet, Text, View, Image, TextInput, FlatList} from 'react-native';
import React from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useTranslation} from 'react-i18next';
import DatePicker from 'react-native-date-picker';
import DatePickerComp from '../../Common/DatePickerComp';
import LoadingScreen from '../../Common/LoadingScreen';
import {Colors} from '../../utils/Constants';
const SampleRequested = ({
  data,
  newdate,
  opencycleStarts,
  onPressDateContainer,
  setOpenFromDate,
  handlecycleStart,
  selectedDate,
  onChangeByID,
  onPressByID,
  isLoading,
}) => {
  const {t} = useTranslation();
  return (
    <View style={styles.container}>
      <DatePickerComp
        newDate={newdate}
        openDate={opencycleStarts}
        setOpenDate={setOpenFromDate}
        handleDatePicker={handlecycleStart}
      />
      <TouchableOpacity
        style={styles.searchByDateContainer}
        onPress={onPressDateContainer}>
        <Text style={styles.title}>
          {selectedDate == '' ? t('search_by_date') : selectedDate}
        </Text>
        <Image
          source={require('../../Common/images/calendar.png')}
          style={styles.calendarIcon}
        />
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder={t('search_by_sample_id')}
          style={styles.textInput}
          placeholderTextColor="#000"
          onChangeText={text => onChangeByID(text, 'sampleRequested')}
        />
        <TouchableOpacity onPress={() => onPressByID('sampleRequested')}>
          <Image
            source={require('../../Common/images/search.png')}
            style={styles.calendarIcon}
          />
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={styles.loadingScreen}>
          <LoadingScreen />
        </View>
      ) : null}
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={({item}) => {
          const {agri_land_user_rel, test_id, created_at} = item;
          return (
            <View style={styles.flatListItem}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {agri_land_user_rel?.plot_no}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>{t('Id')}:</Text>
                <Text style={styles.value}>{test_id}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>{t('date')}: </Text>
                <Text style={styles.value}>{created_at.substring(0, 10)}</Text>
              </View>
            </View>
          );
        }}
        keyExtractor={item => item.id}
      />
    </View>
  );
};
export default SampleRequested;
const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flex: 1,
    padding: 16,
  },
  searchByDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: '#2b2b2bff',
    borderRadius: 10,
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 45,
    backgroundColor: '#FFF',
    marginHorizontal: 8,
  },
  calendarIcon: {
    width: 25,
    height: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: '#2b2b2bff',
    borderRadius: 10,
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    marginVertical: 20,
    marginHorizontal: 8,
  },
  textInput: {
    width: '90%',
    height: 45,
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  listContainer: {
    padding: '2.5%',
    paddingHorizontal: '5%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 2,
    borderBottomWidth: 2,
    color: '#000',
  },
  title: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadingScreen: {
    position: 'absolute',
    top: '30%',
    zIndex: 999,
    left: '45%',
  },
  flatListItem: {
    backgroundColor: '#eeeeeeff',

    marginVertical: 8,
    borderRadius: 20,
    borderLeftWidth: 5,
    borderLeftColor: Colors.borderGreen,
    // flexDirection: 'row',
    // alignItems: 'center',
    // marginBottom: 8,
    paddingHorizontal: 5,
    marginHorizontal: '1%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 4,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: Colors.border,
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
    marginLeft: 5,
  },
  marqueeContainer: {
    flex: 1,
    // marginLeft: 10,
    marginRight: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 14,
    // fontWeight: '600',
    color: Colors.borderGreen,
    // marginLeft: 5,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 2,
  },
  cardTitleRe: {
    fontSize: 15,
    // fontWeight: '600',
    color: Colors.useGreen,
    // marginLeft: 5,
    fontFamily: 'Poppins-Regular',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 5,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#3d3d3dff',
    fontFamily: 'Poppins-Regular',
    flex: 1,
    textAlign: 'right',
  },
});
