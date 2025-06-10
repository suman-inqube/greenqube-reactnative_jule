import { fireEvent, render, screen } from '@testing-library/react-native'
import Dashboard from '../../../pages/admin/Dashboard';
import { NavigationContainer } from '@react-navigation/native';
// Mock useNavigation
jest.autoMockOff();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
        useIsFocused: jest.fn(() => true),
        closeDrawer: jest.fn(),
    }),
}));
describe('Dashboard', () => {
    // it('should render Dashboard correct', () => {
    //     render(<NavigationContainer>
    //         <Dashboard />
    //     </NavigationContainer>)

    //     // const buttonText = screen.getByText(label)
    //     // expect(buttonText).toBeTruthy()
    // })
    test('renders correctly', () => {
        const tree = render(
          <NavigationContainer>
            <Dashboard />
          </NavigationContainer>
        ).toJSON();
      
        expect(tree).toMatchSnapshot();
      });

    // it('should show Activity indicator when loading is true', () => {
    //     render(<ButtonForm onPress={() => { }} label={label} loading={true} />)
    //     // const activityIndicator = screen.getByTestId('activity-indicator');
    //     // expect(activityIndicator).toBeOnTheScreen()
    // })
})