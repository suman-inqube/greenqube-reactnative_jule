import RegistationSignUpViwer from "../../../../pages/admin/UserRegistation/RegistationSignUpViwer";
import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
        <NavigationContainer>
            <RegistationSignUpViwer />
        </NavigationContainer>
    ).toJSON();

    expect(tree).toMatchSnapshot();
});