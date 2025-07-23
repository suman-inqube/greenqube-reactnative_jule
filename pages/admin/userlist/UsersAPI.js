import axios from 'axios';
import config from '../../../config';
import { CrashlyticsRecordError } from '../../Crashlytics/CrashlyticsRecordError';
const timeoutConfig = {timeout: 5000};
const headersWithCompanyDBlanID = (dbName, languageId) => {
    return {
        'information': `${dbName},${languageId}`,
        'Accept': 'application/json'
    };
};
export const userDataListAPI = async (dbName, languageId, token, user_id, page, phoneNumber) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageId},${user_id}`,
        },
    };
    console.log(config.BASE_URL +
            `agentRoute/listFarmer/1/${page}/2?search_key=${phoneNumber}`)
            console.log(axiosHeaders)
    try {

        let response = await axios.get(
          config.BASE_URL +
            `agentRoute/listFarmer/1/${page}/2?search_key=${phoneNumber}`,
          {...axiosHeaders, ...timeoutConfig},
        );
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response, 'UserList', 'userDataListAPI');
        return error.response;
    }

}

export const fetchBlockAPI = async (dbName, languageID, districtID) => {
    try {
        const headers = headersWithCompanyDBlanID(dbName, languageID);
        let block_res = await axios.get(config.blockAPI + districtID, { headers });
        return block_res;
    } catch (error) {
        CrashlyticsRecordError(error.response);
        return console.log("error with Block api" + error.response);
    }
}

export const fetchDistrictAPI = async (dbName, languageID, stateID) => {
    try {
        const headers = headersWithCompanyDBlanID(dbName, languageID);
        let district_res = await axios.get(config.districtAPI + stateID, { headers });
        return district_res;
    } catch (error) {
        CrashlyticsRecordError(error.response);
        return console.log("error with district api" + error.response);
    }
}

export const fetchStateAPI = async (dbName, languageID) => {
    const headers = headersWithCompanyDBlanID(dbName, languageID);
    try {
        let state_res = await axios.get(config.stateAPI, { headers });
        return state_res

    } catch (error) {
        CrashlyticsRecordError(error.response);
        return error.response;
    }
}

export const UserInformationUpdate = async (dbName, language, userId, token, farmerId, formData) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${language},${userId}`,
            'Content-Type': 'multipart/form-data'
        },
    };
    try {
        let response = await axios.put(`${config.BASE_URL}loginSignupRoute/update/${farmerId}`, formData, axiosHeaders);
        return response;
    } catch (error) {
        // console.log(error)
         CrashlyticsRecordError(error.response);
        return error;
    }

}
export const farmerProfileInformation = async (dbName, languageId, token, farmerID) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageId}`,
        },
    };
    try {
        const response = await axios.get(`${config.BASE_URL}loginSignupRoute/details/${farmerID}`, axiosHeaders);
       
        console.log(
          `${config.BASE_URL}loginSignupRoute/details/${farmerID}`,
          axiosHeaders,
        );
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response);
        return console.log("farmerProfileInformation : " + error.response.data);
    }
}
export const UserProfileUpdate = async (dbName, language, userId, token, formData) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${language},${userId}`,
            'Content-Type': 'multipart/form-data'
        },
    };
    try {
        let response = await axios.put(`${config.BASE_URL}loginSignupRoute/update/${userId}`, formData, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response);
        return error.response;
    }

}

export const firstLanguageListAPI = async (dbName) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName}`,
        },
    }
    try {
        let response = axios.get(config.BASE_URL + "locationRoute/getLang?status=1&search", axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response);
        return console.log("firstLanguageListAPI" + error.response.data);
    }

}
export const UserPasswordUpdate = async (dbName, language, userId, token, formData) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${language},${userId}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    };
    try {
        let response = await axios.post(`${config.BASE_URL}loginSignupRoute/newChangePassword`, formData, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response);
        console.log(error.response);
        return error.response;
    }

}