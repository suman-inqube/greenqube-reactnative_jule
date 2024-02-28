import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity,
  BackHandler
} from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import LoanRequest from './FarmerLoanRequest';
import ButtonFormBottom from '../../Common/ButtonFormBottom';
import ViewPastProduce from './FarmerViewPastRequested';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
const FarmerLoanEnquiry = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [activeBtn, setActiveBtn] = useState(2);
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => { navigation.navigate('FarmerDashboard'); return true; };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
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
      <CustomHeader path={'FarmerDashboard'} HandlerGoBack={HandlerGoBack} />
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