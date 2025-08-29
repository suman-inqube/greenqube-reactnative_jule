import React, {useEffect} from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Easing,
} from 'react-native';
import moment from 'moment';
import { Colors } from '../utils/Constants';

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const GridItemComponent = ({item, onPress, getAnimationValue, noticeList}) => {
  const animVal = getAnimationValue(item.fid);
  useEffect(() => {
    animVal.setValue(0);
    Animated.timing(animVal, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [item.fid, noticeList]);

  const imageFile = item.agri_files?.find(f => f.term_type === 'gen_info_img');
  const imageUri = imageFile?.file_path || null;

  const scale = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  const opacity = animVal;

  return (
    <AnimatedTouchableOpacity
      onPress={() => onPress(item.fid)}
      style={[styles.gridItem, {transform: [{scale}]}]}
      activeOpacity={0.7}>
      <View style={styles.gridImageContainer}>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.gridImage} />
        ) : (
          <Image
            source={require('./images/greenqube_logo.png')}
            style={styles.gridImage}
          />
        )}
      </View>

      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={1}>
          {item.post_name || 'No Title'}
        </Text>
        {/* <Text style={styles.gridDate}>
          {moment(item.updated_at).utc().format('DD/MM/YYYY')}
        </Text> */}
      </View>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridItem: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    // flex: 1,
    marginHorizontal: '2.5%',
    marginBottom: 12,
    // elevation: 3,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    overflow: 'hidden',
    width: '45%',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  gridImageContainer: {
    width: '100%',
    height: 100,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  gridContent: {
    padding: 8,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  gridDate: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
});

export default React.memo(GridItemComponent);
