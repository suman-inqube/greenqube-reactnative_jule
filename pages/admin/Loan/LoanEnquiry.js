import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useState, useCallback, useContext} from 'react';
import LoanRequest from './LoanRequest';
import ViewPastProduce from './ViewPastRequested';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
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
    <>
      <CustomHeader
        path={'Dashboard'}
        // HandlerGoBack={HandlerGoBack}
        logoImage={logoImage}
        topBanner={topBanner}
      />
      <FormsTitle title={t('loan_inquiry')} />
      <View style={styles.container}>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={activeBtn === 1 ? styles.btnActive : styles.btn}
            onPress={() => setActiveBtn(1)}>
            <Text
              style={activeBtn === 1 ? styles.btnActiveTitle : styles.btnTitle}>
              {t('loan_request_n')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeBtn === 2 ? styles.btnActive : styles.btn}
            onPress={() => setActiveBtn(2)}>
            <Text
              style={activeBtn === 2 ? styles.btnActiveTitle : styles.btnTitle}>
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
  );
};

export default LoanEnquiry;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: '2.5%',
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  btn: {
    elevation: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: 10,
    height: 55,
    width: '47%',
  },
  btnActive: {
    backgroundColor: '#a1dc17',
    elevation: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: 10,
    height: 55,
    width: '47%',
  },
  btnActiveTitle: {
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
  },
  btnTitle: {
    textAlign: 'center',
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
  },
});
