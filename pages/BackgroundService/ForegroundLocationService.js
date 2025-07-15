import React, { useEffect, useRef } from 'react';
import FusedLocation from 'react-native-fused-location';
import { setItem } from '../../config/getDataFromStorage';
import store from '../redux/store';
import { updateLocation } from '../redux/actions/locationActions';

const ForegroundLocationService = () => {
    const subscriptionRef = useRef(null);
    const lastSavedTimeRef = useRef(0); // for debouncing

    useEffect(() => {
        const startLocationUpdates = async () => {
            try {
                await FusedLocation.getFusedLocation();
                FusedLocation.setLocationPriority(FusedLocation.Constants.HIGH_ACCURACY);
                FusedLocation.setLocationInterval(3000);
                FusedLocation.setFastestLocationInterval(2000);
                await FusedLocation.startLocationUpdates();
                const sub = FusedLocation.on('fusedLocation', async (location) => {
                    const now = Date.now();
                    const lastSaved = lastSavedTimeRef.current;
                    if (now - lastSaved > 10_000) {
                        lastSavedTimeRef.current = now;
                        await setItem('fusedLocation', location);
                    }
                });
                subscriptionRef.current = sub;
            } catch (error) {
                console.error('[ForegroundLocationService] Location start error:', error);
            }
        };
        const timeout = setTimeout(startLocationUpdates, 1000); // Delay start by 1 second
        return () => {
            clearTimeout(timeout);
            if (subscriptionRef.current && typeof subscriptionRef.current.remove === 'function') {
                subscriptionRef.current.remove();
                subscriptionRef.current = null;
                console.log('[ForegroundLocationService] Subscription removed');
            }
            FusedLocation.stopLocationUpdates();
            console.log('[ForegroundLocationService] Location updates stopped');
        };
    }, []);

    return null; // No UI rendering needed
};

export default ForegroundLocationService;
