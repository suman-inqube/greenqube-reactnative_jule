import React, { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import FusedLocation from 'react-native-fused-location';
import store from '../redux/store';
import { updateLocation } from '../redux/actions/locationActions';
import { setItem } from '../../config/getDataFromStorage';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';

const ForegroundLocationService = () => {
    useEffect(() => {
        let gpsCheckInterval;

        const checkGPSStatus = async () => {
            if (Platform.OS === 'android') {
                try {
                    const result = await promptForEnableLocationIfNeeded({
                        interval: 10000,
                        fastInterval: 5000,
                    });

                    // console.log('GPS Check Result:', result);
                    if (result === 'enabled' || result === 'already-enabled') {
                        startLocationUpdates();
                    }
                } catch (error) {
                    console.log('GPS not enabled:', error.message);
                    Alert.alert(
                        'Enable GPS',
                        'Location features will not work unless GPS is enabled.',
                    );
                }
            } else {
                // iOS - Permissions handling
                const result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                if (result === RESULTS.GRANTED) {
                    startLocationUpdates();
                }
            }
        };

        const startLocationUpdates = async () => {
            try {
                await FusedLocation.setLocationPriority(FusedLocation.Constants.HIGH_ACCURACY);
                await FusedLocation.setLocationInterval(1000);
                await FusedLocation.setFastestLocationInterval(1000);
                await FusedLocation.startLocationUpdates();

                FusedLocation.on('fusedLocation', async (location) => {
                    await setItem('fusedLocation', location);
                    store.dispatch(updateLocation(location));
                });
            } catch (error) {
                console.log('Error starting location updates:', error);
            }
        };

        const stopLocationUpdates = () => {
            FusedLocation.stopLocationUpdates();
            FusedLocation.off();
        };

        checkGPSStatus(); // Check initially
        gpsCheckInterval = setInterval(checkGPSStatus, 10000); // Check every 10 seconds

        return () => {
            clearInterval(gpsCheckInterval);
            stopLocationUpdates();
        };
    }, []);

    return null;
};

export default ForegroundLocationService;
