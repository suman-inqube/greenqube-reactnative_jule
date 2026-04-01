import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Colors} from '../pages/utils/Constants';

const PipeDetailsCard = ({pipeDetails, pipeEdit, TakePhotoFailed}) => {
  return (
    <View style={{marginTop: 10}}>
      {pipeDetails.map((_data, _index) => (
        <View key={_index} style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.pipeName}>{_data[0].pipe_name}</Text>
            <TouchableOpacity onPress={() => pipeEdit(_index)}>
              <Ionicons name="close-circle" size={24} color="#fd0303ff" />
            </TouchableOpacity>
          </View>

          {/* Images Section */}
          <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
            {_data[1]?.map((img, imgIndex) => (
              <TouchableOpacity
                key={imgIndex}
                style={styles.imageWrapper}
                onPress={() =>
                  img.status !== '' && TakePhotoFailed(_index, imgIndex)
                }>
                <Image source={{uri: img.imageURL}} style={styles.image} />
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name={
                      img.status === '' ? 'checkmark-circle' : 'close-circle'
                    }
                    size={22}
                    color={img.status === '' ? '#59e62eff' : '#fd0303ff'}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

export default PipeDetailsCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    padding: 12,
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowOffset: { width: 0, height: 3 },
    // shadowRadius: 6,
    // elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 6,
    marginBottom: 10,
  },
  pipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  image: {
    height: 90,
    width: 90,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  iconWrapper: {
    position: 'absolute',
    top: 5,
    right: 5,
    // backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 50,
    padding: 2,
  },
});
