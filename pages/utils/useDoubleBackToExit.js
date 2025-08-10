import { useFocusEffect } from '@react-navigation/native';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import { useRef ,useCallback} from 'react';

const useDoubleBackToExit = () => {
  const backPressCount = useRef(0);
  const timerRef = useRef(null);
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (backPressCount.current === 0) {
          backPressCount.current = 1;
          if (Platform.OS === 'android') {
            ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
          }
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          timerRef.current = setTimeout(() => {
            backPressCount.current = 0;
            timerRef.current = null;
          }, 2000);
          return true;
        }
        BackHandler.exitApp();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        subscription.remove();
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }, [])
  );
};
export default useDoubleBackToExit;
