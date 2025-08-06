import axios from 'axios';
import config from '../config';
import { CrashlyticsRecordError } from '../pages/Crashlytics/CrashlyticsRecordError';
import commonAxios from './commonAxios';
import {getAxiosInstance} from './axiosInstance';
import { Image } from 'react-native';
// import CryptoJS from 'react-native-crypto-js';
import CryptoJS from 'crypto-js';
import { NativeModules } from 'react-native';

const timeoutConfig = { timeout: 5000 };
const getApiConfig = async () => {
  const { ConfigModule } = NativeModules;
  try {
    const BASE_URL = await ConfigModule.getBaseURL();
     return BASE_URL;
    // const decryptSecretKey = config.encryptedKey;
  }catch(err){
    console.log('config index',err);

  }
}
const headersWithCompanyDBlanID = (dbName, languageId) => {
  return {
    information: `${dbName},${languageId}`,
    Accept: 'application/json',
  };
};
const headersWithCompanyDBlanIDauth = (dbName, languageId, auth) => {
  return {
    information: `${dbName},${languageId}`,
    Authorization: auth,
  };
};
const headersWithCompanyDBlanIDauthUserID = (
  dbName,
  languageId,
  auth,
  user_id,
) => {
  return {
    information: `${dbName},${languageId},${user_id}`,
    Authorization: auth,
  };
};
const headersWithCompanyDB = dbName => {
  return {
    information: `${dbName}`,
  };
};

const axiosHeaders = {
  headers: {
    information: `localhost,1`,
  },
};

export const databaseListAPI = async () => {
  try {
    const instance = await getAxiosInstance();
    let response = await instance.get('hostRoute/databaseList');
    // console.log('err11=', response);
    return response
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
// export const databaseListAPI = async () => {
 
//   try {
//      const inst = await commonAxios();
//     const database_res = await inst.get('hostRoute/databaseList');
//     return database_res;
//   } catch (error) {
//     console.log('err11=', error);
    
//   }
// };
// export const firstLanguageListAPI = async (dbName) => {
//     const headers = headersWithCompanyDB(dbName);
//     const res = await axios.get(config.BASE_URL + "locationRoute/getLang?status=1&search", { headers });
//     return res;
//     // return headers;
// }

export const firstLanguageListAPI = async dbName => {
  const axiosHeaders = {
    headers: {
      information: `${dbName}`,
    },
  };
  try {
    let response = axios.get(
      config.BASE_URL + 'locationRoute/getLang?status=1&search',
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('firstLanguageListAPI' + error.response.data);
  }
};

export const countryDataListAPI = async () => {
  const country_res = await axios.get(config.countryAPI, axiosHeaders);
  return country_res;
};

export let companyDataListAPI = async (country_id, language_id) => {
  let company_res = await axios.get(
    config.companyAPI + `${country_id}/${language_id}`,
  );
  return company_res;
};

export const supervisoryDataListAPI = async company_id => {
  let supervisor_res = await axios.get(
    config.supervisorAPI + company_id,
    axiosHeaders,
  );
  return supervisor_res;
};
export const checkPhoneDigitAPI = async (countryId, dbName, languageId) => {
  const headers = headersWithCompanyDBlanID(dbName, languageId);
  let check_phone_digit_res = await axios.get(
    config.phoneDigitCheckAPI + countryId,
    { headers },
  );
  return check_phone_digit_res;
};
const inputMobileNo = phone => {
  return {
    contactNumber: phone,
    userType: '2',
  };
};

export const checkPhoneNoAPI = async (dbName, phone) => {
  const headers = headersWithCompanyDB(dbName);
  const inputValue = inputMobileNo(phone);
  let check_phone_no_res = await axios.post(
    config.phoneNoCheckAPI,
    { inputValue },
    { headers },
  );
  console.log(dbName, phone);
  return check_phone_no_res;
};

// personol form
export const languageDataListAPI = async dbName => {
  const headers = headersWithCompanyDB(dbName);
  let language_res = await axios.get(config.languageAPI, { headers });
  return language_res;
};

export const stateInfoDataListAPI = async (dbName, language) => {
  const headers = headersWithCompanyDBlanID(dbName, language.value);
  let state_res = await axios.get(config.stateAPI, { headers });
  return state_res;
};

export const fetchStateAPI = async (dbName, languageID) => {
  const headers = headersWithCompanyDBlanID(dbName, languageID);
  try {
    let state_res = await axios.get(config.stateAPI, { headers });
    return state_res;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error with state api' + error.response);
  }
};

export const districtDataListAPI = async (dbName, language, state) => {
  const headers = headersWithCompanyDBlanID(dbName, language.value);
  let district_res = await axios.get(config.districtAPI + state.value, {
    headers,
  });
  return district_res;
};

export const fetchDistrictAPI = async (dbName, languageID, stateID) => {
  try {
    const headers = headersWithCompanyDBlanID(dbName, languageID);
    let district_res = await axios.get(config.districtAPI + stateID, { headers });
    return district_res;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error with district api' + error.response);
  }
};

export const blockDataListAPI = async (dbName, language, district) => {
  const headers = headersWithCompanyDBlanID(dbName, language.value);
  let block_res = await axios.get(config.blockAPI + district.value, { headers });
  return block_res;
};

export const fetchBlockAPI = async (dbName, languageID, districtID) => {
  try {
    const headers = headersWithCompanyDBlanID(dbName, languageID);
    let block_res = await axios.get(config.blockAPI + districtID, { headers });
    return block_res;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error with Block api' + error.response);
  }
};

// dashboard
export const dashboardDataListAPI = async (
  dbName,
  languageID,
  token,
  userID,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageID}`,
    },
  };
  try {
    let response = await axios.get(
      config.BASE_URL + 'agentRoute/dashBoard/' + userID,
      axiosHeaders,
    );
    return response.data;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error with fpodetails api' + error.response);
  }
};

// user list
export const userDataListAPI = async (dbName, languageId, token, user_id) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId},${user_id}`,
    },
  };
  try {
    let response = await axios.get(
      config.BASE_URL + 'agentRoute/listFarmer/1/1/2?search_key=',
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error with user api' + error.response);
  }
};
// fpodetails list
export const fpodetailsDataListAPI = async (
  dbName,
  languageID,
  token,
  userID,
  compCode,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageID},${userID}`,
    },
  };
  try {
    // let response = await axios.get(
    //   config.BASE_URL + 'loginSignupRoute/fpodetails/' + compCode,
    //   axiosHeaders,
    // );
    // return response;
    const instance = await getAxiosInstance();
     let response = await instance.get(
      'loginSignupRoute/fpodetails_e/' + compCode,
       axiosHeaders,
     );
      const resultJson = {
        data: response,
        status: 200,
      };
      return resultJson;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

// All Farmer Against Supervisor
export const farmerAgainstSupervisorAPI = async (
  dbName,
  languageID,
  userId,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageID},${userId}`,
    },
  };
  // console.log(dbName, languageID, userId)
  // console.log({
  //     'information': `${dbName},${languageID},${userId}`,
  // })
  // console.log(config.BASE_URL + 'loginSignupRoute/listuser/1/0/2?search_key=&userType=2&createdBy=');
  try {
    let response = await axios.get(
      config.BASE_URL +
      'loginSignupRoute/listuser/1/0/2?search_key=&userType=2&createdBy=',
      axiosHeaders,
    );
    return response;
  } catch (error) {
    console.error(error);
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

// activity
export const activityListAPI = async (
  dbName,
  languageID,
  token,
  userID,
  pageNO,
  searchItem = '',
  from_date = '',
  to_date = '',
  carbonType = ''
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageID},${userID}`,
    },
  };
  try {
    // let response = await axios.get(
    //   `${config.BASE_URL}inputOutputRoute/listUserActivity/1/${pageNO}/2?type=${carbonType}&agent_id=${userID}&crop_type=&crop_name=&crop_variety=&search_key=${searchItem}&sowing_date=${from_date}&harvesting_date=${to_date}`,
    //   axiosHeaders,
    // );
     const instance = await getAxiosInstance();
    let response = await instance.get(
      `${config.BASE_URL}settingsRoute/listUserActivity_e/1/${pageNO}/2?type=${carbonType}&agent_id=${userID}&crop_type=&crop_name=&crop_variety=&search_key=${searchItem}&sowing_date=${from_date}&harvesting_date=${to_date}`,
      {
        headers: {
          authorization: `${token}`,
          information: `${dbName},${languageID},${userID}`,
        },
      },
    );
    const resultJson = {
      data: response,
      status: 200,
    };
    
    return resultJson;
  } catch (error) {
    CrashlyticsRecordError(error.response, "ActivityList", "activityListAPI");
    return error.response;
  }
};
export const activityListInstrumentWise = async (
  dbName,
  languageID,
  token,
  userID,
  pageNO,
  searchItem = '',
  from_date = '',
  to_date = '',
  carbonType = 'carbon_activity',
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageID},${userID}`,
    },
  };
  console.log(
    `${config.BASE_URL}settingsRoute/listPipeActivity/1/${pageNO}/2?type=carbon_activity&agent_id=${userID}&crop_type=&crop_name=&crop_variety=&search_key=${searchItem}&from_date=${from_date}&to_date=${to_date}`,
    axiosHeaders,
  );
  try {
    let response = await axios.get(
      `${config.BASE_URL}settingsRoute/listPipeActivity/1/${pageNO}/2?type=carbon_activity&agent_id=${userID}&crop_type=&crop_name=&crop_variety=&search_key=${searchItem}&from_date=${from_date}&to_date=${to_date}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const FarmerActivityListInstrumentWise = async (
  dbName,
  languageID,
  token,
  userID,
  pageNO,
  searchItem = '',
  from_date = '',
  to_date = '',
  carbonType = 'carbon_activity',
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageID},${userID}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}settingsRoute/listPipeActivity/1/${pageNO}/2?type=carbon_activity&farmer_id=${userID}&crop_type=&crop_name=&crop_variety=&search_key=${searchItem}&from_date=${from_date}&to_date=${to_date}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const farmerActivityListAPI = async (
  dbName,
  languageID,
  token,
  userID,
  pageNO,
  searchItem = '',
  from_date = '',
  to_date = '',
  carbonType = '',
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageID},${userID}`,
    },
  };
  try {
     const instance = await getAxiosInstance();
    let response = await instance.get(
      `${config.BASE_URL}settingsRoute/listUserActivity_e/1/${pageNO}/2?type=${carbonType}&agent_id=&crop_type=&crop_name=&crop_variety=&search_key=${searchItem}&sowing_date=${from_date}&harvesting_date=${to_date}`,
      {
        headers: {
          authorization: `${token}`,
          information: `${dbName},${languageID},${userID}`,
        },
      },
    );
    const resultJson = {
      data: response,
      status: 200,
    };
     return resultJson;
    //  return console.log(response.data.data);
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in Activity api' + error.response);
  }
};

