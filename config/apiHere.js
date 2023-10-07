
import axios from 'axios';
import config from "../config";


const headersWithCompanyDBlanID = (dbName, languageId) => {
    return {
        'information': `${dbName},${languageId}`,
        'Accept': 'application/json'
    };
};
const headersWithCompanyDBlanIDauth = (dbName, languageId, auth) => {
    return {
        'information': `${dbName},${languageId}`,
        'Accept': 'application/json',
        'Authorization': auth
    };
};
const headersWithCompanyDBlanIDauthUserID = (dbName, languageId, auth, user_id) => {
    return {
        'information': `${dbName},${languageId},${user_id}`,
        'Accept': 'application/json',
        'Authorization': auth
    };
};
const headersWithCompanyDB = (dbName) => {
    return {
        'information': `${dbName}`,
        'Accept': 'application/json'
    };
};


const axiosHeaders = {
    headers: {
        'information': `localhost,1`,
        'Accept': 'application/json'
    },
};



export const databaseListAPI = async () => {

    const database_res = await axios.get(config.BASE_URL + "hostRoute/databaseList");
    return database_res;
}
export const firstLanguageListAPI = async (dbName) => {

    const headers = headersWithCompanyDB(dbName);
    const res = await axios.get(config.BASE_URL + "locationRoute/getLang?status=1&search", { headers });
    return res;
    // return headers;
}
export const countryDataListAPI = async () => {
    const country_res = await axios.get(config.countryAPI, axiosHeaders);
    return country_res;
}

export let companyDataListAPI = async (country_id, language_id) => {
    let company_res = await axios.get(config.companyAPI + `${country_id}/${language_id}`);
    return company_res;
}

export const supervisoryDataListAPI = async (company_id) => {
    let supervisor_res = await axios.get(config.supervisorAPI + company_id, axiosHeaders);
    return supervisor_res;
}


export const checkPhoneDigitAPI = async (countryId, dbName, languageId) => {
    const headers = headersWithCompanyDBlanID(dbName, languageId);
    let check_phone_digit_res = await axios.get(config.phoneDigitCheckAPI + countryId, { headers });
    return check_phone_digit_res;
}


const inputMobileNo = (phone) => {
    return {
        "contactNumber": phone,
        "userType": "2"
    };
};

export const checkPhoneNoAPI = async (dbName, phone) => {
    const headers = headersWithCompanyDB(dbName);
    const inputValue = inputMobileNo(phone);
    let check_phone_no_res = await axios.post(config.phoneNoCheckAPI, { inputValue }, { headers });
    return check_phone_no_res;
}


// personol form
export const languageDataListAPI = async (dbName) => {
    const headers = headersWithCompanyDB(dbName);
    let language_res = await axios.get(config.languageAPI, { headers });
    return language_res
}

export const stateInfoDataListAPI = async (dbName, language) => {
    const headers = headersWithCompanyDBlanID(dbName, language.value);
    let state_res = await axios.get(config.stateAPI, { headers });
    return state_res;
}

export const fetchStateAPI = async (dbName, languageID) => {
    const headers = headersWithCompanyDBlanID(dbName, languageID);
    try {
        let state_res = await axios.get(config.stateAPI, { headers });
        return state_res

    } catch (error) {
        return console.log("error with state api" + error.response);
    }
}

export const districtDataListAPI = async (dbName, language, state) => {
    const headers = headersWithCompanyDBlanID(dbName, language.value);
    let district_res = await axios.get(config.districtAPI + state.value, { headers });
    return district_res;
}

export const fetchDistrictAPI = async (dbName, languageID, stateID) => {
    try {
        const headers = headersWithCompanyDBlanID(dbName, languageID);
        let district_res = await axios.get(config.districtAPI + stateID, { headers });
        return district_res;
    } catch (error) {
        return console.log("error with district api" + error.response);
    }
}

export const blockDataListAPI = async (dbName, language, district) => {
    const headers = headersWithCompanyDBlanID(dbName, language.value);
    let block_res = await axios.get(config.blockAPI + district.value, { headers });
    return block_res;
}

export const fetchBlockAPI = async (dbName, languageID, districtID) => {
    try {
        const headers = headersWithCompanyDBlanID(dbName, languageID);
        let block_res = await axios.get(config.blockAPI + districtID, { headers });
        return block_res;
    } catch (error) {
        return console.log("error with Block api" + error.response);
    }
}

// dashboard
export const dashboardDataListAPI = async (dbName, languageID, token, userID) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageID}`,
        },
    };
    try {
        let response = await axios.get(config.BASE_URL + 'agentRoute/dashBoard/' + userID, axiosHeaders);
        return response.data;
    } catch (error) {
        return console.log("error with fpodetails api" + error.response);
    }
}

// user list
export const userDataListAPI = async (dbName, languageId, token, user_id) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageId},${user_id}`,
        },
    };
    try {
        let response = await axios.get(config.BASE_URL + 'agentRoute/listFarmer/1/1/2?search_key=', axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error with user api" + error.response);
    }

}
// fpodetails list
export const fpodetailsDataListAPI = async (dbName, languageID, token, userID, compCode) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageID},${userID}`,
        },
    };
    try {
        let response = await axios.get(config.BASE_URL + 'loginSignupRoute/fpodetails/' + compCode, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error with fpodetails api" + error.response);
    }

}

// activity
export const activityListAPI = async (dbName, languageID, token, userID, pageNO) => {

    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageID},${userID}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}inputOutputRoute/listUserActivity/1/${pageNO}/2?agent_id=${userID}&crop_type=&crop_name=&crop_variety=&search_key=&from_date=&to_date=`, axiosHeaders);
        return response;
        // return console.log(response.data.data);
    } catch (error) {
        return console.log("error in Activity api" + error.response);
    }

}
export const farmerByNameAPI = async (dbName, languageID, token, userID) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageID}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}loginSignupRoute/newlistuser/1/1/2?search_key=&userType=2&createdBy=${userID}`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in farmerByNameAPI " + error.response);
    }
}


export const plotAgainstFarmerAPI = async (dbName, languageID, token,farmerID) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageID}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}landRoute/userLandDetails/${farmerID}`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in plotAgainstFarmerAPI " + error.response);
    }
}

export const produceAgainstPlotAPI = async (dbName, languageID,farmerID,relID) => {
    // return console.log(`${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${farmerID}&land_rel_id=${relID}`);
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageID}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${farmerID}&land_rel_id=${relID}`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in produceAgainstPlotAPI " + error.response);
    }
}

export const productionStageAPI = async (dbName, languageID, cropTypeId,cropNameID) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageID}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}cropRoute/getCropRelationDropdown/1?crop_type_id=${cropTypeId}&crop_name_id=${cropNameID}`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in productionStageAPI " + error.response);
    }
}

export const activityTypeAPI = async (dbName, languageID, farmerID) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageID},${farmerID}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}categoryRoute/list/1/1/2?categoryType=activity_type_master&search_key=`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in activityTypeAPI " + error.response);
    }
}

export const activityInfoAPI = async (dbName, languageID,token, farmerID, cropType, cropName, actTypeID) => {
    // return console.log(`${config.BASE_URL}inputOutputRoute/listActivity/1/0/1?crop_type=${cropType}&crop_name=${cropName}&act_type_id=${actTypeID}`);
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageID},${farmerID}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}inputOutputRoute/listActivity/1/0/1?crop_type=${cropType}&crop_name=${cropName}&act_type_id=${actTypeID}`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in activityInfoAPI " + error.response);
    }
}

