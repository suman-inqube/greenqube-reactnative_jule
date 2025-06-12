// getCurrentLocation.js
import Geolocation from '@react-native-community/geolocation';

let lastCoords = null;

const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        // console.log('Current Position:', latitude, longitude); // Log current coordinates
        // console.log('Last Position:', lastCoords); // Log previous coordinates

        // Check if coordinates are changing (remove threshold for debugging)
        // if (!lastCoords || latitude !== lastCoords.latitude || longitude !== lastCoords.longitude) {
          lastCoords = { latitude, longitude }; // Store the current coordinates
          resolve({ latitude, longitude }); // Resolve with the new coordinates
        // } else {
        //   reject('No significant change in location');
        // }
      },
      error => reject(error.message),
      {
        enableHighAccuracy: true,
        distanceFilter: 2, // Force update even if distance doesn't change
        interval: 3000, // Update every 3 seconds
        fastestInterval: 2000, // Fastest update interval (2 seconds)
        forceRequestLocation: true, // Ensure fresh data on certain platforms
        showLocationDialog: true, // Show dialog to allow location access
        timeout:60000,
      }
    );
  });
};

export default getCurrentLocation;  // Default export
