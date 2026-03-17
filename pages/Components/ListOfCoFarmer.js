import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Alert,
  TextInput,
} from 'react-native';
import React, {
  useEffect,
  useState,
  memo,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {axiosGet, axiosPut} from '../utils/api';
import {ROUTES} from '../utils/Routes';
import CheckBoxComp from '../Common/CheckBoxComp';
import InputTextForm from '../Common/InputTextForm';
import {Fonts} from '../utils/Constants';
import {pick, types} from '@react-native-documents/picker';
import {Toast} from '@sekizlipenguen/react-native-popup-confirm-toast';
import {AlertMesg} from '../Common/ToastAlert';
import {useNavigation} from '@react-navigation/native';
import {resizeImage} from '../utils/imageUtils';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import {Colors} from '../utils/Constants';
import DatePickerComp from '../Common/DatePickerComp';
import {formatToDDMMYYYY, getAgeLimitDates} from '../utils/helpers';
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
import PaginationNav from '../../pages/Components/PaginationNav';
import {userCreateContext} from '../../pages/Context/usersCreateContext';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
const Button = memo(({label, onPress, disabled}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.btnWrapper}>
      <Animated.View style={{transform: [{scale: scaleAnim}]}}>
        <LinearGradient
          colors={disabled ? ['#d1d5db', '#d1d5db'] : ['#10b981', '#059669']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={[styles.btn, disabled && styles.btnDisabled]}>
          {/* <MaterialIcons name="check-circle" size={20} color="#fff" /> */}
          <Text style={styles.btnText}>{label}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
});

const ListOfCoFarmer = ({
  dbname,
  lan_id,
  token,
  user_id,
  farmeruserID,
  plotId,
  isLoading,
  setIsLoading,
  status,
  effective_dates,
  setModalVisibleCoFarmer,
  setCoFarmerDetails,
  onEdit,
  modalVisibleCoFarmer,
}) => {
  const {t, LoadingScreen} = useContext(userCreateContext);
  const {minimumDate, maximumDate} = getAgeLimitDates();
  const [coFarmerList, setCoFarmerList] = useState([]);
  const [newDate, setnewDate] = useState(new Date());
  const [penCycleStart, setopenCycleStart] = useState(false);
  const navigation = useNavigation();
  const [coFarmer, setCoFarmer] = useState({
    co_farmer_id: '',
    password: '',
    phoneNumber: '',
    addressProof: null,
    idProof: null,
    profile: null,
    age: '',
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [isSubmit, setIsSubmit] = useState(false);

  const getAge = dob => {
    if (!dob) return ''; // or return null/0
    const d = new Date(dob);
    if (isNaN(d.getTime())) return ''; // invalid date → return empty

    return new Date(Date.now() - d).getUTCFullYear() - 1970;
  };

  useEffect(() => {
    const onPageLoad = async () => {
      setIsLoading(true);
      try {
        const response = await axiosGet(
          ROUTES.GET.LIST_CO_FARMERS({
            land_fid: plotId,
            pageNo: page,
            searchKey: searchText || '',
          }),
          token,
          {information: `${dbname},${lan_id},${user_id}`},
        );
        if (response?.status === 200) {
          setTotalPages(Math.ceil(response?.data?.data.count / 10));
          const resArr = response?.data?.data?.rows?.map(item => ({
            ...item,
            // CoFarmer: '',
            age: item?.coFInfo?.date_of_birth ?? '',
          }));
          setCoFarmerList(resArr);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    onPageLoad();
  }, [page, searchText]);
  // useEffect(() => {
  //   const onPageLoad = async () => {
  //     setIsLoading(true);
  //     try {
  //       // console.log(plotId, token, {
  //       //   information: `${dbname},${lan_id},${user_id}`,
  //       // });
  //       const response = await axiosGet(
  //         ROUTES.GET.LIST_CO_FARMERS({land_fid: plotId, pageNo: page}),
  //         token,
  //         {information: `${dbname},${lan_id},${user_id}`},
  //       );
  //       if (response?.status === 200) {
  //         setTotalPages(Math.ceil(response?.data?.data.count / 10));
  //         const resArr = response?.data?.data?.rows?.map(item => ({
  //           ...item,
  //           CoFarmer: '',
  //           age: item?.coFInfo?.date_of_birth,
  //         }));
  //         setCoFarmerList(resArr);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   onPageLoad();
  // }, [page]);

  // useEffect(() => {
  //     const onPageLoad = async () => {
  //         setIsLoading(true);
  //         try {
  //             const response = await axiosGet(
  //                 ROUTES.GET.LIST_CO_FARMERS({ land_fid: plotId }),
  //                 token,
  //                 { information: `${dbname},${lan_id},${user_id}` }
  //             );
  //             if (response?.status === 200) {
  //                 const resArr = response?.data?.data?.rows?.map((item) => ({
  //                     ...item,
  //                     CoFarmer: "",
  //                     age: item?.coFInfo?.date_of_birth,
  //                 }));
  //                 setCoFarmerList(resArr);
  //             }
  //         } catch (error) {
  //             console.error(error);
  //         } finally {
  //             setIsLoading(false);
  //         }
  //     };

  //     onPageLoad();
  // }, []);
  // useEffect(() => {
  //   fetchCoFarmers(page);
  // }, [page, fetchCoFarmers]);

  // const fetchCoFarmers = useCallback(
  //   async (pageNo) => {
  //     setIsLoading(true);
  //     try {

  //         console.log(pageNo, 'pageNo');
  //       const response = await axiosGet(
  //         ROUTES.GET.LIST_CO_FARMERS({
  //           land_fid: plotId,
  //           page: pageNo,
  //         }),
  //         token,
  //         {information: `${dbname},${lan_id},${user_id}`},
  //       );

  //       if (response?.status === 200) {
  //         const rows = response?.data?.data?.rows || [];
  //         const meta = response?.data?.data?.meta; // if backend sends meta

  //         const resArr = rows.map(item => ({
  //           ...item,
  //           CoFarmer: '',
  //           age: item?.coFInfo?.date_of_birth,
  //         }));

  //         setCoFarmerList(resArr);

  //         // pagination flags
  //         setHasPrev(pageNo > 1);
  //         setHasNext(
  //          true
  //         );
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   },
  //   [plotId, token, dbname, lan_id, user_id,page, limit],
  // );

  const onCheckCoFarmer = useCallback(
    (index, co_farmer_id, phoneNum, item) => {
      if (['PENDING', 'REJECTED'].includes(status)) {
        setCoFarmerList(prev =>
          prev.map((item, i) => ({
            ...item,
            CoFarmer: i === index ? (!item.CoFarmer ? true : '') : '',
          })),
        );
        let idProof = null;
        let addressProof = null;
        let profile = null;
        for (const f of item.coFInfo?.agri_files) {
          console.log(f);
          if (f.term_type === 'farmer_identity')
            idProof = {
              uri: f.file_path,
              name: f.name,
              type: f.file_ext,
            };
          else if (f.term_type === 'farmer_address')
            addressProof = {
              uri: f.file_path,
              name: f.name,
              type: f.file_ext,
            };
          else if (f.term_type === '1')
            profile = {
              uri: f.file_path,
              name: f.name,
              type: f.file_ext,
            };
          if (idProof && addressProof) break; // stop early
        }
        setCoFarmer(prev => ({
          ...prev,
          co_farmer_id: prev.co_farmer_id === co_farmer_id ? '' : co_farmer_id,
          password: '',
          phoneNumber:
            prev.co_farmer_id === co_farmer_id
              ? ''
              : item?.coFInfo?.userType == 22 &&
                (item?.coFInfo?.alternate_contact_num == null ||
                  item?.coFInfo?.alternate_contact_num == '')
              ? ''
              : item?.coFInfo?.contactNumber ?? '',
          addressProof: addressProof,
          idProof: idProof,
          profile: profile,
          age: item?.age != 0 && item?.age != 'NaN' ? `${item?.age}` : '',
        }));
      } else {
        Toast.show({
          text: `This is an approved plot. Farmer shuffling is not allowed
                `,
          ...{...AlertMesg[0], position: 'top'},
        });
      }
    },
    [status],
  );

  const onCheckCoFarmerEdit = useCallback(
    (index, co_farmer_id, phoneNum, item) => {
      const {coFInfo} = item || {};
      try {
        if (['PENDING', 'REJECTED'].includes(status)) {
          const details = {
            name: coFInfo?.userName,
            aadhar_number: coFInfo?.aadhar_number,
            date_of_birth: coFInfo?.date_of_birth,
            gender: coFInfo?.gender,
            phone:
              item?.coFInfo?.userType == 22 &&
              (item?.coFInfo?.alternate_contact_num == null ||
                item?.coFInfo?.alternate_contact_num == '')
                ? ''
                : item?.coFInfo?.contactNumber ?? '',
            CoFarmer: '',
            addressProof: null,
            idProof: null,
            profile: null,
            type: 'edit',
            co_farmer_id: coFInfo.user_id,
          };
          const mapKeys = {
            farmer_address: 'addressProof',
            farmer_identity: 'idProof',
            farmer_profile: '1',
          };
          coFInfo?.agri_files?.forEach(file => {
            const key = mapKeys[file.term_type];
            if (file.term_type === '1') {
              details['profile'] = {
                uri: file.file_path,
                name: file.file_name,
                type: file.file_ext,
              };
            }
            if (key) {
              details[key] = {
                uri: file.file_path,
                name: file.file_name,
                type: file.file_ext,
              };
            }
          });
          setCoFarmerDetails(details);
          setModalVisibleCoFarmer(!modalVisibleCoFarmer);
        } else {
          Toast.show({
            text: `This is an approved plot. Farmer shuffling is not allowed
                `,
            ...{...AlertMesg[0], position: 'top'},
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    [status],
  );

  const pickFile = useCallback(async fieldName => {
    try {
      const [res] = await pick({
        presentationStyle: 'fullScreen',
        type: [types.pdf, types.images],
      });
      let fileUri = res.uri;
      if (res.type?.startsWith('image/')) {
        fileUri = await resizeImage(res.uri);
      }
      if (res) {
        setCoFarmer(prev => ({
          ...prev,
          [fieldName]: {
            uri: fileUri,
            name: res.name,
            fileName: res.name,
            type: res.type,
          },
        }));
      }
    } catch (error) {
      console.log('Pick error:', error);
    }
  }, []);

  const onSave = useCallback(async () => {
    try {
      setIsSubmit(true);
      const formdata = new FormData();
      formdata.append('rel_id', plotId);
      formdata.append('main_farmer_id', farmeruserID);
      formdata.append('co_farmer_id', coFarmer.co_farmer_id);
      formdata.append('password', coFarmer.password);
      formdata.append('contactNumber', coFarmer.phoneNumber);
      if (coFarmer.age !== '') {
        formdata.append('date_of_birth', coFarmer.age);
      }
      if (coFarmer.addressProof) {
        formdata.append('farmer_address', {
          uri: coFarmer.addressProof.uri,
          name: coFarmer.addressProof.name,
          type: coFarmer.addressProof.type,
        });
      }
      if (coFarmer.idProof) {
        formdata.append('farmer_identity', {
          uri: coFarmer.idProof.uri,
          name: coFarmer.idProof.name,
          type: coFarmer.idProof.type,
        });
      }
      // console.log('formdata==', JSON.stringify(formdata));
      const updateOwnerShipRes = await axiosPut(
        ROUTES.PUT.UP_DATE_OWNER_SHIP,
        formdata,
        token,
        false,
        {information: `${dbname},${lan_id},${user_id}`},
      );

      if (updateOwnerShipRes?.status == 200) {
        setIsSubmit(false);
        Toast.show({
          text: 'Data submitted successfully',
          ...{...AlertMesg[0], position: 'top'},
        });
        navigation.popToTop();
        navigation.navigate('userList');
        Toast.show({
          text: 'Data submitted successfully',
          ...{...AlertMesg[0], position: 'top'},
        });
        Alert.alert('Data submitted successfully');
      }
    } catch (error) {
      setIsSubmit(false);
      Alert.alert(`${error?.data?.error?.errorMessage}`);
    }
  }, [
    coFarmer,
    plotId,
    farmeruserID,
    dbname,
    lan_id,
    user_id,
    token,
    navigation,
  ]);

  const isFormValid =
    coFarmer.co_farmer_id &&
    coFarmer.password &&
    coFarmer.phoneNumber &&
    coFarmer.phoneNumber.length === 10;
  const handleDatePicker = date => {
    setCoFarmer(prev => ({
      ...prev,
      ['age']: formatToDDMMYYYY(date),
    }));
  };

  const onNextPage = () => {
    if (hasNext) setPage(prev => prev + 1);
  };

  const onPrevPage = () => {
    if (hasPrev) setPage(prev => prev - 1);
  };
  const onSearchChange = text => {
    setSearchText(text);
    setPage(1); // reset to first page
  };
  const filteredCoFarmerList = coFarmerList.filter(item => {
    const name = item?.coFInfo?.userName?.toLowerCase() || '';
    const phone = item?.coFInfo?.contactNumber || '';

    return (
      name.includes(searchText.toLowerCase()) || phone.includes(searchText)
    );
  });
  return (
    <View style={styles.container}>
      <DatePickerComp
        openDate={penCycleStart}
        newDate={newDate}
        setOpenDate={setopenCycleStart}
        handleDatePicker={handleDatePicker}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        title="Select Date of Birth"
      />
      {isSubmit ? (
        <View style={styles.LoadingScreen}>
          <LoadingScreen />
        </View>
      ) : null}

      {/* Header with Gradient */}
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <MaterialIcons name="people" size={32} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Co-Farmers</Text>
            {/* <Text style={styles.headerSubtitle}>Select a co-farmer to switch ownership</Text> */}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#585858" />
        <TextInput
          placeholder="Search by name"
          placeholderTextColor="#585858" // optional
          value={searchText}
          onChangeText={onSearchChange}
          // onChangeText={text => setSearchText(text)}
          style={styles.searchInput}
          keyboardType="default"
        />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="always"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loaderText}>Loading co-farmers...</Text>
          </View>
        ) : coFarmerList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="users" size={48} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>No Co-Farmers Yet</Text>
            {/* <Text style={styles.emptyText}>Add co-farmers to manage your farm collaboratively</Text> */}
          </View>
        ) : (
          coFarmerList.map((item, index) => {
            const isSelected = item.CoFarmer;
            const hasPhone =
              item?.coFInfo?.userType == 22 &&
              (item?.coFInfo?.alternate_contact_num == null ||
                item?.coFInfo?.alternate_contact_num == '');

            return (
              <View key={index} style={styles.itemContainer}>
                {/* Farmer Card */}
                <TouchableOpacity
                  onPress={() =>
                    onCheckCoFarmer(
                      index,
                      item?.coFInfo?.user_id,
                      item?.coFInfo?.contactNumber,
                      item,
                    )
                  }
                  activeOpacity={0.9}>
                  <View
                    style={[styles.card, isSelected && styles.cardSelected]}>
                    {/* Avatar Circle */}
                    <LinearGradient
                      colors={
                        isSelected
                          ? ['#10b981', '#059669']
                          : ['#f3f4f6', '#e5e7eb']
                      }
                      style={styles.avatar}>
                      <Text
                        style={[
                          styles.avatarText,
                          isSelected && styles.avatarTextSelected,
                        ]}>
                        {item?.coFInfo?.userName?.charAt(0)?.toUpperCase()}
                      </Text>
                    </LinearGradient>

                    {/* Info Container */}
                    <View style={styles.infoContainer}>
                      <Text style={styles.name}>{item?.coFInfo?.userName}</Text>
                      {!hasPhone ? (
                        <View style={styles.phoneRow}>
                          <Feather name="phone" size={14} color="#6b7280" />
                          <Text style={styles.phone}>
                            {item?.coFInfo?.contactNumber}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.badge}>
                          {/* <Text style={styles.badgeText}>Phone Required</Text> */}
                        </View>
                      )}
                    </View>
                    {/* Edit Icon Button */}
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        onCheckCoFarmerEdit(
                          index,
                          item?.coFInfo?.user_id,
                          item?.coFInfo?.contactNumber,
                          item,
                        )
                      }
                      activeOpacity={0.7}>
                      <View
                        style={[
                          styles.editIconContainer,
                          isSelected && styles.editIconContainerActive,
                        ]}>
                        <Feather
                          name="edit-2"
                          size={18}
                          color={isSelected ? '#10b981' : '#6b7280'}
                        />
                      </View>
                    </TouchableOpacity>
                    {/* Toggle Switch */}
                    <View style={styles.toggleContainer}>
                      <View
                        style={[
                          styles.toggle,
                          isSelected && styles.toggleActive,
                        ]}>
                        <View
                          style={[
                            styles.toggleCircle,
                            isSelected && styles.toggleCircleActive,
                          ]}>
                          {isSelected && (
                            <AntDesign name="check" size={12} color="#10b981" />
                          )}
                        </View>
                      </View>
                      <Text style={styles.toggleLabel}>
                        Switch to{'\n'}Main Farmer
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Expanded Form */}
                {isSelected && (
                  <View style={styles.formContainer}>
                    {/* Form Header */}
                    {/* <View style={styles.formHeader}>
                                            <MaterialIcons name="lock-outline" size={20} color="#10b981" />
                                            <Text style={styles.formHeaderText}>Verification Details</Text>
                                        </View> */}

                    {/* Phone Number Input */}
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>
                        Phone Number
                        {/* <Text style={styles.required}>*</Text> */}
                      </Text>
                      <View style={styles.inputContainer}>
                        {/* <Feather name="phone" size={18} color="#9ca3af" style={styles.inputIcon} /> */}
                        <InputTextForm
                          label=""
                          placeholder="Enter 10-digit phone number"
                          onChangeText={text =>
                            setCoFarmer(prev => ({
                              ...prev,
                              phoneNumber: text.replace(/[^0-9]/g, ''),
                            }))
                          }
                          value={coFarmer.phoneNumber}
                          keyboardType="numeric"
                          maxLength={10}
                        />
                      </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>
                        Password
                        {/* <Text style={styles.required}>*</Text> */}
                      </Text>
                      <View style={styles.inputContainer}>
                        {/* <MaterialIcons name="lock-outline" size={18} color="#9ca3af" style={styles.inputIcon} /> */}
                        <InputTextForm
                          label=""
                          placeholder="Enter secure password"
                          onChangeText={text =>
                            setCoFarmer(prev => ({
                              ...prev,
                              password: text,
                            }))
                          }
                          value={coFarmer.password}
                          secureTextEntry
                        />
                      </View>
                    </View>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>
                        Date of Birth
                        {/* <Text style={styles.required}>*</Text> */}
                      </Text>
                      <View style={styles.inputContainer}>
                        {/* <MaterialIcons name="lock-outline" size={18} color="#9ca3af" style={styles.inputIcon} /> */}
                        <TouchableOpacity
                          onPress={() => setopenCycleStart(!penCycleStart)}>
                          <InputTextForm
                            label=""
                            placeholder="DD/MM/YYYY"
                            onChangeText={text =>
                              setCoFarmer(prev => ({
                                ...prev,
                                age: text,
                              }))
                            }
                            value={coFarmer.age}
                            keyboardType="numeric"
                            editable={false}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Document Upload Section */}
                    <View style={styles.uploadSection}>
                      <Text style={styles.uploadSectionTitle}>
                        Document Verification
                      </Text>
                      <View style={styles.uploadRow}>
                        {/* <TouchableOpacity
                                                    style={[
                                                        styles.uploadBox,
                                                        coFarmer.addressProof && styles.uploadBoxFilled
                                                    ]}
                                                    onPress={() => pickFile("addressProof")}
                                                    activeOpacity={0.7}
                                                >
                                                    {coFarmer.addressProof?.uri ? (
                                                        <>
                                                            {coFarmer.addressProof.type === "image/jpeg" ? (
                                                                <Image
                                                                    source={{ uri: coFarmer.addressProof.uri }}
                                                                    style={styles.previewImg}
                                                                    resizeMode="cover"
                                                                />
                                                            ) : (
                                                                <View style={styles.pdfContainer}>
                                                                    <MaterialIcons name="picture-as-pdf" size={32} color="#ef4444" />
                                                                    <Text style={styles.pdfText}>PDF Uploaded</Text>
                                                                </View>
                                                            )}
                                                            <View style={styles.uploadBadge}>
                                                                <AntDesign name="checkcircle" size={16} color="#10b981" />
                                                            </View>
                                                        </>
                                                    ) : (
                                                        <View style={styles.uploadPlaceholder}>
                                                            <View style={styles.uploadIconCircle}>
                                                                <MaterialIcons name="cloud-upload" size={24} color="#10b981" />
                                                            </View>
                                                            <Text style={styles.uploadTitle}>Address Proof</Text>
                                                            <Text style={styles.uploadSubtitle}>Tap to upload</Text>
                                                        </View>
                                                    )}
                                                </TouchableOpacity> */}
                        <TouchableOpacity
                          style={[
                            styles.uploadBox,
                            coFarmer.idProof && styles.uploadBoxFilled,
                          ]}
                          onPress={() => pickFile('idProof')}
                          activeOpacity={0.7}>
                          {coFarmer.idProof?.uri ? (
                            <>
                              {coFarmer.idProof.type === 'image/jpeg' ? (
                                <Image
                                  source={{
                                    uri: coFarmer.idProof.uri,
                                  }}
                                  style={styles.previewImg}
                                  resizeMode="cover"
                                />
                              ) : (
                                <View style={styles.pdfContainer}>
                                  <MaterialIcons
                                    name="picture-as-pdf"
                                    size={32}
                                    color="#ef4444"
                                  />
                                  <Text style={styles.pdfText}>
                                    PDF Uploaded
                                  </Text>
                                </View>
                              )}
                              <View style={styles.uploadBadge}>
                                <AntDesign
                                  name="checkcircle"
                                  size={16}
                                  color="#10b981"
                                />
                              </View>
                            </>
                          ) : (
                            <View style={styles.uploadPlaceholder}>
                              <View style={styles.uploadIconCircle}>
                                <MaterialIcons
                                  name="cloud-upload"
                                  size={24}
                                  color="#10b981"
                                />
                              </View>
                              <Text style={styles.uploadTitle}>ID Proof</Text>
                              <Text style={styles.uploadSubtitle}>
                                Tap to upload
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Submit Button */}
                    <Button
                      // label={isFormValid ? "Submit & Switch Ownership" : "Complete All Fields"}
                      label={'Save'}
                      onPress={onSave}
                      // disabled={!isFormValid}
                    />
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
      <PaginationNav
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage(p => Math.max(1, p - 1))}
        onNext={() => setPage(p => Math.min(totalPages, p + 1))}
        t={t}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  searchInput: {
    flex: 1,
    paddingLeft: 10,
    fontSize: 14,
    color: '#585858',
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  // Header Styles
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#10b981',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    fontFamily: Fonts.Bold,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: Fonts.Regular,
  },
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  // Loading State
  loaderContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
    fontFamily: Fonts.Medium,
  },
  // Empty State
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    fontFamily: Fonts.Bold,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontFamily: Fonts.Regular,
  },
  // Item Container
  itemContainer: {
    marginBottom: 16,
  },
  // Card Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#10b981',
    elevation: 8,
    shadowColor: '#10b981',
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  // Avatar
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6b7280',
    fontFamily: Fonts.Bold,
  },
  avatarTextSelected: {
    color: '#fff',
  },
  // Info Container
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    fontFamily: Fonts.Bold,
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phone: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: Fonts.Regular,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
    fontFamily: Fonts.Bold,
  },
  // Toggle Switch
  toggleContainer: {
    alignItems: 'center',
    marginLeft: 8,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    padding: 2,
    marginBottom: 6,
  },
  toggleActive: {
    backgroundColor: '#10b981',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  toggleLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 12,
    fontFamily: Fonts.Bold,
  },
  // Form Container
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f3f4f6',
  },
  formHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 8,
    fontFamily: Fonts.Bold,
  },
  // Input Styles
  inputWrapper: {
    marginBottom: -20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    // marginBottom: 8,
    fontFamily: Fonts.Bold,
  },
  required: {
    color: '#ef4444',
    fontSize: 14,
  },
  inputContainer: {
    position: 'relative',
    top: -20,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  // Upload Section
  uploadSection: {
    marginBottom: 24,
  },
  uploadSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    fontFamily: Fonts.Bold,
  },
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  uploadBox: {
    flex: 1,
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: '#fafafa',
    position: 'relative',
  },
  uploadBoxFilled: {
    borderColor: '#10b981',
    borderStyle: 'solid',
  },
  uploadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    fontFamily: Fonts.Bold,
    marginBottom: 2,
  },
  uploadSubtitle: {
    fontSize: 11,
    color: '#9ca3af',
    fontFamily: Fonts.Regular,
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  uploadBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    elevation: 4,
    shadowColor: '#10b981',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pdfContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
  },
  pdfText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991b1b',
    marginTop: 8,
    fontFamily: Fonts.Bold,
  },
  // Button Styles
  btnWrapper: {
    marginTop: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    elevation: 6,
    shadowColor: '#10b981',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnDisabled: {
    elevation: 0,
    shadowOpacity: 0,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    fontFamily: Fonts.Bold,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  editButton: {
    // marginRight: 12,
    position: 'absolute',
    right: 60,
    top: 11,
  },
  editIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  editIconContainerActive: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  pageBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
  },
  pageBtnDisabled: {
    backgroundColor: '#d1d5db',
  },
  pageBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  pageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  LoadingScreen: {
    position: 'absolute',
    top: '52%',
    left: '45%',
    zIndex: 9999,
  },
});

export default ListOfCoFarmer;
