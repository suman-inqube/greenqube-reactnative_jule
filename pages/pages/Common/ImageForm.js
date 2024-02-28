import {Image} from 'react-native';
import React from 'react';

const ImageForm = ({ source, width, height, resizeMode }) => {
  return (
    <Image
      source={source}
      style={{ width, height, resizeMode }}
    />
  );
};

export default ImageForm;
