import {StyleSheet, Image, View, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ImagePlaceHolderCircle = ({openImagePicker, selectedImage}) => {
  let type = '';
  let imageUrl = null;
  if (selectedImage != null) {
    type = selectedImage.split(';')[0].split('/')[1];
    if (type == '9j') {
      imageUrl = `data:image/jpeg;base64,${selectedImage}`;
    } else {
      imageUrl = selectedImage;
    }
  }
  return (
    <TouchableOpacity style={styles.container} onPress={openImagePicker}>
      {/* Placeholder Image */}

      {selectedImage ? (
        <Image
          source={{uri: imageUrl}}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <Image
          source={require('./images/avatar.png')} // Replace with your placeholder image source
          style={styles.image}
        />
      )}
      {/* Add Symbol */}
      <View style={styles.addSymbol}>
        {/* <Image
          source={require('./images/add.png')} // Replace with your "add" symbol source
          style={styles.addSymbolImage}
        /> */}
        <MaterialIcons name={'add-a-photo'} size={28} color="#110969" />
      </View>
    </TouchableOpacity>
  );
};

export default ImagePlaceHolderCircle;
const styles = StyleSheet.create({
  container: {
    width: 120, // Adjust the container size as needed
    height: 120,
    position: 'relative', // Required for absolute positioning
    // borderWidth: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 75, // Half of the width or height to create a circle
  },
  addSymbol: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: 25}, {translateY: 5}], // Adjust based on the symbol size
    width: 50, // Adjust the symbol size as needed
    height: 50,
  },
  addSymbolImage: {
    width: '70%',
    height: '70%',
  },
  addSymbol: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 5,
  },
});
