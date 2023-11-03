
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
        'Authorization': auth
    };
};
const headersWithCompanyDBlanIDauthUserID = (dbName, languageId, auth, user_id) => {
    return {
        'information': `${dbName},${languageId},${user_id}`,
        'Authorization': auth
    };
};
const headersWithCompanyDB = (dbName) => {
    return {
        'information': `${dbName}`,
    };
};


const axiosHeaders = {
    headers: {
        'information': `localhost,1`,
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


// All Farmer Against Supervisor
export const farmerAgainstSupervisorAPI = async (dbName, languageID, token, userId) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageID},${userId}`,
        }
    }
    try {
        let response = await axios.get(config.BASE_URL + 'loginSignupRoute/listuser/1/0/2?search_key=&userType=2&createdBy=', axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error with farmerAgainstSupervisorAPI" + error.response);
    }

}



// activity
export const activityListAPI = async (dbName, languageID, token, userID, pageNO, searchItem = '', from_date = '', to_date = '') => {

    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageID},${userID}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}inputOutputRoute/listUserActivity/1/${pageNO}/2?agent_id=${userID}&crop_type=&crop_name=&crop_variety=&search_key=${searchItem}&from_date=${from_date}&to_date=${to_date}`, axiosHeaders);
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

export const plotAgainstFarmerAPI = async (dbName, languageID, token, farmerID) => {
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
        return console.log("error in plotAgainstFarmerAPI " + error.response.data);
    }
}

// Production season And Livelyhood type List

export const productionSeasonAndLivelyhoodTypeListAPI = async (dbName) => {
    // return console.log(`${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${farmerID}&land_rel_id=${relID}`);
    const axiosHeaders = {
        headers: {
            'information': `${dbName}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}cropRoute/getCropRelationDropdown/1?crop_type_id=&crop_name_id=`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in productionSeasonAndLivelyhoodTypeListAPI " + error.response);
    }
}
export const produceAgainstPlotAPI = async (dbName, languageID, farmerID, relID) => {
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

export const productionStageAPI = async (dbName, languageID, cropTypeId, cropNameID) => {
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

export const activityInfoAPI = async (dbName, languageID, token, farmerID, cropType, cropName, actTypeID) => {
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

export const activitySaveAPI = async (dbName, languageId,token,userId,inputData) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId},${userId}`,
            'Content-Type': 'multipart/form-data',
            'authorization': `${token}`,
        },
    };
    try {
        let response = await axios.post(`${config.BASE_URL}inputOutputRoute/addUserActivity`,inputData, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in problemSaveAPI " + error);
    }
}


// Problem
export const problemListAPI = async (dbName, languageID, userID, pageNo, searchItem = '', from_date = '', to_date = '',mobileNo='') => {

    // return console.log(`${config.BASE_URL}questionRoute/list/1/${pageNo}/2?search_key=${searchItem}&user_id=&from_date=${from_date}&to_date=${to_date}&
    //     agent_id=${userID}&problem_type_id=&problem_name_id=&farmer_mobile=${mobileNo?mobileNo:''}`, axiosHeaders);

    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageID}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}questionRoute/list/1/${pageNo}/2?search_key=${searchItem}&user_id=&from_date=${from_date}&to_date=${to_date}&
        agent_id=${userID}&problem_type_id=&problem_name_id=&farmer_mobile=${mobileNo}`, axiosHeaders);
        return response;
        // return console.log(JSON.stringify(response.data.data,null,2));
    } catch (error) {
        return console.log("error in Problem api" + error.response);
    }

}

export const problemPlotAgainstFarmerAPI = async (dbName, languageID, token, farmerID) => {
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
        return console.log("plotAgainstFarmerAPI " + JSON.stringify(error.response.data,null,2));
    }
}

export const problemProduceAgainstPlotAPI = async (dbName, languageID, farmerID, relID) => {
    // return console.log(`${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${farmerID}&land_rel_id=${relID}`)
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

export const problemProductionStageAPI = async (dbName, languageID, cropTypeId, cropNameID) => {
    // return console.log(`${config.BASE_URL}cropRoute/getCropRelationDropdown/1?crop_type_id=${cropTypeId}&crop_name_id=${cropNameID}`);

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

export const problemTypeNameAPI = async (dbName, languageID, token) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageID}`,
            'authorization': `${token}`,
        },
    };
    // return console.log(`${config.BASE_URL}problemRoute/problemtypename?farming_type=crop`,axiosHeaders);
    try {
        let response = await axios.get(`${config.BASE_URL}problemRoute/problemtypename?farming_type=crop`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in problemTypeNameAPI " + error.response);
    }
}

