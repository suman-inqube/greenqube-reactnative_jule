import BackgroundService from 'react-native-background-actions';
import FusedLocation from 'react-native-fused-location';
import {Linking, Alert, AppState} from 'react-native';
import {useState, useEffect} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {getItem, removeItem} from '../../config/getDataFromStorage';
import DeviceInfo from '../DeviceInfo';

const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));

const BackGroundLocation = () => {
  const {netConnection} = DeviceInfo();
  const [appState, setAppState] = useState(AppState.currentState);
  const isFocused = useIsFocused();

  useEffect(() => {
    offlineApiCall();

    const handleAppStateChange = nextAppState => {
      console.log('App State Changed To:', nextAppState);
      setAppState(nextAppState);

      if (nextAppState === 'active') {
        startBackgroundLocation(); // Start when app is active
      } else {
        stopBackgroundLocation(); // Stop when app goes to background
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    startBackgroundLocation(); // Start on mount

    return () => {
      subscription.remove();
      stopBackgroundLocation(); // Stop on unmount
    };
  }, [isFocused, netConnection]);

  const startBackgroundLocation = async () => {
    if (!BackgroundService.isRunning()) {
      try {
        await BackgroundService.start(veryIntensiveTask, options);
        console.log('Background location started');
      } catch (error) {
        console.error('Failed to start background location:', error);
      }
    }
  };

  const stopBackgroundLocation = async () => {
    if (BackgroundService.isRunning()) {
      try {
        await BackgroundService.stop();
        console.log('Background location stopped');
      } catch (error) {
        console.error('Failed to stop background location:', error);
      }
    }
  };

  const options = {
    taskName: 'GPS',
    taskTitle: 'GPS Tracking',
    taskDesc: 'Running background GPS tracking',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    parameters: {
      delay: 4000,
    },
    indeterminate: false,
  };

  const veryIntensiveTask = async taskDataArguments => {
    const {delay} = taskDataArguments;
    await new Promise(async resolve => {
      while (BackgroundService.isRunning()) {
        try {
          const location = await FusedLocation.getFusedLocation();
          console.log('Background location:', location);
        } catch (error) {
          console.error('Error getting background location:', error);
        }
        await sleep(delay);
      }
    });
  };

  const offlineApiCall = async () => {
    // Your existing offline sync logic remains here as is
  };
};

export default BackGroundLocation;
