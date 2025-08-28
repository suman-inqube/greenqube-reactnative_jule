import React, {useRef, useContext} from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import PackageOfPracticesController from '../../ViewController/PackageOfPracticesController';
import {useRoute} from '@react-navigation/native';
import DescriptionModel from './DescriptionModel';
const Header_Max_Height = 240;
const Header_Min_Height = 110;
const Scroll_Distance = Header_Max_Height - Header_Min_Height;
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors} from '../../utils/Constants';
const PackageOfPracticesDetails = () => {
  //GQR-67
  const {t, CustomHeader} = useContext(userCreateContext);
  //GQR-67
  const {
    HandlerGoBack,
    POPDetailsList,
    setPOPDetailsList,
    onPressPackageItemDetails,
    modalVisible,
    setModalVisible,
  } = PackageOfPracticesController();
  const {POPDetailsListArr, thumbnails, popResAll, crop_id} = useRoute().params;
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const DynamicHeader = ({value}) => {
    const animatedHeaderHeight = value.interpolate({
      inputRange: [0, Scroll_Distance],
      outputRange: [Header_Max_Height, Header_Min_Height],
      extrapolate: 'clamp',
    });
    const animatedHeaderColor = value.interpolate({
      inputRange: [0, Scroll_Distance],
      outputRange: ['rgba(255, 255, 255, .4)', 'rgba(255, 255, 255, .4)'],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View
        style={[
          styles.header,
          {height: animatedHeaderHeight, backgroundColor: animatedHeaderColor},
        ]}>
        {thumbnails?.agri_files[0]?.file_path ? (
          <Image
            style={[styles.FlatListItemImg]}
            source={{uri: thumbnails?.agri_files[0]?.file_path}}
          />
        ) : (
          <Image
            style={[styles.FlatListItemImg]}
            source={require('../../Common/images/apple.png')}
          />
        )}

        <View style={styles.textOverlay}>
          <Text
            style={[styles.title, styles.bannerTitle, {color: '#001c00ff'}]}>
            {thumbnails.label}
          </Text>
        </View>
      </Animated.View>
    );
  };
  return (
    <FarmerDrawerScreenWrapper1>
      <CustomHeader
        HandlerGoBack={() => HandlerGoBack('PackageOfPractices', '')}
        banner={true}
      />

      <DynamicHeader value={scrollOffsetY} />
      {popResAll[0]?.agri_crop_related?.description && (
        <DescriptionModel
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            width: '100%',
            paddingVertical: 10,
          }}
          description={popResAll[0]?.agri_crop_related?.description}
          setModalVisible={setModalVisible}
          modalVisible={modalVisible}
        />
      )}
      <ScrollView
        scrollEventThrottle={0}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollOffsetY}}}],
          {useNativeDriver: false},
        )}
        style={{marginBottom: 20, backgroundColor: 'white'}}>
        {popResAll[0]?.agri_crop_related?.description &&
          popResAll[0]?.agri_crop_related?.description != 'null' && (
            <TouchableOpacity
              style={[styles.description]}
              onPress={() => setModalVisible(true)}>
              <Text style={styles.title}>
                {popResAll[0].agri_crop_related.description.substring(0, 50)}
              </Text>
              <Text style={[styles.title, styles.readMore]}>
                {t('read_more')}
              </Text>
            </TouchableOpacity>
          )}
        {POPDetailsListArr.map((data, index) => {
          const {menu_name, agri_files, sf_st_menu_id, fid} = data;
          return (
            <TouchableOpacity
              key={index}
              style={styles.listItem}
              onPress={() =>
                onPressPackageItemDetails(crop_id, fid, menu_name)
              }>
              {agri_files[0] ? (
                <Image
                  style={{width: 50, height: 50, borderRadius: 8}}
                  source={{uri: agri_files[0]?.file_path}}
                />
              ) : (
                <Image
                  style={{width: 50, height: 50, borderRadius: 8}}
                  source={require('../../Common/images/common_icon.png')}
                />
              )}
              <Text style={[styles.title, {marginLeft: 20}]}>{menu_name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </FarmerDrawerScreenWrapper1>
  );
};

export default PackageOfPracticesDetails;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    right: 0,
  },
  title: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  card: {
    height: 100,
    backgroundColor: '#E6DDC4',
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  subtitle: {
    color: '#181D31',
    fontWeight: 'bold',
  },
  FlatListItemImg: {
    width: '100%',
    height: '100%',
    // resizeMode: "contain",
    zIndex: 999,
    // flex: 1
  },
  textOverlay: {
    position: 'absolute',
    bottom: 95,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(244, 255, 244, 0.7)', // Light green with 70% opacity
    padding: 10,
    zIndex: 10000000,
    justifyContent: 'center',
    alignItems: 'center',
    top: 95, // Higher than the image
  },
  description: {
    marginTop: 30,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#000',
    marginHorizontal: '2.5%',
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 1,
  },
  readMore: {
    textAlign: 'right',
    color: 'blue',
  },
  bannerTitle: {
    position: 'absolute',
    zIndex: 9999999,
    // top: '60%',
    // width: '100%',
    // left: 50,
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: 'black',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // height: 75,
    backgroundColor: '#eefcffff',
    marginHorizontal: '4%',

    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: '2.5%',
  },
});
