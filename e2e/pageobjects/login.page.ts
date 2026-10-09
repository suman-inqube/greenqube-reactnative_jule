class LoginPage {
    get phoneInput() { return $('~login_input_phone'); }
    get passwordInput() { return $('~login_input_password'); }
    get roleDropdown() { return $('~login_dropdown_role'); }
    get companyDropdown() { return $('~login_dropdown_company'); }
    get submitButton() { return $('~login_button_submit'); }
    get signupButton() { return $('~login_button_signup'); }

    async login(phone: string, password: string) {
        await this.phoneInput.setValue(phone);
        await this.passwordInput.setValue(password);
        await this.submitButton.click();
    }
}

export default new LoginPage();
