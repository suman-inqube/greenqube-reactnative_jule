import { check, RESULTS, PERMISSIONS, request } from 'react-native-permissions';
import { Platform, PermissionsAndroid } from 'react-native'
const ACCESS_FINE_LOCATION = {
    ios: PERMISSIONS.IOS.ACCESS_FINE_LOCATION,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
}
const PLATFORM_MICROPHONE_PERMISSION = {
    ios: PERMISSIONS.IOS.MICROPHONE,
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
}
const POST_NOTIFICATIONS = {
    ios: PERMISSIONS.IOS.POST_NOTIFICATIONS,
    android: PERMISSIONS.ANDROID.POST_NOTIFICATIONS
}
const CAMERA_PERMISSION = {
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA
}
const READ_EXTERNAL_STORAGE_PERMISSION = {
    ios: PERMISSIONS.IOS.READ_EXTERNAL_STORAGE,
    android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
}


const REQUEST_PERMISSIONS_TYPE = {
    fineLocation: ACCESS_FINE_LOCATION,
    microphone: PLATFORM_MICROPHONE_PERMISSION,
    notifications: POST_NOTIFICATIONS,
    camera: CAMERA_PERMISSION,
    storage: READ_EXTERNAL_STORAGE_PERMISSION
}
const PERMISSIONS_TYPE = {
    fineLocation: 'fineLocation',
    microphone: 'microphone',
    notifications: 'notifications',
    camera: 'camera',
    storage: 'storage'
}
class AppPermission {
    checkPermission = async (type) => {
        const permissions = REQUEST_PERMISSIONS_TYPE[type][Platform.OS];
        if (!permissions) {
            return true;
        }
        try {
            const result = await check(permissions)
            if (result === RESULTS.GRANTED) return true;
            return this.requestPermission(permissions);
        } catch (error) {
            return false;
        }
    }
    requestPermission = async (permissions) => {
        try {
            const result = await request(permissions);
            return result === RESULTS.GRANTED
        } catch (error) {
            return false;
        }
    }
    requestMultiple = async (types) => {
        const results = [];
        for (const type of types) {
            const permission = REQUEST_PERMISSIONS_TYPE[type][Platform.OS]
            if (Permission) {
                const result = await this.requestPermission(permission);
                results.push(result);
            }
        }
        for (const result of results) {
            if (!result) {
                return false;
            }
        }
        return true;
    }
}

const Permission = new AppPermission();
export { Permission, PERMISSIONS_TYPE }