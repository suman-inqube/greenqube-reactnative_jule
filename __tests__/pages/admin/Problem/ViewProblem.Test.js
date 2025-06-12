import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import ViewProblem from '../../../../pages/admin/Problem/ViewProblem';
// jest.mock('@react-navigation/native', () => ({
//     useRoute: () => ({
//         params: {
//             id: 123, // Mock any route params your component needs
//         },
//     }),
// }));
import { useRoute } from '@react-navigation/native';
jest.autoMockOff();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ goBack: jest.fn() }),
    useRoute: () => ({
        params: {
            yourParamName: '<paramValue>',
            yourParamName2: '<paramValue2>',
        }
    }),
}));
test('renders correctly', () => {
    const tree = render(
        <NavigationContainer>
            <ViewProblem />
        </NavigationContainer>
    ).toJSON();

    expect(tree).toMatchSnapshot();
});
