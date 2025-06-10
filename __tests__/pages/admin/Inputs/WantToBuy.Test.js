import WantToBuy from "../../../../pages/admin/Inputs/WantToBuy";
import { render,fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
      <NavigationContainer>
        <WantToBuy />
      </NavigationContainer>
    ).toJSON();
  
    expect(tree).toMatchSnapshot();
  });