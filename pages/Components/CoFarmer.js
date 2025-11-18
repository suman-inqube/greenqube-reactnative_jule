import React, {memo} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';

import DocumentPicker, {types, pick} from '@react-native-documents/picker';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DropdownForm from '../Common/DropdownForm';
import {Colors} from '../utils/Constants';
import {Fonts} from '../utils/Constants';
// Responsive height + width
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

function CoFarmerComponent({
  title = 'Co-Farmer Details',
  coFarmerDetails,
  setCoFarmerDetails,
  onCancel,
  onSave,
  unitAll,
  unit_valueArr,
}) {
  const handleGovtIdPick = async () => {
    try {
      const result = await pick({
        presentationStyle: 'fullScreen',
        type: [types.pdf, types.images],
      });
      const file = result[0];
      setCoFarmerDetails(prev => ({
        ...prev,
        govtId: file.uri,
        govtIdType: file.type,
        gotIdName: file.name,
      }));
    } catch (err) {
      if (DocumentPicker.isCancel(err)) return;
      console.error('Picker Error:', err);
    }
  };

  const isValid = coFarmerDetails.govtId;

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 40}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>

          {/* Phone Number */}
          <Text style={styles.label}>Farmer's Phone No (Optional)</Text>
          <InputField
            placeholder="Enter phone number"
            keyboardType="numeric"
            maxLength={10}
            value={coFarmerDetails.phone}
            onChangeText={text =>
              setCoFarmerDetails(prev => ({
                ...prev,
                phone: text.replace(/[^0-9]/g, ''),
              }))
            }
          />

          {/* Govt ID Upload */}
          <Text style={styles.label}>Govt ID Proof *</Text>

          <TouchableOpacity style={styles.uploadBox} onPress={handleGovtIdPick}>
            {coFarmerDetails.govtId ? (
              coFarmerDetails.govtIdType === 'application/pdf' ? (
                <View style={styles.pdfBox}>
                  <AntDesign name="pdffile1" size={50} color="red" />
                  <Text style={styles.pdfText}>PDF Selected</Text>
                </View>
              ) : (
                <Image
                  source={{uri: coFarmerDetails.govtId}}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              )
            ) : (
              <View style={styles.placeholderBox}>
                <AntDesign name="upload" size={42} color="#777" />
                <Text style={styles.uploadText}>Scan / Browse Document</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Land Area */}
          <Text style={styles.label}>Land Area (Optional)</Text>
          <InputField
            placeholder="Enter land area"
            keyboardType="numeric"
            value={coFarmerDetails.landArea}
            onChangeText={text =>
              setCoFarmerDetails(prev => ({
                ...prev,
                landArea: text.replace(/[^0-9.]/g, ''),
              }))
            }
          />

          {/* Land Unit */}
          {/* <Text style={styles.label}>Land Unit (Optional)</Text> */}
          {/* <InputField
                        placeholder="Acre / Hectare / Sq Ft"
                        value={coFarmerDetails.landUnit}
                        onChangeText={(text) =>
                            setCoFarmerDetails(prev => ({
                                ...prev,
                                convertedLandArea: text,
                            }))
                        }
                    /> */}

          <View style={{marginTop: 10}}>
            <DropdownForm
              data={unitAll}
              label={'Land Unit (Optional)'}
              onChange={item => {
                let selectUnitValue = '';
                if (unit_valueArr != '') {
                  JSON.parse(unit_valueArr).map((data, index) => {
                    if (item.value === data?.fid) {
                      selectUnitValue = data.unit_value;
                    }
                  });
                }
                setCoFarmerDetails(prev => ({
                  ...prev,
                  convertedLandArea: `${
                    Number(selectUnitValue) * Number(coFarmerDetails.landArea)
                  }`,
                  unit: item.label,
                  unitValue: item.value,
                }));
              }}
              val={coFarmerDetails.unit}
            />
          </View>
          {/* Documented Land Area */}
          <Text style={styles.label}>Documented Land Area (Auto)</Text>
          <InputField
            // placeholder={`${coFarmerDetails.convertedLandArea}`}
            editable={false}
            value={coFarmerDetails.convertedLandArea}
          />

          {/* Buttons */}
          <View style={styles.row}>
            <Button label="Cancel" onPress={onCancel} backgroundColor="#777" />

            <Button
              label="Save"
              onPress={onSave}
              backgroundColor="green"
              disabled={!isValid}
              opacity={!isValid ? 0.4 : 1}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const CoFarmer = memo(CoFarmerComponent);
export default CoFarmer;

/* INPUT COMPONENT */
const InputField = memo(
  ({
    placeholder,
    value,
    onChangeText,
    keyboardType,
    editable = true,
    maxLength = 50,
  }) => (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      keyboardType={keyboardType}
      maxLength={maxLength}
      style={[styles.input, !editable && {backgroundColor: '#eee'}]}
    />
  ),
);

/* BUTTON COMPONENT */
const Button = memo(({label, onPress, backgroundColor, disabled, opacity}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[styles.btn, {backgroundColor, opacity}]}>
    <Text style={styles.btnText}>{label}</Text>
  </TouchableOpacity>
));

/* STYLES */
const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.94, // FULL RESPONSIVE WIDTH
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    elevation: 5,
    alignSelf: 'center',
    marginTop: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
  },

  label: {
    color: '#4e4e4e',
    fontFamily: Fonts.Regular,
    fontSize: 14,
  },

  input: {
    width: '100%',
    borderWidth: 0.5,
    height: 45,
    // borderColor: "#ccc",
    borderColor: Colors.borderGreen,
    borderRadius: 5,
    padding: 10,
    fontSize: 15,
    marginBottom: 10,
  },

  /* ⭐ FULL WIDTH + RESPONSIVE HEIGHT UPLOAD BOX */
  uploadBox: {
    width: '100%',
    // borderWidth: 1,
    // borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',

    height: SCREEN_HEIGHT * 0.2,
    minHeight: 140,
    maxHeight: 240,
    borderColor: Colors.borderGreen,
    borderRadius: 5,
    borderWidth: 0.5,
    marginBottom: 15,
  },

  placeholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  uploadText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
  },

  pdfBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  pdfText: {
    color: '#333',
    fontSize: 14,
    marginTop: 6,
  },

  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 10,
  },

  btn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
