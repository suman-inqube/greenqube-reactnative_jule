import React from 'react';
import { Alert } from 'react-native';

const MessageDialog = ({ title, message }) => {
  const showAlert = () => {
    Alert.alert(
      title || 'Alert',
      message || ''
    )
  };
  return (
    <>
      {showAlert()}
    </>
  )
}

export default MessageDialog
