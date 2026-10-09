class SignupPage {
    get countryDropdown() { return $('~signup_dropdown_country'); }
    get companyDropdown() { return $('~signup_dropdown_company'); }
    get supervisorDropdown() { return $('~signup_dropdown_supervisor'); }
    get phoneInput() { return $('~signup_input_phone'); }
    get passwordInput() { return $('~signup_input_password'); }
    get cpasswordInput() { return $('~signup_input_cpassword'); }
    get nextButton() { return $('~signup_button_next'); }

    async signup(phone: string, password: string) {
        await this.phoneInput.setValue(phone);
        await this.passwordInput.setValue(password);
        await this.cpasswordInput.setValue(password);
        await this.nextButton.click();
    }
}

export default new SignupPage();
