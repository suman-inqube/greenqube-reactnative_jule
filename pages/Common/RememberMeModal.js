import React, {useState} from 'react';
import {Modal, View, Text, Button, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RememberMeModal = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleRememberMe = async remember => {
    if (remember) {
      await AsyncStorage.setItem('rememberMe', 'true'); // Store user preference
      console.log('User chose to remember credentials');
    } else {
      await AsyncStorage.removeItem('rememberMe'); // Remove stored credentials
      console.log('User chose NOT to remember credentials');
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Button title="Login" onPress={() => setModalVisible(true)} />

      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Remember Credentials?</Text>
            <Text>
              Would you like to save your login details for next time?
            </Text>

            <View style={styles.buttonRow}>
              <Button title="No" onPress={() => handleRememberMe(false)} />
              <Button title="Yes" onPress={() => handleRememberMe(true)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '100%',
  },
});

export default RememberMeModal;
