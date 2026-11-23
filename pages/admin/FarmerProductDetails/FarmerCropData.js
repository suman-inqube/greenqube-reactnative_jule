import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import {Colors, Fonts} from '../../utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const FarmerCropData = ({
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
  InputTextFormEdit,
  handleAddUserDataDaag,
  // amendmentList,
  addMoreAmendments,
  handleChange,
  formData,
  handleAddUserDataFinalYield,
  handleAddUserDataPlantationMethod,
  // handleAddUserDataSeedingdate,
  handleAddUserDataWaterSource,
  handleAddUserDataGapSeedingFirrig,
  handleAddUserDataIrriPractice,
  handleAddUserDataDryingPeriodPrac,
  handleAddUserDataGapDrainingHarvest,
  handleAddUserDataAfterHarvestRiceStubble,
  handleAddUserDataAfterHarvestStraw,
  handleAddUserDataStrawRemoved,
  handleAddUserDataStrawIncorporate,
  handleAddUserDataEndUsgRmStraw,
  selectedType,
  setSelectedType,
  deleteAmendment,
  currentList,
  amendmentTypes,
  allItems,
  setAmendmentData,
  setseddingData,
  handleAddUserDataFinalYieldUnit,
  handleAddDataYieldUnitProduct,
  historyData,
  carbonType,
  organicAmendment,
  fertilizer,
  pesticide,
  plantationMethod,
  waterSource,
  irrigationPractice,
  riceStubble,
  doStraw,
  removedStraw,
  handleAmendmentTypes,
  amendmentUnit,
  handleAmendmentUnit,
}) => {
  // console.log('hisdata133331--', JSON.stringify(farmerData));

  // const [selectedType, setSelectedType] = useState('organic_amendment_type');
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
          addPlot
            ? false
            : historyData || (edit === '' ? harvested === 'same produce' : edit)
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
          addPlot
            ? false
            : historyData || (edit === '' ? harvested === 'same produce' : edit)
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
          addPlot ? false : historyData
          // || (edit === '' ? harvested === 'same produce' : edit)
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
          addPlot
            ? false
            : historyData || (edit === '' ? harvested === 'same produce' : edit)
        }
      />
      {/* 5. Expected Production & 6. Unit */}
      {carbonType !== 'mangrove' && (
        <View style={styles.row}>
          <View style={{width: '50%'}}>
            <InputTextForm
              label={t('expected_yield')}
              keyboardType="number-pad"
              required={true}
              value={farmerData.expectedProduction}
              editable={historyData ? false : true}
              onChangeText={handleAddDataYieldUnitProduct} //{text => (farmerData.expectedProduction = text)} // Standardized with parent state
            />
          </View>
          <View style={{width: '45%'}}>
            <DropdownForm
              label={t('select_unit_input')}
              required={true}
              data={productionUnit}
              onChange={handleAddDataUnitProduct}
              val={farmerData.unitProduct}
              disable={
                addPlot
                  ? false
                  : historyData ||
                    (edit === '' ? harvested === 'same produce' : edit)
              }
            />
          </View>
        </View>
      )}

      {/* {amendmentList.map((data, index) => {
        return ( */}

      {harvested == '' &&
        userData !== 'addUserData' &&
        addPlot !== true &&
        carbonType !== 'mangrove' && (
          <>
            <View style={styles.AddExpenseContainer}>
              <View style={styles.inputContainer}>
                <Text
                  style={{
                    fontSize: 24,
                    marginBottom: 10,
                  }}>
                  {t('amendments_inputs')}
                </Text>

                <View>
                  {amendmentTypes.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.radioRow}
                      onPress={() => setSelectedType(option.value)}>
                      <View style={styles.radioOuter}>
                        {selectedType === option.value && (
                          <View style={styles.radioInner} />
                        )}
                      </View>

                      <Text style={styles.radioText}>{t(option.label)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* <InputTextForm
                  label={t('name')}
                  value={formData.ferti_pesti_fid}
                  onChangeText={text => handleChange('ferti_pesti_fid', text)}
                /> */}
                <DropdownForm
                  label={t('name')}
                  data={
                    selectedType === 'pesticide'
                      ? pesticide
                      : selectedType === 'fertilizers'
                      ? fertilizer
                      : organicAmendment
                  }
                  onChange={handleAmendmentTypes}
                  val={farmerData.ferti_pesti_fid}
                />
              </View>

              <View style={styles.AddExpenseItemContainer}>
                <InputTextForm
                  label={t('quantity_kg')}
                  value={formData.quantity}
                  onChangeText={text => handleChange('quantity', text)}
                />

                <InputTextForm
                  label={t('number_of_applications')}
                  value={formData.no_of_applications}
                  onChangeText={text =>
                    handleChange('no_of_applications', text)
                  }
                />
              </View>

              <DropdownForm
                label={t('select_unit_input')}
                data={amendmentUnit}
                onChange={handleAmendmentUnit}
              />

              <TouchableOpacity
                onPress={addMoreAmendments}
                style={styles.addMore}>
                <MaterialIcons name={'add-circle'} color="white" size={25} />
                <Text style={styles.addMoreText}>{t('save')}</Text>
              </TouchableOpacity>
            </View>

            {/* })} */}

            {allItems.length > 0 && (
              <View style={{marginTop: 20}}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                  {t('items')}
                </Text>

                {allItems.map((item, index) => (
                  <View
                    key={item.uniqueKey}
                    style={{
                      backgroundColor: '#fff',
                      padding: 12,
                      marginVertical: 6,
                      borderRadius: 8,
                      elevation: 2,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View>
                      <Text>
                        {t('type')}:{' '}
                        {item?.type === 'organic_amendment_type'
                          ? 'Organic Amendments'
                          : item?.type === 'fertilizers'
                          ? 'Fertilizers'
                          : item?.type === 'pesticide'
                          ? 'Pesticide'
                          : ''}
                      </Text>
                      <Text>
                        {t('name')}:{' '}
                        {item.isFromAPI
                          ? item?.fpAmend?.categoryName
                          : item?.ferti_pesti_name}
                      </Text>
                      <Text>
                        {t('quantity')}: {item.quantity}{' '}
                        {item.isFromAPI
                          ? item?.fp_unit?.unit_name
                          : item?.unit_name}
                      </Text>
                      <Text>
                        {t('applications')}: {item.no_of_applications}
                      </Text>
                    </View>

                    {!item.isFromAPI && (
                      <TouchableOpacity
                        onPress={() => {
                          setAmendmentData(prev => ({
                            ...prev,
                            [item.type]: prev[item.type].filter(
                              (_, i) =>
                                i !== Number(item.uniqueKey.split('-')[1]),
                            ),
                          }));
                        }}
                        style={{
                          backgroundColor: 'red',
                          padding: 6,
                          borderRadius: 6,
                        }}>
                        <Text style={{color: 'white'}}>{t('delete')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            <InputTextForm
              label={t('yield')}
              value={farmerData.final_yield_qty}
              onChangeText={handleAddUserDataFinalYield}
            />

            <DropdownForm
              label={t('yield_unit')}
              data={productionUnit}
              onChange={handleAddUserDataFinalYieldUnit}
              val={farmerData.final_yield_unit}
            />

            <DropdownForm
              label={t('plantation_method')}
              data={plantationMethod}
              onChange={handleAddUserDataPlantationMethod}
              val={farmerData.plantation_method}
            />

            <TouchableOpacity
              onPress={() => setseddingData(true)}
              style={styles.datePicker}>
              <Text style={styles.label}>{t('seeding_date')}</Text>
              <View style={styles.dateDisplay}>
                <Text style={{color: '#000'}}>
                  {farmerData.seeding_date || t('select')}
                </Text>
                <Image
                  source={require('../../Common/images/calendar.png')}
                  style={styles.icon}
                />
              </View>
            </TouchableOpacity>

            <DropdownForm
              label={t('water_source')}
              data={waterSource}
              onChange={handleAddUserDataWaterSource}
              val={farmerData.water_source}
            />

            <InputTextForm
              label={t('gap_seeding_first_irrigation')}
              value={farmerData.gap_seeding_firrig}
              onChangeText={handleAddUserDataGapSeedingFirrig}
            />

            <DropdownForm
              label={t('irrigation_practice')}
              data={irrigationPractice}
              onChange={handleAddUserDataIrriPractice}
              val={farmerData.irri_practice}
            />

            <InputTextForm
              label={t('drying_periods_practiced')}
              value={farmerData.drying_period_prac}
              onChangeText={handleAddUserDataDryingPeriodPrac}
            />

            <InputTextForm
              label={t('gap_draining_harvest')}
              value={farmerData.gap_draining_harvest}
              onChangeText={handleAddUserDataGapDrainingHarvest}
            />

            <DropdownForm
              label={t('rice_stubble_after_harvest')}
              data={riceStubble}
              onChange={handleAddUserDataAfterHarvestRiceStubble}
              val={farmerData.after_harvest_rice_stubble}
            />

            <DropdownForm
              label={t('straw_after_harvest')}
              data={doStraw}
              onChange={handleAddUserDataAfterHarvestStraw}
              val={farmerData.after_harvest_straw}
            />

            <InputTextForm
              label={t('straw_removed_percent')}
              value={farmerData.straw_removed}
              onChangeText={handleAddUserDataStrawRemoved}
            />

            <InputTextForm
              label={t('straw_incorporated_percent')}
              value={farmerData.straw_incorporate}
              onChangeText={handleAddUserDataStrawIncorporate}
            />

            <DropdownForm
              label={t('end_usage_removed_straw')}
              data={removedStraw}
              onChange={handleAddUserDataEndUsgRmStraw}
              val={farmerData.end_usg_rm_straw}
            />
          </>
        )}
      {/* 7. Production Session */}
      <DropdownForm
        label={t('addcrop_select_cultivating_season')}
        required={true}
        data={productionSeason}
        onChange={handleAddDataproductionSeason}
        val={farmerData.productionSeason}
        disable={
          // historyData || (edit === '' ? harvested === 'same produce' : edit)
          historyData
            ? true
            : edit == ''
            ? harvested == 'same produce' || harvested == 'add new Produce'
              ? false
              : harvested == ''
              ? false
              : true
            : edit
        }
      />
      {/* 8. Cycle Start */}
      <TouchableOpacity
        onPress={() =>
          !historyData
            ? // && (harvested !== '' || userData === 'addUserData' || addPlot)
              setopenCycleStart(true)
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
          !historyData
            ? // &&
              //   (harvested !== '' || userData === 'addUserData' || addPlot)
              setopenCycleEnd(true)
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
    </View>
  );
};

const styles = StyleSheet.create({
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
  AddExpenseContainer: {
    flex: 1,
    marginVertical: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ecf8ffff',
    elevation: 3,
    // marginBottom: 10,
  },
  AddExpenseInput: {
    paddingLeft: 40,
    borderWidth: 1,
    borderColor: Colors.borderGreen,
    borderRadius: 20,
    marginVertical: 10,
    fontSize: 18,
    color: Colors.borderGreen,
    fontFamily: 'Poppins-Regular',
    backgroundColor: 'white',
  },
  AddExpenseItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  AddExpenseItem: {
    width: '60%',
    marginTop: 40,
  },
  AddExpenseItemDate: {
    width: '35%',
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
    padding: 8,
    borderRadius: 8,
    marginTop: 30,
    height: 45,
    backgroundColor: 'white',
  },
  addMore: {
    // position: 'absolute',
    // right: '-4%',
    // // bottom: 0,
    // top: '75%',
    zIndex: 999,
    backgroundColor: Colors.secondary,
    width: '60%',
    alignSelf: 'center',
    padding: 8,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,

    // borderTopLeftRadius: 30,
    // borderBottomLeftRadius: 30,
  },
  addMoreText: {
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    paddingLeft: 10,
  },
  inputContainer: {
    position: 'relative', // Needed for absolute positioning of icon
  },
  radioContainer: {
    marginBottom: 10,
  },

  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2e7d32',
  },

  radioText: {
    fontSize: 14,
  },
});

export default FarmerCropData;
