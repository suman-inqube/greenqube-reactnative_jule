import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity,
  BackHandler
} from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import LoanRequest from './LoanRequest';
import ButtonFormBottom from '../../Common/ButtonFormBottom';
import ViewPastProduce from './ViewPastRequested';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
const LoanEnquiry = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [activeBtn, setActiveBtn] = useState(2);
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => { navigation.navigate('Dashboard'); return true; };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );
  const HandlerGoBack = () => {
    navigation.navigate('Dashboard');
  }
  return (
    < >
      <CustomHeader path={'Dashboard'} HandlerGoBack={HandlerGoBack} />
      <FormsTitle title={t('loan_inquiry')} />
      <View style={styles.container}>
        <View style={styles.btnContainer} >
          <TouchableOpacity style={activeBtn === 1 ? styles.btnActive : styles.btn} onPress={() => setActiveBtn(1)}>
            <Text style={activeBtn === 1 ? styles.btnActiveTitle : styles.btnTitle}>{t('loan_request_n')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={activeBtn === 2 ? styles.btnActive : styles.btn} onPress={() => setActiveBtn(2)}>
            <Text style={activeBtn === 2 ? styles.btnActiveTitle : styles.btnTitle}>{t('view_loan_nrequested')}</Text>
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

export default LoanEnquiry

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
    width: '47%'
  },
  btnActive: {
    backgroundColor: '#a1dc17',
    elevation: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: 10,
    height: 55,
    width: '47%'
  },
  btnActiveTitle: {
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15
  },
  btnTitle: {
    textAlign: 'center',
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15
  }

})