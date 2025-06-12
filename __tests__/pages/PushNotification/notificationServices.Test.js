import { render } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import notificationServices from '../../../pages/PushNotification/NotificationServices';

describe('YourComponent Tests', () => {
  test('should render correctly inside NavigationContainer', () => {
    const tree = render(
        <notificationServices />
    ).toJSON();
      
    expect(tree).toMatchSnapshot();

    // const element = getByTestId('your-element-id');
    // expect(element).toBeTruthy();
  });
});
