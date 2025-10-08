import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
// import crashlytics from '@react-native-firebase/crashlytics';
import { navigationRef } from '../../App';
import { userCreateContext } from '../Context/usersCreateContext';

class ErrorBoundaryClass extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            info: null,
        };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // const { user_id } = useContext(userCreateContext)?.loginUser_data || {};
        const { loginUser_data } = useContext(userCreateContext);
        const { contactNumber,userName,dbname, user_id } = loginUser_data || {};
        const currentRoute = navigationRef.getCurrentRoute();
        const screenName = currentRoute?.name || 'Unknown';
        // crashlytics().setUserId(user_id || 'UnknownUser');
        // crashlytics().setAttribute('contactNumber', contactNumber || 'UnknownContact');
        // crashlytics().setAttribute('userName', userName || 'UnknownUserName');
        // crashlytics().setAttribute('dbname', dbname || 'UnknownDBName');
        // crashlytics().setAttribute('crashed_screen', screenName);
        // crashlytics().setAttribute('error_boundary_scope', this.props.source || 'Global');
        // crashlytics().log(info?.componentStack || '');
        // crashlytics().log('App launched');
        // crashlytics().recordError(error);
        console.log('ErrorBoundary caught an error:', user_id);
        this.setState({ info });
        console.error('[ErrorBoundary]', error, info);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, info: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Something went wrong.</Text>
                    <Text style={styles.details}>{this.state.error?.message}</Text>
                    <Button title="Try Again" onPress={this.handleRetry} />
                </View>
            );
        }

        return this.props.children;
    }
}

// ✅ Functional wrapper using ES6 arrow function
const ErrorBoundary = ({ children, source = 'Global' }) => {
    return <ErrorBoundaryClass source={source}>{children}</ErrorBoundaryClass>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'red',
        marginBottom: 12,
    },
    details: {
        fontSize: 14,
        color: '#555',
        marginBottom: 16,
        textAlign: 'center',
    },
});

export default ErrorBoundary;
