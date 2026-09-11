import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native';
import React, { memo, useCallback } from 'react';
import { Fonts } from '../utils/Constants';

const CAMERA_ICON = require('../Common/images/camera.jpeg');

const PhotoSlot = memo(({ itemKey, uri, label, showLabel, onPress }) => {
  const handlePress = useCallback(() => {
    onPress?.(itemKey);
  }, [onPress, itemKey]);

  return (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.7}
      onPress={handlePress}>
      {!uri ? (
        <Image
          source={CAMERA_ICON}
          style={styles.placeholderIcon}
          resizeMode="contain"
        />
      ) : (
        <Image
          source={{ uri }}
          style={styles.previewImage}
          resizeMode="contain"
        />
      )}
      {showLabel && !!label && (
        <Text style={styles.captionText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
});

const TakePhotoPipe = ({
  openImagePicker,
  selectedImage = {},
  title = 'Default',
  color,
  act_type,
}) => {
  const showSubLabels = act_type !== 'Pipe Installation';

  return (
    <>
      <Text style={[styles.title, color ? { color } : null]}>
        {title}
      </Text>
      <View style={styles.container}>
        <PhotoSlot
          itemKey="firstItem"
          uri={selectedImage?.firstItem}
          label="Pipe image with ruler"
          showLabel={showSubLabels}
          onPress={openImagePicker}
        />
        <PhotoSlot
          itemKey="secondItem"
          uri={selectedImage?.secondItem}
          label="Normal pipe image"
          showLabel={showSubLabels}
          onPress={openImagePicker}
        />
      </View>
    </>
  );
};

export default memo(TakePhotoPipe);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingBottom: 10,
    gap: 15,
    marginTop: 10,
  },
  item: {
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#000',
    fontFamily: Fonts.Medium,
    fontSize: 15,
  },
  placeholderIcon: {
    width: 40,
    height: 40,
    opacity: 0.7,
    borderRadius: 8,
  },
  previewImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    borderWidth: 8,
    borderColor: '#ffffff',
  },
  captionText: {
    color: '#666363',
    fontFamily: Fonts.Medium,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
