const OPTIONS_CARBON = [
  { id: 'AWD', title: 'Carbon', navigation: 'ActivityReportAWD' },
  { id: 'Conventional', title: 'Non-Carbon', navigation: 'activityReport' },
];
const CARBON_TYPE = [
  { label: 'Carbon', value: 'carbon_activity' },
  { label: 'Non-Carbon ', value: 'user_activity' },
];
const getActionsActivity = (t, styles, Colors) => [
  {
    text: t('report_activity'),
    name: 'bt_add',
    position: 1,
    color: Colors.useGreen,
    textStyle: styles.actionText,
    textBackground: '#ffffff',
    icon: { uri: 'https://example.com/icon.png' }
  }
];

export { OPTIONS_CARBON, getActionsActivity,CARBON_TYPE };
