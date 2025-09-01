const getDashboardItems = (t, navigateToPages) => [
  {
    text: t('register_nfarmer'),
    imageurl: require('../Common/images/register_farmer.png'),
    onpress: () => navigateToPages('PersonalInformation'),
  },
  {
    text: t('farmer_list'),
    imageurl: require('../Common/images/farmer_list.png'),
    onpress: () => navigateToPages('userList'),
  },
  {
    text: t('crop_prob_far_dash'),
    imageurl: require('../Common/images/raise_problem_only.png'),
    onpress: () => navigateToPages('ProblemList'),
  },
  {
    text: t('acti_report_far_dash'),
    imageurl: require('../Common/images/activity_report_only.png'),
    onpress: () => navigateToPages('activityList'),
  },
  {
    text: t('agri_inputs_ninquiry_far_dash'),
    imageurl: require('../Common/images/input_inqu_only.png'),
    onpress: () => navigateToPages('InputList'),
  },
  {
    text: t('agri_output_far_dash'),
    imageurl: require('../Common/images/dash_sale_your_product.png'),
    onpress: () => navigateToPages('OutPutList'),
  },
  {
    text: t('market_information'),
    imageurl: require('../Common/images/market_information_only.png'),
    onpress: () => navigateToPages('ListProblem'),
  },
  {
    text: t('useful_ninformation_dash'),
    imageurl: require('../Common/images/dash_useful_information.png'),
    onpress: () => navigateToPages('UsefulInformationList'),
  },
];

const getDashboardFarmerItems = (t, navigateToPages) => [
  {
    text: t('crop_prob_far_dash'),
    imageurl: require('../Common/images/raise_problem_only.png'),
    onpress: () => navigateToPages('FarmerListProblem'),
  },
  {
    text: t('acti_report_far_dash'),
    imageurl: require('../Common/images/activity_report_only.png'),
    onpress: () => navigateToPages('FarmerActivityList'),
  },
  {
    text: t('agri_inputs_ninquiry_far_dash'),
    imageurl: require('../Common/images/input_inqu_only.png'),
    onpress: () => navigateToPages('FarmerInputList'),
  },
  {
    text: t('agri_output_far_dash'),
    imageurl: require('../Common/images/dash_sale_your_product.png'),
    onpress: () => navigateToPages('FarmerViewPast'),
  },
  {
    text: t('weather_nadvisory_far_dash'),
    imageurl: require('../Common/images/dash_weather_advisory.png'),
    onpress: () => navigateToPages('Weather'),
  },
  {
    text: t('useful_ninformation_far_dash'),
    imageurl: require('../Common/images/dash_sale_your_product.png'),
    onpress: () => navigateToPages('FarmerUsefulInformationList'),
  },
  {
    text: t('training_support'),
    imageurl: require('../Common/images/training_support_green.png'),
    onpress: () => navigateToPages('FarmerTrainingList'),
  },
  {
    text: t('Market Info'),
    imageurl: require('../Common/images/market_information_white.png'),
    onpress: () => {},
  },
];
const MENU_ITEMS = [
  {
    key: 'password',
    icon: require('../Common/images/change_password_green.png'),
    labelKey: 'forgot_password',
    gradient: ['#FF6B6B', '#FF8E8E'],
    iconBg: '#FFE5E5',
  },
  {
    key: 'information',
    icon: require('../Common/images/add_info_plus.png'),
    labelKey: 'far_list_information',
    gradient: ['#4ECDC4', '#7FDBDA'],
    iconBg: '#E5F9F8',
  },
  {
    key: 'livehood',
    icon: require('../Common/images/add_plot_plus.png'),
    labelKey: 'farming_details',
    gradient: ['#45B7D1', '#74C7E3'],
    iconBg: '#E5F4FA',
  },
  {
    key: 'CrateProblemUser',
    icon: require('../Common/images/add_qust_plus.png'),
    labelKey: 'q_a',
    gradient: ['#F9CA24', '#F0B90B'],
    iconBg: '#FEF5D3',
  },
];
export {getDashboardItems, getDashboardFarmerItems,MENU_ITEMS};
