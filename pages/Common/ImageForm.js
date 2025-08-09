import {Image, StyleSheet} from 'react-native';
import React from 'react';

const ImageForm = ({source, width, height, resizeMode, borderRadius}) => {
  return (
    <Image source={source} style={{width, height, resizeMode, borderRadius}} />
  );
};

export default ImageForm;
