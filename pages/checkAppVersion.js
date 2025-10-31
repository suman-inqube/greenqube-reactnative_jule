import VersionCheck from 'react-native-version-check';
import { Alert, Linking } from 'react-native';
export const checkAppVersion = async () => {
    try {
        const latestVersion = await VersionCheck.getLatestVersion({ provider: 'playStore', packageName: 'com.inqube.greenqube', ignoreErrors: true });
        const currentVersion = VersionCheck.getCurrentVersion();
        console.error(latestVersion,currentVersion)
        if(!__DEV__) {
        if (latestVersion != currentVersion) {
            Alert.alert(
                'Update Required', 'A new version of the app is available. Please update to continue using the app.',
                [{ text: 'Update Now', onPress: () => { Linking.openURL('https://play.google.com/store/apps/details?id=com.inqube.greenqube') } }],
                { cancelable: false },
            );
        }
    }
    } catch (error) {
        console.error('Error checking app version:', error);
    }
};
