import analytics from '@react-native-firebase/analytics';
export const AnalyticsLogEvent = async (screen_name,screen_class) => {
    console.log(screen_name,screen_class)
    await analytics().logEvent('live_activity_start', {
        activity_name: 'Activity Fitness Live',
        user_id: 'user_123456',
        timestamp: new Date().toISOString(),
    });
    // await analytics().logScreenView({
    //     screen_name: screen_name,
    //     screen_class: screen_class,
    //   });
    console.log("Live Activity Started");
}