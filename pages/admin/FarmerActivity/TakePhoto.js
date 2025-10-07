import {StyleSheet, View, TouchableOpacity, Image, Text} from 'react-native';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../utils/Constants';

const TakePhoto = ({openImagePicker, selectedImage, title}) => {
  return (
    <>
      <Text style={styles.label}>{title ? title : 'Default'}</Text>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => openImagePicker('firstItem')}>
          {selectedImage.firstItem == '' ? (
            <MaterialIcons
              name="no-photography"
              size={40}
              color={'#6e6e6e99'}
            />
          ) : (
            // <Image
            //   source={require('../../Common/images/camera.jpeg')}
            //   style={{width: 70, height: 80}}
            // />
            <View style={styles.imageContainer}>
              <Image
                source={{uri: `${selectedImage.firstItem}`}}
                // style={styles.image}
                style={{width: 70, height: 80, borderRadius: 8}}
                resizeMode="contain"
              />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() => openImagePicker('secondItem')}>
          {selectedImage.secondItem == '' ? (
            <MaterialIcons
              name="no-photography"
              size={40}
              color={'#6e6e6e99'}
            />
          ) : (
            // <Image
            //   source={require('../../Common/images/camera.jpeg')}
            //   style={{width: 70, height: 80}}
            // />
            <View style={styles.imageContainer}>
              <Image
                source={{uri: `${selectedImage.secondItem}`}}
                // style={styles.image}
                style={{width: 70, height: 80, borderRadius: 8}}
                resizeMode="contain"
              />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() => openImagePicker('thirdItem')}>
          {selectedImage.thirdItem == '' ? (
            <MaterialIcons
              name="no-photography"
              size={40}
              color={'#6e6e6e99'}
            />
          ) : (
            // <Image
            //   source={require('../../Common/images/camera.jpeg')}
            //   style={{width: 70, height: 80}}
            // />
            <View style={styles.imageContainer}>
              <Image
                source={{uri: `${selectedImage.thirdItem}`}}
                // style={styles.image}
                style={{width: 70, height: 80, borderRadius: 8}}
                resizeMode="contain"
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

export default TakePhoto;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e3f4ffcf',
    // elevation: 3,
    padding: 10,
    margin: 2,
    // marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    marginBottom: 10,
  },
  item: {
    // backgroundColor: '#e9e9e9',
    width: '30%',
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    TouchableOpacityAlign: 'center',
  },
  imageContainer: {
    backgroundColor: 'white',
    padding: 5, // Adjust padding as needed
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  title: {
    paddingBottom: 10,
    color: '#000',
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
    // flex: 1,
    marginBottom: 5,
  },
});
