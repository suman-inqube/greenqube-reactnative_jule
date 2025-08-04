import React, {useEffect, useState} from 'react';
import {
  TouchableOpacity,
  Image,
  Text,
  View,
  StyleSheet,
  StatusBar,
  BackHandler,
  Alert,
} from 'react-native';
import {getItem} from '../../config/getDataFromStorage';
import ImageForm from '../Common/ImageForm';
import {ImageBackground} from 'react-native';
import {
  useRoute,
  useFocusEffect,
  useNavigation,
  useIsFocused,
  useNavigationState,
} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useDrawerStatus} from '@react-navigation/drawer';
import {Colors, Fonts} from '../utils/Constants';

const CustomHeaderCopy = ({path, HandlerGoBack, banner}) => {
  const drawerStatus = useDrawerStatus(); // 'open' or 'closed'

  // const routesLength = useNavigationState(state => state.routes.length);
  // const state = useNavigationState(state => state);
  const {t} = useTranslation();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [logoImage, setlogoImage] = useState('');
  const [topBanner, settopBanner] = useState('');
  const openDrawer = () => {
    navigation.openDrawer();
  };
  const onPageLoad = async () => {
    const [logoImageData, topBannerData] = await Promise.all([
      getItem('logoImageData'),
      getItem('topBannerData'),
    ]);
    setlogoImage(logoImageData);
    settopBanner(topBannerData);
  };

  useEffect(() => {
    onPageLoad();
    navigation.closeDrawer();
  }, []);
  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle={drawerStatus === 'open' ? 'light-content' : 'light-content'}
        backgroundColor={drawerStatus === 'open' ? Colors.drawer : '#478541'}
      />
      <View
        style={
          Platform.OS === 'android'
            ? styles.androidContainer
            : styles.iosContainer
        }>
        <View style={styles.rightContainer}>
          <TouchableOpacity onPress={() => HandlerGoBack()}>
            <Image
              source={require('../Common/images/back.png')}
              resizeMode="contain"
              style={{width: 30, height: 25, tintColor: 'white'}}
            />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              marginLeft: 10,
            }}>
            <Image
              source={require('../Common/images/greenqube_logo.png')}
              style={{width: 80, height: 40}}
              resizeMode="contain"
            />
          </View>
        </View>
        <TouchableOpacity onPress={openDrawer}>
          <View
            style={{
              flexDirection: 'row',
              marginRight: 10,
              alignItems: 'center',
              overflow: 'hidden',
            }}>
            {logoImage ? (
              <ImageForm
                source={{uri: logoImage}}
                resizeMode="contain"
                height={50}
                width={50}
                borderRadius={50}
              />
            ) : (
              ''
            )}
            <View
              style={{
                width: 32,
                backgroundColor: 'white',
                height: 32,
                borderRadius: 12,
                marginLeft: 10,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}>
              <Image
                source={require('../Common/images/4dot.png')}
                style={{width: 25, height: 25}}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* <View>
        {topBanner ? (
          <ImageForm
            source={{uri: topBanner}}
            resizeMode="cover"
            height={200}
            width={'100%'}
          />
        ) : (
          <ImageForm
            source={require('../Common/images/dashboard.jpeg')}
            resizeMode="cover"
            height={200}
            width={'100%'}
          />
        )}
      </View> */}
    </View>
  );
};

export default CustomHeaderCopy;
const styles = StyleSheet.create({
  mainContainer: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#478541',
  },

  androidContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 3,
    position: 'relative',
  },
  iosContainer: {
    marginTop: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 3,
    position: 'relative',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
});
