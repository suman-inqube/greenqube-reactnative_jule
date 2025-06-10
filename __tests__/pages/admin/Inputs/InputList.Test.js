import InputList from "../../../../pages/admin/Inputs/InputList";
import { render,fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useContext } from "react";
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
      <NavigationContainer>
        <InputList />
      </NavigationContainer>
    ).toJSON();
  
    expect(tree).toMatchSnapshot();
  });