export const farmerByNameAPI = async (dbName, languageID, token, userID) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageID}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}loginSignupRoute/listuser/1/0/2?search_key=&userType=2&createdBy=${userID}`,
      axiosHeaders,
    );
    console.log(axiosHeaders);
    // let response = await axios.get(`${config.BASE_URL}loginSignupRoute/newlistuser/1/0/2?search_key=&userType=2&createdBy=${userID}`, axiosHeaders);

    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

export const plotAgainstFarmerAPI = async (
  dbName,
  languageID,
  token,
  farmerID,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageID}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}landRoute/userLandDetails/${farmerID}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in plotAgainstFarmerAPI ' + error.response.data);
  }
};

// Production season And Livelyhood type List

export const productionSeasonAndLivelyhoodTypeListAPI = async (
  dbName,
  lan_id = '1',
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${lan_id}`,
    },
  };
  // console.log(`${config.BASE_URL}cropRoute/getCropRelationDropdown/${lan_id}?crop_type_id=&crop_name_id=`,axiosHeaders);
  try {
    let response = await axios.get(
      `${config.BASE_URL}cropRoute/getCropRelationDropdown/${lan_id}?crop_type_id=&crop_name_id=`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const produceAgainstPlotAPI = async (
  dbName,
  languageID,
  farmerID,
  relID,
) => {
  // return console.log(`${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${farmerID}&land_rel_id=${relID}`);
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageID},${farmerID}`,
    },
  };
  try {
    // let response = await axios.get(
    //   `${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${farmerID}&land_rel_id=${relID}`,
    //   axiosHeaders,
    // );

    let response = await axios.get(
      `${config.BASE_URL}cropRoute/currentCropStatus?land_rel_id=${relID}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    // CrashlyticsRecordError(error.response);
    return console.log('error in produceAgainstPlotAPI ' + error.response);
  }
};
export const produceAgainstPlotAPINew = async (
  dbName,
  languageID,
  farmerID,
  relID,
) => {
  // return console.log(`${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${farmerID}&land_rel_id=${relID}`);
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageID}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${farmerID}&land_rel_id=${relID}`,
      axiosHeaders,
    );
    // console.log(response);
    return response;
  } catch (error) {
    // CrashlyticsRecordError(error.response);
    return console.log('error in produceAgainstPlotAPI ' + error.response);
  }
};

export const productionStageAPI = async (
  dbName,
  languageID,
  cropTypeId,
  cropNameID,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageID}`,
    },
  };
  // add languageID
  try {
    let response = await axios.get(
      `${config.BASE_URL}cropRoute/getCropRelationDropdown/${languageID}?crop_type_id=${cropTypeId}&crop_name_id=${cropNameID}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return +error.response;
  }
};
export const setCycleDateAPI = async (
  dbName,
  language,
  userId,
  token,
  cuRelID,
  save_data,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${language},${userId}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  try {
    let response = await axios.put(
      `${config.BASE_URL}cropRoute/editUserCrop/${cuRelID}`,
      save_data,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const activityTypeAPI = async (dbName, languageID, farmerID) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageID},${farmerID}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}categoryRoute/list/1/1/2?categoryType=activity_type_master&search_key=`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in activityTypeAPI ' + error.response);
  }
};

