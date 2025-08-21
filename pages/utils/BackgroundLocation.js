import Geolocation from "@react-native-community/geolocation";
import { AppState, Platform } from "react-native";
let watchId = null;
let listeners = [];
let appStateSub = null;
const HIGH_ACCURACY_CONFIG = {
  enableHighAccuracy: true,   // GPS mode
  distanceFilter: 0,          // report every movement
  interval: 2000,             // Android: request update every 2s
  fastestInterval: 2000,      // Android: deliver as fast as 2s
  timeout: 30000,             // error if no fix in 30s
  maximumAge: 0,              // no cache
  showsBackgroundLocationIndicator: true, // iOS blue bar
};
const LOW_POWER_CONFIG = {
  enableHighAccuracy: false,  // use WiFi/cell
  distanceFilter: 50,         // update only after 50m move
  interval: 15000,            // every 15s (Android)
  fastestInterval: 10000,
  timeout: 60000,
  maximumAge: 10000,          // allow cached location
};

const BackgroundLocation = {
  start: (options = {}) => {
    if (watchId) return; // avoid multiple watchers

    // Start in high accuracy (foreground mode)
    watchId = Geolocation.watchPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        listeners.forEach(cb => cb({ latitude, longitude, accuracy }));
      },
      err => console.log("Location error:", err),
      { ...HIGH_ACCURACY_CONFIG, ...options }
    );

    // Handle app state change (foreground ↔ background)
    appStateSub = AppState.addEventListener("change", state => {
      if (state === "active") {
        console.log("App Foreground → High Accuracy ✅");
        BackgroundLocation.restart(HIGH_ACCURACY_CONFIG);
      } else {
        console.log("App Background → Low Power 🔋");
        BackgroundLocation.restart(LOW_POWER_CONFIG);
      }
    });
  },
  restart: (config) => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      watchId = null;
    }
    watchId = Geolocation.watchPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        listeners.forEach(cb => cb({ latitude, longitude, accuracy }));
      },
      err => console.log("Location error:", err),
      config
    );
  },
  stop: () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      watchId = null;
    }
    if (appStateSub) {
      appStateSub.remove();
      appStateSub = null;
    }
  },
  subscribe: (cb) => {
    listeners.push(cb);
    return () => {
      listeners = listeners.filter(l => l !== cb);
    };
  },
};

export default BackgroundLocation;
