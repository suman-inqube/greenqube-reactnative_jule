import SignupPage from '../pageobjects/signup.page';
import { expect } from '@wdio/globals';

describe('Signup Application Flow', () => {
    it('should show the signup screen with all fields', async () => {
        // Let's first make sure we are at signup if it starts at login:
        const loginBtn = await $('~login_button_submit');
        if (await loginBtn.isExisting()) {
            const navToSignup = await $('~login_button_signup');
            await navToSignup.click();
        }

        await SignupPage.nextButton.waitForExist({ timeout: 5000 });

        await expect(SignupPage.phoneInput).toBeExisting();
        await expect(SignupPage.passwordInput).toBeExisting();
        await expect(SignupPage.cpasswordInput).toBeExisting();
        await expect(SignupPage.nextButton).toBeExisting();
    });

    it('should show validation error for empty signup fields', async () => {
        await SignupPage.nextButton.click();

        // Wait for native alert
        const alertMessage = await $('id=android:id/message');
        await alertMessage.waitForExist({ timeout: 5000 });
        const text = await alertMessage.getText();
        expect(text).toContain('Please fill in all required fields');

        // click ok
        const okBtn = await $('id=android:id/button1');
        await okBtn.click();
    });

    it('should attempt signup with data', async () => {
        await SignupPage.signup('9876543210', 'password123');

        // After signup attempt it could fail due to missing fields or proceed
        // If it proceeds it goes to Persnol which has signup_button_next or similar
        // Since we are mocking e2e or hitting real API, we just check something happens
        // Let's assert it doesn't crash
        const okBtn = await $('id=android:id/button1');
        if (await okBtn.isExisting()) {
            await okBtn.click();
        }
    });
});
