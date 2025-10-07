import {StyleSheet, View, TouchableOpacity, Image, Text} from 'react-native';
import React ,{memo}from 'react';
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
              <View>
                <Image
                  source={{uri: img.uri}}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View>
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

const styles = StyleSheet.create({
  title: {
    color: '#111827',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  container: {
   flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    margin: 2,
    // marginVertical: 10,
    borderRadius: 8,
    // borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 15,
    // marginHorizontal: '3%',
  },
  item: {
      width: '25%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 75,
    height: 80,
    borderRadius: 8,
  },
  imageContainer: {
    backgroundColor: 'white',
   
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 3, // For Android shadow
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
export default memo(TakePhoto);

