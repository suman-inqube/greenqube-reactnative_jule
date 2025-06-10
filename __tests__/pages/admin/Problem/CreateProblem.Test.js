import CreateProblem from "../../../../pages/admin/Problem/CrateProblem";
import { render,fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
      <NavigationContainer>
        <CreateProblem />
      </NavigationContainer>
    ).toJSON();
  
    expect(tree).toMatchSnapshot();
  });