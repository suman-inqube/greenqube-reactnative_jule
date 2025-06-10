import Information from "../../../../pages/admin/userlist/Information";
import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
        <NavigationContainer>
            <Information />
        </NavigationContainer>
    ).toJSON();

    expect(tree).toMatchSnapshot();
});