export const problemSeverityAPI = async (dbName, languageID) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageID}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}cropRoute/list/1/0/1?type=severity&search_key`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in problemSeverityAPI " + error.response);
    }
}

export const problemSaveAPI = async (dbName, languageId,token,userId,inputData) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId},${userId}`,
            'authorization': `${token}`,
            'Content-Type': 'multipart/form-data',
        },
    };
    // return console.log(`${config.BASE_URL}questionRoute/add`,inputData, axiosHeaders);
    try {
        let response = await axios.post(`${config.BASE_URL}questionRoute/add`,inputData, axiosHeaders);
        return response;
    } catch (error) {
        return console.log(error.response.data);
    }
}

export const problemCommentListAPI = async (dbName,userId,questionId) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${userId}`,
        },
    };
// return console.log(`${config.BASE_URL}questionRoute/listComment/1/0/2?search_key=&comment_type=2&comment_qid=${questionId}&farming_type=crop`, axiosHeaders);
    try {
        
        let response = await axios.get(`${config.BASE_URL}questionRoute/listComment/1/0/2?search_key=&comment_type=2&comment_qid=${questionId}&farming_type=crop`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in problemCommentListAPI " + error.response);
    }
}

export const problemCommentSaveAPI = async (dbName,languageId,userId,inputData) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId},${userId}`,
            'Content-Type': 'multipart/form-data',
        },
    };
// return console.log(`${config.BASE_URL}questionRoute/addComment`,inputData, axiosHeaders);
    try {
        let response = await axios.post(`${config.BASE_URL}questionRoute/addComment`,inputData, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in problemCommentSaveAPI " + error);
    }
}

export const problemAnswerListAPI = async (dbName,languageId,token,problem_id) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId}`,
            'authorization': `${token}`,
        },
    };
//  console.log(`${config.BASE_URL}solutionRoute/viewQuestionSolution/${problem_id}`, axiosHeaders);
    try {
        let response = await axios.get(`${config.BASE_URL}solutionRoute/viewQuestionSolution/${problem_id}`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in problemAnswerListAPI " + error);
    }
}


// profile---------------------------------------------------------------------------------------
export const districtDataListAPI1 = async (dbName, language, state) => {
    const headers = headersWithCompanyDBlanID(dbName, language);
    let district_res = await axios.get(config.districtAPI + state, { headers });
    return district_res;
}

export const blockDataListAPI1 = async (dbName, language, district) => {
    const headers = headersWithCompanyDBlanID(dbName, language);
    let block_res = await axios.get(config.blockAPI + district, { headers });
    return block_res;
}


// user Details
export const userDetailAPI = async (dbName, languageId, token, user_id) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageId}`,
        },
    };
    try {
        let response = await axios.get(config.BASE_URL + 'loginSignupRoute/details/'+ user_id , axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error with user api" + error.response);
    }

}

export const updateUserInfoAPI = async (dbName, language, userId, token, formData) => {
    console.log(language);
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${language},${userId}`,
        },
    };
    try {
        let response = await axios.put(`${config.BASE_URL}loginSignupRoute/update/${userId}`, formData, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in updateUserInfoAPI api" + error.response);
    }

}


export const stateListAPI = async (dbName, languageId, token) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageId}`,
        },
    };
    let res = await axios.get(config.BASE_URL + "locationRoute/stateList/1/0/1?search_key=&country_id=1",  axiosHeaders);
    return res;
    // return headers;
}

//input type
export const inputListAPI = async (dbName, languageId,token,userId) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId},${userId}`,
            'authorization': `${token}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}marketRoute/listproduct/1/0/2?search_key=&category_id=`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in inputListAPI " + error);
    }
}

export const inputCategoryAPI = async (dbName, languageId,token,userId) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId},${userId}`,
            'authorization': `${token}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}inputOutputEntityRoute/listEntityTypes/1/0/2`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in inputCategoryAPI " + error);
    }
}

export const inputSubCategoryAPI = async (dbName, languageId,token,userId,category_id) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId},${userId}`,
            'authorization': `${token}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}marketRoute/listproduct/1/0/2?search_key=&category_id=${category_id}`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in inputCategoryAPI " + error);
    }
}


export const inputPastEnquiryListAPI = async (dbName, languageId,token,userId) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId}`,
            'authorization': `${token}`,
        },
    };
 
    try {
        let response = await axios.get(`${config.BASE_URL}inputOutputRoute/list/1/0/2?farmer_id=&transaction_type=1&entity_type_id=&from_date=&to_date=&farmer_mobile=&agent_id=${userId}`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in inputPastEnquiryListAPI " + error);
    }
}


export const inputEnquiryViewAPI = async (dbName, languageId,token,userId,farmer_id) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId},${userId}`,
            'authorization': `${token}`,
        },
    };
       console.log(`${config.BASE_URL}iinputOutputRoute/stofdetails/${farmer_id}`, axiosHeaders);
    try {
        let response = await axios.get(`${config.BASE_URL}inputOutputRoute/stofdetails/${farmer_id}`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in inputListAPI " + error);
    }
}

export const inputSaveAPI = async (dbName, languageId,token,farmerId,inputData) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId},${farmerId}`,
            'authorization': `${token}`,
            'Content-Type': 'multipart/form-data',
        },
    };
 console.log(`${config.BASE_URL}questionRoute/add`,inputData, axiosHeaders);
    try {
        let response = await axios.post(`${config.BASE_URL}inputOutputRoute/add`,inputData, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("outputSaveAPI:",error.response.data);
    }
}


