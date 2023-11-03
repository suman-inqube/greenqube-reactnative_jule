import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity,
  Dimensions, KeyboardAvoidingView, SafeAreaView
} from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import LoanRequest from './LoanRequest';
import ButtonFormBottom from '../../Common/ButtonFormBottom';
import ViewPastProduce from './ViewPastRequested';
const LoanEnquiry = () => {
  const [activeBtn, setActiveBtn] = useState(2);
  return (
    < >
      <CustomHeader path={'Dashboard'} />
      <FormsTitle title={'Loan Enquiry'} />
      <View style={styles.container}>
        <View style={styles.btnRequstContainer} >
          <TouchableOpacity style={activeBtn === 1 ? styles.btnRequstActive : styles.btnRequst} onPress={() => setActiveBtn(1)}>
            <Text style={activeBtn === 1 ? styles.btnRequstActiveText : styles.btnRequstText}>{'Loan \nRequest'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={activeBtn === 2 ? styles.btnRequstActive : styles.btnRequst} onPress={() => setActiveBtn(2)}>
            <Text style={activeBtn === 2 ? styles.btnRequstActiveText : styles.btnRequstText}>{'View Past \nRequest'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {
        activeBtn === 1 ?

          <LoanRequest />
          :
          <ViewPastProduce setActiveBtn={setActiveBtn} />

      }

    </>
  )
}

export default LoanEnquiry

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginHorizontal: '5%',
  },
  btnRequstContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  btnRequstActive: {
    backgroundColor: '#a1dc17',
    width: '45%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 5
  },
  btnRequst: {
    backgroundColor: '#FFF',
    width: '45%',
    alignItems: 'center',
    paddingVertical: 10,
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
    fontSize: 18,
    color: '#FFF'
  }

})