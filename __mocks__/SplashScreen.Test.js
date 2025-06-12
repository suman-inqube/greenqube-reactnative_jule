import { databaseListAPI } from "../config/apiHere";
import SplashScreen from "../SplashScreen";
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
// import TodosComponent from './TodosComponent'; // Replace with your actual component

describe('TodosComponent test', () => {
  let mock;

  // Set up the mock adapter before each test
  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  // Reset the mock adapter after each test
  afterEach(() => {
    mock.reset();
  });

  it('should render loading followed by todos', async () => {
    // Arrange: mock the API response
    const todos = [{ id: 1, title: 'Todo 1' }, { id: 2, title: 'Todo 2' }];
    mock.onGet('/todos').reply(200, todos);

    // Act: render the component
    render(<SplashScreen />);

    // Assert: initially render the loading indicator
    expect(screen.getByText('Loading...')).toBeTruthy();

    // Wait for the todos to load and be rendered
    await waitFor(() => {
      expect(screen.getByText('Todo 1')).toBeTruthy();
      expect(screen.getByText('Todo 2')).toBeTruthy();
    });
  });
});
