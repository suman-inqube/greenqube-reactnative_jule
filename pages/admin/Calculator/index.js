import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useState, useContext} from 'react';
import PestisideCalculator from './PestisideCalculator';
import FertilizerCalculator from './FertilizerCalculator';
import CalculatorController from '../../ViewController/CalculatorController';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants';
const Calculator = () => {
  const [activeBtn, setActiveBtn] = useState(2);
  const {HandlerGoBack} = CalculatorController();
  //GQR-67
  const {
    t,
    CustomHeader,
    FormsTitle,
    logoImage,
    topBanner,
    Root,
    ButtonForm,
    DropdownForm,
    InputTextForm,
  } = useContext(userCreateContext);
  //GQR-67
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        <CustomHeader
          // HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />
        {/* <FormsTitle title={t('agri_calculator')} /> */}
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
                {t('pestiside_calculator')}
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
                {t('fertilizer_calculator')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {activeBtn === 1 ? (
          <PestisideCalculator setActiveBtn={setActiveBtn} />
        ) : (
          <FertilizerCalculator setActiveBtn={setActiveBtn} />
        )}
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};

export default Calculator;

const styles = StyleSheet.create({
  container: {
    // width: '100%',
    marginHorizontal: '3%',
    marginTop: '5%',
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
    backgroundColor: '#E1EBE1',
    width: '50%',
    alignItems: 'center',
    paddingVertical: 5,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 5,
    borderWidth: 0.5,
  },
  btnRequstText: {
    // fontWeight: 'bold',
    textAlign: 'center',

    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(0, 0, 0, 0.59)',
    paddingHorizontal: 15,
  },
  btnRequstActiveText: {
    // fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
    paddingHorizontal: 15,

    color: 'rgba(255, 255, 255, 0.81)',
    fontFamily: 'Poppins-SemiBold',
  },

  ////////////////////////////////////////////////////////
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
