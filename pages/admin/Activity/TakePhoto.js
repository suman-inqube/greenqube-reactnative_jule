import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/Feather' // for camera icon

const TakePhoto = ({ openImagePicker, selectedImage, title }) => {
  const images = [
    { key: 'firstItem', uri: selectedImage.firstItem },
    { key: 'secondItem', uri: selectedImage.secondItem },
    { key: 'thirdItem', uri: selectedImage.thirdItem }
  ]

  return (
    <>
      <Text style={styles.title}>{title || 'Photos'}</Text>
      <View style={styles.container}>
        {images.map((img, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => openImagePicker(img.key)}
            activeOpacity={0.7}
          >
            {img.uri ? (
              <Image
                source={{ uri: img.uri }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholder}>
                <Icon name="camera" size={28} color="#9ca3af" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </>
  )
}

export default TakePhoto

const styles = StyleSheet.create({
  title: {
    color: '#111827',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10
  },
  item: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    width: '100%',
    height: '100%'
  }
})
