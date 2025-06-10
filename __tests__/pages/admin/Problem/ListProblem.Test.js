import ListProblem from "../../../../pages/admin/Problem/ListProblem";
import { render,fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
      <NavigationContainer>
        <ListProblem />
      </NavigationContainer>
    ).toJSON();
  
    expect(tree).toMatchSnapshot();
  });