export const activityInfoAPI = async (
  dbName,
  languageID,
  token,
  farmerID,
  cropType,
  cropName,
  actTypeID,
) => {
  // 
  // console.log({
  //     'authorization': `${token}`,
  //     'information': `${dbName},${languageID},${farmerID}`,
  // })
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageID},${farmerID}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}inputOutputRoute/listActivity/1/0/1?crop_type=${cropType}&crop_name=${cropName}&act_type_id=${actTypeID}`,
      axiosHeaders,
    );
   
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in activityInfoAPI ' + error.response);
  }
};
export const activitySaveAPI = async (
  dbName,
  languageId,
  token,
  userId,
  inputData,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
      'Content-Type': 'multipart/form-data',
      authorization: `${token}`,
    },
  };
  console.log(axiosHeaders)
  console.log(inputData)
  console.log(`${config.BASE_URL}inputOutputRoute/addUserActivity`)
  try {
    let response = await axios.post(
      `${config.BASE_URL}inputOutputRoute/addUserActivity`,
      inputData,
      axiosHeaders,
    );
    // console.log(JSON.stringify(response.data))
    return response;
  } catch (error) {
    // CrashlyticsRecordError(error.response);
    return error.response;
  }
};
// Problem
export const problemListAPI = async (
  dbName,
  languageID,
  token,
  AgentID,
  pageNo,
  user_id = '',
  from_date = '',
  to_date = '',
  mobileNo = '',
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageID}`,
    },
  };
  // console.log(
  //   axiosHeaders,
  //   `questionRoute/list_e/1/${pageNo}/2?search_key=&user_id=${user_id}&from_date=${from_date}&to_date=${to_date}&agent_id=${AgentID}&problem_type_id=&problem_name_id=&farmer_mobile=${mobileNo}`,
  // );
  try {
    // let response = await axios.get(
    //   `${config.BASE_URL}questionRoute/list/1/${pageNo}/2?search_key=&user_id=${user_id}&from_date=${from_date}&to_date=${to_date}&agent_id=&problem_type_id=&problem_name_id=&farmer_mobile=${mobileNo}`,
    //   axiosHeaders,
    // );
    // return response;
const instance = await getAxiosInstance();
     let response = await instance.get(
       `questionRoute/list_e/1/${pageNo}/2?search_key=&user_id=${user_id}&from_date=${from_date}&to_date=${to_date}&agent_id=${AgentID}&problem_type_id=&problem_name_id=&farmer_mobile=${mobileNo}`,
       axiosHeaders,
     );
     console.log('chech 11=', response);
      const resultJson = {
        data: response,
        status: 200,
      };
       return resultJson;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

export const problemPlotAgainstFarmerAPI = async (
  dbName,
  languageID,
  token,
  farmerID,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageID}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}landRoute/userLandDetails/${farmerID}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log(
      'plotAgainstFarmerAPI ' + JSON.stringify(error.response.data, null, 2),
    );
  }
};

export const problemProduceAgainstPlotAPI = async (
  dbName,
  languageID,
  farmerID,
  relID,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageID},${farmerID}`,
      'Content-Type': 'application/json',
    },
  };
  try {
    // let response = await axios.get(
    //   `${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${farmerID}&land_rel_id=${relID}`,
    //   axiosHeaders,
    // );`${config.BASE_URL}cropRoute/currentCropStatus?land_rel_id=${relID}`
    let response = await axios.get(
      `${config.BASE_URL}cropRoute/currentCropStatus?land_rel_id=${relID}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    console.log('error=', error);
    CrashlyticsRecordError(error.response);
    return console.log('error in produceAgainstPlotAPI ' + error.response);
  }
};

export const problemProductionStageAPI = async (
  dbName,
  languageID,
  cropTypeId,
  cropNameID,
) => {
  // return console.log(`${config.BASE_URL}cropRoute/getCropRelationDropdown/1?crop_type_id=${cropTypeId}&crop_name_id=${cropNameID}`);

  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageID}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}cropRoute/getCropRelationDropdown/${languageID}?crop_type_id=${cropTypeId}&crop_name_id=${cropNameID}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in productionStageAPI ' + error.response);
  }
};

export const problemTypeNameAPI = async (dbName, languageID, token) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageID}`,
      authorization: `${token}`,
    },
  };
  // return console.log(`${config.BASE_URL}problemRoute/problemtypename?farming_type=crop`,axiosHeaders);
  try {
    let response = await axios.get(
      `${config.BASE_URL}problemRoute/problemtypename?farming_type=crop`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in problemTypeNameAPI ' + error.response);
  }
};

export const problemSeverityAPI = async (dbName, languageID) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageID}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}cropRoute/list/1/0/1?type=severity&search_key`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

export const problemSaveAPI = async (
  dbName,
  languageId,
  token,
  userId,
  inputData,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
      authorization: `${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  // console.log(JSON.stringify(inputData))
  // console.log(`${config.BASE_URL}questionRoute/add`, inputData, axiosHeaders);
  // return;
  try {
    // console.log(response);
    let response = await axios.post(
      `${config.BASE_URL}questionRoute/add`,
      inputData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

export const problemCommentListAPI = async (dbName, userId, questionId) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${userId}`,
    },
  };
  // return console.log(`${config.BASE_URL}questionRoute/listComment/1/0/2?search_key=&comment_type=2&comment_qid=${questionId}&farming_type=crop`, axiosHeaders);
  try {
    let response = await axios.get(
      `${config.BASE_URL}questionRoute/listComment/1/0/2?search_key=&comment_type=2&comment_qid=${questionId}&farming_type=crop`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in problemCommentListAPI ' + error.response);
  }
};

export const problemCommentSaveAPI = async (
  dbName,
  languageId,
  userId,
  inputData,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  // return console.log(`${config.BASE_URL}questionRoute/addComment`,inputData, axiosHeaders);
  try {
    let response = await axios.post(
      `${config.BASE_URL}questionRoute/addComment`,
      inputData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in problemCommentSaveAPI ' + error);
  }
};

export const problemAnswerListAPI = async (
  dbName,
  languageId,
  token,
  problem_id,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId}`,
      authorization: `${token}`,
    },
  };
  //  console.log(`${config.BASE_URL}solutionRoute/viewQuestionSolution/${problem_id}`, axiosHeaders);
  try {
    let response = await axios.get(
      `${config.BASE_URL}solutionRoute/viewQuestionSolution/${problem_id}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in problemAnswerListAPI ' + error);
  }
};

// profile---------------------------------------------------------------------------------------
export const districtDataListAPI1 = async (dbName, language, state) => {
  const headers = headersWithCompanyDBlanID(dbName, language);
  let district_res = await axios.get(config.districtAPI + state, { headers });
  return district_res;
};

export const blockDataListAPI1 = async (dbName, language, district) => {
  const headers = headersWithCompanyDBlanID(dbName, language);
  let block_res = await axios.get(config.blockAPI + district, { headers });
  return block_res;
};

// user Details
export const userDetailAPI = async (dbName, languageId, token, user_id) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId}`,
    },
  };
  try {
    let response = await axios.get(
      config.BASE_URL + 'loginSignupRoute/details/' + user_id,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error with user api' + error.response);
  }
};

export const updateUserInfoAPI = async (
  dbName,
  language,
  userId,
  token,
  formData,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${language},${userId}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  try {
    let response = await axios.put(
      `${config.BASE_URL}loginSignupRoute/update/${userId}`,
      formData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error;
  }
};

export const stateListAPI = async (dbName, languageId, token) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId}`,
    },
  };
  let res = await axios.get(
    config.BASE_URL + 'locationRoute/stateList/1/0/1?search_key=&country_id=1',
    axiosHeaders,
  );
  return res;
  // return headers;
};

//input type
export const inputListAPI = async (
  dbName,
  languageId,
  token,
  userId,
  category_id,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
      authorization: `${token}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}marketRoute/listproduct/1/0/2?search_key=&category_id=${category_id}`,
      axiosHeaders,
    );
    console.log(
      `${config.BASE_URL}marketRoute/listproduct/1/0/2?search_key=&category_id=${category_id}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

export const inputCategoryAPI = async (dbName, languageId, token, userId) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
      authorization: `${token}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}inputOutputEntityRoute/listEntityTypes/1/0/2`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in inputCategoryAPI ' + error);
  }
};

export const inputSubCategoryAPI = async (
  dbName,
  languageId,
  token,
  userId,
  category_id,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
      authorization: `${token}`,
    },
  };
  console.log(axiosHeaders);
  try {
    // console.log(`${config.BASE_URL}inputOutputEntityRoute/listEntityTypes/1/0/2?entity_type_id=${category_id}`)
    // let response = await axios.get(`${config.BASE_URL}marketRoute/listproduct/1/0/2?search_key=&category_id=${category_id}`, axiosHeaders);
    let response = await axios.get(
      `${config.BASE_URL}inputOutputEntityRoute/listEntities/1/0/2?entity_type_id=${category_id}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in inputCategoryAPI ' + error);
  }
};

