import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { useCallback } from 'react';
import { getItem } from '../../config/getDataFromStorage';
const useSingleBackToNavigate = (targetRoute) => {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = async() => {
         const pagename = await getItem('pagename')
        navigation.navigate(pagename||targetRoute); // navigate to specific page
        return true; // block default back
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [navigation, targetRoute])
  );
};

export default useSingleBackToNavigate;
