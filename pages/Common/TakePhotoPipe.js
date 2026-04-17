import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native';
import React, { memo } from 'react';
import { Fonts } from '../utils/Constants';

const TakePhotoPipe = ({ openImagePicker, selectedImage, title, color, act_type }) => {
  return (
    <>
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
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => openImagePicker('firstItem')}>
          {selectedImage.firstItem == '' ? (
            <Image
              source={require('../Common/images/camera.jpeg')}
              style={{ width: 40, height: 40, opacity: 0.7 }}
            />
          ) : (
            <Image
              source={{ uri: `${selectedImage.firstItem}` }}
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
          {
            act_type != "Pipe Installation" && <Text style={{
              color: '#666262',
              fontFamily: Fonts.Light,   fontSize: 12,
            }}>Pipe image width ruler</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() => openImagePicker('secondItem')}>
          {selectedImage.secondItem == '' ? (
            <Image
              source={require('../Common/images/camera.jpeg')}
              style={{ width: 40, height: 40, opacity: 0.7, borderRadius: 8 }}
            />
          ) : (
            <Image
              source={{ uri: `${selectedImage.secondItem}` }}
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
          {
            act_type != "Pipe Installation" && <Text style={{
               color: '#666262',
              fontFamily: Fonts.Light,
              fontSize: 12,
            }}>Normal pipe image</Text>
          }
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.item} onPress={() => openImagePicker("thirdItem")}>
                       {selectedImage.thirdItem == "" ? <Image
                           source={require('../Common/images/camera.jpeg')}
                           style={{ width: 70, height: 80,opacity: 0.7 }}
                       /> :
   
                           <Image
                               source={{ uri: `${selectedImage.thirdItem}` }}
                               // style={styles.image}
                               style={{ width: "100%", height: 100 }}
                               resizeMode="contain"
                           />}
                   </TouchableOpacity> */}
      </View>
    </>
  );
};

export default memo(TakePhotoPipe);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    paddingBottom: 10,
    gap: 15,
    marginTop: 10,
  },
  item: {
    // backgroundColor: '#e9e9e9',
    width: '40%',
    // paddingVertical: 10,
    // borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    TouchableOpacityAlign: 'center',
  },
  title: {
    color: '#000',
    fontFamily: Fonts.Medium,
    fontSize: 16,
  },
});
