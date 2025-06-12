import { check, RESULTS, PERMISSIONS, request } from 'react-native-permissions';
import { Platform } from 'react-native'
const ACCESS_FINE_LOCATION = {
    ios: PERMISSIONS.IOS.ACCESS_FINE_LOCATION,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
}
const REQUEST_PERMISSIONS_TYPE = {
    fineLocation: ACCESS_FINE_LOCATION
}
const PERMISSIONS_TYPE = {
    fineLocation: 'fineLocation'
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
}

const Permission = new AppPermission();
export { Permission, PERMISSIONS_TYPE }