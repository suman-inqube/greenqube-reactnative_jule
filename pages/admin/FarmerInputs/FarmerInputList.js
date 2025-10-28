import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react';
import FarmerModalCompProduct from './FarmerModalCompProduct';
import ProductOptionDropDown from '../../Common/ProductOptionDropDown';
import {
  inputCategoryAPI,
  inputListAPI,
  inputSubCategoryAPI,
} from '../../../config/apiHere';
import FarmerSearchBy from './FarmerSearchBy';
import FarmerSearchSubBy from './FarmerSearchSubBy';
import {useIsFocused} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import InputProductCard from '../../Components/InputProductCard';
import {Colors} from '../../utils/Constants';
import SearchBy from '../Inputs/SearchBy';
import SearchSubBy from '../Inputs/SearchSubBy';
import {FloatingAction} from 'react-native-floating-action';
import {inputViewPast} from '../../utils/options';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
const FarmerInputList = ({navigation}) => {
  const {
    loginUser_data,
    LoadingScreen,
    CustomHeader,
    t,
    getItem,
    setItem,
    logoImage,
    topBanner,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  const fadeAnims = useRef([]);
  const slideAnims = useRef([]);
  const scaleAnims = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputListAll, setInputListAll] = useState([]);
  const [inputListAllRaw, setInputListAllRaw] = useState([]);
  const [inputCategory, setInputCategory] = useState([]);
  const [inputSubCategory, setInputSubCategory] = useState([]);
  const [inputSingle, setInputSingle] = useState({});
  const [category, setCategory] = useState();
  const [subCategory, setSubCategory] = useState('');
  const [currency, setCurrencyt] = useState('');
  const navigateToPages = useCallback(
    async index => {
      setInputSingle(inputListAll[index]);
      setModalVisible(!modalVisible);
    },
    [navigateToPages, inputListAll],
  );
  const handleCategory = async search => {
    if (search.value === '0') {
      setInputListAll(inputListAllRaw);
      setInputSubCategory([]);
    } else {
      const [inputFound, inputSubCategoryList] = await Promise.all([
        inputListAPI(dbname, lan_id, token, user_id, search.value),
        inputSubCategoryAPI(dbname, lan_id, token, user_id, search.value),
      ]);
      if (inputFound.status == 200) {
        setInputListAll(inputFound.data.data.rows);
      }
      if (inputSubCategoryList) {
        const dataArray = [];
        inputSubCategoryList.data.data.rows.forEach(element => {
          dataArray.push({
            value: element.entity_name.fid,
            label: element.entity_name.name,
          });
        });
        setInputSubCategory(dataArray);
      }
    }
  };
  const handleSubCategory = async search => {
    const inputList = await inputListAPI(
      dbname,
      lan_id,
      token,
      user_id,
      search.value,
    );
    if (inputList.status == 200) {
      setInputListAll(inputList.data.data.rows);
    }
  };
  const onPageLoad = async () => {
    const [inputList, inputCategoryList, currency_res] = await Promise.all([
      inputListAPI(dbname, lan_id, token, user_id, ''),
      inputCategoryAPI(dbname, lan_id, token, user_id),
      getItem('currency'),
    ]);
    setCurrencyt(currency_res);
    if (inputList.status == 200) {
      setInputListAll(inputList.data.data.rows);
      setInputListAllRaw(inputList.data.data.rows);
      setItem('input_data', inputList.data.data.rows);
      setIsLoading(false);
    }
    console.log('inputCategoryList', inputCategoryList);
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
    onPageLoad();
  }, []);
  useEffect(() => {
    const timeouts = [];
    inputListAll.forEach((_, index) => {
      if (!fadeAnims.current[index])
        fadeAnims.current[index] = new Animated.Value(0);
      if (!slideAnims.current[index])
        slideAnims.current[index] = new Animated.Value(30);
      if (!scaleAnims.current[index])
        scaleAnims.current[index] = new Animated.Value(1);

      const timeoutId = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnims.current[index], {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnims.current[index], {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }, index * 100);
      timeouts.push(timeoutId);
    });
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [inputListAll]);

  const renderItem = useCallback(
    ({item, index}) => (
      <InputProductCard
        product={item}
        index={index}
        currency={currency}
        fadeAnims={fadeAnims}
        Colors={Colors}
        slideAnims={slideAnims}
        scaleAnims={scaleAnims}
        navigateToPages={navigateToPages}
      />
    ),
    [InputProductCard, navigateToPages],
  );
  return (
    <FarmerDrawerScreenWrapper1>
      <View style={{flex: 1}}>
        <CustomHeader logoImage={logoImage} topBanner={topBanner} />
        <View style={styles.container}>
          <View style={styles.searchSection}>
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
          </View>
          <FarmerModalCompProduct
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
          {isLoading ? (
            <View style={styles.loadingScreen}>
              <LoadingScreen />
            </View>
          ) : (
            <FlatList
              data={inputListAll}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item, index) => index}
            />
          )}
          <FloatingAction
            position="right"
            actions={inputViewPast(t, styles, Colors)}
            color={Colors.useGreen}
            showBackground
            overlayColor="rgba(22, 17, 17, 0.35)"
            distanceToEdge={{vertical: 80, horizontal: 25}}
            onPressItem={name => {
              navigation.navigate('FarmerPastEnquiry');
            }}
          />
          {/* <View style={styles.viewPastBtn}>
            <TouchableOpacity
              onPress={() => navigation.navigate('FarmerPastEnquiry')}>
              <Text style={styles.viewPastBtnText}>
                {t('view_input_requested')}
              </Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </View>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerInputList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  searchSection: {
    backgroundColor: 'white',
    paddingTop: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchByCategoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  searchByCategoryItem: {
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
