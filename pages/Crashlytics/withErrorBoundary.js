
import React from 'react';
import { Text } from 'react-native';
// import crashlytics from '@react-native-firebase/crashlytics';

const withErrorBoundary = (WrappedComponent, FallbackComponent = null) => {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, info) {
      console.error("Error caught by withErrorBoundary:", error, info);
      // crashlytics().recordError(error);
      // crashlytics().log("Error caught in HOC");
      // crashlytics().setAttributes({
      //   screen: WrappedComponent.name || "UnknownComponent",
      //   time: new Date().toISOString(),
      // });
    }

    render() {
      if (this.state.hasError) {
        return FallbackComponent
          ? <FallbackComponent error={this.state.error} />
          : <Text style={{ color: 'red' }}>Something went wrong.</Text>;
      }

      try {
        return <WrappedComponent {...this.props} />;
      } catch (error) {
        console.error("Render error:", error);
        crashlytics().recordError(error);
        return <Text style={{ color: 'red' }}>Render failed.</Text>;
      }
    }
  };
};

export default withErrorBoundary;
