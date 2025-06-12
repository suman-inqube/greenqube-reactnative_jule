import ActivityDetail from '../../../../pages/admin/Activity/ActivityDetail';
import { render,fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
      <NavigationContainer>
        <ActivityDetail />
      </NavigationContainer>
    ).toJSON();
  
    expect(tree).toMatchSnapshot();
  });
