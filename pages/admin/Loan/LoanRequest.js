import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Dimensions,
  Keyboard,
  Linking,
} from 'react-native';
import React, {
  useCallback,
  useState,
  useEffect,
  useContext,
  useRef,
} from 'react';
import CheckBoxComp from '../../Common/CheckBoxComp';
import DocumentPicker, {types} from 'react-native-document-picker';
import {
  farmerDocAPI,
  problemPlotAgainstFarmerAPI,
  loanPurposeAPI,
  problemProduceAgainstPlotAPI,
  addPlotImageAPI,
  getPlotDocAPI,
  deletePlotImageAPI,
  Addloan,
} from './LoanAPI';
import {userCreateContext} from '../../Context/usersCreateContext';
import ProofAndIdentityPropfCompLoan from '../../Common/ProofAndIdentityPropfCompLoan';
import DocumentScanner from 'react-native-document-scanner-plugin';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import {createPdf} from 'react-native-images-to-pdf';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
const qs = require('qs');
import {Colors, Fonts} from '../../utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
const LoanRequest = ({setActiveBtn}) => {
  const navigation = useNavigation();

  const scrollViewRef = useRef(null);

  //GQR-67
  const {
    loginUser_data,
    LoadingScreen,
    t,
    Toast,
    AlertMesg,
    getItem,
    InputTextForm,
    DropdownForm,
    ButtonFormBottom,
    Root,
    CustomHeader,
    logoImage,
    topBanner,
    ButtonForm,
    // handleResultSelect,
    farmerData,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  const [blank, setBlank] = useState({label: '', value: 'dacsfddsd'});
  //GQR-67
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [farmerID, setfarmerID] = useState();
  const [loanPurpose, setLoanPurpose] = useState([]);
  const [plotSite, setPlotSite] = useState([]);
  const [isChecked, setIsChecked] = useState([]);
  const [isPlotChecked, setIsPlotChecked] = useState(0);
  const [isPlotCheckedId, setIsPlotCheckedId] = useState('');
  const [plotIdPresent, setplotIdPresent] = useState('');
  const [nameVarityStartEnd, setNameVarityStartEnd] = useState([]);
  const [photoDeleted, setPhotoDeleted] = useState([]);
  const [identityProof, setIdentityProof] = useState([
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      value: '',
      imageType: 'address',
    },
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      value: '',
      imageType: 'identity',
    },
  ]);
  const [addressProof, setAddressProof] = useState([
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      value: '',
      id: '',
      imageType: 'AddressProof',
      plotId: '',
    },
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      value: '',
      id: '',
      imageType: 'AddressProof',
      plotId: '',
    },
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      value: '',
      id: '',
      imageType: 'AddressProof',
      plotId: '',
    },
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      value: '',
      id: '',
      imageType: 'AddressProof',
      plotId: '',
    },
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      value: '',
      id: '',
      imageType: 'AddressProof',
      plotId: '',
    },
  ]);
  const [landProof, setLandProof] = useState([
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      value: '',
      imageType: 'LandProof',
    },
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      value: '',
      imageType: 'LandProof',
    },
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      value: '',
      imageType: 'LandProof',
    },
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      value: '',
      imageType: 'LandProof',
    },
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      value: '',
      imageType: 'LandProof',
    },
  ]);
  const [saveData, setSaveData] = useState({
    user_id: farmerID,
    loan_amount: '',
    loan_purpose: '',
    existing_loan_amount: '',
    apx_annual_income: '',
    farming_type: 'crop',
    plot_id: '',
    farmerProducer: '',
    identityNo: '',
    loan_amount: '',
  });
  const [currency, setCurrencyt] = useState('');
  const [photoDeletedValue, setPhotoDeletedValue] = useState([]);
  const resizeImage = async (
    uri,
    imgWidth = 800,
    imgHeight = 600,
    Quality = 80,
  ) => {
    try {
      const resizedImage = await ImageResizer.createResizedImage(
        uri,
        imgWidth,
        imgHeight,
        'JPEG',
        Quality,
        0,
        null,
      );
      return resizedImage.uri; // Return the URI of the resized image
    } catch (error) {
      console.error('Error resizing image:', error);
      return uri; // If resizing fails, return the original URI
    }
  };
  const handleDocumentSelectionRemove = async (index, objData) => {
    if (objData[index].imageType == 'AddressProof') {
      const deleteValue = [];

      deleteValue.push(objData[index].id);

      let formDataDelete = qs.stringify({
        file_delete_ids: deleteValue.toString(),
      });

      const deletePlotImage = await deletePlotImageAPI(
        dbname,
        lan_id,
        token,
        formDataDelete,
      );

      if (deletePlotImage?.status == 200) {
        const getPlotDoc = await getPlotDocAPI(
          dbname,
          lan_id,
          token,
          farmerID,
          objData[index].plotId,
        );

        const addressProof_value = [
          {
            uri: '',
            name: '',
            type: '',
            fileName: '',
            value: '',
            id: '',
            imageType: 'AddressProof',
            plotId: '',
          },
          {
            uri: '',
            name: '',
            type: '',
            fileName: '',
            value: '',
            id: '',
            imageType: 'AddressProof',
            plotId: '',
          },
          {
            uri: '',
            name: '',
            type: '',
            fileName: '',
            value: '',
            id: '',
            imageType: 'AddressProof',
            plotId: '',
          },
          {
            uri: '',
            name: '',
            type: '',
            fileName: '',
            value: '',
            id: '',
            imageType: 'AddressProof',
            plotId: '',
          },
          {
            uri: '',
            name: '',
            type: '',
            fileName: '',
            value: '',
            id: '',
            imageType: 'AddressProof',
            plotId: '',
          },
        ];

        if (getPlotDoc?.status === 200) {
          if (getPlotDoc.data.data.rows[0].plot_img.length > 0) {
            const address_proofArr = getPlotDoc.data.data.rows[0].plot_img;

            addressProof.map((data, index1) => {
              if (address_proofArr[index1] != undefined) {
                addressProof_value[index1] = {
                  uri: address_proofArr[index1].file_path,
                  id: address_proofArr[index1].file_id,
                  name: address_proofArr[index1].file_name,
                  type: '',
                  fileName: address_proofArr[index1].file_name,
                  value: '',
                  imageType: 'AddressProof',
                  plotId: objData[index].plotId,
                };
              }
            });

            const values = [...nameVarityStartEnd];

            nameVarityStartEnd.map((data, index1) => {
              if (data.plot_id == objData[0].plotId) {
                values[index1].addressProof = addressProof_value;
              }
            });
            setNameVarityStartEnd(values);
          } else {
            const values = [...nameVarityStartEnd];

            nameVarityStartEnd.map((data, index1) => {
              if (data.plot_id == objData[0].plotId) {
                values[index1].addressProof = addressProof_value;
              }
            });
            setNameVarityStartEnd(values);
          }
        }
      }
    } else if (objData[index].imageType == 'LandProof') {
      const photoDeletedId = photoDeletedValue.filter(
        item => item == objData[index].id,
      );

      if (photoDeletedId.length < 1) {
        setPhotoDeletedValue(prevItems => [...prevItems, objData[index].id]);
      }
      try {
        const values = [...landProof];
        values[index]['uri'] = '';
        values[index]['name'] = '';
        values[index]['type'] = '';
        values[index]['fileName'] = '';
        values[index]['value'] = '';
        values[index]['id'] = '';
        values[index]['imageType'] = 'LandProof';
        setLandProof(values);
      } catch (error) {
        console.log(error);
      }
    }
  };
  const handleDocumentSelection = async (data, index, objData, p1, par) => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        type: [types.pdf, types.images],
      });
      const {uri, name, type} = response?.[0] || {};
      let resizedUri = uri;
      let width = 0;
      let height = 0;
      if (type && type.startsWith('image/')) {
        await new Promise((resolve, reject) => {
          Image.getSize(
            uri,
            (imgWidth, imgHeight) => {
              width = imgWidth;
              height = imgHeight;
              resolve();
            },
            reject,
          );
        });
        resizedUri = await resizeImage(uri, width, height, 90);
      }
      if (objData[index].imageType == 'IdentityProof') {
        const values = [...identityProof];
        values[index]['uri'] = resizedUri;
        values[index]['name'] = response[0].name;
        values[index]['type'] = response[0].type;
        values[index]['fileName'] = response[0].name;

        setIdentityProof(values);
      } else if (objData[index].imageType == 'AddressProof') {
        const formDataPlotImg = new FormData();

        formDataPlotImg.append('rel_id', par.plot_id);
        formDataPlotImg.append('plot_image', {
          uri: resizedUri,
          name: response[0].name,
          type: response[0].type,
          fileName: response[0].name,
        });

        const addPlotImage = await addPlotImageAPI(
          dbname,
          lan_id,
          token,
          farmerID,
          formDataPlotImg,
        );

        if (objData[index].id != '') {
          const deleteValue = [];

          deleteValue.push(objData[index].id);

          let formDataDelete = qs.stringify({
            file_delete_ids: deleteValue.toString(),
          });

          const deletePlotImage = await deletePlotImageAPI(
            dbname,
            lan_id,
            token,
            formDataDelete,
          );
        }

        if (addPlotImage?.status == 200) {
          const getPlotDoc = await getPlotDocAPI(
            dbname,
            lan_id,
            token,
            farmerID,
            par.plot_id,
          );

          const addressProof_value = [
            {
              uri: '',
              name: '',
              type: '',
              fileName: '',
              value: '',
              id: '',
              imageType: 'AddressProof',
              plotId: '',
            },
            {
              uri: '',
              name: '',
              type: '',
              fileName: '',
              value: '',
              id: '',
              imageType: 'AddressProof',
              plotId: '',
            },
            {
              uri: '',
              name: '',
              type: '',
              fileName: '',
              value: '',
              id: '',
              imageType: 'AddressProof',
              plotId: '',
            },
            {
              uri: '',
              name: '',
              type: '',
              fileName: '',
              value: '',
              id: '',
              imageType: 'AddressProof',
              plotId: '',
            },
            {
              uri: '',
              name: '',
              type: '',
              fileName: '',
              value: '',
              id: '',
              imageType: 'AddressProof',
              plotId: '',
            },
          ];

          if (getPlotDoc?.status === 200) {
            if (getPlotDoc.data.data.rows[0].plot_img.length > 0) {
              const address_proofArr = getPlotDoc.data.data.rows[0].plot_img;
              addressProof.map((data, index1) => {
                if (address_proofArr[index1] != undefined) {
                  addressProof_value[index1] = {
                    uri: address_proofArr[index1].file_path,
                    id: address_proofArr[index1].file_id,
                    name: address_proofArr[index1].file_name,
                    type: '',
                    fileName: address_proofArr[index1].file_name,
                    type: address_proofArr[index1].file_ext,
                    value: '',
                    imageType: 'AddressProof',
                    plotId: par.plot_id,
                  };
                }
              });

              const values = [...nameVarityStartEnd];

              nameVarityStartEnd.map((data, index1) => {
                if (data.plot_id == par.plot_id) {
                  values[index1].addressProof = addressProof_value;
                }
              });
              setNameVarityStartEnd(values);
            }
          }
        }
      } else {
        const values = [...landProof];
        values[index]['uri'] = resizedUri;
        values[index]['name'] = response[0].name;
        values[index]['type'] = response[0].type;
        values[index]['fileName'] = response[0].name;
        values[index]['imageType'] = 'LandProof';

        setLandProof(values);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleScanAndCreatePdf = async (data, index, objData, p1, par) => {
    try {
      const {scannedImages} = await DocumentScanner.scanDocument({
        croppedImageQuality: 100,
      });
      if (!scannedImages?.length) {
        throw new Error('No images scanned');
      }
      // Resize images to reduce size
      const {width, height} = await new Promise((resolve, reject) => {
        Image.getSize(
          scannedImages[0],
          (imgWidth, imgHeight) => {
            resolve({width: imgWidth, height: imgHeight});
          },
          reject,
        );
      });
      const resizedImages = await Promise.all(
        scannedImages.map(
          async imageUri => await resizeImage(imageUri, width, height, 80),
        ),
      );
      const fileName = `document_${Date.now()}.pdf`;
      const outputPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      // Create PDF from resized images
      const path = await createPdf({
        pages: resizedImages.map(imagePath => ({imagePath})),
        outputPath,
      });

      // Check file size
      const fileStat = await RNFS.stat(path);
      const fileSizeInMB = fileStat.size / (1024 * 1024); // File size in MB

      console.log(`PDF Size: ${fileSizeInMB} MB`);

      // Define size limit (e.g., 5 MB)
      const sizeLimitMB = 5;

      if (fileSizeInMB > sizeLimitMB) {
        throw new Error('PDF size exceeds the 5 MB limit');
      }
      if (objData[index].imageType == 'IdentityProof') {
        const values = [...identityProof];
        values[index]['uri'] = `file://${path}`;
        values[index]['name'] = fileName;
        values[index]['type'] = 'application/pdf';
        values[index]['fileName'] = fileName;

        setIdentityProof(values);
      } else if (objData[index].imageType == 'AddressProof') {
        const formDataPlotImg = new FormData();

        formDataPlotImg.append('rel_id', par.plot_id);
        formDataPlotImg.append('plot_image', {
          uri: `file://${path}`,
          name: fileName,
          type: 'application/pdf',
          fileName: fileName,
        });

        const addPlotImage = await addPlotImageAPI(
          dbname,
          lan_id,
          token,
          farmerID,
          formDataPlotImg,
        );

        if (objData[index].id != '') {
          const deleteValue = [];

          deleteValue.push(objData[index].id);

          let formDataDelete = qs.stringify({
            file_delete_ids: deleteValue.toString(),
          });

          const deletePlotImage = await deletePlotImageAPI(
            dbname,
            lan_id,
            token,
            formDataDelete,
          );
        }

        if (addPlotImage?.status == 200) {
          const getPlotDoc = await getPlotDocAPI(
            dbname,
            lan_id,
            token,
            farmerID,
            par.plot_id,
          );

          const addressProof_value = [
            {
              uri: '',
              name: '',
              type: '',
              fileName: '',
              value: '',
              id: '',
              imageType: 'AddressProof',
              plotId: '',
            },
            {
              uri: '',
              name: '',
              type: '',
              fileName: '',
              value: '',
              id: '',
              imageType: 'AddressProof',
              plotId: '',
            },
            {
              uri: '',
              name: '',
              type: '',
              fileName: '',
              value: '',
              id: '',
              imageType: 'AddressProof',
              plotId: '',
            },
            {
              uri: '',
              name: '',
              type: '',
              fileName: '',
              value: '',
              id: '',
              imageType: 'AddressProof',
              plotId: '',
            },
            {
              uri: '',
              name: '',
              type: '',
              fileName: '',
              value: '',
              id: '',
              imageType: 'AddressProof',
              plotId: '',
            },
          ];

          if (getPlotDoc?.status === 200) {
            if (getPlotDoc.data.data.rows[0].plot_img.length > 0) {
              const address_proofArr =
                getPlotDoc?.data?.data?.rows[0]?.plot_img;

              addressProof.map((data, index1) => {
                if (address_proofArr[index1] != undefined) {
                  addressProof_value[index1] = {
                    uri: address_proofArr[index1].file_path,
                    id: address_proofArr[index1].file_id,
                    name: address_proofArr[index1].file_name,
                    type: '',
                    fileName: address_proofArr[index1].file_name,
                    type: address_proofArr[index1].file_ext,
                    value: '',
                    imageType: 'AddressProof',
                    plotId: par.plot_id,
                  };
                }
              });

              const values = [...nameVarityStartEnd];

              nameVarityStartEnd.map((data, index1) => {
                if (data.plot_id == par.plot_id) {
                  values[index1].addressProof = addressProof_value;
                }
              });
              setNameVarityStartEnd(values);
            }
          }
        }
      } else {
        const values = [...landProof];
        values[index]['uri'] = `file://${path}`;
        values[index]['name'] = fileName;
        values[index]['type'] = 'application/pdf';
        values[index]['fileName'] = fileName;
        values[index]['imageType'] = 'LandProof';

        setLandProof(values);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleSearch = text => {
    setSearchFarmerName(text);
    setSearchFarmerPhone('');

    if (farmerData[0].length !== 0) {
      const result = farmerData[0].filter(item =>
        item?.label.toLowerCase().includes(text?.toLowerCase()),
      );

      if (result) {
        setSearchResults(result);
      }
    }
    if (text == '') {
      setSearchResultsList(false);
    } else {
      setSearchResultsList(true);
    }
  };
  const handleResultSelect = async item => {
    const {label: name, value: currentfarmerId, phone, FcmUserToken} = item;
    setSearchFarmerPhone(phone);
    setSelectedName(name);
    setSearchFarmerName(name);
    setSearchResults([]);
    setIsChecked([]);
    setPlotSite([]);
    setNameVarityStartEnd([]);
    setfarmerID(currentfarmerId);
    setSearchResultsList(false);
    setSaveData({
      ...saveData,
      identityNo: item.aadharNumber,
      farmerProducer: item.kccNumber,
    });
    const [farmarDoc, plotSiteApi, response] = await Promise.all([
      farmerDocAPI(dbname, lan_id, token, currentfarmerId),
      problemPlotAgainstFarmerAPI(dbname, lan_id, token, currentfarmerId),
      loanPurposeAPI(dbname, lan_id, token, currentfarmerId),
    ]);

    if (farmarDoc.status === 200) {
      const farmerIdentityDoc = farmarDoc.data.data[0].agri_files.filter(
        item => item.term_type === 'farmer_identity',
      );
      const farmerAddressDoc = farmarDoc.data.data[0].agri_files.filter(
        item => item.term_type === 'farmer_address',
      );
      if (farmerIdentityDoc.length > 0 && farmerAddressDoc.length > 0) {
        const farmerDocValue = [...identityProof];
        farmerDocValue[0] = {
          uri: farmerIdentityDoc[0].file_path,
          id: farmerIdentityDoc[0].file_id,
          name: farmerIdentityDoc[0].file_name,
          type: '',
          imageType: 'identity',
          fileName: farmerIdentityDoc[0].file_name,
        };
        farmerDocValue[1] = {
          uri: farmerAddressDoc[0].file_path,
          id: farmerAddressDoc[0].file_id,
          name: farmerAddressDoc[0].file_name,
          type: '',
          imageType: 'address',
          fileName: farmerAddressDoc[0].file_name,
        };
        setIdentityProof(farmerDocValue);
      } else if (farmerIdentityDoc.length > 0 && farmerAddressDoc.length == 0) {
        const farmerDocValue = [...identityProof];
        farmerDocValue[0] = {
          uri: farmerIdentityDoc[0].file_path,
          id: farmerIdentityDoc[0].file_id,
          name: farmerIdentityDoc[0].file_name,
          type: '',
          fileName: farmerIdentityDoc[0].file_name,
          imageType: 'identity',
        };
        setIdentityProof(farmerDocValue);
      } else if (farmerAddressDoc.length > 0 && farmerIdentityDoc.length == 0) {
        const farmerDocValue = [...identityProof];
        farmerDocValue[0] = {
          uri: farmerAddressDoc[0].file_path,
          id: farmerAddressDoc[0].file_id,
          name: farmerAddressDoc[0].file_name,
          type: '',
          imageType: 'address',
          fileName: farmerAddressDoc[0].file_name,
        };
        setIdentityProof(farmerDocValue);
      }
    }
    if (plotSiteApi) {
      const dataArray = [];
      const isCheck = [];
      plotSiteApi.data.data.map((element, index) => {
        dataArray.push({
          value: element.rel_id,
          label: element.plot_no,
        });
      });
      setIsChecked(isCheck);
      setPlotSite(dataArray);
    }

    if (response.status === 200) {
      const dataArray = [];
      response.data.data.rows.forEach(element => {
        dataArray.push({
          value: element.fid,
          label: element.entity_name,
        });
      });
      setLoanPurpose(dataArray);
    }
  };

  const produceRemoveDetails = index => {
    const values = [...nameVarityStartEnd];
    values.splice(index, 1);
    setNameVarityStartEnd(values);
  };

  const handle_button = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({y: 600, animated: true});
    }
  };
  const handlePlotCheck = async (value, label) => {
    setplotIdPresent(value);

    if (isPlotChecked == 1 && isPlotCheckedId != '') {
      const formData = new FormData();
      formData.append('rel_id', isPlotCheckedId);
      addressProof.map((data, index) => {
        if (data.name != '' && data.value == 1) {
          formData.append('plot_image', data);
        }
      });

      const addPlotImage = addPlotImageAPI(
        dbname,
        lan_id,
        token,
        farmerID,
        formData,
      );

      setIsPlotChecked(0);
      setIsPlotCheckedId('');
    }
    const [response, getPlotDoc] = await Promise.all([
      problemProduceAgainstPlotAPI(dbname, lan_id, farmerID, value),
      getPlotDocAPI(dbname, lan_id, token, farmerID, value),
    ]);
    const addressProof_value = [...addressProof];
    if (getPlotDoc?.status === 200) {
      if (getPlotDoc.data.data.rows[0].plot_img.length > 0) {
        const {plot_img} = getPlotDoc?.data?.data?.rows[0] || {};
        const address_proofArr = plot_img?.filter(
          item => item.term_type === 'plot_image',
        );
        addressProof.map((data, index) => {
          if (address_proofArr[index] != undefined) {
            addressProof_value[index] = {
              uri: address_proofArr[index].file_path,
              id: address_proofArr[index].file_id,
              name: address_proofArr[index].file_name,
              type: '',
              fileName: address_proofArr[index].file_name,
              type: address_proofArr[index].file_ext,
              value: '',
              imageType: 'AddressProof',
              plotId: value,
            };
          } else {
            addressProof_value[index] = {
              uri: '',
              id: '',
              name: '',
              type: '',
              fileName: '',
              type: '',
              value: '',
              imageType: 'AddressProof',
              plotId: '',
            };
          }
        });
        setAddressProof(addressProof_value);
      }
    }
    if (response.status === 200) {
      const {
        land_rel_id,
        crop_name,
        crop_variety,
        sowing_date,
        harvesting_date,
        farmer_production_system,
      } = response.data.data;
      const VarityStartArr = [];

      VarityStartArr.push({
        plot_id: value,
        plot_no: label,
        name: crop_name.name,
        varity: crop_variety.name,
        cycleStarts: sowing_date,
        cycleEnd: harvesting_date,
        land_rel_id: land_rel_id,
        isChecked: '1',
        addressProof: addressProof_value,
      });
      if (nameVarityStartEnd.length > 0) {
        const isPresent = nameVarityStartEnd.find(
          item => item.plot_id === value,
        );
        if (!isPresent) {
          setNameVarityStartEnd(prevItems => [...prevItems, ...VarityStartArr]);
        }
      } else {
        setNameVarityStartEnd(prevItems => [...prevItems, ...VarityStartArr]);
      }
      setIsPlotChecked(1);
      setIsPlotCheckedId(value);
    }

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({y: 1400, animated: true});
    }
  };

  const onPageLoad = async () => {
    setIsLoading(true);
    const currency_res = await getItem('currency');
    setCurrencyt(currency_res);
    setIsLoading(false);
  };
  // useEffect(() => {
  //   console.log('Farmer Data:', farmerData.data);
  // }, [farmerData]);

  useEffect(() => {
    onPageLoad();
    setSaveData({
      ...saveData,
      user_id: farmerID,
      loan_amount: '',
      loan_purpose: '',
      existing_loan_amount: '',
      apx_annual_income: '',
      farming_type: 'crop',
      plot_id: '',
      farmerProducer: '',
      identityNo: '',
      loan_amount: '',
    });
    setIdentityProof([
      {
        uri: '',
        name: '',
        type: '',
        fileName: '',
        value: '',
        imageType: 'address',
      },
      {
        uri: '',
        name: '',
        type: '',
        fileName: '',
        value: '',
        imageType: 'identity',
      },
    ]);
    setAddressProof([
      {
        uri: '',
        name: '',
        type: '',
        fileName: '',
        value: '',
        id: '',
        imageType: 'AddressProof',
        plotId: '',
      },
      {
        uri: '',
        name: '',
        type: '',
        fileName: '',
        value: '',
        id: '',
        imageType: 'AddressProof',
        plotId: '',
      },
      {
        uri: '',
        name: '',
        type: '',
        fileName: '',
        value: '',
        id: '',
        imageType: 'AddressProof',
        plotId: '',
      },
      {
        uri: '',
        name: '',
        type: '',
        fileName: '',
        value: '',
        id: '',
        imageType: 'AddressProof',
        plotId: '',
      },
      {
        uri: '',
        name: '',
        type: '',
        fileName: '',
        value: '',
        id: '',
        imageType: 'AddressProof',
        plotId: '',
      },
    ]);
    setLandProof([
      {
        uri: '',
        name: '',
        type: '',
        fileName: '',
        value: '',
        imageType: 'LandProof',
      },
      {
        uri: '',
        name: '',
        type: '',
        fileName: '',
        value: '',
        imageType: 'LandProof',
      },
      {
        uri: '',
        name: '',
        type: '',
        fileName: '',
        value: '',
        imageType: 'LandProof',
      },
      {
        uri: '',
        name: '',
        type: '',
        fileName: '',
        value: '',
        imageType: 'LandProof',
      },
      {
        uri: '',
        name: '',
        type: '',
        fileName: '',
        value: '',
        imageType: 'LandProof',
      },
    ]);
  }, []);
  const handledataAdd = (name, text) => {
    setSaveData({...saveData, [name]: text});
  };
  const handleSave = async () => {
    if (isPlotChecked == 1 && isPlotCheckedId != '') {
      const formDataPlotImg = new FormData();
      formDataPlotImg.append('rel_id', isPlotCheckedId);
      addressProof.map((data, index) => {
        if (data.name != '' && data.value == 1) {
          formDataPlotImg.append('plot_image', data);
        }
      });

      // const addPlotImage = await addPlotImageAPI(
      //   dbname,
      //   lan_id,
      //   token,
      //   farmerID,
      //   formDataPlotImg,
      // );

      setIsPlotChecked(0);
      setIsPlotCheckedId('');
    }

    if (photoDeletedValue.length > 0) {
      const deleteValue = [];
      photoDeletedValue.map(data => {
        deleteValue.push(data);
      });
      let formDataDelete = qs.stringify({
        file_delete_ids: deleteValue.toString(),
      });

      // const deletePlotImage = await deletePlotImageAPI(
      //   dbname,
      //   lan_id,
      //   token,
      //   formDataDelete,
      // );
    }
    Keyboard.dismiss();
    const checkValue = [];

    nameVarityStartEnd.map((data, index) => {
      if (data.isChecked != '') {
        checkValue.push(data.land_rel_id);
      }
    });
    const myheader = new Headers();
    const formData = new FormData();
    myheader.append('Content-Type', 'multipart/form-data');
    landProof.map((data, index) => {
      if (data.name != '') {
        formData.append('loan_support_img', data);
      }
    });
    if (searchFarmerName == '') {
      Toast.show({text: `${t('please_enter_farmer_name')}`, ...AlertMesg[0]});
    } else if (saveData.existing_loan_amount == '') {
      Toast.show({text: t('existing_loan_amount_enter'), ...AlertMesg[0]});
    } else if (saveData.loan_amount == '') {
      Toast.show({text: `${t('please_enter_loan_amt')}`, ...AlertMesg[0]});
    } else if (saveData.apx_annual_income == '') {
      Toast.show({text: `${t('pls_enter_income')}`, ...AlertMesg[0]});
    } else if (saveData.loan_purpose == '') {
      Toast.show({text: `${t('please_enter_pur')}`, ...AlertMesg[0]});
    } else if (checkValue.length < 1) {
      Toast.show({text: `${t('please_select_plot_first')}`, ...AlertMesg[0]});
    } else {
      setIsLoading(true);
      formData.append('user_id', farmerID);
      formData.append('loan_amount', saveData.loan_amount);
      formData.append('loan_purpose', saveData.loan_purpose);
      formData.append('existing_loan_amount', saveData.existing_loan_amount);
      formData.append('apx_annual_income', saveData.apx_annual_income);
      formData.append('farming_type', saveData.farming_type);
      formData.append('plot_id', checkValue);

      const response = await Addloan(dbname, lan_id, token, user_id, formData);
      if (response?.status === 200) {
        Toast.show({text: t('Data_submitted_successfully'), ...AlertMesg[0]});
        setTimeout(() => {
          setActiveBtn(2);
        }, 2000);

        navigation.navigate('LoanViewPastRequested', {action: 'addData'});
      }
      setIsLoading(false);
    }
  };

  const openIdentity = async propsData => {
    if (propsData) {
      await Linking.openURL(propsData);
    }
  };

  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <Root>
          {isLoading ? (
            <View style={styles.loadingScreen}>
              <LoadingScreen />
            </View>
          ) : null}
          <CustomHeader
            path="Dashboard"
            logoImage={logoImage}
            topBanner={topBanner}
          />
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: Colors.background_light,
              // marginBottom: 50,
            }}>
            {/* {searchResultsList && searchResultsList ? (
              <View style={styles.flatContainer}>
                <FlatList
                  style={searchResults.length > 8 ? styles.flatlistHeight : ''}
                  data={searchResults}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      onPress={() =>
                        handleResultSelect(
                          item.label,
                          item.value,
                          item.phone,
                          item,
                        )
                      }
                      style={styles.flatlistitem}>
                      <Text style={styles.flatlisttitle}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index}
                />
              </View>
            ) : (
              ''
            )} */}

            <ScrollView
              showsVerticalScrollIndicator={false}
              ref={scrollViewRef}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {t('personal_information')}
                </Text>

                <DropdownForm
                  label={t('farmer_name')}
                  data={farmerData?.[0]}
                  required={true}
                  onChange={item => handleResultSelect(item)}
                />
                {searchResultsList && searchResultsList ? (
                  <View style={styles.searchResultsContainer}>
                    <FlatList
                      style={
                        searchResults.length > 8 ? styles.flatlistHeight : ''
                      }
                      data={searchResults}
                      renderItem={({item}) => (
                        <TouchableOpacity
                          onPress={() =>
                            handleResultSelect(
                              item.label,
                              item.value,
                              item.phone,
                              item,
                            )
                          }
                          style={styles.flatlistitem}>
                          <Text style={styles.flatlisttitle}>{item.label}</Text>
                        </TouchableOpacity>
                      )}
                      keyExtractor={(item, index) => index}
                    />
                  </View>
                ) : (
                  ''
                )}
                <InputTextForm
                  label={t('farmer_number')}
                  value={searchFarmerPhone}
                  keyboardType={'numeric'}
                  editable={false}
                />
                <InputTextForm
                  label={t('adhar_no')}
                  keyboardType={'numeric'}
                  onChangeText={text => handledataAdd('identityNo', text)}
                  value={saveData.identityNo}
                  editable={false}
                />
                <InputTextForm
                  label={t('kcc_no')}
                  onChangeText={text => handledataAdd('farmerProducer', text)}
                  value={saveData.farmerProducer}
                  editable={false}
                />
              </View>
              <View style={styles.idcontainer}>
                <Text
                  style={{
                    fontSize: 16,

                    color: Colors.borderGreen,
                    marginBottom: 12,
                    fontFamily: 'Poppins-SemiBold',
                  }}>
                  {t('identity_proof')}
                </Text>
                <View style={styles.idItemContainer}>
                  {identityProof &&
                    identityProof.map((data, index) => {
                      return (
                        <TouchableOpacity
                          style={styles.idItem}
                          key={index}
                          onPress={() => openIdentity(data.uri)}>
                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[styles.plotText, {fontSize: 12}]}>
                            {data.imageType ==
                            undefined ? null : data?.imageType == 'address' ? (
                              <Text>Address Proof</Text>
                            ) : (
                              <Text>Identity Proof</Text>
                            )}
                          </Text>
                          <MaterialIcons
                            name="description"
                            size={35}
                            color="#4a8c29"
                          />
                          {/* <Image
                          source={require('../../Common/images/document.png')}
                          style={styles.idImage}
                        /> */}
                          <Text
                            numberOfLines={1}
                            ellipsizeMode="head"
                            style={styles.plotText}>
                            {data.name == '' ? '' : data.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('loan_information')}</Text>
                <InputTextForm
                  label={t('existing_loan_amount') + `  (${currency})`}
                  keyboardType={'numeric'}
                  required={true}
                  onChangeText={text =>
                    handledataAdd('existing_loan_amount', text)
                  }
                  value={saveData.existing_loan_amount}
                />
                <InputTextForm
                  label={t('loan_required_in_rupees') + `  (${currency})`}
                  keyboardType={'numeric'}
                  required={true}
                  onChangeText={text => handledataAdd('loan_amount', text)}
                  value={saveData.loan_amount}
                />
                <InputTextForm
                  label={t('annual_income') + `  (${currency})`}
                  keyboardType={'numeric'}
                  onChangeText={text =>
                    handledataAdd('apx_annual_income', text)
                  }
                  value={saveData.apx_annual_income}
                  required={true}
                />
                <DropdownForm
                  label={t('loan_purpose')}
                  data={loanPurpose}
                  onChange={text => handledataAdd('loan_purpose', text.value)}
                  required={true}
                />
                <DropdownForm
                  label={t('select_plot')}
                  data={plotSite}
                  onChange={item => handlePlotCheck(item.value, item.label)}
                  required={true}
                />
              </View>
              <View style={styles.card}>
                {nameVarityStartEnd.map((data, index) => {
                  if (data.isChecked == '1') {
                    return (
                      <View key={index}>
                        <TouchableOpacity
                          onPress={() => produceRemoveDetails(index)}>
                          <MaterialIcons name="cancel" color="red" size={22} />
                          {/* <Image
                          source={require('../../Common/images/x-mark.png')}
                          style={styles.xMarkImage}
                        /> */}
                        </TouchableOpacity>
                        <View style={styles.plotContainerItem}>
                          <View>
                            <Text style={styles.plotText}>
                              {t('select_plot')}
                            </Text>
                            <Text style={styles.plotText}>
                              {t('addcrop_cropname')}
                            </Text>
                            <Text style={styles.plotText}>
                              {t('addcrop_cropvariety')}
                            </Text>
                            {/* <Text style={styles.plotText}>
                              {t('showing_date')}
                            </Text>
                            <Text style={styles.plotText}>
                              {t('harvesting_date_auto_calculated')}
                            </Text> */}
                          </View>
                          <View>
                            <Text style={styles.plotTextRe}>
                              :{data.plot_no.substring(-1, 15)}
                            </Text>
                            <Text style={styles.plotTextRe}>
                              :{data.name.substring(-1, 15)}
                            </Text>
                            <Text style={styles.plotTextRe}>
                              :{data.varity.substring(-1, 15)}
                            </Text>
                            {/* <Text style={styles.plotText}>
                              :{data.cycleStarts}
                            </Text>
                            <Text style={styles.plotText}>
                              :{data.cycleEnd.substring(0, 10)}
                            </Text> */}
                          </View>
                        </View>

                        <View style={styles.idcontainer}>
                          <View style={styles.idItemContainer}>
                            <ProofAndIdentityPropfCompLoan
                              identityProofIdentityPropf={data.addressProof}
                              t={t}
                              title={t('address_proof')}
                              handleDocumentSelection={handleDocumentSelection}
                              handleDocumentSelectionRemove={
                                handleDocumentSelectionRemove
                              }
                              handleScanAndCreatePdf={handleScanAndCreatePdf}
                              parent={data}
                              InputTextFormEdit={false}
                            />
                          </View>
                        </View>
                      </View>
                    );
                  }
                })}
              </View>

              {/* {landProof &&
                landProof.map((data, index) => {
                  return (
                    <TouchableOpacity
                      style={styles.idItem}
                      onPress={() =>
                        handleDocumentSelection('LandProof', index, landProof)
                      }
                      key={index}>
                      <Image
                        source={require('../../Common/images/document.png')}
                        style={styles.idImage}
                      />
                      <Text>{data.name == '' ? '' : data.name}</Text>
                    </TouchableOpacity>
                  );
                })} */}

              <TouchableOpacity
                style={styles.clickAddMorePlots}
                onPress={() => handle_button()}>
                <Text style={styles.clickAddMorePlotsTitle}>
                  {t('click_to_add_more_plot')}
                </Text>
              </TouchableOpacity>

              {/* <View style={styles.idcontainer}>
                <Text style={styles.title}>{t('land_records')}</Text>
                <View style={styles.idItemContainer}>
                  {landProof &&
                    landProof.map((data, index) => {
                      return (
                        <TouchableOpacity
                          style={styles.idItem}
                          onPress={() =>
                            handleDocumentSelection(
                              'LandProof',
                              index,
                              landProof,
                            )
                          }
                          key={index}>
                          <Image
                            source={require('../../Common/images/document.png')}
                            style={styles.idImage}
                          />
                          <Text>{data.name == '' ? '' : data.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              </View> */}
              <View style={styles.idcontainer}>
                <ProofAndIdentityPropfCompLoan
                  identityProofIdentityPropf={landProof}
                  t={t}
                  title={t('land_records')}
                  handleDocumentSelection={handleDocumentSelection}
                  handleDocumentSelectionRemove={handleDocumentSelectionRemove}
                  handleScanAndCreatePdf={handleScanAndCreatePdf}
                />
              </View>
            </ScrollView>
          </SafeAreaView>
          {/* <ButtonFormBottom
            label={t('submit')}
            onPress={handleSave}
            iconName="check-circle"
            iconColor="#fff"
            iconSize={30}
          /> */}
          <ButtonForm
            label={t('submit')}
            onPress={handleSave}
            loading={isLoading}
          />
        </Root>
      </>
    </FarmerDrawerScreenWrapper1>
  );
};

export default LoanRequest;

const styles = StyleSheet.create({
  idcontainer: {
    marginBottom: 20,

    backgroundColor: '#FFF',
    elevation: 5,
    borderRadius: 8,
    padding: 10,

    marginHorizontal: '4%',
  },
  idItemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  idItem: {
    padding: 10,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idImage: {
    width: 60,
    height: 60,
  },
  // flatContainer: {
  //   backgroundColor: '#FFF',
  //   width: '100%',
  //   borderRadius: 10,
  //   padding: 10,
  //   marginBottom: 10,
  //   elevation: 5,
  //   zIndex: -999,
  // },
  flatlisttitle: {
    color: '#000',
    marginVertical: 8,
    fontSize: 16,
  },
  flatlistitem: {},
  plotContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 5,
  },
  plotContainerItem: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#eef7faff',

    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
    // margin: 10,
    borderRadius: 10,
    marginBottom: 5,
    padding: 10,
  },
  plotText: {
    marginVertical: 4,
    color: Colors.text,

    fontFamily: 'Poppins-Regular',
  },
  plotTextRe: {
    color: '#000',
    marginVertical: 4,
    fontFamily: 'Poppins-Regular',
  },
  PlotSiteList: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 18,
    elevation: 1,
  },
  flatContainer: {
    backgroundColor: '#f2f8eeff',
    position: 'absolute',
    zIndex: 999,
    top: '100%',
    left: 0,
    marginHorizontal: '5%',
    width: '50%',
    elevation: 10,
    borderRadius: 8,
    padding: 10,
    marginTop: 120,
    justifyContent: 'center',
    alignSelf: 'center',
    // alignItems: 'center',
    marginLeft: 100,
  },
  flatlistHeight: {
    height: Dimensions.get('window').height / 2.5,
  },
  plotTitle: {
    color: '#000',
    marginBottom: 10,
    color: '#FF0000',
  },
  text: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  loadingScreen: {
    position: 'absolute',
    top: '60%',
    zIndex: 999,
    left: '45%',
  },
  xMarkImage: {
    width: 20,
    height: 20,
    margin: 5,
  },
  clickAddMorePlots: {
    backgroundColor: Colors.drawer,
    marginHorizontal: 35,
    paddingVertical: 15,
    marginVertical: 20,
    borderRadius: 20,
  },
  clickAddMorePlotsTitle: {
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  ///////////////////////////

  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginVertical: '4%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: '3%',
  },
  cardTitle: {
    fontSize: 16,
    // fontWeight: '600',
    color: Colors.borderGreen,
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 2,
  },
  emptyText: {
    color: '#ff0000',
    marginLeft: 6,
    fontSize: 13,
    fontFamily: Fonts.SemiBold,
  },
  searchResultsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
    elevation: 3,
    zIndex: 1000, // Ensure it appears above other elements
  },
  /////////////////////////////////////////////
  // container: {
  //   marginHorizontal: '3%',
  //   paddingVertical: 10,
  //   marginBottom: 50,
  // },
  // idcontainer: {
  //   marginVertical: 10,
  //   backgroundColor: '#FFF',
  //   elevation: 2,
  //   borderRadius: 5,
  //   padding: 10
  // },
  // idItemContainer: {
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  // },
  // idItem: {
  //   padding: 10,
  //   width: '30%',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // idImage: {
  //   width: 60,
  //   height: 60,
  // },
  // flatContainer: {
  //   backgroundColor: '#FFF',
  //   width: '100%',
  //   borderRadius: 10,
  //   padding: 10,
  //   marginBottom: 10,
  //   elevation: 5,
  //   zIndex: -999,
  // },
  // flatlisttitle: {
  //   color: '#000',
  //   marginVertical: 8,
  //   fontSize: 16,
  // },
  // flatlistitem: {},
  // plotContainer: {
  //   backgroundColor: '#FFF',
  //   borderRadius: 10,
  //   elevation: 5,
  // },
  // plotContainerItem: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  //   alignItems: 'center',
  //   backgroundColor: '#FFF',
  //   borderWidth: 1,
  //   borderColor: '#000',
  //   margin: 15,
  //   borderRadius: 10,
  //   padding: 10,
  // },
  // plotText: {
  //   color: '#000',
  //   marginVertical: 2,
  //   fontFamily: 'Poppins-Regular',
  //   fontSize: 14,
  // },
  // PlotSiteList: {
  //   backgroundColor: '#FFF',
  //   borderRadius: 10,
  //   marginBottom: 18,
  //   elevation: 1,
  // },
  // flatContainer: {
  //   backgroundColor: '#ffffff',
  //   position: 'absolute',
  //   zIndex: 999,
  //   // bottom: '100%',
  //   top: 90,
  //   left: 0,
  //   marginHorizontal: '5%',
  //   width: '90%',
  //   elevation: 10,
  //   borderRadius: 10,
  //   padding: 10,
  // },
  // flatlistHeight: {
  //   height: Dimensions.get('window').height / 2.5,
  // },
  // plotTitle: {
  //   color: '#FF0000',
  //   marginBottom: 10,
  //   fontFamily: 'Poppins-Regular',
  //   fontSize: 14,
  // },
  // title: {
  //   color: '#000',
  //   fontFamily: 'Poppins-Regular',
  //   fontSize: 14,
  // },
  // loadingScreen: {
  //   position: 'absolute',
  //   top: '60%',
  //   zIndex: 999,
  //   left: '45%',
  // },
  // xMarkImage: {
  //   width: 20,
  //   height: 20,
  //   margin: 5,
  // },
  // clickAddMorePlots: {
  //   backgroundColor: '#045004',
  //   marginHorizontal: 35,
  //   paddingVertical: 15,
  //   marginVertical: 20,
  //   borderRadius: 20,
  // },
  // clickAddMorePlotsTitle: {
  //   textAlign: 'center',
  //   color: '#FFF',
  //   fontFamily: 'Poppins-Regular',
  //   fontSize: 14,
  // },
});
