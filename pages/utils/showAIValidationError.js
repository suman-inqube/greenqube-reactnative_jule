import { AlertMesg } from '../Common/ToastAlert';
import { Toast } from '@sekizlipenguen/react-native-popup-confirm-toast';

export const showAIValidationError = (response) => {
  const errorData = response?.data?.error?.errorMessage;

  if (!errorData) {
    Toast.show({
      text: 'Unknown error occurred.',
      ...AlertMesg[0],
    });
    return;
  }

  let toastMessage = errorData?.message || 'AI validation failed.';

  if (Array.isArray(errorData?.failed) && errorData.failed.length > 0) {
    const reasonTexts = errorData.failed
      .map(item => {
        // clean each reason → remove text after "image:"
        const cleanReasons = item.reasons.map(reason =>
          reason.replace(/image:.*/i, 'image')
        );
        return `${cleanReasons.join('\n ')}`;
      })
      .join('\n\n');

    toastMessage += '\n\n• ' + reasonTexts;
  }

  Toast.show({
    text: toastMessage,
    // timing: 14000,
    ...AlertMesg[0],
  });
};
