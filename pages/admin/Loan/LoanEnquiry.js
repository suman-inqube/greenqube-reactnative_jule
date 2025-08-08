import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useState, useCallback, useContext} from 'react';
import LoanRequest from './LoanRequest';
import ViewPastProduce from './ViewPastRequested';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants'; // Assuming you have a Colors and Fonts file for consistent styling
const LoanEnquiry = () => {
  //GQR-67
  const {CustomHeader, t, onBackPress, logoImage, topBanner, FormsTitle} =
    useContext(userCreateContext);
  //GQR-67
  const navigation = useNavigation();
  const [activeBtn, setActiveBtn] = useState(2);
  useFocusEffect(
    useCallback(() => {
      onBackPress(() => {
        navigation.navigate('Dashboard');
        return true;
      });
    }, []),
  );
  const HandlerGoBack = () => navigation.navigate('Dashboard');
  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <CustomHeader
          path={'Dashboard'}
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

export default LoanEnquiry;

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

    paddingTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnRequstActive: {
    backgroundColor: Colors.borderGreen,
    width: '50%',
    alignItems: 'center',
    paddingVertical: 5,
    // borderRadius: 10,
    elevation: 5,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  btnRequst: {
    // backgroundColor: '#E1EBE1',
    width: '50%',
    alignItems: 'center',
    paddingVertical: 5,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    // elevation: 5,
    // borderWidth: 0.5,
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

  //////////////////////////////////////////////////
  // container: {
  //   marginHorizontal: '2.5%',
  // },
  // btnContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   width: '100%',
  // },
  // btn: {
  //   elevation: 10,
  //   backgroundColor: '#FFF',
  //   paddingHorizontal: 10,
  //   justifyContent: 'center',
  //   borderRadius: 10,
  //   height: 55,
  //   width: '47%',
  // },
  // btnActive: {
  //   backgroundColor: '#a1dc17',
  //   elevation: 10,
  //   paddingHorizontal: 10,
  //   justifyContent: 'center',
  //   borderRadius: 10,
  //   height: 55,
  //   width: '47%',
  // },
  // btnActiveTitle: {
  //   textAlign: 'center',
  //   color: '#FFF',
  //   fontFamily: 'Poppins-SemiBold',
  //   fontSize: 15,
  // },
  // btnTitle: {
  //   textAlign: 'center',
  //   color: '#000',
  //   fontFamily: 'Poppins-SemiBold',
  //   fontSize: 15,
  // },
});
