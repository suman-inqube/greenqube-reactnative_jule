import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import React, { useState, useEffect, useContext, useCallback, lazy, useRef } from 'react';
import ModalCompProduct from './ModalCompProduct';
import {
  inputCategoryAPI,
  inputListAPI,
  inputSubCategoryAPI,
} from '../../../config/apiHere';
const SearchBy = lazy(() => import('./SearchBy'));
const SearchSubBy = lazy(() => import('./SearchSubBy'));
import { useIsFocused } from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../utils/Constants';
import { FloatingAction } from 'react-native-floating-action';
import { getActionsActivity } from '../../utils/options';
import ProductOptionDropDown from '../../Common/ProductOptionDropDown';
const InputList = ({ navigation }) => {
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
  const { dbname, lan_id, token, user_id } = loginUser_data;

  const fadeAnims = useRef({}).current;
  const slideAnims = useRef({}).current;
  const scaleAnims = useRef({}).current;

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
      // Add tap animation
      if (scaleAnims[index]) {
        Animated.sequence([
          Animated.timing(scaleAnims[index], {
            toValue: 0.98,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnims[index], {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }

      await setItem('input_single_data', inputListAll[index]);
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
  }, []);


  useEffect(() => {
    // Initialize animations for each product
    inputListAll.forEach((_, index) => {
      if (!fadeAnims[index]) {
        fadeAnims[index] = new Animated.Value(0);
      }
      if (!slideAnims[index]) {
        slideAnims[index] = new Animated.Value(30);
      }
      if (!scaleAnims[index]) {
        scaleAnims[index] = new Animated.Value(1);
      }
    });

    // Animate items on load
    inputListAll.forEach((_, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnims[index], {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnims[index], {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }, index * 100);
    });
  }, [inputListAll]);

  const ProductCard = ({ product, index }) => {
    // Ensure animations exist
    if (!fadeAnims[index]) {
      fadeAnims[index] = new Animated.Value(0);
    }
    if (!slideAnims[index]) {
      slideAnims[index] = new Animated.Value(30);
    }
    if (!scaleAnims[index]) {
      scaleAnims[index] = new Animated.Value(1);
    }

    return (
      <Animated.View
        style={[
          styles.productCard,
          {
            opacity: fadeAnims[index],
            transform: [
              { translateY: slideAnims[index] },
              { scale: scaleAnims[index] }
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigateToPages(index)}
          activeOpacity={0.95}
          style={styles.cardContainer}
        >
          {/* Product Image - Facebook style large image */}
          <View style={styles.imageContainer}>
            {product.agri_files && product.agri_files.length > 0 ? (
              <Image
                source={{ uri: product.agri_files[0].file_path }}
                style={styles.productImage}
              />
            ) : (
              <Image
                source={require('../../Common/images/logo.png')}
                style={styles.productImage}
              />
            )}

            {/* Trending Badge - Top Right */}
            {product?.trending && (
              <View style={styles.trendingBadge}>
                <Text style={styles.trendingText}>🔥 New</Text>
              </View>
            )}
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            {/* Product Name - Large Bold Title */}
            <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.product_name}
              </Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {product.productCategories[0]?.productCategory?.name || 'N/A'}
                </Text>
              </View>
            </View>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {product.description || 'Premium quality product for your agricultural needs'}
            </Text>
          </View>
          <View style={{ width: 220, paddingLeft: 10 }}>
            <ProductOptionDropDown
              rate={product.agri_product_prices}
              onChange={item =>
                console.log(item.value && item.value)
              }
              key={index}
              currency={currency}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <FarmerDrawerScreenWrapper1>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      <View style={{ flex: 1 }}>
        <CustomHeader
          path="Dashboard"
          logoImage={logoImage}
          topBanner={topBanner}
        />

        <View style={styles.container}>
          {/* Search Section */}
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

          <ModalCompProduct
            setModalVisible={setModalVisible}
            modalVisible={modalVisible}
            inputSigle={inputSingle}
            style={styles.modalStyle}
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
            contentContainerStyle={styles.flatListContent}
            renderItem={({ item, index }) => (
              <ProductCard key={item.fid} product={item} index={index} />
            )}
            keyExtractor={(item, index) => `${item.fid}-${index}`}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          {/* Floating Action Button */}
          {/* <View style={styles.viewPastBtn}>
            <TouchableOpacity
              onPress={() => navigation.navigate('PastEnquiry')}
              style={styles.fabContainer}
            >
              <Text style={styles.viewPastBtnText}>
                💬 {t('view_input_requested')}
              </Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </View>
      <FloatingAction
        position="right"
        actions={getActionsActivity(t, styles, Colors)}
        color={Colors.useGreen}
        onPressItem={(name) => {
          // SPSheet.hide();
          // handleSPSheetShow();
        }}
        showBackground={true}
        overlayColor="rgba(22, 17, 17, 0.35)"
        distanceToEdge={{ vertical: 80, horizontal: 25 }} />
    </FarmerDrawerScreenWrapper1>
  );
};

export default InputList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Facebook's background color
  },
  searchSection: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
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
  flatListContent: {
    paddingHorizontal: 0,
    paddingBottom: 100,
  },
  separator: {
    height: 8,
    backgroundColor: '#f0f2f5',
  },
  productCard: {
    backgroundColor: 'white',
    marginBottom: 8,
    margin: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: Colors.border,
    borderStyle: 'dotted'
  },
  cardContainer: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    // height: 150, // Facebook style large image
    backgroundColor: '#f0f2f5',
  },
  productImage: {
    width: '100%',
    // height: '80%',
    height: 200,
    resizeMode: 'cover',
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  trendingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  contentSection: {
    padding: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1e21', // Facebook's dark text
    marginBottom: 8,
    lineHeight: 24,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e4e6ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryIconText: {
    fontSize: 10,
  },
  categoryText: {
    fontSize: 14,
    color: '#65676b', // Facebook's secondary text
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 15,
    color: '#1c1e21',
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1877f2', // Facebook blue
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonIcon: {
    fontSize: 14,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e4e6ea', // Facebook's secondary button color
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#1c1e21',
    fontSize: 15,
    fontWeight: '600',
  },
  viewPastBtn: {
    position: 'absolute',
    right: 0,
    top: '75%',
    backgroundColor: '#42b883',
    paddingLeft: 20,
    paddingRight: 15,
    paddingVertical: 12,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 99,
  },
  fabContainer: {
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },
  viewPastBtnText: {
    color: 'white',
    fontFamily: 'Poppins-Regular',
    fontWeight: '600',
    fontSize: 13,
  },
  loadingScreen: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 100,
  },
  modalStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  categoryBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  categoryBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
});