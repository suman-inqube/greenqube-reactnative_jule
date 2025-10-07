import React from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
const HarvestedModel = ({setModalVisible, modalVisible, handleHarvested}) => {
  const {t} = useTranslation();
  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalHedingText}>
              {t('your_previous_crop_hervested')}
            </Text>
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                handleHarvested('same produce');
                setModalVisible(!modalVisible);
              }}>
              <Text style={styles.title}>{t('same_crop_continue')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                handleHarvested('add new Produce');
                setModalVisible(!modalVisible);
              }}>
              <Text style={styles.title}>{t('new_crop_continue')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HarvestedModel;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    // alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    paddingBottom: 25,
    // paddingHorizontal: 20
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#000',
  },
  modalHedingText: {
    color: '#000',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 10,
    marginBottom: 20,
  },
  item: {
    alignItems: 'center',
    backgroundColor: '#d8f3e0',
    marginVertical: 5,
    borderRadius: 30,
    height: 50,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    color: '#000',
    fontSize: 15,
  },
});
