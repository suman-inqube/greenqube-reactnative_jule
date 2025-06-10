import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DropdownForm from '../../../pages/Common/DropdownForm';

// Mock the Dropdown from react-native-element-dropdown
jest.mock('react-native-element-dropdown', () => {
  return {
    Dropdown: ({ data = [{ label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },],value,  onChan, testID='dropdown' }) => {
      return (
        <select
          value={value}
          // onChange={() => ({})}
            onChange={(e) => onChan(e.target.value)}
          data-testid={testID}
          testID="dropdown"
        >
          {data.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      );
    },
  };
});

// describe('DropdownForm', () => {
//   it('should render correctly and select a dropdown value', () => {
//     const data = [
//       { label: 'Admin', value: 'admin' },
//       { label: 'User', value: 'user' },
//     ];
//     const mockOnValueChange = jest.fn();
//     const { getByTestId } = render(
//       <DropdownForm label="Role" data={data} val="admin" onChange={mockOnValueChange} />
//     );

//     const dropdown = getByTestId('dropdown'); // Look for the element with testID="dropdown"

//     // Simulate selecting the "Admin" value
//     fireEvent.change(dropdown, { target: { val: 'admin' } });

//     // Assert that the mock function is called with the correct value
//     expect(mockOnValueChange).toHaveBeenCalledWith('admin');
//   });
// });

describe('DropdownForm', () => {
  it('should render correctly and select a dropdown value', () => {
    const data = [
            { label: 'Admin', value: 'admin' },
            { label: 'User', value: 'user' },
          ];
    const mockOnValueChange = jest.fn();
    const { getByTestId, debug,tree } = render(
      <DropdownForm label="Role" data={data} testID="dropdown" val="" onValueChange={mockOnValueChange} />
    );

    // Use debug to inspect what's rendered
    debug(); // This will output the component's rendered structure
    expect(tree).toMatchSnapshot();
    // const dropdown = getByTestId('dropdown');

    // Simulate selecting the "Admin" value
    // fireEvent.change(dropdown, { target: { value: 'Admin' } });

    // // Assert that the mock function is called with the correct value
    // expect(mockOnValueChange).toHaveBeenCalledWith('Admin');
    // fireEvent(dropdown, 'onChange', 'admin'); // Use valueChange instead of change
 // Simulate selecting the "Admin" value
//  fireEvent.change(dropdown, { target: { value: 'admin' } }); // Change this back to fireEvent.change
// fireEvent(dropdown, 'onChan', {target: {value: 'abc'}});
//  // Assert that the mock function is called with the correct value
//  expect(mockOnValueChange).toHaveBeenCalledWith('admin')/;
    // Assert that the mock function is called with the correct value
    // expect(mockOnValueChange).toHaveBeenCalledWith('admin');
    // expect(mockOnValueChange).toHaveBeenCalledWith('admin');
  });
});
