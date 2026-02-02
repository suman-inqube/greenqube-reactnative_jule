const BASE_URL = 'http://134.209.155.11:4003/';
// 
// const BASE_URL = 'https://mygreenqube.com:4003/';

// import { BASE_URL } from "@env"
const decryptSecretKey = 'greenQube_96740_64428';
const countryAPI = BASE_URL + 'locationRoute/countryList/1/0/2?search_key=';
const companyAPI = BASE_URL + 'locationRoute/locationHierarchy/';
const supervisorAPI = BASE_URL + 'agentRoute/listAgentByCompanyID/';
const loginAPI = BASE_URL + 'sessionRoute/login';
const languageAPI = BASE_URL + 'locationRoute/getLang?status=1&search';
const phoneNoCheckAPI = BASE_URL + 'loginSignupRoute/availableMobile';
const phoneDigitCheckAPI =
  BASE_URL + 'locationRoute/getContactNoDigitByCountryID/';
const stateAPI =
  BASE_URL + 'locationRoute/stateList/1/0/1?search_key=&country_id=1';
const districtAPI =
  BASE_URL + 'locationRoute/listDistrict/1/0/1?search_key=&state_id=';
const blockAPI =
  BASE_URL + 'locationRoute/listAllSubdiv/1/0/1?search_key=&district_id=';
const terraintypeAPI =
  BASE_URL + 'landRoute/list/1/0/1?type=terrain_type&search_key=';
const landtypeAPI =
  BASE_URL + 'landRoute/list/1/0/1?type=land_type&search_key=';
const soiltypeAPI =
  BASE_URL + 'landRoute/list/1/0/1?type=soil_type&search_key=';
const defaultLandUnitArea =
  BASE_URL +
  'unitRoute/list/1/0/5?search_key=&unit_type=land_unit&is_default=1&sub_type=land_area';
const UnitConversonToDefault =
  BASE_URL + 'unitRoute/list/1/0/5?search_key=&unit_type=land_unit';
const landunitAPI =
  BASE_URL + 'unitRoute/list/1/0/5?search_key=&unit_type=land_unit';
const prodctionSeasionAPI1 = BASE_URL + 'cropRoute/getCropRelationDropdown/';
const prodctionSeasionAPI2 = '?crop_type_id=&crop_name_id=';
const produceNameAPI1 = BASE_URL + 'cropRoute/getCropRelationDropdown/';
const produceNameAPI2 = '?&crop_type_id=';
const produceNameAPI3 = '&crop_name_id=';
const produceVarietyAPI1 = BASE_URL + 'cropRoute/getCropRelationDropdown/';
const produceVarietyAPI2 = '?&crop_type_id=';
const produceVarietyAPI3 = '&crop_name_id=';
const productionProcessAPI =
  BASE_URL + 'farmerRoute/listfardata/1/0/2?type=production_system&search_key=';
const produceProductionUnitAPI =
  BASE_URL + 'unitRoute/list/1/0/5?unit_type=yield_unit&search_key=';

const roleData = [
  {label: 'Farmer/Producer', value: '2'},
  {label: 'Supervisor', value: '3'},
];
const pensionParMonthData = [
  {label: 'Month', value: 'month'},
  {label: 'Quarter', value: 'quarter'},
  {label: 'Year', value: 'year'},
];

const currentDB = async () => {
  return await AsyncStorage.setItem('currentDB', 'greenqube_farm_sme_demo_1');
};

export default {
  BASE_URL,
  roleData,
  countryAPI,
  companyAPI,
  supervisorAPI,
  loginAPI,
  languageAPI,
  phoneDigitCheckAPI,
  phoneNoCheckAPI,
  stateAPI,
  districtAPI,
  blockAPI,
  pensionParMonthData,
  terraintypeAPI,
  landtypeAPI,
  soiltypeAPI,
  landunitAPI,
  prodctionSeasionAPI1,
  prodctionSeasionAPI2,
  produceNameAPI1,
  produceNameAPI2,
  produceNameAPI3,
  produceVarietyAPI1,
  produceVarietyAPI2,
  produceVarietyAPI3,
  productionProcessAPI,
  produceProductionUnitAPI,
  defaultLandUnitArea,
  UnitConversonToDefault,
};
