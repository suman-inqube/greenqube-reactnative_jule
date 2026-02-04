import {check, RESULTS, PERMISSIONS, request} from 'react-native-permissions';
import {Platform} from 'react-native';

const ACCESS_FINE_LOCATION = {
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
};

const PLATFORM_MICROPHONE_PERMISSION = {
  ios: PERMISSIONS.IOS.MICROPHONE,
  android: PERMISSIONS.ANDROID.RECORD_AUDIO,
};

const POST_NOTIFICATIONS = {
  ios: PERMISSIONS.IOS.POST_NOTIFICATIONS,
  android: PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
};

const PLATFORM_CAMERA_PERMISSION = {
  ios: PERMISSIONS.IOS.CAMERA,
  android: PERMISSIONS.ANDROID.CAMERA,
};

const REQUEST_PERMISSIONS_TYPE = {
  fineLocation: ACCESS_FINE_LOCATION,
  microphone: PLATFORM_MICROPHONE_PERMISSION,
  notifications: POST_NOTIFICATIONS,
  camera: PLATFORM_CAMERA_PERMISSION,
};

const PERMISSIONS_TYPE = {
  fineLocation: 'fineLocation',
  microphone: 'microphone',
  notifications: 'notifications',
  camera: 'camera',
};

class AppPermission {
  checkPermission = async type => {
    const permissions = REQUEST_PERMISSIONS_TYPE[type][Platform.OS];
    if (!permissions) return true;

    try {
      const result = await check(permissions);
      if (result === RESULTS.GRANTED) return true;
      return this.requestPermission(permissions);
    } catch {
      return false;
    }
  };

  requestPermission = async permissions => {
    try {
      const result = await request(permissions);
      return result === RESULTS.GRANTED;
    } catch {
      return false;
    }
  };

  requestMultiple = async types => {
    const results = [];
    for (const type of types) {
      const permission = REQUEST_PERMISSIONS_TYPE[type][Platform.OS];
      if (permission) {
        const result = await this.requestPermission(permission);
        results.push(result);
      }
    }
    return results.every(Boolean);
  };
}

const Permission = new AppPermission();
export {Permission, PERMISSIONS_TYPE};