export const inputPastEnquiryListAPI = async (
  dbName,
  languageId,
  token,
  userId,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId}`,
      authorization: `${token}`,
    },
  };

  try {
    let response = await axios.get(
      `${config.BASE_URL}inputOutputRoute/list/1/0/2?farmer_id=&transaction_type=1&entity_type_id=&from_date=&to_date=&farmer_mobile=&agent_id=${userId}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in inputPastEnquiryListAPI ' + error);
  }
};

export const inputEnquiryViewAPI = async (
  dbName,
  languageId,
  token,
  userId,
  farmer_id,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
      authorization: `${token}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}inputOutputRoute/stofdetails/${farmer_id}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

export const inputSaveAPI = async (
  dbName,
  languageId,
  token,
  farmerId,
  inputData,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${farmerId}`,
      authorization: `${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  // console.log(`${config.BASE_URL}questionRoute/add`, inputData, axiosHeaders);
  try {
    let response = await axios.post(
      `${config.BASE_URL}inputOutputRoute/add`,
      inputData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('outputSaveAPI:', error.response.data);
  }
};

//Output =================================================================================================
export const outputListAPI = async (
  dbName,
  languageId,
  token,
  userId,
  farmer_id = '',
  fromDate = '',
  toDate = '',
  mobileNo = '',
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
      authorization: `${token}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}inputOutputRoute/list/1/0/2?&
        farmer_id=${farmer_id}&transaction_type=2&from_date=${fromDate}&to_date=${toDate}&agent_id=${userId}&farmer_mobile=${mobileNo}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in outputListAPI ' + error);
  }
};

export const livelihoodNameVarietyLandrelAPI = async (
  dbName,
  languageId,
  userId,
  relId,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
    },
  };
  // console.log(`${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${userId}&land_rel_id=${relId}`, axiosHeaders);
  try {
    // let response = await axios.get(
    //   `${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${userId}&land_rel_id=${relId}`,
    //   axiosHeaders,
    // );${config.BASE_URL}cropRoute/currentCropStatus?land_rel_id=${relId}

    let response = await axios.get(
      `${config.BASE_URL}cropRoute/currentCropStatus?land_rel_id=${relId}`,
      axiosHeaders,
    );
    console.log(response);
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log(
      'livelihoodNameVarietyLandrelAPI :' +
      JSON.stringify(error.response.data, null, 2),
    );
  }
};

export const unitByListAPI = async (
  dbName,
  languageId,
  is_default = '',
  sub_type = '',
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId}`,
    },
  };

  // console.log(`${config.BASE_URL}unitRoute/list/1/0/5?search_key=&is_default=${is_default}&sub_type=${sub_type}&unit_type=product_unit`)
  try {
    let response = await axios.get(
      `${config.BASE_URL}unitRoute/list/1/0/5?search_key=&is_default=${is_default}&sub_type=${sub_type}&unit_type=product_unit`,
      axiosHeaders,
    );
    // let response = await axios.get(`${config.BASE_URL}unitRoute/list/1/0/5?unit_type=product_unit&search_key=`, axiosHeaders);
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

export const outputSaveAPI = async (
  dbName,
  languageId,
  token,
  userId,
  inputData,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
      authorization: `${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  // return console.log(`${config.BASE_URL}questionRoute/add`,inputData, axiosHeaders);
  try {
    let response = await axios.post(
      `${config.BASE_URL}inputOutputRoute/add`,
      inputData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('outputSaveAPI:', error.response.data);
  }
};

// loan========================================================================

export const loanPurposeAPI = async (dbName, languageId, token) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId}`,
    },
  };

  try {
    let response = await axios.get(
      config.BASE_URL + 'loanEntityRoute/list/1/0/1?entity_type=loan_purpose',
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in loanPurposeAPI api' + error.response.data);
  }
};

export const loanRouteListAPI = async (
  dbName,
  languageId,
  token,
  userID,
  from_date,
  to_date,
  farmer_mobile,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId}`,
    },
  };

  try {
    // let response = await axios.get(
    //   config.BASE_URL +
    //   `loanRoute/list/1/0/2?&user_id=&farming_type=crop&from_date=${from_date}&to_date=${to_date}&agent_id=${userID}&farmer_mobile=${farmer_mobile}`,
    //   axiosHeaders,
    // );
    // return response;
    const instance = await getAxiosInstance();
    let response = await instance.get(
      `loanRoute/list_e/1/0/2?&user_id=&farming_type=crop&from_date=${from_date}&to_date=${to_date}&agent_id=${userID}&farmer_mobile=${farmer_mobile}`,
      axiosHeaders,
    );
    const resultJson = {
      data: response,
      status: 200,
    };
    return resultJson;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in loanRouteListAPI api' + error.response.data);
  }
};

export const loanRouteFarmerListAPI = async (
  dbName,
  languageId,
  token,
  user_id,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId},${user_id}`,
    },
  };
  try {
    let response = await axios.get(
      config.BASE_URL + 'agentRoute/listFarmer/1/0/2?search_key=',
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log(
      'error in loanRouteFarmerListAPI api' + error.response.data,
    );
  }
};

// loan==========================================================================
export const usefulInfoListAPI = async (
  dbName,
  languageId,
  userId,
  state_id,
  district_id,
  subdiv_id,
  userType,
  post,
  titleSearch,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId}`,
    },
  };
  try {
    // let response = await axios.get(
    //   `${config.BASE_URL}generalInfoRoute/list/1/0/2?user_id=${userId}&search_key=${titleSearch}&role_type=${userType}&post_type=${post}&state_id=${state_id}&district_id=${district_id}&subdiv_id=${subdiv_id}&crop_name_id=`,
    //   axiosHeaders,
    // );
    // return response;
    const instance = await getAxiosInstance();
    let response = await instance.get(
      `generalInfoRoute/list_e/1/0/2?user_id=${userId}&search_key=${titleSearch}&role_type=${userType}&post_type=${post}&state_id=${state_id}&district_id=${district_id}&subdiv_id=${subdiv_id}&crop_name_id=`,
      axiosHeaders,
    );
    console.log('generalInfoRoute==', response);
    const resultJson = {
      data: response,
      status: 200,
    };
    return resultJson;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

export const noticeDetailsAPI = async (dbName, languageId, token, noticeId) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId}`,
    },
  };
  try {
    const instance = await getAxiosInstance();
    let response = await instance.get(
      `generalInfoRoute/details/${noticeId}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error with user api' + error.response);
  }
};

