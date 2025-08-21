import React from 'react';
import { Modal, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SoundRecord = ({
  modalVisibleRecord,
  setModalVisibleRecord,
  onStopRecordFirstItem,
  onStartRecordFirstItem,
  soundRecord,
}) => {
  const handleClose = () => {
    onStopRecordFirstItem();
    setModalVisibleRecord(false);
  };

  const handleToggleRecord = () => {
    if (soundRecord.isLoggingIn) {
      onStopRecordFirstItem();
      setModalVisibleRecord(false);
    } else {
      onStartRecordFirstItem();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={modalVisibleRecord}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalHeading}>Audio Record</Text>

          {soundRecord.isLoggingIn && (
            <Image
              source={require('../Common/images/audio-wave.gif')}
              style={styles.waveImage}
            />
          )}

          <Text style={styles.timerText}>{soundRecord.recordTime}</Text>

          <TouchableOpacity onPress={handleToggleRecord}>
            <Image
              source={
                soundRecord.isLoggingIn
                  ? require('../Common/images/stop.png')
                  : require('../Common/images/start.png')
              }
              style={styles.actionIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SoundRecord;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  modalHeading: {
    color: '#000',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 10,
  },
  waveImage: {
    width: 100,
    height: 80,
    marginVertical: 10,
  },
  timerText: {
    color: '#333',
    fontSize: 16,
    marginVertical: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    marginTop: 10,
  },
});
