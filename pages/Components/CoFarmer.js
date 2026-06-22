import React, { memo, useContext, useState } from 'react';
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
  Alert,
} from 'react-native';

import DocumentPicker, { types, pick } from '@react-native-documents/picker';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DropdownForm from '../Common/DropdownForm';
import { Colors } from '../utils/Constants';
import { Fonts } from '../utils/Constants';
import { resizeImage } from '../utils/imageUtils';
import ImagePlaceHolderCircle from '../Common/ImagePlaceHolderCircle';
import RadioForm from '../Common/RadioForm';
import DatePickerComp from '../Common/DatePickerComp';
import { userCreateContext } from '../Context/usersCreateContext';
import { detectDocumentType, formatToDDMMYYYY, getAgeLimitDates, getOwnerName, isNameMatch } from '../utils/helpers';
import InputTextForm from '../Common/InputTextForm';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import DocumentScanner from 'react-native-document-scanner-plugin';
function CoFarmerComponent({
  title = 'Co-Farmer Details',
  coFarmerDetails,
  setCoFarmerDetails,
  onCancel,
  onSave,
  unitAll,
  unit_valueArr,
  landAreaUnit,
  ai_camera_id_proof = '0',
  registration = true,
}) {
  const { t, r } = useContext(userCreateContext);
  const { minimumDate, maximumDate } = getAgeLimitDates();
  const [newDate, setnewDate] = useState(new Date());
  const [penCycleStart, setopenCycleStart] = useState(false);
  const handleGovtIdPickTextRecognition = async fieldName => {
    try {
      const result = await DocumentScanner.scanDocument({
        maxNumDocuments: 1,
        letUserAdjustCrop: true,
        responseType: 'imageFilePath',
        croppedImageQuality: 100,
        saveInAppDocument: false,
      });

      if (result.scannedImages && result.scannedImages.length > 0) {
        const uri = result.scannedImages[0];
        try {
          try {
            const result = await TextRecognition.recognize(uri);
            const rawText = result.text;
            const detectedType = detectDocumentType(rawText);
            if (detectedType === 'Unknown Document') {
              Alert.alert(
                'Document Type Not Detected',
                "We couldn't recognize the document type. Please make sure you are uploading a clear Aadhaar or Voter ID card and try again.",
              );
              return;
            } else {
              const extractedName = getOwnerName(rawText, detectedType);
              if (extractedName.toLowerCase().replace(/\s/g, '').trim() == coFarmerDetails?.name?.toLowerCase()?.replace(/\s/g, '')) {
                setCoFarmerDetails(prev => ({
                  ...prev,
                  [fieldName]: {
                    uri: uri,
                    name: uri.split('/').pop(),
                    fileName: uri.split('/').pop(),
                    type: 'image/jpeg',
                  },
                }));
              } else {
                if (coFarmerDetails?.name?.toLowerCase().trim().split(' ')[0] == extractedName.toLowerCase().trim().split(' ')[0]) {
                  setCoFarmerDetails(prev => ({
                    ...prev,
                    [fieldName]: {
                      uri: uri,
                      name: uri.split('/').pop(),
                      fileName: uri.split('/').pop(),
                      type: 'image/jpeg',
                    },
                  }));
                } else {
                  if (isNameMatch(coFarmerDetails?.name, extractedName)) {
                    setCoFarmerDetails(prev => ({
                      ...prev,
                      [fieldName]: {
                        uri: uri,
                        name: uri.split('/').pop(),
                        fileName: uri.split('/').pop(),
                        type: 'image/jpeg',
                      },
                    }));
                  } else {
                    Alert.alert(
                      'Name Verification Failed',
                      "The farmer's name and the document owner's name do not match.",
                    );
                  }
                }
              }
            }
          } catch (error) {
            console.error('Text Recognition Error:', error);
            Alert.alert('Error', 'Text recognition failed. Please try again.');
          }
        } catch (err) {
          Alert.alert(
            'Error',
            'An error occurred while processing the document. Please try again.',
          );
        }
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) return;
      console.error('Picker Error:', err);
    }
  };
  const cleanText = text => {
    return text.toLowerCase().replace(/[^a-z0-9]/g, '');
  };
  const handleGovtIdPick = async fieldName => {
    try {
      const [res] = await pick({
        presentationStyle: 'fullScreen',
        type: [types.pdf, types.images],
      });
      let fileUri = res.uri;
      if (res.type?.startsWith('image/')) {
        fileUri = await resizeImage(res.uri);
      }
      setCoFarmerDetails(prev => ({
        ...prev,
        [fieldName]: {
          uri: fileUri,
          name: res.name,
          fileName: res.name,
          type: res.type,
        },
      }));
    } catch (err) {
      if (DocumentPicker.isCancel(err)) return;
      console.error('Picker Error:', err);
    }
  };
  const openFile = async file => {
    try {
      let path = file.uri;

      if (file.uri.startsWith('http')) {
        const localPath = `${RNFS.DocumentDirectoryPath}/${file.name || Date.now()
          }`;
        await RNFS.downloadFile({
          fromUrl: file.uri,
          toFile: localPath,
        }).promise;
        path = localPath;
      }

      await FileViewer.open(path, { showOpenWithDialog: true });
    } catch (e) {
      Alert.alert('Error', 'Unable to open document');
    }
  };
  const handleAddDataGender = (text, number) => {
    setCoFarmerDetails(prev => ({
      ...prev,
      ['gender']: number,
    }));
  };
  const handleDatePicker = date => {
    setCoFarmerDetails(prev => ({
      ...prev,
      ['date_of_birth']: formatToDDMMYYYY(date),
    }));
  };
  const isValid = coFarmerDetails.name;
  // dd-mm-yyyy
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <DatePickerComp
        openDate={penCycleStart}
        newDate={newDate}
        setOpenDate={setopenCycleStart}
        handleDatePicker={handleDatePicker}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        title="Select Date of Birth"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Header Section with Gradient Accent */}
          {/* <View style={styles.headerSection}>
                        <View style={styles.headerGradient} />
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>Fill in the farmer information below</Text>
                    </View> */}
          {/* Profile Image Section */}
           {registration === false ? (
          <View style={styles.profileContainer}>
            <View style={styles.profileImageWrapper}>
              <ImagePlaceHolderCircle
                openImagePicker={() => handleGovtIdPick('profile')}
                selectedImage={coFarmerDetails?.profile?.uri}
              />
              {/* <View style={styles.verifiedBadge}>
                                <Feather name="user-check" size={16} color="#fff" />
                            </View> */}
            </View>
          </View>
           ):null}

          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                {/* <Feather name="user" size={16} color="#10b981" /> */}
                <Text style={styles.label}>{t('farmer_name')}</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <View style={[styles.inputWrapper]}>
                <TextInput
                  placeholder={t('enter_farmer_full_name')}
                  value={coFarmerDetails.name}
                  onChangeText={text => {
                    setCoFarmerDetails(prev => ({
                      ...prev,
                      name: text,
                    }));
                    setCoFarmerDetails(prev => ({
                      ...prev,
                      ['idProof']: {
                        uri: '',
                        name: '',
                        fileName: '',
                        type: 'image/jpeg',
                      },
                    }));
                  }}
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                {/* <Feather name="phone" size={16} color="#10b981" /> */}
                <Text style={styles.label}>{t('phone_number')}</Text>
                <View style={styles.optionalBadge}>
                  <Text style={styles.optionalText}>{t('optional')}</Text>
                </View>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder={t('enter_mobile_number')}
                  keyboardType="numeric"
                  maxLength={10}
                  value={coFarmerDetails.phone}
                  onChangeText={text =>
                    setCoFarmerDetails(prev => ({
                      ...prev,
                      phone: text.replace(/[^0-9]/g, ''),
                    }))
                  }
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {registration === false ? (
              <>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    {/* <Feather name="phone" size={16} color="#10b981" /> */}
                    <Text style={styles.label}>{t('date_of_birth')}</Text>
                    <View style={styles.optionalBadge}>
                      <Text style={styles.optionalText}>{t('optional')}</Text>
                    </View>
                  </View>
                  <View style={[styles.inputWrapper]}>
                    <TouchableOpacity
                      onPress={() => setopenCycleStart(!penCycleStart)}>
                      <TextInput
                        label=""
                        placeholder={t('date_of_birth')}
                        // keyboardType="numeric"
                        // maxLength={2}
                        value={coFarmerDetails.date_of_birth}
                        // onChangeText={(text) =>
                        //     setCoFarmerDetails(prev => ({
                        //         ...prev,
                        //         date_of_birth: text.replace(/[^0-9]/g, ""),
                        //     }))
                        // }
                        style={[styles.input]}
                        editable={false}
                        placeholderTextColor="#9ca3af"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {/* {coFarmerDetails.type == "edit" ? <>
                            <View style={styles.inputGroup}>
                                <View style={styles.labelContainer}>

                                    <Text style={styles.label}>Password</Text>
                                    <View style={styles.optionalBadge}>
                                        <Text style={styles.optionalText}>Optional</Text>
                                    </View>
                                </View>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        placeholder="Password"
                                        value={coFarmerDetails.password}
                                        onChangeText={(text) =>
                                            setCoFarmerDetails(prev => ({
                                                ...prev,
                                                password: text,
                                            }))
                                        }
                                        style={styles.input}
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                            </View>
                        </> : <></>} */}

                {coFarmerDetails.type == '' ? (
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      {/* <Feather name="phone" size={16} color="#10b981" /> */}
                      <Text style={styles.label}>{t('aadhar_number')}</Text>
                      <View style={styles.optionalBadge}>
                        <Text style={styles.optionalText}>{t('optional')}</Text>
                      </View>
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        placeholder={t('enter_aadhar_number')}
                        keyboardType="numeric"
                        maxLength={12}
                        value={coFarmerDetails.aadhar_number}
                        onChangeText={text =>
                          setCoFarmerDetails(prev => ({
                            ...prev,
                            aadhar_number: text.replace(/[^0-9]/g, ''),
                          }))
                        }
                        style={styles.input}
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                  </View>
                ) : (
                  <></>
                )}
                {coFarmerDetails.type == '' ? (
                  <View style={{marginBottom: 15, paddingHorizontal: 10}}>
                    <Text style={styles.label}>{t('gender')}</Text>
                    <RadioForm
                      label={t('male')}
                      onSelect={() => handleAddDataGender('gender', '1')}
                      selected={coFarmerDetails.gender === '1'}
                    />
                    <RadioForm
                      label={t('female')}
                      onSelect={() => handleAddDataGender('gender', '2')}
                      selected={coFarmerDetails.gender === '2'}
                    />
                    <RadioForm
                      label={t('others')}
                      onSelect={() => handleAddDataGender('gender', '3')}
                      selected={coFarmerDetails.gender === '3'}
                    />
                  </View>
                ) : (
                  <></>
                )}

                {/* Section Divider */}
                {/* <View style={styles.sectionDivider}>
                            <View style={styles.dividerLine} />
                            <View style={styles.dividerTextContainer}>
                                <MaterialIcons name="verified-user" size={16} color="#10b981" />
                                <Text style={styles.dividerText}>DOCUMENT VERIFICATION</Text>
                            </View>
                            <View style={styles.dividerLine} />
                        </View> */}

                {/* Document Upload Info */}
                {/* <View style={styles.infoBox}>
                            <Feather name="info" size={16} color="#3b82f6" />
                            <Text style={styles.infoText}>Upload clear images or PDFs of government ID proofs</Text>
                        </View> */}

                {/* Upload Cards */}
                <View style={styles.uploadRow}>
                  {/* <TouchableOpacity
                                style={styles.uploadCard}
                                onPress={() => handleGovtIdPick("addressProof")}
                                activeOpacity={0.7}
                            >
                                {coFarmerDetails.addressProof?.uri ? (
                                    <View style={styles.uploadedContainer}>
                                        {coFarmerDetails.addressProof.type === "image/jpeg" ? (
                                            <>
                                                <Image
                                                    source={{ uri: coFarmerDetails.addressProof.uri }}
                                                    style={styles.previewImage}
                                                />
                                                <View style={styles.imageOverlay}>
                                                    <View style={styles.successBadge}>
                                                        <Feather name="check" size={14} color="#fff" />
                                                    </View>
                                                </View>
                                            </>
                                        ) : (
                                            <View style={styles.pdfContainer}>
                                                <View style={styles.pdfIconCircle}>
                                                    <AntDesign name="pdffile1" size={36} color="#ef4444" />
                                                </View>
                                                <Text style={styles.pdfText}>PDF Uploaded</Text>
                                                <View style={styles.successBadge}>
                                                    <Feather name="check" size={14} color="#fff" />
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <View style={styles.uploadPlaceholder}>
                                        <View style={styles.uploadIconCircle}>
                                            <Feather name="upload-cloud" size={28} color="#10b981" />
                                        </View>
                                        <Text style={styles.uploadTitle}>Address Proof</Text>
                                        <Text style={styles.uploadSubtitle}>Tap to upload</Text>
                                    </View>
                                )}
                            </TouchableOpacity> */}

                  {/* ID Proof */}
                  {/* <TouchableOpacity
                                style={styles.uploadCard}
                                onPress={() => handleGovtIdPick("idProof")}
                                activeOpacity={0.7}
                            >
                                {coFarmerDetails.idProof?.uri ? (
                                    <View style={styles.uploadedContainer}>
                                        {coFarmerDetails.idProof.type === "image/jpeg" ? (
                                            <>
                                                <Image
                                                    source={{ uri: coFarmerDetails.idProof.uri }}
                                                    style={styles.previewImage}
                                                />
                                                <View style={styles.imageOverlay}>
                                                    <View style={styles.successBadge}>
                                                        <Feather name="check" size={14} color="#fff" />
                                                    </View>
                                                </View>
                                            </>
                                        ) : (
                                            <View style={styles.pdfContainer}>
                                                <View style={styles.pdfIconCircle}>
                                                    <AntDesign name="pdffile1" size={36} color="#ef4444" />
                                                </View>
                                                <Text style={styles.pdfText}>PDF Uploaded</Text>
                                                <View style={styles.successBadge}>
                                                    <Feather name="check" size={14} color="#fff" />
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <View style={styles.uploadPlaceholder}>
                                        <View style={styles.uploadIconCircle}>
                                            <Feather name="upload-cloud" size={28} color="#10b981" />
                                        </View>
                                        <Text style={styles.uploadTitle}>ID Proof</Text>
                                        <Text style={styles.uploadSubtitle}>Tap to upload</Text>
                                    </View>
                                )}
                            </TouchableOpacity> */}
                </View>
                <View style={styles.uploadRow}>
                  <TouchableOpacity
                    style={styles.uploadCard}
                    activeOpacity={0.8}
                    onPress={() =>
                      coFarmerDetails.idProof?.uri
                        ? openFile(coFarmerDetails.idProof)
                        : ai_camera_id_proof == '1'
                        ? handleGovtIdPickTextRecognition('idProof')
                        : handleGovtIdPick('idProof')
                    }>
                    {coFarmerDetails.idProof?.uri ? (
                      <View style={styles.uploadedContainer}>
                        {coFarmerDetails.idProof.type?.startsWith('image/') ? (
                          <Image
                            source={{uri: coFarmerDetails.idProof.uri}}
                            style={styles.previewImage}
                          />
                        ) : (
                          <View style={styles.pdfContainer}>
                            <AntDesign
                              name="pdffile1"
                              size={36}
                              color="#ef4444"
                            />
                            <Text style={styles.pdfText}>
                              T{t('tap_to_view_pdf')}
                            </Text>
                          </View>
                        )}

                        {/* VIEW ICON */}
                        <TouchableOpacity
                          style={styles.viewBadge}
                          onPress={() =>
                            ai_camera_id_proof == '1'
                              ? handleGovtIdPickTextRecognition('idProof')
                              : openFile(coFarmerDetails.idProof)
                          }>
                          <MaterialIcons
                            name="visibility"
                            size={18}
                            color="#fff"
                          />
                        </TouchableOpacity>

                        {/* REPLACE ICON */}
                        <TouchableOpacity
                          style={styles.replaceBadge}
                          onPress={() =>
                            ai_camera_id_proof == '1'
                              ? handleGovtIdPickTextRecognition('idProof')
                              : handleGovtIdPick('idProof')
                          }>
                          <Feather name="refresh-cw" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.uploadPlaceholder}>
                        <Feather
                          name="upload-cloud"
                          size={28}
                          color="#10b981"
                        />
                        <Text style={styles.uploadTitle}> {t('id_proof')}</Text>
                        <Text style={styles.uploadSubtitle}>
                          {t('tap_to_upload')}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
                {/* Section Divider */}
                {/* <View style={styles.sectionDivider}>
                            <View style={styles.dividerLine} />
                            <View style={styles.dividerTextContainer}>
                                <MaterialIcons name="landscape" size={16} color="#10b981" />
                                <Text style={styles.dividerText}>LAND INFORMATION</Text>
                            </View>
                            <View style={styles.dividerLine} />
                        </View> */}

                {/* Land Area */}
                {coFarmerDetails.type == '' ? (
                  <>
                    <View style={[styles.inputGroup, {marginTop: 12}]}>
                      <View style={styles.labelContainer}>
                        {/* <MaterialIcons name="landscape" size={16} color="#10b981" /> */}
                        <Text style={styles.label}>{t('land_area')}</Text>
                        <View style={styles.optionalBadge}>
                          <Text style={styles.optionalText}>
                            {t('optional')}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          placeholder={t('enter_land_area')}
                          keyboardType="numeric"
                          value={coFarmerDetails.landArea}
                          onChangeText={text => {
                            setCoFarmerDetails(prev => {
                              const clean = text.replace(/[^0-9.]/g, '');
                              const unit = Number(prev?.UnitValueNum) || 0;
                              return {
                                ...prev,
                                landArea: clean,
                                convertedLandArea: String(unit * Number(clean)),
                              };
                            });
                          }}
                          style={styles.input}
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                    </View>

                    {/* Land Unit */}
                    <View style={styles.inputGroup}>
                      <View style={styles.labelContainer}>
                        {/* <MaterialIcons name="square-foot" size={16} color="#10b981" /> */}
                        <Text style={styles.label}>{t('land_unit')}</Text>
                        <View style={styles.optionalBadge}>
                          <Text style={styles.optionalText}>
                            {t('optional')}
                          </Text>
                        </View>
                      </View>
                      <DropdownForm
                        data={unitAll}
                        onChange={item => {
                          let selectUnitValue = '';
                          let UnitValueNum = '';
                          if (unit_valueArr !== '') {
                            JSON.parse(unit_valueArr).map(data => {
                              if (item.value === data?.fid) {
                                selectUnitValue = data.unit_value;
                                UnitValueNum = data.unit_value;
                              }
                            });
                          }
                          setCoFarmerDetails(prev => ({
                            ...prev,
                            convertedLandArea: `${
                              Number(selectUnitValue) *
                              Number(coFarmerDetails.landArea)
                            }`,
                            unit: item.label,
                            unitValue: item.value,
                            UnitValueNum: UnitValueNum,
                          }));
                        }}
                        val={coFarmerDetails.unit}
                      />
                    </View>

                    {/* Converted Land Area */}
                    <View style={[styles.inputGroup, {marginTop: -20}]}>
                      <View style={styles.labelContainer}>
                        {/* <MaterialIcons name="calculate" size={16} color="#10b981" /> */}
                        <Text style={styles.label}>
                          {t('converted_land_area')}
                        </Text>
                        {landAreaUnit && (
                          <View style={styles.unitBadge}>
                            <Text style={styles.unitBadgeText}>
                              {landAreaUnit}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View
                        style={[
                          styles.inputWrapper,
                          styles.disabledInputWrapper,
                        ]}>
                        <TextInput
                          editable={false}
                          value={coFarmerDetails.convertedLandArea}
                          style={[styles.input, styles.disabledInput]}
                          placeholderTextColor="#9ca3af"
                        />
                        <View style={styles.lockIconContainer}>
                          <Feather name="lock" size={16} color="#9ca3af" />
                        </View>
                      </View>
                    </View>
                  </>
                ) : (
                  <></>
                )}
              </>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onCancel}
              style={styles.cancelButton}
              activeOpacity={0.8}>
              {/* <Feather name="x" size={20} color="#6b7280" /> */}
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSave}
              disabled={!isValid}
              style={[styles.saveButton, !isValid && styles.disabledSaveButton]}
              activeOpacity={0.8}>
              {/* <Feather name="check-circle" size={20} color="#fff" /> */}
              <Text style={styles.saveButtonText}>
                {coFarmerDetails.type == ''
                  ? t('save_farmer')
                  : t('update_farmer')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const CoFarmer = memo(CoFarmerComponent);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    // paddingVertical: 16,
    // paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    // elevation: 8,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.12,
    // shadowRadius: 16,
  },

  // Header
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    // paddingBottom: 20,
    backgroundColor: '#ffffffff',
    position: 'relative',
  },
  headerGradient: {
    // position: "absolute",
    // top: 0,
    // left: 0,
    // right: 0,
    // height: 5,
    // backgroundColor: "#10b981",
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Profile
  profileContainer: {
    alignItems: 'center',
    marginTop: 10,
    // paddingVertical: 28,
    // backgroundColor: "#f8fdf9",
  },
  profileImageWrapper: {
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#10b981',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Form
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 22,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  required: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
  optionalBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  optionalText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  unitBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  unitBadgeText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  inputWrapper: {
    // borderWidth: 1.5,
    // borderColor: "#e5e7eb",
    // borderRadius: 14,
    // backgroundColor: "#fff",
    // position: "relative",
  },
  inputFocused: {
    // borderColor: "#10b981",
    // backgroundColor: "#f8fdf9",
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
    borderWidth: 0.5,
    borderColor: Colors.secondary,
    borderRadius: 5,
  },
  disabledInputWrapper: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  disabledInput: {
    color: '#6b7280',
  },
  lockIconContainer: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  // Section Divider
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#e5e7eb',
  },
  dividerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 6,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 1,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    fontWeight: '500',
    lineHeight: 18,
  },

  // Upload
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  uploadCard: {
    flex: 1,
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  uploadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  uploadedContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  successBadge: {
    backgroundColor: '#10b981',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  pdfContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    position: 'relative',
  },
  pdfIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  pdfText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991b1b',
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 12,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 30,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#10b981',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 6,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  disabledSaveButton: {
    backgroundColor: '#d1d5db',
    elevation: 0,
    shadowOpacity: 0,
  },
  labelContainer2: {},

  viewBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10b981',
    padding: 8,
    borderRadius: 20,
  },

  replaceBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#2563eb',
    padding: 8,
    borderRadius: 20,
  },
});
export default CoFarmer;