export const trainingListAPI = async (
  dbName,
  languageId,
  userId,
  state_id,
  district_id,
  subdiv_id,
  userType,
  post,
  titleSearch,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId}`,
    },
  };
  try {
    // let response = await axios.get(
    //   `${config.BASE_URL}generalInfoRoute/list/1/0/2?user_id=${userId}&search_key=${titleSearch}&role_type=${userType}&post_type=${post}&state_id=${state_id}&district_id=${district_id}&subdiv_id=${subdiv_id}&crop_name_id=`,
    //   axiosHeaders,
    // );
    // // generalInfoRoute / list / 1 / 0 / 2 ? user_id = c8e666ba - 5046 - 48ba - 8561 - 27c3c22be0cc & search_key=& role_type=supervisor & post_type=training & state_id=5 & district_id=11 & subdiv_id=21 & crop_name_id=
    // return response;
    const instance = await getAxiosInstance();
    let response = await instance.get(
      `generalInfoRoute/list_e/1/0/2?user_id=${userId}&search_key=${titleSearch}&role_type=${userType}&post_type=${post}&state_id=${state_id}&district_id=${district_id}&subdiv_id=${subdiv_id}&crop_name_id=`,
      axiosHeaders,
    );
   
    const resultJson = {
      data: response,
      status: 200,
    };
    return resultJson;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error with user api' + error.response);
  }
};

export const numberDigitAPI = async (countryId, languageId) => {
  const axiosHeaders = {
    headers: {
      information: `localhost,1`,
    },
  };
  try {
    let response = await axios.get(
      config.BASE_URL +
      `locationRoute/getContactNoDigitByCountryID/${countryId}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error with user api' + error.response);
  }
};
export const signupSaveAPI = async (
  inputData,
  dbname = '',
  language = '',
  plot_count,
) => {
  const axiosHeaders = {
    headers: {
      'information': `${dbname},${language}`,
      'Content-Type': 'multipart/form-data',
      'plot_count': plot_count,
    }
  };
  try {
    let response = await axios.post(
      `${config.BASE_URL}farmerRoute/selfFarmerSignup`,
      inputData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    // CrashlyticsRecordError(error.response);
    console.log(error.response);
    console.log(error);
    console.log(error?.response?.data);
    return error.response;
  }
};

export const InsuranceListAPI = async (dbName, languageId, token, user_id) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId},${user_id}`,
    },
  };
  try {
    let response = await axios.get(
      config.BASE_URL +
      `insuranceRoute/list/1/0/2?&user_id=&from_date=&to_date=&agent_id=${user_id}&farmer_mobile=`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const InsuranceAddAPI = async (
  dbName,
  languageId,
  token,
  user_id,
  inputData,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId},${user_id}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  try {
    let response = await axios.post(
      config.BASE_URL + `insuranceRoute/add`,
      inputData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

// Daily sales report************************

export const DailySalesReportGetAPI = async (
  dbName,
  languageId,
  token,
  user_id,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId},${user_id}`,
    },
  };
  try {
    let response = await axios.get(
      config.BASE_URL +
      `optionRoute/srList/1/0/1?search_key=&user_fid=&from_date=&to_date=`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

export const ChooseDealerAPI = async (dbName, languageId, user_id) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId}`,
    },
  };
  try {
    let response = await axios.get(
      config.BASE_URL +
      `loginSignupRoute/listDealerAdmin/1/1/2?userType=9&search_key=&createdBy=`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in ChooseDealerAPI api' + error.response);
  }
};
export const AllProductCategoryListAPI = async (
  dbName,
  languageId,
  token,
  user_id,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId}`,
    },
  };
  try {
    let response = await axios.get(
      config.BASE_URL + `inputOutputEntityRoute/listEntityTypes/1/0/1`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const AllProductSubCategoryListAPI = async (
  dbName,
  languageId,
  token,
  user_id,
  categoryID,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId},${user_id}`,
    },
  };
  try {
    let response = await axios.get(
      config.BASE_URL +
      `inputOutputEntityRoute/listEntityNames/1/0/1?entity_type_id=${categoryID}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const AllProductNameList = async (
  dbName,
  languageId,
  token,
  user_id,
  subCategoryID,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId},${user_id}`,
    },
  };
  try {
    let response = await axios.get(
      config.BASE_URL +
      `marketRoute/listproduct/1/0/2?search_key=&category_id=${subCategoryID}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const FarmerDailysalesreportAdd = async (
  dbName,
  languageId,
  token,
  userId,
  inputData,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
      'Content-Type': 'multipart/form-data',
      authorization: `${token}`,
    },
  };
  try {
    let response = await axios.post(
      `${config.BASE_URL}optionRoute/salesReport`,
      inputData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const DealerDailysalesreportAdd = async (
  dbName,
  languageId,
  token,
  userId,
  inputData,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
      'Content-Type': 'multipart/form-data',
      authorization: `${token}`,
    },
  };
  try {
    let response = await axios.post(
      `${config.BASE_URL}optionRoute/salesReport`,
      inputData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

// farm Account
export const farmaccountsListAPI = async (
  dbName,
  languageId,
  token,
  userId,
  pageNo,
  farmerId = '',
  fromDate = '',
  toDate = '',
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId},${userId}`,
    },
  };
  //  console.log(`${config.BASE_URL}cropRoute/listUserCropRelsNew/1/${pageNo}/2/?search_key=&user_id=${farmerId}&from_date=${fromDate}&to_date=${toDate}`, axiosHeaders);
  try {
    const response = await axios.get(
      `${config.BASE_URL}cropRoute/listUserCropRelsNew/1/${pageNo}/2/?search_key=&agent_id=${userId}&user_id=${farmerId}&from_date=${fromDate}&to_date=${toDate}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

export const farmaccountsIncomeListAPI = async (
  dbName,
  languageId,
  token,
  farmerID,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId},${farmerID}`,
    },
  };

  try {
    const response = await axios.get(
      `${config.BASE_URL}categoryRoute/list/1/0/2?search_key=&categoryType=income`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('farmaccountsIncomeListAPI : ' + error.response.data);
  }
};
export const farmaccountsExpenseListAPI = async (
  dbName,
  languageId,
  token,
  farmerID,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId},${farmerID}`,
    },
  };
  // console.log(`${config.BASE_URL}cropRoute/listUserCropRelsNew/1/${pageNo}/2/?search_key=&user_id=${farmerId}&from_date=${fromDate}&to_date=${toDate}`, axiosHeaders);
  try {
    const response = await axios.get(
      `${config.BASE_URL}categoryRoute/list/1/0/2?search_key=&categoryType=expense`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('farmaccountsExpenseListAPI : ' + error.response.data);
  }
};

export const farmIncomeExpenceSaveAPI = async (
  dbName,
  languageId,
  token,
  farmer_id,
  inputData,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${farmer_id}`,
      authorization: `${token}`,
    },
  };
  try {
    let response = await axios.post(
      `${config.BASE_URL}cropRoute/addUserCropRels`,
      inputData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    // return console.log('farmIncomeExpenceSaveAPI:', error.response.data);
  }
};

export const livelihoodCropAndPlotDetailsAPI = async (
  dbName,
  languageId,
  userId,
  relId,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
    },
  };
  //  console.log(
  //    `${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${userId}&land_rel_id=${relId}`,
  //    axiosHeaders,
  //  );
  try {
    let response = await axios.get(
      `${config.BASE_URL}cropRoute/currentCropStatus?land_rel_id=${relId}`,
      { ...axiosHeaders, ...timeoutConfig },
    );
    // console.log('response== ', response);
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response, '', 'livelihoodCropAndPlotDetailsAPI');
    return error.response;
  }
};
export const ProductionSeasonAndApi = async (
  dbName,
  lanId,
  crop_type_id,
  crop_name_id,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${lanId}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}cropRoute/getCropRelationDropdown/${lanId}?crop_type_id=${crop_type_id}&crop_name_id=${crop_name_id}`,
      { ...axiosHeaders, ...timeoutConfig },
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response,'', 'ProductionSeasonAndApi');
    return error.response;
  }
};
export const ProductionProcessAPI = async (dbName, languageId) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}farmerRoute/listfardata/1/0/2?type=production_system&search_key=`,
      { ...axiosHeaders, ...timeoutConfig },
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response, '', 'ProductionProcessAPI');
    return error.response;
  }
};

export const ProductionUnitAPI = async (dbName, languageId) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId}`,
    },
  };
  // console.log(`${config.BASE_URL}unitRoute/list/1/0/5?unit_type=yield_unit&search_key=`, axiosHeaders)
  try {
    let response = await axios.get(
      `${config.BASE_URL}unitRoute/list/1/0/5?unit_type=yield_unit&search_key=`,
      { ...axiosHeaders, ...timeoutConfig },
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response, '', 'ProductionUnitAPI');
    return error.response;
  }
};
export const PlotSiteUserLandDetails = async (
  dbName,
  languageId,
  token,
  farmeruserID,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId}`,
      authorization: `${token}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}landRoute/userLandDetails/${farmeruserID}`,
      { ...axiosHeaders, ...timeoutConfig },
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response, '', 'PlotSiteUserLandDetails');
    return error.response;
  }
};
export const UpdateLandCropdetailsAPI = async (
  dbName,
  language,
  userId,
  token,
  formData,
  land_rel_id,
  crop_rel_id,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${language},${userId}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  try {
    let response = await axios.put(
      `${config.BASE_URL}landRoute/editUserLandCrop?land_rel_id=${land_rel_id}&crop_rel_id=${crop_rel_id}`,
      formData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response, '', 'UpdateLandCropdetailsAPI');
    return error.response;
  }
};
export const AddLandCropDetailsAPI = async (
  dbName,
  language,
  userId,
  token,
  formData,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${language},${userId}`,
      // 'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Type': 'multipart/form-data',
    },
  };
  console.log(`${config.BASE_URL}landRoute/multiLatLong`, formData, axiosHeaders);
  try {
    let response = await axios.post(
      `${config.BASE_URL}landRoute/multiLatLong`,
      formData,
      axiosHeaders
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response, '', 'AddLandCropDetailsAPI');
    return error.response;
  }
};
// ForgotPassword************************************
export const NewForgotPassword = async (dbName, language, userId, formData) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${language},${userId}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  try {
    let response = await axios.post(
      `${config.BASE_URL}loginSignupRoute/newForgotPassword`,
      formData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
// ChangePassword************************************

export const ChangePasswordApi = async (dbName, language, userId, formData) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${language},${userId}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  try {
    let response = await axios.post(
      `${config.BASE_URL}loginSignupRoute/newChangePassword`,
      formData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
/******farmerProblem*****/
export const farmerProblemListAPI = async (
  dbName,
  languageID,
  token,
  userID,
  page_no,
  farmer_type,
  question_type,
) => {
  const axiosHeaders = { headers: { information: `${dbName},${userID}` } };
  try {
    let response = await axios.get(
      `${config.BASE_URL}questionRoute/questionList/${farmer_type}/1/${page_no}/2?question_type=${question_type}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const farmerFarmaccountsListAPI = async (
  dbName,
  languageId,
  token,
  userId,
  pageNo,
  fromDate,
  toDate,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId},${userId}`,
    },
  };
  try {
    const response = await axios.get(
      `${config.BASE_URL}cropRoute/listUserCropRelsNew/1/${pageNo}/2/?search_key=&user_id=${userId}&from_date=${fromDate}&to_date=${toDate}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const farmerProblemDetailApi = async (dbName, languageID, quesId) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageID}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}questionRoute/details/${quesId}`,
      axiosHeaders,
    );
    return response;
    // return console.log(JSON.stringify(response.data.data,null,2));
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in Problem api' + error.response);
  }
};
export const reginalDataServiceAPI = async (dbName, languageID) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageID}`,
    },
  };
  // console.log(config.BASE_URL + 'categoryRoute/list/1/0/2?search_key=&categoryType=regionaldata', axiosHeaders);
  try {
    let response = await axios.get(
      config.BASE_URL +
      'categoryRoute/list/1/0/2?search_key=&categoryType=regionaldata',
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error with reginalDataServiceAPI ' + error.response);
  }
};
export const FarmerinputPastEnquiryListAPI = async (
  dbName,
  languageId,
  token,
  userId,
  fromDate,
  toDate,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId}`,
      authorization: `${token}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}inputOutputRoute/list/1/0/2?farmer_id=${userId}&transaction_type=1&entity_type_id=&from_date=${fromDate}&to_date=${toDate}`,
      axiosHeaders,
    );

    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in inputPastEnquiryListAPI ' + error);
  }
};
export const FarmeroutputListAPI = async (
  dbName,
  languageId,
  token,
  farmer_id,
  fromDate,
  toDate,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${farmer_id}`,
      authorization: `${token}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}inputOutputRoute/list/1/0/2?farmer_id=${farmer_id}&transaction_type=2&from_date=${fromDate}&to_date=${toDate}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in outputListAPI ' + error);
  }
};

