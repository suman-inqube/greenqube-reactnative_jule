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
   icon: require('../Common/images/activity.png'),
  }
];

const getActionsProblemSupervisor = (t, styles, Colors) => [
  {
    text: t('Report Problem'),
    name: 'bt_add',
    position: 1,
    color: Colors.useGreen,
    textStyle: styles.actionText,
    textBackground: '#ffffffff',
    icon: require('../Common/images/warning.png'),
  }
];
const getActionsDealerReportSupervisor = (t, styles, Colors) => [
   {
    text: t('dealer_report'),
    name: 'dealer_report',
    position: 1,
    color: Colors.useGreen,
    textStyle: styles.actionText,
    textBackground: '#ffffff',
    icon: require('../Common/images/dealer.png'), // Dealer PNG
  },
  {
    text: t('farmer_report'),
    name: 'farmer_report',
    position: 2,
    color: Colors.useGreen,
    textStyle: styles.actionText,
    textBackground: '#ffffff',
    icon: require('../Common/images/farmerFlat.png'), // Farmer PNG
  }
];
const getActionsPostNew = (t, styles, Colors) => [
  {
    text: t('post_output_n'),
    name: 'bt_add',
    position: 1,
    color: Colors.useGreen,
    textStyle: styles.actionText,
    textBackground: '#ffffffff',
    icon: require('../Common/images/add-post.png'),
  }
];
const getActionsPlot= (t, styles, Colors) => [
  {
    text: t('add_plot'),
    name: 'bt_add',
    position: 1,
    color: Colors.useGreen,
    textStyle: styles.actionText,
    textBackground: '#ffffffff',
    icon: require('../Common/images/plotting.png'),
  }
];
export { OPTIONS_CARBON, getActionsActivity, getActionsProblemSupervisor, getActionsDealerReportSupervisor,getActionsPostNew,getActionsPlot, CARBON_TYPE };
