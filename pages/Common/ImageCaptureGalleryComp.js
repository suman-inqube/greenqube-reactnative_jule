import React, {memo, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SPSheet} from '@sekizlipenguen/react-native-popup-confirm-toast';
import {Colors, Fonts} from '../utils/Constants';

const ImageCaptureGalleryComp = ({
  stateValue,
  setStateValue,
  title,
  status_level,
}) => {
  // 🔧 Resize image
  const resizeImage = async uri => {
    try {
      const resized = await ImageResizer.createResizedImage(
        uri,
        1200,
        1600,
        'JPEG',
        85,
      );
      return resized.uri;
    } catch (e) {
      return uri;
    }
  };

  // 🔍 Validate + save image
  const handleImage = async (asset, index) => {
    if (!asset?.uri) return;

    if (!['image/jpeg', 'image/jpg'].includes(asset.type)) {
      Alert.alert('Invalid File', 'Only JPG / JPEG images are allowed');
      return;
    }

    const resizedUri = await resizeImage(asset.uri);
    const values = [...stateValue];

    values[index] = {
      ...values[index],
      uri: resizedUri,
      name: asset.fileName || `image_${Date.now()}.jpg`,
      fileName: asset.fileName || `image_${Date.now()}.jpg`,
      type: asset.type,
      id: '',
      value: '1',
    };

    setStateValue(values);
  };

  // 📷 Camera
  const captureFromCamera = async index => {
    const result = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      saveToPhotos: true,
      quality: 0.9,
    });

    if (result.didCancel || !result.assets?.length) return;
    handleImage(result.assets[0], index);
  };

  // 🖼️ Gallery
  const pickFromGallery = async index => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.9,
    });

    if (result.didCancel || !result.assets?.length) return;
    handleImage(result.assets[0], index);
  };

  // ❌ Remove image
  const removeImage = index => {
    if (status_level === 'APPROVED') return;

    const values = [...stateValue];
    values[index] = {uri: '', name: '', type: '', fileName: '', id: ''};
    setStateValue(values);
  };

  // 📋 Bottom Sheet
  const ActionSheet = ({index, spSheet}) => (
    <>
      <Text style={styles.sheetTitle}>Attach Image</Text>
      <View style={styles.sheetRow}>
        <ActionButton
          label="Camera"
          icon={require('../Common/images/gallery.png')}
          onPress={() => {
            captureFromCamera(index);
            spSheet.hide();
          }}
        />
        <ActionButton
          label="Gallery"
          icon={require('../Common/images/gallery.png')}
          onPress={() => {
            pickFromGallery(index);
            spSheet.hide();
          }}
        />
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.grid}>
        {stateValue.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.box}
            onPress={() =>
              SPSheet.show({
                component: () => (
                  <ActionSheet index={index} spSheet={SPSheet} />
                ),
                height: 200,
              })
            }>
            {item.uri ? (
              <Image source={{uri: item.uri}} style={styles.image} />
            ) : (
             <View style={styles.uploadIconCircle}>
                                             <MaterialIcons
                                               name="cloud-upload"
                                               size={24}
                                               color="#10b981"
                                             />
                                           </View>
            )}

            {item.uri && (
              <TouchableOpacity
                style={styles.delete}
                onPress={() => removeImage(index)}>
                <MaterialIcons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            )}

            <Text style={styles.fileName} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const ActionButton = ({label, icon, onPress}) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Image source={icon} style={styles.actionIcon} />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

export default memo(ImageCaptureGalleryComp);
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f1f1f1e0',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dotted',
    zIndex: 9999,
  },
  title: {
    fontSize: 14,
    marginBottom: 10,
    fontFamily: Fonts.Regular,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  box: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 15,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  placeholder: {
    width: 55,
    height: 55,
  },
  delete: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF5252',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 11,
    marginTop: 4,
    color: '#555',
    textAlign: 'center',
  },
  sheetTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: Fonts.SemiBold,
    marginBottom: 10,
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#DFE8EF',
    width: 80,
    height: 80,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: 32,
    height: 32,
    marginBottom: 5,
  },
  actionText: {
    fontSize: 12,
    fontFamily: Fonts.Regular,
  },
});
