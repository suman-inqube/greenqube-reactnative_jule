import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {Colors, Fonts} from '../../utils/Constants';

const CropData = ({
  t,
  farmerData,
  livelihoodType,
  handleAddDatalivelihoodType,
  produceName,
  handleAddDataproduceName,
  produceVariety,
  handleAddDataproduceVariety,
  productionProcess,
  handleAddDataProductionProcess,
  productionUnit,
  handleAddDataUnitProduct,
  productionSeason,
  handleAddDataproductionSeason,
  setopenCycleStart,
  setopenCycleEnd,
  handleUserListUpdate,
  isLoading,
  harvested,
  userData,
  addPlot,
  edit,
  DropdownForm,
  InputTextForm,
  ButtonForm,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Farm/Produce Type */}
      <DropdownForm
        label={t('addcrop_croptype')}
        required={true}
        data={livelihoodType}
        onChange={handleAddDatalivelihoodType}
        val={farmerData.livelihoodType}
        disable={
          edit === '' ? (harvested === 'same produce' ? true : false) : edit
        }
      />

      {/* 2. Produce Name */}
      <DropdownForm
        label={t('crop_name')}
        required={true}
        data={produceName}
        onChange={handleAddDataproduceName}
        val={farmerData.produceName}
        disable={
          edit === '' ? (harvested === 'same produce' ? true : false) : edit
        }
      />

      {/* 3. Produce Variety */}
      <DropdownForm
        label={t('crop_veriety')}
        required={true}
        data={produceVariety}
        onChange={handleAddDataproduceVariety}
        val={farmerData.produceVariety}
        disable={
          edit === '' ? (harvested === 'same produce' ? true : false) : edit
        }
      />

      {/* 4. Production Process */}
      <DropdownForm
        label={t('production_system')}
        required={true}
        data={productionProcess}
        onChange={handleAddDataProductionProcess}
        val={farmerData.productionProcess}
        disable={
          edit === '' ? (harvested === 'same produce' ? true : false) : edit
        }
      />

      {/* 5. Expected Production & 6. Unit */}
      <View style={styles.row}>
        <View style={{width: '50%'}}>
          <InputTextForm
            label={t('expected_yield')}
            keyboardType="number-pad"
            required={true}
            value={farmerData.expectedProduction}
            onChangeText={text => (farmerData.expectedProduction = text)} // Standardized with parent state
          />
        </View>
        <View style={{width: '45%'}}>
          <DropdownForm
            label={t('select_unit_input')}
            required={true}
            data={productionUnit}
            onChange={handleAddDataUnitProduct}
            val={farmerData.unitProduct}
          />
        </View>
      </View>

      {/* 7. Production Session */}
      <DropdownForm
        label={t('addcrop_select_cultivating_season')}
        required={true}
        data={productionSeason}
        onChange={handleAddDataproductionSeason}
        val={farmerData.productionSeason}
        disable={
          edit === '' ? (harvested === 'same produce' ? true : false) : edit
        }
      />

      {/* 8. Cycle Start */}
      <TouchableOpacity
        onPress={() =>
          harvested !== '' || userData === 'addUserData' || addPlot
            ? setopenCycleStart(true)
            : null
        }
        style={styles.datePicker}>
        <Text style={styles.label}>{t('showing_date')} *</Text>
        <View style={styles.dateDisplay}>
          <Text style={{color: '#000'}}>
            {farmerData.cycleStartDate || 'Select'}
          </Text>
          <Image
            source={require('../../Common/images/calendar.png')}
            style={styles.icon}
          />
        </View>
      </TouchableOpacity>

      {/* 9. Cycle End */}
      <TouchableOpacity
        onPress={() =>
          harvested !== '' || userData === 'addUserData' || addPlot
            ? setopenCycleEnd(true)
            : null
        }
        style={styles.datePicker}>
        <Text style={styles.label}>
          {t('harvesting_date_auto_calculated')} *
        </Text>
        <View style={styles.dateDisplay}>
          <Text style={{color: '#000'}}>
            {farmerData.cycleEndDate || 'Select'}
          </Text>
          <Image
            source={require('../../Common/images/calendar.png')}
            style={styles.icon}
          />
        </View>
      </TouchableOpacity>

      {/* Submit Button moved here */}
      <View style={{marginTop: 20, marginBottom: 40}}>
        <ButtonForm
          label={t('submit')}
          onPress={handleUserListUpdate}
          loading={isLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {padding: 10},
  row: {flexDirection: 'row', justifyContent: 'space-between'},
  datePicker: {marginVertical: 10},
  label: {color: '#4e4e4e', fontFamily: Fonts.Regular, fontSize: 15},
  dateDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  icon: {width: 20, height: 20, tintColor: Colors.useGreen},
});

export default CropData;
