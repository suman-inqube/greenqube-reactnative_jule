import {StyleSheet, View, TouchableOpacity, Image, Text} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../utils/Constants';

const RecordComp = ({
  selectedRecord,
  setModalVisibleRecordFirstItem,
  setModalVisibleRecordSecoundItem,
  setModalVisibleRecordThirdItem,
  soundRecordFirstItem,
  soundRecordSecoundItem,
  soundRecordThirdItem,
  title,
  cancelRecord,
  soundPlay,
}) => {
  const items = [
    {
      key: 'firstItemRecord',
      modalSetter: setModalVisibleRecordFirstItem,
      sound: soundRecordFirstItem,
      cancelKey: 'firstItem',
    },
    {
      key: 'secondItemRecord',
      modalSetter: setModalVisibleRecordSecoundItem,
      sound: soundRecordSecoundItem,
      cancelKey: 'secoundItem',
    },
    {
      key: 'thirdItemRecord',
      modalSetter: setModalVisibleRecordThirdItem,
      sound: soundRecordThirdItem,
      cancelKey: 'thirdItem',
    },
  ];

  return (
    <>
      <Text style={styles.title}>{title || 'Recordings'}</Text>
      <View style={styles.container}>
        {items.map((item, idx) => {
          const hasFile = selectedRecord[item.key] !== '';
          const hasTempRecording =
            item.sound && item.sound.result !== '' && item.sound.result!="Already stopped";

          return (
            <TouchableOpacity
              key={idx}
              style={styles.item}
              onPress={() => item.modalSetter(true)}
              activeOpacity={0.7}>
              {hasFile ? (
                <TouchableOpacity
                  onPress={() => soundPlay(selectedRecord[item.key])}>
                  <Icon name="play-circle" size={48} color="#10b981" />
                </TouchableOpacity>
              ) : hasTempRecording ? (
                <View style={styles.tempWrapper}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => cancelRecord(item.cancelKey)}>
                    <Icon name="x-circle" size={22} color="#ef4444" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => soundPlay(item.cancelKey)}>
                    <Icon name="play-circle" size={48} color={Colors.green} />
                  </TouchableOpacity>
                </View>
              ) : (
                <Icon name="mic" size={36} color="#9ca3af" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
};

export default RecordComp;

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    // flex: 1,
    marginBottom: 5,
    marginLeft: 15,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    margin: 2,
    // marginVertical: 10,
    borderRadius: 8,
    // borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 15,
    // marginHorizontal: '3%',
  },
  item: {
    width: '25%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 10,
  },
});
