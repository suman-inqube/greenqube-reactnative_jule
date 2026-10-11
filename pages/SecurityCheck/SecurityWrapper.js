import React, { useEffect, useRef } from 'react';
import { Alert, BackHandler, AppState } from 'react-native';
const SecurityWrapper = ({ children, coords }) => {
    const appState = useRef(AppState.currentState);
    const checkMockLocation = async (coords) => {
        try {
            if (coords?.mocked == true) {
                // showMockAlert();
            }
        } catch (error) {
            console.log('Error checking mock location:', error);
        }
    };
    const showMockAlert = () => {
        Alert.alert(
            'Security Alert',
            'Mock location detected! The app will now close for security reasons.',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        setTimeout(() => {
                            BackHandler.exitApp();
                        }, 800);
                    },
                },
            ],
            { cancelable: false }
        );
    };

    useEffect(() => {
        checkMockLocation(coords);
    }, []);
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                checkMockLocation(coords);
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);
    useEffect(() => {
        const interval = setInterval(() => {
            checkMockLocation(coords);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return <>{children}</>;
};

export default SecurityWrapper;
