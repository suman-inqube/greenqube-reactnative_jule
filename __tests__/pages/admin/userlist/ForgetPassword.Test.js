import ForgetPassword from "../../../../pages/admin/userlist/ForgetPassword";
import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
        <NavigationContainer>
            <ForgetPassword />
        </NavigationContainer>
    ).toJSON();

    expect(tree).toMatchSnapshot();
});