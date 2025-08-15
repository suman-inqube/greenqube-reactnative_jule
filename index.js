import React, { useEffect, useState, useContext } from 'react';
import { AppRegistry, Alert, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import { UserCreateContextProvider } from './pages/Context/usersCreateContext';
import { CrashlyticsRecordError } from './pages/Crashlytics/CrashlyticsRecordError';
import { Root as PopupRootProvider } from 'react-native-popup-confirm-toast';
import ErrorScreen from './pages/Common/ErrorScreen'; // 🔁 import the new screen
import MyErrorBoundary from './pages/Common/MyErrorBoundary';

export default function Main() {
    const [fatalError, setFatalError] = useState(null);
    const jsExceptionHandler = (error, isFatal) => {
        if (isFatal) {
            CrashlyticsRecordError(isFatal);
            // setFatalError(error);
        } else {
            console.warn('[Non-Fatal Error]', error);
        }
    };
    setJSExceptionHandler(jsExceptionHandler, true);
    setNativeExceptionHandler((errorString) => {
        console.error('[Native Exception]', errorString);
    });
    const handleRetry = () => {
        setFatalError(null);
        CrashlyticsRecordError(fatalError?.message);
    };
    if (fatalError) {
        return <ErrorScreen error={fatalError} onRetry={handleRetry} />;
    }
    return (
        <MyErrorBoundary>
            <UserCreateContextProvider>
                <PopupRootProvider>
                    <App />
                </PopupRootProvider>
            </UserCreateContextProvider>
        </MyErrorBoundary>
    );
}

AppRegistry.registerComponent(appName, () => Main);
