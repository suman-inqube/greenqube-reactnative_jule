import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import React, {useContext} from 'react';
import SoilHealthManagementController from '../../ViewController/SoilHealthManagementController';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SoilHealthManagement = () => {
  //GQR-67
  const {t, CustomHeader, FormsTitle, logoImage, topBanner} =
    useContext(userCreateContext);
  //GQR-67
  const {navigateToPages, HandlerGoBack} = SoilHealthManagementController('');
  return (
    <FarmerDrawerScreenWrapper1>
      <View style={styles.container}>
        <CustomHeader
          // HandlerGoBack={() => HandlerGoBack('FarmerDashboard')}
          logoImage={logoImage}
          topBanner={topBanner}
        />
        {/* <FormsTitle title={t('soil_health_management')} /> */}
        <View style={styles.containerItem}>
          <TouchableOpacity
            style={styles.itemList}
            onPress={() => navigateToPages('PostRequest')}>
            <View style={styles.imageContainer}>
              <Image
                style={{width: 100, height: 100, resizeMode: 'stretch'}}
                source={require('../../Common/images/request_soil_testing_re.png')}
              />
              <View style={styles.textOverlay}>
                <View style={styles.textWithIcon}>
                  <Text style={styles.title}>{t('request_soil_testing')}</Text>
                  <MaterialIcons
                    name="arrow-forward"
                    size={18}
                    color="#030730"
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.itemList}
            onPress={() => navigateToPages('MySoil')}>
            <View style={styles.imageContainer}>
              <Image
                style={{
                  width: 100,
                  height: 100,
                  resizeMode: 'stretch',
                }}
                source={require('../../Common/images/my_soil.png')}
              />
              <View style={styles.textOverlay}>
                <View style={styles.textWithIcon}>
                  <Text style={styles.title}>{t('my_soil')}</Text>
                  <MaterialIcons
                    name="arrow-forward"
                    size={18}
                    color="#030730"
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </FarmerDrawerScreenWrapper1>
  );
};

export default SoilHealthManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  containerItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end', // Positions text at the bottom
    alignItems: 'center',
  },
  itemList: {
    alignItems: 'center',
    backgroundColor: '#dcdfd7ff',
    width: '40%',
    borderRadius: 10,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  title: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
  },
  textOverlay: {
    backgroundColor: 'rgba(176, 209, 134, 0.7)', // Light green with transparency
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  textWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
});
