import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useContext} from 'react';
import LivelihoodFilterModal from './LivelihoodFilterModal';
import PackageOfPracticesController from '../../ViewController/PackageOfPracticesController';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
const PackageOfPractices = () => {
  //GQR-67
  const {loginUser_data, t, logoImage, topBanner, LoadingScreen, CustomHeader} =
    useContext(userCreateContext);
  //GQR-67
  const {
    isLoading,
    livelihoodType,
    modalVisible,
    setModalVisible,
    navigation,
    packageList,
    HandlerGoBack,
    productFilter,
    onChangeDetails,
    livehoodTypeFilterData,
  } = PackageOfPracticesController();
  return (
    <FarmerDrawerScreenWrapper1>
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <LivelihoodFilterModal
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            width: '100%',
            paddingVertical: 10,
          }}
          setModalVisible={setModalVisible}
          modalVisible={modalVisible}
          data={livelihoodType}
          productFilter={productFilter}
        />
        <CustomHeader
          HandlerGoBack={() => HandlerGoBack('FarmerDashboard', '')}
          logoImage={logoImage}
          topBanner={topBanner}
        />
        {isLoading ? (
          <View style={styles.loadingScreen}>
            <LoadingScreen />
          </View>
        ) : null}
        <TouchableOpacity
          style={styles.filterItem}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.titleFiler}>
            {livehoodTypeFilterData.name == ''
              ? t('select_crop_type')
              : livehoodTypeFilterData.name}
          </Text>
          <Image
            source={require('../../Common/images/filter100.png')}
            style={styles.filterImg}
          />
        </TouchableOpacity>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={packageList}
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                onPress={() => onChangeDetails(item)}
                style={styles.FlatListItem}>
                {item.agri_files.length != 0 ? (
                  <Image
                    style={styles.FlatListItemImg}
                    source={{uri: item.agri_files[0].file_path}}
                  />
                ) : (
                  <Image
                    source={require('../../Common/images/apple.png')}
                    style={[styles.FlatListItemImg, {width: 100, height: 100}]}
                  />
                )}
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{item.label}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          //Setting the number of column
          numColumns={3}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </FarmerDrawerScreenWrapper1>
  );
};

export default PackageOfPractices;

const styles = StyleSheet.create({
  filterItem: {
    backgroundColor: '#1c571cff',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 7,
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(221, 255, 221, 0.7)', // Light green with 70% opacity
    padding: 5,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  title: {
    color: '#000000ff',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  titleFiler: {
    color: '#ffffffff',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
    paddingRight: 10,
  },
  FlatListItem: {
    flex: 1,
    flexDirection: 'column',
    // margin: 1,
    // padding: 20,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 10,
    backgroundColor: '#dfdfdfff',
    elevation: 3,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
    margin: 10,
    overflow: 'hidden',
  },
  FlatListItemImg: {
    width: '95%',
    height: '95%',
    // resizeMode: "contain",
    borderRadius: 8,
  },
  loadingScreen: {
    position: 'absolute',
    top: '60%',
    zIndex: 999,
    left: '45%',
  },
  filterImg: {
    width: 20,
    height: 20,
    tintColor: '#FFF',
    resizeMode: 'contain',
  },
});
