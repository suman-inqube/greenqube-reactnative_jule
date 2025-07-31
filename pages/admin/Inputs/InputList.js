import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import React, {useState, useEffect, useContext, useCallback, lazy} from 'react';
import ModalCompProduct from './ModalCompProduct';
import ProductOptionDropDown from '../../Common/ProductOptionDropDown';
import {
  inputCategoryAPI,
  inputListAPI,
  inputSubCategoryAPI,
} from '../../../config/apiHere';
const SearchBy = lazy(() => import('./SearchBy'));
const SearchSubBy = lazy(() => import('./SearchSubBy'));
import {useIsFocused} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
const InputList = ({navigation}) => {
  //GQR-67
  const {
    loginUser_data,
    LoadingScreen,
    CustomHeader,
    t,
    onBackPress,
    getItem,
    setItem,
    logoImage,
    topBanner,
    FormsTitle,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-67

  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputListAll, setInputListAll] = useState([]);
  const [inputListAllRaw, setInputListAllRaw] = useState([]);
  const [inputCategory, setInputCategory] = useState([]);
  const [inputSubCategory, setInputSubCategory] = useState([]);
  const [inputSingle, setInputSingle] = useState({});
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [currency, setCurrencyt] = useState('');
  const navigateToPages = useCallback(
    async index => {
      await setItem('input_single_data', inputListAll[index]);
      // setIsLoading(true)
      setInputSingle(inputListAll[index]);
      setModalVisible(true);
      setIsLoading(false);
    },
    [inputListAll],
  );
  const handleCategory = useCallback(async search => {
    if (search.value == '0') {
      setInputListAll(inputListAllRaw);
      setInputSubCategory([]);
    } else {
      const [inputFound, inputSubCategoryList] = await Promise.all([
        inputListAPI(dbname, lan_id, token, user_id, search.value),
        inputSubCategoryAPI(dbname, lan_id, token, user_id, search.value),
      ]);
      if (inputFound?.status == 200) {
        setInputListAll(inputFound?.data?.data?.rows);
      }
      if (inputSubCategoryList) {
        const dataArray = inputSubCategoryList?.data?.data?.rows.map(data => ({
          value: data.entity_name.fid,
          label: data.entity_name.name,
        }));
        setInputSubCategory(dataArray);
      }
    }
  }, []);
  const handleSubCategory = useCallback(async search => {
    const inputList = await inputListAPI(
      dbname,
      lan_id,
      token,
      user_id,
      search.value,
    );
    if (inputList?.status == 200) {
      setInputListAll(inputList?.data?.data?.rows);
    }
  }, []);
  const onPageLoad = async () => {
    const [currency_res] = await Promise.all([getItem('currency')]);
    setCurrencyt(currency_res);
    const [inputList, inputCategoryList] = await Promise.all([
      inputListAPI(dbname, lan_id, token, user_id, ''),
      inputCategoryAPI(dbname, lan_id, token, user_id),
    ]);
    if (inputList?.status == 200) {
      setInputListAll(inputList?.data?.data?.rows);
      setInputListAllRaw(inputList?.data?.data?.rows);
      setItem('input_data', inputList?.data?.data?.rows);
      setIsLoading(false);
    }
    if (inputCategoryList) {
      const dataArray1 = [
        {
          value: '0',
          label: t('All'),
        },
      ];
      inputCategoryList.data.data.rows.forEach(element => {
        dataArray1.push({
          value: element.fid,
          label: element.name,
        });
      });
      setInputCategory(dataArray1);
      setInputSubCategory([]);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    setModalVisible(false);
    onPageLoad();
    onBackPress(() => {
      navigation.navigate('Dashboard');
      return true;
    });
  }, [isFocused]);
  const HandlerGoBack = () => {
    setCategory('');
    setSubCategory('');
    navigation.navigate('Dashboard');
  };
  return (
    <View style={{flex: 1}}>
      <CustomHeader
        path="Dashboard"
        HandlerGoBack={HandlerGoBack}
        logoImage={logoImage}
        topBanner={topBanner}
      />
      <View style={styles.container}>
        <FormsTitle title={t('products')} />
        <View style={styles.searchByCategoryContainer}>
          <View style={styles.searchByCategoryItem}>
            <SearchBy
              label={t('search_by_category')}
              data={inputCategory}
              onChange={item => handleCategory(item)}
              val={category}
            />
          </View>
          <View style={styles.searchByCategoryItem}>
            <SearchSubBy
              label={t('search_by_sub_category')}
              data={inputSubCategory}
              onChange={item => handleSubCategory(item)}
              val={subCategory}
            />
          </View>
        </View>
        <ModalCompProduct
          setModalVisible={setModalVisible}
          modalVisible={modalVisible}
          inputSigle={inputSingle}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        />
        {isLoading && (
          <View style={styles.loadingScreen}>
            <LoadingScreen />
          </View>
        )}
        <FlatList
          data={inputListAll}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({item, index}) => (
            <TouchableOpacity
              onPress={() => navigateToPages(index)}
              key={index}>
              <View style={styles.flatlistContainer}>
                <View style={styles.flatlistItem}>
                  {item.agri_files && item.agri_files.length > 0 ? (
                    <Image
                      source={{uri: item.agri_files[0].file_path}}
                      style={{width: 100, height: 100, resizeMode: 'contain'}}
                    />
                  ) : (
                    <Image
                      source={require('../../Common/images/logo.png')}
                      style={{width: 100, height: 100, resizeMode: 'contain'}}
                    />
                  )}
                  <View
                    style={{
                      justifyContent: 'flex-end',
                      paddingHorizontal: 10,
                      width: '100%',
                    }}>
                    <Text
                      style={[
                        styles.title,
                        {fontFamily: 'Poppins-SemiBold', color: '#013715'},
                      ]}>
                      {item.product_name}
                    </Text>
                    <Text style={styles.title}>
                      {item.productCategories[0].productCategory.name}
                    </Text>
                    <Text style={styles.title}>{item.product_code}</Text>
                    <Text style={styles.title}>
                      {item.description.length < 70
                        ? item.description.substring(0, 70)
                        : item.description.substring(0, 70) + '...'}
                    </Text>
                    <View style={{width: 220, paddingLeft: 10}}>
                      <ProductOptionDropDown
                        rate={item.agri_product_prices}
                        onChange={item => console.log(item.value && item.value)}
                        key={index}
                        currency={currency}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index}
        />

        <View style={styles.viewPastBtn}>
          <TouchableOpacity onPress={() => navigation.navigate('PastEnquiry')}>
            <Text style={styles.viewPastBtnText}>
              {t('view_input_requested')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default InputList;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: '2.5%',
    flex: 1,
  },
  title: {
    width: '70%',
    color: '#000',
    fontFamily: 'Poppins-Regular',
    textAlign: 'auto',
    fontSize: 14,
  },
  flatlistContainer: {
    backgroundColor: '#FFFF',
    // backgroundColor: 'red',
    marginBottom: 10,
    // paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
  },
  flatlistItem: {
    flexDirection: 'row',

    // justifyContent:'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  productImage: {
    width: 100,
    height: 100,
    marginRight: 20,
    borderRadius: 10,
  },
  searchByCategoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchByCategoryItem: {
    width: '45%',
  },
  viewPastBtn: {
    position: 'absolute',
    right: '-6%',
    top: '70%',
    backgroundColor: '#009200',
    paddingLeft: 10,
    paddingRight: 25,
    paddingVertical: 2,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    zIndex: 99,
  },
  loadingScreen: {
    position: 'relative',
    top: 100,
  },
  viewPastBtnText: {
    color: '#ffff',
    paddingLeft: 20,
    fontFamily: 'Poppins-Regular',
  },
});
