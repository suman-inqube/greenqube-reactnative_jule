import LiveHood from "../../../../pages/admin/userlist/LiveHood";
import { render,fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
      <NavigationContainer>
        <LiveHood />
      </NavigationContainer>
    ).toJSON();
  
    expect(tree).toMatchSnapshot();
  });