export const cropListApi = async (dbName, languageId, userId) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${userId}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error with user api' + error.response);
  }
};
export const farmerUsefulInfoListAPI = async (
  dbName,
  languageId,
  userId,
  state_id,
  district_id,
  subdiv_id,
  newCropId,
  userType,
  post,
  titleSearch,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId}`,
    },
  };
  try {
    // let response = await axios.get(
    //   `${config.BASE_URL}generalInfoRoute/list/1/0/2?user_id=${userId}&search_key=${titleSearch}&role_type=${userType}&post_type=${post}&state_id=${state_id}&district_id=${district_id}&subdiv_id=${subdiv_id}&crop_name_id=${newCropId}`,
    //   axiosHeaders,
    // );
    // return response;
    const instance = await getAxiosInstance();
    let response = await instance.get(
      `generalInfoRoute/list_e/1/0/2?user_id=${userId}&search_key=${titleSearch}&role_type=${userType}&post_type=${post}&state_id=${state_id}&district_id=${district_id}&subdiv_id=${subdiv_id}&crop_name_id=`,
      axiosHeaders,
    );

    const resultJson = {
      data: response,
      status: 200,
    };
    return resultJson;
  } catch (error) {
    CrashlyticsRecordError(error.response);
  }
};
export const faremerTrainingListAPI = async (
  dbName,
  languageId,
  userId,
  state_id,
  district_id,
  subdiv_id,
  cropId,
  userType,
  post,
  titleSearch,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId}`,
    },
  };
  try {
    // let response = await axios.get(
    //   `${config.BASE_URL}generalInfoRoute/list/1/0/2?user_id=${userId}&search_key=${titleSearch}&role_type=${userType}&post_type=${post}&state_id=${state_id}&district_id=${district_id}&subdiv_id=${subdiv_id}&crop_name_id=${cropId}`,
    //   axiosHeaders,
    // );
    // // generalInfoRoute / list / 1 / 0 / 2 ? user_id = c8e666ba - 5046 - 48ba - 8561 - 27c3c22be0cc & search_key=& role_type=supervisor & post_type=training & state_id=5 & district_id=11 & subdiv_id=21 & crop_name_id=
    // return response;
    const instance = await getAxiosInstance();
    let response = await instance.get(
      `generalInfoRoute/list_e/1/0/2?user_id=${userId}&search_key=${titleSearch}&role_type=${userType}&post_type=${post}&state_id=${state_id}&district_id=${district_id}&subdiv_id=${subdiv_id}&crop_name_id=`,
      axiosHeaders,
    );

    const resultJson = {
      data: response,
      status: 200,
    };
    return resultJson;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error with user api' + error.response);
  }
};
export const outputEnquiryViewAPI = async (
  dbName,
  languageId,
  token,
  userId,
  farmer_id,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
      authorization: `${token}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}inputOutputRoute/protofdetails/${farmer_id}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in inputListAPI ' + error);
  }
};
export const FarmerInsuranceListAPI = async (
  dbName,
  languageId,
  token,
  user_id,
  fromDate,
  toDate,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId},${user_id}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}insuranceRoute/list/1/0/2?&user_id=${user_id}&from_date=${fromDate}&to_date=${toDate}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const SupervisoroutputEnquiryViewAPI = async (
  dbName,
  languageId,
  token,
  userId,
  id,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
      authorization: `${token}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}inputOutputRoute/protofdetails/${id}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const calculatorRouteViewesultAPI = async (
  dbName,
  lan_id,
  crop_type,
  crop_name,
  growth_stage_id,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${lan_id}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}calculatorRoute/NpkCalculator/1/0/1?crop_type=${crop_type}&crop_name=${crop_name}&growth_stage_id=${growth_stage_id}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const calculatorPestisideResultAPI = async (
  dbName,
  lan_id,
  crop_type_id,
  crop_name_id,
  crop_variety_id,
  growth_stage_id,
  problem_type_id,
  problem_name_id,
  production_system,
  severity_id,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${lan_id}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}solutionRoute/list/1/0/1?search_key=&crop_season_id=&crop_type_id=${crop_type_id}&crop_name_id=${crop_name_id}&crop_variety_id=${crop_variety_id}&growth_stage_id=${growth_stage_id}&problem_type_id=${problem_type_id}&problem_name_id=${problem_name_id}&category_id=&production_system=${production_system}&severity_id=${severity_id}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const ProblemTypeAPI = async (dbName, lan_id) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${lan_id}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}problemRoute/getProblemDropdown`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const ProblemNameAPI = async (dbName, lan_id, problem_type_id) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${lan_id}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}problemRoute/getProblemDropdown?problem_type_id=${problem_type_id}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const PackageOfPracticesList = async (dbName, lan_id) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${lan_id}`,
    },
  };
  try {
    // let response = await axios.get(
    //   `${config.BASE_URL}cropRoute/list/1/0/1?type=crop_name&search_key=`,
    //   axiosHeaders,
    // );
    // return response;
    const instance = await getAxiosInstance();
    let response = await instance.get(
      `cropRoute/list_e/1/0/1?type=crop_name&search_key=`,
      axiosHeaders,
    );
     const resultJson = {
       data: response,
       status: 200,
     };
     return resultJson;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const POPDetails = async (dbName, lan_id, productID) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${lan_id}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}popRoute/popdetailsbycropid/${productID}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const POPStaticMenuList = async (dbName, lan_id, productID) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${lan_id}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}popRoute/staticmenulist/1/0/1?&search_key=&menu_type=sm`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

export const POPStaticMenuListDetails = async (
  dbName,
  lan_id,
  crop_id,
  staticMenuId,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${lan_id}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}popRoute/listPopByStaticMenuId/${staticMenuId}?crop_type_id=&crop_id=${crop_id}&static_submenu_id=`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

