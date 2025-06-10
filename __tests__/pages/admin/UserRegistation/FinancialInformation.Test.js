import FinancialInformation from "../../../../pages/admin/UserRegistation/FinancialInformation";
import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
        <NavigationContainer>
            <FinancialInformation />
        </NavigationContainer>
    ).toJSON();

    expect(tree).toMatchSnapshot();
});