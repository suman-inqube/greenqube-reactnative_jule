# End-to-End Tests with WebdriverIO and Appium

This repository contains an end-to-end testing suite for the React Native application using WebdriverIO, Appium, and TypeScript.

## Structure
The testing framework is based on the Page Object Model (POM):
- `e2e/pageobjects/`: Contains the page objects representing the application screens (e.g., `login.page.ts`, `signup.page.ts`). They abstract the underlying element locators (using Appium `accessibilityId` selectors) and interactions.
- `e2e/specs/`: Contains the Mocha test suites covering different flows in the application.

## Test Scenarios Implemented
The test suites cover the following critical flows:
1. **Login Flow (`login.spec.ts`)**:
   - Launching the app and displaying the login screen.
   - Showing validation errors for empty fields.
   - Attempting login with invalid credentials.
   - Navigating to the signup screen.
2. **Signup Flow (`signup.spec.ts`)**:
   - Showing the signup screen and checking all necessary fields exist.
   - Showing validation errors for empty fields.
   - Attempting to fill in the signup form and submit.

## Component `testID`s
To facilitate testing, `testID`s have been added to the common components (`ButtonForm`, `DropdownForm`, `InputTextForm`) and their usages in key screens (`Login.js` and `Signup.js`) using a consistent `<screen>_<element>_<purpose>` format.

## How to Execute the Tests
Ensure you have an Appium server running and an Android emulator/device connected.

To run the end-to-end tests:

```bash
npm run test:e2e
```
