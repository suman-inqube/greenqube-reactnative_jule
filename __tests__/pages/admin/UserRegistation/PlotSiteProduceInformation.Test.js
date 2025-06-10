import PlotSiteProduceInformation from "../../../../pages/admin/UserRegistation/PlotSiteProduceInformation";
import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
test('renders correctly', () => {
    const tree = render(
        <NavigationContainer>
            <PlotSiteProduceInformation />
        </NavigationContainer>
    ).toJSON();

    expect(tree).toMatchSnapshot();
});