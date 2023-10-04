import { StyleSheet, Image, View } from 'react-native'
import React from 'react'

const ImagePlaceHolder = ({ iwidth, iheight }) => {
  return (
      <View style={styles.circularContainer}>
          <Image source={require('./images/logo.png')} style={styles.image} />
      </View>
  )
}

export default ImagePlaceHolder

const styles = StyleSheet.create({
    circularContainer: {
        width: 150, // Adjust the container size as needed
        height: 150,
        borderRadius: 75, // Half of the width or height to create a circle
        overflow: 'hidden', // Clip the content to the circle
        borderWidth: 2,
    },
    image: {
        width: '100%', // Make the image cover the circular container
        height: '100%',
    },
})
