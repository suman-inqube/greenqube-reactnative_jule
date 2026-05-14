import React, {memo, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import DropdownForm from '../Common/DropdownForm';
import {Colors} from '../utils/Constants';
const InputProductCard = memo(
  ({
    product,
    index,
    currency,
    fadeAnims,
    Colors,
    slideAnims,
    scaleAnims,
    navigateToPages,
  }) => {
    const productPrices = useMemo(
      () =>
        product?.agri_product_prices?.map(element => ({
          value: element.prod_price_id,
          label:
            !element.discounted_price || element.discounted_price === '0'
              ? `${currency} ${
                  element.sales_price
                }/${element.agri_unit?.unit_name?.substring(0, 7)}..`
              : `${currency} ${
                  element.discounted_price
                }/${element.agri_unit?.unit_name?.substring(0, 7)}..`,
        })),
      [product.agri_product_prices, currency],
    );

    if (!fadeAnims.current[index])
      fadeAnims.current[index] = new Animated.Value(0);
    if (!slideAnims.current[index])
      slideAnims.current[index] = new Animated.Value(30);
    if (!scaleAnims.current[index])
      scaleAnims.current[index] = new Animated.Value(1);

    return (
      <Animated.View
        style={[
          styles.productCard,
          {
            opacity: fadeAnims.current[index],
            transform: [
              {translateY: slideAnims.current[index]},
              {scale: scaleAnims.current[index]},
            ],
          },
        ]}>
        <TouchableOpacity
          onPress={() => navigateToPages(index)}
          activeOpacity={0.95}
          style={styles.cardContainer}>
          <View style={styles.imageContainer}>
            {product.agri_files?.length > 0 ? (
              <Image
                source={{uri: product.agri_files[0].file_path}}
                style={styles.productImage}
              />
            ) : (
              <Image
                source={require('../Common/images/logo.png')}
                style={styles.productImage}
              />
            )}
            {product?.trending && (
              <View style={styles.trendingBadge}>
                <Text style={styles.trendingText}>🔥 New</Text>
              </View>
            )}
          </View>
          <View style={styles.contentSection}>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{product.product_name}</Text>

              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {product.productCategories[0]?.productCategory?.name || 'N/A'}
                </Text>
              </View>
            </View>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {product.description ||
                'Premium quality product for your agricultural needs'}
            </Text>
            <DropdownForm
              label={''}
              data={productPrices}
              onChange={item => console.log(item.value)}
              val={productPrices[0]?.label}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

export default memo(InputProductCard);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Facebook's background color
  },

  productCard: {
    backgroundColor: 'white',
    marginBottom: 8,
    margin: 16,
    borderRadius: 8,
  },
  cardContainer: {
    flex: 1,
    borderWidth: 0.5,
    borderRadius: 8,
    borderColor: Colors.border,
    // borderStyle: 'dotted'
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: '#f8f8f8',
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
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
    color: '#1c1e21',
    lineHeight: 28,
    marginBottom: 10,
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
    shadowOffset: {width: 0, height: 2},
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
    transform: [{translateX: -25}, {translateY: -25}],
    zIndex: 100,
  },
  modalStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },

  categoryBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  productHeader: {
    marginBottom: 12,
  },

  productNameContainer: {
    flex: 1,
    paddingRight: 10,
  },
});
