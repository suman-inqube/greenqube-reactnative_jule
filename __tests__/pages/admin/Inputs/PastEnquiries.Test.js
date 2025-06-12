import PastEnquiries from "../../../../pages/admin/Inputs/PastEnquiries";
import { render,fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
      <NavigationContainer>
        <PastEnquiries />
      </NavigationContainer>
    ).toJSON();
  
    expect(tree).toMatchSnapshot();
  });
