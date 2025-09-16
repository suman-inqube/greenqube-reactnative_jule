import {StyleSheet, Image, View} from 'react-native';
import React from 'react';

const ImagePlaceHolderCircleWithoutAddButton = ({imageurl, style}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Placeholder Image */}
      <Image source={imageurl} style={styles.image} />
    </View>
  );
};

export default ImagePlaceHolderCircleWithoutAddButton;

const styles = StyleSheet.create({
  container: {
    width: 80, // Adjust the container size as needed
    height: 80,
    position: 'relative', // Required for absolute positioning
    // borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
    borderRadius: 75, // Half of the width or height to create a circle
  },
});
