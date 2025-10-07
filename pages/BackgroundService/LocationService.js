// LocationService.js

import FusedLocation from 'react-native-fused-location';

let locationSubscription;

export const startBackgroundLocationUpdates = async () => {
    try {
        // Request location permissions
        const granted = await FusedLocation.requestPermissions({
            android: {
                background: true, // Request background location permission
            },
        });

        if (!granted) {
            console.log('Location permissions denied');
            return;
        }

        // Set location update interval to 1 second (1000 milliseconds)
        FusedLocation.setLocationInterval(1000);

        // Start receiving background location updates
        locationSubscription = FusedLocation.on('fusedLocation', location => {
            console.log('Received background location:', location);
            // Handle the received location data as needed
        });

        console.log('Background location updates started');
    } catch (error) {
        console.error('Error starting background location updates:', error);
    }
};

export const stopBackgroundLocationUpdates = () => {
    if (locationSubscription) {
        locationSubscription.remove();
        console.log('Background location updates stopped');
    }
};
