import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState, useContext, useCallback } from 'react'
import LoanRequest from './FarmerLoanRequest';
import ViewPastProduce from './FarmerViewPastRequested';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
const FarmerLoanEnquiry = () => {
  //GQR-67
  const { FormsTitle, CustomHeader, t, logoImage, topBanner, onBackPress } = useContext(userCreateContext);
  //GQR-67
  const navigation = useNavigation();
  const [activeBtn, setActiveBtn] = useState(2);
  useFocusEffect(
    useCallback(() => {
      onBackPress(() => { navigation.navigate('FarmerDashboard'); return true; });
    }, [])
  );
  const HandlerGoBack = () => {
    if (activeBtn == 2) {
      navigation.navigate("FarmerDashboard");
    } else {
      setActiveBtn(2)
    }
  }
  return (
    < >
      <CustomHeader path={'FarmerDashboard'} HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
      <FormsTitle title={t('loan_inquiry')} />
      <View style={styles.container}>
        <View style={styles.btnRequstContainer} >
          <TouchableOpacity style={activeBtn === 1 ? styles.btnRequstActive : styles.btnRequst} onPress={() => setActiveBtn(1)}>
            <Text style={activeBtn === 1 ? styles.btnRequstActiveText : styles.btnRequstText}>{t('loan_request_n')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={activeBtn === 2 ? styles.btnRequstActive : styles.btnRequst} onPress={() => setActiveBtn(2)}>
            <Text style={activeBtn === 2 ? styles.btnRequstActiveText : styles.btnRequstText}>{t('view_loan_nrequested')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {
        activeBtn === 1 ?
          <LoanRequest setActiveBtn={setActiveBtn} />
          :
          <ViewPastProduce setActiveBtn={setActiveBtn} />
      }
    </>
  )
}

export default FarmerLoanEnquiry

const styles = StyleSheet.create({
  container: {
    width: '94%',
    marginHorizontal: '3%',
  },
  btnRequstContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  btnRequstActive: {
    backgroundColor: '#a1dc17',
    width: '45%',
    alignItems: 'center',
    paddingVertical: 5,
    borderRadius: 10,
    elevation: 5
  },
  btnRequst: {
    backgroundColor: '#FFF',
    width: '45%',
    alignItems: 'center',
    paddingVertical: 5,
    borderRadius: 10,
    elevation: 5
  },
  btnRequstText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#060505'
  },
  btnRequstActiveText: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#FFF',
  }

})