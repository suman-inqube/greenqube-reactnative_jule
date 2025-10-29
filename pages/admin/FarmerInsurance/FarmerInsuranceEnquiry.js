import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import FarmerRequestForInsurance from './FarmerRequestForInsurance';
import FarmerViewPastRequested from './FarmerViewPastRequested';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants'; // Assuming you have a Colors and Fonts file for consistent styling
const FarmerInsuranceEnquiry = ({navigation}) => {
  //GQR-67
  const {FormsTitle, onBackPress, CustomHeader, t, logoImage, topBanner} =
    useContext(userCreateContext);
  //GQR-67
  const [activeBtn, setActiveBtn] = useState(2);
  const HandlerGoBack = () => navigation.navigate('FarmerDashboard');

  return (
    <FarmerDrawerScreenWrapper1>
      {/* <View style={{flex: 1, height: Dimensions.get('window').height / 2}}> */}
      <CustomHeader
        path={'FarmerDashboard'}
        // HandlerGoBack={HandlerGoBack}
        logoImage={logoImage}
        topBanner={topBanner}
      />
      <FormsTitle title={t('insurance_inquiry')} />
      <View style={styles.container}>
        <View style={styles.btnRequstContainer}>
          <TouchableOpacity
            style={activeBtn === 1 ? styles.btnRequstActive : styles.btnRequst}
            onPress={() => setActiveBtn(1)}>
            <Text
              style={
                activeBtn === 1
                  ? styles.btnRequstActiveText
                  : styles.btnRequstText
              }>
              {t('request_for_ninsurance')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeBtn === 2 ? styles.btnRequstActive : styles.btnRequst}
            onPress={() => setActiveBtn(2)}>
            <Text
              style={
                activeBtn === 2
                  ? styles.btnRequstActiveText
                  : styles.btnRequstText
              }>
              {t('view_insurance_nrequested')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {activeBtn === 1 ? (
        <>
          <FarmerRequestForInsurance setActiveBtn={setActiveBtn} />
        </>
      ) : (
        <FarmerViewPastRequested />
      )}
      {/* </View> */}
    </FarmerDrawerScreenWrapper1>
  );
};
export default FarmerInsuranceEnquiry;
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
