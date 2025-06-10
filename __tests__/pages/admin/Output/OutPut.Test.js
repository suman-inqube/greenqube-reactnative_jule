import OutPut from "../../../../pages/admin/Output/OutPut";
import { render,fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
      <NavigationContainer>
        <OutPut />
      </NavigationContainer>
    ).toJSON();
  
    expect(tree).toMatchSnapshot();
  });
