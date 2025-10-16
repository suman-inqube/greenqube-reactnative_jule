import React, {useEffect, useState, useCallback} from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler';
import {UserCreateContextProvider} from './pages/Context/usersCreateContext';
// import {CrashlyticsRecordError} from './pages/Crashlytics/CrashlyticsRecordError';
import {Root as PopupRootProvider} from '@sekizlipenguen/react-native-popup-confirm-toast';
import ErrorScreen from './pages/Common/ErrorScreen';
import MyErrorBoundary from './pages/Common/MyErrorBoundary';
let isExceptionHandlerConfigured = false;
import './pages/services/i18next'
const configureExceptionHandlers = setFatalError => {
  if (isExceptionHandlerConfigured) return;

  const jsExceptionHandler = (error, isFatal) => {
    if (isFatal) {
      console.log('isFatal', isFatal);
    //   CrashlyticsRecordError(error);
      setFatalError(error);
    } else {
      console.warn('[Non-Fatal Error]', error);
    //   CrashlyticsRecordError(error);
    }
  };
  const nativeExceptionHandler = errorString => {
    console.error('[Native Exception]', errorString);
    // CrashlyticsRecordError(errorString);
  };

  setJSExceptionHandler(jsExceptionHandler, true);
  setNativeExceptionHandler(nativeExceptionHandler);
  isExceptionHandlerConfigured = true;
};

export default function Main() {
  const [fatalError, setFatalError] = useState(null);
  const handleRetry = useCallback(() => {
    if (fatalError) {
      console.error(fatalError)
    //   CrashlyticsRecordError(`Retry attempted for: ${fatalError.message}`);
    }
    setFatalError(null);
  }, [fatalError]);
  useEffect(() => {
    configureExceptionHandlers(setFatalError);
  }, []);
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