export const DetailsCompany = async (dbName, lan_id, db_company_id) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${lan_id}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}locationRoute/detailsCompany/${db_company_id}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

export const SampleRequestList = async (
  dbName,
  lan_id,
  user_id,
  search_date,
  search_key,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}soilTestLabRoute/requestSoilTestList/0/0/2/${user_id}?search_date=${search_date}&search_key=${search_key}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

export const SampleReport = async (
  dbName,
  lan_id,
  user_id,
  search_date,
  search_key,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}soilTestLabRoute/requestSoilTestList/1/0/2/${user_id}?search_date=${search_date}&search_key=${search_key}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const soilTestLab = async (dbName, lan_id, user_id) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${lan_id}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}soilTestLabRoute/list/1/0/1?district_id=&search_key=`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const soilTestLabPostRequest = async (dbName, user_id, inputData) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${user_id}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  try {
    let response = await axios.post(
      `${config.BASE_URL}soilTestLabRoute/requestSoilTest`,
      inputData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};

export const addModuleForView = async (
  dbName,
  lan_id,
  user_id,
  token,
  option_name,
  module_view,
  option_type,
  status,
) => {
  const inputBody = {
    type: 'digital_adaption',
    sub_type: module_view,
    user_fid: user_id,
    module_name: option_name,
    module_slug: option_type,
    status: status,
  };
  const axiosHeaders = {
    headers: {
      information: `${dbName},${lan_id},${user_id}`,
      Authorization: token,
    },
  };
  try {
    let response = await axios.post(
      `${config.BASE_URL}optionRoute/addDigitalAdaption`,
      inputBody,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const defaultCurrAPI = async (dbName, languageID, token) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageID}`,
    },
  };
  try {
    let response = await axios.get(
      config.BASE_URL + 'optionRoute/currList/1/0/5?search_key=&is_default=1',
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const getPlotDocAPI = async (dbName, languageId, token, farmerID, plotId) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId},${farmerID}`,
    },
  };

  try {
    let response = await axios.get(
      `${config.BASE_URL}landRoute/getPlotImgs/${plotId}`,
      axiosHeaders,
    );
     const resultJson = {
      data: response,
      status: 200,
    };

    return resultJson;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in getPlotDocAPI api' + error.response);
  }
};


export const addIdAddressImgs = async (dbName, languageId, farmerID, token, formDataPlotImg) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId},${farmerID}`,
      'Content-Type': 'multipart/form-data',
    },
    // body:formDataPlotImg
  };
  console.log(axiosHeaders)
  try {
    let response = await axios.post(
      `${config.BASE_URL}farmerRoute/addIdAddressImgs`,
      formDataPlotImg,
      axiosHeaders
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in addIdAddressImgs api' + error.response);
  }
};
export const locDiffLang = async (
  dbName,
  languageId,
  token,
  state_fid,
  district_fid,
  subdiv_fid,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}locationRoute/locDiffLang/?state_fid=${state_fid}&district_fid=${district_fid}&subdiv_fid=${subdiv_fid}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in locDiffLang api' + error.response);
  }
};

export const defaultLandUnitArea = async (dbName, languageId, token) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}unitRoute/list/1/0/5?search_key=&unit_type=land_unit`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in defaultLandUnitArea api' + error.response);
  }
};

// export const LandUnitArea = async (dbName, languageId, token) => {
//   const axiosHeaders = {
//     headers: {
//       authorization: `${token}`,
//       information: `${dbName},${languageId}`,
//       'Content-Type': 'multipart/form-data',
//     },
//   };
//   console.log(
//     `${config.BASE_URL}unitRoute/list/1/0/5?search_key=&unit_type=land_unit&is_default=1&sub_type=land_area`,
//     {...axiosHeaders, ...timeoutConfig},
//   );
//   try {
//     let response = await axios.get(
//       `${config.BASE_URL}unitRoute/list/1/0/5?search_key=&unit_type=land_unit&is_default=1&sub_type=land_area`,
//       axiosHeaders, ...timeoutConfig
//     );
//     return response;
//   } catch (error) {
//     CrashlyticsRecordError(error.response);
//     return console.log('error in unitRoute api' + error.response);
//   }
// };

export const LandUnitArea = async (dbName, languageId, token) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}unitRoute/list/1/0/5?search_key=&unit_type=land_unit&is_default=1&sub_type=land_area`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response, '', 'LandUnitArea');
    return console.log('error in unitRoute api' + error.response);
  }
};

export const UnitConversonToDefault = async (dbName, languageId, token) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}unitRoute/list/1/0/5?search_key=&unit_type=land_unit`,
      { ...axiosHeaders, ...timeoutConfig },
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response, '', 'UnitConversonToDefault');
    return console.log('error in UnitConversonToDefault api' + error.response);
  }
};
export const LandUnitsquare_metre = async (dbName, languageId, token) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageId}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}unitRoute/list/1/0/5?search_key=&unit_type=land_unit&sub_type=land_area&unit_slug=square_metre`,
      { ...axiosHeaders, ...timeoutConfig },
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response, '', 'LandUnitsquare_metre');
    return console.log('error in LandUnitsquare_metre api' + error.response);
  }
};

export const nearestLatLong = async (
  dbName,
  lan_id,
  token,
  latitude,
  longitude,
) => {
  const inputBody = {
    latitude: latitude,
    longitude: longitude,
    distance: 200,
    data_limit: 100,
  };
  const axiosHeaders = {
    headers: {
      information: `${dbName},${lan_id}`,
    },
  };
  try {
    let response = await axios.post(
      `${config.BASE_URL}settingsRoute/nearestPlots`,
      inputBody,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response, '', 'nearestLatLong');
    return error.response;
  }
};
export const plotListApproval = async (dbname, lan_id, token, farmerID) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbname},${lan_id}`,
      'Content-Type': 'multipart/form-data',
    },
    // body:formDataPlotImg
  };
  try {
    // let response = await axios.get(
    //   `${config.BASE_URL}landRoute/userLandCropList/${farmerID}`,
    //   { ...axiosHeaders, ...timeoutConfig },
    // );
     const instance = await getAxiosInstance();
    let response = await instance.get(
      `${config.BASE_URL}landRoute/userLandCropList_e/${farmerID}`,
      {
      headers: {
      authorization: `${token}`,
      information: `${dbname},${lan_id}`,
      'Content-Type': 'multipart/form-data',
    }}
    );
    //  console.log("plot112",(response));
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log(error.response);
  }
}

export const activityTypeAPIAWD = async (dbName, languageID, farmerID) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageID},${farmerID}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}categoryRoute/list/1/1/2?categoryType=carbon_activity_type&search_key=`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in activityTypeAPI ' + error.response);
  }
};

