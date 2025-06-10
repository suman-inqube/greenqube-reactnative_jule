import ActivityList from '../../../../pages/admin/Activity/ActivityList';
import { render,fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
      <NavigationContainer>
        <ActivityList />
      </NavigationContainer>
    ).toJSON();
  
    expect(tree).toMatchSnapshot();
  });
