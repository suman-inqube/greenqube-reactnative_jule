import DashboardPage from '../pageobjects/dashboard.page';
import { expect } from '@wdio/globals';

describe('Dashboard Application Flow', () => {
    it('should show the dashboard buttons', async () => {
        // App starts at Login typically. For the sake of isolated dashboard tests,
        // assuming we are already logged in or mock navigation directly to Dashboard
        // We will pause to let elements render if they are on screen.
        await driver.pause(2000);

        // Wait for dashboard to load
        await DashboardPage.userRegistrationButton.waitForExist({ timeout: 5000 });

        await expect(DashboardPage.userRegistrationButton).toBeExisting();
        await expect(DashboardPage.userListButton).toBeExisting();
        await expect(DashboardPage.problemButton).toBeExisting();
        await expect(DashboardPage.activityButton).toBeExisting();
    });

    it('should navigate to user registration', async () => {
        await DashboardPage.userRegistrationButton.click();

        // Check that we moved to signup/registration screen (or wait for transition)
        const signupBtn = await $('~signup_button_next');
        await signupBtn.waitForExist({ timeout: 5000 });
        await expect(signupBtn).toBeExisting();
    });
});
