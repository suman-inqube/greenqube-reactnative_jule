import React from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
const MessageDialog = ({ title, message }) => {
  const { t } = useTranslation();
  const showAlert = () => {
    Alert.alert(
      // title,
      message || '',
      [{ text: `${t('ok')}` }],
    )
  };
  return (
    <>
      {showAlert()}
    </>
  )
}

export default MessageDialog
