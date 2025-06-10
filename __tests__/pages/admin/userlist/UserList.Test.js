import UserList from "../../../../pages/admin/userlist/UserList";
import { render,fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
      <NavigationContainer>
        <UserList />
      </NavigationContainer>
    ).toJSON();
  
    expect(tree).toMatchSnapshot();
  });