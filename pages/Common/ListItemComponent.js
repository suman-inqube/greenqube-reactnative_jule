import React, { useEffect, memo } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View, Easing } from 'react-native';
import moment from 'moment';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const ListItemComponent = ({ item, onPress, getAnimationValue, noticeList }) => {
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
  // item.fid,noticeList
  const imageFile = item.agri_files?.find(f => f.term_type === 'gen_info_img');
  const imageUri = imageFile?.file_path || null;

  const scale = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });

  const opacity = animVal;

  return (
    <AnimatedTouchableOpacity
      onPress={() => onPress(item.fid)}
      style={[styles.listItem, { transform: [{ scale }] }]}
      activeOpacity={0.7}
    >
      <View style={styles.listImageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.listImage} />
        ) : (
          <Image
            source={require('./images/greenqube_logo.png')}
            style={styles.listImage}
          />
        )}
      </View>

      <View style={styles.listContent}>
        <Text style={styles.listTitle} numberOfLines={1}>
          {item.post_name || 'No Title'}
        </Text>
        <Text style={styles.listDate}>
          {moment(item.updated_at).utc().format('YYYY-MM-DD')}
        </Text>
        {/* <Text style={styles.readMoreText}>Read More</Text> */}
      </View>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listImageContainer: {
    marginRight: 16,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  listDate: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
  },
  readMoreText: {
    fontSize: 14,
    color: '#18a7d7',
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
});

export default memo(ListItemComponent);