//Output =================================================================================================
export const outputListAPI = async (dbName, languageId,token,userId,farmer_id="",fromDate="",toDate="",mobileNo="") => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId},${userId}`,
            'authorization': `${token}`,
        },
    };
    // console.log(`${config.BASE_URL}inputOutputRoute/list/1/0/2?&
    // farmer_id=${farmer_id}&transaction_type=2&from_date=${fromDate}&to_date=${toDate}&agent_id=${userId}&farmer_mobile=${mobileNo}`, axiosHeaders);
    try {
        let response = await axios.get(`${config.BASE_URL}inputOutputRoute/list/1/0/2?&
        farmer_id=${farmer_id}&transaction_type=2&from_date=${fromDate}&to_date=${toDate}&agent_id=${userId}&farmer_mobile=${mobileNo}`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in outputListAPI " + error);
    }
}

export const livelihoodNameVarietyLandrelAPI = async (dbName, languageId,userId,relId) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId}`,
        },
    };
    // console.log(`${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${userId}&land_rel_id=${relId}`, axiosHeaders);
    try {
        let response = await axios.get(`${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${userId}&land_rel_id=${relId}`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("livelihoodNameVarietyLandrelAPI :" + JSON.stringify(error.response.data,null,2));
    }
}

export const unitByListAPI = async (dbName, languageId) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}unitRoute/list/1/0/5?unit_type=product_unit&search_key=`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in unitByListAPI " + error);
    }
}

export const outputSaveAPI = async (dbName, languageId,token,userId,inputData) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId},${userId}`,
            'authorization': `${token}`,
            'Content-Type': 'multipart/form-data',
        },
    };
// return console.log(`${config.BASE_URL}questionRoute/add`,inputData, axiosHeaders);
    try {
        let response = await axios.post(`${config.BASE_URL}inputOutputRoute/add`,inputData, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("outputSaveAPI:",error.response.data);
    }
}



// loan========================================================================

export const loanPurposeAPI = async (dbName, languageId, token) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageId}`,
        },
    };

    try {
        let response = await axios.get(config.BASE_URL + "loanEntityRoute/list/1/0/1?entity_type=loan_purpose", axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in updateUserInfoAPI api" + error.response.data);
    }
}


export const loanRouteListAPI = async (dbName,
    languageId,
    token, userID, from_date, to_date, farmer_mobile) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageId}`,
        },
    };

    try {
        let response = await axios.get(config.BASE_URL + `loanRoute/list/1/0/2?&user_id=&farming_type=crop&from_date=${from_date}&to_date=${to_date}&agent_id=${userID}&farmer_mobile=${farmer_mobile}`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in updateUserInfoAPI api" + error.response.data);
    }
}

export const loanRouteFarmerListAPI = async (dbName, languageId, token, user_id) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageId},${user_id}`,
        },
    };
    try {
        let response = await axios.get(config.BASE_URL + 'agentRoute/listFarmer/1/0/2?search_key=', axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error in updateUserInfoAPI api" + error.response.data);
    }
}


// loan==========================================================================
export const usefulInfoListAPI = async (dbName, languageId, userId, state_id, district_id, subdiv_id, userType, post) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId}`,
        },
    };
    try {
    
        let response = await axios.get(`${config.BASE_URL}generalInfoRoute/list/1/0/2?user_id=${userId}&search_key=&role_type=${userType}&post_type=${post}&state_id=${state_id}&district_id=${district_id}&subdiv_id=${subdiv_id}&crop_name_id=`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error with user api" + error.response);
    }

}

export const noticeDetailsAPI = async (dbName, languageId, token, noticeId) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageId}`,
        },
    };
    try {

        let response = await axios.get(`${config.BASE_URL}generalInfoRoute/details/${noticeId}`, axiosHeaders);
        return response;
    } catch (error) {
        return console.log("error with user api" + error.response);
    }

}

export const trainingListAPI = async (dbName, languageId, userId, state_id, district_id, subdiv_id, userType, post) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageId}`,
        },
    };
    try {

        let response = await axios.get(`${config.BASE_URL}generalInfoRoute/list/1/0/2?user_id=${userId}&search_key=&role_type=${userType}&post_type=${post}&state_id=${state_id}&district_id=${district_id}&subdiv_id=${subdiv_id}&crop_name_id=`, axiosHeaders);
        // generalInfoRoute / list / 1 / 0 / 2 ? user_id = c8e666ba - 5046 - 48ba - 8561 - 27c3c22be0cc & search_key=& role_type=supervisor & post_type=training & state_id=5 & district_id=11 & subdiv_id=21 & crop_name_id=
        return response;
    } catch (error) {
        return console.log("error with user api" + error.response);
    }

}