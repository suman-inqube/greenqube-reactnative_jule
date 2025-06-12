import PersonalInformation from "../../../../pages/admin/UserRegistation/PersonalInformation";
import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
        <NavigationContainer>
            <PersonalInformation />
        </NavigationContainer>
    ).toJSON();

    expect(tree).toMatchSnapshot();
});