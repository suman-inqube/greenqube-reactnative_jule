import React from 'react';
import {Toast, Popup} from '@sekizlipenguen/react-native-popup-confirm-toast';

export const showSuccessToast = (message: string,color:string) => {
  Toast.show({
    title: 'Success',
    text: message,
    // color: color,
  });
};

export const showErrorToast = (message: string) => {
  Toast.show({
    title: 'Error',
    text: message,
    // color: 'red',
  });
};

export const showInfoToast = (message: string) => {
  Toast.show({
    title: 'Info',
    text: message,
    // color: 'blue',
  });
};

export const showConfirmPopup = (
  title: string,
  message: string,
  onConfirm: () => void,
) => {
  Popup.show({
    type: 'confirm',
    title,
    textBody: message,
    buttonText: 'OK',
    confirmText: 'Cancel',
    // okButtonStyle: {backgroundColor: 'red'},
    callback: () => {
      onConfirm();
      Popup.hide();
    },
    cancelCallback: () => Popup.hide(),
  });
};
