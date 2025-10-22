import React, { useEffect, useState, useCallback } from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-gesture-handler';
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler';
import { UserCreateContextProvider } from './pages/Context/usersCreateContext';
// import { CrashlyticsRecordError } from './pages/Crashlytics/CrashlyticsRecordError';
import { Root as PopupRootProvider } from '@sekizlipenguen/react-native-popup-confirm-toast';
import ErrorScreen from './pages/Common/ErrorScreen';
import MyErrorBoundary from './pages/Common/MyErrorBoundary';
import RNRestart from 'react-native-restart'; // ✅ add this for native crash restart
import './pages/services/i18next';
import { checkAppVersion } from './pages/checkAppVersion';
let isExceptionHandlerConfigured = false;

/* -----------------------------------------------------------
   Exception Handlers (same logic, improved safety)
------------------------------------------------------------ */
const configureExceptionHandlers = (setFatalError) => {
  if (isExceptionHandlerConfigured) return;

  const jsExceptionHandler = (error, isFatal) => {
    if (isFatal) {
      console.log('[FATAL JS ERROR]', error);
      setFatalError(error); // triggers ErrorScreen
    } else {
      console.warn('[Non-Fatal JS Error]', error);
    }
  };

  const nativeExceptionHandler = (errorString) => {
    console.error('[Native Exception]', errorString);
    // You can't show ErrorScreen after a native crash (bridge is dead)
    // So restart the app safely
    RNRestart.Restart();
  };

  setJSExceptionHandler(jsExceptionHandler, true);
  setNativeExceptionHandler(nativeExceptionHandler);

  isExceptionHandlerConfigured = true;
};

/* -----------------------------------------------------------
   Main Component (same structure, added render safety)
------------------------------------------------------------ */
export default function Main() {
  const [fatalError, setFatalError] = useState(null);

  const handleRetry = useCallback(() => {
    if (fatalError) {
      setFatalError(fatalError);
      // CrashlyticsRecordError(`Retry attempted for: ${fatalError.message}`);
    }
    setFatalError(null);
  }, [fatalError]);

  useEffect(() => {
    checkAppVersion();
    configureExceptionHandlers(setFatalError);
  }, []);

  try {
    // ✅ If a JS fatal error occurs, show ErrorScreen
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
  } catch (error) {
    // ✅ Extra fallback for unexpected render crashes
    console.log('[Render Catch Fallback]', error);
    return <ErrorScreen error={error} onRetry={handleRetry} />;
  }
}

AppRegistry.registerComponent(appName, () => Main);
