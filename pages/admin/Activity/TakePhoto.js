import {StyleSheet, View, TouchableOpacity, Image, Text} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Feather'; // for camera icon
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../utils/Constants';

const TakePhoto = ({openImagePicker, selectedImage, title}) => {
  const images = [
    {key: 'firstItem', uri: selectedImage.firstItem},
    {key: 'secondItem', uri: selectedImage.secondItem},
    {key: 'thirdItem', uri: selectedImage.thirdItem},
  ];

  return (
    <>
      <Text style={styles.label}>{title || 'Photos'}</Text>
      <View style={styles.container}>
        {images.map((img, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => openImagePicker(img.key)}
            activeOpacity={0.7}>
            {img.uri ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{uri: img.uri}}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={styles.imageContainer}>
                <MaterialIcons
                  name="photo-camera"
                  size={40}
                  color={'#2a2a2a99'}
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

export default TakePhoto;

const styles = StyleSheet.create({
  title: {
    color: '#111827',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  container: {
    // backgroundColor: '#e3f4ffcf',
    // elevation: 3,
    // padding: 10,
    // margin: 2,
    // marginVertical: 10,
    borderRadius: 8,
    // borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    marginBottom: 10,
    // marginHorizontal: '4%',
    justifyContent:'space-between'
  },
  item: {
    width: '30%',
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    TouchableOpacityAlign: 'center',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 70,
    height: 80,
    borderRadius: 8,
  },
  imageContainer: {
    backgroundColor: 'white',
    padding: 10, // Adjust padding as needed
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 3, // For Android shadow
    borderWidth:1,
    borderColor:Colors.border,
    borderStyle:'dashed'
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    // flex: 1,
    marginBottom: 5,
    marginLeft: 15,
  },
});
