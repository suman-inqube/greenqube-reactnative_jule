import React, {useEffect, lazy} from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
const ImageForm = lazy(() => import('../Common/ImageForm'));
import {useNavigation} from '@react-navigation/native';
const CustomHeader = ({
  path,
  HandlerGoBack,
  banner,
  logoImage,
  topBanner,
  show,
}) => {
  const navigation = useNavigation();
  const openDrawer = () => {
    navigation.openDrawer();
  };
  useEffect(() => {
    navigation.closeDrawer();
  }, []);
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={'#478541'} />
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
              source={require('../Common/images/logo.png')}
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
              // flex: 1,
              // paddingVertical: 30,
              overflow: 'hidden',
            }}>
            {logoImage ? (
              <ImageForm
                source={{uri: logoImage}}
                resizeMode="contain"
                // resizeMode='cover'
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
      <View>
        {show == true && banner != true && (
          <>
            {topBanner != undefined || topBanner != null ? (
              <ImageForm
                source={{uri: topBanner}}
                resizeMode="cover"
                height={200}
                width={'100%'}
              />
            ) : (
              <Image
                source={require('../Common/images/dashboard.jpeg')}
                style={{width: '100%', height: 200}}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default CustomHeader;
const styles = StyleSheet.create({
  mainContainer: {
    // borderBottomWidth: 2,
    // marginTop:StatusBar.currentHeight,
    backgroundColor: '#478541',
    // marginTop: 30,
  },
  androidContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    // paddingVertical: 3
  },
  iosContainer: {
    marginTop: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    // paddingVertical: 3
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    justifyContent: 'center',
  },
  image: {
    width: 200,
    // width: width * 100,
    height: 200,
  },
});
