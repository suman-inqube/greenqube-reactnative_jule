import { AlertMesg } from '../Common/ToastAlert';
import { Toast } from '@sekizlipenguen/react-native-popup-confirm-toast';

export const showAIValidationError = (response) => {
  const errorData = response?.data?.error?.errorMessage;
  if (!errorData) {
    Toast.show({
      ...AlertMesg[0],
      time: 4,
      text: 'Unknown error occurred.',
    });
    return;
  }

  let toastMessage =
    typeof errorData === 'string'
      ? errorData
      : typeof errorData?.message === 'string'
        ? errorData.message
        : 'AI validation failed.';

  if (
    Array.isArray(errorData?.failed) &&
    errorData.failed.length > 0
  ) {
    const reasonTexts = errorData.failed
      .map((item) => {
        const reasons = Array.isArray(item?.reasons)
          ? item.reasons
          : [];

        const cleanReasons = reasons.map((reason) =>
          String(reason).replace(/image:.*/i, 'image')
        );

        return cleanReasons.join('\n');
      })
      .filter(Boolean)
      .join('\n\n');

    if (reasonTexts) {
      toastMessage += '\n\n• ' + reasonTexts;
    }
  }
  return toastMessage;
};