import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/Feather'

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
  soundPlay
}) => {
  const items = [
    {
      key: 'firstItemRecord',
      modalSetter: setModalVisibleRecordFirstItem,
      sound: soundRecordFirstItem,
      cancelKey: 'firstItem'
    },
    {
      key: 'secondItemRecord',
      modalSetter: setModalVisibleRecordSecoundItem,
      sound: soundRecordSecoundItem,
      cancelKey: 'secoundItem'
    },
    {
      key: 'thirdItemRecord',
      modalSetter: setModalVisibleRecordThirdItem,
      sound: soundRecordThirdItem,
      cancelKey: 'thirdItem'
    }
  ]

  return (
    <>
      <Text style={styles.title}>{title || 'Recordings'}</Text>
      <View style={styles.container}>
        {items.map((item, idx) => {
          const hasFile = selectedRecord[item.key] !== ''
          const hasTempRecording =
            item.sound && item.sound.result !== '' && !item.sound.isLoggingIn

          return (
            <TouchableOpacity
              key={idx}
              style={styles.item}
              onPress={() => item.modalSetter(true)}
              activeOpacity={0.7}
            >
              {hasFile ? (
                <TouchableOpacity onPress={() => soundPlay(selectedRecord[item.key])}>
                  <Icon name="play-circle" size={48} color="#10b981" />
                </TouchableOpacity>
              ) : hasTempRecording ? (
                <View style={styles.tempWrapper}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => cancelRecord(item.cancelKey)}
                  >
                    <Icon name="x-circle" size={22} color="#ef4444" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => soundPlay(item.cancelKey)}>
                    <Icon name="play-circle" size={48} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              ) : (
                <Icon name="mic" size={36} color="#9ca3af" />
              )}
            </TouchableOpacity>
          )
        })}
      </View>
    </>
  )
}

export default RecordComp

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
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tempWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 10
  }
})
