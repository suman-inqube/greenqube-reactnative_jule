class DashboardPage {
    get userRegistrationButton() { return $('~dashboard_box_user_registration'); }
    get userListButton() { return $('~dashboard_box_user_list'); }
    get problemButton() { return $('~dashboard_box_problem'); }
    get activityButton() { return $('~dashboard_box_activity'); }
}

export default new DashboardPage();
