import React from 'react';
import FastImage from 'react-native-fast-image';
import { StyleSheet } from 'react-native';

const ImageForm = ({ source, width, height, resizeMode, borderRadius, style }) => {
  return (
    <FastImage
      source={typeof source === 'string' ? { uri: source } : source}
      style={[
        {
          width,
          height,
          borderRadius,
        },
        style, // merge external styles
      ]}
      resizeMode={
        resizeMode
          ? FastImage.resizeMode[resizeMode] // 'cover' | 'contain' | 'stretch' | 'center'
          : FastImage.resizeMode.cover
      }
    />
  );
};

export default ImageForm;
