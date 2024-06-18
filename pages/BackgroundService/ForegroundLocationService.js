import React, { useEffect, useState } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import FusedLocation from 'react-native-fused-location';
import store from '../redux/store';
import { updateLocation } from '../redux/actions/locationActions';
import { check, PERMISSIONS, RESULTS } from '@react-native-community/permissions';
import { setItem } from '../../config/getDataFromStorage'
const ForegroundLocationService = () => {
    const [fusedLocationData, setFusedLocationData] = useState("asada")
    useEffect(() => {
        const startLocationUpdates = async () => {
            try {
                FusedLocation.setLocationPriority(FusedLocation.Constants.HIGH_ACCURACY);
                // FusedLocation.setLocationPriority(FusedLocation.Constants.BALANCED);
                // FusedLocation.setLocationPriority(FusedLocation.Constants.LOW_POWER);
                // FusedLocation.setLocationPriority(FusedLocation.Constants.NO_POWER);
                FusedLocation.setLocationInterval(1000);
                FusedLocation.setFastestLocationInterval(1000);
                // FusedLocation.setSmallestDisplacement(1000);
                FusedLocation.startLocationUpdates();
                // const subscription = FusedLocation.on('fusedLocation', location => {
                //     // console.log(location)
                //     // setFusedLocationData(location)
                //     return location;
                //     store.dispatch(updateLocation(location));
                // });
                FusedLocation.on('fusedLocation', async (location) => {
                    // Inside the callback function, you can await asynchronous operations
                    // store.dispatch(updateLocation(location));
                    await setItem('fusedLocation', location);
                });


                return () => {
                    FusedLocation.stopLocationUpdates();
                    subscription.remove();
                };
            } catch (error) {
                setFusedLocationData(error)
                // console.log(error)
            }
        };
        startLocationUpdates();
    }, []);
    // return null; // This component doesn't render anything
    // return null
    // return { fusedLocationData };

};
export default ForegroundLocationService;
