import {StyleSheet, Image, View} from 'react-native';
import React from 'react';

const Logo = ({iwidth, iheight}) => {
  return (
    <View style={styles.img}>
      <Image
        source={require('./images/logo.png')}
        style={{width: iwidth ?? 150, height: iheight ?? 150}}
      />
    </View>
  );
};

export default Logo;

const styles = StyleSheet.create({
  img: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
