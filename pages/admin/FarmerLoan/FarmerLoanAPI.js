import config from "../../../config";
import axios from 'axios';
import { CrashlyticsRecordError } from "../../Crashlytics/CrashlyticsRecordError";
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
        CrashlyticsRecordError(error.response)
        return console.log("error in plotAgainstFarmerAPI " + error.response);
    }
}
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
        CrashlyticsRecordError(error.response)
        return console.log("error in updateUserInfoAPI api" + error.response);
    }
}


export const Addloan = async (dbName, languageId, token, user_id, inputValue) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${languageId},${user_id}`,
            'Content-Type': 'multipart/form-data'
        },
    };
    try {
        let response = await axios.post(config.BASE_URL + 'loanRoute/add', inputValue, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response)
        // return console.log("error in updateUserInfoAPI api" + error.response);
        return error.response;
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
        let response = await axios.get(config.BASE_URL + `loanRoute/list/1/0/2?&user_id=${userID}&farming_type=crop&from_date=${from_date}&to_date=${to_date}`, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response)
        return error.response;
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
        CrashlyticsRecordError(error.response)
        return error.response;
    }
}
export const problemProduceAgainstPlotAPI = async (dbName, languageID, farmerID, relID) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${languageID}`,
        },
    };
    try {
        let response = await axios.get(`${config.BASE_URL}cropRoute/listUserCrop/1/0/1?user_id=${farmerID}&land_rel_id=${relID}`, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response)
        return error.response;
    }
}
export const LoanUpdate = async (dbName, language, token, userId, formData, loanId) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${language},${userId}`,
            'Content-Type': 'multipart/form-data'
        },
    };
    try {
        let response = await axios.put(`${config.BASE_URL}loanRoute/update/${loanId}`, formData, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response);
        return error.response;
    }
}