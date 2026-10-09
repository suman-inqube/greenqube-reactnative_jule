import LoginPage from '../pageobjects/login.page';
import { expect } from '@wdio/globals';

describe('Login Application Flow', () => {
    it('should launch the app and display the login screen', async () => {
        await expect(LoginPage.phoneInput).toBeExisting();
        await expect(LoginPage.passwordInput).toBeExisting();
        await expect(LoginPage.submitButton).toBeExisting();
    });

    it('should show validation error for empty fields', async () => {
        await LoginPage.submitButton.click();

        // Wait for an alert to be displayed
        // We wait up to 5s for the native alert dialog message to be present
        // using standard appium locator for android native alerts
        const alertMessage = await $('id=android:id/message');
        await alertMessage.waitForExist({ timeout: 5000 });
        const text = await alertMessage.getText();
        expect(text).toContain('Please fill in all required fields');

        // click ok
        const okBtn = await $('id=android:id/button1');
        await okBtn.click();
    });

    it('should attempt login with invalid credentials', async () => {
        await LoginPage.login('12345', 'wrongpassword');

        // We expect a network call which will fail and trigger error dialog
        const alertMessage = await $('id=android:id/message');
        await alertMessage.waitForExist({ timeout: 10000 });

        const okBtn = await $('id=android:id/button1');
        await okBtn.click();
    });

    it('should navigate to signup screen', async () => {
        await LoginPage.signupButton.click();

        // Verify we are on the signup screen
        // In signup screen, we have a signup_button_next button
        const signupNextBtn = await $('~signup_button_next');
        await expect(signupNextBtn).toBeExisting();
    });
});
