import {StyleSheet, Text, View, ScrollView, Image} from 'react-native';
import React, {useCallback, useContext} from 'react';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants';

const SalesDetail = () => {
  //GQR-67
  const {
    CustomHeader,
    t,
    onBackPress,
    logoImage,
    topBanner,
    FormsTitle,
    InputTextForm,
  } = useContext(userCreateContext);
  //GQR-67
  const route = useRoute();
  const navigation = useNavigation();
  const {salesUser, createdAt, ord_rcv, pay_rcv, comment, srFiles, srProducts} =
    route.params;
  const images = [1, 2, 3];
  const handleBackPress = () => {
    navigation.navigate('DailySalesReport');
    return true;
  };

  const HandlerGoBack = () => navigation.navigate('DailySalesReport');
  return (
    <FarmerDrawerScreenWrapper1>
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <CustomHeader
          path="DailySalesReport"
          HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />
        {/* <FormsTitle title={t('sales_detail')} /> */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <InputTextForm
              label={t('dealer_name')}
              value={salesUser.userName}
              editable={false}
            />
            <InputTextForm
              label={t('date')}
              value={createdAt.toString().substring(-1, 10)}
              editable={false}
            />
            {srProducts[0] !== undefined ? (
              srProducts[0].salesProduceName != null ? (
                <View style={styles.srProducts}>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>{t('produce_name')}:</Text>
                    <Text style={styles.value}>
                      {srProducts[0].salesProduceName.name}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.label}>{t('prodece_vareity')}:</Text>
                    <Text style={styles.value}>
                      {srProducts[0].salesProduceVariety.name}
                    </Text>
                  </View>
                </View>
              ) : null
            ) : null}
            {ord_rcv != null ? (
              <InputTextForm
                label={t('order_received')}
                value={ord_rcv}
                editable={false}
              />
            ) : null}
            <View>
              {srProducts &&
                srProducts.map((data, index) => {
                  if (data.salesProductCategory != null) {
                    return (
                      <View style={styles.srProducts} key={index}>
                        <Text style={styles.srProductsTitle}>
                          {data.salesProductCategory.name}
                        </Text>
                        <Text style={styles.srProductsTitle}>
                          {data.salesProductSubCategory.name}
                        </Text>
                        <Text style={styles.srProductsTitle}>
                          {data.salesProduct.product_name}
                        </Text>
                        <Text style={styles.srProductsTitle}>
                          {data.qty} {data.unit}
                        </Text>
                      </View>
                    );
                  }
                })}
            </View>
            {ord_rcv != null ? (
              <InputTextForm
                label={t('payment_mode')}
                value={pay_rcv}
                editable={false}
              />
            ) : null}
            <InputTextForm
              label={t('comments')}
              value={comment}
              editable={false}
            />
            <Text style={{color: '#000', marginVertical: 10}}>
              {t('view_phote')}
            </Text>
            <View style={styles.photoContainer}>
              {images.map((data, index) => {
                if (typeof srFiles[index] !== 'undefined') {
                  return (
                    <Image
                      key={index}
                      source={{uri: `${srFiles[index].file_path}`}}
                      style={{width: 100, height: 100}}
                    />
                  );
                } else {
                  return (
                    <Image
                      key={index}
                      source={require('../../Common/images/camera.jpeg')}
                      style={{width: 60, height: 60}}
                    />
                  );
                }
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </FarmerDrawerScreenWrapper1>
  );
};
export default SalesDetail;
const styles = StyleSheet.create({
  formContainer: {
    padding: 20,
  },
  photoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  srProducts: {
    backgroundColor: '#e1ebffe0',
    //  backgroundColor: 'white',

    marginVertical: 8,
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: Colors.borderGreen,
    // flexDirection: 'row',
    // alignItems: 'center',
    // marginBottom: 8,
    paddingHorizontal: 15,
    marginHorizontal: '2.5%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 4,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: Colors.border,
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,
  },
  srProductsTitle: {
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  label: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
  },
  value: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    flex: 1,
    textAlign: 'right',
  },
});
