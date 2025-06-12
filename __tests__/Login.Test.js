import { render,fireEvent } from '@testing-library/react-native';
import React from 'react';
import Login from '../pages/Login';
import { NavigationContainer } from '@react-navigation/native';
jest.autoMockOff();
// Mock useNavigation
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
        // useIsFocused: jest.fn(() => true),
        useIsFocused: jest.fn(),
    }),
    useIsFocused: jest.fn(), // Mock the useIsFocused hook
}));
// describe('HomeScreen Tests', () => {
//     test('should render correctly', () => {
//         const { getByTestId } = render(<NavigationContainer>
//             <Login />
//         </NavigationContainer>);

//         // const element = getByTestId('Login');  // Replace with your test ID
//         // expect(element).toBeTruthy();
//     });
// });
// jest.mock('react-native-element-dropdown', () => (props) => {
//   return (
//     <select
//       value={props.value}
//       onChange={(event) =>
//         props.onChange({ label: event.target.value, value: event.target.value })
//       }
//       testID={props.testID}
//     >
//       {props.data.map((item) => (
//         <option key={item.value} value={item.value}>
//           {item.label}
//         </option>
//       ))}
//     </select>
//   );
// });

// jest.mock('./Login', () => (props) => {
//   const { selectedValue, onValueChange } = props;
//   return (
//     <select
//       value={selectedValue}
//       onChange={(event) => onValueChange(event.target.value)}
//       testID="dropdown"
//     >
//       <option value="admin">Admin</option>
//       <option value="user">User</option>
//     </select>
//   );
// });
test('renders correctly', () => {
    const tree = render(
      <NavigationContainer>
        <Login />
      </NavigationContainer>
    ).toJSON();
  
    expect(tree).toMatchSnapshot();
  });

  describe('LoginPage', () => {
    const mockOnLogin = jest.fn();
  
    // it('should update dropdown value', () => {
    //   const { getByTestId } = render(<Login onLogin={mockOnLogin} />);
  
    //   const dropdown = getByTestId('dropdown');
  
    //   fireEvent.change(dropdown, { target: { value: 'admin' } });
  
    //   expect(dropdown.value).toBe('admin');
    // });
  
    // it('should call onLogin with correct data when login button is pressed', () => {
    //   const { getByTestId } = render(<LoginPage onLogin={mockOnLogin} />);
  
    //   const emailInput = getByTestId('email-input');
    //   const passwordInput = getByTestId('password-input');
    //   const dropdown = getByTestId('dropdown');
    //   const loginButton = getByTestId('login-button');
  
    //   fireEvent.changeText(emailInput, 'test@example.com');
    //   fireEvent.changeText(passwordInput, 'password123');
    //   fireEvent.change(dropdown, { target: { value: 'admin' } });
  
    //   fireEvent.press(loginButton);
  
    //   expect(mockOnLogin).toHaveBeenCalledWith({
    //     email: 'test@example.com',
    //     password: 'password123',
    //     userType: 'admin',
    //   });
    // });
 
  
    it('should display loading state correctly', () => {
      const { getByTestId } = render(
              <Login  />
      );
      // fireEvent.changeText(getByPlaceholderText('phoneNumber-input'), '9732138126');
      fireEvent.changeText(getByTestId('phoneNumber-input'), '9732138126');
      fireEvent.changeText(getByTestId('password-input'), '12345678');
      // fireEvent.valueChange(getByTestId('select_role'), '9732138126');
      // fireEvent.changeText(getByTestId('select_company'), '12345678');
      fireEvent.press(getByTestId('Login'));
  });

  });
  
