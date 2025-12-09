import {StyleSheet, View, TouchableOpacity, Image, Text} from 'react-native';
import React, {memo} from 'react';
import {Fonts} from '../utils/Constants';

const TakePhotoPipe = ({openImagePicker, selectedImage, title, color}) => {
  return (
    <>
      <View style={styles.mainContainer}>
        <Text
          style={
            (styles.title,
            {
              color: color ?? 'black',
              fontSize: 15,
              fontFamily: 'Poppins-Regular',
            })
          }>
          {title ? title : 'Default'}
        </Text>
        <View style={styles.topImagesContainer}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => openImagePicker('firstItem')}>
            {selectedImage.firstItem == '' ? (
              <Image
                source={require('../Common/images/camera.jpeg')}
                style={{width: 40, height: 40, opacity: 0.7}}
              />
            ) : (
              <Image
                source={{uri: `${selectedImage.firstItem}`}}
                // style={styles.image}
                style={{
                  width: '100%',
                  height: 100,
                  borderRadius: 8,
                  borderWidth: 8,
                  borderColor: 'white',
                }}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() => openImagePicker('secondItem')}>
            {selectedImage.secondItem == '' ? (
              <Image
                source={require('../Common/images/camera.jpeg')}
                style={{width: 40, height: 40, opacity: 0.7, borderRadius: 8}}
              />
            ) : (
              <Image
                source={{uri: `${selectedImage.secondItem}`}}
                // style={styles.image}
                style={{
                  width: '100%',
                  height: 100,
                  borderRadius: 8,
                  borderWidth: 8,
                  borderColor: 'white',
                }}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
        <View
          style={{
            justifyContent: 'center',
            marginTop: 10,
            borderTopWidth: 1,
            borderStyle: 'dashed',
            borderColor: '#585858ff',
          }}>
          <Text
            style={
              (styles.title,
              {
                color: color ?? 'black',
                fontSize: 15,
                fontFamily: 'Poppins-Regular',
                marginTop: 10,
              })
            }>
            Farmer Image With Pipe
          </Text>
          <TouchableOpacity
            style={styles.bottomItem}
            onPress={() => openImagePicker('thirdItem')}>
            {selectedImage.thirdItem == '' ? (
              <Image
                source={require('../Common/images/camera.jpeg')}
                style={{width: 40, height: 40, opacity: 0.7, borderRadius: 8}}
              />
            ) : (
              <Image
                source={{uri: `${selectedImage.thirdItem}`}}
                // style={styles.image}
                style={{
                  width: '100%',
                  height: 100,
                  borderRadius: 8,
                  borderWidth: 8,
                  borderColor: 'white',
                }}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default memo(TakePhotoPipe);

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'column',
  },
  topImagesContainer: {
    flexDirection: 'row',
    paddingBottom: 10,
    gap: 15,
    marginTop: 10,
  },
  item: {
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomItem: {
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    // alignSelf: 'center',
    marginTop: 10,
  },
  title: {
    color: '#000',
    fontFamily: Fonts.Medium,
    fontSize: 16,
  },
});
