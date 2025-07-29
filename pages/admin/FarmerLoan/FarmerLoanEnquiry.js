import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useState, useContext, useCallback} from 'react';
import LoanRequest from './FarmerLoanRequest';
import ViewPastProduce from './FarmerViewPastRequested';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants'; // Assuming you have a Colors and Fonts file for consistent styling
const FarmerLoanEnquiry = () => {
  //GQR-67
  const {FormsTitle, CustomHeader, t, logoImage, topBanner, onBackPress} =
    useContext(userCreateContext);
  //GQR-67
  const navigation = useNavigation();
  const [activeBtn, setActiveBtn] = useState(2);
  useFocusEffect(
    useCallback(() => {
      onBackPress(() => {
        navigation.navigate('FarmerDashboard');
        return true;
      });
    }, []),
  );
  const HandlerGoBack = () => {
    if (activeBtn == 2) {
      navigation.navigate('FarmerDashboard');
    } else {
      setActiveBtn(2);
    }
  };
  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <CustomHeader
          path={'FarmerDashboard'}
          HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />
        <FormsTitle title={t('loan_inquiry')} />
        <View style={styles.container}>
          <View style={styles.btnRequstContainer}>
            <TouchableOpacity
              style={
                activeBtn === 1 ? styles.btnRequstActive : styles.btnRequst
              }
              onPress={() => setActiveBtn(1)}>
              <Text
                style={
                  activeBtn === 1
                    ? styles.btnRequstActiveText
                    : styles.btnRequstText
                }>
                {t('loan_request_n')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={
                activeBtn === 2 ? styles.btnRequstActive : styles.btnRequst
              }
              onPress={() => setActiveBtn(2)}>
              <Text
                style={
                  activeBtn === 2
                    ? styles.btnRequstActiveText
                    : styles.btnRequstText
                }>
                {t('view_loan_nrequested')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {activeBtn === 1 ? (
          <LoanRequest setActiveBtn={setActiveBtn} />
        ) : (
          <ViewPastProduce setActiveBtn={setActiveBtn} />
        )}
      </>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerLoanEnquiry;

const styles = StyleSheet.create({
  container: {
    // width: '100%',
    marginHorizontal: '3%',
    marginTop: '2%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: Colors.containerGreen,
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
  },
  btnRequstContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginHorizontal: '3%',
    paddingTop: 10,
  },
  btnRequstActive: {
    backgroundColor: Colors.borderGreen,
    width: '45%',
    alignItems: 'center',
    paddingVertical: 5,
    // borderRadius: 10,
    elevation: 5,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  btnRequst: {
    backgroundColor: '#FFF',
    width: '45%',
    alignItems: 'center',
    paddingVertical: 5,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 5,
  },
  btnRequstText: {
    // fontWeight: 'bold',
    textAlign: 'center',

    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(0, 0, 0, 0.59)',
  },
  btnRequstActiveText: {
    // fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,

    color: 'rgba(255, 255, 255, 0.81)',
    fontFamily: 'Poppins-SemiBold',
  },
});
