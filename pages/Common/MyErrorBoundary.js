import React from 'react';
import { View, Text, Button } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import { CrashlyticsRecordError } from '../Crashlytics/CrashlyticsRecordError';
const ErrorFallback = ({ error, resetError }) => {
const handleRetry=()=>{
    CrashlyticsRecordError({error});
    resetError();
}
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, marginBottom: 20 }}>Something went wrong:</Text>
            <Text>The app was about to crash, but I got ya!</Text>
            <Text style={{ color: 'red', marginBottom: 20 }}>{error.toString()}</Text>
            <Button title="Try again" onPress={handleRetry} />
        </View>
    );
};

const MyErrorBoundary = ({ children }) => {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
        </ErrorBoundary>
    );
};

export default MyErrorBoundary;