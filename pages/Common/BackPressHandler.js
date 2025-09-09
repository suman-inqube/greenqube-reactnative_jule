// onBackPress.js
import { BackHandler } from 'react-native';

const onBackPress = (callback) => {
  const subscription = BackHandler.addEventListener(
    'hardwareBackPress',
    callback
  );

  return () => subscription.remove(); // cleanup
};

export { onBackPress };
