import { StyleSheet, Image, View } from 'react-native'
import React from 'react'

const ImagePlaceHolderCircle = () => {
  return (
      <View style={styles.container}>
          {/* Placeholder Image */}
          <Image
              source={require('./images/avatar.png')} // Replace with your placeholder image source
              style={styles.image}
          />
          {/* Add Symbol */}
          <View style={styles.addSymbol}>
              <Image
                  source={require('./images/add.png')} // Replace with your "add" symbol source
                  style={styles.addSymbolImage}
              />
          </View>
      </View>
  )
}

export default ImagePlaceHolderCircle

const styles = StyleSheet.create({
    container: {
        width: 100, // Adjust the container size as needed
        height: 100,
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
        transform: [{ translateX: 25 }, { translateY: 5 }], // Adjust based on the symbol size
        width: 50, // Adjust the symbol size as needed
        height: 50,
    },
    addSymbolImage: {
        width: '70%',
        height: '70%',
    },
})