export const PipeListDetails = async (
  dbName,
  languageID,
  token,
  farmerID,
  plot_id,
  act_master_id,
  cu_rel_id,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageID},${farmerID}`,
    },
  };
  try {
     const instance = await getAxiosInstance();
    let response = await instance.get(
      `${config.BASE_URL}landRoute/plotPipes_e?plot_fid=${plot_id}&act_name_fid=${act_master_id}&cu_rel_fid=${cu_rel_id}&pipe_id=`,
      {
        headers: {
          authorization: `${token}`,
          information: `${dbName},${languageID},${farmerID}`,
        },
      },
    );

   const resultJson = {
     data: response,
     status: 200,
   };

   return resultJson;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in activityInfoAPI ' + error.response);
  }
};
export const getUniquePipeNames = async (
  dbName,
  languageID,
  token,
  farmerID,
  plot_id,
  act_master_id,
  cu_rel_id,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageID},${farmerID}`,
    },
  };
  try {
    let response = await axios.get(
      // `${config.BASE_URL}landRoute/plotPipes?plot_fid=${plot_id}&act_name_fid=${act_master_id}&pipe_id=`,
      `${config.BASE_URL}inputOutputRoute/getUniquePipeNames?plot_fid=${plot_id}&cu_rel_fid=${cu_rel_id}`,
      axiosHeaders,
    );
    // console.log(
    //   `${config.BASE_URL}inputOutputRoute/getUniquePipeNames?plot_fid=${plot_id}&cu_rel_fid=${cu_rel_id}`,
    //   axiosHeaders,
    // );
    // console.log(response);
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in activityInfoAPI ' + error.response);
  }
};

export const addUserPipeActivity = async (
  dbName,
  languageId,
  token,
  userId,
  inputData,
  pipe_count,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
      'Content-Type': 'multipart/form-data',
      authorization: `${token}`,
      pipe_count: pipe_count,
    },
  };

  try {
    let response = await axios.post(
      `${config.BASE_URL}inputOutputRoute/addUserPipeActivity`,
      inputData,
      axiosHeaders,
    );
    // console.log(JSON.stringify(response.data))
    return response;
  } catch (error) {
    console.log(error);
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const addPrevPipeActivity = async (
  dbName,
  languageId,
  token,
  userId,
  inputData,
  pipe_count,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageId},${userId}`,
      'Content-Type': 'multipart/form-data',
      authorization: `${token}`,
      pipe_count: pipe_count,
    },
  };
  console.log(`${config.BASE_URL}inputOutputRoute/updatePipeActivity`,
      inputData,
      axiosHeaders)
  try {
    let response = await axios.post(
      `${config.BASE_URL}inputOutputRoute/updatePipeActivity`,
      inputData,
      axiosHeaders,
    );
     console.log(
       `${config.BASE_URL}inputOutputRoute/updatePipeActivity`,
       inputData,
       axiosHeaders,
     );
    return response;
  } catch (error) {
    console.log(error);
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const inputOutputRoutePipeImagesLatLong = async (
  dbName,
  languageID,
  farmerID,
  plot_fid,
  cropfid,
  cu_rel_id,
) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${languageID},${farmerID}`,
    },
  };

  try {
    let response = await axios.get(
      `${config.BASE_URL}landRoute/plotPipesLatLong?plot_fid=${plot_fid}&act_name_fid=&crop_name=${cropfid}&cu_rel_fid=${cu_rel_id}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in activityTypeAPI ' + error.response);
  }
};

export const activityScheduleAPI = async (
  dbName,
  languageID,
  token,
  type,
  plotId,
  cropId,
  cu_rel_id,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${languageID}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}settingsRoute/activitySchedule?type=${type}&plot_id=${plotId}&crop_name=${cropId}&cu_rel_fid=${cu_rel_id}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    return console.log('error in activityScheduleAPI ' + JSON.stringify(error.response));
  }
};
export const uploadCarbonAgrDocs = async (
  dbName,
  language,
  token,
  userId,
  formData,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${language},${userId}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  try {
    let response = await axios.post(
      `${config.BASE_URL}landRoute/uploadCarbonAgrDocs`,
      formData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response, '', 'uploadCarbonAgrDocs');
    return error.response;
  }
};

export const showCarbonFlag = async (token, dbName, language, userId) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${language},${userId}`,
    },
  };
  try {
    let response = await axios.get(
      `${config.BASE_URL}optionRoute/showCarbonFlag`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return console.log('error in showCarbonFlag ' + error.response);
  }
}

export const getMapLocation = async (
  inputData
) => {
  try {


    let response = await axios.get(
      `https://api.mapbox.com/search/geocode/v6/forward?q=${inputData}&proximity=&access_token=pk.eyJ1IjoiYmlrcmFtOTgiLCJhIjoiY21jMnRiejc0MGN3azJqcXNwbmdqZ2R1bCJ9.15UR7tulXrt7znxkDPPfyg`,
    );
    return response;
  } catch (error) {
    // console.log(error);
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const landRouteApi = async (dbName, language, type) => {
  const axiosHeaders = {
    headers: {
      information: `${dbName},${language}`,
    },
  };
  try {
    let response = await axios.get(`${config.BASE_URL}landRoute/list/1/0/1?type=${type}&search_key=`, { ...axiosHeaders, ...timeoutConfig });
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response, '', 'landRouteApi');
    return console.log('error in showCarbonFlag ' + error.response);
  }
}

export const ActivityPipeImages = async (
  token,
  dbName,
  language,
  userId,
  rel_id_plot,
  act_name_fid,
  pipe_id,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${language},${userId}`,
    },
  };
  console.log(
    `${config.BASE_URL}inputOutputRoute/pipeImages?plot_fid=${rel_id_plot}&act_name_fid=${act_name_fid}&pipe_id=${pipe_id}`,
    axiosHeaders,
  );
  try {
    let response = await axios.get(
      `${config.BASE_URL}inputOutputRoute/pipeImages?plot_fid=${rel_id_plot}&act_name_fid=${act_name_fid}&pipe_id=${pipe_id}`,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    CrashlyticsRecordError(error.response);
    return error.response;
  }
};
export const addActivityPipeImages = async (
  dbName,
  language,
  userId,
  token,
  formData,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${language},${userId}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  try {
    let response = await axios.post(
      `${config.BASE_URL}landRoute/uploadPipeImages`,
      formData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    return error.response;
  }
};
export const uploadFarmerIdAdd = async (
  dbName,
  language,
  userId,
  token,
  formData,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${language},${userId}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  try {
    let response = await axios.put(
      `${config.BASE_URL}settingsRoute/uploadFarmerIdAdd`,
      formData,
      axiosHeaders,
    );
    console.log('response11=', response);
    return response;
  } catch (error) {
    console.log('error11=', error.response);
    return error.response;
  }
};

export const onlyUpdateIdAddrFile = async (
  dbName,
  language,
  userId,
  token,
  formData,
) => {
  const axiosHeaders = {
    headers: {
      authorization: `${token}`,
      information: `${dbName},${language},${userId}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  try {
    let response = await axios.put(
      `${config.BASE_URL}settingsRoute/onlyUpdateIdAddrFile`,
      formData,
      axiosHeaders,
    );
    return response;
  } catch (error) {
    return error.response;
  }
};