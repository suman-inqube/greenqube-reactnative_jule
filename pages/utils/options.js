import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const OPTIONS_CARBON = [
  { id: 'AWD', title: 'Carbon', navigation: 'ActivityReportAWD' },
  { id: 'Conventional', title: 'Non-Carbon', navigation: 'activityReport' },
];
const OPTIONS_CARBON_FARMER = [
  { id: 'AWD', title: 'Carbon', navigation: 'FarmerActivityReportAWD' },
  {
    id: 'Conventional',
    title: 'Non-Carbon',
    navigation: 'FarmerActivityReport',
  },
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
  },
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
  },
];

const getActionsPostNewOutputFarmer = (t, styles, Colors) => [
  {
    text: t('Post New Produce'),
    name: 'bt_add',
    position: 1,
    color: Colors.useGreen,
    textStyle: styles.actionText,
    textBackground: '#ffffffff',
    icon: require('../Common/images/add-post.png'),
  },
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
  },
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
  },
];
const getActionsMapView = (t, styles, Colors) => [
  {
    text: t('MapView'),
    name: 'bt_add',
    position: 2,
    color: Colors.useGreen,
    textStyle: styles.actionText,
    textBackground: '#ffffffff',
    icon: <MaterialIcons name="public" size={26} color="#ffffff" />,
  },
];
const getActionsPlot = (
  t,
  styles,
  Colors,
  isEnable = false,
  addPlot = false,
  activeTab
) => {
  const actions = [];
  if (activeTab == 1) {
    actions.push(
      {
        text: t('Add CO-Farmer'),
        name: 'coFarmer',
        position: 2,
        color: Colors.useGreen,
        textStyle: styles.actionText,
        textBackground: '#ffffffff',
        icon: require('../Common/images/co-farmer.png'),
      }, {
      text: t('List CO-Farmer'),
      name: 'coFarmerList',
      position: 2,
      color: Colors.useGreen,
      textStyle: styles.actionText,
      textBackground: '#ffffffff',
      icon: require('../Common/images/checklist.png'),
    }
    )
  }
  if (isEnable || addPlot) {
    actions.push({
      text: t('MapView'),
      name: 'MapView',
      position: 2,
      color: Colors.useGreen,
      textStyle: styles.actionText,
      textBackground: '#ffffffff',
      icon: require('../Common/images/mapview.png'),
    });
  } else {
    actions.push({
      text: t('add_plot'),
      name: 'bt_add',
      position: 1,
      color: Colors.useGreen,
      textStyle: styles.actionText,
      textBackground: '#ffffffff',
      icon: require('../Common/images/plotting.png'),
    });
  }
  return actions;
};

const inputViewPast = (t, styles, Colors) => [
  {
    text: t('view_input_requested'),
    name: 'bt_add',
    position: 2,
    color: Colors.useGreen,
    textStyle: styles.actionText,
    textBackground: '#ffffffff',
    icon: <MaterialIcons name="list-alt" size={26} color="#ffffff" />,
  },
];
const getActionsIncomeExpense = (t, styles, Colors) => [
  {
    text: t('add_income'),
    name: 'add_income',
    position: 1,
    color: Colors.useGreen,
    textStyle: styles.actionText,
    textBackground: '#ffffff',
    icon: require('../Common/images/addincome.png'),
  },
  {
    text: t('add_expense'),
    name: 'add_expense',
    position: 2,
    color: Colors.useGreen,
    textStyle: styles.actionText,
    textBackground: '#ffffff',
    icon: require('../Common/images/addexp.png'),
  },
];

export {
  OPTIONS_CARBON,
  getActionsActivity,
  getActionsProblemSupervisor,
  getActionsDealerReportSupervisor,
  getActionsPostNew,
  getActionsPlot,
  CARBON_TYPE,
  getActionsMapView,
  getActionsPostNewOutputFarmer,
  OPTIONS_CARBON_FARMER,
  inputViewPast,
  getActionsIncomeExpense,
};
